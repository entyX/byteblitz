// ============================================================================
// App shell — nav, notifications, routing, session boot.
// ============================================================================

import { h, add, clear, toast, icon, fmtAgo, modal, avatar } from "./ui.js";
import { session, onSession, startSession, logout, openAuthModal, openEmailVerificationModal, requireAccount } from "./session.js";
import { route, startRouter, navigate, currentPath } from "./router.js";
import {
  watchNotifications, markAllRead, deleteNotification, clearNotifications,
  acceptFriendRequest, declineFriendRequest, watchIncomingChallenges,
} from "./store.js";
import { rankFor } from "./glicko.js";
import { arenaIsOpen } from "./arena.js";
import { acceptChallenge, declineChallenge, enterDuel } from "./game.js";
import { playerSearchBox } from "./search.js";
import { maybeOnboard } from "./onboarding.js";

import { renderHome } from "./views/home.js";
import { renderTraining } from "./views/training.js";
import { renderLeaderboard } from "./views/leaderboard.js";
import { renderMessages } from "./views/messages.js";
import { renderProfile } from "./views/profile.js";
import { renderChangelog } from "./views/changelog.js";
import { renderPublicSolution } from "./views/share.js";

const NAV = [
  { path: "/", label: "Play" },
  { path: "/training", label: "Training" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/changelog", label: "Changelog" },
];

// ── Shell ───────────────────────────────────────────────────────────────────
const navLinks = h("div", { class: "nav-links" });
const authArea = h("div", { class: "row gap-3" });
const bellWrap = h("div", { class: "bell-wrap" });
const outlet = h("main", { id: "outlet" });

function buildShell() {
  const nav = h("nav", { class: "nav" },
    h("div", { class: "nav-inner" },
      h("a", { class: "logo", href: "#/" }, "Byte", h("span", { class: "accent" }, "Blitz"), h("span", { class: "logo-version" }, "v1.3 [C1 BETA]")),
      navLinks,
      h("div", { class: "nav-right" },
        playerSearchBox({ onExpandedChange: (open) => nav.classList.toggle("search-open", open) }),
        bellWrap,
        authArea)));

  document.body.append(nav, outlet);

  // The home page sizes itself to the viewport minus the nav, and the nav's
  // height changes when it wraps to two rows. Publish it as a variable so the
  // CSS calc stays honest at every width.
  const publishNavHeight = () => {
    document.documentElement.style.setProperty(
      "--nav-h", Math.round(nav.getBoundingClientRect().height) + "px");
  };
  publishNavHeight();
  if (window.ResizeObserver) new ResizeObserver(publishNavHeight).observe(nav);
  else window.addEventListener("resize", publishNavHeight);
}

function paintNav() {
  clear(navLinks);
  const path = currentPath();
  NAV.forEach((n) => {
    const active = n.path === "/" ? path === "/" : path.startsWith(n.path);
    navLinks.append(h("a", { class: "navlink" + (active ? " active" : ""), href: "#" + n.path }, n.label));
  });
}

function paintAuth() {
  clear(authArea);
  const p = session.profile;

  if (!session.ready) {
    authArea.append(h("span", { class: "spinner" }));
    return;
  }

  if (!p) {
    if (session.needsEmailVerification()) {
      authArea.append(
        h("button", { class: "btn btn-sm btn-primary", onClick: () => openEmailVerificationModal(session.user) }, "Verify email"),
        h("button", { class: "icon-btn", title: "Sign out", "aria-label": "Sign out", onClick: async () => {
          await logout();
          navigate("/");
          toast("Signed out.");
        } }, icon("logout", 18)),
      );
    } else {
      authArea.append(
        h("button", { class: "btn btn-sm", onClick: () => openAuthModal({ intent: "gate", allowAnonymous: true }) }, "Sign in"));
    }
    return;
  }

  const rank = rankFor(p.rating, p);
  // `add` rather than `append`: a bare null would be inserted as the text
  // "null" next to the username.
  add(authArea,
    h("button", { class: "user-chip", title: "Your profile",
      onClick: () => navigate("/profile/" + p.uid) },
      avatar(p),
      h("span", { class: "stack", style: { alignItems: "flex-start", gap: "2px" } },
        h("span", { class: "mono", style: { fontSize: "13px", fontWeight: "700" } }, p.username),
        p.isGuest
          ? h("span", { class: "label", style: { color: "var(--primary)" } }, "Guest")
          : h("span", { class: "label tnum", style: { color: rank.color } },
              rank.placement ? "Unranked" : rank.name))),
    p.isGuest
      ? h("button", { class: "btn btn-sm", onClick: () => openAuthModal({ intent: "gate", allowAnonymous: false }) }, "Sign up")
      : null,
    h("button", { class: "icon-btn", title: "Sign out", "aria-label": "Sign out", onClick: async () => {
      await logout();
      navigate("/");
      toast("Signed out.");
    } }, icon("logout", 18)),
  );
}

// ── Notifications ───────────────────────────────────────────────────────────
let notifUnsub = null;
let challengeUnsub = null;
let notifications = [];
let dropdownOpen = false;
const seenChallenges = new Set();

function paintBell() {
  clear(bellWrap);
  const p = session.profile;
  if (!p || p.isAnonymous) return;

  const unread = notifications.filter((n) => !n.read).length;
  const btn = h("button", { class: "bell-btn", title: "Notifications", onClick: toggleDropdown },
    icon("bell", 18),
    unread ? h("span", { class: "bell-count" }, unread > 9 ? "9+" : String(unread)) : null);
  bellWrap.append(btn);

  if (dropdownOpen) bellWrap.append(buildDropdown());
}

function toggleDropdown() {
  dropdownOpen = !dropdownOpen;
  if (dropdownOpen && notifications.some((n) => !n.read)) {
    markAllRead(session.profile.uid, notifications.filter((n) => !n.read).map((n) => n.id));
  }
  paintBell();
}

document.addEventListener("mousedown", (e) => {
  if (dropdownOpen && !bellWrap.contains(e.target)) { dropdownOpen = false; paintBell(); }
});

function buildDropdown() {
  const clearAll = h("button", { class: "btn btn-sm", onClick: async () => {
    clearAll.disabled = true;
    try {
      await clearNotifications(session.profile.uid);
      notifications = [];
      paintBell();
      toast("Notifications cleared.", "ok");
    } catch (error) {
      console.error(error);
      clearAll.disabled = false;
      toast("Couldn't clear notifications.", "err");
    }
  } }, "Clear all");
  const box = h("div", { class: "dropdown" },
    h("div", { class: "panel-head" },
      h("span", { class: "label" }, "// Notifications"),
      notifications.length ? clearAll : null));

  if (!notifications.length) {
    box.append(h("div", { class: "empty", style: { border: "none" } }, "Nothing yet."));
    return box;
  }

  notifications.forEach((n) => {
    const row = h("div", { style: { padding: "12px 15px", borderTop: "1px solid var(--border)" } });
    row.append(h("div", { class: "between gap-3" },
      h("p", { class: "mono", style: { fontSize: "11.5px", margin: "0", lineHeight: "1.5" } },
        h("span", { class: "accent" }, n.fromUsername ?? ""), " ",
        (n.text ?? "").replace(n.fromUsername ?? "", "").trim()),
      h("span", { class: "label", style: { fontSize: "9px", whiteSpace: "nowrap" } }, fmtAgo(n.createdAt))));

    if (n.type === "friend_request") {
      row.append(h("div", { class: "row gap-2 mt-3" },
        h("button", { class: "btn btn-sm btn-primary", onClick: async () => {
          try {
            await acceptFriendRequest(session.profile, n.fromUid, n.fromUsername);
            await deleteNotification(session.profile.uid, n.id);
            toast("Friend added.", "ok");
          } catch (e) { console.error(e); toast("Couldn't accept that request.", "err"); }
        } }, "Accept"),
        h("button", { class: "btn btn-sm", onClick: async () => {
          await declineFriendRequest(session.profile.uid, n.fromUid);
          await deleteNotification(session.profile.uid, n.id);
        } }, "Decline")));
    } else if (n.type === "challenge" && n.challengeId) {
      row.append(h("div", { class: "row gap-2 mt-3" },
        h("button", { class: "btn btn-sm btn-primary", onClick: async () => {
          dropdownOpen = false; paintBell();
          await deleteNotification(session.profile.uid, n.id);
          acceptChallenge(n.challengeId);
        } }, "Accept duel"),
        h("button", { class: "btn btn-sm", onClick: async () => {
          await declineChallenge(n.challengeId);
          await deleteNotification(session.profile.uid, n.id);
        } }, "Decline")));
    } else if (n.type === "message" && n.fromUid) {
      row.append(h("div", { class: "row gap-2 mt-3" },
        h("button", { class: "btn btn-sm", onClick: () => {
          dropdownOpen = false; paintBell();
          navigate("/messages/" + n.fromUid);
        } }, "Open chat")));
    }

    box.append(row);
  });

  return box;
}

// A live challenge deserves more than a bell badge — it interrupts.
function popChallenge(c) {
  if (seenChallenges.has(c.id) || arenaIsOpen()) return;
  seenChallenges.add(c.id);

  const m = modal(h("div", { class: "center" },
    h("div", { class: "eyebrow mb-3" }, "// Incoming challenge"),
    h("h2", { class: "head mb-3" }, h("span", { class: "accent" }, c.fromUsername), " wants to duel"),
    h("p", { class: "mono mb-6", style: { fontSize: "12px", color: "var(--muted-fg)", lineHeight: "1.6" } },
      c.mode === "rated"
        ? "A rated Burst duel. The result changes Ranked ELO for both players."
        : "A casual Burst duel. Same arena rules, with no ELO at stake."),
    h("div", { class: "row gap-3", style: { justifyContent: "center" } },
      h("button", { class: "btn btn-primary", onClick: () => { m.close(); acceptChallenge(c.id); } }, c.mode === "rated" ? "Accept rated ▸" : "Accept casual ▸"),
      h("button", { class: "btn", onClick: () => { m.close(); declineChallenge(c.id); } }, "Decline")),
  ), { closable: false });
}

function wireUserStreams() {
  notifUnsub?.(); notifUnsub = null;
  challengeUnsub?.(); challengeUnsub = null;
  notifications = [];

  const p = session.profile;
  if (!p || p.isAnonymous) { paintBell(); return; }

  notifUnsub = watchNotifications(p.uid, (list) => {
    notifications = list;
    paintBell();
  });

  challengeUnsub = watchIncomingChallenges(p.uid, (list) => {
    list.forEach((c) => {
      // Only interrupt for challenges raised since this tab loaded.
      if (Date.now() - (c.createdAt ?? 0) < 120000) popChallenge(c);
    });
  });
}

// ── Routes ──────────────────────────────────────────────────────────────────
route("/", renderHome);
route("/training", renderTraining);
route("/leaderboard", renderLeaderboard);
route("/messages", renderMessages);
route("/messages/:uid", renderMessages);
route("/profile/:uid", renderProfile);
route("/share/:id", renderPublicSolution);
route("/changelog", renderChangelog);
route("/duel/:id", async (params, root) => {
  root.append(h("div", { class: "wrap", style: { paddingTop: "60px" } },
    h("div", { class: "empty" }, "Loading match…")));
  if (!session.profile) { await requireAccount("play"); }
  if (session.profile) enterDuel(params.id);
});

// ── Boot ────────────────────────────────────────────────────────────────────
let lastUid = undefined;
let onboardingPendingFor = null;

(async function boot() {
  buildShell();
  paintNav();
  paintAuth();

  window.addEventListener("hashchange", paintNav);

  onSession(() => {
    paintAuth();
    const profile = session.profile;
    const uid = profile?.uid ?? null;
    if (uid !== lastUid) {
      lastUid = uid;
      wireUserStreams();
    }
    // Resetting progress clears skillLevel on the same profile UID. Track the
    // pending modal separately from the UID so that transition opens onboarding
    // again, without stacking duplicate modals during profile snapshots.
    if (profile?.uid && !profile.skillLevel && onboardingPendingFor !== profile.uid) {
      onboardingPendingFor = profile.uid;
      maybeOnboard();
    } else if (profile?.skillLevel) {
      onboardingPendingFor = null;
    }
  });

  await startSession();
  startRouter(outlet);

  // Surface unexpected failures instead of leaving a dead page.
  window.addEventListener("unhandledrejection", (e) => {
    const msg = String(e.reason?.message ?? e.reason ?? "");
    if (/permission|insufficient/i.test(msg)) {
      toast("Firestore denied that request — check the deployed rules.", "err", 6000);
    }
    console.error("unhandled", e.reason);
  });
})();
