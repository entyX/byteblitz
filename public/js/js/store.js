// ============================================================================
// Firestore data layer — profiles, ratings, social, training records.
// ============================================================================

import {
  db, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  collection, query, where, orderBy, limit, onSnapshot, serverTimestamp,
  increment, writeBatch, collectionGroup, deleteField,

} from "./firebase.js";
import {
  defaultRating, rate, decayRd, soloScore, soloOpponent, placementRd, placementCalibration,
  placementGamesPlayed, confidenceForPlacementGames, PLACEMENT_GAMES, skillLevel, isPlaced, partialTestLossMitigation,
} from "./glicko.js";
import {
  isGuestProfile, patchGuest, markGuestSeen, guestSeen,
  guestPuzzleRecords, recordGuestPuzzle, renameGuest,
} from "./local.js";

/**
 * True when Firestore refused a read. Public boards are readable by anyone
 * under the shipped rules, so this only fires when the deployed rules are
 * older than this build — worth distinguishing from a network blip.
 */
export function isPermissionDenied(e) {
  return e?.code === "permission-denied" || /insufficient permissions/i.test(e?.message ?? "");
}

function softenLoss(next, before, mitigation) {
  if (!mitigation || next.rating >= before) return next;
  const rating = before + (next.rating - before) * (1 - mitigation);
  return { ...next, rating: Math.round(rating * 100) / 100 };
}

// ── Profile ─────────────────────────────────────────────────────────────────
export function blankProfile(uid, username, isAnon) {
  const g = defaultRating();
  return {
    uid,
    username,
    usernameLower: username.toLowerCase(),
    isAnonymous: !!isAnon,
    createdAt: Date.now(),

    rating: g.rating, rd: g.rd, vol: g.vol,
    wins: 0, losses: 0, draws: 0, gamesPlayed: 0, lastPlayedAt: null, rankedBestTime: null,

    soloRating: g.rating, soloRd: g.rd, soloVol: g.vol,
    soloRuns: 0, soloSolved: 0, soloBest: {}, lastSoloAt: null,
    placementGames: 0, placementConfidence: 0, placementBaseRating: null, rankedUnlocked: false,
    tutorialCompleted: false,

    totalMatches: 0,
    puzzlesSolved: 0,
    solutionsSaved: 0,
    accomplishments: 0,
    pinnedAccomplishment: null,
    bestStreak: 0, streak: 0,

    seen: {},          // archetypeId -> true; drives Training Grounds discovery
    skillLevel: null,  // set by onboarding; null means "hasn't been asked yet"
        avatarIcon: null,
    avatarHue: null,
    country: "US", // Profiles created before v1.2.0 render as US until changed.
    bio: "",
    emailVisible: false,
    activityDays: {}, // YYYY-MM-DD -> last activity timestamp, used by dashboard streaks.

  };
}

/** True when this player still needs to be asked how strong they are. */
export function needsOnboarding(profile) {
  return !!profile && !profile.skillLevel;
}

/**
 * Apply the answer from onboarding. Both tracks start at the chosen rating with
 * the default deviation, so they read as provisional and settle quickly if the
 * player misjudged themselves.
 */
export async function applySkillLevel(profile, level) {
  const patch = {
    skillLevel: level.id,
    rating: level.rating,
    soloRating: level.rating,
    placementGames: 0,
    placementConfidence: 0,
    placementBaseRating: level.rating,
    rankedUnlocked: false,
    rankedBestTime: null,
    tutorialCompleted: false,
    lbRating: level.rating,
    lbSolo: level.rating,
  };
  if (isGuestProfile(profile)) { patchGuest(patch); return patch; }
  await updateDoc(doc(db, "users", profile.uid), patch);
  return patch;
}

export async function saveAvatar(profile, avatarIcon, avatarHue) {
  const patch = { avatarIcon, avatarHue };
  if (isGuestProfile(profile)) { patchGuest(patch); return patch; }
  await updateDoc(doc(db, "users", profile.uid), patch);
  return patch;
}

/** Save the self-reported country used for the leaderboard flag. */
export async function saveCountry(profile, country) {
  const patch = { country: String(country || "US").toUpperCase() };
  if (isGuestProfile(profile)) { patchGuest(patch); return patch; }
  await updateDoc(doc(db, "users", profile.uid), patch);
  return patch;
}

/** Save public profile copy. Email is copied into the public document only when opted in. */
export async function saveProfilePresentation(profile, { bio, emailVisible, email }) {
  if (!profile || isGuestProfile(profile)) throw new Error("Sign in to edit profile settings.");
  const patch = {
    bio: String(bio || "").trim().slice(0, 240),
    emailVisible: !!emailVisible,
    publicEmail: emailVisible && email ? String(email).trim() : deleteField(),
  };
  await updateDoc(doc(db, "users", profile.uid), patch);
  return { ...patch, publicEmail: emailVisible && email ? String(email).trim() : null };
}

function activityKey(now = Date.now()) {
  // Local calendar days make the streak read naturally to the player.
  const d = new Date(now);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

/** Record that a player completed a play activity on the current local day. */
export async function markDailyActivity(profile) {
  if (!profile) return;
  const key = activityKey();
  if (isGuestProfile(profile)) {
    patchGuest({ activityDays: { ...(profile.activityDays || {}), [key]: Date.now() } });
    return;
  }
  try { await updateDoc(doc(db, "users", profile.uid), { [`activityDays.${key}`]: Date.now() }); }
  catch { /* a streak should never block a result write */ }
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/**
 * Remove every browser-accessible document owned by, or directly referring to,
 * an account. All reads finish before deletion starts; writes are then committed
 * in Firestore-safe batches. Auth identity removal happens separately only after
 * this function succeeds.
 */
export async function deleteAccountData(profile) {
  if (!profile?.uid || isGuestProfile(profile)) throw new Error("Only signed-in accounts can be deleted.");
  const uid = profile.uid;
  const usernameKey = String(profile.username || "").trim().toLowerCase();
  const refs = new Map();
  const messageRefs = new Map();
  const add = (ref) => { if (ref) refs.set(ref.path, ref); };
  const addSnapshot = (snap) => snap.forEach((entry) => add(entry.ref));
  const addMessages = (snap) => snap.forEach((entry) => messageRefs.set(entry.ref.path, entry.ref));

  // Fetch top-level and collection-group references while the profile is still
  // present. Each query tracks a distinct surface where a player can appear.
  const [
    puzzleTimes, ownFriends, friendReferences, inboxRequests, sentRequests,
    notifications, foreignNotifications, lobby, presence, conversations, sentChallenges, receivedChallenges,
    firstPlayerDuels, secondPlayerDuels,
  ] = await Promise.all([
    getDocs(query(collection(db, "puzzleTimes"), where("uid", "==", uid))),
    getDocs(collection(db, "friends", uid, "list")),
    getDocs(collectionGroup(db, "list")),
    getDocs(collection(db, "friendRequests", uid, "from")),
    getDocs(collection(db, "friendRequests", uid, "sent")),
    getDocs(collection(db, "notifications", uid, "items")),
    getDocs(query(collectionGroup(db, "items"), where("fromUid", "==", uid))),
    getDoc(doc(db, "matchmaking_lobby", uid)),
    getDoc(doc(db, "presence", uid)),
    getDocs(query(collection(db, "conversations"), where("participants", "array-contains", uid))),
    getDocs(query(collection(db, "challenges"), where("fromUid", "==", uid))),
    getDocs(query(collection(db, "challenges"), where("toUid", "==", uid))),
    getDocs(query(collection(db, "duels"), where("player1.uid", "==", uid))),
    getDocs(query(collection(db, "duels"), where("player2.uid", "==", uid))),
  ]);

  addSnapshot(puzzleTimes);
  addSnapshot(ownFriends);
  friendReferences.forEach((entry) => {
    // The document ID has always been the friend's UID. Newer records also
    // store `uid`, so this handles both legacy and current friend references.
    if (entry.id === uid || entry.data()?.uid === uid) add(entry.ref);
  });
  addSnapshot(inboxRequests);
  addSnapshot(sentRequests);
  addSnapshot(notifications);
  addSnapshot(foreignNotifications);
  if (lobby.exists()) add(lobby.ref);
  if (presence.exists()) add(presence.ref);
  addSnapshot(sentChallenges);
  addSnapshot(receivedChallenges);
  addSnapshot(firstPlayerDuels);
  addSnapshot(secondPlayerDuels);

  // A request can appear in another player's folder. Mirror cleanup removes it
  // even when the current user has already declined or accepted the request.
  const requestRefs = await Promise.all([
    getDocs(query(collectionGroup(db, "from"), where("fromUid", "==", uid))),
    getDocs(query(collectionGroup(db, "sent"), where("toUid", "==", uid))),
  ]);
  requestRefs.forEach(addSnapshot);

  // Remove every conversation and its message documents. A shared conversation
  // is deleted rather than retaining one side's historical profile reference.
  for (const conversation of conversations.docs) {
    const messages = await getDocs(collection(db, "conversations", conversation.id, "messages"));
    addMessages(messages);
    add(conversation.ref);
  }

  // Saved solutions own a nested history collection, so remove child attempts
  // before their summary documents as part of the same account cleanup.
  const savedSolutions = await getDocs(collection(db, "users", uid, "solutions"));
  for (const solution of savedSolutions.docs) {
    const attempts = await getDocs(collection(db, "users", uid, "solutions", solution.id, "history"));
    attempts.forEach((entry) => add(entry.ref));
    add(solution.ref);
  }
  const publicShares = await getDocs(query(collection(db, "sharedSolutions"), where("ownerUid", "==", uid)));
  publicShares.forEach((entry) => add(entry.ref));

  // Current username reservation, profile document, and direct social mirrors.
  if (usernameKey) add(doc(db, "usernames", usernameKey));
  add(doc(db, "users", uid));
  for (const friend of ownFriends.docs) add(doc(db, "friends", friend.id, "list", uid));

  const deleteInBatches = async (items) => {
    for (let start = 0; start < items.length; start += 450) {
      const batch = writeBatch(db);
      items.slice(start, start + 450).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  };

  // Child messages must disappear before the parent conversation document.
  const allMessages = [...messageRefs.values()];
  const allRefs = [...refs.values()];
  await deleteInBatches(allMessages);
  await deleteInBatches(allRefs);

  return { deletedDocuments: allMessages.length + allRefs.length };
}

export function watchProfile(uid, cb, onMissing) {
  return onSnapshot(doc(db, "users", uid), (s) => {
    if (s.exists()) cb({ uid, ...s.data() });
    else if (typeof onMissing === "function") onMissing();
  });
}

/** Return a player's recent public Unranked and Ranked results, newest first. */
export async function getMatchHistory(uid, n = 40) {
  if (!uid || String(uid).startsWith("local:")) return [];
  const snap = await getDocs(query(collection(db, "users", uid, "history"), orderBy("createdAt", "desc"), limit(n)));
  return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

/**
 * Reset progression without deleting the account itself. Friends, messages,
 * username, avatar, country, and authentication are kept; only ratings,
 * placement, training discovery, puzzle records, activity, and history reset.
 */
export async function resetAccountProgress(profile) {
  if (!profile?.uid || isGuestProfile(profile)) throw new Error("Sign in to reset account progress.");
  const base = Number(profile.placementBaseRating)
    || skillLevel(profile.skillLevel)?.rating
    || DEFAULT_RATING;
  const [records, history] = await Promise.all([
    getDocs(query(collection(db, "puzzleTimes"), where("uid", "==", profile.uid))),
    getDocs(collection(db, "users", profile.uid, "history")),
  ]);
  const refs = [...records.docs.map((entry) => entry.ref), ...history.docs.map((entry) => entry.ref)];
  for (let start = 0; start < refs.length; start += 450) {
    const batch = writeBatch(db);
    refs.slice(start, start + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  const g = defaultRating();
  const patch = {
    rating: base, rd: g.rd, vol: g.vol, lbRating: base,
    soloRating: base, soloRd: g.rd, soloVol: g.vol, lbSolo: base,
    wins: 0, losses: 0, draws: 0, gamesPlayed: 0, lastPlayedAt: null, rankedBestTime: null,
    soloRuns: 0, soloSolved: 0, soloBest: {}, lastSoloAt: null,
    placementGames: 0, placementConfidence: 0, placementBaseRating: null, rankedUnlocked: false,
    // Clearing the selected skill forces onboarding to establish a new base.
    skillLevel: null,
    totalMatches: 0, puzzlesSolved: 0, solutionsSaved: 0, accomplishments: 0, pinnedAccomplishment: null, bestStreak: 0, streak: 0,
    seen: {}, activityDays: {}, tutorialCompleted: false, updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "users", profile.uid), patch);
  return patch;
}

export async function ensureProfile(user, preferredName) {
  const passwordAccount = user?.providerData?.some((provider) => provider.providerId === "password");
  if (!user?.isAnonymous && passwordAccount && !user.emailVerified) {
    throw new Error("Verify your email before creating a ByteBlitz profile.");
  }
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { uid: user.uid, ...snap.data() };

  const name = preferredName || user.displayName || fallbackName(user);
  const profile = blankProfile(user.uid, name, user.isAnonymous);
  await setDoc(ref, profile);
  if (!user.isAnonymous) {
    try { await setDoc(doc(db, "usernames", name.toLowerCase()), { uid: user.uid }); }
    catch { /* name taken by a race — profile still works, rename prompts later */ }
  }
  return profile;
}

function fallbackName(user) {
  if (user.isAnonymous) return "Guest-" + user.uid.slice(0, 5).toUpperCase();
  const base = (user.email || "player").split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  return (base || "player").slice(0, 14) + Math.floor(Math.random() * 900 + 100);
}

export const NAME_RE = /^[a-zA-Z0-9_]{3,16}$/;

export async function usernameAvailable(name) {
  const snap = await getDoc(doc(db, "usernames", name.toLowerCase()));
  return !snap.exists();
}

export async function renameUser(uid, oldName, newName) {
  if (!NAME_RE.test(newName)) throw new Error("3–16 characters, letters/numbers/underscore only.");
  if (String(uid).startsWith("local:")) { renameGuest(newName); return; }
  const lower = newName.toLowerCase();
  if (lower !== (oldName || "").toLowerCase()) {
    const taken = await getDoc(doc(db, "usernames", lower));
    if (taken.exists() && taken.data().uid !== uid) throw new Error("That name is taken.");
    await setDoc(doc(db, "usernames", lower), { uid });
    if (oldName) { try { await deleteDoc(doc(db, "usernames", oldName.toLowerCase())); } catch {} }
  }
  await updateDoc(doc(db, "users", uid), { username: newName, usernameLower: lower });
}

// ── Ranked rating ───────────────────────────────────────────────────────────
/**
 * Apply one rated duel result to the signed-in player.
 * `result` is "win" | "loss" | "draw"; `score` is the Glicko score in [0,1].
 */
export async function applyDuelResult(uid, profile, opponent, score, result, history = null) {
  const me = {
    rating: profile.rating,
    rd: decayRd(profile.rd, profile.vol, profile.lastPlayedAt),
    vol: profile.vol,
  };
  let next = rate(me, opponent, score);
  const mitigation = result === "loss"
    ? partialTestLossMitigation(history?.testsPassed, history?.totalTests, 0.28)
    : 0;
  next = softenLoss(next, profile.rating, mitigation);

  const streak = result === "win" ? (profile.streak ?? 0) + 1 : 0;
  const updates = {
    rating: next.rating, rd: next.rd, vol: next.vol,
    lbRating: next.rating,
    gamesPlayed: increment(1),
    totalMatches: increment(1),
    lastPlayedAt: Date.now(),
    streak,
    bestStreak: Math.max(profile.bestStreak ?? 0, streak),
    ...(result === "win" && history?.timeMs && (!profile.rankedBestTime || history.timeMs < profile.rankedBestTime)
      ? { rankedBestTime: history.timeMs } : {}),
    updatedAt: serverTimestamp(),
  };
  if (result === "win") updates.wins = increment(1);
  else if (result === "loss") updates.losses = increment(1);
  else updates.draws = increment(1);

    await updateDoc(doc(db, "users", uid), updates);
  if (history && !isGuestProfile(profile)) {
    await setDoc(doc(db, "users", uid, "history", `duel_${history.duelId}`), {
      mode: "ranked", duelId: history.duelId, result, score,
      opponentUid: opponent.uid ?? null, opponentUsername: opponent.username ?? "Opponent",
      difficulty: history.difficulty ?? null, archetypeId: history.archetypeId ?? null,
      puzzleTitle: history.puzzleTitle ?? null, category: history.category ?? null, winBy: history.winBy ?? null,
      ratingBefore: Math.round(profile.rating), ratingAfter: Math.round(next.rating),
      delta: Math.round(next.rating) - Math.round(profile.rating),
      testsPassed: Number(history.testsPassed) || 0, totalTests: Number(history.totalTests) || 0,
      timeMs: Number.isFinite(Number(history.timeMs)) ? Number(history.timeMs) : null,
      submissions: Math.max(0, Number(history.submissions) || 0),
      runtimeMs: Number.isFinite(Number(history.runtimeMs)) ? Number(history.runtimeMs) : null,
      memoryBytes: Number.isFinite(Number(history.memoryBytes)) ? Number(history.memoryBytes) : null,
      lossMitigation: Math.round(mitigation * 100), createdAt: Date.now(),
    });
  }
  markDailyActivity(profile);
  return { ...next, before: Math.round(profile.rating) };

}

// ── Unranked rating ─────────────────────────────────────────────────────────
// Stored under the `solo*` field names the collection has always used; the UI
// calls this track "Unranked".
export async function applySoloResult(uid, profile, opts) {
  const { solved, timeMs, difficulty, archetypeId = null, puzzleTitle = null, category = null, testsPassed = 0, totalTests = 0 } = opts;
  const secs = timeMs / 1000;

  // Build the player's unranked "me" object first so the soloScore function
  // can see the decayed RD and apply the provisional boost if appropriate.
  const me = {
    rating: profile.soloRating,
    rd: decayRd(profile.soloRd, profile.soloVol, profile.lastSoloAt),
    vol: profile.soloVol,
  };

  const priorPlacementGames = placementGamesPlayed(profile);
  const calibrating = priorPlacementGames < PLACEMENT_GAMES;
  // Placement is deliberately responsive, but its bounded calibration prevents
  // a solo resignation from outweighing several completed placement runs.
  const score = soloScore(solved, secs, difficulty, profile);
  let next = calibrating
    ? placementCalibration(profile, solved, secs, difficulty)
    : rate(me, soloOpponent(difficulty, me.rating), score);
  const mitigation = !solved ? partialTestLossMitigation(testsPassed, totalTests, 0.55) : 0;
  next = softenLoss(next, profile.soloRating, mitigation);
  if (calibrating) next.delta = Math.round(next.rating - (profile.soloRating ?? next.rating));
  const placementGames = calibrating
    ? next.games
    : Math.min(PLACEMENT_GAMES, priorPlacementGames + 1);
  if (!calibrating) next.rd = placementRd(next.rd, { ...profile, placementGames });
  const placementConfidence = confidenceForPlacementGames(placementGames);

  const best = { ...(profile.soloBest || {}) };
  let newRecord = false;
  if (solved && (best[difficulty] == null || timeMs < best[difficulty])) {
    best[difficulty] = timeMs;
    newRecord = true;
  }

  const common = {
    soloRating: next.rating, soloRd: next.rd, soloVol: next.vol,
    soloBest: best,
    lastSoloAt: Date.now(),
  };

  if (isGuestProfile(profile)) {
    patchGuest({
      ...common,
      soloRuns: (profile.soloRuns ?? 0) + 1,
      soloSolved: (profile.soloSolved ?? 0) + (solved ? 1 : 0),
      totalMatches: (profile.totalMatches ?? 0) + 1,
      placementGames,
      placementConfidence,
      ...(calibrating ? {
        rating: next.rating, rd: next.rd, vol: next.vol,
        lbRating: next.rating,
      } : {}),
    });
  } else {
    const updates = {
      ...common,
      lbSolo: next.rating,
      soloRuns: increment(1),
      soloSolved: increment(solved ? 1 : 0),
      totalMatches: increment(1),
      placementGames,
      placementConfidence,
      ...(placementGames >= PLACEMENT_GAMES ? { rankedUnlocked: true } : {}),
      updatedAt: serverTimestamp(),
    };
    if (calibrating) {
      updates.rating = next.rating;
      updates.rd = next.rd;
      updates.vol = next.vol;
      updates.lbRating = next.rating;
    }
    await updateDoc(doc(db, "users", uid), updates);
    await addDoc(collection(db, "users", uid, "history"), {
      mode: "unranked", result: solved ? "solved" : "missed", difficulty,
      archetypeId, puzzleTitle, category,
      timeMs: solved ? timeMs : null, score,
      ratingBefore: Math.round(profile.soloRating ?? next.rating),
      ratingAfter: Math.round(next.rating),
      delta: calibrating ? next.delta : Math.round(next.rating - (profile.soloRating ?? next.rating)),
      placementGames,
      testsPassed: Number(testsPassed) || 0, totalTests: Number(totalTests) || 0,
      lossMitigation: Math.round(mitigation * 100), createdAt: Date.now(),
    });
  }

  markDailyActivity(profile);
  const ratingDelta = Math.round((next.rating - (profile.soloRating ?? next.rating)) * 10) / 10;
  return {
    ...next, before: Math.round(profile.soloRating), delta: calibrating ? next.delta : ratingDelta, score, newRecord,
    placementGames, placementConfidence, rankedRating: calibrating ? next.rating : profile.rating,
    placementComplete: placementGames >= PLACEMENT_GAMES,
  };

}

// ── Puzzle discovery ────────────────────────────────────────────────────────
// Training Grounds only names a puzzle once you have actually met it in an
// unranked run or a ranked duel. Everything else shows as "???".
export async function markProblemSeen(profile, archetypeId) {
  if (!profile || !archetypeId) return;
  if (isGuestProfile(profile)) { markGuestSeen(archetypeId); return; }
  if (profile.seen?.[archetypeId]) return;
  try { await updateDoc(doc(db, "users", profile.uid), { [`seen.${archetypeId}`]: true }); }
  catch { /* discovery is a nicety — never fail a match over it */ }
}

/** Persist whether the optional introductory tutorial has been completed or skipped. */
export async function markTutorialComplete(profile) {
  if (!profile) return;
  if (isGuestProfile(profile)) { patchGuest({ tutorialCompleted: true }); return; }
  await updateDoc(doc(db, "users", profile.uid), { tutorialCompleted: true });
}

/** The set of puzzles this player has met, as an { archetypeId: true } map. */
export function seenMap(profile) {
  if (!profile) return {};
  return isGuestProfile(profile) ? guestSeen() : (profile.seen ?? {});
}

/**
 * Every difficulty starts with its first tenth already open, so Training
 * Grounds is usable on day one instead of being a wall of ???. Everything
 * beyond that is earned by meeting the puzzle in Unranked or Ranked.
 */
export const STARTER_FRACTION = 0.1;

export function starterCount(poolSize) {
  return Math.max(1, Math.ceil((poolSize ?? 0) * STARTER_FRACTION));
}

/**
 * Is this puzzle revealed? `index` is its position in the difficulty's pool.
 * Free starters come first so every player sees the same opening set.
 */
export function isRevealed(seen, puzzle, index, poolSize) {
  return index < starterCount(poolSize) || !!seen[puzzle.archetypeId];
}

// ── Training records ────────────────────────────────────────────────────────
const puzzleDocId = (archetypeId, uid) => `${archetypeId}__${uid}`;

export async function getPuzzleRecord(archetypeId, uid) {
  const snap = await getDoc(doc(db, "puzzleTimes", puzzleDocId(archetypeId, uid)));
  return snap.exists() ? snap.data() : null;
}

export async function getMyPuzzleRecords(profile) {
  if (!profile) return {};
  if (isGuestProfile(profile)) return guestPuzzleRecords();
  const q = query(collection(db, "puzzleTimes"), where("uid", "==", profile.uid));
  const snap = await getDocs(q);
  const map = {};
  snap.forEach((d) => { map[d.data().archetypeId] = d.data(); });
  return map;
}

/** Count puzzles where this player currently holds the fastest valid recorded solve. */
export async function countPuzzleRecords(uid) {
  if (!uid || String(uid).startsWith("local:")) return 0;
  const own = await getDocs(query(collection(db, "puzzleTimes"), where("uid", "==", uid)));
  const records = own.docs.map((entry) => entry.data()).filter((entry) => entry.solved && Number.isFinite(entry.timeMs));
  let held = 0;
  for (const record of records) {
    const top = await puzzleLeaderboard(record.archetypeId, 1);
    if (top[0]?.uid === uid) held += 1;
  }
  return held;
}

export async function recordPuzzleTime(profile, puzzle, timeMs, solved) {
  if (isGuestProfile(profile)) {
    const result = recordGuestPuzzle(puzzle, timeMs, solved);
    markDailyActivity(profile);
    return result;
  }

  const uid = profile.uid;
  const username = profile.username;
  const id = puzzleDocId(puzzle.archetypeId, uid);
  const ref = doc(db, "puzzleTimes", id);
  const prev = await getDoc(ref);
  const prevData = prev.exists() ? prev.data() : null;
  const prevBest = prevData?.timeMs ?? null;
  const isBest = solved && (prevBest == null || timeMs < prevBest);

  const payload = {
    uid, username,
    archetypeId: puzzle.archetypeId,
    title: puzzle.title,
    difficulty: puzzle.difficulty,
    solved: solved || !!prevData?.solved,
    attempts: (prevData?.attempts ?? 0) + 1,
    updatedAt: Date.now(),
  };
  // Only ever record a time for a puzzle that was actually cleared. The field
  // is omitted entirely rather than set to null, because `orderBy("timeMs")`
  // sorts nulls first — a null would take the top of the leaderboard, and the
  // query's limit would apply before any client-side filter could drop it.
  if (payload.solved) payload.timeMs = isBest ? timeMs : (prevBest ?? timeMs);

  await setDoc(ref, payload);

    if (solved && !prevData?.solved) {
    try { await updateDoc(doc(db, "users", uid), { puzzlesSolved: increment(1) }); } catch {}
  }
  markDailyActivity(profile);
  return { isBest, prevBest };

}

// ── Saved solutions, accomplishments, and public shares ────────────────────

/**
 * Repair missing Training leaderboard records from completed saved solutions.
 * This is intentionally one-way and only fills a missing record; it never
 * overwrites a player’s established Training best time.
 */
export async function syncSavedSolutionsToPuzzleRecords(profile) {
  if (!profile || isGuestProfile(profile)) return 0;
  const saved = await getSavedSolutions(profile.uid, 250);
  let repaired = 0;
  for (const solution of saved) {
    const existing = await getPuzzleRecord(solution.archetypeId, profile.uid);
    if (existing?.solved && !solution.completed) {
      const completedAt = Number(existing.updatedAt) || Date.now();
      await updateDoc(solutionRef(profile.uid, solution.archetypeId), {
        completed: true,
        lastStatus: "completed",
        completedSubmits: Math.max(Number(solution.completedSubmits || 0), 1),
        bestTimeMs: Number.isFinite(solution.bestTimeMs) ? Math.min(solution.bestTimeMs, existing.timeMs) : existing.timeMs,
        lastSavedAt: solution.lastSavedAt || completedAt,
        updatedAt: Date.now(),
      });
      repaired += 1;
      continue;
    }
    if (!solution.completed || !Number.isFinite(solution.bestTimeMs) || solution.bestTimeMs <= 0) continue;
    if (existing?.solved) continue;
    await recordPuzzleTime(profile, {
      archetypeId: solution.archetypeId,
      title: solution.title || solution.archetypeId,
      difficulty: solution.difficulty || "Bronze",
      category: solution.category ?? null,
    }, solution.bestTimeMs, true);
    repaired += 1;
  }
  return repaired;
}

// One summary document per player and puzzle keeps Training Ground quick to
// render. Each successful submit is also preserved as a timestamped attempt.
const solutionRef = (uid, archetypeId) => doc(db, "users", uid, "solutions", archetypeId);

export async function saveSolution(profile, puzzle, {
  code, language, timeMs = 0, mode = "training", completed = false,
  reason = null, testsPassed = 0, totalTests = 0,
}) {
  if (!profile || isGuestProfile(profile) || !String(code || "").trim()) return null;
  const ref = solutionRef(profile.uid, puzzle.archetypeId);
  const previous = await getDoc(ref);
  const before = previous.exists() ? previous.data() : null;
  const now = Date.now();
  const source = String(code).slice(0, 100000);
  const analysisStillMatches = String(before?.code || "") === source;
  const everCompleted = !!before?.completed || !!completed;
  const bestTimeMs = completed
    ? (Number.isFinite(before?.bestTimeMs) ? Math.min(before.bestTimeMs, timeMs) : timeMs)
    : before?.bestTimeMs ?? null;
  const payload = {
    uid: profile.uid,
    username: profile.username,
    archetypeId: puzzle.archetypeId,
    title: puzzle.title,
    difficulty: puzzle.difficulty,
    category: puzzle.category ?? null,
    code: source,
    language: language || "python",
    lastMode: mode,
    completed: everCompleted,
    lastStatus: completed ? "completed" : "incomplete",
    saveCount: Number(before?.saveCount || 0) + 1,
    completedSubmits: Number(before?.completedSubmits || 0) + (completed ? 1 : 0),
    incompleteSaves: Number(before?.incompleteSaves || 0) + (completed ? 0 : 1),
    firstSavedAt: before?.firstSavedAt ?? now,
    lastSavedAt: now,
    bestTimeMs,
    accomplishment: !!before?.accomplishment,
    pinned: !!before?.pinned,
    isPublic: !!before?.isPublic,
    publicShareId: before?.publicShareId ?? null,
    analysis: analysisStillMatches ? (before?.analysis ?? null) : null,
    analysisUpdatedAt: analysisStillMatches ? (before?.analysisUpdatedAt ?? null) : null,
    updatedAt: now,
  };
  await setDoc(ref, payload, { merge: true });
  if (payload.isPublic && payload.publicShareId) {
    await updateDoc(doc(db, "sharedSolutions", payload.publicShareId), {
      code: source, language: payload.language, mode: payload.lastMode, bestTimeMs: payload.bestTimeMs,
      analysis: payload.analysis, analysisUpdatedAt: payload.analysisUpdatedAt, createdAt: now,
    }).catch(() => {});
  }
  await addDoc(collection(db, "users", profile.uid, "solutions", puzzle.archetypeId, "history"), {
    code: source,
    language: payload.language,
    mode,
    completed: !!completed,
    reason,
    testsPassed: Number(testsPassed || 0),
    totalTests: Number(totalTests || 0),
    timeMs: Number(timeMs || 0),
    savedAt: now,
  });
  if (!before) {
    try { await updateDoc(doc(db, "users", profile.uid), { solutionsSaved: increment(1) }); } catch {}
  }
  return payload;
}

// Compatibility alias for the earlier automatic-save call sites. New interface
// code uses saveSolution so a player chooses when to keep a draft or completion.
export const saveCompletedSolution = (profile, puzzle, details) =>
  saveSolution(profile, puzzle, { ...details, completed: true });

function normalizeSolution(id, data = {}) {
  const completed = data.completed ?? Number(data.solveCount || 0) > 0;
  const saveCount = Number(data.saveCount ?? data.solveCount ?? 1) || 1;
  return {
    id, ...data,
    completed,
    saveCount,
    completedSubmits: Number(data.completedSubmits ?? (completed ? data.solveCount ?? 1 : 0)),
    incompleteSaves: Number(data.incompleteSaves ?? (completed ? 0 : saveCount)),
    lastSavedAt: data.lastSavedAt ?? data.lastSolvedAt ?? data.updatedAt ?? data.firstSavedAt ?? data.firstSolvedAt ?? 0,
    firstSavedAt: data.firstSavedAt ?? data.firstSolvedAt ?? data.updatedAt ?? 0,
    isPublic: !!data.isPublic,
    publicShareId: data.publicShareId ?? data.lastShareId ?? null,
    accomplishment: !!data.accomplishment,
    pinned: !!data.pinned,
    analysis: data.analysis ?? null,
    analysisUpdatedAt: data.analysisUpdatedAt ?? null,
  };
}

function normalizeSolutionHistory(id, data = {}) {
  return {
    id, ...data,
    completed: data.completed ?? true,
    savedAt: data.savedAt ?? data.solvedAt ?? data.createdAt ?? 0,
    testsPassed: Number(data.testsPassed ?? 0),
    totalTests: Number(data.totalTests ?? 0),
    timeMs: Number(data.timeMs ?? 0),
  };
}

export async function getSavedSolution(uid, archetypeId) {
  if (!uid || !archetypeId) return null;
  const snap = await getDoc(solutionRef(uid, archetypeId));
  return snap.exists() ? normalizeSolution(snap.id, snap.data()) : null;
}

// Before the solution library existed, accepted runs were stored only in
// puzzleTimes. Materialize a minimal, code-less summary when a player wants to
// turn one of those verified legacy clears into an accomplishment.
export async function getAccomplishableSolution(profile, archetypeId) {
  if (!profile || isGuestProfile(profile) || !archetypeId) return null;
  const existing = await getSavedSolution(profile.uid, archetypeId);
  const record = await getPuzzleRecord(archetypeId, profile.uid);
  if (existing && (!record?.solved || existing.completed)) return existing;
  if (existing && record?.solved) {
    const repaired = {
      ...existing,
      completed: true,
      lastStatus: "completed",
      completedSubmits: Math.max(Number(existing.completedSubmits || 0), 1),
      bestTimeMs: Number.isFinite(existing.bestTimeMs) ? Math.min(existing.bestTimeMs, record.timeMs) : record.timeMs,
    };
    await updateDoc(solutionRef(profile.uid, archetypeId), {
      completed: true,
      lastStatus: "completed",
      completedSubmits: repaired.completedSubmits,
      bestTimeMs: repaired.bestTimeMs,
      updatedAt: Date.now(),
    });
    return normalizeSolution(archetypeId, repaired);
  }
  if (!record?.solved) return null;
  const now = Number(record.updatedAt) || Date.now();
  const payload = {
    uid: profile.uid,
    username: profile.username,
    archetypeId,
    title: record.title || archetypeId,
    difficulty: record.difficulty || "Bronze",
    category: null,
    code: "",
    language: "—",
    lastMode: "legacy",
    completed: true,
    legacy: true,
    lastStatus: "completed",
    saveCount: 0,
    completedSubmits: 1,
    incompleteSaves: 0,
    firstSavedAt: now,
    lastSavedAt: now,
    bestTimeMs: Number.isFinite(record.timeMs) ? record.timeMs : null,
    accomplishment: false,
    pinned: false,
    isPublic: false,
    publicShareId: null,
    updatedAt: now,
  };
  await setDoc(solutionRef(profile.uid, archetypeId), payload);
  try { await updateDoc(doc(db, "users", profile.uid), { solutionsSaved: increment(1) }); } catch {}
  return normalizeSolution(archetypeId, payload);
}

export async function getSavedSolutions(uid, n = 100) {
  if (!uid) return [];
  // Do not order in Firestore here: v1.3's earlier solution summaries used
  // lastSolvedAt, whereas the refined format uses lastSavedAt. Client sorting
  // preserves both formats until every player writes a new solution summary.
  const snap = await getDocs(collection(db, "users", uid, "solutions"));
  return snap.docs.map((entry) => normalizeSolution(entry.id, entry.data()))
    .sort((a, b) => Number(b.lastSavedAt || 0) - Number(a.lastSavedAt || 0))
    .slice(0, n);
}

export async function getSolutionHistory(uid, archetypeId, n = 30) {
  if (!uid || !archetypeId) return [];
  const snap = await getDocs(collection(db, "users", uid, "solutions", archetypeId, "history"));
  return snap.docs.map((entry) => normalizeSolutionHistory(entry.id, entry.data()))
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
    .slice(0, n);
}

/** Permanently remove one saved puzzle solution, its attempt history, and any public share. */
export async function saveSolutionAnalysis(profile, archetypeId, analysis, context = {}) {
  if (!profile || isGuestProfile(profile)) throw new Error("Sign in to save an analysis.");
  const solution = await getSavedSolution(profile.uid, archetypeId);
  if (!solution) throw new Error("Save code before creating an analysis.");
  const now = Date.now();
  const payload = {
    ...analysis,
    context: {
      source: context.source || "training",
      duelId: context.duelId || null,
      analyzedAt: now,
    },
    analyzedAt: now,
  };
  await updateDoc(solutionRef(profile.uid, archetypeId), { analysis: payload, analysisUpdatedAt: now, updatedAt: now });
  if (solution.isPublic && solution.publicShareId) {
    const publicAnalysis = { ...payload, context: { source: context.source || "training", analyzedAt: now } };
    await updateDoc(doc(db, "sharedSolutions", solution.publicShareId), { analysis: publicAnalysis, analysisUpdatedAt: now });
  }
  return payload;
}

export async function trashSavedSolution(profile, archetypeId) {
  if (!profile || isGuestProfile(profile)) throw new Error("Sign in to trash a solution.");
  const solution = await getSavedSolution(profile.uid, archetypeId);
  if (!solution) return false;
  const history = await getDocs(collection(db, "users", profile.uid, "solutions", archetypeId, "history"));
  const batch = writeBatch(db);
  history.docs.forEach((entry) => batch.delete(entry.ref));
  batch.delete(solutionRef(profile.uid, archetypeId));
  if (solution.publicShareId) batch.delete(doc(db, "sharedSolutions", solution.publicShareId));
  await batch.commit();

  const userRef = doc(db, "users", profile.uid);
  const userData = await getDoc(userRef).then((entry) => entry.exists() ? entry.data() : profile).catch(() => profile);
  const legacyCard = userData?.pinnedAccomplishment?.title ? [userData.pinnedAccomplishment] : [];
  const cards = (Array.isArray(userData?.accomplishmentCards) ? userData.accomplishmentCards : legacyCard)
    .filter((card) => card?.archetypeId !== archetypeId);
  const patch = {
    solutionsSaved: increment(-1),
    accomplishmentCards: cards,
    pinnedAccomplishment: cards[cards.length - 1] ?? null,
  };
  if (solution.accomplishment) patch.accomplishments = increment(-1);
  await updateDoc(userRef, patch);
  return true;
}

export async function toggleAccomplishment(profile, archetypeId, accomplished) {
  if (!profile || isGuestProfile(profile)) throw new Error("Sign in to mark accomplishments.");
  const ref = solutionRef(profile.uid, archetypeId);
  let snap = await getDoc(ref);
  if (!snap.exists()) {
    await getAccomplishableSolution(profile, archetypeId);
    snap = await getDoc(ref);
  }
  let data = snap.exists() ? snap.data() : null;
  // Older v1.3 summaries can display as completed through normalization
  // (for example, via solveCount) while their raw document lacks the newer
  // completed boolean. Persist that truth before applying the accomplishment.
  if (data && !data.completed && normalizeSolution(snap.id, data).completed) {
    await updateDoc(ref, {
      completed: true,
      lastStatus: "completed",
      completedSubmits: Math.max(Number(data.completedSubmits || data.solveCount || 0), 1),
      updatedAt: Date.now(),
    });
    snap = await getDoc(ref);
    data = snap.exists() ? snap.data() : null;
  }
  if (!data?.completed) {
    const record = await getPuzzleRecord(archetypeId, profile.uid);
    if (record?.solved) {
      const bestTimeMs = Number.isFinite(data?.bestTimeMs) ? Math.min(data.bestTimeMs, record.timeMs) : record.timeMs;
      await updateDoc(ref, {
        completed: true,
        lastStatus: "completed",
        completedSubmits: Math.max(Number(data?.completedSubmits || 0), 1),
        bestTimeMs,
        updatedAt: Date.now(),
      });
      snap = await getDoc(ref);
      data = snap.exists() ? snap.data() : null;
    }
  }
  if (!data?.completed) throw new Error("Complete this problem before marking it as an accomplishment.");
  const before = !!data.accomplishment;
  const next = !!accomplished;
  if (before === next) return normalizeSolution(snap.id, { ...data, accomplishment: next });

  const userRef = doc(db, "users", profile.uid);
  const userData = await getDoc(userRef).then((entry) => entry.exists() ? entry.data() : profile).catch(() => profile);
  const legacyCard = userData?.pinnedAccomplishment?.title ? [userData.pinnedAccomplishment] : [];
  const existingCards = Array.isArray(userData?.accomplishmentCards) ? userData.accomplishmentCards : legacyCard;
  const now = Date.now();
  const card = {
    archetypeId,
    title: data.title || archetypeId,
    difficulty: data.difficulty || null,
    category: data.category ?? null,
    bestTimeMs: data.bestTimeMs != null && Number.isFinite(Number(data.bestTimeMs)) ? Number(data.bestTimeMs) : null,
    pinnedAt: now,
  };
  const cards = next
    ? [...existingCards.filter((entry) => entry?.archetypeId !== archetypeId), card]
    : existingCards.filter((entry) => entry?.archetypeId !== archetypeId);
  await updateDoc(ref, { accomplishment: next, pinned: next, updatedAt: now });
  try {
    await updateDoc(userRef, {
      accomplishments: increment(next ? 1 : -1),
      accomplishmentCards: cards,
      // Keep this compact compatibility field for existing home/profile surfaces.
      pinnedAccomplishment: cards[cards.length - 1] ?? null,
    });
  } catch {}
  return normalizeSolution(snap.id, { ...data, accomplishment: next, pinned: next });
}

/** Legacy API retained for callers: an accomplishment card is now pinned per puzzle. */
export async function pinAccomplishment(profile, archetypeId, pinned) {
  return toggleAccomplishment(profile, archetypeId, !!pinned);
}

const publicShareId = (uid, archetypeId) => `${uid}__${encodeURIComponent(archetypeId)}`;

export async function setSolutionVisibility(profile, archetypeId, isPublic) {
  if (!profile || isGuestProfile(profile)) throw new Error("Sign in to change solution visibility.");
  const solution = await getSavedSolution(profile.uid, archetypeId);
  if (!solution) throw new Error("Save a solution before changing its visibility.");
  const ref = solutionRef(profile.uid, archetypeId);
  const shareId = publicShareId(profile.uid, archetypeId);
  if (!isPublic) {
    try { await deleteDoc(doc(db, "sharedSolutions", shareId)); } catch {}
    await updateDoc(ref, { isPublic: false, publicShareId: null, updatedAt: Date.now() });
    return { ...solution, isPublic: false, publicShareId: null };
  }
  if (!solution.completed) throw new Error("Only completed solutions can be shared publicly.");
  if (!String(solution.code || "").trim()) throw new Error("This legacy clear has no saved source code to share publicly.");
  const share = {
    ownerUid: profile.uid,
    ownerUsername: profile.username,
    ownerAvatarIcon: profile.avatarIcon ?? null,
    ownerAvatarHue: profile.avatarHue ?? null,
    archetypeId: solution.archetypeId,
    title: solution.title,
    difficulty: solution.difficulty,
    category: solution.category ?? null,
    code: solution.code,
    language: solution.language,
    mode: solution.lastMode,
    bestTimeMs: solution.bestTimeMs ?? null,
    accomplishment: !!solution.accomplishment,
    analysis: solution.analysis ?? null,
    analysisUpdatedAt: solution.analysisUpdatedAt ?? null,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "sharedSolutions", shareId), share);
  await updateDoc(ref, { isPublic: true, publicShareId: shareId, updatedAt: Date.now() });
  return { ...solution, isPublic: true, publicShareId: shareId };
}

export async function createPublicSolutionShare(profile, archetypeId) {
  const solution = await setSolutionVisibility(profile, archetypeId, true);
  return { id: solution.publicShareId, ...solution };
}

export async function getPublicSolutionShare(id) {
  if (!id) return null;
  const snap = await getDoc(doc(db, "sharedSolutions", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getPublicPuzzleSolution(uid, archetypeId) {
  return getPublicSolutionShare(publicShareId(uid, archetypeId));
}

/** Return every explicitly public solution shared for one Training Grounds puzzle. */
export async function getPublicPuzzleSolutions(archetypeId, n = 50) {
  if (!archetypeId) return [];
  const snap = await getDocs(query(collection(db, "sharedSolutions"), where("archetypeId", "==", archetypeId)));
  return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .slice(0, n);
}

/**
 * Return the puzzle IDs that have at least one valid recorded solve. The

 * Training catalogue uses this to paint its trophy indicators in small batched
 * queries rather than issuing one Firestore request for every visible card.
 */
export async function puzzleLeaderboardIds(archetypeIds) {
  const ids = [...new Set(archetypeIds.filter(Boolean))];
  const populated = new Set();
  // Firestore's `in` operator accepts at most 30 values. Keep the reads
  // sequential to avoid a large burst when a 200-card catalogue is rendered.
  for (let i = 0; i < ids.length; i += 30) {
    const q = query(
      collection(db, "puzzleTimes"),
      where("archetypeId", "in", ids.slice(i, i + 30)),
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const record = d.data();
      if (record.solved && Number.isFinite(record.timeMs)) populated.add(record.archetypeId);
    });
  }
  return populated;
}

export async function puzzleLeaderboard(archetypeId, n = 25) {
  // Sort the filtered puzzle records in the client. This intentionally avoids a
  // composite Firestore index requirement (`archetypeId` + `timeMs`) that caused
  // otherwise-valid personal-best records to disappear from the board.
  const q = query(collection(db, "puzzleTimes"), where("archetypeId", "==", archetypeId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data())
    .filter((record) => record.solved && Number.isFinite(record.timeMs))
    .sort((a, b) => a.timeMs - b.timeMs)
    .slice(0, n);
}

/**
 * A puzzle's time board with each holder's ratings attached, so the board can
 * answer "who was this, and how strong are they?" in one place. The record docs
 * only carry a username, so the profiles are fetched alongside.
 */
export async function puzzleLeaderboardDetailed(archetypeId, n = 25) {
  const rows = await puzzleLeaderboard(archetypeId, n);
  const profiles = await Promise.all(
    rows.map((r) => getProfile(r.uid).catch(() => null))
  );
  return rows.map((r, i) => {
    const u = profiles[i];
    return {
      ...r,
      username: u?.username ?? r.username,
      rating: u?.rating ?? null,
      rd: u?.rd ?? null,
      gamesPlayed: u?.gamesPlayed ?? 0,
      soloRating: u?.soloRating ?? null,
      soloRd: u?.soloRd ?? null,
            soloRuns: u?.soloRuns ?? 0,
      avatarIcon: u?.avatarIcon ?? null,
      avatarHue: u?.avatarHue ?? null,
      country: u?.country ?? "US",
    };

  });
}

// ── Leaderboards ────────────────────────────────────────────────────────────
export async function rankedLeaderboard(n = 100) {
  const q = query(collection(db, "users"), orderBy("lbRating", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => !u.isAnonymous && (u.rankedUnlocked === true || isPlaced(u)));
}

export async function soloLeaderboard(n = 100) {
  const q = query(collection(db, "users"), orderBy("lbSolo", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((u) => !u.isAnonymous);
}

/** Subscribe to the public Ranked standings; unsubscribe when the view closes. */
export function watchRankedLeaderboard(n, cb, onError) {
  const q = query(collection(db, "users"), orderBy("lbRating", "desc"), limit(n));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
      .filter((u) => !u.isAnonymous && (u.rankedUnlocked === true || isPlaced(u))));
  }, onError);
}

/** Subscribe to the public Unranked standings; unsubscribe when the view closes. */
export function watchSoloLeaderboard(n, cb, onError) {
  const q = query(collection(db, "users"), orderBy("lbSolo", "desc"), limit(n));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((u) => !u.isAnonymous));
  }, onError);
}

/**
 * Where a player sits on the ranked board, 1-based, or null if they aren't on
 * it. Reads the top slice rather than counting the whole collection — outside
 * that slice a precise number isn't worth a second query.
 */
export async function rankedPosition(uid, within = 100) {
  if (!uid || String(uid).startsWith("local:")) return null;
  const rows = await rankedLeaderboard(within);
  const i = rows.findIndex((u) => u.uid === uid);
  return i >= 0 ? i + 1 : null;
}

// ── Player search ───────────────────────────────────────────────────────────
export async function searchPlayers(term, meUid) {
  const t = String(term || "").trim().replace(/^@/, "").toLowerCase();
  if (t.length < 2) return [];

  // The reservation document is an exact, case-insensitive username index. Look
  // there first so a known player remains findable even if an older profile is
  // missing `usernameLower` or a prefix query is temporarily unavailable.
  const exact = await getDoc(doc(db, "usernames", t)).then(async (nameSnap) => {
    const uid = nameSnap.exists() ? nameSnap.data()?.uid : null;
    if (!uid || uid === meUid) return null;
    const profile = await getProfile(uid);
    return profile && !profile.isAnonymous ? profile : null;
  }).catch(() => null);

  const hi = t + String.fromCharCode(0xf8ff);
  let prefix = [];
  try {
    const q = query(
      collection(db, "users"),
      orderBy("usernameLower"),
      where("usernameLower", ">=", t),
      where("usernameLower", "<=", hi),
      limit(12),
    );
    const snap = await getDocs(q);
    prefix = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    // Exact lookup above is still useful when a legacy deployment lacks the
    // prefix-query index. Preserve that result instead of returning nothing.
    console.warn("Player prefix search unavailable", error);
  }

  const unique = new Map();
  if (exact) unique.set(exact.uid, exact);
  prefix.forEach((profile) => unique.set(profile.uid, profile));
  return [...unique.values()]
    .filter((profile) => profile.uid !== meUid && !profile.isAnonymous)
    .sort((a, b) => {
      const aExact = String(a.usernameLower || a.username || "").toLowerCase() === t;
      const bExact = String(b.usernameLower || b.username || "").toLowerCase() === t;
      return Number(bExact) - Number(aExact) || String(a.username).localeCompare(String(b.username));
    })
    .slice(0, 12);
}

// ── Friends ─────────────────────────────────────────────────────────────────
export function watchFriends(uid, cb) {
  return onSnapshot(collection(db, "friends", uid, "list"), (snap) =>
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  );
}

export async function getFriends(uid) {
  const snap = await getDocs(collection(db, "friends", uid, "list"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function sendFriendRequest(me, target) {
  // The request itself lives under the recipient (they're the one who acts on
  // it); a mirror under the sender is what lets the UI show "Pending" without
  // reading someone else's inbox.
  const batch = writeBatch(db);
  batch.set(doc(db, "friendRequests", target.uid, "from", me.uid), {
    fromUid: me.uid, fromUsername: me.username, createdAt: Date.now(),
  });
  batch.set(doc(db, "friendRequests", me.uid, "sent", target.uid), {
    toUid: target.uid, toUsername: target.username, createdAt: Date.now(),
  });
  await batch.commit();
  await notify(target.uid, {
    type: "friend_request",
    fromUid: me.uid,
    fromUsername: me.username,
    text: `${me.username} sent you a friend request`,
  });
}

export async function getSentRequests(uid) {
  const snap = await getDocs(collection(db, "friendRequests", uid, "sent"));
  return snap.docs.map((d) => d.id);
}

export function watchIncomingFriendRequests(uid, cb) {
  return onSnapshot(collection(db, "friendRequests", uid, "from"), (snap) =>
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  );
}

export async function acceptFriendRequest(me, fromUid, fromUsername) {
  const batch = writeBatch(db);
  batch.set(doc(db, "friends", me.uid, "list", fromUid), {
    uid: fromUid, username: fromUsername, since: Date.now(),
  });
  batch.set(doc(db, "friends", fromUid, "list", me.uid), {
    uid: me.uid, username: me.username, since: Date.now(),
  });
  batch.delete(doc(db, "friendRequests", me.uid, "from", fromUid));
  batch.delete(doc(db, "friendRequests", fromUid, "sent", me.uid));
  await batch.commit();
  await notify(fromUid, {
    type: "friend_accepted",
    fromUid: me.uid, fromUsername: me.username,
    text: `${me.username} accepted your friend request`,
  });
}

export async function declineFriendRequest(meUid, fromUid) {
  await deleteDoc(doc(db, "friendRequests", meUid, "from", fromUid));
  try { await deleteDoc(doc(db, "friendRequests", fromUid, "sent", meUid)); } catch {}
}

export async function removeFriend(meUid, otherUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "friends", meUid, "list", otherUid));
  batch.delete(doc(db, "friends", otherUid, "list", meUid));
  await batch.commit();
}

// ── Notifications ───────────────────────────────────────────────────────────
export async function notify(uid, payload) {
  try {
    await addDoc(collection(db, "notifications", uid, "items"), {
      ...payload, read: false, createdAt: Date.now(),
    });
  } catch { /* notifying is never worth failing the action over */ }
}

export function watchNotifications(uid, cb) {
  const q = query(collection(db, "notifications", uid, "items"), orderBy("createdAt", "desc"), limit(30));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function markNotificationRead(uid, id) {
  try { await updateDoc(doc(db, "notifications", uid, "items", id), { read: true }); } catch {}
}

export async function markAllRead(uid, ids) {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.update(doc(db, "notifications", uid, "items", id), { read: true }));
  try { await batch.commit(); } catch {}
}

export async function deleteNotification(uid, id) {
  try { await deleteDoc(doc(db, "notifications", uid, "items", id)); } catch {}
}

/** Permanently clear every notification owned by this profile. */
export async function clearNotifications(uid) {
  if (!uid) return;
  const snap = await getDocs(collection(db, "notifications", uid, "items"));
  const refs = snap.docs.map((entry) => entry.ref);
  for (let start = 0; start < refs.length; start += 450) {
    const batch = writeBatch(db);
    refs.slice(start, start + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

// ── Presence / online counts ───────────────────────────────────────────────
/**
 * Set a presence doc for a user. Best-effort: callers should swallow failures.
 * Document stored at `presence/{uid}`: { online: bool, lastSeen: timestamp, inMatch: bool }
 */
export async function setPresence(uid, patch = {}) {
  if (!uid) return;
  try {
    const payload = { online: patch.online !== false, lastSeen: Date.now() };
    // Heartbeats only refresh `online`; they must not turn a live red ring green.
    if (typeof patch.inMatch === "boolean") payload.inMatch = patch.inMatch;
    const ref = doc(db, "presence", uid);
    await setDoc(ref, payload, { merge: true });
  } catch { /* ignore */ }
}

const PRESENCE_TTL_MS = 65000;

/** Treat stale heartbeat documents as offline; closed tabs cannot always write. */
export function normalizedPresence(data, now = Date.now()) {
  const fresh = !!data?.online && Number(data?.lastSeen || 0) >= now - PRESENCE_TTL_MS;
  return { online: fresh, inMatch: fresh && !!data?.inMatch, lastSeen: data?.lastSeen ?? null };
}

/** Watch a single user's fresh presence state, including heartbeat expiry. */
export function watchPresence(uid, cb) {
  if (!uid) return () => {};
  const ref = doc(db, "presence", uid);
  let expiryTimer = null;
  let last = null;
  const publish = () => {
    cb(normalizedPresence(last));
    if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null; }
    if (last?.online && last?.lastSeen) {
      const wait = Math.max(0, Number(last.lastSeen) + PRESENCE_TTL_MS - Date.now()) + 10;
      expiryTimer = setTimeout(publish, wait);
    }
  };
  const unsub = onSnapshot(ref, (s) => { last = s.exists() ? s.data() : null; publish(); });
  return () => { if (expiryTimer) clearTimeout(expiryTimer); unsub(); };
}

/** Watch global presence counts: calls cb({ inMatches, onlineNotInMatch, totalPresenceDocs }) */
export function watchPresenceCounts(cb) {
  const q = query(collection(db, "presence"));
  let latest = [];
  const publish = () => {
    let inMatches = 0, onlineNotInMatch = 0;
    latest.forEach((data) => {
      const fresh = normalizedPresence(data);
      if (fresh.inMatch) inMatches++;
      else if (fresh.online) onlineNotInMatch++;
    });
    cb({ inMatches, onlineNotInMatch, totalPresenceDocs: latest.length });
  };
  const unsub = onSnapshot(q, (snap) => { latest = snap.docs.map((d) => d.data()); publish(); });
  const timer = setInterval(publish, 5000);
  return () => { clearInterval(timer); unsub(); };
}

/** Return approximate total users by counting the users collection once. */
export async function getTotalUsers() {
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.size;
  } catch { return null; }
}

/** Keep the global player count live alongside the live presence statistics. */
export function watchTotalUsers(cb) {
  return onSnapshot(collection(db, "users"), (snap) => cb(snap.size));
}

// ── Messaging ───────────────────────────────────────────────────────────────
export const convIdFor = (a, b) => [a, b].sort().join("__");

export async function ensureConversation(me, other) {
  const id = convIdFor(me.uid, other.uid);
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me.uid, other.uid],
      names: { [me.uid]: me.username, [other.uid]: other.username },
      lastMessage: "", lastAt: Date.now(),
    });
  }
  return id;
}

export function watchConversations(uid, cb) {
  const q = query(collection(db, "conversations"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0));
    cb(list);
  });
}

export function watchMessages(convId, cb) {
  const q = query(collection(db, "conversations", convId, "messages"), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function sendMessage(convId, me, other, text) {
  const body = text.trim().slice(0, 1000);
  if (!body) return;
  await addDoc(collection(db, "conversations", convId, "messages"), {
    fromUid: me.uid, fromUsername: me.username, text: body, createdAt: Date.now(),
  });
  await updateDoc(doc(db, "conversations", convId), {
    lastMessage: body, lastAt: Date.now(),
  });
  if (other?.uid) {
    await notify(other.uid, {
      type: "message", fromUid: me.uid, fromUsername: me.username,
      text: `${me.username}: ${body.slice(0, 60)}`,
    });
  }
}

// Edit and delete helpers for messaging
export async function editMessage(convId, msgId, me, newText) {
  const body = String(newText || "").trim().slice(0, 1000);
  if (!body) return;
  const msgRef = doc(db, "conversations", convId, "messages", msgId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) throw new Error("Message not found");
  const data = snap.data();
  if (data.fromUid !== me.uid) throw new Error("Not allowed");
  await updateDoc(msgRef, { text: body, editedAt: Date.now(), editedBy: me.uid });
  // If this message was the conversation's lastMessage, update that too so
  // the list view reflects the edit.
  try {
    const convRef = doc(db, "conversations", convId);
    const convSnap = await getDoc(convRef);
    if (convSnap.exists() && convSnap.data().lastAt === data.createdAt) {
      await updateDoc(convRef, { lastMessage: body });
    }
  } catch { /* best-effort only */ }
  return true;
}

export async function deleteMessage(convId, msgId, me) {
  const msgRef = doc(db, "conversations", convId, "messages", msgId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) throw new Error("Message not found");
  const data = snap.data();
  if (data.fromUid !== me.uid) throw new Error("Not allowed");

  // Mark the original message as deleted and append a small system note to the
  // thread so both participants see that a deletion occurred.
  try {
    await updateDoc(msgRef, {
      text: "[deleted]",
      deleted: true,
      deletedBy: me.uid,
      deletedAt: Date.now(),
    });
  } catch (e) { throw e; }

  const sysText = `${me.username} deleted a message`;
  try {
    await addDoc(collection(db, "conversations", convId, "messages"), {
      system: true, text: sysText, createdAt: Date.now(), byUid: me.uid,
    });
  } catch { /* ignore */ }

  // If the deleted message was the conversation's lastMessage, update the
  // conversation record so list views show the deletion.
  try {
    const convRef = doc(db, "conversations", convId);
    const convSnap = await getDoc(convRef);
    if (convSnap.exists() && convSnap.data().lastAt === data.createdAt) {
      await updateDoc(convRef, { lastMessage: sysText, lastAt: Date.now() });
    }

    // Notify the other participants that a deletion occurred.
    const participants = convSnap.exists() ? convSnap.data().participants : [];
    for (const uid of participants) {
      if (uid !== me.uid) {
        await notify(uid, { type: "message_deleted", fromUid: me.uid, text: sysText });
      }
    }
  } catch { /* best-effort */ }

  return true;
}

// ── Friend challenges ───────────────────────────────────────────────────────
export async function createChallenge(me, target, mode = "casual") {
  const ref = await addDoc(collection(db, "challenges"), {
    fromUid: me.uid, fromUsername: me.username,
    fromRating: me.rating, fromRd: me.rd,
    toUid: target.uid, toUsername: target.username,
    mode, status: "pending", duelId: null, createdAt: Date.now(),
  });
  await notify(target.uid, {
    type: "challenge", fromUid: me.uid, fromUsername: me.username,
    challengeId: ref.id,
    text: `${me.username} challenged you to a ${mode === "rated" ? "rated" : "casual"} Burst duel`,
  });
  return ref.id;
}

export function watchChallenge(id, cb) {
  return onSnapshot(doc(db, "challenges", id), (s) => {
    if (s.exists()) cb({ id: s.id, ...s.data() });
  });
}

export function watchIncomingChallenges(uid, cb) {
  const q = query(collection(db, "challenges"), where("toUid", "==", uid), where("status", "==", "pending"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function setChallengeStatus(id, status, duelId = null) {
  await updateDoc(doc(db, "challenges", id), { status, duelId });
}

export async function getChallenge(id) {
  const s = await getDoc(doc(db, "challenges", id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
