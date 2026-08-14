// ============================================================================
// Glicko-2 — the rating system lichess uses.
//
// A player is (rating, rd, vol). Rating starts at 1500 with a deviation of 350,
// which shrinks as the system learns how strong you actually are. While the
// deviation is still wide the rating is shown with a "?" — same convention
// lichess uses.
//
// Each game is treated as its own rating period (one opponent, one result),
// which is what you want for a fast-paced ladder where people play in bursts.
// ============================================================================

export const DEFAULT_RATING = 1500;
export const DEFAULT_RD     = 350;
export const DEFAULT_VOL    = 0.06;

export const MIN_RD = 45;    // floor — never claim perfect certainty
export const MAX_RD = 350;   // ceiling — a long absence resets you to "unknown"
export const TAU    = 0.75;  // lichess's system constant
export const PROVISIONAL_RD = 110; // above this the rating renders as "1500?"

const SCALE = 173.7178;

export function defaultRating() {
  return { rating: DEFAULT_RATING, rd: DEFAULT_RD, vol: DEFAULT_VOL };
}

export function isProvisional(rd) {
  return (rd ?? DEFAULT_RD) > PROVISIONAL_RD;
}

// "1642" when settled, "1642?" while still provisional.
export function displayRating(rating, rd) {
  if (rating == null) return "—";
  return Math.round(rating) + (isProvisional(rd) ? "?" : "");
}

// ── Core maths ──────────────────────────────────────────────────────────────
const g = (phi) => 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
const E = (mu, muJ, phiJ) => 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));

// Illinois-variant root finder for the new volatility (Glicko-2 step 5).
function newVolatility(phi, v, delta, sigma) {
  const a = Math.log(sigma * sigma);
  const eps = 0.000001;

  const f = (x) => {
    const ex = Math.exp(x);
    const d2 = delta * delta;
    const p2 = phi * phi;
    const num = ex * (d2 - p2 - v - ex);
    const den = 2 * Math.pow(p2 + v + ex, 2);
    return num / den - (x - a) / (TAU * TAU);
  };

  let A = a;
  let B;
  const d2 = delta * delta;
  if (d2 > phi * phi + v) {
    B = Math.log(d2 - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0 && k < 100) k++;
    B = a - k * TAU;
  }

  let fA = f(A);
  let fB = f(B);
  let guard = 0;
  while (Math.abs(B - A) > eps && guard++ < 200) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) { A = B; fA = fB; }
    else { fA = fA / 2; }
    B = C; fB = fC;
  }
  return Math.exp(A / 2);
}

/**
 * Rate one game.
 * @param {{rating:number, rd:number, vol:number}} me
 * @param {{rating:number, rd:number}} opp
 * @param {number} score  1 = win, 0 = loss, 0.5 = draw. Partial scores are
 *                        legal and used for "won on test cases" style results.
 * @returns {{rating:number, rd:number, vol:number, delta:number}}
 */
export function rate(me, opp, score) {
  const r   = me.rating ?? DEFAULT_RATING;
  const rd  = clampRd(me.rd ?? DEFAULT_RD);
  const vol = me.vol ?? DEFAULT_VOL;

  const mu   = (r - 1500) / SCALE;
  const phi  = rd / SCALE;
  const muJ  = ((opp.rating ?? DEFAULT_RATING) - 1500) / SCALE;
  const phiJ = clampRd(opp.rd ?? DEFAULT_RD) / SCALE;

  const gj = g(phiJ);
  const e  = E(mu, muJ, phiJ);

  const v     = 1 / (gj * gj * e * (1 - e));
  const dSum  = gj * (score - e);
  const delta = v * dSum;

  const sigmaP = newVolatility(phi, v, delta, vol);
  const phiStar = Math.sqrt(phi * phi + sigmaP * sigmaP);
  const phiP = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muP  = mu + phiP * phiP * dSum;

  const newRating = muP * SCALE + 1500;
  const newRd     = clampRd(phiP * SCALE);

  return {
    rating: Math.round(newRating * 100) / 100,
    rd:     Math.round(newRd * 100) / 100,
    vol:    Math.round(sigmaP * 1000000) / 1000000,
    delta:  Math.round(newRating) - Math.round(r),
  };
}

function clampRd(rd) {
  return Math.min(MAX_RD, Math.max(MIN_RD, rd));
}

// Inactivity inflates the deviation — a rating you haven't defended in months
// is less trustworthy. One rating period = 7 days.
export function decayRd(rd, vol, lastPlayedMs) {
  if (!lastPlayedMs) return clampRd(rd ?? DEFAULT_RD);
  const days = (Date.now() - lastPlayedMs) / 86400000;
  const periods = Math.floor(days / 7);
  if (periods <= 0) return clampRd(rd ?? DEFAULT_RD);
  const phi = (rd ?? DEFAULT_RD) / SCALE;
  const sig = vol ?? DEFAULT_VOL;
  const inflated = Math.sqrt(phi * phi + sig * sig * periods) * SCALE;
  return clampRd(inflated);
}

// ── Score for a duel outcome ────────────────────────────────────────────────
// Glicko-2 accepts any score in [0,1], so a scrappy win worth less than a clean
// one is expressible directly rather than bolted on as a multiplier.
export const DUEL_SCORE = {
  solve:     1.0,   // solved all tests first
  testcases: 0.75,  // time ran out, you passed more hidden tests
  forfeit:   1.0,   // opponent left the arena — counts as a full win
  draw:      0.5,
};

export function scoresFor(winBy, iWon) {
  if (winBy === "draw" || winBy === "tiebreak") return [0.5, 0.5];
  const w = DUEL_SCORE[winBy] ?? 1.0;
  return iWon ? [w, 1 - w] : [1 - w, w];
}

// ── Rank tiers ──────────────────────────────────────────────────────────────
export const TIERS = [
  { name: "Bronze",   code: "B", color: "#CD7F32", min: 0,    max: 1199 },
  { name: "Silver",   code: "S", color: "#C0C0C0", min: 1200, max: 1499 },
  { name: "Gold",     code: "G", color: "#FFD700", min: 1500, max: 1799 },
  { name: "Platinum", code: "P", color: "#4DD9E0", min: 1800, max: 2099 },
  { name: "Diamond",  code: "D", color: "#4FA3FF", min: 2100, max: 2399 },
  { name: "Master",   code: "M", color: "#8B5CF6", min: 2400, max: Infinity },
];

export const TIER_NAMES = TIERS.map(t => t.name);

export const TIER_COLORS = TIERS.reduce((acc, t) => (acc[t.name] = t.color, acc), {});

export function tierFor(rating) {
  const r = rating ?? DEFAULT_RATING;
  return TIERS.find(t => r >= t.min && r <= t.max) ?? TIERS[0];
}

export function nextTier(rating) {
  const i = TIERS.indexOf(tierFor(rating));
  return i >= 0 && i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

// 0-100 progress toward the next tier.
export function tierProgress(rating) {
  const t = tierFor(rating);
  if (!isFinite(t.max)) return 100;
  const span = t.max - t.min + 1;
  return Math.max(0, Math.min(100, Math.round(((rating - t.min) / span) * 100)));
}

// ── Ranked placement ────────────────────────────────────────────────────────
// A rank is a claim about where you sit against everyone else, and ten games is
// the earliest that claim means anything. Until then you have a rating but no
// rank: the ladder shows you as "Unranked" rather than handing out a Gold badge
// for one lucky win.
export const PLACEMENT_GAMES = 10;

export const UNRANKED_TIER = {
  name: "Unranked", code: "?", color: "#8E93A6", min: 0, max: Infinity,
  placement: true,
};

export function isPlaced(gamesPlayed) {
  return (gamesPlayed ?? 0) >= PLACEMENT_GAMES;
}

/**
 * Hold the deviation up while a player is still placing.
 *
 * Plain Glicko-2 collapses rd very fast — 350 → 259 → 209 → 181 in three games
 * — so by game four a "provisional" player is only moving ±15, which makes the
 * provisional label a lie and leaves a badly-placed player grinding. During
 * placement the deviation is floored on a straight line from DEFAULT_RD down to
 * PROVISIONAL_RD, so the first ten games all swing hard and the rating lands
 * near the truth quickly. After that it's ordinary Glicko-2.
 *
 * @param rd           the deviation Glicko-2 just produced
 * @param gamesPlayed  rated games *including* the one just played
 */
export function placementRd(rd, gamesPlayed) {
  const n = Math.max(0, gamesPlayed ?? 0);
  if (n >= PLACEMENT_GAMES) return rd;
  const t = n / PLACEMENT_GAMES;
  const floor = DEFAULT_RD + (PROVISIONAL_RD - DEFAULT_RD) * t;
  return Math.max(rd, Math.round(floor * 100) / 100);
}

export function placementLeft(gamesPlayed) {
  return Math.max(0, PLACEMENT_GAMES - (gamesPlayed ?? 0));
}

/**
 * The rank to *show* for a ranked player: their tier once placed, the Unranked
 * placeholder before that. `tierFor` stays the raw rating→tier map and is what
 * problem difficulty and matchmaking keep using.
 */
export function rankFor(rating, gamesPlayed) {
  return isPlaced(gamesPlayed) ? tierFor(rating) : UNRANKED_TIER;
}

// ── Starting rating ─────────────────────────────────────────────────────────
// New players place themselves rather than everyone starting at 1500 and
// grinding to where they belong. The deviation stays at the default 350, so
// these are provisional ("600?") and move fast until the system agrees.
export const SKILL_LEVELS = [
  {
    id: "beginner", name: "Beginner", rating: 600,
    desc: "New to this. Loops, strings and simple maths are where you're comfortable.",
  },
  {
    id: "intermediate", name: "Intermediate", rating: 1200,
    desc: "You know hashmaps, sorting and two pointers, and recursion doesn't scare you.",
  },
  {
    id: "advanced", name: "Advanced", rating: 1800,
    desc: "Binary search, greedy, graphs and dynamic programming are familiar ground.",
  },
  {
    id: "master", name: "Master", rating: 2400,
    desc: "Suffix structures, flows and heavy graph theory. You've done contests.",
  },
];

export function skillLevel(id) {
  return SKILL_LEVELS.find((s) => s.id === id) ?? null;
}

// ── Time limits per tier (seconds) ─────────────────────────────────────────
// Every division gets the same five minutes: the problems get harder as you
// climb, and the clock staying put is what makes the climb mean something.
export const SOLVE_SECONDS = 300;

export const TIME_LIMITS = {
  Bronze: SOLVE_SECONDS, Silver: SOLVE_SECONDS, Gold: SOLVE_SECONDS,
  Platinum: SOLVE_SECONDS, Diamond: SOLVE_SECONDS, Master: SOLVE_SECONDS,
};

// Time the par opponent is assumed to need, per tier (seconds). Par has to sit
// inside the limit or an unranked run at that tier could never beat it, so
// these scale with the shared five minutes rather than with tier difficulty.
export const PAR_TIME = {
  Bronze: 100, Silver: 130, Gold: 160, Platinum: 190, Diamond: 220, Master: 250,
};

/**
 * Unranked scoring. The clock remains the opponent, but every completed run is
 * positive evidence. The previous curve gave every slow solve exactly 0.5 —
 * equal to the virtual opponent — so a provisional player could finish with a
 * visible +0. v1.2.0 adds a completion floor that is intentionally stronger
 * during the first ten placement runs, then continues to reward speed above it.
 */
export function soloScore(solved, solveTimeSecs, difficulty, soloRd = null) {
  if (!solved) return 0;

  const par = PAR_TIME[difficulty] || 150;
  const ratio = Math.max(0, solveTimeSecs / par);
  const provisional = (soloRd ?? DEFAULT_RD) > PROVISIONAL_RD;

  // `speed` is 0 at twice par or slower, 0.5 at par, and reaches 1 for
  // exceptional clears. It keeps a visible gap between a near-limit solve and
  // an on-par solve without letting a single run exceed a full win.
  const speed = Math.max(0, Math.min(1, (2 - ratio) / 2));
  const difficultyWeight = {
    Bronze: 0.72, Silver: 0.80, Gold: 0.88,
    Platinum: 0.96, Diamond: 1.0, Master: 1.0,
  }[difficulty] || 0.9;

  // A slow completion is still a clear: it receives 0.68 while provisional and
  // 0.54 after placement. Speed earns the rest of the way to a maximum of 1.
  const completionFloor = provisional ? 0.68 : 0.54;
  const speedBonus = (1 - completionFloor) * speed * difficultyWeight;
  return Math.min(1, Math.round((completionFloor + speedBonus) * 1000) / 1000);
}

/**
 * The virtual opponent an unranked run is rated against: **you, at your current
 * rating**. The question each run answers is "did you perform at your own
 * level today?", so par is always your own bar.
 *
 * This used to be a fixed rating per tier, which meant that once you reached
 * the rating implied by that tier's par you stopped moving no matter how well
 * you played — runs would settle to ±2 and the rating went dead. Anchoring to
 * the player keeps every run meaningful: beat par and you climb, and since
 * climbing moves you into a harder tier with a longer par, it self-limits at
 * the level you can actually sustain.
 */
export function soloOpponent(difficulty, selfRating) {
  return { rating: selfRating ?? DEFAULT_RATING, rd: 80 };
}
