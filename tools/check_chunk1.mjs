import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [arena, game, store, training, profile, home, share, app, index, changelog, rules, duelPresence, firebase, css] = await Promise.all([
  read("public/js/js/arena.js"),
  read("public/js/js/game.js"),
  read("public/js/js/store.js"),
  read("public/js/js/views/training.js"),
  read("public/js/js/views/profile.js"),
  read("public/js/js/views/home.js"),
  read("public/js/js/views/share.js"),
  read("public/js/js/app.js"),
  read("public/index.html"),
  read("public/js/js/views/changelog.js"),
  read("firestore.rules"),
  read("public/js/js/duel-presence.js"),
  read("public/js/js/firebase.js"),
  read("public/css/app.css"),
]);

assert.match(arena, /code: this\.ta\?\.value/, "arena completions must retain submitted source");
assert.match(arena, /language: this\.lang/, "arena completions must retain the source language");
assert.match(game, /autoSaveAttempt/, "result screens must automatically save eligible submissions");
assert.match(game, /saveSolution\(profile, problem/, "manual save actions must persist the submitted source");
assert.match(game, /mode: "unranked"/, "Unranked solutions must retain their mode");
assert.match(game, /mode: "training"/, "Training solutions must retain their mode");
assert.match(game, /mode: "ranked"/, "Ranked solutions must retain their mode");
assert.match(game, /archetypeId: problem\.archetypeId/, "Unranked and Ranked history must retain puzzle identity for Training leaderboard recovery");
assert.match(store, /export async function saveSolution/, "saved-solution persistence must exist");
assert.match(store, /completed: everCompleted/, "solutions must retain completed or incomplete status");
assert.match(store, /export async function setSolutionVisibility/, "solutions must support private-by-default public sharing");
assert.match(store, /export async function getAccomplishableSolution/, "legacy verified clears must be materialized for accomplishments");
assert.match(store, /pinned: next/, "an accomplishment must automatically become the profile status");
assert.match(store, /export async function syncSavedSolutionsToPuzzleRecords/, "saved completed solves must reconcile into Training puzzle leaderboards");
assert.match(store, /export async function getPublicPuzzleSolution/, "leaderboards must retrieve an explicitly public solution by player and puzzle");
assert.match(store, /export async function getSavedSolutions/, "the Training library must retrieve saved solutions");
assert.match(store, /export async function getSolutionHistory/, "per-problem submission history must be available");
assert.match(store, /export async function toggleAccomplishment/, "solved problems must support accomplishments");
assert.match(store, /export async function createPublicSolutionShare/, "a completed solution must be shareable");
assert.match(store, /export async function getPublicSolutionShare/, "public solution pages must be retrievable");
assert.match(training, /My solutions/, "Training must expose a right-aligned My Solutions navigation action");
assert.match(training, /training-filter-side/, "Training categories and solution filters must use a right-side navigation rail");
assert.match(training, /All categories/, "Training must expose category filtering");
assert.match(training, /solution-public-url/, "public solutions must visibly show their share link beneath the visibility switch");
assert.match(game, /Solution saved automatically/, "automatic save confirmation wording must be available");
assert.match(training, /Add to accomplishments/, "Training must expose the renamed accomplishment control");
assert.match(training, /solution-play-icon/, "solution cards must expose a compact play icon beside their status");
assert.match(training, /View solution/, "puzzle leaderboards must expose public solution views");
assert.match(profile, /Saved solutions/, "profiles must show saved-solution totals");
assert.match(profile, /Accomplishments/, "profiles must show accomplishment totals");
assert.match(profile, /profile-accomplishment-cards/, "profiles must show per-puzzle accomplishment badge cards");
assert.match(profile, /coords\.map/, "rating graphs must draw visible point coordinates");
assert.match(profile, /createElementNS/, "rating graphs must use real SVG elements that render in browsers");
assert.match(home, /home-news/, "the home dashboard must include the news panel");
assert.match(home, /streak % 5 === 0/, "friend streak news must use five-day milestones");
assert.match(share, /PUBLIC SOLUTION/, "the public share route needs a dedicated UI");
assert.match(app, /route\("\/share\/:id", renderPublicSolution\)/, "the public share route must be registered");
assert.match(rules, /match \/users\/\{uid\}\/solutions\/\{archetypeId\}/, "private solution documents need explicit rules");
assert.match(rules, /match \/sharedSolutions\/\{shareId\}/, "public share snapshots need explicit rules");
assert.match(index, /v1\.3 \[C2 BETA\]/, "page metadata must identify the active Chunk 2 beta");
assert.match(app, /v1\.3 \[C2 BETA\]/, "navigation must identify the active Chunk 2 beta");
assert.match(arena, /v1\.3 \[C2 BETA\]/, "arena boot copy must identify the active Chunk 2 beta");
assert.match(changelog, /version: "v1\.3 \[C2 BETA\]"/, "changelog must identify the active Chunk 2 beta");
assert.match(changelog, /version: "v1\.3 \[C1 BETA\]"/, "changelog must retain the prior Chunk 1 beta history");
assert.match(changelog, /date: "August 15, 2026"/, "C2 beta must carry the requested August 15 release date");
assert.match(game, /joinDuelPresence/, "duels must establish dedicated live presence");
assert.match(duelPresence, /rtdbOnDisconnect/, "live presence must clean up on a real disconnect");
assert.match(firebase, /getDatabase/, "Firebase bootstrap must expose Realtime Database");
assert.match(arena, /autoStartTimer/, "duels must auto-enter when the shared start time arrives");
assert.match(game, /abortedReason/, "duels must distinguish a withdrawal from a neutral disconnect abort");
assert.match(store, /export async function trashSavedSolution/, "saved solutions must support permanent trashing");
assert.match(training, /icon\("trash"/, "My Solutions must expose a trash-icon control");
assert.match(profile, /Solve time/, "accomplishment cards must show best solve time");
assert.match(css, /result-actions/, "post-game actions must have a centered action class");
assert.match(css, /modal-postmatch-comparison/, "code comparison must request an enlarged responsive modal");

console.log("v1.3 chunk 1 checks passed");
