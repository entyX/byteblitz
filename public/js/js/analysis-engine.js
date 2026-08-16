// ============================================================================
// C3 local code analysis — Qwen runs in the browser through WebLLM/WebGPU.
// The deterministic baseline keeps analysis useful while the model downloads or
// on devices that do not expose WebGPU.
// ============================================================================

const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.84";
const MODEL_ID = "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC";
const MAX_CODE_CHARS = 30_000;
let engine = null;
let enginePromise = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const cleanList = (value, fallback) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 5)
  : fallback;

function codeText(value, limit = MAX_CODE_CHARS) {
  const source = String(value || "").trim();
  return source.length > limit ? `${source.slice(0, limit)}\n// …truncated for local analysis` : source;
}

function guessComplexity(code) {
  const source = String(code || "");
  const loops = (source.match(/\b(for|while)\b/g) || []).length;
  const sorts = /\.sort\(|\bsorted\(|\.sort\s*\(/.test(source);
  const recursion = /function\s+(\w+)[\s\S]{0,400}\1\s*\(/.test(source);
  if (loops >= 3) return "Likely O(N³) or higher";
  if (loops >= 2) return "Likely O(N²)";
  if (sorts) return "Likely O(N log N)";
  if (recursion) return "Depends on recursion depth";
  if (loops === 1) return "Likely O(N)";
  return "Likely O(1) to O(N)";
}

function guessSpace(code) {
  const source = String(code || "");
  if (/\b(dict|set|map|unordered_map|vector|list|array)\b|\[\]|\{\}/i.test(source)) return "Likely O(N) auxiliary space";
  if (/\b(recurs|dfs|backtrack)\b/i.test(source)) return "May use O(N) call-stack space";
  return "Likely O(1) auxiliary space";
}

export function fastCodeAnalysis(input) {
  const code = String(input.code || "");
  const lines = code.split("\n").filter((line) => line.trim());
  const hasNames = /\b(result|count|index|left|right|seen|total|answer)\b/i.test(code);
  const hasComments = /(^|\s)(#|\/\/)/m.test(code);
  const hasRepeatedLoops = (code.match(/\b(for|while)\b/g) || []).length >= 2;
  const score = clamp(58 + (hasNames ? 9 : 0) + (hasComments ? 6 : 0) - (hasRepeatedLoops ? 9 : 0) - (lines.length > 120 ? 5 : 0), 35, 92);
  const submissions = Array.isArray(input.submissions) ? input.submissions : [];
  const progress = submissions.map((item, index) => ({
    submission: Number(item.submissionCount || index + 1),
    testsPassed: Number(item.passed || item.testsPassed || 0),
    note: index === submissions.length - 1 ? "Final recorded submission." : "Earlier attempt retained for progression review.",
  }));
  return {
    efficiencyScore: score,
    timeComplexity: guessComplexity(code),
    spaceComplexity: guessSpace(code),
    codeQuality: hasNames ? "Readable structure with mostly meaningful identifiers." : "Works toward a compact solution, but clearer names would improve maintainability.",
    strengths: [
      hasNames ? "Uses recognizable state and result variables." : "Keeps the implementation focused on the core task.",
      hasComments ? "Includes comments that help explain intent." : "Keeps the solution relatively concise.",
    ],
    weaknesses: hasRepeatedLoops ? ["Multiple iterations may create avoidable repeated work."] : ["Add brief comments around the key invariant or decision point."],
    suggestions: hasRepeatedLoops
      ? ["Check whether the repeated passes can be merged into one traversal.", "Use a lookup structure when it replaces repeated searching."]
      : ["State the loop invariant in a comment and test boundary inputs explicitly.", "Keep a small set of adversarial examples for this pattern."],
    approach: "The current approach builds a direct solution from the problem input and validates it through the available tests.",
    opponentComparison: input.opponentCode ? "Compare the opponent’s data flow and number of passes; their advantage may come from fewer traversals or a simpler invariant." : "No opponent source was available for a direct comparison.",
    matchReview: input.matchContext?.lost ? "The loss was decided by solve speed or test progress. Review the submission timeline below to identify the first incorrect assumption and the last change before progress improved." : "Use the submission timeline to preserve the changes that improved test coverage.",
    submissionProgress: progress,
    provider: "baseline",
  };
}

function normalizeAnalysis(value, fallback) {
  if (!value || typeof value !== "object") return fallback;
  const number = Number(value.efficiencyScore);
  return {
    efficiencyScore: Number.isFinite(number) ? clamp(Math.round(number), 0, 100) : fallback.efficiencyScore,
    timeComplexity: String(value.timeComplexity || fallback.timeComplexity),
    spaceComplexity: String(value.spaceComplexity || fallback.spaceComplexity),
    codeQuality: String(value.codeQuality || fallback.codeQuality),
    strengths: cleanList(value.strengths, fallback.strengths),
    weaknesses: cleanList(value.weaknesses, fallback.weaknesses),
    suggestions: cleanList(value.suggestions, fallback.suggestions),
    approach: String(value.approach || fallback.approach),
    opponentComparison: String(value.opponentComparison || fallback.opponentComparison),
    matchReview: String(value.matchReview || fallback.matchReview),
    submissionProgress: Array.isArray(value.submissionProgress) && value.submissionProgress.length
      ? value.submissionProgress.slice(0, 50).map((entry, index) => ({
          submission: Number(entry.submission || index + 1),
          testsPassed: Number(entry.testsPassed || 0),
          note: String(entry.note || "Submission retained for review."),
        }))
      : fallback.submissionProgress,
    provider: "qwen-local",
  };
}

function parseModelJson(content) {
  const text = String(content || "").trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

export function localModelStatus() {
  if (!navigator.gpu) return { available: false, reason: "WebGPU is unavailable in this browser." };
  return { available: true, model: MODEL_ID, loaded: !!engine };
}

export async function loadLocalCodeModel(onProgress = () => {}) {
  if (engine) return engine;
  if (!navigator.gpu) throw new Error("WebGPU is unavailable. Use a Chromium-based browser with hardware acceleration enabled.");
  if (!enginePromise) {
    enginePromise = (async () => {
      onProgress({ text: "Loading local Qwen code model…", progress: 0 });
      const webllm = await import(WEBLLM_URL);
      engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (event) => onProgress(event || { text: "Loading model…" }),
      });
      onProgress({ text: "Local Qwen model is ready.", progress: 1 });
      return engine;
    })().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

export async function analyzeCode(input, onProgress = () => {}) {
  const fallback = fastCodeAnalysis(input);
  const code = codeText(input.code);
  if (!code) return { ...fallback, codeQuality: "No source code was saved for this submission.", provider: "baseline" };
  const model = await loadLocalCodeModel(onProgress);
  const allSubmissions = Array.isArray(input.submissions) ? input.submissions : [];
  const sourceWindowStart = Math.max(0, allSubmissions.length - 8);
  const submissionTimeline = allSubmissions.map((entry, index) => ({
    submission: Number(entry.submissionCount || index + 1),
    testsPassed: Number(entry.passed || entry.testsPassed || 0),
    runtimeMs: entry.runtimeMs ?? null,
    code: index >= sourceWindowStart ? codeText(entry.code, 2200) : "Earlier source retained privately; progress metrics included in this review.",
  }));
  const prompt = `Analyze this competitive-programming solution. Be accurate, specific, constructive, and never claim a complexity that code does not support. Return ONLY JSON with these keys: efficiencyScore (0-100 integer), timeComplexity, spaceComplexity, codeQuality, strengths (array), weaknesses (array), suggestions (array), approach, opponentComparison, matchReview, submissionProgress (array of {submission, testsPassed, note}).\n\nProblem: ${input.problem?.title || "Coding problem"}\nTask: ${String(input.problem?.description || "").slice(0, 5000)}\nLanguage: ${input.language || "code"}\nPlayer code:\n${code}\n\nOpponent code (optional):\n${codeText(input.opponentCode, 12000) || "Not available"}\n\nMatch context: ${JSON.stringify(input.matchContext || {})}\n\nSubmission timeline (every recorded attempt’s metrics are included; recent source snapshots are included for code-change diagnosis):\n${JSON.stringify(submissionTimeline)}`;
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are ByteBlitz Coach, a careful competitive-programming code reviewer. Return strict JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.25,
    max_tokens: 1700,
  });
  return normalizeAnalysis(parseModelJson(response.choices?.[0]?.message?.content), fallback);
}

export async function askCodeCoach({ question, analysis, code, problem, history = [] }, onProgress = () => {}) {
  const source = codeText(code, 12000);
  const local = localModelStatus();
  if (!local.available) {
    return "Local Qwen needs WebGPU in this browser. You can still use the analysis summary above; enable hardware acceleration in a Chromium-based browser to ask follow-up questions.";
  }
  const model = await loadLocalCodeModel(onProgress);
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are ByteBlitz Coach. Give practical, honest competitive-programming coaching. Explain reasoning but do not provide a full replacement solution unless directly asked. Keep answers focused." },
      ...history.slice(-6).map((entry) => ({ role: entry.role === "assistant" ? "assistant" : "user", content: String(entry.content || "") })),
      { role: "user", content: `Problem: ${problem?.title || "Coding problem"}\nAnalysis: ${JSON.stringify(analysis || {})}\nCode:\n${source}\n\nQuestion: ${question}` },
    ],
    temperature: 0.45,
    max_tokens: 700,
  });
  return String(response.choices?.[0]?.message?.content || "I couldn't generate a coaching response. Try again.").trim();
}
