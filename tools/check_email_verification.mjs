import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [firebase, session, store, game, rules, home] = await Promise.all([
  read("public/js/js/firebase.js"),
  read("public/js/js/session.js"),
  read("public/js/js/store.js"),
  read("public/js/js/game.js"),
  read("firestore.rules"),
  read("public/js/js/views/home.js"),
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

console.log("email verification checks passed");
