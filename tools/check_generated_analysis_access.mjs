const session = new Map();
globalThis.sessionStorage = {
  getItem: (key) => session.get(key) ?? null,
  setItem: (key, value) => session.set(key, String(value)),
};

const { cacheAnalysisAttempt, getCachedAnalysisAttempt } = await import("../public/js/js/analysis-attempt-cache.js");
const { fastCodeAnalysis } = await import("../public/js/js/analysis-engine.js");

const profile = { uid: "analysis-user", username: "Analyzer" };
const problem = {
  generated: true,
  id: "AI-silver-1",
  archetypeId: "AI-silver-1",
  title: "Count Exact-Sum Segments",
  difficulty: "Silver",
  category: "arrays",
  definition: "A contiguous subarray is an uninterrupted slice of a sequence.",
  description: "Count contiguous subarrays whose values sum exactly to T.",
  inputFormat: "The first line contains n and T. The second line contains n integers.",
  outputFormat: "Print the number of qualifying subarrays.",
  constraints: ["1 <= n <= 200,000", "Values may be negative."],
  explanation: "Use prefix totals and prior total frequencies.",
  testCases: [{ input: "1 0\n0", expected: "1" }],
};
const submission = { code: "n, t = map(int, input().split())\nprint(0)", language: "python", passed: 0 };

cacheAnalysisAttempt(profile, problem, submission, "unranked");
const cached = getCachedAnalysisAttempt(profile.uid, problem.archetypeId);
if (!cached?.problemSnapshot?.description || cached.analysisOnly !== true) throw new Error("Generated analysis snapshot was not retrievable.");
if (cached.problemSnapshot.testCases) throw new Error("Generated analysis snapshot must not retain judge tests.");

const baseline = fastCodeAnalysis({ code: submission.code, language: "python", problem: cached.problemSnapshot, submissions: [] });
if (baseline.reviewDecision?.letter === "S") throw new Error("Heuristic fallback must not award S tier.");
console.log("Generated analysis handoff and conservative fallback-grade checks passed.");
