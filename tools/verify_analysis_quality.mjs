import { fastCodeAnalysis, gradeForScore, metricRating, reviewDecision } from "../public/js/js/analysis-engine.js";

const code = [
  "n = int(input())",
  "nums = list(map(int, input().split()))",
  "output = ''",
  "for i in range(n - 1, -1, -1):",
  "    output += str(nums[i]) + ' '",
  "print(output[:-1])",
].join("\n");

const analysis = fastCodeAnalysis({ code, language: "python", problem: { title: "Reverse the Line", description: "Reverse a list." } });
const lists = [analysis.strengths, analysis.weaknesses, analysis.suggestions];
if (!lists.every((items) => Array.isArray(items) && items.length >= 2 && items.every((item) => item.length >= 38))) {
  throw new Error("Fallback review did not produce detailed, substantive observations.");
}
if (!analysis.codeReferences.some((reference) => reference.includes("line"))) {
  throw new Error("Fallback review did not retain source-line references.");
}
const gradeCases = [[95, "S"], [86, "A"], [78, "B"], [66, "C"], [53, "D"], [20, "F"]];
if (!gradeCases.every(([score, letter]) => gradeForScore(score).letter === letter)) {
  throw new Error("Letter-grade thresholds are not stable.");
}
if (metricRating("Likely O(N)", "O(N) single-pass target").letter !== "S" || metricRating("Likely O(N²)", "O(N) single-pass target").letter !== "C") {
  throw new Error("Complexity metric grades are not stable.");
}
const complete = reviewDecision({ timeComplexity: "O(N)", bestTimeComplexity: "O(N) single-pass target", spaceComplexity: "O(1)", bestSpaceComplexity: "O(1) auxiliary-space target", actionableIssues: [], failureDiagnosis: "No detailed failed-test trace was recorded." });
const oneIssue = reviewDecision({ timeComplexity: "O(N)", bestTimeComplexity: "O(N) single-pass target", spaceComplexity: "O(1)", bestSpaceComplexity: "O(1) auxiliary-space target", actionableIssues: ["Replace repeated output construction with one final join so the data flow stays explicit."], failureDiagnosis: "No detailed failed-test trace was recorded." });
const failedDraft = reviewDecision({ timeComplexity: "O(N)", bestTimeComplexity: "O(N) single-pass target", spaceComplexity: "O(1)", bestSpaceComplexity: "O(1) auxiliary-space target", actionableIssues: [], localTestResults: [{ pass: false, error: "Wrong answer" }], failureDiagnosis: "No detailed failed-test trace was recorded." });
if (!complete.complete || complete.letter !== "S" || oneIssue.complete || oneIssue.letter !== "A" || !oneIssue.canImprove || failedDraft.letter !== "F" || failedDraft.complete || !failedDraft.failedLocalTest) {
  throw new Error("Unified review rubric does not keep S completion and actionable A-tier issues consistent.");
}
console.log("analysis quality, grades, metric ratings, and review rubric: PASS");
