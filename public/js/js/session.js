// ============================================================================
// Session — who is signed in, their profile, and the sign-in modal.
//
// Guest play is a first-class path and deliberately offline: pressing "Play as
// a guest" creates a profile in localStorage and touches no Firebase service —
// no anonymous auth, no Firestore. A guest gets a real unranked rating and real
// puzzle discovery on that device, but no ladder, no friends and no ranked.
// ============================================================================

import {
  auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged,
  sendPasswordResetEmail, updateProfile,
} from "./firebase.js";
import { ensureProfile, watchProfile, NAME_RE, usernameAvailable, setPresence } from "./store.js";
import { loadGuest, startGuest } from "./local.js";
import { h, modal, toast, icon } from "./ui.js";

export const session = {
  user: null,        // Firebase user, or null for guests and signed-out visitors
  profile: null,     // Firestore profile doc, or the local guest profile
  ready: false,
  isGuest: () => !!session.profile?.isGuest,
};

const listeners = new Set();
let profileUnsub = null;
let presenceInterval = null;
let unloadHandler = null;
let authEpoch = 0;

function stopRealtimeSession() {
  profileUnsub?.();
  profileUnsub = null;
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
  if (unloadHandler) {
    window.removeEventListener("beforeunload", unloadHandler);
    unloadHandler = null;
  }
}

export function onSession(fn) {
  listeners.add(fn);
  if (session.ready) fn(session);
  return () => listeners.delete(fn);
}

function emit() { listeners.forEach((fn) => fn(session)); }

/** Re-read the guest profile from storage after a local write. */
export function refreshGuest() {
  if (!session.profile?.isGuest) return;
  const g = loadGuest();
  if (g) { session.profile = g; emit(); }
}

/** Begin (or resume) a local guest session. Makes no network calls. */
export function beginGuest() {
  session.user = null;
  session.profile = startGuest();
  session.ready = true;
  emit();
  return session.profile;
}

export function startSession() {
  return new Promise((resolve) => {
    let first = true;
    onAuthStateChanged(auth, async (user) => {
      const epoch = ++authEpoch;
      stopRealtimeSession();

      session.user = user;
      session.profile = null;

      if (user) {
        try {
          const profile = await ensureProfile(user);
          // Authentication can change while the profile read is in flight. Do
          // not let that stale task re-attach a listener for a former user.
          if (epoch !== authEpoch || auth.currentUser?.uid !== user.uid) return;

          session.profile = profile;
          profileUnsub = watchProfile(user.uid, (p) => {
            if (epoch !== authEpoch) return;
            session.profile = p;
            emit();
          });

          // Presence heartbeat: best-effort online indicator. Update immediately
          // and then every 25s while the tab is active.
          try { setPresence(user.uid, { online: true, inMatch: false }); } catch {}
          presenceInterval = setInterval(() => { try { setPresence(user.uid, { online: true }); } catch {} }, 25000);

          // Attempt to mark offline on unload — best-effort only.
          unloadHandler = () => { try { setPresence(user.uid, { online: false }); } catch {}; };
          window.addEventListener("beforeunload", unloadHandler);

        } catch (e) {
          if (epoch !== authEpoch) return;
          console.error("profile load failed", e);
          toast("Could not load your profile — check your connection.", "err");
        }
      } else if (first) {
        // On boot only: this device may already have a guest mid-run. Later
        // sign-outs must land you signed out, not silently back in an old
        // guest session you'd forgotten about.
        session.profile = loadGuest();
      }

      session.ready = true;
      emit();
      if (first) { first = false; resolve(session); }
    });
  });
}

export async function logout() {
  const uid = session.profile?.uid;
  const wasGuest = session.profile?.isGuest;
  ++authEpoch;
  stopRealtimeSession();
  session.profile = null;
  if (wasGuest) {
    // Leave the saved guest alone — signing out of a guest session should not
    // silently destroy that device's unranked rating and discovered puzzles.
    session.ready = true;
    emit();
    return;
  }
  try { if (uid) await setPresence(uid, { online: false }); } catch {}
  await signOut(auth);
}

// ── Sign-in modal ───────────────────────────────────────────────────────────
// `intent` shapes the copy: "play" when the player pressed Play without an
// account, "gate" when they tried to reach a feature that needs one.
export function openAuthModal(opts = {}) {
  const { intent = "gate", allowAnonymous = true, onDone } = opts;

  let mode = "signin"; // signin | signup
  let busy = false;

  const err = h("p", { class: "mono mt-3", style: { fontSize: "11.5px", color: "var(--primary)", display: "none" } });
  const email = h("input", { class: "input", type: "email", placeholder: "Email", autocomplete: "email" });
  const pass = h("input", { class: "input", type: "password", placeholder: "Password", autocomplete: "current-password" });
  const uname = h("input", { class: "input", type: "text", placeholder: "Username (3–16 chars)", autocomplete: "username" });
  const unameRow = h("div", { style: { display: "none" } }, uname);

  const title = h("h2", { class: "head" }, "Sign in");
  const eyebrow = h("div", { class: "eyebrow mb-2" },
    intent === "play" ? "// Ready to play" : "// Account required");
  const blurb = h("p", { class: "mono mb-6", style: { fontSize: "13px", lineHeight: "1.65", color: "var(--muted-fg)" } },
    intent === "play"
      ? "Sign in to play ranked, climb the leaderboard, and keep your rating."
      : "This part of the arena needs an account.");

  const submitBtn = h("button", { class: "btn btn-primary btn-block btn-lg", type: "submit" }, "Sign in");
  const googleBtn = h("button", { class: "btn btn-block", type: "button", onClick: doGoogle },
    icon("google", 15), "Continue with Google");

  const toggle = h("button", { class: "linkish", type: "button", onClick: flip }, "Create an account");
  const forgot = h("button", { class: "linkish", type: "button", onClick: doReset }, "Forgot password?");

  const anonLine = allowAnonymous
    ? h("div", { class: "guest-strip mt-6" },
        h("button", { class: "btn btn-block btn-guest", type: "button", onClick: doGuest },
          "Play as a guest ▸"),
        h("p", { class: "mono mt-3", style: { fontSize: "11.5px", color: "var(--muted-fg)", lineHeight: "1.65", textAlign: "center" } },
          "Unranked and Training Grounds, no account needed. Your rating and best times are saved on this device only."))
    : null;

  const form = h("form", { onSubmit: onSubmit },
    h("div", { class: "stack gap-3" }, unameRow, email, pass),
    err,
    h("div", { class: "mt-5 stack gap-3" }, submitBtn, googleBtn),
    h("div", { class: "between mt-4" }, toggle, forgot),
  );

  const content = h("div", {}, eyebrow, title, h("div", { class: "mt-2" }), blurb, form, anonLine);
  const m = modal(content, { onClose: () => onDone?.(null) });

  function fail(msg) {
    err.textContent = msg;
    err.style.display = "block";
  }

  function setBusy(v) {
    busy = v;
    submitBtn.disabled = v;
    googleBtn.disabled = v;
    submitBtn.textContent = v ? "Working…" : (mode === "signin" ? "Sign in" : "Create account");
  }

  function flip() {
    mode = mode === "signin" ? "signup" : "signin";
    err.style.display = "none";
    title.textContent = mode === "signin" ? "Sign in" : "Create account";
    submitBtn.textContent = mode === "signin" ? "Sign in" : "Create account";
    toggle.textContent = mode === "signin" ? "Create an account" : "I already have an account";
    unameRow.style.display = mode === "signup" ? "block" : "none";
    forgot.style.display = mode === "signin" ? "inline" : "none";
    pass.setAttribute("autocomplete", mode === "signin" ? "current-password" : "new-password");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    err.style.display = "none";

    const em = email.value.trim();
    const pw = pass.value;
    if (!em || !pw) return fail("Email and password are required.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const name = uname.value.trim();
        if (!NAME_RE.test(name)) throw new Error("Username must be 3–16 characters: letters, numbers, underscore.");
        if (!(await usernameAvailable(name))) throw new Error("That username is taken.");
        const cred = await createUserWithEmailAndPassword(auth, em, pw);
        try { await updateProfile(cred.user, { displayName: name }); } catch {}
        await ensureProfile(cred.user, name);
      } else {
        await signInWithEmailAndPassword(auth, em, pw);
      }
      m.close();
      onDone?.(auth.currentUser);
    } catch (e2) {
      setBusy(false);
      fail(authMessage(e2));
    }
  }

  async function doGoogle() {
    if (busy) return;
    err.style.display = "none";
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureProfile(cred.user);
      m.close();
      onDone?.(auth.currentUser);
    } catch (e2) {
      setBusy(false);
      fail(authMessage(e2));
    }
  }

  // Guest play is entirely local — nothing here can fail on the network, and
  // nothing here depends on a Firebase provider being enabled in the console.
  function doGuest() {
    if (busy) return;
    const p = beginGuest();
    m.close();
    onDone?.({ uid: p.uid, isGuest: true });
  }

  async function doReset() {
    const em = email.value.trim();
    if (!em) return fail("Enter your email first, then press Forgot password.");
    try {
      await sendPasswordResetEmail(auth, em);
      toast("Password reset email sent.", "ok");
    } catch (e2) {
      fail(authMessage(e2));
    }
  }

  return m;
}

function authMessage(e) {
  const code = e?.code ?? "";
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-not-found": "No account with that email.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/email-already-in-use": "An account already exists with that email.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/popup-closed-by-user": "Sign-in window closed.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup.",
    "auth/too-many-requests": "Too many attempts — wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/operation-not-allowed":
      "That sign-in method isn't enabled for this project yet.",
  };
  return map[code] ?? (e?.message ?? "Something went wrong.").replace(/^Firebase:\s*/, "");
}

/**
 * Gate a feature behind a real account. Resolves to the signed-in user, or null
 * if the player dismissed the modal. Guests count as "not signed in" for ranked
 * and every social feature.
 */
export function requireAccount(intent = "gate") {
  return new Promise((resolve) => {
    if (session.user && !session.user.isAnonymous) return resolve(session.user);
    openAuthModal({
      intent,
      allowAnonymous: false,
      onDone: (u) => resolve(u && !u.isAnonymous && !u.isGuest ? u : null),
    });
  });
}

/** Any player at all, guests included. Used by unranked and training. */
export function requireAnySession(intent = "play") {
  return new Promise((resolve) => {
    if (session.profile) return resolve(session.profile);
    openAuthModal({ intent, allowAnonymous: true, onDone: resolve });
  });
}
