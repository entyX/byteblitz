// ============================================================================
// Leaderboard — ByteBlitz's two rating tracks with public profile metadata.
// ============================================================================

import { h, clear, emptyState, avatar } from "../ui.js";
import { session } from "../session.js";
import { displayPlacementRating, isPlaced, placementGamesPlayed, rankFor } from "../glicko.js";
import { rankedLeaderboard, soloLeaderboard, isPermissionDenied } from "../store.js";
import { navigate } from "../router.js";
import { countryFor } from "../countries.js";

const BOARDS = [
  { id: "ranked", label: "Ranked" },
  { id: "unranked", label: "Unranked" },
];

export async function renderLeaderboard(params, root) {
  const page = h("div", { class: "wrap", style: { paddingTop: "28px", paddingBottom: "72px" } });
  root.append(page);

  let board = sessionStorage.getItem("bb_lb_board") || "ranked";
  if (!BOARDS.some((b) => b.id === board)) board = "ranked";

  const tabsHost = h("div", { class: "lb-tabs" });
  const bodyHost = h("div", {});
  const introCopy = h("p", { class: "lb-subcopy" });

  const stage = h("section", { class: "lb-stage" },
    h("div", { class: "lb-intro" },
      h("div", {},
        h("div", { class: "eyebrow" }, "// Global standings"),
        h("h1", { class: "head" }, "ByteBlitz ", h("span", { class: "accent" }, "Leaderboard")),
        introCopy),
      tabsHost),
    bodyHost);
  page.append(stage);

  function paintTabs() {
    clear(tabsHost);
    BOARDS.forEach((item) => {
      tabsHost.append(h("button", {
        class: "tab" + (item.id === board ? " active" : ""),
        "aria-pressed": item.id === board ? "true" : "false",
        onClick: () => {
          board = item.id;
          sessionStorage.setItem("bb_lb_board", board);
          paintTabs();
          paint();
        },
      }, item.label));
    });
  }

  function paintIntro() {
    introCopy.textContent = board === "ranked"
      ? "Ranked is head-to-head, Glicko-rated competition. Complete all seven Unranked placement games to unlock Ranked and appear here."
      : "Unranked is the solo race against the clock. Your first seven runs are placement games that calibrate both ELO tracks.";
  }

  async function paint() {
    paintIntro();
    clear(bodyHost).append(h("div", { class: "empty", style: { margin: "18px" } }, "Loading standings…"));
    try {
      const rows = board === "ranked"
        ? (await rankedLeaderboard(100)).filter((u) => isPlaced(u))
        : (await soloLeaderboard(100)).filter((u) => (u.soloRuns ?? 0) > 0);
      paintBoard(rows);
    } catch (error) {
      console.error(error);
      clear(bodyHost).append(emptyState(
        isPermissionDenied(error)
          ? "The leaderboard isn't available to signed-out players on this server yet. Sign in to view it."
          : "Couldn't load the leaderboard. Try again in a moment."));
    }
  }

  function paintBoard(rows) {
    clear(bodyHost);
    const isRanked = board === "ranked";
    if (!rows.length) {
      bodyHost.append(h("div", { class: "empty", style: { margin: "18px" } },
        isRanked ? "No Ranked players have been recorded yet. Complete all seven Unranked placement games to claim #1." : "No unranked runs recorded yet. Play one and you're #1."));
      return;
    }

    const cols = "64px minmax(200px, 1fr) 128px 140px 108px";
    const table = h("div", { class: "lb-table" });
    table.append(h("div", { class: "lb-row lb-v12 lb-head", style: { gridTemplateColumns: cols } },
      h("span", {}, "#"), h("span", {}, "Player"), h("span", { class: "lb-country" }, "Country"),
      h("span", { class: "lb-record" }, isRanked ? "Record" : "Activity"), h("span", { style: { textAlign: "right" } }, "ELO")));

    rows.forEach((player, index) => {
      const mine = player.uid === session.profile?.uid;
      const country = countryFor(player.country);
      const rating = isRanked ? player.rating : player.soloRating;
      const rd = isRanked ? player.rd : player.soloRd;
      const division = isRanked ? rankFor(rating, player) : null;
      const record = isRanked
        ? h("span", { class: "lb-record" },
            h("b", {}, `${player.wins ?? 0}W`), " · ", h("i", {}, `${player.losses ?? 0}L`), " · ", h("em", {}, `${player.draws ?? 0}D`))
        : h("span", { class: "lb-record" },
            h("b", {}, `${player.soloSolved ?? 0}`), " solved · ", h("i", {}, `${player.soloRuns ?? 0}`), " runs");

      table.append(h("button", {
        class: "lb-row lb-v12" + (mine ? " me" : "") + (index < 3 ? " podium" : ""),
        style: { gridTemplateColumns: cols, width: "100%", textAlign: "left", color: "inherit" },
        onClick: () => navigate("/profile/" + player.uid),
      },
        h("span", { class: "lb-position" + (index < 3 ? " top" : "") }, index < 3 ? `0${index + 1}` : String(index + 1).padStart(2, "0")),
        h("span", { class: "lb-player" },
          avatar(player, "sm"),
          h("span", { class: "lb-player-copy" },
            h("span", { class: "lb-player-name" }, player.username, mine ? " · YOU" : ""),
            h("span", { class: "lb-player-meta" },
              h("span", { class: "country-flag" }, country.flag)))),
        h("span", { class: "lb-country" },
          h("span", { class: "row gap-2", style: { minWidth: "0" } },
            h("span", { class: "country-flag" }, country.flag),
            h("span", { class: "country-name mono", style: { fontSize: "10.5px", color: "var(--muted-fg)" } }, country.name))),
        record,
        h("span", { class: "lb-elo" + (isRanked ? " lb-division-elo" : ""), style: isRanked ? { color: division.color, textShadow: `0 0 14px ${division.color}66` } : {} },
          displayPlacementRating(rating, rd, player),
          h("small", { style: isRanked ? { color: division.color } : {} }, isRanked ? division.name : (isPlaced(player) ? "Rating" : "Placement")))));
    });

    bodyHost.append(table,
      h("p", { class: "lb-mode-note" },
        isRanked
          ? "Only players who have completed all seven Unranked placement games appear on the Ranked board."
          : "Unranked ratings are for solo runs only. The first seven runs calibrate both tracks and raise confidence from 0/10 to 10/10."));
  }

  paintTabs();
  await paint();
}
