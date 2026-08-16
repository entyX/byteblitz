// ============================================================================
// The main page. No marketing homepage — you land directly on the game.
//
// Layout follows the arena sketch: friends down the left, and one welcome panel
// holding the two gamemodes plus a single card that reacts to whichever mode is
// selected. Nothing is played from here until a mode is picked.
// ============================================================================

import { h, add, clear, toast, icon, fmtTime, fmtClock, modal, avatar } from "../ui.js";
import { session, onSession, requireAccount, openAuthModal } from "../session.js";
import {
  tierFor, rankFor, displayPlacementRating, placementLeft, placementGamesPlayed,
  placementConfidence, isPlaced, PLACEMENT_GAMES, TIME_LIMITS,
} from "../glicko.js";
import {
  watchFriends, ensureConversation, rankedPosition, getFriends, watchPresenceCounts, watchTotalUsers, watchPresence, watchProfile,
} from "../store.js";
import { startSolo, startTutorial, findRankedMatch, challengeFriend, RANKED_ELO_WINDOW } from "../game.js";
import { watchLobbyCount } from "../matchmaking.js";
import { c4QuestionMode, setC4QuestionMode } from "../burst-generator.js";
import { navigate } from "../router.js";

const LS_MODE = "bb_mode";

export async function renderHome(params, root) {
  const unsubs = [];
  const page = h("div", { class: "wrap home-page", style: { paddingTop: "17px", paddingBottom: "17px" } });
  root.append(page);

  // Kept for the tab's lifetime, not forever: coming back from a match keeps
  // the mode you were playing, but a fresh visit starts undecided so the card
  // reads "choose a gamemode".
  let mode = sessionStorage.getItem(LS_MODE) || null;
  let myRank = null;
  let unrankedLaunching = false;
  let unrankedLaunchStatus = "";

  const railHost = h("div", { class: "rail" });
  const newsHost = h("aside", { class: "home-news" });
  const welcomeHost = h("div", { class: "welcome" });
  const extrasHost = h("div", { class: "side-tiles" });
  const streakHost = h("div", {});

  // Two columns that together fill the viewport: friends + shortcuts on the
  // left, the welcome panel on the right. The shortcuts live down here rather
  // than under the panel so the whole page fits on screen without scrolling.
  page.append(
    streakHost,
    h("div", { class: "home-grid" },
      h("div", { class: "home-side" }, railHost, extrasHost),
      h("div", { class: "home-main" }, welcomeHost),
      newsHost),
  );

  // ── Welcome panel ────────────────────────────────────────────────────────
  const gmGrid = h("div", { class: "gm-grid" });
  const eloHost = h("div", {});
  const headHost = h("div", {});

  welcomeHost.append(headHost, gmGrid);

  function paintHead() {
    clear(headHost);
    const p = session.profile;
    const placing = !!p && !p.isGuest && !p.isAnonymous && !isPlaced(p);
    headHost.append(h("div", { class: "welcome-head" },
      h("button", { class: "welcome-tutorial", title: "Play the optional tutorial", onClick: () => startTutorial() },
        "Tutorial", icon("play", 13)),
      h("div", { class: "welcome-eyebrow" }, "Welcome to"),
      h("h1", { class: "welcome-title gradient-text" }, "ByteBlitz"),
      h("p", { class: "welcome-sub" },
        !p
          ? "Play Unranked practice without an account. Sign in and verify your email to keep ELO, complete placement, play Ranked, and add friends."
          : p.isGuest
            ? `Playing as ${p.username} — unranked and training only. Your progress is saved on this device.`
            : placing
              ? `Complete ${placementLeft(p)} more Unranked placement ${placementLeft(p) === 1 ? "game" : "games"} to unlock Ranked. Your current confidence is ${placementConfidence(p)}/10.`
              : "One problem, one clock. Pick a gamemode to get started."),
    ));
  }

  // ── Gamemode cards ───────────────────────────────────────────────────────
  function paintModes() {
    const p = session.profile;
    const rankedLocked = !!p && !isPlaced(p);
    if (rankedLocked && mode === "ranked") {
      mode = null;
      sessionStorage.removeItem(LS_MODE);
    }
    clear(gmGrid);

    gmGrid.append(
      modeCard({
        id: "unranked",
        cls: "",
        title: "Unranked",
        lines: [
          "Play against the time!",
          "Completely SOLO, your UNRANKED ELO gets impacted.",
        ],
        foot: "Solo · vs the clock",
      }),
      modeCard({
        id: "ranked",
        cls: "gm-ranked",
        title: "Ranked",
        lines: [
          "Enter matchmaking against someone with a similar skill level!",
          "Your RANKED ELO gets impacted.",
        ],
        foot: rankedLocked
          ? `${placementLeft(p)} placement games to unlock`
          : p ? "Head to head · rated" : "Verified account required",
      }),
      eloHost,
    );

    paintElo();
  }

  // The selected marker is always in the layout — an empty box when unselected —
  // so picking a mode never changes the card's size.
  function modeCard({ id, cls, title, lines, foot }) {
    const p = session.profile;
    const disabled = id === "ranked" && !!p && !isPlaced(p);
    const selected = !disabled && mode === id;
    return h("button", {
      class: `gm-card ${cls}${selected ? " selected" : ""}${disabled ? " locked" : ""}`,
      "aria-pressed": selected ? "true" : "false",
      "aria-disabled": disabled ? "true" : "false",
      disabled,
      onClick: () => selectMode(id),
    },
      h("div", { class: "gm-title" }, title),
      ...lines.map((t, i) => h("p", { class: i === 0 ? "gm-desc" : "gm-note", style: { margin: "0" } }, t)),
      h("div", { class: "gm-foot" },
        h("span", {}, selected ? "Selected" : foot),
        selected
          ? h("span", { class: "gm-check" }, icon("check", 13))
          : h("span", { class: "gm-check-off" }, disabled ? "LOCK" : "")
      )
    );
  }

  function selectMode(id) {
    if (id === "ranked" && session.profile && !isPlaced(session.profile)) return;
    mode = mode === id ? null : id;
    if (mode) sessionStorage.setItem(LS_MODE, mode);
    else sessionStorage.removeItem(LS_MODE);
    paintModes();
  }

  // ── The reactive right-hand card ─────────────────────────────────────────
  const queueCount = h("span", { class: "v tnum" }, "—");

  function paintElo() {
    clear(eloHost);
    const p = session.profile;

    if (!mode) {
      eloHost.className = "elo-card is-empty";
      eloHost.append(
        h("div", { style: { color: "var(--muted)" } }, icon("compass", 34)),
        h("h2", { class: "head mt-4", style: { fontSize: "clamp(1.4rem,2.6vw,1.9rem)", color: "var(--muted-fg)" } },
          "Choose a gamemode"),
        h("p", { class: "mono mt-3", style: { fontSize: "13px", color: "var(--muted)", lineHeight: "1.65", maxWidth: "260px" } },
          "Pick Unranked or Ranked and your rating, rank and opponent show up here."),
      );
      return;
    }

    eloHost.className = "elo-card";
    if (mode === "unranked") paintUnrankedElo(p);
    else paintRankedElo(p);
  }

  function paintUnrankedElo(p) {
    const tier = tierFor(p?.soloRating ?? 1500);
    const generatedOnly = c4QuestionMode() === "generated_only";
    const toggleMode = () => { setC4QuestionMode(generatedOnly ? "existing_first" : "generated_only"); paintElo(); };

    add(eloHost,
      h("div", { class: "label" }, "Your unranked ELO"),
      h("div", { class: "elo-value mt-2", style: { color: p ? "var(--primary)" : "var(--muted)" } },
        p ? displayPlacementRating(p.soloRating, p.soloRd, p) : "—"),
      p && !isPlaced(p)
        ? h("div", { class: "label mt-2", style: { color: "var(--primary)" } },
            `Placement ${placementGamesPlayed(p)}/${PLACEMENT_GAMES} · Confidence ${placementConfidence(p)}/10`)
        : h("div", { class: "label mt-2" }, "No ranks in Unranked"),

      h("div", { class: "elo-facts" },
        fact("Fight against", "The clock"),
        // Set by your unranked rating, not chosen — see startSolo.
        fact("Difficulty", tier.name),
        fact("Time limit", fmtClock(TIME_LIMITS[tier.name] ?? 300)),
        fact("Best time", p?.soloBest?.[tier.name] != null ? fmtTime(p.soloBest[tier.name]) : "—"),
      ),

      h("button", { class: "btn btn-block mt-4 c4-generation-toggle", onClick: toggleMode, "aria-pressed": generatedOnly ? "true" : "false" },
        icon(generatedOnly ? "bulb" : "target", 14), generatedOnly ? "AI-generated Burst only" : "Authored-first Burst"),
      h("p", { class: "label mt-2", style: { lineHeight: "1.5", textTransform: "none", letterSpacing: "0" } },
        generatedOnly ? "Debug mode: only validated local AI questions are selected." : "Existing authored questions are favored; Burst generation expands the pool as you progress."),
      unrankedLaunching
        ? h("div", { class: "c4-launch-status", role: "status" }, h("span", { class: "spinner" }), unrankedLaunchStatus || "Preparing your Burst question…"),
      h("button", { class: "play-btn mt-4", disabled: unrankedLaunching, onClick: onPlayUnranked },
        unrankedLaunching ? "Loading…" : (p && !isPlaced(p) ? "Play placement" : "Play"), icon("play", 20)),
    );
  }

  function paintRankedElo(p) {
    const signedOut = !p;
    const verificationLocked = session.needsEmailVerification();
    const placementLocked = !!p && !isPlaced(p);
    const locked = placementLocked || verificationLocked;
    const placed = !!p && isPlaced(p);
    const rank = p ? rankFor(p.rating, p) : tierFor(1500);

    add(eloHost,
      h("div", { class: "elo-rank-badge" },
        h("div", { class: "label" }, "Rank"),
          h("div", { class: "n", style: { color: placed && myRank ? rank.color : "var(--muted)" } },
          placed && myRank ? "#" + myRank : "—")),

      h("div", { class: "label" }, "Your ranked ELO"),
      h("div", { class: "elo-value mt-2", style: { color: signedOut ? "var(--muted)" : rank.color } },
        signedOut ? "—" : displayPlacementRating(p.rating, p.rd, p)),
      h("div", { class: "head mt-2", style: { fontSize: "24px", color: rank.color } },
        placementLocked ? "Placement" : rank.name),

      verificationLocked
        ? h("p", { class: "mono mt-2", style: { fontSize: "12.5px", color: "var(--muted-fg)", lineHeight: "1.6" } },
            "Verify your email to activate your account and unlock Ranked matchmaking.")
        : signedOut
          ? h("p", { class: "mono mt-2", style: { fontSize: "12.5px", color: "var(--muted-fg)", lineHeight: "1.6" } },
              "Sign in and verify your email to complete placement and enter Ranked matchmaking.")
          : placementLocked
          ? h("p", { class: "mono mt-2", style: { fontSize: "12.5px", color: "var(--muted-fg)", lineHeight: "1.6" } },
              `${placementLeft(p)} Unranked placement ${placementLeft(p) === 1 ? "game" : "games"} remaining. Finish at Confidence 10/10 to unlock Ranked.`)
          : null,

      h("div", { class: "elo-facts" },
        fact("Fight against", "Random"),
        fact("ELO of opponent", "± " + RANKED_ELO_WINDOW),
        factNode("In queue", queueCount),
      ),

      h("button", { class: "play-btn mt-6", onClick: onPlayRanked },
        verificationLocked ? "Verify email" : signedOut ? "Sign in to play" : placementLocked ? "Complete placement" : "Play", icon("play", 20)),
    );
  }

  function fact(k, v) {
    return h("div", { class: "elo-fact" }, h("span", { class: "k" }, k), h("span", { class: "v" }, v));
  }
  function factNode(k, node) {
    return h("div", { class: "elo-fact" }, h("span", { class: "k" }, k), node);
  }

  async function onPlayUnranked() {
    if (unrankedLaunching) return;
    unrankedLaunching = true;
    unrankedLaunchStatus = "Loading authored problems…";
    paintElo();
    try {
      await startSolo(undefined, {
        onProgress: (progress) => {
          unrankedLaunchStatus = progress?.text || "Preparing your Burst question…";
          paintElo();
        },
        onError: (error) => {
          unrankedLaunchStatus = error?.message || "Question selection failed.";
          paintElo();
        },
      });
    } finally {
      unrankedLaunching = false;
      if (!unrankedLaunchStatus || /^(Loading|Preparing|Fetching|Initializing)/i.test(unrankedLaunchStatus)) unrankedLaunchStatus = "";
      paintElo();
    }
  }

  async function onPlayRanked() {
    const p = session.profile;
    if (p && !isPlaced(p)) {
      mode = "unranked";
      sessionStorage.setItem(LS_MODE, mode);
      paintModes();
      toast("Complete your Unranked placement games to unlock Ranked.", "err");
      return;
    }
    findRankedMatch();
  }

  // ── Live friend news ─────────────────────────────────────────────────────
  let newsFriendsUnsub = null;
  let newsProfileUnsubs = [];
  function streakFor(activity = {}) {
    const today = new Date();
    let run = 0;
    let cursor = new Date(today);
    if (!activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
    while (activity[dayKey(cursor)]) { run++; cursor.setDate(cursor.getDate() - 1); }
    return run;
  }

  function paintNews() {
    newsFriendsUnsub?.();
    newsFriendsUnsub = null;
    newsProfileUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
    newsProfileUnsubs = [];
    clear(newsHost);
    const me = session.profile;
    if (!me || me.isGuest || me.isAnonymous) {
      newsHost.append(h("div", { class: "home-news-head" }, h("span", { class: "live-word" }, "News"), h("span", { class: "label" }, "Friends")),
        h("div", { class: "home-news-empty" }, "Sign in to see friends' streak milestones and accomplishments."));
      return;
    }
    const list = h("div", { class: "home-news-list" });
    newsHost.append(h("div", { class: "home-news-head" }, h("span", { class: "live-word" }, "News"), h("span", { class: "label" }, "Live")), list);
    const details = new Map();
    const render = () => {
      clear(list);
      const items = [...details.values()].flatMap((friend) => {
        const out = [];
        const streak = streakFor(friend.activityDays || {});
        if (streak >= 5 && streak % 5 === 0) out.push({ kind: "streak", friend, streak });
        if (friend.pinnedAccomplishment?.title) out.push({ kind: "accomplishment", friend, title: friend.pinnedAccomplishment.title });
        return out;
      }).slice(0, 4);
      if (!items.length) {
        list.append(h("div", { class: "home-news-empty" }, "Milestones from friends will appear here."));
        return;
      }
      items.forEach((item) => list.append(h("button", { class: "home-news-item", onClick: () => navigate("/profile/" + item.friend.uid) },
        avatar(item.friend, "sm"),
        h("span", { class: "grow", style: { minWidth: "0" } },
          h("span", { class: "mono home-news-title" }, item.kind === "streak"
            ? `${item.friend.username} reached a ${item.streak}-day streak`
            : `${item.friend.username} pinned an accomplishment`),
          h("span", { class: "label home-news-copy" }, item.kind === "streak" ? "Keep the coding streak alive." : item.title)))));
    };
    newsFriendsUnsub = watchFriends(me.uid, (friends) => {
      newsProfileUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
      newsProfileUnsubs = [];
      details.clear();
      friends.forEach((friend) => {
        details.set(friend.uid, friend);
        try {
          newsProfileUnsubs.push(watchProfile(friend.uid, (profile) => {
            details.set(friend.uid, { ...friend, ...(profile || {}) });
            render();
          }));
        } catch {}
      });
      render();
    });
  }

  // ── Streak bar ──────────────────────────────────────────────────────────
  function dayKey(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function paintStreak() {
    clear(streakHost);
    const activity = session.profile?.activityDays || {};
    const today = new Date();
    let run = 0;
    let cursor = new Date(today);
    if (!activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
    while (activity[dayKey(cursor)]) { run++; cursor.setDate(cursor.getDate() - 1); }

    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = dayKey(date);
      const isToday = key === dayKey(today);
      return h("div", { class: "streak-day" + (activity[key] ? " done" : "") + (isToday ? " today" : "") },
        h("span", { class: "dow" }, labels[date.getDay()]),
        h("span", { class: "day-dot", title: activity[key] ? "Activity completed" : "No activity yet" }, activity[key] ? "✓" : date.getDate()));
    });

    streakHost.append(h("section", { class: "streak-bar" },
      h("div", { class: "streak-summary" },
        h("span", { class: "streak-flame" }, run ? "🔥" : "○"),
        h("div", {},
          h("div", { class: "streak-count" }, `${run} ${run === 1 ? "day" : "days"}`),
          h("div", { class: "streak-copy" }, run ? "Current coding streak" : "Complete a run to start a streak"))),
      h("div", { class: "streak-week", "aria-label": "Activity days this week" }, days)));

    // Adjust the height of the home-grid so everything below the streak fits
    // inside the viewport without requiring a page scroll.
    function adjustGridHeight() {
      try {
        const grid = page.querySelector('.home-grid');
        if (!grid) return;
        const streakH = Math.ceil(streakHost.getBoundingClientRect().height);
        // Keep the same bottom padding used in CSS (34px) so cards don't touch.
        grid.style.height = `calc(100dvh - var(--nav-h, 63px) - ${streakH}px - 34px)`;
        grid.style.overflow = 'hidden';
      } catch (e) { /* best-effort */ }
    }

    // Run once now and hook up resize observers so the layout stays consistent.
    adjustGridHeight();
    const ro = window.ResizeObserver ? new ResizeObserver(adjustGridHeight) : null;
    if (ro) ro.observe(streakHost);
    const resizeHandler = () => adjustGridHeight();
    window.addEventListener('resize', resizeHandler);

    // Tear down when the page is removed: store cleanup handlers in `unsubs`.
    unsubs.push(() => { window.removeEventListener('resize', resizeHandler); if (ro) ro.disconnect(); });
  }

  // ── Shortcut tiles (left column, under the friends rail) ─────────────────
  let countsUnsub = null;
  let usersUnsub = null;
  function paintExtras() {
    countsUnsub?.(); usersUnsub?.();
    countsUnsub = usersUnsub = null;
    clear(extrasHost);
    const statsPanel = h("section", { class: "side-tile live-counts" },
      h("div", { class: "live-counts-head" },
        h("div", { class: "live-counts-title" }, h("span", { class: "live-word" }, "Live"), " activity"),
        h("span", { class: "label" }, "Real-time")),
      h("div", { class: "live-counts-grid" },
        liveCount("matchups", "Matchups"), liveCount("online", "Online"), liveCount("total", "Players")));
    extrasHost.append(statsPanel);

    try {
      countsUnsub = watchPresenceCounts(({ inMatches, onlineNotInMatch }) => {
        const matchEl = statsPanel.querySelector(".matchups");
        const onlineEl = statsPanel.querySelector(".online");
        if (matchEl) matchEl.textContent = String(inMatches);
        if (onlineEl) onlineEl.textContent = String(onlineNotInMatch);
      });
      usersUnsub = watchTotalUsers((count) => {
        const totalEl = statsPanel.querySelector(".total");
        if (totalEl) totalEl.textContent = String(count);
      });
    } catch (error) { console.error(error); }
  }

  function liveCount(className, label) {
    return h("div", { class: "live-count" },
      h("span", { class: `n ${className}` }, "—"),
      h("span", { class: "k" }, label));
  }

  function sideTile(ico, title, sub, onClick) {
    return h("button", { class: "side-tile", onClick },
      h("span", { class: "ico" }, icon(ico, 18)),
      h("span", { class: "grow", style: { minWidth: "0" } },
        h("span", { class: "t" }, title),
        h("span", { class: "s" }, sub)));
  }

  async function openFriendDuel() {
    const u = await requireAccount("gate");
    if (!u) return;
    let friends = [];
    try { friends = await getFriends(session.profile.uid); }
    catch (e) { console.error(e); toast("Couldn't load your friends list.", "err"); return; }
    if (!friends.length) { toast("Add a friend first — search for players up top.", "err"); return; }

    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Friend duel"),
      h("h2", { class: "head mb-5" }, "Pick an opponent"),
      h("div", { class: "panel divide" },
        ...friends.map((f) => h("div", { class: "list-row" },
          h("div", { class: "row gap-3" }, avatar(f.username, "sm"),
            h("span", { class: "mono", style: { fontSize: "13.5px" } }, f.username)),
          h("button", { class: "btn btn-sm", onClick: () => { m.close(); challengeFriend(f); } }, "Challenge")))),
    ));
  }

  // ── Friends rail ─────────────────────────────────────────────────────────
  let friendUnsub = null;
  let friendDetailsUnsubs = [];

  function paintRail() {
    friendUnsub?.();
    friendUnsub = null;
    friendDetailsUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
    friendDetailsUnsubs = [];
    clear(railHost);

    const p = session.profile;
    const signedIn = p && !p.isAnonymous;
    const countEl = h("span", { class: "label" }, "");

    // Messages live here rather than in the nav: the people you message are the
    // people in this list.
    add(railHost, h("div", { class: "rail-head" },
      h("div", { class: "row gap-2" },
        h("span", { style: { color: "var(--primary)", display: "flex" } }, icon("users", 15)),
        h("span", { class: "eyebrow", style: { letterSpacing: ".2em" } }, "Friends"),
        countEl),
      signedIn
        ? h("button", { class: "mini-btn", title: "Open messages", "aria-label": "Messages",
            onClick: () => navigate("/messages") }, icon("message", 14))
        : null));

    if (!p) {
      railHost.append(h("div", { style: { padding: "18px" } },
        h("div", { class: "empty" }, "Sign in to add friends and message them."),
        h("button", { class: "btn btn-block mt-3", onClick: () => openAuthModal({ intent: "gate", allowAnonymous: true }) }, "Sign in")));
      return;
    }
    if (p.isAnonymous) {
      railHost.append(h("div", { style: { padding: "18px" } },
        h("div", { class: "empty" }, "Guests can't add friends. Create an account to play ranked and message people."),
        h("button", { class: "btn btn-block mt-3", onClick: () => openAuthModal({ intent: "gate", allowAnonymous: false }) }, "Create account")));
      return;
    }

    const body = h("div", { class: "rail-body" }, h("div", { class: "empty", style: { border: "none" } }, "Loading…"));
    railHost.append(body,
      h("div", { class: "rail-foot" },
        h("p", { class: "label", style: { textAlign: "center", lineHeight: "1.6" } },
          "Find players with the search bar")));

    friendUnsub = watchFriends(p.uid, (list) => {
      countEl.textContent = list.length ? String(list.length) : "";
      friendDetailsUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
      friendDetailsUnsubs = [];
      clear(body);
      if (!list.length) {
        body.append(h("div", { class: "empty", style: { border: "none" } },
          "No friends yet. Search for a player, open their profile and send a request."));
        return;
      }
      list
        .slice()
        .sort((a, b) => a.username.localeCompare(b.username))
        .forEach((f) => body.append(friendRow(f)));
    });
  }

  function friendRow(f) {
    const host = h("div", { class: "friend-row" });
    const avatarHost = h("span");
    let details = { ...f, online: false, inMatch: false };
    const paintAvatar = () => {
      clear(avatarHost).append(avatar(details, "sm"));
    };
    paintAvatar();

    const nameCol = h("div", { class: "grow", style: { minWidth: "0" } },
      h("button", { class: "friend-name", onClick: () => navigate("/profile/" + f.uid) }, f.username),
      h("div", { class: "friend-meta" }, "Friend"));

    const acts = h("div", { class: "friend-acts" },
      h("button", { class: "mini-btn", title: "Message " + f.username, onClick: () => openChat(f) }, icon("message", 14)),
      h("button", { class: "mini-btn", title: "Challenge " + f.username, onClick: () => challengeFriend(f) }, icon("swords", 14)));

    host.append(avatarHost, nameCol, acts);

    // Profile updates provide the saved avatar, while presence drives its ring.
    try {
      const unsubProfile = watchProfile(f.uid, (profile) => { details = { ...details, ...profile }; paintAvatar(); });
      const unsubPresence = watchPresence(f.uid, (presence) => { details = { ...details, ...presence }; paintAvatar(); });
      friendDetailsUnsubs.push(unsubProfile, unsubPresence);
    } catch { /* best-effort visual detail */ }

    return host;
  }

  async function openChat(friend) {
    try {
      await ensureConversation(session.profile, friend);
      navigate("/messages/" + friend.uid);
    } catch (e) { console.error(e); toast("Couldn't open that conversation.", "err"); }
  }

  // ── Wire up ──────────────────────────────────────────────────────────────
  async function loadRank() {
    const p = session.profile;
    if (!p || p.isAnonymous) { myRank = null; return; }
    try { myRank = await rankedPosition(p.uid); }
    catch { myRank = null; }
    if (mode === "ranked") paintElo();
  }

  function paintAll() {
    paintStreak();
    paintHead();
    paintModes();
    paintNews();
    paintExtras();
  }

  paintAll();
  paintRail();
  loadRank();

  // The lobby is only readable by signed-in accounts, so subscribing as a guest
  // or a signed-out visitor would just log a permission error.
  let queueUnsub = null;
  function wireQueueCount() {
    queueUnsub?.();
    queueUnsub = null;
    const p = session.profile;
    if (!p || p.isAnonymous) { queueCount.textContent = "—"; return; }
    queueUnsub = watchLobbyCount((n) => { queueCount.textContent = String(n); });
  }

  let lastUid = session.profile?.uid ?? null;
  const off = onSession(() => {
    const uid = session.profile?.uid ?? null;
    paintAll();
    if (uid !== lastUid) {
      lastUid = uid;
      paintRail();
      loadRank();
      wireQueueCount();
    }
  });
  unsubs.push(off);

  wireQueueCount();

  // paintRail and wireQueueCount swap their own listeners each time they run,
  // so they aren't in `unsubs` — tear the live ones down explicitly.
  return () => {
    friendUnsub?.();
    newsFriendsUnsub?.();
    newsProfileUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
    queueUnsub?.();
    countsUnsub?.(); usersUnsub?.();
    friendDetailsUnsubs.forEach((unsub) => { try { unsub(); } catch {} });
    unsubs.forEach((fn) => { try { fn(); } catch {} });
  };
}

