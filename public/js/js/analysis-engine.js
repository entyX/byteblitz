// ============================================================================
// C3 code analysis engine — runs privately in the browser when available and
// retains a fast deterministic review as a reliable fallback.
// ============================================================================

const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.84";
const MODEL_ID = "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC";
const MAX_CODE_CHARS = 30_000;
let engine = null;
let enginePromise = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asText = (value) => Array.isArray(value) ? value.filter(Boolean).join("\n") : String(value || "");
const cleanList = (value, fallback, limit = 6) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, limit)
  : fallback;

function codeText(value, limit = MAX_CODE_CHARS) {
  const source = String(value || "").trim();
  return source.length > limit ? `${source.slice(0, limit)}\n// …truncated for analysis` : source;
}

function problemBrief(problem = {}) {
  return {
    title: String(problem.title || "Coding problem"),
    background: asText(problem.definition),
    task: asText(problem.description),
    constraints: asText(problem.constraints || problem.constraint || problem.limits),
    inputFormat: asText(problem.inputFormat),
    outputFormat: asText(problem.outputFormat),
    sampleInput: asText(problem.sampleInput),
    sampleOutput: asText(problem.sampleOutput),
  };
}

function formatProblemBrief(problem) {
  const data = problemBrief(problem);
  return [
    `Title: ${data.title}`,
    data.background && `Background:\n${data.background}`,
    data.task && `Task:\n${data.task}`,
    data.constraints && `Constraints:\n${data.constraints}`,
    data.inputFormat && `Input format:\n${data.inputFormat}`,
    data.outputFormat && `Output format:\n${data.outputFormat}`,
    data.sampleInput && `Sample input:\n${data.sampleInput}`,
    data.sampleOutput && `Sample output:\n${data.sampleOutput}`,
  ].filter(Boolean).join("\n\n").slice(0, 12_000);
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

function submissionFailure(submissions) {
  const list = Array.isArray(submissions) ? submissions : [];
  const failed = [...list].reverse().find((entry) => entry.failure || entry.error || entry.failedTest);
  if (!failed) return "No detailed failed-test trace was recorded for these submissions.";
  const failure = failed.failure || failed.failedTest || {};
  const detail = failure.detail || failure.error || failed.error || "A test did not pass.";
  return `Submission ${failed.submissionCount || ""} failed at ${failure.hidden ? "a hidden test" : `test ${failure.testIndex ?? ""}`}. Recorded detail: ${detail}`.trim();
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
    note: item.failure ? "A recorded failing test is available for review." : (index === submissions.length - 1 ? "Final recorded submission." : "Earlier attempt retained for progression review."),
  }));
  const timeComplexity = guessComplexity(code);
  const spaceComplexity = guessSpace(code);
  return {
    efficiencyScore: score,
    timeComplexity,
    timeComplexityExplanation: `This estimate describes how the running time is expected to grow as the input grows. The current code contains ${hasRepeatedLoops ? "multiple iteration constructs, so check whether nested or repeated passes are necessary" : "a limited number of iteration constructs"}.`,
    spaceComplexity,
    spaceComplexityExplanation: "This estimate covers additional working memory beyond the input itself. Review every collection or recursion path that grows with the input.",
    codeQuality: hasNames ? "Readable structure with mostly meaningful identifiers." : "A compact first draft that would benefit from clearer naming around the core state.",
    codeQualityExplanation: "Code quality considers clarity, maintainability, separation of responsibilities, and whether a future reader can verify the algorithm’s key invariant.",
    strengths: [
      hasNames ? "Uses recognizable state and result variables." : "Keeps the implementation focused on the core task.",
      hasComments ? "Includes comments that help explain intent." : "Keeps the solution relatively concise.",
    ],
    weaknesses: hasRepeatedLoops ? ["Multiple iterations may create avoidable repeated work."] : ["The key invariant and boundary behavior are not explicitly documented."],
    suggestions: hasRepeatedLoops
      ? ["Check whether the repeated passes can be merged into one traversal.", "Use a lookup structure when it replaces repeated searching."]
      : ["State the loop invariant in a comment and test boundary inputs explicitly.", "Keep a small set of adversarial examples for this pattern."],
    approach: "The current approach transforms the input into an answer directly and validates the implementation against the available tests.",
    opponentComparison: input.opponentCode ? "Compare the opponent’s data flow and number of passes. A better result may come from fewer traversals, a simpler invariant, or tighter handling of edge cases." : "No opponent source was available for a direct comparison.",
    failureDiagnosis: submissionFailure(submissions),
    matchReview: input.matchContext?.lost ? "Review the first submission that stopped improving and compare its assumptions with the problem constraints. The timeline below highlights the progression that led to the loss." : "Use the submission timeline to preserve the changes that improved test coverage and identify any unnecessary detours.",
    submissionProgress: progress,
    codeReferences: [],
    provider: "baseline",
  };
}

function normalizeAnalysis(value, fallback) {
  if (!value || typeof value !== "object") return fallback;
  const number = Number(value.efficiencyScore);
  return {
    efficiencyScore: Number.isFinite(number) ? clamp(Math.round(number), 0, 100) : fallback.efficiencyScore,
    timeComplexity: String(value.timeComplexity || fallback.timeComplexity),
    timeComplexityExplanation: String(value.timeComplexityExplanation || fallback.timeComplexityExplanation),
    spaceComplexity: String(value.spaceComplexity || fallback.spaceComplexity),
    spaceComplexityExplanation: String(value.spaceComplexityExplanation || fallback.spaceComplexityExplanation),
    codeQuality: String(value.codeQuality || fallback.codeQuality),
    codeQualityExplanation: String(value.codeQualityExplanation || fallback.codeQualityExplanation),
    strengths: cleanList(value.strengths, fallback.strengths),
    weaknesses: cleanList(value.weaknesses, fallback.weaknesses),
    suggestions: cleanList(value.suggestions, fallback.suggestions),
    approach: String(value.approach || fallback.approach),
    opponentComparison: String(value.opponentComparison || fallback.opponentComparison),
    failureDiagnosis: String(value.failureDiagnosis || fallback.failureDiagnosis),
    matchReview: String(value.matchReview || fallback.matchReview),
    codeReferences: cleanList(value.codeReferences, fallback.codeReferences, 8),
    submissionProgress: Array.isArray(value.submissionProgress) && value.submissionProgress.length
      ? value.submissionProgress.slice(0, 50).map((entry, index) => ({
          submission: Number(entry.submission || index + 1),
          testsPassed: Number(entry.testsPassed || 0),
          note: String(entry.note || "Submission retained for review."),
        }))
      : fallback.submissionProgress,
    provider: "local",
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
  if (!navigator.gpu) return { available: false, reason: "Analysis needs a compatible browser to start." };
  return { available: true, loaded: !!engine };
}

export async function loadLocalCodeModel(onProgress = () => {}) {
  if (engine) return engine;
  if (!navigator.gpu) throw new Error("Analysis needs a compatible browser to start.");
  if (!enginePromise) {
    enginePromise = (async () => {
      onProgress({ text: "Preparing analysis…", progress: 0 });
      const webllm = await import(WEBLLM_URL);
      engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (event) => onProgress({ text: event?.text || "Preparing analysis…", progress: event?.progress ?? 0 }),
      });
      onProgress({ text: "Analyzing your solution…", progress: 1 });
      return engine;
    })().catch((error) => { enginePromise = null; throw error; });
  }
  return enginePromise;
}

function analysisPrompt(input, subjectLabel) {
  const allSubmissions = Array.isArray(input.submissions) ? input.submissions : [];
  const sourceWindowStart = Math.max(0, allSubmissions.length - 8);
  const submissionTimeline = allSubmissions.map((entry, index) => ({
    submission: Number(entry.submissionCount || index + 1),
    testsPassed: Number(entry.passed || entry.testsPassed || 0),
    runtimeMs: entry.runtimeMs ?? null,
    failure: entry.failure || entry.failedTest || entry.error || null,
    code: index >= sourceWindowStart ? codeText(entry.code, 2200) : "Earlier source retained; metrics and any failure detail are included.",
  }));
  return `Review ${subjectLabel}. Read the complete problem statement, constraints, input/output formats, and samples before judging the code. Be precise, educational, and refer to concrete functions, variables, loops, conditions, or line-like code fragments. Never invent a hidden-test input. If a failed-test record is available, explain exactly which assumption or code path likely caused it, and distinguish evidence from uncertainty. Compare both submissions only when opponent code is present. Return ONLY strict JSON with: efficiencyScore (0-100 integer), timeComplexity, timeComplexityExplanation, spaceComplexity, spaceComplexityExplanation, codeQuality, codeQualityExplanation, strengths (array), weaknesses (array), suggestions (array), approach, opponentComparison, failureDiagnosis, matchReview, codeReferences (array), submissionProgress (array of {submission, testsPassed, note}).\n\nPROBLEM\n${formatProblemBrief(input.problem)}\n\n${subjectLabel.toUpperCase()}\nLanguage: ${input.language || "code"}\n${codeText(input.code)}\n\nOTHER SUBMISSION FOR COMPARISON\n${codeText(input.opponentCode, 12000) || "Not available"}\n\nMATCH CONTEXT\n${JSON.stringify(input.matchContext || {})}\n\nSUBMISSION PROGRESSION\n${JSON.stringify(submissionTimeline)}`;
}

export async function analyzeCode(input, onProgress = () => {}) {
  const fallback = fastCodeAnalysis(input);
  if (!codeText(input.code)) return { ...fallback, codeQuality: "No source code was saved for this submission.", provider: "baseline" };
  const model = await loadLocalCodeModel(onProgress);
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are ByteBlitz Coach, a rigorous competitive-programming reviewer. Keep every claim grounded in the supplied problem and code. Return strict JSON only." },
      { role: "user", content: analysisPrompt(input, input.subjectLabel || "the selected submission") },
    ],
    temperature: 0.2,
    max_tokens: 2600,
  });
  return normalizeAnalysis(parseModelJson(response.choices?.[0]?.message?.content), fallback);
}

export async function improveCode({ code, language, problem, analysis, opponentCode = "" }, onProgress = () => {}) {
  const original = codeText(code);
  if (!original) throw new Error("There is no saved code to improve.");
  const model = await loadLocalCodeModel(onProgress);
  const prompt = `Act as an educational competitive-programming coach. Improve the submitted ${language || "code"} solution only when a concrete improvement is justified by the problem and constraints. Preserve the required input/output interface and language. Return ONLY JSON with summary and steps (array of {title, explanation, codeReference, code}). Each step must contain a complete, runnable version of the code after that single improvement, so the learner can apply it in sequence. The explanation must teach the concept behind the change and clearly state when the original approach was already appropriate.\n\nPROBLEM\n${formatProblemBrief(problem)}\n\nCURRENT CODE\n${original}\n\nCURRENT REVIEW\n${JSON.stringify(analysis || {})}\n\nOTHER SUBMISSION (comparison only)\n${codeText(opponentCode, 8000) || "Not available"}`;
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "Return strict JSON only. Never change the language or invent unavailable APIs." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 2200,
  });
  const parsed = parseModelJson(response.choices?.[0]?.message?.content);
  const steps = Array.isArray(parsed?.steps) ? parsed.steps.slice(0, 5).map((step) => ({
    title: String(step.title || "Improvement"),
    explanation: String(step.explanation || "Review the updated code in the editor pane."),
    codeReference: String(step.codeReference || ""),
    code: String(step.code || "").slice(0, MAX_CODE_CHARS),
  })).filter((step) => step.code.trim()) : [];
  if (!steps.length) throw new Error("The improvement could not be prepared. Please try again.");
  return { summary: String(parsed.summary || "A guided improvement was prepared for this solution."), steps, improvedCode: steps[steps.length - 1].code };
}

export async function askCodeCoach({ question, analysis, code, problem, history = [], opponentCode = "", subjectLabel = "your code" }, onProgress = () => {}) {
  const source = codeText(code, 14_000);
  if (!localModelStatus().available) return "Analysis cannot start in this browser, but you can still use the written review above.";
  const model = await loadLocalCodeModel(onProgress);
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are ByteBlitz Coach. Teach concepts clearly, reference specific supplied code, and stay within the problem constraints. Explain uncertainty instead of inventing test cases. Offer incremental improvements rather than dumping a replacement solution unless asked." },
      ...history.slice(-6).map((entry) => ({ role: entry.role === "assistant" ? "assistant" : "user", content: String(entry.content || "") })),
      { role: "user", content: `Problem:\n${formatProblemBrief(problem)}\n\nSelected subject: ${subjectLabel}\n\nReview:\n${JSON.stringify(analysis || {})}\n\nSelected code:\n${source}\n\nOther code for comparison:\n${codeText(opponentCode, 9000) || "Not available"}\n\nQuestion: ${question}` },
    ],
    temperature: 0.4,
    max_tokens: 1200,
  });
  return String(response.choices?.[0]?.message?.content || "I couldn't prepare a coaching response. Try again.").trim();
}
