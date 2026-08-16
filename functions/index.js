const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
