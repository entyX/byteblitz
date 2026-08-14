// ============================================================================
// Guest storage — everything a signed-out player needs, kept on their device.
//
// Guest play touches no Firebase service at all: no anonymous auth, no
// Firestore reads or writes. A guest gets a real unranked rating, real personal
// bests and real puzzle discovery, all persisted in localStorage under one key.
// The trade is that none of it leaves the machine: no leaderboards, no friends,
// no ranked.
// ============================================================================

import { defaultRating } from "./glicko.js";

const LS_KEY = "bb_guest";

function newGuestId() {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "GUEST-" + rnd;
}

function blankGuest() {
  const g = defaultRating();
  return {
    uid: "local:" + newGuestId(),
    username: newGuestId(),
    isGuest: true,
    isAnonymous: true,           // kept so existing account-gated checks hold
    createdAt: Date.now(),

    // Ranked is unreachable without an account, but the fields keep the shape
    // of a real profile so every view can read a guest without special-casing.
    rating: g.rating, rd: g.rd, vol: g.vol,
    wins: 0, losses: 0, draws: 0, gamesPlayed: 0, lastPlayedAt: null,

    soloRating: g.rating, soloRd: g.rd, soloVol: g.vol,
    soloRuns: 0, soloSolved: 0, soloBest: {}, lastSoloAt: null,

    totalMatches: 0,
    puzzlesSolved: 0,
    bestStreak: 0, streak: 0,

    seen: {},        // archetypeId -> true, puzzles met in an unranked run
    puzzles: {},     // archetypeId -> { timeMs, attempts, solved, title, difficulty }

    skillLevel: null,
    avatarIcon: null,
    avatarHue: null,
    country: "US",
    activityDays: {},
  };
}

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid) {
        // Older saves predate some fields; fill them in rather than throw away.
        cache = { ...blankGuest(), ...parsed, isGuest: true, isAnonymous: true };
        return cache;
      }
    }
  } catch { /* corrupt or unavailable storage — start fresh below */ }
  return null;
}

function write(profile) {
  cache = profile;
  try { localStorage.setItem(LS_KEY, JSON.stringify(profile)); }
  catch { /* private mode: the session still works, it just won't survive a reload */ }
  return profile;
}

/** The stored guest, or null if this device has never played as one. */
export function loadGuest() {
  return read();
}

/** Load the stored guest, creating one on first use. */
export function startGuest() {
  return read() ?? write(blankGuest());
}

export function clearGuest() {
  cache = null;
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function isGuestProfile(p) {
  return !!p?.isGuest;
}

/** Merge fields into the stored guest and return the updated profile. */
export function patchGuest(patch) {
  const cur = read() ?? blankGuest();
  return write({ ...cur, ...patch });
}

export function renameGuest(name) {
  return patchGuest({ username: name });
}

// ── Puzzle discovery ────────────────────────────────────────────────────────
export function markGuestSeen(archetypeId) {
  const cur = read() ?? blankGuest();
  if (cur.seen?.[archetypeId]) return cur;
  return write({ ...cur, seen: { ...(cur.seen || {}), [archetypeId]: true } });
}

export function guestSeen() {
  return read()?.seen ?? {};
}

// ── Training records ────────────────────────────────────────────────────────
export function guestPuzzleRecords() {
  return read()?.puzzles ?? {};
}

export function recordGuestPuzzle(puzzle, timeMs, solved) {
  const cur = read() ?? blankGuest();
  const prev = cur.puzzles?.[puzzle.archetypeId] ?? null;
  const prevBest = prev?.timeMs ?? null;
  const isBest = solved && (prevBest == null || timeMs < prevBest);
  const wasSolved = !!prev?.solved;

  const rec = {
    archetypeId: puzzle.archetypeId,
    title: puzzle.title,
    difficulty: puzzle.difficulty,
    solved: solved || wasSolved,
    attempts: (prev?.attempts ?? 0) + 1,
    updatedAt: Date.now(),
  };
  if (rec.solved) rec.timeMs = isBest ? timeMs : (prevBest ?? timeMs);

  write({
    ...cur,
    puzzles: { ...(cur.puzzles || {}), [puzzle.archetypeId]: rec },
    puzzlesSolved: (cur.puzzlesSolved ?? 0) + (solved && !wasSolved ? 1 : 0),
  });
  return { isBest, prevBest };
}
