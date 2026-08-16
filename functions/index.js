const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();
const geminiApiKey = defineSecret("GEMINI_API_KEY");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value, limit = 24000) {
  return String(value ?? "").trim().slice(0, limit);
}

function parseJson(content) {
  const text = clean(content).replace(/^```json\s*/i, "").replace(/```\s*$/g, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

exports.sharePreview = onRequest(async (req, res) => {
  const id = String(req.path || "").replace(/^\/+/, "").split("/").pop();
  if (!id) return res.redirect(302, "/");

  let share = null;
  try {
    const snap = await db.doc(`sharedSolutions/${id}`).get();
    if (snap.exists) share = snap.data();
  } catch (error) {
    console.error("share preview lookup failed", error);
  }

  if (!share) return res.redirect(302, "/#/training");

  const owner = share.ownerUsername || "A ByteBlitz player";
  const title = share.title || "a coding problem";
  const pageTitle = `View ${owner}'s solution to ${title} | ByteBlitz`;
  const description = `View ${owner}'s submitted solution to the ${title} coding problem on ByteBlitz.`;
  const destination = `/#/share/${encodeURIComponent(id)}`;
  const canonical = `${req.protocol}://${req.get("host")}/share/${encodeURIComponent(id)}`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}">
</head>
<body><p>Loading ${escapeHtml(pageTitle)}…</p><script>location.replace(${JSON.stringify(destination)});</script></body>
</html>`;
  res.status(200).set("Cache-Control", "public, max-age=300").send(html);
});

/**
 * Fast C4 problem authoring runs server-side. The browser only sends one chosen
 * archetype, one template, and recent titles, so it never downloads or boots the
 * heavyweight WebLLM code-analysis model while a match is waiting to start.
 */
exports.generateBurstQuestion = onCall({
  region: "us-central1",
  timeoutSeconds: 30,
  memory: "256MiB",
  secrets: [geminiApiKey],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in to create an AI-generated Burst question.");
  }
  const key = geminiApiKey.value();
  if (!key) {
    throw new HttpsError("failed-precondition", "AI question generation is not configured. Add the GEMINI_API_KEY Firebase secret first.");
  }

  const data = request.data || {};
  const difficulty = clean(data.difficulty, 24);
  const template = clean(data.template, 5000);
  const archetype = data.archetype && typeof data.archetype === "object" ? data.archetype : null;
  const existingTitles = Array.isArray(data.existingTitles)
    ? data.existingTitles.map((title) => clean(title, 160)).filter(Boolean).slice(-80)
    : [];
  if (!difficulty || !template || !archetype?.id || !archetype?.rank) {
    throw new HttpsError("invalid-argument", "A difficulty, selected archetype, and template are required.");
  }
  if (archetype.rank !== difficulty) {
    throw new HttpsError("invalid-argument", "The selected archetype does not match the requested difficulty.");
  }

  const prompt = `Generate one original, self-contained ${difficulty} competitive-programming problem for a five-minute ByteBlitz Burst. Return JSON only. The problem must be automatically judgeable with exactly eight deterministic tests. Do not copy an existing title or problem. Use only the allowed techniques and never require a forbidden technique.\n\nReturn exactly these fields: title, category, difficulty, archetypeId, definition, description, inputFormat, outputFormat, constraints (array), sampleInput, sampleOutput, testCases (exactly 8 objects with input and expected), timeLimitSeconds (300), allowedTechniques (array), forbiddenTechniques (array), explanation, uniqueSignature.\n\nSelected archetype:\n${JSON.stringify(archetype)}\n\nSelected template:\n${template}\n\nExisting titles to avoid:\n${existingTitles.join("\n")}`;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a precise competitive-programming problem author. Return valid JSON only; do not use Markdown fences." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 2800, responseMimeType: "application/json" },
      }),
    });
  } catch (error) {
    console.error("Burst generation request failed", error);
    throw new HttpsError("unavailable", "The AI generation service could not be reached. Please try again.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Burst generation service error", response.status, body?.error?.message || body);
    throw new HttpsError("unavailable", body?.error?.message || "The AI generation service rejected this request.");
  }
  const content = body?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const problem = parseJson(content);
  if (!problem) {
    throw new HttpsError("internal", "The AI generation service returned an invalid problem format. Please try again.");
  }
  return { problem };
});
