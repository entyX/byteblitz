// ============================================================================
// Training Grounds — drill individual puzzles, chase your best time.
//
// Nothing here is locked behind a match count. Each difficulty hands you its
// first tenth for free so there's always something to play, and everything
// beyond that unlocks by meeting the puzzle in Unranked or Ranked. Locked
// puzzles sit in the grid as "???", giving nothing away: the catalogue's size
// stays honest, its contents are earned.
// ============================================================================

import { h, add, clear, emptyState, icon, fmtTime, fmtClock, fmtAgo, modal, confirmModal, debounce, avatar, toast } from "../ui.js";

import { session, onSession } from "../session.js";
import { TIERS, TIME_LIMITS, displayPlacementRating, rankFor } from "../glicko.js";
import { loadPool } from "../problems.js";
import {
  getMyPuzzleRecords, puzzleLeaderboard, puzzleLeaderboardDetailed, puzzleLeaderboardIds,
  getSavedSolution, getAccomplishableSolution, getSavedSolutions, getSolutionHistory, toggleAccomplishment,
  setSolutionVisibility, getPublicPuzzleSolution, getPublicPuzzleSolutions, saveSolutionAnalysis, trashSavedSolution, syncSavedSolutionsToPuzzleRecords,
  seenMap, isPermissionDenied, isRevealed, starterCount,
} from "../store.js";
import { startTraining } from "../game.js";
import { fastCodeAnalysis } from "../analysis-engine.js";
import { navigate } from "../router.js";

export async function renderTraining(params, root) {
  const unsubs = [];
  const page = h("div", { class: "wrap", style: { paddingTop: "32px", paddingBottom: "72px" } });
  root.append(page);

  const UNKNOWN_PREVIEW = 18;

  let active = sessionStorage.getItem("bb_train_tier") || "Bronze";
  let workspace = sessionStorage.getItem("bb_train_workspace") || "puzzles";
  let categoryFilter = sessionStorage.getItem("bb_train_category") || "all";
  let solutionFilter = sessionStorage.getItem("bb_solution_filter") || "all";
  let solutionDifficulty = sessionStorage.getItem("bb_solution_difficulty") || "all";
  let records = {};
  let savedSolutions = [];
  let searchTerm = "";
  let showOnly = sessionStorage.getItem("bb_train_filter") || "all"; // all | found
    let unknownLimit = UNKNOWN_PREVIEW;
  let paintEpoch = 0;
  let trophyButtons = new Map();

  const tabsHost = h("div", { class: "training-primary-nav mb-5" });
  const sideHost = h("div", { class: "training-filter-rail" });
  const bodyHost = h("div", {});
  const progressHost = h("div", { class: "mb-6" });

  const searchInput = h("input", {
    class: "input", type: "text", placeholder: "Search unlocked puzzles…",
    style: { width: "min(520px, 72vw)", maxWidth: "520px", paddingLeft: "36px" },
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
      h("div", { class: "search-wrap training-search" },
        h("span", { style: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" } }, icon("search", 15)),
        searchInput)),
    h("p", { class: "body-text mb-8", style: { maxWidth: "680px" } },
      "Every difficulty is open from day one and starts you with its first 10% unlocked. The rest reveal themselves as you meet them in an Unranked run or a Ranked duel — until then they stay ???. Times are recorded per puzzle and ranked on their own board. Training never moves a rating."),
    tabsHost,
    h("div", { class: "training-content-layout" },
      h("div", { class: "training-content-main" }, progressHost, bodyHost),
      sideHost),
  );

  function setWorkspace(next) {
    workspace = next;
    sessionStorage.setItem("bb_train_workspace", workspace);
    paintWorkspace();
  }

  // Difficulty navigation is the puzzle catalogue navigation. My Solutions is
  // deliberately a single, right-aligned peer instead of a second tab strip.
  function paintTabs() {
    clear(tabsHost);
    const tiers = h("div", { class: "training-tier-nav" });
    TIERS.forEach((t) => {
      const btn = h("button", { class: "tab" + (workspace === "puzzles" && t.name === active ? " active" : ""),
        onClick: () => {
          workspace = "puzzles";
          active = t.name;
          unknownLimit = UNKNOWN_PREVIEW;
          sessionStorage.setItem("bb_train_workspace", workspace);
          sessionStorage.setItem("bb_train_tier", t.name);
          paintWorkspace();
        } }, t.name);
      if (workspace === "puzzles" && t.name === active) {
        btn.style.color = t.color;
        btn.style.borderBottomColor = t.color;
        btn.style.background = t.color + "14";
      }
      tiers.append(btn);
    });
    tabsHost.append(tiers,
      h("button", { class: "training-solutions-tab" + (workspace === "solutions" ? " active" : ""), onClick: () => setWorkspace("solutions") },
        icon("target", 14), `My solutions${savedSolutions.length ? ` · ${savedSolutions.length}` : ""}`));
  }

  function paintWorkspace() {
    paintTabs();
    clear(sideHost);
    if (workspace === "solutions") {
      clear(progressHost);
      paintSolutionsWorkspace();
    } else paintBody();
  }

  // ── Body ─────────────────────────────────────────────────────────────────
  async function paintBody() {
    if (workspace !== "puzzles") return;
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
    const categories = [...new Set(revealed.map((pz) => pz.category).filter(Boolean))].sort();
    const pct = pool.length ? (revealed.length / pool.length) * 100 : 0;

    progressHost.append(
      h("div", { class: "panel" },
        h("div", { class: "discovery-bar" },
          h("div", { class: "row gap-4 wrapflex" },
            h("span", { class: "tier-badge", style: { color: tier.color } }, active),
            h("span", { class: "label label-bright" }, `${revealed.length} of ${pool.length} unlocked`),
            h("span", { class: "label" }, `${starters} free to start`),
            h("span", { class: "label" }, `${fmtClock(TIME_LIMITS[active])} limit`))),
        h("div", { class: "bar" },
          h("i", { style: { width: pct + "%", background: tier.color } }))),
    );

    clear(sideHost);
    sideHost.append(h("aside", { class: "training-filter-side" },
      h("div", { class: "label mb-3" }, "// Catalogue"),
      filterBtn("all", "Whole catalogue"),
      filterBtn("found", "Unlocked only"),
      h("div", { class: "label mt-5 mb-2" }, "// Category"),
      categoryBtn("all", "All categories"),
      ...categories.map((category) => categoryBtn(category, category.replace(/_/g, " ")))));

    clear(bodyHost);

    const q = searchTerm;
    // A locked puzzle can't match a text filter without leaking its name, so a
    // search only ever looks at what's already unlocked.
    const known = revealed.filter((pz) => {
      const categoryMatch = categoryFilter === "all" || pz.category === categoryFilter;
      if (!q) return categoryMatch;
      return categoryMatch && (pz.title.toLowerCase().includes(q) ||
        (pz.category || "").toLowerCase().includes(q));
    });
    // Category filtering never reveals metadata for undiscovered puzzles.
    const unknown = (q || showOnly === "found" || categoryFilter !== "all")
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
    const b = h("button", { class: "solutions-side-link" + (showOnly === id ? " active" : ""), onClick: () => {
      showOnly = id;
      unknownLimit = UNKNOWN_PREVIEW;
      sessionStorage.setItem("bb_train_filter", id);
      paintBody();
    } }, label);
    return b;
  }

  function categoryBtn(id, label) {
    const b = h("button", { class: "solutions-side-link" + (categoryFilter === id ? " active" : ""), onClick: () => {
      categoryFilter = id;
      sessionStorage.setItem("bb_train_category", id);
      paintBody();
    } }, label);
    return b;
  }

  // ── Cards ────────────────────────────────────────────────────────────────
  function knownCard(pz, tier) {
    const rec = records[pz.archetypeId];
    const solution = savedSolutions.find((entry) => entry.archetypeId === pz.archetypeId);
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
        h("span", { class: "row gap-1" },
          solution ? solutionButton(pz, solution) : null,
          trophyButton(pz, false))),
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

  function solutionButton(pz, solution) {
    return h("button", {
      class: "trophy-btn solution-shortcut" + (solution.completed ? " completed" : " incomplete"),
      title: solution.completed ? "Analyze your saved solution" : "Analyze your incomplete draft",
      "aria-label": "Analyze your saved solution for " + pz.title,
      onClick: (e) => { e.stopPropagation(); navigate(`/analysis/${encodeURIComponent(session.profile.uid)}/${encodeURIComponent(pz.archetypeId)}`); },
    }, icon("bulb", 14));
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
    const solutionHost = h("div", { class: "solution-library-preview mt-5" });
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// " + pz.difficulty + " puzzle"),
      h("h2", { class: "head mb-3" }, pz.title),
      h("p", { class: "body-text mb-4" }, pz.description),
      h("div", { class: "row gap-3 wrapflex mb-5" },
        h("span", { class: "pill" }, fmtClock(TIME_LIMITS[pz.difficulty]) + " limit"),
        pz.category ? h("span", { class: "pill" }, pz.category.replace(/_/g, " ")) : null,
        rec?.solved ? h("span", { class: "pill pill-ok" }, "best " + fmtTime(rec.timeMs)) : null),
      solutionHost,
      h("div", { class: "row gap-3 wrapflex mt-5" },
        h("button", { class: "btn btn-primary grow", onClick: () => { m.close(); startTraining(pz.difficulty, pz.archetypeId); } },
          rec?.solved ? "Beat your time ▸" : "Start puzzle ▸"),
        h("button", { class: "btn", onClick: () => { m.close(); openBoard(pz, false); } },
          icon("trophy", 14), "Leaderboard")),
    ), { wide: true });

    const profile = session.profile;
    if (!profile || profile.isGuest || profile.isAnonymous) return;
    clear(solutionHost).append(h("div", { class: "label" }, "// Loading your solution library…"));
    getSavedSolution(profile.uid, pz.archetypeId).then(async (initial) => {
      const solution = rec?.solved
        ? await getAccomplishableSolution(profile, pz.archetypeId)
        : initial;
      clear(solutionHost);
      if (!solution) {
        solutionHost.append(h("div", { class: "solution-library-empty" },
          "Solve and submit this problem to save your code, solution history, and a shareable accomplishment."));
        return;
      }
      const completed = !!solution.completed;
      const accomplishment = h("button", { class: "btn btn-sm", disabled: !completed, onClick: async () => {
        accomplishment.disabled = true;
        try {
          solution.accomplishment = !solution.accomplishment;
          const updated = await toggleAccomplishment(profile, pz.archetypeId, solution.accomplishment);
          Object.assign(solution, updated);
          accomplishment.textContent = solution.accomplishment ? "✓ In accomplishments" : "+ Add to accomplishments";
          if (!solution.accomplishment) accomplishment.prepend(icon("plus", 13));
          toast(solution.accomplishment ? "Added to accomplishments and pinned on your profile." : "Removed from accomplishments.", "ok");
        } catch (error) {
          solution.accomplishment = !solution.accomplishment;
          toast(error.message || "Couldn't update accomplishment.", "err");
        } finally { accomplishment.disabled = false; }
      } }, solution.accomplishment ? "✓ In accomplishments" : "+ Add to accomplishments");
      accomplishment.classList.add("accomplishment-btn");
      if (!solution.accomplishment) accomplishment.prepend(icon("plus", 13));
      const publicLinkHost = h("div", { class: "solution-public-url mt-3" });
      const renderPublicLink = () => {
        clear(publicLinkHost);
        if (!solution.isPublic || !solution.publicShareId) return;
        publicLinkHost.append(h("span", { class: "label" }, "Public link"),
          h("a", { class: "solution-share-link", href: `/share/${solution.publicShareId}`, target: "_blank", rel: "noopener" },
            `${window.location.origin}/share/${solution.publicShareId}`));
      };
      const shareable = completed && !!String(solution.code || "").trim();
      const visibility = h("label", { class: "solution-visibility-switch", title: shareable ? "Make this completed solution public" : "A legacy clear can be an accomplishment but needs saved code before it can be shared" },
        h("input", { type: "checkbox", checked: !!solution.isPublic, disabled: !shareable }),
        h("span", { class: "solution-switch-ui" }),
        h("span", { class: "label" }, solution.isPublic ? "Public" : "Private"));
      const toggle = visibility.querySelector("input");
      toggle?.addEventListener("change", async () => {
        toggle.disabled = true;
        try {
          const updated = await setSolutionVisibility(profile, pz.archetypeId, toggle.checked);
          Object.assign(solution, updated);
          visibility.querySelector(".label").textContent = updated.isPublic ? "Public" : "Private";
          renderPublicLink();
          if (updated.isPublic) {
            if (!updated.analysis) {
              const analysis = fastCodeAnalysis({ code: updated.code, language: updated.language, problem: pz, submissions: [] });
              Object.assign(solution, { analysis: await saveSolutionAnalysis(profile, pz.archetypeId, analysis, { source: "training" }) });
            }
            const url = `${window.location.origin}/share/${updated.publicShareId}`;
            try { await navigator.clipboard.writeText(url); toast("Public solution and analysis link copied.", "ok"); }
            catch { prompt("Copy your public solution and analysis link:", url); }
          } else toast("Solution is private again.", "ok");
        } catch (error) {
          toggle.checked = !toggle.checked;
          toast(error.message || "Couldn't change visibility.", "err");
        } finally { toggle.disabled = !shareable; }
      });
      renderPublicLink();
      solutionHost.append(
        h("div", { class: "solution-library-head" },
          h("div", {},
            h("div", { class: "label" }, "// Saved " + (completed ? "solution" : "incomplete draft")),
            h("div", { class: "mono mt-1", style: { fontSize: "12px", color: "var(--muted-fg)" } },
              completed ? `${solution.completedSubmits || 1} accepted submit${(solution.completedSubmits || 1) === 1 ? "" : "s"} · best ${fmtTime(solution.bestTimeMs)}` : `${solution.incompleteSaves || 1} incomplete save${(solution.incompleteSaves || 1) === 1 ? "" : "s"}`)),
          h("span", { class: "pill" + (completed ? " pill-ok" : "") }, solution.language)),
        h("div", { class: "row gap-2 wrapflex mt-3" },
          h("button", { class: "btn btn-sm solution-view-btn", onClick: () => openSavedSolution(pz, solution) },
            icon("pencil", 14), "View solution"),
          h("button", { class: "btn btn-sm btn-primary", onClick: () => navigate(`/analysis/${encodeURIComponent(profile.uid)}/${encodeURIComponent(pz.archetypeId)}`) },
            icon("bulb", 14), "Analyze My Code"),
          accomplishment, visibility),
        publicLinkHost,
      );
    }).catch(() => {
      clear(solutionHost).append(h("div", { class: "solution-library-empty" }, "Your solution library is temporarily unavailable."));
    });
  }

  function openPuzzleSolutions(pz) {
    const host = h("div", { class: "solution-history-list mt-5" }, h("div", { class: "label" }, "// Loading shared solutions…"));
    const m = modal(h("div", { class: "solution-modal" },
      h("div", { class: "eyebrow mb-2" }, "// Training Grounds"),
      h("h2", { class: "head mb-2" }, "Solutions for ", pz.title),
      h("p", { class: "body-text" }, "Browse every solution its author has explicitly shared for this puzzle."),
      host,
    ), { wide: true });
    getPublicPuzzleSolutions(pz.archetypeId).then((solutions) => {
      clear(host);
      if (!solutions.length) {
        host.append(h("div", { class: "solution-library-empty" }, "No public solutions have been shared for this puzzle yet."));
        return;
      }
      host.append(...solutions.map((share) => h("button", { class: "solution-history-row", onClick: () => {
        m.close();
        navigate("/share/" + share.id);
      } },
        h("span", { class: "row gap-2", style: { minWidth: "0" } },
          icon("pencil", 14),
          h("span", { class: "mono", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, share.ownerUsername || "ByteBlitz player")),
        h("span", { class: "label" }, `${share.language || "code"}${share.bestTimeMs ? ` · ${fmtTime(share.bestTimeMs)}` : ""}`))));
    }).catch(() => {
      clear(host).append(h("div", { class: "solution-library-empty" }, "Shared solutions are temporarily unavailable."));
    });
  }

  async function openSavedSolution(pz, solution) {
    const profile = session.profile;
    const historyHost = h("div", { class: "solution-history-list mt-5" }, h("div", { class: "label" }, "// Loading solve history…"));
    const code = h("pre", { class: "solution-code" }, solution.code || "// No saved source available.");
    const publicLinkHost = h("div", { class: "solution-public-url mt-3" });
    const renderPublicLink = () => {
      clear(publicLinkHost);
      if (!solution.isPublic || !solution.publicShareId) return;
      const url = `${window.location.origin}/share/${solution.publicShareId}`;
      publicLinkHost.append(h("span", { class: "label" }, "Public code + analysis link"), h("a", { class: "solution-share-link", href: `/share/${solution.publicShareId}`, target: "_blank", rel: "noopener" }, url));
    };
    const accomplishment = h("button", { class: "icon-btn ui-tooltip", "data-tooltip": solution.accomplishment ? "Remove from accomplishments" : "Add to accomplishments", "aria-label": "Toggle accomplishment", disabled: !solution.completed, onClick: async () => {
      accomplishment.disabled = true;
      try {
        solution.accomplishment = !solution.accomplishment;
        Object.assign(solution, await toggleAccomplishment(profile, solution.archetypeId, solution.accomplishment));
        accomplishment.setAttribute("data-tooltip", solution.accomplishment ? "Remove from accomplishments" : "Add to accomplishments");
        clear(accomplishment).append(icon("trophy", 15));
        toast(solution.accomplishment ? "Added to accomplishments." : "Removed from accomplishments.", "ok");
      } catch (error) {
        solution.accomplishment = !solution.accomplishment;
        toast(error.message || "Couldn't update accomplishment.", "err");
      } finally { accomplishment.disabled = !solution.completed; }
    } }, icon("trophy", 15));
    if (solution.accomplishment) accomplishment.classList.add("is-active");
    const visibility = h("label", { class: "solution-visibility-switch compact", "data-tooltip": solution.completed ? "Make code and analysis public" : "Complete the solution before sharing" }, h("input", { type: "checkbox", checked: !!solution.isPublic, disabled: !solution.completed }), h("span", { class: "solution-switch-ui" }), h("span", { class: "label" }, solution.isPublic ? "Public" : "Private"));
    const toggle = visibility.querySelector("input");
    toggle?.addEventListener("change", async () => {
      toggle.disabled = true;
      try {
        const updated = await setSolutionVisibility(profile, solution.archetypeId, toggle.checked);
        Object.assign(solution, updated);
        if (updated.isPublic && !updated.analysis) {
          const baseline = fastCodeAnalysis({ code: updated.code, language: updated.language, problem: pz, submissions: [] });
          Object.assign(solution, { analysis: await saveSolutionAnalysis(profile, solution.archetypeId, baseline, { source: "training" }) });
        }
        visibility.querySelector(".label").textContent = solution.isPublic ? "Public" : "Private";
        renderPublicLink();
        toast(solution.isPublic ? "Public code and analysis link ready." : "Solution is private again.", "ok");
      } catch (error) {
        toggle.checked = !toggle.checked;
        toast(error.message || "Couldn't update visibility.", "err");
      } finally { toggle.disabled = !solution.completed; }
    });
    renderPublicLink();
    modal(h("div", { class: "solution-modal" },
      h("div", { class: "eyebrow mb-2" }, "// Saved " + (solution.completed ? "solution" : "incomplete draft")),
      h("h2", { class: "head mb-2" }, pz.title),
      h("p", { class: "mono", style: { fontSize: "12px", color: "var(--muted-fg)" } }, solution.completed ? `${solution.language} · ${solution.lastMode} · best ${fmtTime(solution.bestTimeMs)}` : `${solution.language} · ${solution.lastMode} · incomplete draft`),
      h("div", { class: "solution-hub-actions mt-4" },
        h("button", { class: "btn btn-sm", onClick: () => startTraining(solution.difficulty, solution.archetypeId) }, icon("play", 13), "Play puzzle"),
        h("button", { class: "btn btn-sm btn-primary", onClick: () => navigate(`/analysis/${encodeURIComponent(profile.uid)}/${encodeURIComponent(solution.archetypeId)}`) }, icon("bulb", 14), "Analyze My Code"),
        accomplishment, visibility),
      publicLinkHost,
      code,
      h("div", { class: "section-title mt-6" }, "// Submission history"),
      historyHost), { wide: true });
    try {
      const history = await getSolutionHistory(profile.uid, pz.archetypeId);
      clear(historyHost);
      if (!history.length) historyHost.append(h("div", { class: "solution-library-empty" }, "No prior saved submissions."));
      else historyHost.append(...history.map((entry, index) => h("button", { class: "solution-history-row", onClick: () => { code.textContent = entry.code || "// Source unavailable"; } }, h("span", { class: "mono" }, entry.completed ? `#${history.length - index} · completed · ${fmtTime(entry.timeMs)}` : `#${history.length - index} · incomplete · ${entry.testsPassed || 0}/${entry.totalTests || 0} tests`), h("span", { class: "label" }, `${entry.language} · ${entry.mode} · ${fmtAgo(entry.savedAt ?? entry.solvedAt)}`))));
    } catch {
      clear(historyHost).append(h("div", { class: "solution-library-empty" }, "Couldn't load submission history."));
    }
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
      box.append(h("div", { class: "lb-row lb-head", style: { gridTemplateColumns: "52px 1fr 92px 92px 88px 104px" } },
        h("span", {}, "#"), h("span", {}, "Player"),
        h("span", {}, "Unranked"), h("span", {}, "Ranked"), h("span", {}, "Time"), h("span", {}, "Solution")));

      const list = h("div", { class: "divide" });
      rows.forEach((r, i) => {
        const isMe = r.uid === session.profile?.uid;
        const rank = rankFor(r.rating, r);
        const solutionCell = h("span", { class: "solution-board-cell" }, "—");
        const row = h("div", {
          class: "lb-row" + (isMe ? " me" : "") + (i < 3 ? " podium" : ""),
          style: { gridTemplateColumns: "52px 1fr 92px 92px 88px 104px", cursor: "pointer" },
          onClick: () => navigate("/profile/" + r.uid),
        },
          h("span", { class: "rk" }, medal(i)),
          h("div", { class: "row gap-3", style: { minWidth: "0" } }, avatar(r, "sm"), h("span", { class: "nm" }, r.username)),
          h("span", { class: "tnum", style: { color: "var(--primary)" } }, r.soloRuns > 0 ? displayPlacementRating(r.soloRating, r.soloRd, r) : "—"),
          h("span", { class: "tnum", style: { color: rank.color } }, rank.placement ? "Unranked" : displayPlacementRating(r.rating, r.rd, r)),
          h("span", { class: "tnum", style: { fontWeight: "700" } }, fmtTime(r.timeMs)),
          solutionCell);
        list.append(row);
        getPublicPuzzleSolution(r.uid, pz.archetypeId).then((share) => {
          if (!share) return;
          clear(solutionCell).append(h("button", { class: "btn btn-sm", onClick: (event) => {
            event.stopPropagation();
            navigate("/share/" + share.id);
          } }, icon("pencil", 14), "View solution"));
        }).catch(() => {});
      });

            box.append(list);
      host.append(box,
        h("p", { class: "label mt-4", style: { lineHeight: "1.7", textTransform: "none", letterSpacing: "0" } },

          "Unranked and Ranked are that player's two ELO tracks. Ranked unlocks after seven Unranked placement games."));
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
    const profile = session.profile;
    try {
      if (profile && !profile.isGuest && !profile.isAnonymous) {
        await syncSavedSolutionsToPuzzleRecords(profile);
      }
      records = await getMyPuzzleRecords(profile);
      savedSolutions = profile && !profile.isGuest && !profile.isAnonymous
        ? await getSavedSolutions(profile.uid)
        : [];
    } catch (e) {
      console.error(e);
      records = {};
      savedSolutions = [];
    }
  }

  function paintSolutionsWorkspace() {
    clear(bodyHost);
    const profile = session.profile;
    if (!profile || profile.isGuest || profile.isAnonymous) {
      bodyHost.append(emptyState("Sign in to keep private solutions, drafts, accomplishments, and share links."));
      return;
    }

    const categories = [...new Set(savedSolutions.map((solution) => solution.category).filter(Boolean))].sort();
    const visible = savedSolutions.filter((solution) => {
      const categoryMatch = categoryFilter === "all" || solution.category === categoryFilter;
      const statusMatch = solutionFilter === "all"
        || (solutionFilter === "completed" && solution.completed)
        || (solutionFilter === "incomplete" && !solution.completed)
        || (solutionFilter === "accomplishments" && solution.accomplishment)
        || (solutionFilter === "public" && solution.isPublic);
      return categoryMatch && statusMatch;
    });

    const side = h("aside", { class: "training-filter-side solutions-filter-side" },
      h("div", { class: "label mb-3" }, "// Solutions"),
      ...[["all", "All solutions"], ["completed", "Completed"], ["incomplete", "Incomplete"], ["accomplishments", "Accomplishments"], ["public", "Public"]].map(([id, label]) =>
        h("button", { class: "solutions-side-link" + (solutionFilter === id ? " active" : ""), onClick: () => {
          solutionFilter = id;
          sessionStorage.setItem("bb_solution_filter", id);
          paintSolutionsWorkspace();
        } }, label)),
      h("div", { class: "label mt-5 mb-2" }, "// Category"),
      solutionCategoryBtn("all", "All categories"),
      ...categories.map((category) => solutionCategoryBtn(category, category.replace(/_/g, " "))));

    const content = h("section", { class: "solutions-content" },
      h("div", { class: "between wrapflex gap-3 mb-5" },
        h("div", {},
          h("div", { class: "eyebrow mb-2" }, "// My solutions"),
          h("h2", { class: "head" }, `${visible.length} ${visible.length === 1 ? "solution" : "solutions"}`)),
        h("span", { class: "label" }, "Private by default")));

    if (!visible.length) {
      content.append(h("div", { class: "solution-library-empty mt-5" },
        savedSolutions.length ? "No saved solutions match these filters." : "Completed and incomplete code is saved here automatically after Training, Unranked, or Ranked runs."));
    } else {
      const list = h("div", { class: "solutions-grid mt-5" });
      visible.forEach((solution) => list.append(solutionCard(solution)));
      content.append(list);
    }
    sideHost.append(side);
    bodyHost.append(content);
  }

  function solutionCategoryBtn(id, label) {
    return h("button", { class: "solutions-side-link" + (categoryFilter === id ? " active" : ""), onClick: () => {
      categoryFilter = id;
      sessionStorage.setItem("bb_train_category", id);
      paintSolutionsWorkspace();
    } }, label);
  }

  function solutionCard(solution) {
    const profile = session.profile;
    const completed = !!solution.completed;
    const status = completed ? "Completed" : "Incomplete";
    const trash = h("button", { class: "icon-btn ui-tooltip solution-trash-icon", "data-tooltip": "Trash solution", "aria-label": "Trash solution", onClick: async () => {
      const confirmed = await confirmModal("Trash solution", "This permanently removes the saved code, submission history, public share, and accomplishment badge for this puzzle.", "Trash solution");
      if (!confirmed) return;
      trash.disabled = true;
      try {
        await trashSavedSolution(profile, solution.archetypeId);
        savedSolutions = savedSolutions.filter((entry) => entry.archetypeId !== solution.archetypeId);
        toast("Solution trashed.", "ok");
        paintSolutionsWorkspace();
      } catch (error) {
        toast(error.message || "Couldn't trash this solution.", "err");
        trash.disabled = false;
      }
    } }, icon("trash", 15));
    const play = h("button", { class: "icon-btn ui-tooltip solution-play-icon", "data-tooltip": "Play puzzle", "aria-label": "Play puzzle", onClick: () => startTraining(solution.difficulty, solution.archetypeId) }, icon("play", 13));
    const analyze = h("button", { class: "btn btn-sm btn-primary solution-analyze-btn", onClick: () => navigate(`/analysis/${encodeURIComponent(profile.uid)}/${encodeURIComponent(solution.archetypeId)}`) }, icon("bulb", 14), "Analyze");
    return h("article", { class: "solution-card" + (completed ? " completed" : " incomplete") },
      h("div", { class: "between gap-3" },
        h("div", { class: "row gap-2" }, h("span", { class: "pill" + (completed ? " pill-ok" : "") }, status), play, trash),
        solution.isPublic ? h("span", { class: "solution-public-label" }, "Public") : h("span", { class: "label" }, "Private")),
      h("h3", { class: "mono mt-4", style: { fontSize: "15px", marginBottom: "0" } }, solution.title),
      h("p", { class: "label mt-2", style: { textTransform: "none", letterSpacing: "0" } }, `${solution.difficulty} · ${(solution.category || "general").replace(/_/g, " ")} · ${solution.lastMode}`),
      h("div", { class: "solution-card-meta mt-4" }, h("span", {}, completed ? `Best ${fmtTime(solution.bestTimeMs)}` : `${solution.incompleteSaves || 1} incomplete ${solution.incompleteSaves === 1 ? "draft" : "drafts"}`), h("span", {}, `${solution.saveCount || 1} saved`)),
      h("div", { class: "solution-card-actions mt-5" },
        h("button", { class: "btn btn-sm solution-view-btn", onClick: () => openSavedSolution(solution, solution) }, icon("pencil", 14), "View solution"),
        analyze));
  }

  await loadRecords();
  paintWorkspace();

  let lastUid = session.profile?.uid ?? null;
  unsubs.push(onSession(async () => {
    const uid = session.profile?.uid ?? null;
    if (uid !== lastUid) { lastUid = uid; await loadRecords(); }
    paintWorkspace();
  }));

  return () => unsubs.forEach((fn) => { try { fn(); } catch {} });
}
