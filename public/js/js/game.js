// ============================================================================
// Game controllers — solo runs, training puzzles, ranked duels.
//
// Each controller owns the lifecycle around an Arena: picking the problem,
// listening for the opponent, and writing the result to Firestore exactly once.
// ============================================================================

import { h, clear, modal, toast, fmtTime, confirmModal } from "./ui.js";
import { openArena } from "./arena.js";
import {
  randomProblem, problemForSeed, problemById, TESTS_PER_PROBLEM,
} from "./problems.js";
import {
  TIME_LIMITS, tierFor, scoresFor, displayRating, displayPlacementRating, PAR_TIME,
  isPlaced, placementLeft, PLACEMENT_GAMES,
} from "./glicko.js";
import {
  applySoloResult, applyDuelResult, recordPuzzleTime, puzzleLeaderboard,
  saveCompletedSolution, getProfile, setChallengeStatus, markProblemSeen, markTutorialComplete, setPresence,

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
export async function startSolo(preset) {
  const player = session.profile;

  // No difficulty picker: unranked is a measurement, and you don't get to pick
  // how hard the thing measuring you is. The tier comes from your unranked
  // rating, the same way a duel's tier comes from the players' ratings.
  const difficulty = preset || tierFor(session.profile?.soloRating ?? 1500).name;
  const placing = !!player && !isPlaced(player);

  let problem;
  try {
    problem = await randomProblem(difficulty);
  } catch (e) {
    toast(e.message, "err");
    return;
  }

  // Meeting a problem in a real run is what reveals it in Training Grounds.
  markProblemSeen(session.profile, problem.archetypeId);

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
        if (solved) {
          await saveCompletedSolution(profile, problem, {
            code: r.code, language: r.language, timeMs: r.timeMs, mode: "unranked",
          });
        }
        refreshGuest();
      } catch (e) {
        console.error(e);
        toast("Couldn't save your result.", "err");
      }
    }

    arena.showResult(soloResultScreen({
      solved, reason: r.reason, timeMs: r.timeMs, limit, difficulty, problem, res,
      placement: placing,
      signedOut: !profile,
      onAgain: () => { arena.destroy(); startSolo(); },
      onHome: () => arena.exit(),
    }));
  }
}

function soloResultScreen(o) {
  const { solved, reason, timeMs, difficulty, problem, res, placement, signedOut } = o;
  const delta = res ? Math.round(res.rating) - res.before : 0;
  const par = PAR_TIME[difficulty];

  return h("div", { style: { maxWidth: "560px", width: "100%" } },
    h("div", { class: "eyebrow mb-2" }, placement ? "// Unranked placement complete" : "// Unranked run complete"),
    h("h1", { class: "head mb-2" },
      solved ? h("span", { style: { color: "var(--ok)" } }, "Solved")
             : h("span", { class: "accent" }, reason === "neutralExit" ? "Run paused" : reason === "left" ? "Resigned" : reason === "resigned" ? "Resigned" : "Time up")),
    h("p", { class: "mono mb-6", style: { fontSize: "13px", color: "var(--muted-fg)" } },
      signedOut
        ? `${problem.title} — signed-out runs are practice only and do not affect ELO.`
        : solved
          ? `${problem.title} — ${fmtTime(timeMs)}${par ? ` (par ${par}s)` : ""}`
          : reason === "neutralExit"
          ? "You left the arena, so this Unranked run was not recorded and your ELO is unchanged."
          : `${problem.title} — better luck next run.`),

    h("div", { class: "stats mb-6" },
      stat(solved ? fmtTime(timeMs) : "—", "Your time"),
      stat(par ? par + "s" : "—", "Par time"),
      stat(res ? displayPlacementRating(res.rating, res.rd, { placementGames: res.placementGames }) : "—", "Unranked ELO"),
      stat(res ? (delta >= 0 ? "+" : "") + delta : "0", res ? "Change" : "No ELO change", res && delta >= 0 ? "var(--ok)" : res ? "var(--primary)" : "var(--muted)"),
    ),

    placement && res
      ? h("div", { class: "panel mb-6", style: { padding: "12px 16px", borderColor: "hsl(var(--primary-raw) / .45)" } },
          h("div", { class: "between gap-3" },
            h("span", { class: "mono", style: { fontSize: "12px", color: "var(--muted-fg)" } },
              res.placementComplete ? "Placement complete — Ranked is unlocked." : `${PLACEMENT_GAMES - res.placementGames} placement ${PLACEMENT_GAMES - res.placementGames === 1 ? "game" : "games"} remaining.`),
            h("span", { class: "label", style: { color: "var(--primary)" } }, `Confidence ${res.placementConfidence}/10`)),
          h("div", { class: "bar mt-3" }, h("i", { style: { width: `${res.placementConfidence * 10}%`, background: "var(--primary)" } })))
      : null,

    res?.newRecord
      ? h("div", { class: "panel mb-6", style: { padding: "12px 16px", borderColor: "hsl(140 70% 50% / .4)" } },
          h("span", { class: "mono", style: { fontSize: "12px", color: "var(--ok)" } },
            "★ New personal best for ", difficulty, "."))
      : null,

    h("div", { class: "row gap-3 wrapflex" },
      h("button", { class: "btn btn-primary", onClick: o.onAgain }, "Run again ▸"),
      h("button", { class: "btn", onClick: o.onHome }, "Back to arena"),
    ),
  );
}

function stat(v, k, color) {
  return h("div", { class: "stat" },
    h("div", { class: "v", style: color ? { color } : {} }, v),
    h("div", { class: "k" }, k));
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
    arena.showResult(h("div", { style: { maxWidth: "520px", width: "100%" } },
      h("div", { class: "eyebrow mb-2" }, "// Tutorial complete"),
      h("h1", { class: "head mb-3", style: { color: solved ? "var(--ok)" : "var(--foreground)" } },
        solved ? "Nice work" : "Tutorial paused"),
      h("p", { class: "mono mb-6", style: { fontSize: "13px", color: "var(--muted-fg)", lineHeight: "1.65" } },
        solved
          ? "You have used the editor, test runner, and judge. Your seven Unranked placement games are ready when you are."
          : "You can return to this tutorial at any time from the arena home."),
      h("div", { class: "row gap-3 wrapflex" },
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
        if (solved) {
          await saveCompletedSolution(profile, problem, {
            code: r.code, language: r.language, timeMs: r.timeMs, mode: "training",
          });
        }
        refreshGuest();
        if (!profile.isAnonymous) board = await puzzleLeaderboard(problem.archetypeId, 10);
      } catch (e) {
        console.error(e);
      }
    }

    arena.showResult(trainingResultScreen({
      solved, reason: r.reason, timeMs: r.timeMs, problem, outcome, board,
      anon: !profile || profile.isAnonymous,
      meUid: profile?.uid,
      onAgain: () => { arena.destroy(); startTraining(difficulty, archetypeId); },
      onBack: () => arena.exit(),
    }));
  }
}

function trainingResultScreen(o) {
  const { solved, reason, timeMs, problem, outcome, board, anon, meUid } = o;
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

    h("div", { class: "row gap-3 wrapflex" },
      h("button", { class: "btn btn-primary", onClick: o.onAgain }, "Try again ▸"),
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

  let problem;
  try {
    problem = await problemForSeed(duel.difficulty, duel.problemSeed);
  } catch (e) {
    toast(e.message, "err");
    navigate("/");
    return;
  }

  // Ranked counts for discovery too — the puzzle is named in Training Grounds
  // from here on.
  markProblemSeen(profile, problem.archetypeId);

  let latest = duel;
  let arena = null;
  let ended = false;
  let unsub = null;

  const cleanup = () => { unsub?.(); unsub = null; };

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
    onOfferDraw: async () => {
      try { await mm.offerDraw(duelId, profile.uid); toast("Draw offered.", "", 2200); }
      catch { toast("Couldn't send the draw offer.", "err"); }
    },
    onSolved: async (r) => {
      try {
        if (profile) {
          await saveCompletedSolution(profile, problem, {
            code: r.code, language: r.language, timeMs: r.timeMs, mode: "ranked",
          });
        }
        await mm.submitSolve(duelId, playerNum, r.timeMs / 1000, latest);
      } catch (e) { console.error(e); }
    },
    onFailed: async (r) => {
      if (r.reason === "timeout") {
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
      arena.showResult(simpleEnd("Match cancelled", d.abortedBy === activeIdentity.uid
        ? "You left before the match began."
        : "Your opponent left before the match began.", () => { arena.exit(); }));
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

      await settleDuel(d, profile, activeIdentity.uid, playerNum, me, opponent, arena, problem, duelMode);
    }

    if (d.newDuelId && d.newDuelId !== duelId) {
      cleanup();
      arena.destroy();
      enterDuel(d.newDuelId);
    }
  });
}

async function settleDuel(d, profile, actorUid, playerNum, me, opponent, arena, problem, duelMode) {
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
          duelId: d.id, difficulty: d.difficulty, winBy,
          testsPassed: myTests, totalTests,
          timeMs: myTime ? Math.round(myTime * 1000) : null,
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

    arena.showResult(duelResultScreen({
    result, winBy, res, me, opponent, myTime, oppTime, problem, duelMode,
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

function duelResultScreen(o) {
  const { result, winBy, res, me, opponent, myTime, oppTime, duelMode } = o;
  const delta = res?.delta ?? (res ? Math.round(res.rating) - res.before : 0);

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

  return h("div", { style: { maxWidth: "560px", width: "100%" } },
    h("div", { class: "eyebrow mb-2" }, duelMode === "rated" ? "// Rated duel" : "// Casual duel"),
    h("h1", { class: "head mb-2", style: { color } }, headline),
    h("p", { class: "mono mb-6", style: { fontSize: "12.5px", color: "var(--muted-fg)" } }, byline),

    h("div", { class: "panel mb-6" },
      h("div", { class: "lb-row", style: { gridTemplateColumns: "1fr auto auto" } },
        h("span", { class: "nm" }, me.username, " ", h("span", { class: "label" }, "(you)")),
        h("span", { class: "tnum dim" }, myTime != null ? fmtTime(myTime * 1000) : "—"),
        h("span", { class: "tnum" }, Math.round(me.rating))),
      h("div", { class: "lb-row", style: { gridTemplateColumns: "1fr auto auto", borderTop: "1px solid var(--border)" } },
        h("span", { class: "nm" }, opponent.username),
        h("span", { class: "tnum dim" }, oppTime != null ? fmtTime(oppTime * 1000) : "—"),
        h("span", { class: "tnum" }, Math.round(opponent.rating)))),

    res
      ? h("div", { class: "center mb-6" },
          h("div", { class: "label mb-2" }, "// Your rating"),
          h("div", { class: "row gap-3", style: { justifyContent: "center", alignItems: "baseline" } },
            h("span", { class: "mono dim tnum", style: { fontSize: "20px" } }, res.before),
            h("span", { class: "dim" }, "→"),
            h("span", { class: "result-elo" }, displayRating(res.rating, res.rd)),
            h("span", { class: "mono tnum " + (delta >= 0 ? "delta-up" : "delta-down"), style: { fontSize: "18px" } },
              (delta >= 0 ? "+" : "") + delta)),
          res.rd > 110
            ? h("p", { class: "mono mt-3", style: { fontSize: "11px", color: "var(--muted)" } },
                "The ? means your rating is still provisional — it settles as you play.")
            : null)
      : duelMode === "casual"
        ? h("p", { class: "mono center mb-6", style: { fontSize: "12px", color: "var(--muted-fg)" } },
            "Casual duel — no ELO was changed.")
        : null,

    h("div", { class: "row gap-3 wrapflex" },
      h("button", { class: "btn btn-primary", onClick: o.onRematch }, "Rematch ▸"),
      h("button", { class: "btn", onClick: o.onHome }, "Back to arena"),
    ),
  );
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
