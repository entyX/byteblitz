import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

const [arena, game, store, training, profile, home, share, analysis, analysisEngine, matchmaking, app, index, changelog, rules, duelPresence, firebase, css] = await Promise.all([
  read("public/js/js/arena.js"),
  read("public/js/js/game.js"),
  read("public/js/js/store.js"),
  read("public/js/js/views/training.js"),
  read("public/js/js/views/profile.js"),
  read("public/js/js/views/home.js"),
  read("public/js/js/views/share.js"),
  read("public/js/js/views/analysis.js"),
  read("public/js/js/analysis-engine.js"),
  read("public/js/js/matchmaking.js"),
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
assert.match(app, /route\("\/share\/:id", renderPublicAnalysis\)/, "the public analysis share route must be registered");
assert.match(app, /route\("\/analysis\/duel\/:id", renderDuelAnalysis\)/, "post-match analysis must have a dedicated URL");
assert.match(app, /route\("\/analysis\/:uid\/:archetypeId", renderPrivateAnalysis\)/, "private solution analysis must have a dedicated URL");
assert.match(rules, /match \/users\/\{uid\}\/solutions\/\{archetypeId\}/, "private solution documents need explicit rules");
assert.match(rules, /match \/sharedSolutions\/\{shareId\}/, "public share snapshots need explicit rules");
assert.match(index, /v1\.3 \[C4 BETA\]/, "page metadata must identify the active Chunk 4 beta");
assert.match(app, /v1\.3 \[C4 BETA\]/, "navigation must identify the active Chunk 4 beta");
assert.match(arena, /v1\.3 \[C4 BETA\]/, "arena boot copy must identify the active Chunk 4 beta");
assert.match(changelog, /version: "v1\.3 \[C4 BETA\]"/, "changelog must identify the active Chunk 4 beta");
assert.match(changelog, /version: "v1\.3 \[C3 BETA\]"/, "changelog must retain the prior Chunk 3 beta history");
assert.match(changelog, /version: "v1\.3 \[C2 BETA\]"/, "changelog must retain the prior Chunk 2 beta history");
assert.match(changelog, /version: "v1\.3 \[C1 BETA\]"/, "changelog must retain the prior Chunk 1 beta history");
assert.match(changelog, /date: "August 16, 2026"/, "C4 beta must carry the current release date");
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
assert.match(analysisEngine, /Qwen2\.5-Coder-1\.5B-Instruct/, "analysis must use the requested fast local Qwen coding model");
assert.match(analysisEngine, /CreateMLCEngine/, "analysis must load the browser-local model through WebLLM");
assert.match(analysisEngine, /askCodeCoach/, "analysis must provide a local coaching chat");
assert.match(analysis, /This solution is private/, "private analysis links must show a clear access message");
assert.match(analysis, /Submission progression/, "analysis must present all retained submission progress");
assert.match(training, /Analyze My Code/, "Training Grounds must expose Analyze My Code");
assert.match(training, /icon\("bulb"/, "Training analysis shortcuts must use the lightbulb icon");
assert.match(game, /Analyze match/, "duel results must expose post-match analysis");
assert.match(store, /export async function saveSolutionAnalysis/, "solution analysis must be persisted for owner and public-share views");
assert.match(matchmaking, /getDuelSubmissionHistory/, "duels must retain full submission progression for analysis");
assert.match(rules, /duels\/\{duelId\}\/submissions/, "duel submission history needs participant-only Firestore rules");
assert.match(training, /solution-card-actions/, "solution cards must use a consolidated action layout");
assert.match(training, /solution-hub-actions/, "View solution must open the hub for sharing and accomplishments");
assert.match(training, /ui-tooltip/, "solution icon controls must provide custom tooltips");
assert.match(game, /Analyze solution/, "completed Training and Unranked results must provide direct analysis access");
assert.match(analysis, /analysis-workspace-grid/, "analysis must use the requested three-pane workspace");
assert.match(analysis, /Opponent code/, "duel analysis must expose an opponent-code tab");
assert.match(analysis, /Request improvements/, "analysis must require an explicit improvement request before applying code changes");
assert.match(analysis, /coachMessageBody/, "analysis coaching must format fenced code blocks separately from prose");
assert.match(analysis, /syntaxCode/, "analysis code panes must use syntax-color rendering");
assert.match(analysis, /loadAllPools/, "analysis must resolve saved solutions against every authored problem pool");
assert.match(analysis, /Share and privacy settings/, "analysis must expose compact share controls beside code actions");
assert.match(analysis, /runSandboxTests/, "analysis must provide a local-only editor test runner");
assert.match(analysis, /browser-local copy|browser\. It never changes solve time/, "editor changes must clearly remain local-only");
assert.match(analysis, /Apply to editor/, "coach code snippets must be applicable to the local editor");
assert.match(analysis, /coachProse/, "coach replies must render rich Markdown prose");
assert.match(analysis, /Code grade/, "analysis must render a letter grade instead of exposing a numeric score");
assert.match(analysis, /No distinct rewrite was prepared/, "non-S grades must not claim that no improvement exists when an automatic rewrite is unavailable");
assert.match(analysis, /collapseButton/, "problem and coach sections must be collapsible");
assert.match(analysis, /paneResizer/, "analysis panes must expose draggable horizontal resizers");
assert.match(analysis, /Analyze current code/, "the primary analysis action must analyze whichever code is currently shown");
assert.match(analysis, /Best target:/, "time and space metrics must show their best feasible target");
assert.match(analysis, /analysis-metric-grade/, "time and space metrics must show percentage and letter ratings");
assert.match(analysis, /S tier complete/, "S-tier review controls must be visibly completed and disabled");
assert.match(analysis, /Review conclusion/, "S-tier reports must state the final no-change conclusion instead of showing improvement lists");
assert.match(analysis, /originalAnalysis/, "legacy analysis state may remain available for compatibility");
assert.match(analysis, /originalCode: ""/, "fresh current-code analysis must not send original source as grading context");
assert.match(analysis, /materiallyDifferentCode/, "unchanged coach snippets must be detected before application");
assert.match(analysis, /localAnalysisSources/, "local analysis must be tied to the exact unsaved source being reviewed");
assert.match(analysis, /localTestResults/, "local analysis must carry exact local test results into the review");
assert.match(analysis, /await runSandboxTests/, "Analyze local edits must run the draft tests before grading");
assert.doesNotMatch(analysis, /Specific code references/, "analysis must not render the redundant code-reference panel");
assert.match(analysisEngine, /function formatProblemBrief/, "analysis prompts must include complete problem context and constraints");
assert.match(analysisEngine, /failureDiagnosis/, "analysis must explain recorded failed-test evidence");
assert.match(analysisEngine, /export async function improveCode/, "analysis must generate guided code improvements");
assert.match(analysisEngine, /no_change/, "guided improvements must communicate when no safe rewrite is needed");
assert.match(analysisEngine, /detailedList/, "analysis must reject shallow one-word observations");
assert.match(analysisEngine, /lineReference/, "fallback analysis must cite concrete source lines");
assert.match(analysisEngine, /gradeForScore/, "analysis must compute consistent letter grades");
assert.match(analysisEngine, /below 92/, "sub-top-tier reviews must request a concrete improvement");
assert.match(analysisEngine, /No automatic rewrite was prepared/, "non-S no-change outcomes must explain automatic rewrite limits without contradicting the grade");
assert.match(analysisEngine, /materially different from CURRENT CODE/, "guided improvements must reject unchanged source suggestions");
assert.match(analysisEngine, /CURRENT CODE ON SCREEN/, "fresh reviews must judge the code currently shown");
assert.match(analysisEngine, /DO NOT USE PRIOR REVIEWS/, "fresh reviews must not inherit prior grading context");
assert.match(analysisEngine, /safeOutputConstructionRewrite/, "identified output-construction weaknesses must have a safe rewrite fallback");
assert.match(analysisEngine, /metricRating/, "analysis must grade time and space efficiency against the best target");
assert.match(analysisEngine, /reviewDecision/, "one review decision contract must govern grades, metrics, and improvements");
assert.match(analysisEngine, /S means the visible solution/, "the model prompt must define S tier as complete with no actionable issue");
assert.match(analysisEngine, /decision\.complete/, "S-tier decisions must prevent improvement generation and coach rewrite advice");
assert.match(analysisEngine, /failedLocalTest/, "failed local tests must override inherited original-review evidence");
assert.match(css, /analysis-workspace-grid/, "analysis workspace must be styled as a three-pane layout");
assert.match(css, /\[data-tooltip\]/, "custom tooltip styling must exist for compact controls");
assert.match(css, /analysis-editor-input/, "analysis editor must have dedicated local sandbox styling");
assert.match(css, /grade-s/, "analysis grades must include S-tier styling");
assert.match(css, /analysis-pane-resizer/, "analysis workspace must style draggable pane splitters");
assert.match(css, /analysis-collapse-btn/, "analysis workspace must style collapsible controls");
assert.match(css, /analysis-metric-grade/, "time and space metric grades must have dedicated styling");
assert.match(css, /analysis-coach-unchanged/, "unchanged coach-code notices must be styled clearly");

console.log("v1.3 chunk 1 checks passed");
