// ============================================================================
// Leaderboard — live public standings with animated position changes.
// ============================================================================

import { h, clear, emptyState, avatar } from "../ui.js";
import { session } from "../session.js";
import { displayPlacementRating, isPlaced, rankFor } from "../glicko.js";
import { watchRankedLeaderboard, watchSoloLeaderboard, isPermissionDenied } from "../store.js";
import { navigate } from "../router.js";
import { countryFor } from "../countries.js";

const BOARDS = [
  { id: "ranked", label: "Ranked" },
  { id: "unranked", label: "Unranked" },
];
const ROWS = 100;
const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function renderLeaderboard(params, root) {
  const page = h("div", { class: "wrap", style: { paddingTop: "28px", paddingBottom: "72px" } });
  root.append(page);

  let board = sessionStorage.getItem("bb_lb_board") || "ranked";
  if (!BOARDS.some((b) => b.id === board)) board = "ranked";
  let boardUnsub = null;
  let liveEpoch = 0;
  let table = null;
  let listHost = null;
  let note = null;
  const rowNodes = new Map();

  const tabsHost = h("div", { class: "lb-tabs" });
  const bodyHost = h("div", {});
  const introCopy = h("p", { class: "lb-subcopy" });

  const stage = h("section", { class: "lb-stage" },
    h("div", { class: "lb-intro" },
      h("div", {},
        h("div", { class: "eyebrow" }, "// Global standings · Live"),
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
          if (item.id === board) return;
          board = item.id;
          sessionStorage.setItem("bb_lb_board", board);
          paintTabs();
          subscribeBoard();
        },
      }, item.label));
    });
  }

  function paintIntro() {
    introCopy.textContent = board === "ranked"
      ? "Live head-to-head Glicko standings. Complete all seven Unranked placement games to unlock Ranked and appear here."
      : "Live solo standings. Your first seven runs calibrate both ELO tracks before Ranked unlocks.";
  }

  function showError(error) {
    console.error(error);
    clear(bodyHost).append(emptyState(
      isPermissionDenied(error)
        ? "The leaderboard isn't available to signed-out players on this server yet. Sign in to view it."
        : "Couldn't load the live leaderboard. Try again in a moment."));
  }

  function makeTable(isRanked) {
    const cols = "64px minmax(200px, 1fr) 128px 140px 108px";
    table = h("div", { class: "lb-table" });
    table.append(h("div", { class: "lb-row lb-v12 lb-head", style: { gridTemplateColumns: cols } },
      h("span", {}, "#"), h("span", {}, "Player"), h("span", { class: "lb-country" }, "Country"),
      h("span", { class: "lb-record" }, isRanked ? "Record" : "Activity"), h("span", { style: { textAlign: "right" } }, "ELO")));
    listHost = h("div", { class: "lb-live-list", "aria-live": "polite" });
    note = h("p", { class: "lb-mode-note" },
      isRanked
        ? "Live updates are animated when a player overtakes another. Only players who complete all seven Unranked placement games appear here."
        : "Live updates are animated when a player overtakes another. Unranked ratings are for solo runs only.");
    table.append(listHost);
    clear(bodyHost).append(table, note);
  }

  function updateRow(row, player, index, isRanked) {
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

    row.className = "lb-row lb-v12" + (mine ? " me" : "") + (index < 3 ? " podium" : "");
    row.style.gridTemplateColumns = "64px minmax(200px, 1fr) 128px 140px 108px";
    row.dataset.rank = String(index + 1);
    clear(row).append(
      h("span", { class: "lb-position" + (index < 3 ? " top" : "") }, index < 3 ? `0${index + 1}` : String(index + 1).padStart(2, "0")),
      h("span", { class: "lb-player" },
        avatar(player, "sm"),
        h("span", { class: "lb-player-copy" },
          h("span", { class: "lb-player-name" }, player.username, mine ? " · YOU" : ""),
          h("span", { class: "lb-player-meta" }, h("span", { class: "country-flag" }, country.flag)))),
      h("span", { class: "lb-country" },
        h("span", { class: "row gap-2", style: { minWidth: "0" } },
          h("span", { class: "country-flag" }, country.flag),
          h("span", { class: "country-name mono", style: { fontSize: "10.5px", color: "var(--muted-fg)" } }, country.name))),
      record,
      h("span", { class: "lb-elo" + (isRanked ? " lb-division-elo" : ""), style: isRanked ? { color: division.color, textShadow: `0 0 14px ${division.color}66` } : {} },
        displayPlacementRating(rating, rd, player),
        h("small", { style: isRanked ? { color: division.color } : {} }, isRanked ? division.name : (isPlaced(player) ? "Rating" : "Placement"))),
    );
  }

  function animateReorders(previousRects) {
    if (prefersReducedMotion()) return;
    rowNodes.forEach((row, uid) => {
      const before = previousRects.get(uid);
      if (!before || !row.isConnected) return;
      const after = row.getBoundingClientRect();
      const dy = before.top - after.top;
      if (Math.abs(dy) < 1) return;
      row.getAnimations?.().forEach((animation) => animation.cancel());
      row.classList.add("lb-rank-moving");
      const animation = row.animate([
        { transform: `translateY(${dy}px)` },
        { transform: "translateY(0)" },
      ], { duration: 440, easing: "cubic-bezier(.2,.86,.25,1)", fill: "both" });
      animation.finished.catch(() => {}).finally(() => row.classList.remove("lb-rank-moving"));
    });
  }

  function renderRows(snapshotRows) {
    const isRanked = board === "ranked";
    const rows = isRanked
      ? snapshotRows.filter((player) => isPlaced(player))
      : snapshotRows.filter((player) => (player.soloRuns ?? 0) > 0);

    if (!rows.length) {
      table = null;
      listHost = null;
      rowNodes.clear();
      clear(bodyHost).append(h("div", { class: "empty", style: { margin: "18px" } },
        isRanked ? "No Ranked players have been recorded yet. Complete all seven Unranked placement games to claim #1." : "No Unranked runs recorded yet. Play one and you're #1."));
      return;
    }

    if (!table || !listHost || !table.isConnected) makeTable(isRanked);
    const previousRects = new Map();
    rowNodes.forEach((row, uid) => {
      if (row.isConnected) previousRects.set(uid, row.getBoundingClientRect());
    });

    const visible = new Set();
    rows.forEach((player, index) => {
      visible.add(player.uid);
      let row = rowNodes.get(player.uid);
      if (!row) {
        row = h("button", {
          class: "lb-row lb-v12",
          type: "button",
          style: { width: "100%", textAlign: "left", color: "inherit" },
          onClick: () => navigate("/profile/" + player.uid),
        });
        rowNodes.set(player.uid, row);
      }
      updateRow(row, player, index, isRanked);
      listHost.append(row);
    });

    [...rowNodes.entries()].forEach(([uid, row]) => {
      if (visible.has(uid)) return;
      row.remove();
      rowNodes.delete(uid);
    });
    animateReorders(previousRects);
  }

  function subscribeBoard() {
    boardUnsub?.();
    boardUnsub = null;
    table = null;
    listHost = null;
    rowNodes.clear();
    const epoch = ++liveEpoch;
    paintIntro();
    clear(bodyHost).append(h("div", { class: "empty", style: { margin: "18px" } }, "Connecting to live standings…"));

    const receive = (rows) => {
      if (epoch !== liveEpoch) return;
      renderRows(rows);
    };
    const fail = (error) => {
      if (epoch !== liveEpoch) return;
      showError(error);
    };
    try {
      boardUnsub = board === "ranked"
        ? watchRankedLeaderboard(ROWS, receive, fail)
        : watchSoloLeaderboard(ROWS, receive, fail);
    } catch (error) {
      fail(error);
    }
  }

  paintTabs();
  subscribeBoard();
  return () => {
    ++liveEpoch;
    boardUnsub?.();
    boardUnsub = null;
  };
}
