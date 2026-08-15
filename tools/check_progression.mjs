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
assert.equal(rankFor(1600, complete).name, "Gold");

assert.deepEqual(
  SKILL_LEVELS.map((level) => [level.id, level.rating]),
  [["beginner", 400], ["intermediate", 700], ["advanced", 1000], ["expert", 1300], ["master", 1600]],
  "onboarding levels must match the requested base ratings",
);

console.log("progression checks passed");
