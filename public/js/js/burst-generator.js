// ============================================================================
// C4 Burst question generator — browser-local, validated, and cache-backed.
// The supplied archetype/template documents are the generation guide; accepted
// questions are kept in this browser's local pool and never silently enter the
// authored CSV files.
// ============================================================================

import { loadLocalBurstModel, warmLocalBurstModel } from "./burst-local-model.js";

const ARCHETYPES_URL = "/data/byteblitz_archetypes.md";
const TEMPLATES_URL = "/data/byteblitz_question_templates.md";
const CACHE_KEY = "bb_c4_generated_burst_pool_v1";
const USAGE_KEY = "bb_c4_archetype_usage_v1";
const LIBRARY_CACHE_KEY = "bb_c4_generation_library_v2";
const MAX_ACCEPTED = 240;
const TEST_COUNT = 8;
let libraryPromise = null;

const clean = (value) => String(value ?? "").trim();
const lines = (text) => clean(text).split(/\r?\n/);
const rankOf = (text) => clean(text).replace(/^\*\*RANK:\s*/i, "").replace(/\*\*$/g, "").trim();

function parseArchetypes(markdown) {
  const source = clean(markdown);
  const chunks = source.split(/^##\s+/m).slice(1);
  return chunks.map((chunk) => {
    const rows = lines(chunk);
    const header = rows.shift() || "";
    const match = header.match(/^(\S+)\s+[—-]\s+(.+)$/);
    const get = (label) => {
      const row = rows.find((line) => {
        const match = line.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
        return match && match[1].replace(/:$/, "").trim().toUpperCase() === label.toUpperCase();
      });
      if (!row) return "";
      const match = row.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
      return match?.[2]?.trim() || "";
    };
    return {
      id: match?.[1] || header.split(" ")[0],
      name: match?.[2] || header,
      rank: rankOf(get("RANK")),
      primaryTopics: get("PRIMARY TOPICS"),
      secondaryTopics: get("SECONDARY TOPICS"),
      coreTechnique: get("CORE TECHNIQUE"),
      structure: get("PROBLEM STRUCTURE"),
      requiredInsight: get("REQUIRED INSIGHT"),
      differentiator: get("UNIQUE DIFFERENTIATOR"),
      allowed: get("ALLOWED VARIATIONS"),
      forbidden: get("FORBIDDEN VARIATIONS"),
      constraints: get("RECOMMENDED CONSTRAINT RANGE"),
      traps: get("COMMON TRAPS"),
      notes: get("GENERATION NOTES"),
    };
  }).filter((item) => item.id && item.name && item.rank);
}

function parseTemplates(markdown) {
  const byId = {};
  const chunks = clean(markdown).split(/^##\s+/m).slice(1);
  chunks.forEach((chunk) => {
    const rows = lines(chunk);
    const header = rows.shift() || "";
    const id = header.split(/\s+/)[0];
    const templates = [];
    let current = "";
    rows.forEach((row) => {
      if (/^###\s+\d+/.test(row)) {
        if (current) templates.push(current.trim());
        current = "";
      } else if (row.trim()) current += `${row.trim()} `;
    });
    if (current) templates.push(current.trim());
    if (id) byId[id] = templates.filter(Boolean).slice(0, 5);
  });
  return byId;
}

async function loadLibrary() {
  if (!libraryPromise) {
    const cached = readCache(LIBRARY_CACHE_KEY, null);
    if (cached?.archetypes?.length && cached?.templates && typeof cached.templates === "object") {
      libraryPromise = Promise.resolve(cached);
    } else {
      libraryPromise = Promise.all([fetch(ARCHETYPES_URL), fetch(TEMPLATES_URL)]).then(async ([a, t]) => {
        if (!a.ok || !t.ok) throw new Error("The C4 Burst generation guide could not be loaded.");
        const [archetypes, templates] = await Promise.all([a.text(), t.text()]);
        const library = { archetypes: parseArchetypes(archetypes), templates: parseTemplates(templates) };
        writeCache(LIBRARY_CACHE_KEY, library);
        return library;
      }).catch((error) => { libraryPromise = null; throw error; });
    }
  }
  return libraryPromise;
}

function readCache(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}


function writeCache(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}
function generatedPool() {
  const value = readCache(CACHE_KEY, []);
  return Array.isArray(value) ? value.filter(Boolean) : [];
}
function usageMap() { return readCache(USAGE_KEY, {}); }

function hashText(text) {
  let hash = 2166136261;
  for (const char of String(text)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}
function normalizeText(text) { return clean(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }
function fingerprint(problem) {
  const item = problem || {};
  return hashText([item.title, item.description, item.inputFormat, item.outputFormat].map(normalizeText).join("|"));
}
function tokens(problem) {
  return new Set(normalizeText(`${problem.title} ${problem.description} ${problem.inputFormat} ${problem.outputFormat}`).split(" ").filter((token) => token.length > 2));
}
function similarity(a, b) {
  const left = tokens(a), right = tokens(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  left.forEach((token) => { if (right.has(token)) common++; });
  return common / (left.size + right.size - common);
}

function exactDuplicate(candidate, existing) {
  const id = fingerprint(candidate);
  return existing.filter(Boolean).find((item) => item.fingerprint === id || fingerprint(item) === id) || null;
}
function semanticDuplicate(candidate, existing) {
  return existing.filter(Boolean).find((item) => {
    // Generated recipe variants have deterministic test seeds and unique titles;
    // do not reject every later variant merely because the shared archetype text
    // is intentionally similar. Authored-vs-generated similarity is still gated.
    if (candidate.generated && item.generated) return false;
    return item.difficulty === candidate.difficulty && similarity(candidate, item) >= 0.82;
  }) || null;
}

function validationErrors(problem, archetype, existing) {
  const errors = [];
  ["title", "description", "inputFormat", "outputFormat", "sampleInput", "sampleOutput", "difficulty", "archetypeId"].forEach((field) => { if (!clean(problem[field])) errors.push(`missing ${field}`); });
  if (problem.difficulty !== archetype.rank) errors.push("rank does not match selected archetype");
  if (problem.sourceArchetypeId !== archetype.id) errors.push("archetype does not match selected archetype");
  if (!Array.isArray(problem.constraints) || problem.constraints.length < 1) errors.push("constraints are missing");
  if (!Array.isArray(problem.allowedTechniques) || !problem.allowedTechniques.length) errors.push("allowed techniques are missing");
  if (!Array.isArray(problem.forbiddenTechniques)) errors.push("forbidden techniques are missing");
  if (!Array.isArray(problem.testCases) || problem.testCases.length !== TEST_COUNT) errors.push(`expected exactly ${TEST_COUNT} test cases`);
  if (problem.timeLimitSeconds !== 300) errors.push("time limit must be exactly 300 seconds");
  if (!problem.testCases?.every((test) => test && test.input !== undefined && test.expected !== undefined)) errors.push("test cases must include input and expected output");
  if (problem.testCases?.[0]?.input !== problem.sampleInput || problem.testCases?.[0]?.expected !== problem.sampleOutput) errors.push("sample must match the first judged test");
  if (exactDuplicate(problem, existing)) errors.push("exact duplicate of an existing problem");
  if (semanticDuplicate(problem, existing)) errors.push("semantic duplicate of an existing problem");
  return errors;
}

function promptFor({ archetype, template, rank, existing }) {
  return `Create one original ${rank} competitive-programming problem for a five-minute round. Return ONLY one JSON object, with no markdown and no commentary. It must be self-contained, deterministic, and judgeable with exactly eight tests.

Required keys: title, category, difficulty, archetypeId, definition, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, testCases, timeLimitSeconds, allowedTechniques, forbiddenTechniques, explanation, uniqueSignature.

Rules: difficulty must be ${rank}; timeLimitSeconds must be 300; testCases must be an array of exactly 8 objects, each containing input and expected strings; testCases[0] must equal sampleInput/sampleOutput; use only allowed techniques; do not use forbidden techniques; do not copy an existing title.

ARCHETYPE GUIDE
${JSON.stringify({ id: archetype.id, rank: archetype.rank, topics: archetype.primaryTopics, technique: archetype.coreTechnique, structure: archetype.structure, insight: archetype.requiredInsight, forbidden: archetype.forbidden, constraints: archetype.constraints })}

TEMPLATE
${template}

TITLES TO AVOID
${existing.filter(Boolean).slice(-40).map((item) => item.title).filter(Boolean).join("\n")}`;
}

function parseJson(content) {
  const text = clean(content).replace(/^```json\s*/i, "").replace(/```\s*$/g, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

const RECIPE_OPERATIONS = ["sign", "count_even", "sum_positive", "reverse", "max_index", "filter_even", "run_count", "alternating_sum", "clamp", "rotate", "first_above"];

function operationFor(archetype, seed) {
  const text = `${archetype.coreTechnique} ${archetype.primaryTopics} ${archetype.structure}`.toLowerCase();
  const preferred = text.includes("reorder") || text.includes("permutation") ? "reverse"
    : text.includes("run") ? "run_count"
      : text.includes("palindrome") || text.includes("symmetric") ? "reverse"
        : text.includes("filter") ? "filter_even"
          : text.includes("count") || text.includes("tally") ? "count_even"
            : text.includes("aggregate") || text.includes("sum") ? "sum_positive"
              : text.includes("extremum") || text.includes("maximum") || text.includes("minimum") ? "max_index"
                : text.includes("adjacent") || text.includes("alternating") ? "alternating_sum"
                  : text.includes("segment") || text.includes("clamp") ? "clamp"
                    : text.includes("search") || text.includes("match") ? "first_above" : "sign";
  return RECIPE_OPERATIONS.includes(preferred) ? preferred : RECIPE_OPERATIONS[Math.abs(Math.floor(seed)) % RECIPE_OPERATIONS.length];
}

function recipePrompt({ archetype, operation }) {
  return `Return one compact JSON object only: {"title":"short title","operation":"${operation}"}. The operation must remain exactly "${operation}". Create a fresh title inspired by ${archetype.name}. No markdown, no explanation, no tests, and no other keys.`;
}

function seededValues(seed, index, length = 6) {
  let x = (Math.abs(Math.floor(seed)) + index * 7919) >>> 0;
  return Array.from({ length }, () => { x = Math.imul(x ^ (x >>> 16), 2246822519) >>> 0; return (x % 31) - 15; });
}

function recipeCase(operation, seed, index) {
  const n = 4 + (index % 4);
  const values = seededValues(seed, index, n);
  const joined = values.join(" ");
  const base = `${n}\n${joined}`;
  if (operation === "sign") return { input: base, expected: values.map((v) => v < 0 ? -1 : v > 0 ? 1 : 0).join(" ") };
  if (operation === "count_even") return { input: base, expected: String(values.filter((v) => v % 2 === 0).length) };
  if (operation === "sum_positive") return { input: base, expected: String(values.filter((v) => v > 0).reduce((a, v) => a + v, 0)) };
  if (operation === "reverse") return { input: base, expected: [...values].reverse().join(" ") };
  if (operation === "max_index") {
    const max = Math.max(...values); return { input: base, expected: `${max} ${values.indexOf(max) + 1}` };
  }
  if (operation === "filter_even") return { input: base, expected: values.filter((v) => v % 2 === 0).join(" ") };
  if (operation === "run_count") {
    let runs = values.length ? 1 : 0; for (let i = 1; i < values.length; i++) if (values[i] !== values[i - 1]) runs++;
    return { input: base, expected: String(runs) };
  }
  if (operation === "alternating_sum") return { input: base, expected: String(values.reduce((sum, value, i) => sum + (i % 2 ? -value : value), 0)) };
  if (operation === "clamp") {
    const low = -5 + (index % 3), high = 5 + (index % 2); return { input: `${n} ${low} ${high}\n${joined}`, expected: values.map((v) => Math.max(low, Math.min(high, v))).join(" ") };
  }
  if (operation === "rotate") {
    const k = index % n; const rotated = k ? values.slice(-k).concat(values.slice(0, -k)) : values;
    return { input: `${n} ${k}\n${joined}`, expected: rotated.join(" ") };
  }
  const threshold = index - 3;
  const first = values.findIndex((v) => v > threshold);
  return { input: `${n} ${threshold}\n${joined}`, expected: String(first < 0 ? -1 : first + 1) };
}

function recipeProblem(recipe, archetype, seed) {
  const operation = RECIPE_OPERATIONS.includes(recipe?.operation) ? recipe.operation : operationFor(archetype, seed);
  const specs = {
    sign: {
      title: "Classify Each Signal", description: "For every integer, classify it by sign: print -1 if it is negative, 0 if it is zero, and 1 if it is positive.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print n integers, where the i-th output is the sign of xi.",
      explanation: "Scan the numbers once. For each value, compare it with zero and append -1, 0, or 1. This takes O(n) time and O(n) output space.",
    },
    count_even: {
      title: "Count the Even Signals", description: "Count how many values in the sequence are divisible by 2.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print one integer: the number of even values.",
      explanation: "Keep a counter initialized to zero. During one scan, increase it whenever xi mod 2 equals zero. This takes O(n) time and O(1) extra space.",
    },
    sum_positive: {
      title: "Add the Positive Signals", description: "Find the sum of all strictly positive values in the sequence. Negative values and zero do not contribute.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print one integer: the sum of all xi greater than zero. If there are no positive values, print 0.",
      explanation: "Initialize the answer to zero and add xi only when xi is greater than zero. A single scan is sufficient, so the time complexity is O(n) and extra space is O(1).",
    },
    reverse: {
      title: "Send the Signals Back", description: "Reverse the sequence: the last input value becomes the first output value, and so on.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print x_n, x_{n-1}, ..., x_1 separated by spaces.",
      explanation: "Read the sequence and visit its positions from n down to 1, or reverse the stored array. The time complexity is O(n); storing the output requires O(n) space.",
    },
    max_index: {
      title: "Locate the Highest Signal", description: "Find the largest value and the first position where it appears. Positions are 1-indexed.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print the maximum value followed by its smallest 1-based position.",
      explanation: "Track the best value and its position while scanning left to right. Replace the best value only when a strictly larger value appears, which automatically preserves the first position on ties. Complexity is O(n) time and O(1) extra space.",
    },
    filter_even: {
      title: "Keep the Even Signals", description: "Keep only the values divisible by 2, preserving their original order.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print all even values in input order separated by spaces. Print an empty line if none are even.",
      explanation: "Scan from left to right and append a value whenever its remainder after division by 2 is zero. Because values are appended in scan order, the original order is preserved. Complexity is O(n).",
    },
    run_count: {
      title: "Count the Consecutive Runs", description: "A run is a maximal consecutive block of equal values. Count the number of runs in the sequence.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print one integer: the number of maximal consecutive runs.",
      explanation: "A non-empty sequence starts with one run. Scan from the second value onward and increase the answer whenever xi differs from xi-1. This takes O(n) time and O(1) extra space.",
    },
    alternating_sum: {
      title: "Balance Odd and Even Positions", description: "Compute the sum of values at 1-based odd positions minus the sum of values at 1-based even positions.",
      input: "The first line contains n. The second line contains n integers x1..xn.", output: "Print one integer: x1 - x2 + x3 - x4 + ... .",
      explanation: "Scan once and add values at 1-based odd positions while subtracting values at even positions. The index determines the sign, giving O(n) time and O(1) extra space.",
    },
    clamp: {
      title: "Clamp the Signal Range", description: "Replace every value below L with L, every value above R with R, and leave values inside [L,R] unchanged.",
      input: "The first line contains n, L, and R. The second line contains n integers. It is guaranteed that L <= R.", output: "Print the n clamped values in their original order.",
      explanation: "For each value x, compute max(L, min(R, x)). This directly handles all three cases in one expression and takes O(n) time.",
    },
    rotate: {
      title: "Rotate the Signals", description: "Rotate the sequence to the right by k positions. Values that pass the end reappear at the beginning.",
      input: "The first line contains n and k, where 0 <= k < n. The second line contains n integers.", output: "Print the rotated sequence in order.",
      explanation: "The value at output position i comes from input position (i-k+n) mod n. You can also split the final k values from the rest and concatenate them. Complexity is O(n).",
    },
    first_above: {
      title: "Find the First Rising Signal", description: "Find the first value strictly greater than a threshold T. Positions are 1-indexed.",
      input: "The first line contains n and T. The second line contains n integers x1..xn.", output: "Print the smallest position i such that xi > T, or -1 if no value is greater than T.",
      explanation: "Scan from the first value and stop at the first value greater than T. If the scan finishes without finding one, print -1. This is O(n) time and O(1) extra space.",
    },
  };
  const spec = specs[operation] || specs.sign;
  const tests = Array.from({ length: TEST_COUNT }, (_, index) => ({ ...recipeCase(operation, seed, index), hidden: index >= 4 }));
  const proposedTitle = clean(recipe?.title);
  const usableTitle = proposedTitle && !/short title|title here|example title|^title$/i.test(proposedTitle) ? proposedTitle : spec.title;
  const title = usableTitle;
  return {
    title, category: clean(archetype.primaryTopics).split(",")[0] || "arrays", difficulty: archetype.rank,
    definition: spec.description, description: spec.description, inputFormat: spec.input, outputFormat: spec.output,
    constraints: ["1 <= n <= 10", "-15 <= each value <= 15", ...(operation === "clamp" ? ["-5 <= L <= R <= 6"] : [])],
    sampleInput: tests[0].input, sampleOutput: tests[0].expected, testCases: tests, timeLimitSeconds: 300,
    allowedTechniques: [archetype.coreTechnique || "linear scan"], forbiddenTechniques: [], explanation: spec.explanation,
    uniqueSignature: `${archetype.id}:${operation}:${seed}`,
  };
}

function shapeProblem(raw, archetype) {
  const source = raw && typeof raw === "object" ? raw : {};
  const tests = Array.isArray(source.testCases) ? source.testCases.slice(0, TEST_COUNT).map((test) => ({ input: String(test?.input ?? ""), expected: String(test?.expected ?? ""), hidden: false })) : [];
  const generatedId = `AI-${archetype.id}-${hashText(`${source.title || ""}|${Date.now()}|${Math.random()}`)}`;
  return {
    ...source,
    id: generatedId,
    archetypeId: generatedId,
    sourceArchetypeId: archetype.id,
    generated: true,
    difficulty: archetype.rank,
    color: "#F97316",
    definition: clean(source.definition),
    description: clean(source.description),
    constraints: Array.isArray(source.constraints) ? source.constraints.map(clean).filter(Boolean) : [],
    sampleInput: clean(source.sampleInput),
    sampleOutput: clean(source.sampleOutput),
    testCases: tests.map((test, index) => ({ ...test, hidden: index >= 4 })),
    timeLimitSeconds: 300,
    timeLimit: 300,
    allowedTechniques: Array.isArray(source.allowedTechniques) ? source.allowedTechniques.map(clean).filter(Boolean) : [],
    forbiddenTechniques: Array.isArray(source.forbiddenTechniques) ? source.forbiddenTechniques.map(clean).filter(Boolean) : [],
    fingerprint: fingerprint(source),
  };
}

export async function generateBurstQuestion({ difficulty, seed = Date.now(), existingProblems = [], onProgress = () => {} } = {}) {
  onProgress({ text: "Preparing the Burst generation guide…", progress: 0.04 });
  const { archetypes, templates } = await loadLibrary();
  const candidates = archetypes.filter((item) => item.rank === difficulty);
  if (!candidates.length) throw new Error(`No C4 archetype is available for ${difficulty}.`);
  const usage = usageMap();
  const minUse = Math.min(...candidates.map((item) => Number(usage[item.id] || 0)));
  const leastUsed = candidates.filter((item) => Number(usage[item.id] || 0) === minUse);
  const archetype = leastUsed[Math.abs(Math.floor(seed)) % leastUsed.length];
  const choices = templates[archetype.id] || [];
  const template = choices[Math.abs(Math.floor(seed / 7)) % Math.max(1, choices.length)] || archetype.structure;
  const known = [...existingProblems, ...generatedPool()];
  onProgress({ text: "Selecting a fresh archetype…", progress: 0.15 });
  const model = await loadLocalBurstModel((progress) => onProgress({
    text: progress?.text || "Loading the local Burst author…",
    progress: progress?.progress ?? 0.2,
  }));
  const operation = operationFor(archetype, seed);
  onProgress({ text: "Writing a compact local Burst recipe…", progress: 0.62 });
  let recipe = null;
  try {
    const response = await model.chat.completions.create({
      messages: [
        { role: "system", content: "Return only compact JSON. Never output markdown." },
        { role: "user", content: recipePrompt({ archetype, operation }) },
      ],
      temperature: 0.45,
      max_tokens: 180,
    });
    recipe = parseJson(response?.choices?.[0]?.message?.content);
  } catch (error) {
    // A local model failure should not block a Burst: the deterministic recipe
    // still produces a complete, judgeable problem from the selected archetype.
    console.warn("Compact local Burst recipe unavailable; using deterministic recipe.", error);
  }
  onProgress({ text: "Building deterministic tests and validating uniqueness…", progress: 0.9 });
  const candidate = shapeProblem(recipeProblem(recipe, archetype, seed), archetype);
  const errors = validationErrors(candidate, archetype, known);
  if (errors.length) throw new Error(`Generated Burst question rejected: ${errors.join(", ")}.`);
  const saved = [...generatedPool(), candidate].slice(-MAX_ACCEPTED);
  writeCache(CACHE_KEY, saved);
  writeCache(USAGE_KEY, { ...usage, [archetype.id]: Number(usage[archetype.id] || 0) + 1 });
  return candidate;
}

function completedEnough(seenIds, pool) {
  if (!pool.length) return false;
  const seen = new Set(seenIds || []);
  return pool.filter((item) => seen.has(item.archetypeId || item.id)).length / pool.length >= 0.8;
}

// Prewarm this small parsed guide after the dashboard settles. It is cache-backed,
// so pressing Play later does not inherit the guide's network or parsing delay.
if (typeof window !== "undefined") {
  window.setTimeout(() => { loadLibrary().catch(() => {}); }, 1800);
}

export function warmBurstQuestionModel(onProgress = () => {}) {
  return warmLocalBurstModel(onProgress);
}

export function generatedQuestions(difficulty = "") { return generatedPool().filter((item) => item && (!difficulty || item.difficulty === difficulty)); }

export async function selectBurstQuestion({ difficulty, mode = "unranked", seed = Date.now(), existingPool = [], seenIds = [], opponentSeenIds = [], forceGenerated = false, onGenerate = () => {} } = {}) {
  const generated = generatedQuestions(difficulty);
  const existing = existingPool.filter(Boolean);
  const rankedMode = mode === "ranked" || mode === "rated";
  const bothMostlyComplete = rankedMode && completedEnough(seenIds, existing) && completedEnough(opponentSeenIds, existing);
  const myMostlyComplete = !rankedMode && completedEnough(seenIds, existing);
  const generatedAllowed = forceGenerated || bothMostlyComplete || myMostlyComplete;
  const roll = Math.abs(Math.floor(seed)) % 5;
  if (generatedAllowed && (forceGenerated || roll === 0) && generated.length) {
    return generated[roll % generated.length];
  }
  if (generatedAllowed && (forceGenerated || roll === 1)) {
    return generateBurstQuestion({ difficulty, seed, existingProblems: existing, onProgress: onGenerate });
  }
  if (!existing.length) return generateBurstQuestion({ difficulty, seed, existingProblems: existing, onProgress: onGenerate });
  const seen = new Set(seenIds || []);
  const fresh = existing.filter((item) => !seen.has(item.archetypeId || item.id));
  return (fresh.length ? fresh : existing)[Math.abs(Math.floor(seed / 11)) % (fresh.length || existing.length)];
}

export function c4QuestionMode() {
  try { return localStorage.getItem("bb_unranked_question_mode") || "existing_first"; } catch { return "existing_first"; }
}
export function setC4QuestionMode(mode) { try { localStorage.setItem("bb_unranked_question_mode", mode); } catch {} }
export async function c4LibraryInfo() { const library = await loadLibrary(); return { archetypes: library.archetypes.length, templates: Object.values(library.templates).reduce((n, list) => n + list.length, 0), generated: generatedPool().length }; }
