// ============================================================================
// Player search — the nav-bar box that finds other people.
//
// This is the front door to every social feature: you find someone here, open
// their profile, and from there friend them, message them or challenge them.
// ============================================================================

import { h, clear, icon, debounce, avatar, toast } from "./ui.js";
import { session } from "./session.js";
import { displayPlacementRating, rankFor } from "./glicko.js";
import { searchPlayers, sendFriendRequest, getSentRequests, getFriends } from "./store.js";
import { navigate } from "./router.js";

export function playerSearchBox(opts = {}) {
  const placeholder = opts.placeholder || "Search players…";
  const pop = h("div", { class: "search-pop hidden" });
  const input = h("input", {
    class: "input", type: "text", placeholder,
    "aria-label": "Search players", autocomplete: "off",
  });

  let sent = new Set();
  let friends = new Set();
  let loadedRelations = false;
  let searchEpoch = 0;

  async function loadRelations() {
    const me = session.profile;
    if (loadedRelations || !me || me.isAnonymous) return;
    loadedRelations = true;
    try {
      const [s, f] = await Promise.all([getSentRequests(me.uid), getFriends(me.uid)]);
      sent = new Set(s);
      friends = new Set(f.map((x) => x.uid));
    } catch { /* the search still works without the relationship badges */ }
  }

  function open(node) { clear(pop).append(node); pop.classList.remove("hidden"); }
  function close() { pop.classList.add("hidden"); }

  const run = debounce(async () => {
    const term = input.value.trim();
    if (term.length < 2) { close(); return; }
    const epoch = ++searchEpoch;

    const me = session.profile;
    if (!me || me.isAnonymous) {
      open(h("div", { class: "empty", style: { border: "none" } },
        me?.isGuest
          ? "Guests can't search for players. Create an account to find people."
          : "Sign in to find other players."));
      return;
    }

    open(h("div", { class: "empty", style: { border: "none" } }, "Searching…"));

    let results = [];
    try { results = await searchPlayers(term, me.uid); }
    catch (e) {
      console.error(e);
      if (epoch === searchEpoch) {
        open(h("div", { class: "empty", style: { border: "none" } }, "Player search is temporarily unavailable. Try again."));
      }
      return;
    }

    // Do not let a slower earlier query replace the results for newer text.
    if (epoch !== searchEpoch || input.value.trim() !== term) return;
    if (!results.length) {
      open(h("div", { class: "empty", style: { border: "none" } }, `No player called "${term}".`));
      return;
    }

    clear(pop);
    results.forEach((u) => pop.append(resultRow(u)));
    pop.classList.remove("hidden");
  }, 240);

  function resultRow(u) {
    const rank = rankFor(u.rating, u);
    const go = () => { close(); input.value = ""; setExpanded(false); navigate("/profile/" + u.uid); };

    const action = friends.has(u.uid)
      ? h("span", { class: "pill pill-ok" }, "Friends")
      : sent.has(u.uid)
        ? h("span", { class: "pill" }, "Pending")
        : h("button", { class: "mini-btn", title: "Send friend request",
            onClick: async (e) => {
              e.stopPropagation();
              // Guard against the element being detached during async work.
              const btn = e.currentTarget || (e.target && e.target.closest && e.target.closest('button'));
              try {
                await sendFriendRequest(session.profile, u);
                sent.add(u.uid);
                if (btn && btn.replaceWith) {
                  try { btn.replaceWith(h("span", { class: "pill" }, "Pending")); }
                  catch (_) { /* best-effort UI update — ignore DOM races */ }
                }
                toast("Friend request sent.", "ok");
              } catch (err) { console.error(err); toast("Couldn't send that request.", "err"); }
            } }, icon("userPlus", 14));

    const row = h("div", { class: "search-row", style: { cursor: "pointer" }, onClick: go },
      avatar(u, "sm"),
      h("div", { class: "grow" },
        h("div", { class: "mono", style: { fontSize: "13.5px", fontWeight: "500" } }, u.username),
        h("div", { class: "row gap-3 mt-1" },
          h("span", { class: "label", style: { color: rank.color } },
            rank.placement ? "Unranked" : rank.name),
          h("span", { class: "label" }, "R " + displayPlacementRating(u.rating, u.rd, u)),
          h("span", { class: "label" }, "U " + displayPlacementRating(u.soloRating, u.soloRd, u)))),
      action);
    return row;
  }

  // ── Collapsed / expanded ──────────────────────────────────────────────
  // At rest the box is just the magnifier; clicking it slides the field open.
  // It folds back up when you click away, as long as it's empty.
  const toggle = h("button", {
    class: "search-toggle", type: "button",
    title: "Search players", "aria-label": "Search players",
    onClick: () => expand(),
  }, icon("search", 17));

  const wrap = h("div", { class: "nav-search" }, toggle, input, pop);

  function setExpanded(open) {
    wrap.classList.toggle("open", open);
    opts.onExpandedChange?.(open);
  }

  function expand() {
    setExpanded(true);
    input.focus();
    loadRelations();
  }

  function collapse() {
    close();
    if (input.value.trim()) return;   // keep an in-progress search visible
    setExpanded(false);
  }

  input.addEventListener("input", run);
  input.addEventListener("focus", async () => {
    await loadRelations();
    if (input.value.trim().length >= 2) run();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    input.value = "";
    searchEpoch++;
    close();
    setExpanded(false);
    input.blur();
  });

  document.addEventListener("mousedown", (e) => {
    if (!wrap.contains(e.target)) collapse();
  });

  return wrap;
}
