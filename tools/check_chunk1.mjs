import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [arena, game, store, training, profile, home, share, app, index, changelog, rules] = await Promise.all([
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
]);

assert.match(arena, /code: this\.ta\?\.value/, "arena completions must retain submitted source");
assert.match(arena, /language: this\.lang/, "arena completions must retain the source language");
assert.match(game, /saveAttemptButton/, "result screens must expose an explicit save action");
assert.match(game, /saveSolution\(profile, problem/, "manual save actions must persist the submitted source");
assert.match(game, /mode: "unranked"/, "Unranked solutions must retain their mode");
assert.match(game, /mode: "training"/, "Training solutions must retain their mode");
assert.match(game, /mode: "ranked"/, "Ranked solutions must retain their mode");
assert.match(store, /export async function saveSolution/, "saved-solution persistence must exist");
assert.match(store, /completed: everCompleted/, "solutions must retain completed or incomplete status");
assert.match(store, /export async function setSolutionVisibility/, "solutions must support private-by-default public sharing");
assert.match(store, /export async function pinAccomplishment/, "accomplishments must support a profile pin");
assert.match(store, /export async function getPublicPuzzleSolution/, "leaderboards must retrieve an explicitly public solution by player and puzzle");
assert.match(store, /export async function getSavedSolutions/, "the Training library must retrieve saved solutions");
assert.match(store, /export async function getSolutionHistory/, "per-problem submission history must be available");
assert.match(store, /export async function toggleAccomplishment/, "solved problems must support accomplishments");
assert.match(store, /export async function createPublicSolutionShare/, "a completed solution must be shareable");
assert.match(store, /export async function getPublicSolutionShare/, "public solution pages must be retrievable");
assert.match(training, /My solutions/, "Training must expose a dedicated Solutions workspace");
assert.match(training, /solutions-side/, "Solutions must have difficulty side navigation");
assert.match(training, /All categories/, "Training must expose category filtering");
assert.match(game, /Save incomplete/, "incomplete submission save wording must be available");
assert.match(training, /Mark accomplishment/, "Training must expose accomplishment controls");
assert.match(training, /Pin to profile/, "Training must expose accomplishment pinning");
assert.match(training, /View solution/, "puzzle leaderboards must expose public solution views");
assert.match(profile, /Saved solutions/, "profiles must show saved-solution totals");
assert.match(profile, /Accomplishments/, "profiles must show accomplishment totals");
assert.match(profile, /profile-pinned-accomplishment/, "profiles must show a pinned accomplishment badge");
assert.match(profile, /coords\.map/, "rating graphs must draw visible point coordinates");
assert.match(home, /home-news/, "the home dashboard must include the news panel");
assert.match(home, /streak % 5 === 0/, "friend streak news must use five-day milestones");
assert.match(share, /PUBLIC SOLUTION/, "the public share route needs a dedicated UI");
assert.match(app, /route\("\/share\/:id", renderPublicSolution\)/, "the public share route must be registered");
assert.match(rules, /match \/users\/\{uid\}\/solutions\/\{archetypeId\}/, "private solution documents need explicit rules");
assert.match(rules, /match \/sharedSolutions\/\{shareId\}/, "public share snapshots need explicit rules");
assert.match(index, /v1\.3 \[C1 BETA\]/, "page metadata must identify the Chunk 1 beta");
assert.match(app, /v1\.3 \[C1 BETA\]/, "navigation must identify the Chunk 1 beta");
assert.match(arena, /v1\.3 \[C1 BETA\]/, "arena boot copy must identify the Chunk 1 beta");
assert.match(changelog, /version: "v1\.3 \[C1 BETA\]"/, "changelog must identify the Chunk 1 beta");

console.log("v1.3 chunk 1 checks passed");
