// ============================================================================
// Training Grounds — drill individual puzzles, chase your best time.
//
// Nothing here is locked behind a match count. Each difficulty hands you its
// first tenth for free so there's always something to play, and everything
// beyond that unlocks by meeting the puzzle in Unranked or Ranked. Locked
// puzzles sit in the grid as "???", giving nothing away: the catalogue's size
// stays honest, its contents are earned.
// ============================================================================

import { h, add, clear, emptyState, icon, fmtTime, fmtClock, modal, debounce, avatar } from "../ui.js";
import { session, onSession } from "../session.js";
import { TIERS, TIME_LIMITS, displayRating, rankFor } from "../glicko.js";
import { loadPool } from "../problems.js";
import {
  getMyPuzzleRecords, puzzleLeaderboard, puzzleLeaderboardDetailed, puzzleLeaderboardIds,
  seenMap, isPermissionDenied, isRevealed, starterCount,
} from "../store.js";
import { startTraining } from "../game.js";
import { navigate } from "../router.js";

export async function renderTraining(params, root) {
  const unsubs = [];
  const page = h("div", { class: "wrap", style: { paddingTop: "32px", paddingBottom: "72px" } });
  root.append(page);

  const UNKNOWN_PREVIEW = 18;

  let active = sessionStorage.getItem("bb_train_tier") || "Bronze";
  let records = {};
  let searchTerm = "";
  let showOnly = sessionStorage.getItem("bb_train_filter") || "all"; // all | found
    let unknownLimit = UNKNOWN_PREVIEW;
  let paintEpoch = 0;
  let trophyButtons = new Map();

  const tabsHost = h("div", { class: "tabs mb-5" });
  const bodyHost = h("div", {});
  const progressHost = h("div", { class: "mb-6" });

  const searchInput = h("input", {
    class: "input", type: "text", placeholder: "Filter unlocked puzzles…",
    style: { maxWidth: "300px", paddingLeft: "36px" },
  });
  searchInput.addEventListener("input", debounce(() => {
    searchTerm = searchInput.value.trim().toLowerCase();
    paintBody();
  }, 180));

  page.append(
    h("div", { class: "between wrapflex gap-4 mb-3", style: { alignItems: "flex-end" } },
      h("div", {},
        h("div", { class: "eyebrow mb-2" }, "// Practice"),
        h("h1", { class: "head" }, "Training ", h("span", { class: "gradient-text" }, "Grounds"))),
      h("div", { class: "search-wrap" },
        h("span", { style: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" } }, icon("search", 15)),
        searchInput)),
    h("p", { class: "body-text mb-8", style: { maxWidth: "680px" } },
      "Every difficulty is open from day one and starts you with its first 10% unlocked. The rest reveal themselves as you meet them in an Unranked run or a Ranked duel — until then they stay ???. Times are recorded per puzzle and ranked on their own board. Training never moves a rating."),
    tabsHost, progressHost, bodyHost,
  );

  // ── Tabs — all difficulties, always open ─────────────────────────────────
  function paintTabs() {
    clear(tabsHost);
    TIERS.forEach((t) => {
      const btn = h("button", { class: "tab" + (t.name === active ? " active" : ""),
        onClick: () => {
          active = t.name;
          unknownLimit = UNKNOWN_PREVIEW;
          sessionStorage.setItem("bb_train_tier", t.name);
          paintTabs(); paintBody();
        } }, t.name);
      if (t.name === active) {
        btn.style.color = t.color;
        btn.style.borderBottomColor = t.color;
        btn.style.background = t.color + "14";
      }
      tabsHost.append(btn);
    });
  }

  // ── Body ─────────────────────────────────────────────────────────────────
  async function paintBody() {
    const epoch = ++paintEpoch;
    trophyButtons = new Map();
    clear(progressHost);
    clear(bodyHost).append(h("div", { class: "empty" }, "Loading puzzles…"));

    let pool = [];
    try { pool = await loadPool(active); }
    catch {
      if (epoch === paintEpoch) clear(bodyHost).append(emptyState("Couldn't load this difficulty's puzzles."));
      return;
    }
    if (epoch !== paintEpoch) return;

    const seen = seenMap(session.profile);
    const tier = TIERS.find((t) => t.name === active);
    const starters = starterCount(pool.length);
    const revealed = pool.filter((pz, i) => isRevealed(seen, pz, i, pool.length));
    const pct = pool.length ? (revealed.length / pool.length) * 100 : 0;

    progressHost.append(
      h("div", { class: "panel" },
        h("div", { class: "discovery-bar" },
          h("div", { class: "row gap-4 wrapflex" },
            h("span", { class: "tier-badge", style: { color: tier.color } }, active),
            h("span", { class: "label label-bright" }, `${revealed.length} of ${pool.length} unlocked`),
            h("span", { class: "label" }, `${starters} free to start`),
            h("span", { class: "label" }, `${fmtClock(TIME_LIMITS[active])} limit`)),
          h("div", { class: "row gap-2" },
            filterBtn("all", "Whole catalogue"),
            filterBtn("found", "Unlocked only"))),
        h("div", { class: "bar" },
          h("i", { style: { width: pct + "%", background: tier.color } }))),
    );

    clear(bodyHost);

    const q = searchTerm;
    // A locked puzzle can't match a text filter without leaking its name, so a
    // search only ever looks at what's already unlocked.
    const known = revealed.filter((pz) => {
      if (!q) return true;
      return pz.title.toLowerCase().includes(q) ||
        (pz.category || "").toLowerCase().includes(q);
    });
    const unknown = (q || showOnly === "found")
      ? []
      : pool.filter((pz, i) => !isRevealed(seen, pz, i, pool.length));

    if (known.length) {
      const grid = h("div", { class: "puz-grid" });
      known.forEach((pz) => grid.append(knownCard(pz, tier)));
      bodyHost.append(grid);
    } else {
      bodyHost.append(emptyState("No unlocked puzzle matches that filter."));
    }

    // The undiscovered half is listed so the catalogue's real size is visible,
    // but compactly and folded up — a wall of 200 identical ??? cards is noise.
    const shown = unknown.slice(0, unknownLimit);
    if (unknown.length) {
      const grid = h("div", { class: "puz-grid puz-grid-compact" });
      shown.forEach((pz) => grid.append(unknownCard(pz)));

      add(bodyHost,
        h("div", { class: "between wrapflex gap-3 mt-8 mb-3" },
          h("div", { class: "section-title", style: { marginBottom: "0" } },
            `// Locked — ${unknown.length}`),
          h("span", { class: "label" }, "Play Unranked or Ranked to reveal these")),
        grid,
        unknown.length > shown.length
          ? h("button", { class: "btn btn-block mt-4", onClick: () => { unknownLimit = Infinity; paintBody(); } },
              `Show all ${unknown.length} locked`)
          : null,
      );
        }

    // One bounded query batch paints all rendered trophy indicators. This keeps
    // the Training page responsive instead of sending one Firestore read per card.
    void paintTrophyStates([...known, ...shown], epoch);
  }

  async function paintTrophyStates(puzzles, epoch) {
    try {
      const populated = await puzzleLeaderboardIds(puzzles.map((pz) => pz.archetypeId));
      if (epoch !== paintEpoch) return;
      trophyButtons.forEach((buttons, archetypeId) => {
        if (populated.has(archetypeId)) buttons.forEach((btn) => btn.classList.add("has-board"));
      });
    } catch (error) {
      // The neutral trophy state remains usable when its indicator lookup fails.
      console.warn("Could not load puzzle leaderboard indicators", error);
    }
  }

  function filterBtn(id, label) {
    const b = h("button", { class: "btn btn-sm", onClick: () => {
      showOnly = id;
      unknownLimit = UNKNOWN_PREVIEW;
      sessionStorage.setItem("bb_train_filter", id);
      paintBody();
    } }, label);
    if (showOnly === id) { b.style.borderColor = "var(--primary)"; b.style.color = "var(--primary)"; }
    return b;
  }

  // ── Cards ────────────────────────────────────────────────────────────────
  function knownCard(pz, tier) {
    const rec = records[pz.archetypeId];
    // The whole card opens the puzzle; the trophy inside stops propagation so
    // it can open the board instead.
    return h("div", {
      class: "puz puz-clickable", role: "button", tabindex: "0",
      style: { borderLeft: `3px solid ${tier.color}`, cursor: "pointer" },
      onClick: () => openPuzzle(pz),
      onKeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPuzzle(pz); } },
    },
      h("div", { class: "puz-head" },
        h("span", { class: "t" }, pz.title),
        trophyButton(pz, false)),
      pz.category
        ? h("span", { class: "label", style: { letterSpacing: ".1em" } }, pz.category.replace(/_/g, " "))
        : null,
      h("div", { class: "m row between gap-2" },
        h("span", {}, pz.difficulty),
        rec?.solved
          ? h("span", { class: "best" }, fmtTime(rec.timeMs), " ✓")
          : rec ? h("span", {}, `${rec.attempts} ${rec.attempts === 1 ? "try" : "tries"}`) : null));
  }

  function unknownCard(pz) {
    return h("div", {
      class: "puz puz-unknown",
      title: "Undiscovered — meet this puzzle in Unranked or Ranked to reveal it",
    },
      h("div", { class: "puz-head" },
        h("span", { class: "t" }, "? ? ?"),
        trophyButton(pz, true)));
  }

  function trophyButton(pz, unknown) {
    const btn = h("button", {
      class: "trophy-btn",
      title: "Fastest solves",
      "aria-label": "Leaderboard for this puzzle",
      onClick: (e) => { e.stopPropagation(); openBoard(pz, unknown); },
    }, icon("trophy", 14));

    const buttons = trophyButtons.get(pz.archetypeId) ?? [];
    buttons.push(btn);
    trophyButtons.set(pz.archetypeId, buttons);
    return btn;
  }

  // ── Puzzle detail ────────────────────────────────────────────────────────
  function openPuzzle(pz) {
    const rec = records[pz.archetypeId];

    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// " + pz.difficulty + " puzzle"),
      h("h2", { class: "head mb-3" }, pz.title),
      h("p", { class: "body-text mb-4" }, pz.description),
      h("div", { class: "row gap-3 wrapflex mb-5" },
        h("span", { class: "pill" }, fmtClock(TIME_LIMITS[pz.difficulty]) + " limit"),
        pz.category ? h("span", { class: "pill" }, pz.category.replace(/_/g, " ")) : null,
        rec?.solved ? h("span", { class: "pill pill-ok" }, "best " + fmtTime(rec.timeMs)) : null),
      h("div", { class: "row gap-3 wrapflex" },
        h("button", { class: "btn btn-primary grow", onClick: () => { m.close(); startTraining(pz.difficulty, pz.archetypeId); } },
          rec?.solved ? "Beat your time ▸" : "Start puzzle ▸"),
        h("button", { class: "btn", onClick: () => { m.close(); openBoard(pz, false); } },
          icon("trophy", 14), "Leaderboard")),
    ), { wide: true });
  }

  // ── Per-puzzle leaderboard ───────────────────────────────────────────────
  function openBoard(pz, unknown) {
    const host = h("div", { class: "mt-5" }, h("div", { class: "empty", style: { border: "none" } }, "Loading times…"));

    modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Puzzle leaderboard"),
      h("h2", { class: "head mb-2" }, unknown ? "? ? ?" : pz.title),
      h("p", { class: "mono mb-1", style: { fontSize: "12.5px", color: "var(--muted-fg)", lineHeight: "1.65" } },
        unknown
          ? `An undiscovered ${pz.difficulty} puzzle. These are the people who have cleared it fastest — meet it in Unranked or Ranked to see what it is.`
          : "Fastest recorded clears of this exact puzzle, with each holder's ratings."),
      host,
    ), { wide: true });

    puzzleLeaderboardDetailed(pz.archetypeId, 25).then((rows) => {
      clear(host);
      if (!rows.length) {
        host.append(h("div", { class: "empty" }, "Nobody has cleared this one yet. Be the first."));
        return;
      }

      const box = h("div", { class: "panel" });
      box.append(h("div", { class: "lb-row lb-head", style: { gridTemplateColumns: "52px 1fr 92px 92px 88px" } },
        h("span", {}, "#"), h("span", {}, "Player"),
        h("span", {}, "Unranked"), h("span", {}, "Ranked"), h("span", {}, "Time")));

      const list = h("div", { class: "divide" });
      rows.forEach((r, i) => {
        const isMe = r.uid === session.profile?.uid;
        const rank = rankFor(r.rating, r.gamesPlayed);
        list.append(h("div", {
          class: "lb-row" + (isMe ? " me" : "") + (i < 3 ? " podium" : ""),
          style: { gridTemplateColumns: "52px 1fr 92px 92px 88px", cursor: "pointer" },
          onClick: () => navigate("/profile/" + r.uid),
        },
          h("span", { class: "rk" }, medal(i)),
          h("div", { class: "row gap-3", style: { minWidth: "0" } },
                        avatar(r, "sm"),

            h("span", { class: "nm" }, r.username)),
          h("span", { class: "tnum", style: { color: "var(--primary)" } },
            r.soloRuns > 0 ? displayRating(r.soloRating, r.soloRd) : "—"),
          h("span", { class: "tnum", style: { color: rank.color } },
            rank.placement ? "Unranked" : displayRating(r.rating, r.rd)),
          h("span", { class: "tnum", style: { fontWeight: "700" } }, fmtTime(r.timeMs))));
      });

            box.append(list);
      host.append(box,
        h("p", { class: "label mt-4", style: { lineHeight: "1.7", textTransform: "none", letterSpacing: "0" } },

          "Unranked and Ranked are that player's two ELO tracks. Ranked reads \"Unranked\" until they have played 10 ranked matches."));
    }).catch((e) => {
      console.error(e);
      clear(host).append(h("div", { class: "empty" },
        isPermissionDenied(e)
          ? "Puzzle boards aren't readable without an account on this server. Your own times are still saved."
          : "Couldn't load times for this puzzle."));
    });
  }

  function medal(i) {
    return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
  }

  // ── Load records, then paint ─────────────────────────────────────────────
  async function loadRecords() {
    try { records = await getMyPuzzleRecords(session.profile); }
    catch (e) { console.error(e); records = {}; }
  }

  paintTabs();
  await loadRecords();
  await paintBody();

  let lastUid = session.profile?.uid ?? null;
  unsubs.push(onSession(async () => {
    const uid = session.profile?.uid ?? null;
    if (uid !== lastUid) { lastUid = uid; await loadRecords(); }
    paintTabs();
    paintBody();
  }));

  return () => unsubs.forEach((fn) => { try { fn(); } catch {} });
}
