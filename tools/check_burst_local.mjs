import { readFile } from "node:fs/promises";

const cache = new Map();
globalThis.localStorage = {
  getItem: (key) => cache.get(key) ?? null,
  setItem: (key, value) => cache.set(key, String(value)),
};

globalThis.fetch = async (url) => {
  const path = String(url).endsWith("byteblitz_archetypes.md")
    ? new URL("../public/data/byteblitz_archetypes.md", import.meta.url)
    : new URL("../public/data/byteblitz_question_templates.md", import.meta.url);
  return new Response(await readFile(path, "utf8"), { status: 200 });
};

const { generateBurstQuestion } = await import("../public/js/js/burst-generator.js");
const { TIER_COLORS } = await import("../public/js/js/glicko.js");
const expected = {
  Bronze: new Set(["sign", "count_even", "sum_positive", "reverse", "max_index", "filter_even", "run_count", "alternating_sum", "clamp", "rotate", "first_above"]),
  Silver: new Set(["pair_sum_count", "balanced_binary", "window_distinct", "subarray_sum_count"]),
  Gold: new Set(["interval_rooms", "grid_islands", "lis_length"]),
  Platinum: new Set(["grid_shortest_path", "knapsack_value"]),
  Diamond: new Set(["weighted_shortest_path", "edit_distance"]),
  Master: new Set(["tree_diameter", "coin_change_min"]),
};

for (const [index, difficulty] of Object.keys(expected).entries()) {
  const problem = await generateBurstQuestion({ difficulty, seed: 1000 + index, existingProblems: [] });
  if (problem.difficulty !== difficulty) throw new Error(`${difficulty}: wrong difficulty ${problem.difficulty}`);
  if (!expected[difficulty].has(problem.operation)) throw new Error(`${difficulty}: invalid operation ${problem.operation}`);
  if (problem.color !== TIER_COLORS[difficulty]) throw new Error(`${difficulty}: wrong color ${problem.color}`);
  if (problem.testCases.length !== 8 || problem.testCases.some((test) => !test.input || test.expected === undefined)) throw new Error(`${difficulty}: invalid tests`);
  if (problem.sampleInput !== problem.testCases[0].input || problem.sampleOutput !== problem.testCases[0].expected) throw new Error(`${difficulty}: sample mismatch`);
  console.log(`${difficulty}: ${problem.operation} ✓`);
}

console.log("Rank-gated deterministic Burst checks passed.");
