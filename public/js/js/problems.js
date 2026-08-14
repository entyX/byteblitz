// ============================================================================
// Byteblitz problem set.
//
// Problems live in six authored CSVs (one per tier). Each row is one problem:
// statement, input format, constraints, a worked sample, and eight judged test
// cases. Tiers are
// fetched lazily so the first paint doesn't pull a megabyte of problems nobody
// asked for.
// ============================================================================

import { TIER_NAMES } from "./glicko.js";

const CSV_PATH = {
  Bronze:   "/data/byteblitz_bronze_questions.csv",
  Silver:   "/data/byteblitz_silver_questions.csv",
  Gold:     "/data/byteblitz_gold_questions.csv",
  Platinum: "/data/byteblitz_platinum_questions.csv",
  Diamond:  "/data/byteblitz_diamond_questions.csv",
  Master:   "/data/byteblitz_master_questions.csv",
};

const DIFF_COLOR = {
  Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#FFD700",
  Platinum: "#4DD9E0", Diamond: "#4FA3FF", Master: "#8B5CF6",
};

/** Test cases per problem, and how many of them the solver gets to see. */
export const TESTS_PER_PROBLEM = 8;
const VISIBLE_TESTS = 4;

// ── CSV parser (RFC-4180-ish, handles quoted fields with embedded newlines) ──
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let started = false;
  let i = 0;

  const endField = () => { row.push(field); field = ""; started = false; };
  const endRow = () => { endField(); rows.push(row); row = []; };

  while (i < text.length) {
    const c = text[i];

    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
      else if (c === '"') { quoted = false; i++; }
      else { field += c; i++; }
      continue;
    }

    if (c === '"' && !started) { quoted = true; started = true; i++; }
    else if (c === ",") { endField(); i++; }
    else if (c === "\r") { i++; }
    else if (c === "\n") { endRow(); i++; }
    else { field += c; started = true; i++; }
  }
  if (field !== "" || row.length > 0) endRow();
  return rows;
}

/** Header-driven column lookup, so column order in the CSV isn't load-bearing. */
function indexHeader(header) {
  const at = {};
  header.forEach((name, i) => { at[name.trim()] = i; });
  return at;
}

// ── Row → problem ───────────────────────────────────────────────────────────
// Statements come from the CSV exactly as authored; the only shaping done here
// is splitting the constraints blob into bullet points and marking which test
// cases the arena is allowed to reveal.
function rowToProblem(r, at) {
  const get = (name) => (r[at[name]] ?? "").trim();
  const difficulty = get("division");

  // Both halves of a test case can legitimately be blank: some problems are
  // answered with an empty line, and some are fed a blank or all-space input.
  // Only a missing column means the row is short.
  const testCases = [];
  for (let i = 1; i <= TESTS_PER_PROBLEM; i++) {
    const input = r[at[`test${i}_input`]];
    const expected = r[at[`test${i}_output`]];
    if (input === undefined || expected === undefined) break;
    testCases.push({
      input,
      expected: expected.replace(/\s+$/, ""),
      hidden: testCases.length >= VISIBLE_TESTS,
    });
  }

  return {
    id: get("id"),
    archetypeId: get("id"),
    title: get("name"),
    category: get("category"),
    difficulty,
    color: DIFF_COLOR[difficulty] ?? "#fff",
    definition: get("background"),
    description: get("task"),
    inputFormat: get("input_format"),
    constraints: get("constraints").split(/[\n;]/).map((s) => s.trim()).filter(Boolean),
    testCases,
    sampleInput: get("sample_input"),
    sampleOutput: get("sample_output"),
  };
}

// A row is only usable if it can actually be read and judged: a title, a task,
// and the full set of test cases.
function usable(p) {
  return !!p.id && !!p.title && !!p.description &&
    p.testCases.length === TESTS_PER_PROBLEM;
}

// ── Lazy pools ──────────────────────────────────────────────────────────────
const pools = {};
const inflight = {};

export async function loadPool(difficulty) {
  if (pools[difficulty]) return pools[difficulty];
  if (inflight[difficulty]) return inflight[difficulty];

  inflight[difficulty] = (async () => {
    // Try the configured absolute path first, but fall back to a relative path
    // in case the hosting base or runtime rewrites make the leading slash fail.
    const pathsToTry = [CSV_PATH[difficulty], (CSV_PATH[difficulty] || "").replace(/^\//, "")];
    let lastErr = null;
    try {
      for (const p of pathsToTry) {
        try {
          const res = await fetch(p);
          if (!res.ok) throw new Error(`Fetch ${p} failed ${res.status}`);
          const text = await res.text();
          const rows = parseCSV(text);
          const at = indexHeader(rows[0] ?? []);
          const list = rows.slice(1).map((r) => rowToProblem(r, at)).filter(usable);
          pools[difficulty] = list;
          return list;
        } catch (e) {
          lastErr = e;
          // try next path
        }
      }
      throw lastErr ?? new Error(`Could not load ${difficulty} problem set`);
    } finally {
      // Always clear inflight so future attempts can retry instead of getting a
      // permanently-rejected promise.
      delete inflight[difficulty];
    }
  })();

  return inflight[difficulty];
}

export async function loadAllPools() {
  const all = await Promise.all(TIER_NAMES.map((d) => loadPool(d)));
  return TIER_NAMES.reduce((acc, d, i) => (acc[d] = all[i], acc), {});
}

export function getPool(difficulty) {
  return pools[difficulty] ?? null;
}

// ── Thin-tier borrowing ─────────────────────────────────────────────────────
// Every tier currently ships well over this floor, but a tier that ever came up
// short would cycle the same handful of problems forever. A thin tier tops
// itself up from its immediate neighbours, alternating below and above so the
// average difficulty stays centred. Borrowed problems keep their real
// difficulty label, so the arena still shows an honest tier badge.
const MIN_POOL = 60;
const augmented = {};

async function effectivePool(difficulty) {
  if (augmented[difficulty]) return augmented[difficulty];

  const own = await loadPool(difficulty);
  if (own.length >= MIN_POOL) { augmented[difficulty] = own; return own; }

  const i = TIER_NAMES.indexOf(difficulty);
  const below = i > 0 ? await loadPool(TIER_NAMES[i - 1]) : [];
  const above = i < TIER_NAMES.length - 1 ? await loadPool(TIER_NAMES[i + 1]) : [];

  const out = [...own];
  let lo = 0, hi = 0;
  while (out.length < MIN_POOL && (lo < below.length || hi < above.length)) {
    if (lo < below.length) out.push(below[lo++]);
    if (out.length < MIN_POOL && hi < above.length) out.push(above[hi++]);
  }

  augmented[difficulty] = out;
  return out;
}

/** How many problems a tier can actually serve, and where they come from. */
export async function poolInfo(difficulty) {
  const own = await loadPool(difficulty);
  const eff = await effectivePool(difficulty);
  return { own: own.length, total: eff.length, borrowed: eff.length - own.length };
}

// Deterministic pick — both duellists derive the same problem from the seed.
export async function problemForSeed(difficulty, seed) {
  const pool = await effectivePool(difficulty);
  if (!pool.length) throw new Error(`No problems available for ${difficulty}`);
  const idx = Math.abs(Math.floor(seed)) % pool.length;
  return pool[idx];
}

// ── Repeat avoidance ────────────────────────────────────────────────────────
// Remember what this player has seen recently and prefer anything else. The
// window is capped at half the pool so it can never starve the picker.
const LS_RECENT = "bb_recent_problems";

function recentIds() {
  try { return JSON.parse(localStorage.getItem(LS_RECENT)) || []; }
  catch { return []; }
}

export function rememberProblem(id) {
  try {
    const list = recentIds().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(LS_RECENT, JSON.stringify(list.slice(0, 60)));
  } catch { /* private mode — repeat avoidance is a nicety, not a requirement */ }
}

export async function randomProblem(difficulty, excludeIds = []) {
  const pool = await effectivePool(difficulty);
  if (!pool.length) throw new Error(`No problems available for ${difficulty}`);

  const window = Math.floor(pool.length / 2);
  const skip = new Set([...excludeIds, ...recentIds().slice(0, window)]);
  const avail = pool.filter((p) => !skip.has(p.id));
  const list = avail.length ? avail : pool;

  const pick = list[Math.floor(Math.random() * list.length)];
  rememberProblem(pick.id);
  return pick;
}

export async function problemById(difficulty, id) {
  const pool = await loadPool(difficulty);
  return pool.find((p) => p.id === id) ?? null;
}

// ── Answer checking ─────────────────────────────────────────────────────────
// Trailing whitespace and line-ending noise should never fail a correct answer.
export function outputMatches(actual, expected) {
  const norm = (s) =>
    String(s ?? "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.replace(/\s+$/g, ""))
      .join("\n")
      .replace(/\n+$/g, "")
      .trim();
  if (norm(actual) === norm(expected)) return true;
  // Fall back to whitespace-insensitive token comparison for single-line answers.
  const tok = (s) => String(s ?? "").trim().split(/\s+/).join(" ");
  return tok(actual) === tok(expected);
}
