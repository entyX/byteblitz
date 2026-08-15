// ============================================================================
// Duel presence — Realtime Database sessions that disappear automatically when
// a tab closes or loses its network connection.
// ============================================================================

import {
  rtdb, rtdbRef, rtdbSet, rtdbRemove, rtdbOnValue, rtdbOnDisconnect,
  rtdbServerTimestamp,
} from "./firebase.js";

const RECONNECT_GRACE_MS = 12000;
const sessionId = typeof crypto?.randomUUID === "function"
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Join a duel's live-presence room. The callback fires only when an opponent's
 * session has remained absent beyond the reload grace period, so a refresh does
 * not become a false forfeit.
 */
export function joinDuelPresence(duelId, uid, opponentUid, onOpponentAbsent) {
  if (!duelId || !uid || !opponentUid || !rtdb) return () => {};

  const participant = rtdbRef(rtdb, `duelPresence/${duelId}/participants/${uid}`);
  const mine = rtdbRef(rtdb, `duelPresence/${duelId}/sessions/${uid}/${sessionId}`);
  const room = rtdbRef(rtdb, `duelPresence/${duelId}/sessions`);
  let active = true;
  let absentTimer = null;
  let sawOpponent = false;

  const cancelAbsent = () => {
    if (absentTimer) clearTimeout(absentTimer);
    absentTimer = null;
  };

  const publish = async () => {
    if (!active) return;
    try {
      await rtdbSet(participant, true);
      await rtdbOnDisconnect(participant).remove();
      await rtdbOnDisconnect(mine).remove();
      await rtdbSet(mine, { joinedAt: rtdbServerTimestamp(), heartbeatAt: rtdbServerTimestamp() });
    } catch (error) {
      // The UI remains playable while Realtime Database is temporarily offline.
      console.warn("Duel presence is unavailable", error);
    }
  };

  publish();
  const heartbeat = setInterval(() => {
    if (!active) return;
    rtdbSet(mine, { heartbeatAt: rtdbServerTimestamp() }).catch(() => {});
  }, 5000);

  const stopWatching = rtdbOnValue(room, (snap) => {
    if (!active) return;
    const sessions = snap.val() || {};
    const hasOpponent = !!sessions?.[opponentUid] && Object.keys(sessions[opponentUid] || {}).length > 0;
    if (hasOpponent) {
      sawOpponent = true;
      cancelAbsent();
      return;
    }
    if (!sawOpponent || absentTimer) return;
    absentTimer = setTimeout(() => {
      absentTimer = null;
      if (active) onOpponentAbsent?.();
    }, RECONNECT_GRACE_MS);
  }, (error) => console.warn("Duel presence listener stopped", error));

  return () => {
    active = false;
    cancelAbsent();
    clearInterval(heartbeat);
    try { stopWatching?.(); } catch {}
    rtdbRemove(mine).catch(() => {});
    rtdbRemove(participant).catch(() => {});
  };
}
