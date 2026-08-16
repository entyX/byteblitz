import { fastCodeAnalysis, gradeForScore } from "../public/js/js/analysis-engine.js";

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
console.log("analysis quality fallback and grades: PASS");
