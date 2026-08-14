// Load the real front-end modules against the real CSVs and assert the shape
// the arena depends on.
//
//     node tools/check_frontend.mjs
//
// `fetch` and `localStorage` are stubbed just enough for problems.js to run
// outside a browser; everything else is the shipped code.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

globalThis.fetch = async (url) => {
  const file = path.join(ROOT, "public", url.replace(/^\//, ""));
  const body = await readFile(file, "utf8");
  return { ok: true, text: async () => body };
};
globalThis.localStorage = {
  store: new Map(),
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; },
  setItem(k, v) { this.store.set(k, v); },
};

const problems = await import("../public/js/js/problems.js");
const { TIER_NAMES, TIME_LIMITS, PAR_TIME } = await import("../public/js/js/glicko.js");

let failures = 0;
const check = (ok, msg) => {
  if (!ok) { failures++; console.log("  FAIL " + msg); }
};

console.log("time limits");
for (const tier of TIER_NAMES) {
  check(TIME_LIMITS[tier] === 300, `${tier} limit is ${TIME_LIMITS[tier]}, expected 300`);
  check(PAR_TIME[tier] < TIME_LIMITS[tier], `${tier} par ${PAR_TIME[tier]} is not inside the limit`);
}
console.log(`  every division: ${TIME_LIMITS.Bronze}s (${TIME_LIMITS.Bronze / 60} minutes)`);

let total = 0;
for (const tier of TIER_NAMES) {
  const pool = await problems.loadPool(tier);
  total += pool.length;

  let visible = 0, hidden = 0;
  for (const p of pool) {
    check(p.testCases.length === problems.TESTS_PER_PROBLEM,
      `${p.id} has ${p.testCases.length} tests`);
    check(p.title && p.description && p.inputFormat && p.definition,
      `${p.id} is missing a statement field`);
    check(p.constraints.length > 0, `${p.id} has no constraints`);
    check(p.difficulty === tier, `${p.id} says ${p.difficulty} inside ${tier}`);
    check(p.sampleInput === p.testCases[0].input.replace(/\n$/, "") ||
          p.sampleInput === p.testCases[0].input,
      `${p.id} sample input does not match test 1`);
    check(problems.outputMatches(p.sampleOutput, p.testCases[0].expected),
      `${p.id} sample output does not match test 1`);
    visible += p.testCases.filter((t) => !t.hidden).length;
    hidden += p.testCases.filter((t) => t.hidden).length;
  }

  const blankAnswers = pool.filter((p) => p.testCases.some((t) => t.expected === "")).length;
  const ids = new Set(pool.map((p) => p.id));
  check(ids.size === pool.length, `${tier} has duplicate ids`);
  console.log(`  ${tier.padEnd(9)} ${String(pool.length).padStart(4)} problems  `
    + `${visible / pool.length} visible + ${hidden / pool.length} hidden tests each`
    + (blankAnswers ? `  (${blankAnswers} answer with a blank line somewhere)` : ""));
}

// The two picker paths the arena actually uses.
const seeded = await problems.problemForSeed("Gold", 12345);
check(seeded && seeded.testCases.length === problems.TESTS_PER_PROBLEM,
  "problemForSeed returned nothing usable");
const byId = await problems.problemById("Master", seeded ? "M-001-1" : "");
check(byId && byId.title === "Missing and Duplicate Value", "problemById lookup failed");
const rand = await problems.randomProblem("Diamond");
check(rand && rand.difficulty === "Diamond", "randomProblem returned the wrong tier");

console.log(`\n${total} problems loaded, ${total * problems.TESTS_PER_PROBLEM} test cases`);
console.log(failures ? `${failures} FAILURES` : "all checks passed");
process.exit(failures ? 1 : 0);
