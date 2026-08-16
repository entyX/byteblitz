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

export function gradeForScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return { letter: "—", tier: "unknown", label: "Review pending", description: "Run the analysis to receive a code-quality grade." };
  if (score >= 92) return { letter: "S", tier: "s", label: "Exceptional foundation", description: "The solution is highly effective for the visible task and constraints. Further changes should be justified by a specific robustness or clarity gain." };
  if (score >= 82) return { letter: "A", tier: "a", label: "Strong solution", description: "The core approach is solid. Any refinement should be grounded in a concrete robustness, clarity, or edge-case finding rather than applied speculatively." };
  if (score >= 72) return { letter: "B", tier: "b", label: "Sound solution", description: "The solution appears workable. The review should continue to look for concrete clarity, robustness, or efficiency evidence before changing source code." };
  if (score >= 62) return { letter: "C", tier: "c", label: "Partially strong foundation", description: "The approach has useful pieces but needs focused improvements before it is consistently reliable." };
  if (score >= 50) return { letter: "D", tier: "d", label: "Needs substantial revision", description: "Important correctness, clarity, or efficiency issues should be addressed before relying on this approach." };
  return { letter: "F", tier: "f", label: "Needs a new approach", description: "The visible solution needs fundamental changes to meet the task reliably." };
}
const asText = (value) => Array.isArray(value) ? value.filter(Boolean).join("\n") : String(value || "");
const cleanList = (value, fallback, limit = 6) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, limit)
  : fallback;
const detailedList = (value, fallback, limit = 6) => {
  const items = cleanList(value, [], limit).filter((item) => item.length >= 38 && /\s/.test(item));
  return items.length >= 2 ? items : fallback;
};

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

function codeLineEntries(code) {
  return String(code || "").split("\n").map((text, index) => ({ number: index + 1, text: text.trim() })).filter((entry) => entry.text);
}

function lineReference(entry) {
  return entry ? `line ${entry.number}: \`${entry.text.slice(0, 110)}\`` : "the visible solution";
}

function fallbackInsights(code) {
  const lines = codeLineEntries(code);
  const input = lines.find((entry) => /\b(input|readline|scanf|cin)\b/i.test(entry.text));
  const loop = lines.find((entry) => /\b(for|while)\b/.test(entry.text));
  const output = lines.find((entry) => /\b(print|console\.log|cout|return)\b/i.test(entry.text));
  const concat = lines.find((entry) => /(?:\+=\s*str|\.append\(|push\(|concat\()/i.test(entry.text));
  const condition = lines.find((entry) => /\b(if|elif|else|switch|case)\b/.test(entry.text));
  const references = [input, loop, condition, concat, output].filter(Boolean).map(lineReference).filter((value, index, all) => all.indexOf(value) === index).slice(0, 5);
  const strengths = [
    input ? `${lineReference(input)} establishes the input shape before the algorithm begins, which makes the rest of the solution easier to follow.` : "The solution stays focused on one clear input-to-output path instead of introducing unnecessary helper state.",
    loop ? `${lineReference(loop)} expresses the main traversal directly, so the visible running-time cost is easy to reason about.` : "The visible code has a compact control flow, which keeps the core algorithm straightforward to inspect.",
  ];
  const weaknesses = concat && loop
    ? [`${lineReference(concat)} builds output during the main traversal. For very large output, repeated concatenation can obscure the intended cost; accumulating pieces and joining once is easier to justify.`, `The loop invariant around ${lineReference(loop)} is implicit. A brief comment or a named accumulator invariant would make boundary reasoning more transparent.`]
    : [`No concrete correctness flaw is visible in the saved source, but the invariant around ${lineReference(loop)} should be stated or tested against boundary input so future edits remain safe.`, condition ? `${lineReference(condition)} handles a branch, but the expected behavior for the opposite branch is not documented in the visible code.` : "The code would be easier to review with one short comment explaining why its main state is sufficient."];
  const suggestions = concat && loop
    ? [`Consider replacing repeated output construction at ${lineReference(concat)} with a collection of pieces followed by one join, if the problem permits the same output format.`, `Keep ${lineReference(loop)} as the single traversal, then add a short invariant comment explaining what the accumulator represents after each iteration.`]
    : [`No algorithmic rewrite is clearly required from the visible source. Preserve the current approach and add a focused boundary test around ${lineReference(loop)} before changing it.`, "If you request an improvement, prefer a readability or proof-oriented change over a speculative rewrite that could alter the required input/output behavior."];
  const approach = loop
    ? `The solution reads the input${input ? ` at ${lineReference(input)}` : ""}, processes it through ${lineReference(loop)}, and produces the required result${output ? ` at ${lineReference(output)}` : ""}.`
    : `The visible code maps the supplied input to an output directly${output ? ` through ${lineReference(output)}` : ""}.`;
  return { input, loop, output, concat, references, strengths, weaknesses, suggestions, approach };
}

export function fastCodeAnalysis(input) {
  const code = String(input.code || "");
  const lines = codeLineEntries(code);
  const hasNames = /\b(result|count|index|left|right|seen|total|answer|output|nums)\b/i.test(code);
  const hasComments = /(^|\s)(#|\/\/)/m.test(code);
  const hasRepeatedLoops = (code.match(/\b(for|while)\b/g) || []).length >= 2;
  const score = clamp(58 + (hasNames ? 9 : 0) + (hasComments ? 6 : 0) - (hasRepeatedLoops ? 9 : 0) - (lines.length > 120 ? 5 : 0), 35, 92);
  const submissions = Array.isArray(input.submissions) ? input.submissions : [];
  const progress = submissions.map((item, index) => ({
    submission: Number(item.submissionCount || index + 1),
    testsPassed: Number(item.passed || item.testsPassed || 0),
    note: item.failure ? "A recorded failing test is available for review." : (index === submissions.length - 1 ? "Final recorded submission." : "Earlier attempt retained for progression review."),
  }));
  const insight = fallbackInsights(code);
  const timeComplexity = guessComplexity(code);
  const spaceComplexity = guessSpace(code);
  return {
    efficiencyScore: score,
    timeComplexity,
    timeComplexityExplanation: `This estimate describes how runtime grows as input grows. ${insight.loop ? `${lineReference(insight.loop)} is the visible dominant traversal.` : "No dominant loop is visible in the saved source."} ${hasRepeatedLoops ? "Check whether the iteration constructs are nested or represent separate passes." : "No second traversal is visible in the saved source."}`,
    spaceComplexity,
    spaceComplexityExplanation: `${insight.concat ? `${lineReference(insight.concat)} may grow with the produced output, so its memory cost should be considered alongside the input.` : "This estimate counts working memory beyond the input and any required output."} Review collections or recursion only when they grow with the input size.`,
    codeQuality: hasNames ? "Readable structure with named state." : "Compact implementation with room for clearer state names.",
    codeQualityExplanation: `${insight.loop ? `${lineReference(insight.loop)} keeps the central control flow visible.` : "The central control flow is compact."} Code quality also depends on whether a reviewer can identify the invariant and boundary behavior without guessing.`,
    strengths: insight.strengths,
    weaknesses: insight.weaknesses,
    suggestions: insight.suggestions,
    approach: insight.approach,
    opponentComparison: input.opponentCode ? "Compare the opponent’s data flow and number of passes against the same constraints. Prefer the version with a simpler invariant or a proven lower cost, not merely different syntax." : "No opponent source was available for a direct comparison.",
    failureDiagnosis: submissionFailure(submissions),
    matchReview: input.matchContext?.lost ? "Review the first submission that stopped improving and compare its recorded assumptions with the problem constraints. The timeline below preserves the progression that led to the loss." : "Use the submission timeline to preserve changes that improved test coverage and identify any unnecessary detours.",
    submissionProgress: progress,
    codeReferences: insight.references,
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
    strengths: detailedList(value.strengths, fallback.strengths),
    weaknesses: detailedList(value.weaknesses, fallback.weaknesses),
    suggestions: detailedList(value.suggestions, fallback.suggestions),
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
  return `Review ${subjectLabel}. Read the complete problem statement, constraints, input/output formats, and samples before judging the code. Be precise, educational, and refer to concrete functions, variables, loops, conditions, or line-like code fragments. Never invent a hidden-test input. If a failed-test record is available, explain exactly which assumption or code path likely caused it, and distinguish evidence from uncertainty. Compare both submissions only when opponent code is present. Every strengths, weaknesses, and suggestions item must be a complete sentence of at least 12 words and must identify a specific code fragment, variable, loop, condition, or observable behavior. Never return one-word labels such as “Efficient”, “Readable”, or “None”. Score consistently: scores below 92 must include at least one concrete, safe improvement or verification step, and scores below 82 must include at least one actionable code or algorithm refinement. Only return no-change reasoning for a 92+ review where no safer or clearer rewrite is justified. When a local edit is supplied, compare it to the original submission and explicitly explain what changed, what improved, and what still needs verification. Return exactly 2–4 strengths, exactly 2–4 weaknesses, and exactly 2–4 suggestions. ` + `Return ONLY strict JSON with: efficiencyScore (0-100 integer), timeComplexity, timeComplexityExplanation, spaceComplexity, spaceComplexityExplanation, codeQuality, codeQualityExplanation, strengths (array), weaknesses (array), suggestions (array), approach, opponentComparison, failureDiagnosis, matchReview, codeReferences (array), submissionProgress (array of {submission, testsPassed, note}).\n\nPROBLEM\n${formatProblemBrief(input.problem)}\n\n${subjectLabel.toUpperCase()}\nLanguage: ${input.language || "code"}\n${codeText(input.code)}\n\nORIGINAL SUBMISSION BASELINE\n${codeText(input.originalCode, 12000) || "This is the original submission."}\n\nOTHER SUBMISSION FOR COMPARISON\n${codeText(input.opponentCode, 12000) || "Not available"}\n\nMATCH CONTEXT\n${JSON.stringify(input.matchContext || {})}\n\nSUBMISSION PROGRESSION\n${JSON.stringify(submissionTimeline)}`;
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
  const prompt = `Act as an educational competitive-programming coach. Improve the submitted ${language || "code"} solution only when a concrete improvement is justified by the problem and constraints. Preserve the required input/output interface and language. Return ONLY strict JSON with status, summary, and steps. status must be either "ready" or "no_change". When status is "ready", steps must be an array of {title, explanation, codeReference, code}; each step must contain a complete, runnable version of the code after one safe improvement, so the learner can apply it in sequence. When status is "no_change", steps must be [] and summary must explain specifically why the current code should remain unchanged or why the available problem details do not justify a rewrite. Do not return "no_change" when the current review efficiencyScore is below 92; in that case, prepare at least one safe clarity, robustness, edge-case, testing, or efficiency improvement that preserves the required input/output behavior. Every ready step must be materially different from CURRENT CODE after whitespace is ignored; never return the current solution merely reformatted, renamed, or described as improved. Never emit an empty or partial code field. Format code exactly as executable source: Python top-level statements must have no leading indentation and nested blocks must use exactly four spaces; JavaScript braces and nested blocks must align consistently. The explanation must teach the concept behind the change and clearly state when the original approach was already appropriate.\n\nPROBLEM\n${formatProblemBrief(problem)}\n\nCURRENT CODE\n${original}\n\nCURRENT REVIEW\n${JSON.stringify(analysis || {})}\n\nOTHER SUBMISSION (comparison only)\n${codeText(opponentCode, 8000) || "Not available"}`;
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
  })).filter((step) => step.code.trim() && step.code.trim() !== original.trim()) : [];
  const noChange = parsed?.status === "no_change" || !steps.length;
  if (noChange) {
    const score = Number(analysis?.efficiencyScore);
    const belowTopTier = Number.isFinite(score) && score < 92;
    const fallbackSummary = belowTopTier
      ? "No automatic rewrite was prepared because the review did not identify a source-level change that is safe enough to apply without guessing. The current grade still leaves room to verify edge cases, clarify the invariant, or inspect the supplied constraints more closely."
      : "No safe code rewrite is justified by the visible problem details and current solution. Keep this approach, then verify it with boundary-focused tests.";
    return { noChange: true, summary: belowTopTier ? fallbackSummary : String(parsed?.summary || fallbackSummary), steps: [], improvedCode: original };
  }
  return { noChange: false, summary: String(parsed.summary || "A guided improvement was prepared for this solution."), steps, improvedCode: steps[steps.length - 1].code };
}

export async function askCodeCoach({ question, analysis, code, originalCode = "", originalAnalysis = null, problem, history = [], opponentCode = "", subjectLabel = "your code" }, onProgress = () => {}) {
  const source = codeText(code, 14_000);
  if (!localModelStatus().available) return "Analysis cannot start in this browser, but you can still use the written review above.";
  const model = await loadLocalCodeModel(onProgress);
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are ByteBlitz Coach. Teach concepts clearly, reference specific supplied code, and stay within the problem constraints. Explain uncertainty instead of inventing test cases. Offer incremental improvements rather than dumping a replacement solution unless asked. Only include code when it is materially different from the selected code and directly answers the question; never present an unchanged copy of the selected source as an improvement. If no code edit is warranted, explain that in prose without a code block. When you include code, always use a fenced Markdown code block with triple backticks and the language label. Never leave code as ordinary paragraph text. Format executable code exactly: Python top-level statements must start at column zero and nested blocks use exactly four spaces; JavaScript braces and nested blocks must align consistently." },
      ...history.slice(-6).map((entry) => ({ role: entry.role === "assistant" ? "assistant" : "user", content: String(entry.content || "") })),
      { role: "user", content: `Problem:\n${formatProblemBrief(problem)}\n\nSelected subject: ${subjectLabel}\n\nReview:\n${JSON.stringify(analysis || {})}\n\nSelected code:\n${source}\n\nOriginal submitted baseline:\n${codeText(originalCode, 14_000) || source}\n\nOriginal analysis baseline:\n${JSON.stringify(originalAnalysis || {})}\n\nOther code for comparison:\n${codeText(opponentCode, 9000) || "Not available"}\n\nQuestion: ${question}` },
    ],
    temperature: 0.4,
    max_tokens: 1200,
  });
  return String(response.choices?.[0]?.message?.content || "I couldn't prepare a coaching response. Try again.").trim();
}
