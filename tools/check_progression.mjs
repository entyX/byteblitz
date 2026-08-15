import assert from "node:assert/strict";
import {
  CONFIDENCE_MAX,
  PLACEMENT_GAMES,
  SKILL_LEVELS,
  confidenceForPlacementGames,
  displayPlacementRating,
  isPlaced,
  placementConfidence,
  placementGamesPlayed,
  placementLeft,
  placementCalibration,
  rankFor,
} from "../public/js/js/glicko.js";

const fresh = { placementGames: 0, placementConfidence: 0, soloRuns: 0 };
const mid = { placementGames: 3, placementConfidence: 5, soloRuns: 3 };
const complete = { placementGames: 7, placementConfidence: 10, soloRuns: 7 };

assert.equal(PLACEMENT_GAMES, 7, "placement must require seven Unranked games");
assert.equal(CONFIDENCE_MAX, 10, "confidence must cap at 10");
assert.equal(placementGamesPlayed(fresh), 0);
assert.equal(placementLeft(fresh), 7);
assert.equal(placementConfidence(fresh), 0);
assert.equal(isPlaced(fresh), false);
assert.equal(displayPlacementRating(400, 350, fresh), "400?");
assert.equal(rankFor(400, fresh).placement, true);

assert.equal(placementGamesPlayed(mid), 3);
assert.equal(placementLeft(mid), 4);
assert.equal(placementConfidence(mid), 5);
assert.equal(isPlaced(mid), false);
assert.equal(confidenceForPlacementGames(3), 5);

assert.equal(placementGamesPlayed(complete), 7);
assert.equal(placementLeft(complete), 0);
assert.equal(placementConfidence(complete), 10);
assert.equal(isPlaced(complete), true);
assert.equal(displayPlacementRating(1600, 350, complete), "1600");
assert.equal(rankFor(1600, complete).name, "Platinum");

const beginner = { skillLevel: "beginner", placementBaseRating: 400, soloRating: 400, soloVol: 0.06, placementGames: 0 };
const bWin1 = placementCalibration(beginner, true, 90, "Bronze");
const bWin2 = placementCalibration({ ...beginner, soloRating: bWin1.rating, placementGames: 1 }, true, 100, "Bronze");
const bWin3 = placementCalibration({ ...beginner, soloRating: bWin2.rating, placementGames: 2 }, true, 110, "Bronze");
const bLoss = placementCalibration({ ...beginner, soloRating: bWin3.rating, placementGames: 3 }, false, 300, "Bronze");
assert.ok(bWin1.delta >= 100 && bWin1.delta <= 240, "a first placement win should move by hundreds within its cap");
assert.ok(bLoss.delta <= -100 && Math.abs(bLoss.delta) <= 240, "a placement loss should move by hundreds within its cap");
assert.ok(bLoss.rating >= 0 && bLoss.rating <= 900, "beginner placement stays within its broad base-rating guard rail");

const masterLoss = placementCalibration({ skillLevel: "master", placementBaseRating: 1600, soloRating: 1600, soloVol: 0.06, placementGames: 0 }, false, 300, "Master");
assert.ok(masterLoss.rating >= 1100, "master placement cannot crash below the base-rating guard rail");

assert.deepEqual(
  SKILL_LEVELS.map((level) => [level.id, level.rating]),
  [["beginner", 400], ["intermediate", 700], ["advanced", 1000], ["expert", 1300], ["master", 1600]],
  "onboarding levels must match the requested base ratings",
);

console.log("progression checks passed");
