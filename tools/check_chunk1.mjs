import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [arena, game, store, training, profile, share, app, index, changelog, rules] = await Promise.all([
  read("public/js/js/arena.js"),
  read("public/js/js/game.js"),
  read("public/js/js/store.js"),
  read("public/js/js/views/training.js"),
  read("public/js/js/views/profile.js"),
  read("public/js/js/views/share.js"),
  read("public/js/js/app.js"),
  read("public/index.html"),
  read("public/js/js/views/changelog.js"),
  read("firestore.rules"),
]);

assert.match(arena, /code: this\.ta\?\.value/, "arena completions must retain submitted source");
assert.match(arena, /language: this\.lang/, "arena completions must retain the source language");
assert.match(game, /saveCompletedSolution\(profile, problem/, "successful game flows must save accepted source");
assert.match(game, /mode: "unranked"/, "Unranked solutions must retain their mode");
assert.match(game, /mode: "training"/, "Training solutions must retain their mode");
assert.match(game, /mode: "ranked"/, "Ranked solutions must retain their mode");
assert.match(store, /export async function saveCompletedSolution/, "saved-solution persistence must exist");
assert.match(store, /export async function getSavedSolutions/, "the Training library must retrieve saved solutions");
assert.match(store, /export async function getSolutionHistory/, "per-problem submission history must be available");
assert.match(store, /export async function toggleAccomplishment/, "solved problems must support accomplishments");
assert.match(store, /export async function createPublicSolutionShare/, "a completed solution must be shareable");
assert.match(store, /export async function getPublicSolutionShare/, "public solution pages must be retrievable");
assert.match(training, /Solution library/, "Training must expose a solution library");
assert.match(training, /Mark accomplishment/, "Training must expose accomplishment controls");
assert.match(training, /Public solution link copied/, "Training must copy a public solution link");
assert.match(profile, /Saved solutions/, "profiles must show saved-solution totals");
assert.match(profile, /Accomplishments/, "profiles must show accomplishment totals");
assert.match(share, /PUBLIC SOLUTION/, "the public share route needs a dedicated UI");
assert.match(app, /route\("\/share\/:id", renderPublicSolution\)/, "the public share route must be registered");
assert.match(rules, /match \/users\/\{uid\}\/solutions\/\{archetypeId\}/, "private solution documents need explicit rules");
assert.match(rules, /match \/sharedSolutions\/\{shareId\}/, "public share snapshots need explicit rules");
assert.match(index, /v1\.3 \[C1 BETA\]/, "page metadata must identify the Chunk 1 beta");
assert.match(app, /v1\.3 \[C1 BETA\]/, "navigation must identify the Chunk 1 beta");
assert.match(arena, /v1\.3 \[C1 BETA\]/, "arena boot copy must identify the Chunk 1 beta");
assert.match(changelog, /version: "v1\.3 \[C1 BETA\]"/, "changelog must identify the Chunk 1 beta");

console.log("v1.3 chunk 1 checks passed");
