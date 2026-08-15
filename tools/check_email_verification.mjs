import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [firebase, session, store, game, rules, home, leaderboard] = await Promise.all([
  read("public/js/js/firebase.js"),
  read("public/js/js/session.js"),
  read("public/js/js/store.js"),
  read("public/js/js/game.js"),
  read("firestore.rules"),
  read("public/js/js/views/home.js"),
  read("public/js/js/views/leaderboard.js"),
]);

assert.match(firebase, /sendEmailVerification, reload/, "Firebase verification SDK functions must be re-exported");
assert.match(session, /export function needsEmailVerification/, "session needs a reusable verification predicate");
assert.match(session, /export function openEmailVerificationModal/, "unverified accounts need an activation screen");
assert.match(session, /await sendEmailVerification\(cred\.user, verificationActionSettings\(\)\)/,
  "email/password sign-up must send the verification message");
assert.match(session, /await reload\(auth\.currentUser\)/,
  "the confirmation action must refresh Firebase verification state");
assert.match(session, /getIdToken\(true\)/,
  "the confirmation action must refresh the Firestore auth claim");
assert.ok(
  session.indexOf("if (needsEmailVerification(user))") < session.indexOf("const profile = await ensureProfile(user)"),
  "unverified accounts must be blocked before a profile can be created",
);
assert.match(store, /passwordAccount && !user\.emailVerified/,
  "the profile data layer must independently reject unverified password accounts");
assert.match(game, /const user = await requireAccount\("play"\)/,
  "ranked matchmaking must require an active verified account");
assert.match(rules, /function verifiedUser\(\).*email_verified == true/,
  "Firestore must verify the Firebase email claim");
assert.match(rules, /allow write: if isVerifiedMe\(uid\);/,
  "profile writes must be limited to verified owners");
assert.match(rules, /match \/matchmaking_lobby\/\{uid\}[\s\S]*allow create: if isVerifiedMe\(uid\);/,
  "matchmaking must reject unverified accounts at the backend");
assert.doesNotMatch(home, /anonymous Ranked match/,
  "the signed-out home copy must no longer promise anonymous ranked access");
assert.match(session, /export function markVoluntaryAccountDeletion/,
  "voluntary self-deletion must be distinguishable from external removal");
assert.match(session, /function showRemovedAccountScreen/,
  "a removed account needs an unskippable notice");
assert.match(session, /Your ByteBlitz account has been banned/,
  "the removal notice must clearly explain the account state");
assert.match(session, /closable: false/,
  "the removal notice must not be dismissible");
assert.match(session, /setInterval\(check, 5000\)/,
  "Firebase Authentication removal must be checked promptly");
assert.doesNotMatch(session, /function installRefreshOnReturn/,
  "switching tabs must not trigger an automatic page reload");
assert.doesNotMatch(session, /visibilitychange/,
  "the session layer must not reload the page when a tab becomes visible");
assert.match(session, /most likely be in your Spam or Junk folder/,
  "the verification dialog must direct players to the likely Spam or Junk location");
assert.match(store, /else if \(typeof onMissing === "function"\) onMissing\(\)/,
  "profile deletion must be observable immediately through Firestore");
assert.match(store, /export function watchRankedLeaderboard/,
  "Ranked standings must have a real-time subscription");
assert.match(store, /export function watchSoloLeaderboard/,
  "Unranked standings must have a real-time subscription");
assert.match(leaderboard, /watchRankedLeaderboard\(ROWS, receive, fail\)/,
  "the leaderboard view must subscribe to Ranked snapshots");
assert.match(leaderboard, /watchSoloLeaderboard\(ROWS, receive, fail\)/,
  "the leaderboard view must subscribe to Unranked snapshots");
assert.match(leaderboard, /getBoundingClientRect\(\)/,
  "live row positions must be measured before a re-order");
assert.match(leaderboard, /row\.animate\(/,
  "a rank overtake must animate the moving row");
assert.match(leaderboard, /boardUnsub\?\.\(\)/,
  "the live leaderboard subscription must be cleaned up on navigation");

console.log("email verification, lifecycle, and live leaderboard checks passed");
