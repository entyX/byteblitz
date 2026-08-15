// ============================================================================
// Ranked matchmaking — Firestore lobby + duel documents.
//
// Both clients watch the lobby. The player who joined first (uid breaks ties)
// is the one who writes the duel document, so two snapshots firing at once
// can't produce two duels with different problem seeds.
// ============================================================================

import {
  db, doc, setDoc, deleteDoc, updateDoc, collection, onSnapshot,
  serverTimestamp, getDoc, runTransaction,
} from "./firebase.js";
import { tierFor, TIME_LIMITS } from "./glicko.js";

// Both clients need to fetch the problem set and boot a Python runtime before
// the shared clock starts, and that clock waits for nobody.
const COUNTDOWN_MS = 12000;

export function lobbyPlayer(profile) {
  return {
    uid: profile.uid,
    username: profile.username,
    rating: Math.round(profile.rating ?? 1500),
    rd: Math.round(profile.rd ?? 350),
    vol: profile.vol ?? 0.06,
    gamesPlayed: profile.gamesPlayed ?? 0,
    joinedAt: Date.now(),
  };
}

export async function joinLobby(player) {
  await setDoc(doc(db, "matchmaking_lobby", player.uid), {
    ...player, status: "searching", duelId: null, matchedWith: null,
  });
}

export async function leaveLobby(uid) {
  if (!uid) return;
  const mine = doc(db, "matchmaking_lobby", uid);
  try {
    await runTransaction(db, async (tx) => {
      const mineSnap = await tx.get(mine);
      if (!mineSnap.exists()) return;
      const mineData = mineSnap.data();
      const duelId = mineData.duelId;

      // A cancellation that races a successful claim must neutralize the newly
      // created duel and put the other player back into a real search state.
      if (mineData.status === "matched" && duelId && mineData.matchedWith) {
        const duelRef = doc(db, "duels", duelId);
        const otherRef = doc(db, "matchmaking_lobby", mineData.matchedWith);
        const [duelSnap, otherSnap] = await Promise.all([tx.get(duelRef), tx.get(otherRef)]);
        if (duelSnap.exists() && duelSnap.data().status === "waiting") {
          tx.update(duelRef, { status: "aborted", abortedBy: uid, abortedAt: Date.now() });
          if (otherSnap.exists()) {
            const other = otherSnap.data();
            if (other.status === "matched" && other.duelId === duelId) {
              tx.update(otherRef, { status: "searching", duelId: null, matchedWith: null, joinedAt: Date.now() });
            }
          }
        }
      }
      tx.delete(mine);
    });
  } catch { /* cancellation is best-effort; the local search is still stopped */ }
}

/** Watch the entire lobby document; callers decide how to handle each state. */
export function watchOwnLobbyDoc(uid, cb) {
  return onSnapshot(doc(db, "matchmaking_lobby", uid), (snap) =>
    cb(snap.exists() ? { uid: snap.id, ...snap.data() } : null));
}

/**
 * Lock a claimed duel before leaving the lobby. Once a duel is ready, a later
 * queue cancel cannot abort it; only the arena's normal forfeit flow applies.
 */
export async function activateLobbyDuel(uid, duelId) {
  const lobbyRef = doc(db, "matchmaking_lobby", uid);
  const duelRef = doc(db, "duels", duelId);
  return runTransaction(db, async (tx) => {
    const [lobbySnap, duelSnap] = await Promise.all([tx.get(lobbyRef), tx.get(duelRef)]);
    if (!duelSnap.exists()) return false;
    const duel = duelSnap.data();
    if (duel.status === "aborted" || duel.status === "complete") return false;
    if (duel.status === "waiting") tx.update(duelRef, { status: "ready", activatedAt: Date.now() });
    if (lobbySnap.exists() && lobbySnap.data().duelId === duelId) tx.delete(lobbyRef);
    return true;
  });
}

export function watchLobbyCount(cb) {
  return onSnapshot(collection(db, "matchmaking_lobby"), (snap) =>
    cb(snap.docs.filter((d) => d.data().status === "searching").length)
  );
}

// Ranked pairs people of similar strength: the search opens at ±100 rating and
// widens a step every WIDEN_EVERY_MS so nobody is stuck forever on a quiet
// night. Past MAX_WINDOW it accepts anyone still searching.
export const ELO_WINDOW = 100;
// How quickly the algorithm gives up on waiting for a tight elo window and
// simply pairs the nearest-rated person in the queue. Keep this small so a
// near-empty lobby doesn't make people wait forever.
const WIDEN_EVERY_MS = 20000; // kept for graceful widening, but not relied on
const MAX_WINDOW = 600;
const MAX_MATCH_WAIT_MS = 10000; // after this many ms accept the nearest available player

/** The rating window in force after `searchingMs` of queueing. */
export function currentWindow(searchingMs) {
  const steps = Math.floor(Math.max(0, searchingMs) / WIDEN_EVERY_MS);
  return Math.min(MAX_WINDOW, ELO_WINDOW * (steps + 1));
}

/** True once the window has opened wide enough to take on all comers. */
export function windowIsOpen(searchingMs) {
  return currentWindow(searchingMs) >= MAX_WINDOW;
}

/**
 * Scan the lobby for someone to play, nearest rating first. The problem tier is
 * picked from the weaker player so nobody gets handed a problem they have no
 * chance at.
 */
export function watchLobbyForOpponent(me, onFound) {
  let initiating = false;
  let stopped = false;
  let latest = [];

  async function evaluate() {
    if (initiating || stopped) return;

    const myRating = me.rating ?? 1500;
    const waited = Date.now() - me.joinedAt;
    const win = currentWindow(waited);
    // Accept 'anyone' either once the widening window is fully open or after
    // MAX_MATCH_WAIT_MS so lonely queues don't stall players.
    const anyone = windowIsOpen(waited) || waited >= MAX_MATCH_WAIT_MS;

    // Closest opponent first, so a widened window still produces the best
    // pairing available rather than whoever the snapshot happened to list first.
    const candidates = latest
      .filter((o) => o.uid !== me.uid && o.status === "searching")
      .sort((a, b) =>
        Math.abs((a.rating ?? 1500) - myRating) - Math.abs((b.rating ?? 1500) - myRating));

    for (const opp of candidates) {
      // If we haven't hit the max-wait threshold yet, enforce the current
      // elo window. Once the threshold is reached we accept the nearest.
      if (!anyone && Math.abs((opp.rating ?? 1500) - myRating) > win) continue;

      const iInitiate =
        me.joinedAt < opp.joinedAt ||
        (me.joinedAt === opp.joinedAt && me.uid < opp.uid);
      if (!iInitiate) continue;

      const duelId = `${[me.uid, opp.uid].sort().join("__")}__${Date.now()}`;
      initiating = true;
      try {
        await createDuel(me, opp, duelId, true);
        if (!stopped) onFound(opp, duelId);
      } catch (e) {
        // Another tab may have left or been claimed between the snapshot and the
        // transaction. That is a normal queue race, not a user-visible error.
        if (e?.code !== "queue-stale") console.error("duel creation failed", e);
        initiating = false;
      }
      return;
    }
  }

  const unsub = onSnapshot(collection(db, "matchmaking_lobby"), (snap) => {
    latest = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    evaluate();
  });

  // The window widens with time, not with lobby traffic, so a still lobby needs
  // a nudge to re-check the people already sitting in it.
  const poll = setInterval(evaluate, 4000);

  return () => { stopped = true; clearInterval(poll); unsub(); };
}

export async function createDuel(a, b, duelId, fromLobby, mode = "rated") {
  const [p1, p2] = a.uid < b.uid ? [a, b] : [b, a];
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const difficulty = tierFor(Math.min(a.rating ?? 1500, b.rating ?? 1500)).name;

  const payload = {
    id: duelId,
    player1: stripPlayer(p1),
    player2: stripPlayer(p2),
    difficulty,
    mode,
    problemSeed: seed,
    timeLimit: TIME_LIMITS[difficulty] ?? 300,
    startTime: Date.now() + COUNTDOWN_MS,
    status: "waiting",
    p1SolveTime: null, p2SolveTime: null,
    p1BestTests: 0, p2BestTests: 0,
    winner: null, winBy: null, forfeit: null,
    drawRequestBy: null, rematchReqBy: null, newDuelId: null, abortedBy: null,
    createdAt: serverTimestamp(),
  };

  if (fromLobby) {
    const aRef = doc(db, "matchmaking_lobby", a.uid);
    const bRef = doc(db, "matchmaking_lobby", b.uid);
    await runTransaction(db, async (tx) => {
      // The transaction is the queue claim. It re-checks both documents at the
      // exact moment the duel is created, eliminating stale snapshot matches.
      const [aSnap, bSnap] = await Promise.all([tx.get(aRef), tx.get(bRef)]);
      const aData = aSnap.exists() ? aSnap.data() : null;
      const bData = bSnap.exists() ? bSnap.data() : null;
      if (!aData || !bData || aData.status !== "searching" || bData.status !== "searching") {
        const err = new Error("A queue entry changed before it could be claimed.");
        err.code = "queue-stale";
        throw err;
      }
      tx.set(doc(db, "duels", duelId), payload);
      tx.update(aRef, { status: "matched", duelId, matchedWith: b.uid });
      tx.update(bRef, { status: "matched", duelId, matchedWith: a.uid });
    });
  } else {
    await setDoc(doc(db, "duels", duelId), payload);
  }
  return duelId;
}

function stripPlayer(p) {
  return {
    uid: p.uid, username: p.username,
    rating: Math.round(p.rating ?? 1500),
    rd: Math.round(p.rd ?? 350),
    vol: p.vol ?? 0.06,
    gamesPlayed: p.gamesPlayed ?? 0,
  };
}

export function watchDuel(duelId, cb) {
  return onSnapshot(doc(db, "duels", duelId), (snap) => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() });
  });
}

export async function getDuel(duelId) {
  const s = await getDoc(doc(db, "duels", duelId));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

// ── In-match writes ─────────────────────────────────────────────────────────
export async function submitSolve(duelId, playerNum, solveSecs, duel) {
  const field = playerNum === 1 ? "p1SolveTime" : "p2SolveTime";
  const myUid = playerNum === 1 ? duel.player1.uid : duel.player2.uid;
  const updates = { [field]: solveSecs };

  if (duel.winner === null && duel.status !== "complete") {
    updates.winner = myUid;
    updates.winBy = "solve";
    updates.status = "complete";
  }
  await updateDoc(doc(db, "duels", duelId), updates);
}

export async function reportTestProgress(duelId, playerNum, passed) {
  const field = playerNum === 1 ? "p1BestTests" : "p2BestTests";
  try { await updateDoc(doc(db, "duels", duelId), { [field]: passed }); } catch {}
}

export async function forfeitDuel(duelId, forfeiterUid, duel) {
  if (duel.status === "complete") return;
  const winnerUid = duel.player1.uid === forfeiterUid ? duel.player2.uid : duel.player1.uid;
  await updateDoc(doc(db, "duels", duelId), {
    winner: winnerUid, winBy: "forfeit", forfeit: forfeiterUid, status: "complete",
  });
}

// Time ran out for both — decide on hidden tests passed, else a draw.
export async function resolveTimeout(duelId, duel) {
  if (duel.status === "complete") return;
  const p1 = duel.p1BestTests ?? 0;
  const p2 = duel.p2BestTests ?? 0;
  let winner = null, winBy = "draw";
  if (p1 > p2) { winner = duel.player1.uid; winBy = "testcases"; }
  else if (p2 > p1) { winner = duel.player2.uid; winBy = "testcases"; }
  await updateDoc(doc(db, "duels", duelId), { winner, winBy, status: "complete", forfeit: null });
}

export async function abortDuel(duelId, uid) {
  try { await updateDoc(doc(db, "duels", duelId), { status: "aborted", abortedBy: uid }); } catch {}
}

export async function offerDraw(duelId, uid) {
  await updateDoc(doc(db, "duels", duelId), { drawRequestBy: uid });
}
export async function declineDraw(duelId) {
  await updateDoc(doc(db, "duels", duelId), { drawRequestBy: null });
}
export async function acceptDraw(duelId) {
  await updateDoc(doc(db, "duels", duelId), { status: "complete", winner: null, winBy: "draw" });
}

export async function requestRematch(duelId, uid) {
  await updateDoc(doc(db, "duels", duelId), { rematchReqBy: uid });
}

export async function acceptRematch(oldDuelId, me, opp, mode = "rated") {
  const newId = `${[me.uid, opp.uid].sort().join("__")}__r${Date.now()}`;
  await createDuel(me, opp, newId, false, mode);
  try { await updateDoc(doc(db, "duels", oldDuelId), { newDuelId: newId }); } catch {}
  return newId;
}

export async function deleteDuel(duelId) {
  try { await deleteDoc(doc(db, "duels", duelId)); } catch {}
}
