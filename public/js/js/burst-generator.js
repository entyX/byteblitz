// ============================================================================
// C4 Burst question generator — browser-local, validated, and cache-backed.
// The supplied archetype/template documents are the generation guide; accepted
// questions are kept in this browser's local pool and never silently enter the
// authored CSV files.
// ============================================================================

import { loadLocalCodeModel } from "./analysis-engine.js";

const ARCHETYPES_URL = "/data/byteblitz_archetypes.md";
const TEMPLATES_URL = "/data/byteblitz_question_templates.md";
const CACHE_KEY = "bb_c4_generated_burst_pool_v1";
const USAGE_KEY = "bb_c4_archetype_usage_v1";
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
    libraryPromise = Promise.all([fetch(ARCHETYPES_URL), fetch(TEMPLATES_URL)]).then(async ([a, t]) => {
      if (!a.ok || !t.ok) throw new Error("The C4 Burst generation guide could not be loaded.");
      const [archetypes, templates] = await Promise.all([a.text(), t.text()]);
      return { archetypes: parseArchetypes(archetypes), templates: parseTemplates(templates) };
    }).catch((error) => { libraryPromise = null; throw error; });
  }
  return libraryPromise;
}

function readCache(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function writeCache(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}
function generatedPool() { return readCache(CACHE_KEY, []); }
function usageMap() { return readCache(USAGE_KEY, {}); }

function hashText(text) {
  let hash = 2166136261;
  for (const char of String(text)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}
function normalizeText(text) { return clean(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }
function fingerprint(problem) {
  return hashText([problem.title, problem.description, problem.inputFormat, problem.outputFormat].map(normalizeText).join("|"));
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
  return existing.find((item) => item.fingerprint === id || fingerprint(item) === id) || null;
}
function semanticDuplicate(candidate, existing) {
  return existing.find((item) => item.difficulty === candidate.difficulty && similarity(candidate, item) >= 0.82) || null;
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
  return `You are the ByteBlitz Burst question author. Generate one original, self-contained ${rank} problem for a five-minute competitive-programming round. The archetype and template guide below are authoritative. Do not copy any existing problem. Use only the allowed techniques and do not require forbidden techniques. The problem must be automatically judgeable with exactly eight deterministic tests and no hidden interpretation.

Return ONLY JSON with: title, category, difficulty, archetypeId, definition, description, inputFormat, outputFormat, constraints (array), sampleInput, sampleOutput, testCases (exactly 8 objects with input and expected), timeLimitSeconds (300), allowedTechniques (array), forbiddenTechniques (array), explanation, uniqueSignature.

ARCHETYPE
${JSON.stringify(archetype)}

TEMPLATE
${template}

EXISTING TITLES TO AVOID
${existing.slice(-80).map((item) => item.title).join("\n")}`;
}

function parseJson(content) {
  const text = clean(content).replace(/^```json\s*/i, "").replace(/```\s*$/g, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

function shapeProblem(raw, archetype) {
  const tests = Array.isArray(raw?.testCases) ? raw.testCases.slice(0, TEST_COUNT).map((test) => ({ input: String(test.input ?? ""), expected: String(test.expected ?? ""), hidden: false })) : [];
  const generatedId = `AI-${archetype.id}-${hashText(`${raw?.title || ""}|${Date.now()}|${Math.random()}`)}`;
  return {
    ...raw,
    id: generatedId,
    archetypeId: generatedId,
    sourceArchetypeId: archetype.id,
    generated: true,
    difficulty: archetype.rank,
    color: "#F97316",
    definition: clean(raw?.definition),
    description: clean(raw?.description),
    constraints: Array.isArray(raw?.constraints) ? raw.constraints.map(clean).filter(Boolean) : [],
    sampleInput: clean(raw?.sampleInput),
    sampleOutput: clean(raw?.sampleOutput),
    testCases: tests.map((test, index) => ({ ...test, hidden: index >= 4 })),
    timeLimitSeconds: 300,
    timeLimit: 300,
    allowedTechniques: Array.isArray(raw?.allowedTechniques) ? raw.allowedTechniques.map(clean).filter(Boolean) : [],
    forbiddenTechniques: Array.isArray(raw?.forbiddenTechniques) ? raw.forbiddenTechniques.map(clean).filter(Boolean) : [],
    fingerprint: fingerprint(raw),
  };
}

export async function generateBurstQuestion({ difficulty, seed = Date.now(), existingProblems = [], onProgress = () => {} } = {}) {
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
  const model = await loadLocalCodeModel((progress) => onProgress({ text: progress?.text || "Preparing a Burst question…", progress: progress?.progress ?? 0 }));
  const response = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You generate safe, original, automatically judgeable competitive-programming problems. Output strict JSON only." },
      { role: "user", content: promptFor({ archetype, template, rank: difficulty, existing: known }) },
    ],
    temperature: 0.85,
    max_tokens: 3200,
  });
  const candidate = shapeProblem(parseJson(response.choices?.[0]?.message?.content), archetype);
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

export function generatedQuestions(difficulty = "") { return generatedPool().filter((item) => !difficulty || item.difficulty === difficulty); }

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
