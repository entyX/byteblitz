// ============================================================================
// Game controllers — solo runs, training puzzles, ranked duels.
//
// Each controller owns the lifecycle around an Arena: picking the problem,
// listening for the opponent, and writing the result to Firestore exactly once.
// ============================================================================

import { h, clear, modal, toast, fmtTime, confirmModal, icon } from "./ui.js";
import { openArena } from "./arena.js";
import { joinDuelPresence } from "./duel-presence.js";

import {
  randomProblem, problemForSeed, problemById, loadPool, TESTS_PER_PROBLEM,
} from "./problems.js";
import { selectBurstQuestion, c4QuestionMode } from "./burst-generator.js";
import { cacheAnalysisAttempt } from "./analysis-attempt-cache.js";
import {
  TIME_LIMITS, tierFor, scoresFor, displayRating, displayPlacementRating, PAR_TIME,
  isPlaced, placementLeft, PLACEMENT_GAMES,
} from "./glicko.js";
import {
  applySoloResult, applyDuelResult, recordPuzzleTime, puzzleLeaderboard,
  saveSolution, getProfile, setChallengeStatus, markProblemSeen, markTutorialComplete, setPresence, seenMap,

} from "./store.js";
import { session, requireAccount, requireAnySession, refreshGuest } from "./session.js";
import * as mm from "./matchmaking.js";
import { navigate } from "./router.js";

const applied = new Set(); // duelIds this tab has already rated

function setBattlePresence(inMatch) {
  const profile = session.profile;
  if (!profile || profile.isGuest || profile.isAnonymous) return;
  setPresence(profile.uid, { online: true, inMatch }).catch(() => {});
}

/** Advertised on the home card: how close an opponent starts out. */
export const RANKED_ELO_WINDOW = mm.ELO_WINDOW;

// ════════════════════════════════════════════════════════════════════════════
// UNRANKED — race the clock, own rating track, never touches ranked
// ════════════════════════════════════════════════════════════════════════════
export async function startSolo(preset, hooks = {}) {
  const player = session.profile;

  // No difficulty picker: unranked is a measurement, and you don't get to pick
  // how hard the thing measuring you is. The tier comes from your unranked
  // rating, the same way a duel's tier comes from the players' ratings.
  const difficulty = preset || tierFor(session.profile?.soloRating ?? 1500).name;
  const placing = !!player && !isPlaced(player);

  let problem;
  try {
    const generatedOnly = c4QuestionMode() === "generated_only";
    // The pool is cached and is required even in AI-only mode for novelty checks
    // and to avoid creating a question that already exists in the authored set.
    const existingPool = await loadPool(difficulty);
    problem = await selectBurstQuestion({
      difficulty,
      mode: "unranked",
      seed: Date.now() + Math.random() * 100000,
      existingPool,
      seenIds: Object.keys(seenMap(session.profile)),
      forceGenerated: generatedOnly,
      onGenerate: (progress) => {
        hooks.onProgress?.(progress);
        if (progress?.text) console.debug("C4 Burst", progress.text);
      },
    });
  } catch (e) {
    hooks.onError?.(e);
    throw e;
  }

  if (!problem || typeof problem !== "object" || !problem.archetypeId || !Array.isArray(problem.testCases)) {
    const error = new Error("The Burst question could not be prepared. Please try again.");
    hooks.onError?.(error);
    throw error;
  }

  // Authored problems unlock in Training Grounds. Generated Bursts remain
  // analysis-only until their own Training Grounds support is intentionally added.
  if (!problem.generated) markProblemSeen(session.profile, problem.archetypeId);

  const limit = TIME_LIMITS[difficulty] ?? 300;
  let settled = false;

  const arena = openArena({
    mode: "solo",
    title: placing ? "Code Burst · Unranked Placement" : "Code Burst · Unranked",
    problem,
        timeLimit: limit,
    onStarted: () => setBattlePresence(true),
    onExit: () => { setBattlePresence(false); navigate("/"); },

    onSolved: (r) => finish(true, r),
    onFailed: (r) => finish(false, r),
  });

  async function finish(solved, r) {
    if (settled) return;
    settled = true;
    setBattlePresence(false);
    const profile = session.profile;

    let res = null;
    const neutralExit = r.reason === "neutralExit";
    if (!neutralExit && profile) {
      try {
        res = await applySoloResult(profile.uid, profile, {
          solved,
          timeMs: solved ? r.timeMs : limit * 1000,
          difficulty,
          archetypeId: problem.archetypeId,
          puzzleTitle: problem.title,
          category: problem.category ?? null,
          testsPassed: r.passed ?? 0,
          totalTests: problem.testCases?.length ?? 0,
        });
        if (res && session.profile) {
          Object.assign(session.profile, {
            soloRating: res.rating, soloRd: res.rd, soloVol: res.vol,
            rating: res.rankedRating, placementGames: res.placementGames,
            placementConfidence: res.placementConfidence,
          });
        }
        if (solved && !problem.generated && !profile.isGuest && !profile.isAnonymous) {
          await recordPuzzleTime(profile, problem, r.timeMs, true);
        }
        refreshGuest();
      } catch (e) {
        console.error(e);
        toast("Couldn't save your result.", "err");
      }
    }

    const autoSaved = await autoSaveAttempt(profile, problem, r, { mode: "unranked", completed: solved });
    arena.showResult(soloResultScreen({
      solved, reason: r.reason, timeMs: r.timeMs, limit, difficulty, problem, res, submission: r,
      placement: placing,
      signedOut: !profile || profile.isGuest || profile.isAnonymous,
      meUid: profile?.uid || null,
      autoSaved,
      onAgain: () => { arena.destroy(); startSolo(); },
      onHome: () => arena.exit(),
    }));
  }
}

function soloResultScreen(o) {
  const { solved, reason, timeMs, difficulty, problem, res, submission, placement, signedOut, meUid, autoSaved } = o;
  const delta = res ? Math.round(res.rating) - res.before : 0;
  const par = PAR_TIME[difficulty];
  const totalTests = problem.testCases?.length || 0;
  const status = solved ? "Solved" : reason === "neutralExit" ? "Run paused" : reason === "left" || reason === "resigned" ? "Resigned" : "Time up";
  const statusColor = solved ? "var(--ok)" : reason === "neutralExit" ? "var(--warn)" : "var(--primary)";

  return h("div", { class: "postmatch-result unranked-postmatch" },
    h("div", { class: "postmatch-hero" },
      h("div", { class: "eyebrow mb-2" }, placement ? "// Unranked placement complete" : "// Unranked run complete"),
      h("h1", { class: "head mb-2", style: { color: statusColor } }, status),
      h("p", { class: "mono postmatch-subtitle" },
        signedOut
          ? `${problem.title} — signed-out runs are practice only and do not affect ELO.`
          : solved
            ? `${problem.title} · ${fmtTime(timeMs)}${par ? ` · par ${par}s` : ""}`
            : reason === "neutralExit"
              ? "This run was not recorded, so your Unranked ELO is unchanged."
              : `${problem.title} · better luck next run.`)),
    h("div", { class: "postmatch-problem unranked-problem mb-5" },
      h("span", { class: "postmatch-problem-mark" }, icon("target", 16)),
      h("div", { class: "postmatch-problem-copy" },
        h("span", { class: "label" }, "Problem"),
        h("span", { class: "mono" }, problem.title)),
      h("span", { class: "pill" }, difficulty)),
    h("div", { class: "postmatch-section-label" }, "// Performance snapshot"),
    h("div", { class: "postmatch-metric-grid mb-5" },
      stat(solved ? fmtTime(timeMs) : "—", "Time to solve"),
      stat(String(submission?.submissionCount || 0), "Submissions"),
      stat(formatRuntime(submission?.runtimeMs), "Test runtime"),
      stat(formatMemory(submission?.memoryBytes), "Memory delta"),
      stat(`${submission?.passed || 0}/${totalTests}`, "Tests passed"),
      stat(par ? par + "s" : "—", "Par time")),
    res
      ? h("div", { class: "postmatch-elo unranked-elo mb-5" },
          h("div", { class: "label mb-2" }, "// Unranked ELO"),
          h("div", { class: "row gap-3", style: { justifyContent: "center", alignItems: "baseline" } },
            h("span", { class: "mono dim tnum", style: { fontSize: "18px" } }, res.before),
            h("span", { class: "dim" }, "→"),
            animatedElo(res.before, res.rating, (value) => displayPlacementRating(value, res.rd, { placementGames: res.placementGames })),
            h("span", { class: "mono tnum " + (delta >= 0 ? "delta-up" : "delta-down"), style: { fontSize: "17px" } }, `${delta >= 0 ? "+" : ""}${delta}`)),
          res.rd > 110 ? h("p", { class: "mono mt-3 center", style: { fontSize: "11px", color: "var(--muted)" } }, "Your rating is provisional while placement settles.") : null)
      : h("div", { class: "postmatch-elo unranked-elo mb-5" },
          h("div", { class: "label" }, "// ELO"),
          h("p", { class: "mono center mt-2", style: { fontSize: "12px", color: "var(--muted-fg)" } }, "No ELO change for this run.")),
    placement && res
      ? h("div", { class: "postmatch-placement mb-5" },
          h("div", { class: "between gap-3" },
            h("span", { class: "mono" }, res.placementComplete ? "Placement complete — Ranked is unlocked." : `${PLACEMENT_GAMES - res.placementGames} placement ${PLACEMENT_GAMES - res.placementGames === 1 ? "game" : "games"} remaining.`),
            h("span", { class: "label" }, `Confidence ${res.placementConfidence}/10`)),
          h("div", { class: "bar mt-3" }, h("i", { style: { width: `${res.placementConfidence * 10}%`, background: "var(--primary)" } })))
      : null,
    res?.newRecord
      ? h("div", { class: "postmatch-callout mb-5" }, icon("trophy", 15), h("span", {}, "New personal best for ", difficulty, "."))
      : null,
    autoSaved ? h("p", { class: "label center mb-4", style: { color: "var(--ok)" } }, "Solution saved automatically") : null,
    h("div", { class: "row gap-3 wrapflex result-actions" },
      h("button", { class: "btn btn-primary", onClick: o.onAgain }, "Run again ▸"),
      autoSaved && meUid ? h("button", { class: "btn", onClick: () => navigate(`/analysis/${encodeURIComponent(meUid)}/${encodeURIComponent(problem.archetypeId)}`) }, icon("bulb", 14), "Analyze solution") : null,
      h("button", { class: "btn", onClick: o.onHome }, "Back to arena")),
  );
}

function stat(v, k, color) {
  return h("div", { class: "stat" },
    h("div", { class: "v", style: color ? { color } : {} }, v),
    h("div", { class: "k" }, k));
}

async function saveAttempt(profile, problem, submission, { mode, completed }) {
  if (!profile || profile.isGuest || profile.isAnonymous) {
    throw new Error("Sign in to save solutions to your profile.");
  }
  if (!submission?.code?.trim()) throw new Error("There is no submitted code to save.");
  return saveSolution(profile, problem, {
    code: submission.code,
    language: submission.language,
    timeMs: submission.timeMs ?? 0,
    mode,
    completed,
    reason: submission.reason ?? null,
    testsPassed: submission.passed ?? 0,
    totalTests: problem.testCases?.length ?? 0,
  });
}

async function autoSaveAttempt(profile, problem, submission, { mode, completed }) {
  if (!profile || profile.isGuest || profile.isAnonymous || !String(submission?.code || "").trim()) return false;
  // Keep a same-session handoff as well as the private save. This guarantees
  // post-match analysis access for an analysis-only generated Burst even while
  // the asynchronous Firestore write is still completing.
  cacheAnalysisAttempt(profile, problem, { ...submission, passed: completed ? problem.testCases?.length ?? submission?.passed : submission?.passed }, mode);
  try {
    await saveAttempt(profile, problem, submission, { mode, completed });
    return true;
  } catch (error) {
    console.error("automatic solution save failed", error);
    return false;
  }
}

function animatedElo(from, to, formatter = (value) => String(Math.round(value))) {
  const value = h("span", { class: "result-elo" }, formatter(from));
  const start = performance.now();
  const duration = 720;
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    value.textContent = formatter(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return value;
}

// ════════════════════════════════════════════════════════════════════════════
// TUTORIAL — an optional guided first puzzle that never affects ELO
// ════════════════════════════════════════════════════════════════════════════
const TUTORIAL_PUZZLE_ID = "B-001-1";

export function offerTutorial(profile = session.profile) {
  if (!profile) return;
  let decided = false;
  const finish = async (start) => {
    if (decided) return;
    decided = true;
    try { await markTutorialComplete(profile); refreshGuest(); } catch {}
    m.close();
    if (start) startTutorial();
  };
  const m = modal(h("div", {},
    h("div", { class: "eyebrow mb-2" }, "// Optional tutorial"),
    h("h2", { class: "head mb-3" }, "Learn the arena in one easy puzzle"),
    h("p", { class: "body-text mb-5" },
      "Try a short Bronze problem with no ELO at stake. You can run code, inspect tests, and submit a solution before starting your placement games."),
    h("div", { class: "row gap-3 wrapflex" },
      h("button", { class: "btn btn-primary grow", onClick: () => finish(true) }, "Start tutorial ▸"),
      h("button", { class: "btn grow", onClick: () => finish(false) }, "Skip for now")),
  ), { wide: true, onClose: () => { if (!decided) finish(false); } });
}

export async function startTutorial() {
  const player = session.profile;
  let problem;
  try { problem = await problemById("Bronze", TUTORIAL_PUZZLE_ID); }
  catch (error) { console.error(error); }
  if (!problem) { toast("The tutorial puzzle could not be loaded.", "err"); return; }

  let settled = false;
  const arena = openArena({
    mode: "tutorial",
    title: "ByteBlitz · Tutorial",
    problem,
    timeLimit: TIME_LIMITS.Bronze ?? 300,
    onStarted: () => setBattlePresence(true),
    onExit: () => { setBattlePresence(false); navigate("/"); },
    onSolved: (result) => finish(true, result),
    onFailed: (result) => finish(false, result),
  });

  async function finish(solved, result) {
    if (settled) return;
    settled = true;
    setBattlePresence(false);
    try { await markTutorialComplete(session.profile); refreshGuest(); } catch {}
    const autoSaved = await autoSaveAttempt(session.profile, problem, result, { mode: "training", completed: solved });
    arena.showResult(h("div", { style: { maxWidth: "520px", width: "100%" } },
      h("div", { class: "eyebrow mb-2" }, "// Tutorial complete"),
      h("h1", { class: "head mb-3", style: { color: solved ? "var(--ok)" : "var(--foreground)" } },
        solved ? "Nice work" : "Tutorial paused"),
      h("p", { class: "mono mb-6", style: { fontSize: "13px", color: "var(--muted-fg)", lineHeight: "1.65" } },
        solved
          ? "You have used the editor, test runner, and judge. Your seven Unranked placement games are ready when you are."
          : "You can return to this tutorial at any time from the arena home."),
      autoSaved ? h("p", { class: "label center mb-4", style: { color: "var(--ok)" } }, "Solution saved automatically") : null,
      h("div", { class: "row gap-3 wrapflex result-actions" },
        h("button", { class: "btn btn-primary", onClick: () => { arena.destroy(); startSolo(); } }, "Start placement ▸"),
        h("button", { class: "btn", onClick: () => arena.exit() }, "Back to arena")),
    ));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// TRAINING — a specific puzzle, timed, with a per-puzzle leaderboard
// ════════════════════════════════════════════════════════════════════════════
export async function startTraining(difficulty, archetypeId) {
  const user = session.profile;

  let problem;
  try {
    problem = await problemById(difficulty, archetypeId);
  } catch (e) {
    toast(e.message, "err");
    return;
  }
  if (!problem) { toast("That puzzle could not be loaded.", "err"); return; }

  const limit = TIME_LIMITS[difficulty] ?? 300;
  let settled = false;

  const arena = openArena({
    mode: "training",
    title: "Training Grounds",
    problem,
        timeLimit: limit,
    onStarted: () => setBattlePresence(true),
    onExit: () => { setBattlePresence(false); navigate("/training"); },

    onSolved: (r) => finish(true, r),
    onFailed: (r) => finish(false, r),
  });

  async function finish(solved, r) {
        if (settled) return;
    settled = true;
    setBattlePresence(false);
    const profile = session.profile;
    let outcome = null;

    let board = [];

    if (profile) {
      try {
        outcome = await recordPuzzleTime(profile, problem, r.timeMs, solved);
        refreshGuest();
        if (!profile.isAnonymous) board = await puzzleLeaderboard(problem.archetypeId, 10);
      } catch (e) {
        console.error(e);
      }
    }

    const autoSaved = await autoSaveAttempt(profile, problem, r, { mode: "training", completed: solved });
    arena.showResult(trainingResultScreen({
      solved, reason: r.reason, timeMs: r.timeMs, problem, outcome, board,
      anon: !profile || profile.isGuest || profile.isAnonymous,
      meUid: profile?.uid, autoSaved,
      onAgain: () => { arena.destroy(); startTraining(difficulty, archetypeId); },
      onBack: () => arena.exit(),
    }));
  }
}

function trainingResultScreen(o) {
  const { solved, reason, timeMs, problem, outcome, board, anon, meUid, autoSaved } = o;
  const myRank = board.findIndex((b) => b.uid === meUid);

  return h("div", { style: { maxWidth: "620px", width: "100%" } },
    h("div", { class: "eyebrow mb-2" }, "// Training result"),
    h("h1", { class: "head mb-2" },
      solved ? h("span", { style: { color: "var(--ok)" } }, "Solved")
             : h("span", { class: "accent" }, reason === "timeout" ? "Time up" : "Ended")),
    h("p", { class: "mono mb-6", style: { fontSize: "13px", color: "var(--muted-fg)" } },
      problem.title, solved ? ` — ${fmtTime(timeMs)}` : ""),

    solved && outcome?.isBest
      ? h("div", { class: "panel mb-5", style: { padding: "12px 16px", borderColor: "hsl(140 70% 50% / .4)" } },
          h("span", { class: "mono", style: { fontSize: "12px", color: "var(--ok)" } },
            outcome.prevBest == null
              ? "★ First clear recorded."
              : `★ New best — ${fmtTime(outcome.prevBest)} → ${fmtTime(timeMs)}.`))
      : null,

    anon
      ? h("div", { class: "empty mb-5" },
          "Signed-out practice is not saved — sign in to appear on puzzle leaderboards and keep your records.")
      : h("div", { class: "panel mb-5" },
          h("div", { class: "panel-head" },
            h("span", { class: "label" }, "// Fastest solves — " + problem.title),
            myRank >= 0 ? h("span", { class: "label" }, "you: #" + (myRank + 1)) : null),
          board.length === 0
            ? h("div", { class: "empty", style: { border: "none" } }, "No recorded solves yet.")
            : h("div", { class: "divide" },
                ...board.map((r, i) => h("div", { class: "lb-row" + (r.uid === meUid ? " me" : ""), style: { gridTemplateColumns: "40px 1fr auto" } },
                  h("span", { class: "rk" }, "#" + (i + 1)),
                  h("span", { class: "nm" }, r.username),
                  h("span", { class: "tnum" }, fmtTime(r.timeMs)))))),

    autoSaved ? h("p", { class: "label center mb-4", style: { color: "var(--ok)" } }, "Solution saved automatically") : null,
    h("div", { class: "row gap-3 wrapflex result-actions" },
      h("button", { class: "btn btn-primary", onClick: o.onAgain }, "Try again ▸"),
      autoSaved && meUid ? h("button", { class: "btn", onClick: () => navigate(`/analysis/${encodeURIComponent(meUid)}/${encodeURIComponent(problem.archetypeId)}`) }, icon("bulb", 14), "Analyze solution") : null,
      h("button", { class: "btn", onClick: o.onBack }, "Training grounds"),
    ),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RANKED DUEL
// ════════════════════════════════════════════════════════════════════════════
export async function findRankedMatch() {
  const user = await requireAccount("play");
  if (!user) return;
  const profile = session.profile;
  if (!profile) {
    toast("Finishing your account setup — try Ranked again in a moment.", "err");
    return;
  }
  if (!isPlaced(profile)) {
    toast(`${placementLeft(profile)} Unranked placement ${placementLeft(profile) === 1 ? "game" : "games"} remaining before Ranked unlocks.`, "err");
    return;
  }

  const me = mm.lobbyPlayer(profile);
  let unsubLobby = null, unsubSelf = null, unsubCount = null;
  let cancelled = false;
  let matched = false;
  let activating = false;
  let pagehideHandler = null;

  const countEl = h("span", { class: "label label-bright" }, "…");
  const windowEl = h("span", { class: "label label-bright" }, "± " + mm.ELO_WINDOW);
  const timeEl = h("span", { class: "mono tnum", style: { fontSize: "28px", fontWeight: "700" } }, "0:00");
  const t0 = Date.now();
  const tick = setInterval(() => {
    const ms = Date.now() - t0;
    const s = Math.floor(ms / 1000);
    timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    windowEl.textContent = mm.windowIsOpen(ms) ? "Anyone" : "± " + mm.currentWindow(ms);
  }, 500);

  const m = modal(h("div", { class: "center" },
    h("div", { class: "eyebrow mb-3" }, "// Ranked matchmaking"),
    h("h2", { class: "head mb-2" }, "Finding an ", h("span", { class: "accent" }, "opponent")),
    h("p", { class: "mono mb-6", style: { fontSize: "12.5px", color: "var(--muted-fg)", lineHeight: "1.6" } },
      `Searching within ±${mm.ELO_WINDOW} rating, widening as you wait. The problem difficulty is set by the lower-rated player.`),
    h("div", { class: "row gap-3", style: { justifyContent: "center" } },
      h("span", { class: "spinner" }), timeEl),
    h("div", { class: "row gap-6 mt-5", style: { justifyContent: "center" } },
      h("span", { class: "row gap-2" }, h("span", { class: "label" }, "In queue"), countEl),
      h("span", { class: "row gap-2" }, h("span", { class: "label" }, "Range"), windowEl)),
    h("button", { class: "btn mt-6", onClick: () => cancel() }, "Cancel search"),
  ), { closable: false });

  function teardown() {
    clearInterval(tick);
    unsubLobby?.(); unsubSelf?.(); unsubCount?.();
    unsubLobby = unsubSelf = unsubCount = null;
    if (pagehideHandler) window.removeEventListener("pagehide", pagehideHandler);
    pagehideHandler = null;
  }

  async function cancel() {
    if (cancelled) return;
    cancelled = true;
    teardown();
    m.close();
    await mm.leaveLobby(me.uid);
  }

  async function onMatched(duelId) {
    if (matched || cancelled || activating) return;
    activating = true;
    try {
      const activated = await mm.activateLobbyDuel(me.uid, duelId);
      if (!activated?.accepted || cancelled) { activating = false; return; }
      // The first player waits in the modal until the second explicitly accepts.
      // Only the transaction that sees both readiness flags can enter the arena.
      if (!activated.ready) { activating = false; return; }
      matched = true;
      teardown();
      m.close();
      enterDuel(duelId, me);
    } catch (error) {
      console.error("match activation failed", error);
      activating = false;
    }
  }

  try {
    await mm.joinLobby(me);
  } catch (e) {
    console.error(e);
    teardown(); m.close();
    toast("Couldn't join the queue. Try again.", "err");
    return;
  }

    unsubCount = mm.watchLobbyCount((n) => { countEl.textContent = String(n); });
  unsubSelf = mm.watchOwnLobbyDoc(me.uid, (entry) => {
    if ((entry?.status === "matched" || entry?.status === "ready") && entry.duelId) onMatched(entry.duelId);
    if (entry?.status === "searching") activating = false;
  });
  unsubLobby = mm.watchLobbyForOpponent(me, (opp, duelId) => onMatched(duelId));

  // Leaving the page while queued shouldn't leave a ghost in the lobby.
  pagehideHandler = () => { if (!matched && !cancelled) mm.leaveLobby(me.uid); };
  window.addEventListener("pagehide", pagehideHandler);

}

/** Enter (or re-enter) a duel by id. `identity` supports signed-out anonymous matches. */
export async function enterDuel(duelId, identity = null) {
  const profile = session.profile;
  const activeIdentity = profile ? mm.lobbyPlayer(profile) : identity;
  if (!activeIdentity?.uid) { navigate("/"); return; }

  let duel;
  try {
    duel = await mm.getDuel(duelId);
  } catch (e) {
    console.error(e);
  }
  if (!duel) { toast("That match no longer exists.", "err"); navigate("/"); return; }

  const playerNum = duel.player1.uid === activeIdentity.uid ? 1
    : duel.player2.uid === activeIdentity.uid ? 2 : 0;
  if (!playerNum) {
    toast("You are not a participant in this duel.", "err");
    navigate("/");
    return;
  }
  const me = playerNum === 1 ? duel.player1 : duel.player2;
  const opponent = playerNum === 1 ? duel.player2 : duel.player1;
  const duelMode = duel.mode === "casual" ? "casual" : "rated";
  if (duel.status === "aborted") {
    toast("This duel was aborted before it could begin.", "err");
    navigate("/");
    return;
  }
  if (duel.status !== "ready" && duel.status !== "complete") {
    toast("This duel is still waiting for both players.", "err");
    navigate("/");
    return;
  }
  // Keep reloads on a duel route so the router restores this exact match rather
  // than leaving an active player on the home page.
  try { history.replaceState(null, "", `#/duel/${encodeURIComponent(duelId)}`); } catch {}

  let problem;
  try {
    if (duel.generatedProblem) problem = duel.generatedProblem;
    else if (duel.problemId) problem = await problemById(duel.difficulty, duel.problemId);
    else problem = await problemForSeed(duel.difficulty, duel.problemSeed);
  } catch (e) {
    toast(e.message, "err");
    navigate("/");
    return;
  }

  // Authored ranked questions unlock in Training Grounds. Generated Bursts
  // remain analysis-only until their own Training Grounds support is added.
  if (!problem.generated) markProblemSeen(profile, problem.archetypeId);

  let latest = duel;
  let arena = null;
  let ended = false;
  let unsub = null;
  let latestSubmission = null;
  let stopDuelPresence = () => {};

  const cleanup = () => {
    unsub?.(); unsub = null;
    stopDuelPresence(); stopDuelPresence = () => {};
  };
  const neutralAbort = async () => {
    if (ended || latest.status === "complete" || latest.status === "aborted") return;
    await mm.abortDuel(duelId, opponent.uid, "disconnect");
  };
  stopDuelPresence = joinDuelPresence(duelId, activeIdentity.uid, opponent.uid, neutralAbort);

  arena = openArena({
    mode: "duel",
    title: duelMode === "rated" ? "Rated Duel" : "Casual Duel",
    problem,
    timeLimit: duel.timeLimit ?? TIME_LIMITS[duel.difficulty] ?? 300,
        startAtMs: duel.startTime,
    onStarted: () => setBattlePresence(true),
    me, opponent,

    externalEnded: () => ended,
        onExit: () => { setBattlePresence(false); cleanup(); navigate("/"); },

    onTestProgress: (n) => mm.reportTestProgress(duelId, playerNum, n),
    onSubmission: (r) => {
      latestSubmission = r;
      mm.recordSubmission(duelId, playerNum, r, activeIdentity.uid);
    },
    onOfferDraw: async () => {
      try { await mm.offerDraw(duelId, profile.uid); toast("Draw offered.", "", 2200); }
      catch { toast("Couldn't send the draw offer.", "err"); }
    },
    onSolved: async (r) => {
      latestSubmission = r;
      try {
        if (profile && !problem.generated && !profile.isGuest && !profile.isAnonymous) {
          await recordPuzzleTime(profile, problem, r.timeMs, true);
        }
        await mm.submitSolve(duelId, playerNum, r.timeMs / 1000, r);
      } catch (e) { console.error(e); }
    },
    onForcedEnd: (r) => { latestSubmission = r; },
    onFailed: async (r) => {
      latestSubmission = r;
      if (r.reason === "abandoned") {
        await settleVoluntaryWithdrawal({ duelId, profile, opponent, duelMode, problem, submission: r });
        await mm.abortDuel(duelId, activeIdentity.uid, "withdrawal");
      } else if (r.reason === "timeout") {
        try { await mm.resolveTimeout(duelId, latest); } catch {}
      } else {
        try { await mm.forfeitDuel(duelId, activeIdentity.uid, latest); } catch {}
      }
    },
  });

  unsub = mm.watchDuel(duelId, async (d) => {
    if (!d) {
      ended = true;
      setBattlePresence(false);
      cleanup();
      arena.showResult(simpleEnd("Match unavailable", "This duel was removed before it could finish.", () => arena.exit()));
      return;
    }
    latest = d;

    if (d.status === "aborted") {
      ended = true;
      setBattlePresence(false);
      cleanup();
      arena.forceEnd?.("aborted", "");
      const withdrew = d.abortedReason === "withdrawal";
      const mine = d.abortedBy === activeIdentity.uid;
      const message = withdrew
        ? (mine ? "You abandoned this duel. Your ELO was adjusted; your opponent received no ELO."
          : "Your opponent aborted this duel. No ELO was awarded or lost for you.")
        : (mine ? "Your connection ended before the duel could finish. No ELO changed."
          : "Your opponent disconnected or reloaded and did not return. No ELO changed.");
      arena.showResult(simpleEnd("Match aborted", message, () => { arena.exit(); }));
      return;
    }

    // Draw offer from the opponent
    if (d.drawRequestBy && d.drawRequestBy !== profile.uid && d.status !== "complete" && !arena.drawPrompted) {
      arena.drawPrompted = true;
      const ok = await confirmModal("Draw offer", `${opponent.username} is offering a draw. Both of you keep most of your rating.`, "Accept draw");
      arena.drawPrompted = false;
      if (ok) { try { await mm.acceptDraw(duelId); } catch {} }
      else { try { await mm.declineDraw(duelId); } catch {} }
      return;
    }

    // Opponent progress indicator
    const oppTests = playerNum === 1 ? d.p2BestTests : d.p1BestTests;
    if (oppTests > 0) arena.setOpponentStatus(`${oppTests}/${TESTS_PER_PROBLEM} tests`);

    if (d.status === "complete" && !ended) {
            ended = true;
      setBattlePresence(false);
      cleanup();
      arena.forceEnd?.("complete", "");

      await settleDuel(d, profile, activeIdentity.uid, playerNum, me, opponent, arena, problem, duelMode, latestSubmission);
    }

    if (d.newDuelId && d.newDuelId !== duelId) {
      cleanup();
      arena.destroy();
      enterDuel(d.newDuelId);
    }
  });
}

async function settleDuel(d, profile, actorUid, playerNum, me, opponent, arena, problem, duelMode, submission) {
  const iWon = d.winner === actorUid;
  const isDraw = d.winner === null;
  const result = isDraw ? "draw" : iWon ? "win" : "loss";
  const winBy = d.winBy ?? "solve";

  const myTime = playerNum === 1 ? d.p1SolveTime : d.p2SolveTime;
  const oppTime = playerNum === 1 ? d.p2SolveTime : d.p1SolveTime;
  const myTests = playerNum === 1 ? (d.p1BestTests ?? 0) : (d.p2BestTests ?? 0);
  const totalTests = problem.testCases?.length ?? TESTS_PER_PROBLEM;

  let res = null;
  if (profile && duelMode === "rated" && !d.anonymousPairing && !applied.has(d.id)) {
    applied.add(d.id);
    const [myScore] = scoresFor(winBy, iWon);
    const score = isDraw ? 0.5 : myScore;
    try {
      res = await applyDuelResult(
        profile.uid, profile,
        { uid: opponent.uid, username: opponent.username, rating: opponent.rating, rd: opponent.rd },
        score, result, {
          duelId: d.id, difficulty: d.difficulty, archetypeId: problem.archetypeId,
          puzzleTitle: problem.title, category: problem.category ?? null, winBy,
          testsPassed: myTests, totalTests,
          timeMs: myTime ? Math.round(myTime * 1000) : null,
          submissions: Number(submission?.submissionCount || 0),
          runtimeMs: Number.isFinite(Number(submission?.runtimeMs)) ? Math.round(Number(submission.runtimeMs)) : null,
          memoryBytes: Number.isFinite(Number(submission?.memoryBytes)) ? Math.round(Number(submission.memoryBytes)) : null,
        }
      );
    } catch (e) {
      console.error("rating update failed", e);
      toast("Result saved, but your rating couldn't be updated.", "err");
    }
  }

  // Remove the ready lobby record only after the duel reaches a terminal state.
  // Before that it is the handshake's evidence that both players accepted.
  try { await mm.leaveLobby(actorUid); } catch {}

  const autoSaved = await autoSaveAttempt(profile, problem, submission, {
    mode: "ranked", completed: !!submission && submission.passed >= (problem.testCases?.length ?? TESTS_PER_PROBLEM),
  });
  arena.showResult(duelResultScreen({
    result, winBy, res, me, opponent, myTime, oppTime, problem, duelMode,
    submission, duel: d, playerNum, autoSaved,
    onRematch: async () => {
      try {
        const meP = session.profile ? mm.lobbyPlayer(session.profile) : activeIdentity;
        const newId = await mm.acceptRematch(d.id, meP, opponent, duelMode);
        arena.destroy();
        enterDuel(newId, meP);
      } catch (e) {
        console.error(e);
        toast("Couldn't start a rematch.", "err");
      }
    },
    onHome: () => { mm.deleteDuel(d.id); arena.exit(); },
  }));
}

async function settleVoluntaryWithdrawal({ duelId, profile, opponent, duelMode, problem, submission }) {
  if (!profile || duelMode !== "rated" || applied.has(duelId)) return;
  applied.add(duelId);
  try {
    const res = await applyDuelResult(
      profile.uid, profile,
      { uid: opponent.uid, username: opponent.username, rating: opponent.rating, rd: opponent.rd },
      0, "loss", {
        duelId,
        difficulty: problem.difficulty,
        archetypeId: problem.archetypeId,
        puzzleTitle: problem.title,
        category: problem.category ?? null,
        winBy: "withdrawal",
        testsPassed: Number(submission?.passed || 0),
        totalTests: problem.testCases?.length ?? TESTS_PER_PROBLEM,
        timeMs: Number.isFinite(Number(submission?.timeMs)) ? Number(submission.timeMs) : null,
        submissions: Number(submission?.submissionCount || 0),
        runtimeMs: Number.isFinite(Number(submission?.runtimeMs)) ? Number(submission.runtimeMs) : null,
        memoryBytes: Number.isFinite(Number(submission?.memoryBytes)) ? Number(submission.memoryBytes) : null,
      },
    );
    Object.assign(profile, { rating: res.rating, rd: res.rd, vol: res.vol });
  } catch (error) {
    console.error("withdrawal rating update failed", error);
  }
  await autoSaveAttempt(profile, problem, submission, { mode: "ranked", completed: false });
}

function duelResultScreen(o) {
  const { result, winBy, res, me, opponent, myTime, oppTime, duelMode, submission, duel, playerNum, problem, autoSaved } = o;
  const delta = res?.delta ?? (res ? Math.round(res.rating) - res.before : 0);
  const mineFromDuel = playerNum === 1 ? duel?.p1Submission : duel?.p2Submission;
  const opponentSubmission = playerNum === 1 ? duel?.p2Submission : duel?.p1Submission;
  const mine = { ...(mineFromDuel || {}), ...(submission || {}) };
  const totalTests = problem?.testCases?.length ?? TESTS_PER_PROBLEM;
  const myTests = Number(mine.passed ?? (playerNum === 1 ? duel?.p1BestTests : duel?.p2BestTests) ?? 0);
  const opponentTests = Number(opponentSubmission?.passed ?? (playerNum === 1 ? duel?.p2BestTests : duel?.p1BestTests) ?? 0);

  const headline = result === "draw" ? "Draw"
    : result === "win" ? (winBy === "forfeit" ? "Opponent resigned" : "Victory")
    : (winBy === "forfeit" ? "You resigned" : "Defeat");
  const color = result === "draw" ? "var(--warn)"
    : result === "win" ? "var(--ok)" : "var(--primary)";
  const byline = {
    solve: "First to pass every test.",
    testcases: "Decided on hidden tests passed when the clock ran out.",
    forfeit: "Ended by resignation.",
    draw: "Agreed draw.",
    tiebreak: "Neither player pulled ahead.",
  }[winBy] ?? "";
  const compare = h("button", {
    class: "btn",
    disabled: !String(mine.code || "").trim() && !String(opponentSubmission?.code || "").trim(),
    title: opponentSubmission?.code ? "View both submitted solutions" : "No opponent submission was saved",
    onClick: () => openDuelCodeComparison(me, opponent, mine, opponentSubmission),
  }, "Compare code");

  return h("div", { class: "postmatch-result" },
    h("div", { class: "eyebrow mb-2" }, duelMode === "rated" ? "// Rated duel complete" : "// Casual duel complete"),
    h("h1", { class: "head mb-2", style: { color } }, headline),
    h("p", { class: "mono mb-5", style: { fontSize: "12.5px", color: "var(--muted-fg)" } }, byline),
    h("div", { class: "postmatch-problem mb-5" },
      h("span", { class: "label" }, "Problem"),
      h("span", { class: "mono" }, problem?.title || "Match problem"),
      h("span", { class: "label" }, problem?.difficulty || "")),
    h("div", { class: "postmatch-scoreboard mb-5" },
      postmatchPlayer(me.username, "You", myTime, myTests, totalTests, me.rating, true),
      postmatchPlayer(opponent.username, "Opponent", oppTime, opponentTests, totalTests, opponent.rating, false)),
    h("div", { class: "stats postmatch-metrics mb-5" },
      stat(myTime != null ? fmtTime(myTime * 1000) : "—", "Time to solve"),
      stat(String(mine.submissionCount || 0), "Submissions"),
      stat(formatRuntime(mine.runtimeMs), "Test runtime"),
      stat(formatMemory(mine.memoryBytes), "Memory delta"),
      stat(`${myTests}/${totalTests}`, "Tests passed")),
    res
      ? h("div", { class: "center postmatch-elo mb-5" },
          h("div", { class: "label mb-2" }, "// ELO change"),
          h("div", { class: "row gap-3", style: { justifyContent: "center", alignItems: "baseline" } },
            h("span", { class: "mono dim tnum", style: { fontSize: "20px" } }, res.before),
            h("span", { class: "dim" }, "→"),
            animatedElo(res.before, res.rating, (value) => displayRating(value, res.rd)),
            h("span", { class: "mono tnum " + (delta >= 0 ? "delta-up" : "delta-down"), style: { fontSize: "18px" } },
              (delta >= 0 ? "+" : "") + delta)),
          res.rd > 110
            ? h("p", { class: "mono mt-3", style: { fontSize: "11px", color: "var(--muted)" } },
                "The ? means your rating is still provisional — it settles as you play.")
            : null)
      : h("p", { class: "mono center mb-5", style: { fontSize: "12px", color: "var(--muted-fg)" } },
          "Casual duel — no ELO was changed."),
    autoSaved ? h("p", { class: "label center mb-4", style: { color: "var(--ok)" } }, "Solution saved automatically") : null,
    h("div", { class: "row gap-3 wrapflex result-actions" },
      compare,
      h("button", { class: "btn", disabled: !duel?.id, onClick: () => navigate(`/analysis/duel/${encodeURIComponent(duel.id)}`) }, icon("bulb", 14), "Analyze match"),
      h("button", { class: "btn btn-primary", onClick: o.onRematch }, "Rematch ▸"),
      h("button", { class: "btn", onClick: o.onHome }, "Back to arena"),
    ),
  );
}

function postmatchPlayer(username, label, solveSecs, passed, total, rating, isMe) {
  return h("div", { class: "postmatch-player" + (isMe ? " me" : "") },
    h("span", { class: "label" }, label),
    h("strong", { class: "mono" }, username || "Player"),
    h("span", { class: "mono tnum" }, solveSecs != null ? fmtTime(solveSecs * 1000) : "—"),
    h("span", { class: "label" }, `${passed}/${total} tests · ${Math.round(rating ?? 0)} ELO`));
}

function formatRuntime(ms) {
  return Number.isFinite(Number(ms)) ? `${Math.round(Number(ms))} ms` : "—";
}

function formatMemory(bytes) {
  if (!Number.isFinite(Number(bytes))) return "N/A";
  const value = Number(bytes);
  return value < 1024 * 1024 ? `${Math.round(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function openDuelCodeComparison(me, opponent, mine = {}, theirs = {}) {
  const codePane = (label, player, data, accent) => h("section", { class: "postmatch-code-pane" },
    h("div", { class: "between gap-2 postmatch-code-head" },
      h("div", {}, h("span", { class: "label" }, label), h("div", { class: "mono mt-1", style: { fontWeight: "700", fontSize: "13px" } }, player.username || "Player")),
      h("span", { class: "pill", style: { color: accent } }, data.language || "—")),
    h("pre", { class: "solution-code postmatch-code" }, data.code || "// No submitted code was saved for this player."));
  modal(h("div", { class: "postmatch-comparison" },
    h("div", { class: "eyebrow mb-2" }, "// Post-match code comparison"),
    h("h2", { class: "head mb-4" }, "Compare submissions"),
    h("div", { class: "postmatch-code-grid" },
      codePane("Your submission", me, mine, "var(--ok)"),
      codePane("Opponent submission", opponent, theirs || {}, "var(--primary)"))), { wide: true, className: "modal-postmatch-comparison" });
}

function simpleEnd(title, body, onBack) {
  return h("div", { style: { maxWidth: "460px", width: "100%" }, class: "center" },
    h("div", { class: "eyebrow mb-2" }, "// Match"),
    h("h1", { class: "head mb-3" }, title),
    h("p", { class: "mono mb-6", style: { fontSize: "13px", color: "var(--muted-fg)" } }, body),
    h("button", { class: "btn btn-primary", onClick: onBack }, "Back to arena"));
}

// ── Friend duels ────────────────────────────────────────────────────────────
function chooseDuelMode(profile, friend) {
  return new Promise((resolve) => {
    let decided = false;
    const placed = isPlaced(profile);
    const finish = (mode) => {
      if (decided) return;
      decided = true;
      m.close();
      resolve(mode);
    };
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Challenge ", friend.username),
      h("h2", { class: "head mb-3" }, "Choose duel type"),
      h("p", { class: "body-text mb-5" },
        "Casual duels are always available and never change ELO. Rated duels use the Ranked ladder and require completed Unranked placement."),
      h("div", { class: "stack gap-3" },
        h("button", { class: "btn btn-primary btn-block", onClick: () => finish("casual") },
          "Casual duel", h("span", { class: "label", style: { marginLeft: "8px" } }, "NO ELO")),
        h("button", {
          class: "btn btn-block", disabled: !placed,
          title: placed ? "Rated duel" : `${placementLeft(profile)} placement games remaining`,
          onClick: () => finish("rated"),
        }, "Rated duel", h("span", { class: "label", style: { marginLeft: "8px" } }, placed ? "RANKED ELO" : "LOCKED"))),
      !placed
        ? h("p", { class: "label mt-4", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.55" } },
            `${placementLeft(profile)} Unranked placement ${placementLeft(profile) === 1 ? "game" : "games"} remaining before Rated unlocks.`)
        : null,
    ), { wide: true, onClose: () => { if (!decided) resolve(null); } });
  });
}

export async function challengeFriend(friend) {
  const user = await requireAccount("gate");
  if (!user) return;
  const profile = session.profile;
  const mode = await chooseDuelMode(profile, friend);
  if (!mode) return;

  let challengeId;
  try {
    challengeId = await (await import("./store.js")).createChallenge(profile, friend, mode);
  } catch (e) {
    console.error(e);
    toast("Couldn't send the challenge.", "err");
    return;
  }

  let unsub = null;
  let done = false;

  const m = modal(h("div", { class: "center" },
    h("div", { class: "eyebrow mb-3" }, `// ${mode === "rated" ? "Rated" : "Casual"} friend duel`),
    h("h2", { class: "head mb-2" }, "Waiting for ", h("span", { class: "accent" }, friend.username)),
    h("p", { class: "mono mb-6", style: { fontSize: "12px", color: "var(--muted-fg)" } },
      `They'll get a notification. This ${mode} duel starts the moment they accept.`),
    h("div", { class: "row gap-3", style: { justifyContent: "center" } }, h("span", { class: "spinner" })),
    h("button", { class: "btn mt-6", onClick: () => cancel() }, "Cancel challenge"),
  ), { closable: false });

  async function cancel() {
    if (done) return;
    done = true;
    unsub?.();
    m.close();
    try { await setChallengeStatus(challengeId, "cancelled"); } catch {}
  }

  const { watchChallenge } = await import("./store.js");
  unsub = watchChallenge(challengeId, (c) => {
    if (done) return;
    if (c.status === "accepted" && c.duelId) {
      done = true; unsub?.(); m.close();
      enterDuel(c.duelId);
    } else if (c.status === "declined") {
      done = true; unsub?.(); m.close();
      toast(`${friend.username} declined.`, "err");
    }
  });
}

export async function acceptChallenge(challengeId) {
  const profile = session.profile;
  if (!profile) return;

  const { getChallenge } = await import("./store.js");
  const c = await getChallenge(challengeId);
  if (!c || c.status !== "pending") { toast("That challenge has expired.", "err"); return; }

  const from = await getProfile(c.fromUid);
  if (!from) { toast("That player is no longer available.", "err"); return; }

  const mode = c.mode === "rated" ? "rated" : "casual";
  if (mode === "rated" && (!isPlaced(profile) || !isPlaced(from))) {
    toast("Rated duels unlock only after both players finish Unranked placement.", "err");
    return;
  }

  const duelId = `${[profile.uid, from.uid].sort().join("__")}__c${Date.now()}`;
  try {
    await mm.createDuel(mm.lobbyPlayer(profile), mm.lobbyPlayer(from), duelId, false, mode);
    await setChallengeStatus(challengeId, "accepted", duelId);
    enterDuel(duelId);
  } catch (e) {
    console.error(e);
    toast("Couldn't start the duel.", "err");
  }
}

export async function declineChallenge(challengeId) {
  try { await setChallengeStatus(challengeId, "declined"); } catch {}
}
