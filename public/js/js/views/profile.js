// ============================================================================
// Player profile — both rating tracks, the full record, and the actions you can
// take on someone: friend them, message them, challenge them.
//
// This is also where your own record lives; the main page stays about playing.
// ============================================================================

import { h, add, clear, emptyState, toast, fmtTime, icon, avatar, modal } from "../ui.js";
import { session, requireAccount, openAuthModal, refreshGuest } from "../session.js";
import {
  rankFor, nextTier, tierProgress, displayRating, isProvisional,
  placementLeft, PLACEMENT_GAMES, TIERS,
} from "../glicko.js";
import {
  getProfile, getFriends, sendFriendRequest, getSentRequests, removeFriend,
  ensureConversation, rankedPosition, renameUser, saveCountry, NAME_RE, seenMap, watchPresence,
} from "../store.js";
import { countryFor, countryOptions } from "../countries.js";
import { challengeFriend } from "../game.js";
import { openAvatarPicker } from "../onboarding.js";
import { navigate } from "../router.js";

export async function renderProfile(params, root) {
  const unsubs = [];
  const page = h("div", { class: "wrap", style: { paddingTop: "32px", paddingBottom: "72px" } });
  root.append(page);
  page.append(h("div", { class: "empty" }, "Loading profile…"));

  const uid = params.uid;
  const me = session.profile;
  const isMe = me?.uid === uid;

  // A guest's profile only exists on this device — never ask Firestore for it.
  let p = null;
  if (isMe && me?.isGuest) p = me;
  else if (String(uid).startsWith("local:")) p = null;
  else {
    try { p = await getProfile(uid); }
    catch (e) { console.error(e); }
  }

  clear(page);
  if (!p) {
    page.append(emptyState("That player doesn't exist."),
      h("button", { class: "btn mt-4", onClick: () => navigate("/") }, "Back to the arena"));
    return;
  }

  const rank = rankFor(p.rating, p.gamesPlayed);
  const placed = placementLeft(p.gamesPlayed) === 0;
  const nxt = nextTier(p.rating);
  const prog = tierProgress(p.rating);

  const w = p.wins ?? 0, l = p.losses ?? 0, d = p.draws ?? 0;
  const total = w + l + d;
  const wr = total ? Math.round((w / total) * 100) + "%" : "—";

  // ── Relationship actions ─────────────────────────────────────────────────
  const actions = h("div", { class: "row gap-2 wrapflex mt-5" });
  await paintActions();

  async function paintActions() {
    clear(actions);

    if (isMe) {
      actions.append(
        h("button", { class: "btn", onClick: openRename },
          icon("pencil", 13), "Change username"),
        h("button", { class: "btn", onClick: () => openAvatarPicker(p, (patch) => {
          Object.assign(p, patch);
          navigate("/profile/" + p.uid);
        }) }, icon("user", 13), "Profile picture"),
        h("button", { class: "btn", onClick: openCountry }, "Country"));
      if (p.isGuest) {
        actions.append(
          h("span", { class: "pill pill-accent" }, "Guest — this device only"),
          h("button", { class: "btn btn-primary", onClick: () => openAuthModal({ intent: "gate", allowAnonymous: false }) },
            "Create an account"));
      }
      return;
    }

    if (!me || me.isAnonymous) {
      actions.append(h("button", { class: "btn btn-primary", onClick: async () => {
        if (await requireAccount("gate")) navigate("/profile/" + uid);
      } }, icon("userPlus", 13), "Sign in to add friend"));
      return;
    }

    let friends = [], sent = [];
    try { [friends, sent] = await Promise.all([getFriends(me.uid), getSentRequests(me.uid)]); } catch {}
    const isFriend = friends.some((f) => f.uid === uid);
    const isPending = sent.includes(uid);

    if (isFriend) {
      actions.append(
        h("button", { class: "btn btn-primary", onClick: async () => {
          try { await ensureConversation(me, p); navigate("/messages/" + uid); }
          catch { toast("Couldn't open that conversation.", "err"); }
        } }, icon("message", 13), "Message"),
        h("button", { class: "btn", onClick: () => challengeFriend({ uid, username: p.username }) },
          icon("swords", 13), "Challenge"),
        h("button", { class: "btn", onClick: async () => {
          try { await removeFriend(me.uid, uid); toast("Friend removed."); paintActions(); }
          catch { toast("Couldn't remove that friend.", "err"); }
        } }, "Remove friend"),
      );
    } else if (isPending) {
      actions.append(
        h("span", { class: "pill pill-warn" }, "Friend request pending"),
        h("p", { class: "label", style: { textTransform: "none", letterSpacing: "0" } },
          "They'll see it in their notifications."));
    } else {
      actions.append(h("button", { class: "btn btn-primary", onClick: async (e) => {
        e.currentTarget.disabled = true;
        try {
          await sendFriendRequest(me, { uid, username: p.username });
          toast("Friend request sent.", "ok");
          paintActions();
        } catch { toast("Couldn't send that request.", "err"); paintActions(); }
      } }, icon("userPlus", 13), "Add friend"));
    }
  }

  // ── Hero ─────────────────────────────────────────────────────────────────
  add(page,
    h("div", { class: "profile-hero" },
      h("div", { style: { minWidth: "0" } },
        h("div", { class: "row gap-4" },
          avatarBlock(),
          h("div", {},
            h("div", { class: "eyebrow mb-2" }, isMe ? "// You" : "// Player"),
            h("h1", { class: "head" }, p.username),
            h("p", { class: "mono mt-2", style: { fontSize: "12.5px", color: "var(--muted)" } },
              p.isGuest
                ? "Guest profile — saved on this device"
                : "Joined " + (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—")),
            h("p", { class: "mono mt-1", style: { fontSize: "11.5px", color: "var(--muted-fg)" } },
              `${countryFor(p.country).flag} ${countryFor(p.country).name}`))),
        actions),

      h("div", { class: "rating-block" },
        h("div", { class: "eyebrow mb-2" }, "// Ranked"),
        h("div", { class: "head", style: { fontSize: "clamp(1.6rem,3.4vw,2.3rem)", color: rank.color } },
          rank.name),
        h("div", { class: "rating-num mt-2", style: { color: rank.color } },
          (p.gamesPlayed ?? 0) > 0 ? displayRating(p.rating, p.rd) : "—"),
        !placed
          ? h("p", { class: "mono mt-3", style: { fontSize: "11.5px", color: "var(--muted-fg)", lineHeight: "1.6", maxWidth: "220px", marginLeft: "auto" } },
              (p.gamesPlayed ?? 0) === 0
                ? `No ranked matches yet — ${PLACEMENT_GAMES} are needed for a rank.`
                : `${placementLeft(p.gamesPlayed)} more ranked ${placementLeft(p.gamesPlayed) === 1 ? "match" : "matches"} for a rank.`)
          : nxt
            ? h("div", { class: "mt-4", style: { marginLeft: "auto", maxWidth: "210px" } },
                h("div", { class: "between mb-2" },
                  h("span", { class: "label", style: { color: rank.color } }, rank.name),
                  h("span", { class: "label", style: { color: nxt.color } }, nxt.name)),
                h("div", { class: "bar" }, h("i", { style: { width: prog + "%", background: rank.color } })),
                h("div", { class: "label mt-2" }, prog + "% to " + nxt.name))
            : null,
        isProvisional(p.rd) && (p.gamesPlayed ?? 0) > 0
          ? h("p", { class: "mono mt-3", style: { fontSize: "11px", color: "var(--muted)" } }, "Provisional (?)")
          : null),
    ),

    // ── Record ─────────────────────────────────────────────────────────────
    h("div", { class: "mt-6" },
      h("div", { class: "section-title" }, isMe ? "// Your record" : "// Ranked record"),
      h("div", { class: "stats" },
        stat(String(w), "Wins", "var(--ok)"),
        stat(String(l), "Losses", "var(--primary)"),
        stat(String(d), "Draws"),
        stat(wr, "Win rate"))),

    h("div", { class: "mt-4" },
      h("div", { class: "stats" },
        stat(String(p.gamesPlayed ?? 0), "Ranked matches"),
        stat(String(p.streak ?? 0), "Current streak"),
        stat(String(p.bestStreak ?? 0), "Best streak"),
        rankHost())),

    // ── Unranked ───────────────────────────────────────────────────────────
    h("div", { class: "mt-8" },
      h("div", { class: "section-title" }, "// Unranked"),
      h("div", { class: "stats" },
        stat(displayRating(p.soloRating, p.soloRd), "Unranked ELO", "var(--primary)"),
        stat(String(p.soloRuns ?? 0), "Runs"),
        stat(String(p.soloSolved ?? 0), "Solved"),
        stat(String(p.puzzlesSolved ?? 0), "Puzzles cleared"))),

    bestTimesPanel(p),
    discoveryPanel(p),
  );

  // Your own avatar is a button that opens the picker; everyone else's is just
  // a picture.
  function avatarBlock() {
    let presence = { online: false, inMatch: false };
    const host = isMe ? h("button", {
      class: "avatar-editable", title: "Change your profile picture",
      "aria-label": "Change your profile picture",
      onClick: () => openAvatarPicker(p, (patch) => {
        Object.assign(p, patch);
        paintAvatar();
      }),
    }) : h("span");

    function paintAvatar() {
      clear(host).append(
        avatar({ ...p, online: !!presence.online, inMatch: !!presence.inMatch }, "lg"),
        isMe ? h("span", { class: "edit-dot" }, icon("pencil", 12)) : null);
    }

    paintAvatar();
    try {
      const unsub = watchPresence(p.uid, (data) => {
        presence = data || { online: false, inMatch: false };
        paintAvatar();
      });
      unsubs.push(() => unsub?.());
    } catch {}
    return host;
  }

  // Ranked board position, filled in once it loads.
  function rankHost() {
    const cell = h("div", { class: "stat" },
      h("div", { class: "v" }, "—"),
      h("div", { class: "k" }, "Board position"));
    if (!p.isGuest && placed) {
      rankedPosition(uid).then((n) => {
        if (n) cell.querySelector(".v").textContent = "#" + n;
      }).catch(() => {});
    }
    return cell;
  }

  function stat(v, k, color) {
    return h("div", { class: "stat" },
      h("div", { class: "v", style: color ? { color } : {} }, v),
      h("div", { class: "k" }, k));
  }

  function bestTimesPanel(prof) {
    const best = prof.soloBest || {};
    const rows = TIERS.filter((t) => best[t.name] != null);
    if (!rows.length) return null;
    return h("div", { class: "mt-8" },
      h("div", { class: "section-title" }, "// Best unranked times"),
      h("div", { class: "panel divide" },
        ...rows.map((t) => h("div", { class: "list-row" },
          h("span", { class: "tier-badge", style: { color: t.color } }, t.name),
          h("span", { class: "mono tnum", style: { fontSize: "15px", fontWeight: "700" } }, fmtTime(best[t.name]))))));
  }

  function discoveryPanel(prof) {
    if (!isMe) return null;
    const found = Object.keys(seenMap(prof)).length;
    return h("div", { class: "mt-8" },
      h("div", { class: "section-title" }, "// Training Grounds"),
      h("div", { class: "panel" },
        h("div", { class: "list-row" },
          h("div", { class: "row gap-3" },
            h("span", { style: { color: "var(--primary)", display: "flex" } }, icon("compass", 18)),
            h("div", {},
              h("div", { class: "mono", style: { fontSize: "14px" } },
                found === 0 ? "No puzzles discovered yet" : `${found} ${found === 1 ? "puzzle" : "puzzles"} discovered`),
              h("div", { class: "label mt-1", style: { textTransform: "none", letterSpacing: "0" } },
                "Puzzles are revealed by meeting them in Unranked or Ranked."))),
          h("button", { class: "btn btn-sm", onClick: () => navigate("/training") }, "Open"))));
  }

  function openCountry() {
    const select = h("select", { class: "input" },
      ...countryOptions(p.country).map((item) => h("option", { value: item.value, selected: item.selected }, item.label)));
    const save = h("button", { class: "btn btn-primary grow", onClick: async () => {
      save.disabled = true;
      try {
        const patch = await saveCountry(p, select.value);
        Object.assign(p, patch);
        refreshGuest();
        m.close();
        toast("Country updated.", "ok");
        navigate("/profile/" + p.uid);
      } catch (error) {
        console.error(error);
        save.disabled = false;
        toast("Couldn't update your country.", "err");
      }
    } }, "Save");
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Profile"),
      h("h2", { class: "head mb-3" }, "Choose your country"),
      h("p", { class: "body-text mb-5" }, "Your flag and country appear on the leaderboard. It is only used for this profile display."),
      select,
      h("div", { class: "row gap-2 mt-5" }, save,
        h("button", { class: "btn grow", onClick: () => m.close() }, "Cancel"))));
  }

  function openRename() {
    const input = h("input", { class: "input", value: p.username, maxlength: "16" });
    const err = h("p", { class: "mono mt-3", style: { fontSize: "12px", color: "var(--primary)", display: "none" } });
    const save = h("button", { class: "btn btn-primary grow", onClick: async () => {
      const v = input.value.trim();
      if (!NAME_RE.test(v)) {
        err.textContent = "3–16 characters: letters, numbers, underscore.";
        err.style.display = "block";
        return;
      }
      save.disabled = true;
      try {
        await renameUser(p.uid, p.username, v);
        refreshGuest();   // no-op for real accounts, which watchProfile covers
        m.close();
        toast("Username updated.", "ok");
        navigate("/profile/" + p.uid);
      } catch (e) {
        err.textContent = e.message;
        err.style.display = "block";
        save.disabled = false;
      }
    } }, "Save");

    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Profile"),
      h("h2", { class: "head mb-5" }, "Change username"),
      input, err,
      h("div", { class: "row gap-2 mt-5" }, save,
        h("button", { class: "btn grow", onClick: () => m.close() }, "Cancel"))));
  }

  return () => unsubs.forEach((unsub) => { try { unsub(); } catch {} });
}
