// ============================================================================
// Player profile — both rating tracks, the full record, and the actions you can
// take on someone: friend them, message them, challenge them.
//
// This is also where your own record lives; the main page stays about playing.
// ============================================================================

import { h, add, clear, emptyState, toast, fmtTime, icon, avatar, modal, confirmModal, fmtAgo } from "../ui.js";
import { session, requireAccount, openAuthModal, refreshGuest, markVoluntaryAccountDeletion } from "../session.js";
import {
  auth, googleProvider, deleteUser, EmailAuthProvider,
  reauthenticateWithCredential, reauthenticateWithPopup,
} from "../firebase.js";
import {
  rankFor, nextTier, tierProgress, displayPlacementRating,
  placementLeft, placementGamesPlayed, placementConfidence, isPlaced, PLACEMENT_GAMES, TIERS,
} from "../glicko.js";
import {
  getProfile, getFriends, sendFriendRequest, getSentRequests, removeFriend,
  ensureConversation, rankedPosition, renameUser, saveCountry, NAME_RE, seenMap, watchPresence,
  deleteAccountData, resetAccountProgress, getMatchHistory, saveProfilePresentation, countPuzzleRecords,
} from "../store.js";
import { countryFor, countryOptions } from "../countries.js";
import { challengeFriend } from "../game.js";
import { openAvatarPicker } from "../onboarding.js";
import { navigate } from "../router.js";

const SVG_NS = "http://www.w3.org/2000/svg";
function svgNode(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

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

  const rank = rankFor(p.rating, p);
  const placed = isPlaced(p);
  const nxt = nextTier(p.rating);
  const prog = tierProgress(p.rating);

  const w = p.wins ?? 0, l = p.losses ?? 0, d = p.draws ?? 0;
  const total = w + l + d;
  const wr = total ? Math.round((w / total) * 100) + "%" : "—";
  const unrankedRank = rankFor(p.soloRating ?? p.rating, p);
  const unrankedRuns = p.soloRuns ?? 0;
  const unrankedSolved = p.soloSolved ?? 0;
  const unrankedWr = unrankedRuns ? Math.round((unrankedSolved / unrankedRuns) * 100) + "%" : "—";
  const unrankedBest = Math.min(...Object.values(p.soloBest || {}).filter(Number.isFinite));
  const joined = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—";

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
        h("button", { class: "btn", onClick: openCountry }, "Country"),
        h("button", { class: "btn", onClick: openProfileSettings }, "Profile settings"));
      if (!p.isGuest) {
        actions.append(
          h("button", { class: "btn", onClick: openResetProgress }, "Reset progress"),
          h("button", { class: "btn btn-danger", onClick: openDeleteAccount }, "Delete account"));
      }
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

  async function openResetProgress() {
    const ok = await confirmModal(
      "Reset account progress",
      "This resets both ELO tracks, placement, match history, Training Grounds discovery, puzzle times, streaks, and play statistics. Your account, username, avatar, friends, and messages remain. This cannot be undone.",
      "Reset progress"
    );
    if (!ok) return;
    try {
      const patch = await resetAccountProgress(p);
      Object.assign(p, patch);
      toast("Progress reset. Your account and friends were kept.", "ok");
      navigate("/profile/" + p.uid);
    } catch (error) {
      console.error("progress reset failed", error);
      toast("Couldn't reset progress. Please try again.", "err");
    }
  }

  async function reauthenticateForDeletion(password) {
    const user = auth.currentUser;
    if (!user) throw new Error("Your sign-in session has expired. Sign in again and retry.");
    const providers = new Set(user.providerData.map((entry) => entry.providerId));
    if (providers.has("password")) {
      if (!password) throw new Error("Enter your password to confirm deletion.");
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return;
    }
    if (providers.has("google.com")) {
      await reauthenticateWithPopup(user, googleProvider);
      return;
    }
    throw new Error("Reauthenticate with your sign-in provider, then retry account deletion.");
  }

  function openDeleteAccount() {
    const usesPassword = !!auth.currentUser?.providerData?.some((entry) => entry.providerId === "password");
    const typed = h("input", { class: "input", type: "text", placeholder: "Type DELETE to confirm", autocomplete: "off" });
    const password = usesPassword
      ? h("input", { class: "input mt-3", type: "password", placeholder: "Current password", autocomplete: "current-password" })
      : null;
    const error = h("p", { class: "mono mt-3", style: { display: "none", fontSize: "11.5px", color: "var(--primary)", lineHeight: "1.55" } });
    let busy = false;

    const confirm = h("button", { class: "btn btn-danger grow", onClick: destroy }, "Permanently delete");
    const cancel = h("button", { class: "btn grow", onClick: () => m.close() }, "Cancel");
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2", style: { color: "var(--primary)" } }, "// Permanent action"),
      h("h2", { class: "head mb-3" }, "Delete your account?"),
      h("p", { class: "body-text mb-4" },
        "This permanently removes your profile, leaderboard entries, Unranked and Ranked records, training puzzle times, friend references, pending requests, challenges, messages, notifications, and presence. This cannot be undone."),
      h("label", { class: "label mb-2", style: { display: "block" } }, "// Confirm deletion"),
      typed,
      password,
      usesPassword
        ? h("p", { class: "label mt-3", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.55" } }, "Your password is used only to confirm this session.")
        : h("p", { class: "label mt-3", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.55" } }, "You will confirm this action with Google before data is removed."),
      error,
      h("div", { class: "row gap-3 mt-5" }, confirm, cancel),
    ), { wide: true });

    async function destroy() {
      if (busy) return;
      if (typed.value.trim() !== "DELETE") {
        error.textContent = 'Type DELETE exactly to confirm.';
        error.style.display = "block";
        typed.focus();
        return;
      }
      busy = true;
      confirm.disabled = true;
      cancel.disabled = true;
      error.style.display = "none";
      try {
        await reauthenticateForDeletion(password?.value || "");
        markVoluntaryAccountDeletion(auth.currentUser?.uid);
        await deleteAccountData(p);
        await deleteUser(auth.currentUser);
        m.close();
        toast("Your account and associated data have been permanently deleted.", "ok");
        navigate("/");
      } catch (err) {
        markVoluntaryAccountDeletion(null);
        console.error("account deletion failed", err);
        error.textContent = err?.message || "Account deletion could not be completed. Please try again.";
        error.style.display = "block";
        confirm.disabled = false;
        cancel.disabled = false;
        busy = false;
      }
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
              p.isGuest ? "Guest profile — saved on this device" : `Joined ${joined}${p.emailVisible && p.publicEmail ? ` · ${p.publicEmail}` : ""}`),
            p.bio ? h("p", { class: "profile-bio mt-3" }, p.bio) : null,
            h("p", { class: "mono mt-2", style: { fontSize: "11.5px", color: "var(--muted-fg)" } },
              `${countryFor(p.country).flag} ${countryFor(p.country).name}`))),
        actions),

      h("div", { class: "rating-block" },
        h("div", { class: "eyebrow mb-2" }, "// Ranked"),
        h("div", { class: "head", style: { fontSize: "clamp(1.6rem,3.4vw,2.3rem)", color: rank.color } },
          rank.name),
        h("div", { class: "rating-num mt-2", style: { color: rank.color } },
          displayPlacementRating(p.rating, p.rd, p)),
        !placed
          ? h("p", { class: "mono mt-3", style: { fontSize: "11.5px", color: "var(--muted-fg)", lineHeight: "1.6", maxWidth: "220px", marginLeft: "auto" } },
              `${placementLeft(p)} Unranked placement ${placementLeft(p) === 1 ? "game" : "games"} remaining — ${placementGamesPlayed(p)}/${PLACEMENT_GAMES} complete, Confidence ${placementConfidence(p)}/10.`)
          : nxt
            ? h("div", { class: "mt-4", style: { marginLeft: "auto", maxWidth: "210px" } },
                h("div", { class: "between mb-2" },
                  h("span", { class: "label", style: { color: rank.color } }, rank.name),
                  h("span", { class: "label", style: { color: nxt.color } }, nxt.name)),
                h("div", { class: "bar" }, h("i", { style: { width: prog + "%", background: rank.color } })),
                h("div", { class: "label mt-2" }, prog + "% to " + nxt.name))
            : null,
        !placed
          ? h("p", { class: "mono mt-3", style: { fontSize: "11px", color: "var(--muted)" } }, "Provisional (?) — ranked unlocks when placement completes.")
          : null),
    ),

    h("div", { class: "profile-track-grid mt-6" },
      trackCard("Ranked", rank, displayPlacementRating(p.rating, p.rd, p), [
        stat(`${w}-${l}-${d}`, "Record"),
        stat(wr, "Win rate"),
        stat(p.rankedBestTime ? fmtTime(p.rankedBestTime) : "—", "Best solve"),
        rankHost(),
      ]),
      trackCard("Unranked", unrankedRank, displayPlacementRating(p.soloRating, p.soloRd, p), [
        stat(`${unrankedSolved}/${unrankedRuns}`, "Clears / runs"),
        stat(unrankedWr, "Win rate"),
        stat(Number.isFinite(unrankedBest) ? fmtTime(unrankedBest) : "—", "Best time"),
        stat(`${placementGamesPlayed(p)}/${PLACEMENT_GAMES}`, "Placement"),
      ])),

    h("div", { class: "profile-achievement-grid mt-4" },
      stat(String(p.puzzlesSolved ?? 0), "Puzzles cleared", "var(--ok)"),
      stat(String(p.solutionsSaved ?? 0), "Saved solutions", "var(--primary)"),
      stat(String(p.accomplishments ?? 0), "Accomplishments", "var(--warn)"),
      puzzleRecordsHost(),
      stat(String(p.bestStreak ?? 0), "Best streak"),
      stat(placed ? "PLACED" : `${placementConfidence(p)}/10`, placed ? "Ranked status" : "Confidence", placed ? rank.color : "var(--muted)")),

    bestTimesPanel(p),
    discoveryPanel(p),
    historyPanel(p),
    accomplishmentCardsPanel(p),
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
      add(clear(host),
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

  function trackCard(label, division, elo, cells) {
    return h("section", { class: "profile-track-card", style: { "--track-color": division.color } },
      h("div", { class: "between gap-3 wrapflex" },
        h("div", {},
          h("div", { class: "eyebrow" }, `// ${label}`),
          h("div", { class: "profile-division" }, division.name)),
        h("div", { class: "profile-track-elo" },
          h("span", {}, elo),
          h("small", {}, division.name))),
      h("div", { class: "stats mt-4" }, ...cells));
  }

  function puzzleRecordsHost() {
    const cell = stat("—", "Puzzle records", "var(--warn)");
    if (!p.isGuest) {
      countPuzzleRecords(p.uid).then((count) => {
        const value = cell.querySelector(".v");
        if (value) value.textContent = String(count);
      }).catch(() => {
        const value = cell.querySelector(".v");
        if (value) value.textContent = "—";
      });
    }
    return cell;
  }

  // Ranked board position, filled in once it loads.
  function rankHost() {
    const cell = h("div", { class: "stat" },
      h("div", { class: "v" }, "—"),
      h("div", { class: "k" }, "Board position"));
    if (!p.isGuest) {
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

  function accomplishmentCardsPanel(prof) {
    const legacy = prof.pinnedAccomplishment?.title ? [prof.pinnedAccomplishment] : [];
    const cards = Array.isArray(prof.accomplishmentCards) ? prof.accomplishmentCards : legacy;
    if (!cards.length) return null;
    return h("section", { class: "profile-accomplishments mt-8" },
      h("div", { class: "section-title" }, "// Accomplishment badges"),
      h("div", { class: "profile-accomplishment-cards" },
        ...cards.map((card) => h("article", { class: "profile-accomplishment-card" },
          h("span", { class: "profile-pinned-star" }, "★"),
          h("div", { style: { minWidth: "0" } },
            h("div", { class: "label" }, card.difficulty || "Accomplishment"),
            h("h3", { class: "mono" }, card.title || card.archetypeId),
            h("p", { class: "mono" }, card.bestTimeMs != null && Number.isFinite(Number(card.bestTimeMs)) ? `Solve time · ${fmtTime(Number(card.bestTimeMs))}` : "Completed puzzle"))))));
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

  function historyPanel(prof) {
    if (prof.isGuest || String(prof.uid).startsWith("local:")) return null;
    const host = h("div", { class: "mt-8" },
      h("div", { class: "section-title" }, "// Match history"),
      h("div", { class: "panel panel-pad" }, "Loading recent matches…"));
    getMatchHistory(prof.uid).then((rows) => {
      const panel = host.querySelector(".panel");
      clear(panel);
      if (!rows.length) {
        panel.append(h("div", { class: "empty", style: { border: "none" } }, "No tracked matches yet. New Unranked and Ranked results will appear here."));
        return;
      }
      const chronological = [...rows].reverse();
      const series = chronological.map((row) => ({
        row,
        value: Number(row.ratingAfter ?? row.ratingBefore ?? row.rating ?? row.soloRating ?? NaN),
      })).filter((entry) => Number.isFinite(entry.value));
      if (!series.length) {
        panel.append(h("div", { class: "empty", style: { border: "none" } }, "Rating values are unavailable for these legacy matches."));
        return;
      }
      const values = series.map((entry) => entry.value);
      const min = Math.min(...values), max = Math.max(...values);
      const width = 640, height = 150, pad = 18;
      const spread = Math.max(1, max - min);
      const coords = values.map((value, index) => {
        const x = pad + (index * (width - pad * 2)) / Math.max(1, values.length - 1);
        const y = height - pad - ((value - min) * (height - pad * 2)) / spread;
        return { x, y, entry: series[index] };
      });
      const points = coords.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
      const trendStroke = "#ff3b30";
      const gradientId = `history-gradient-${String(prof.uid).replace(/[^a-zA-Z0-9_-]/g, "")}`;
      const areaPoints = `${points} ${coords[coords.length - 1].x.toFixed(1)},${height - pad} ${coords[0].x.toFixed(1)},${height - pad}`;
      const chart = svgNode("svg", { viewBox: `0 0 ${width} ${height}`, class: "history-chart", role: "img", "aria-label": "Rating history graph" });
      const tooltip = h("div", { class: "history-chart-tooltip", role: "status" });
      const chartWrap = h("div", { class: "history-chart-wrap" }, chart, tooltip);
      const hideTooltip = () => { tooltip.classList.remove("active"); };
      const dots = coords.map(({ x, y, entry }, index) => {
        const point = svgNode("circle", {
          cx: x, cy: y, r: index === coords.length - 1 ? "4.8" : "3", fill: trendStroke,
          stroke: "#09090b", "stroke-width": "2", tabindex: "0",
          "aria-label": `${Math.round(entry.value)} ELO on ${formatHistoryDate(entry.row.createdAt)}`,
        });
        const showTooltip = () => {
          tooltip.textContent = `${Math.round(entry.value)} ELO · ${formatHistoryDate(entry.row.createdAt)}`;
          tooltip.style.left = `${(x / width) * 100}%`;
          tooltip.style.top = `${(y / height) * 100}%`;
          tooltip.classList.add("active");
        };
        point.addEventListener("mouseenter", showTooltip);
        point.addEventListener("focus", showTooltip);
        point.addEventListener("mouseleave", hideTooltip);
        point.addEventListener("blur", hideTooltip);
        return point;
      });
      const gradient = svgNode("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1" });
      gradient.append(
        svgNode("stop", { offset: "0%", "stop-color": trendStroke, "stop-opacity": ".36" }),
        svgNode("stop", { offset: "100%", "stop-color": trendStroke, "stop-opacity": "0" }),
      );
      const defs = svgNode("defs");
      defs.append(gradient);
      chart.append(
        defs,
        svgNode("line", { x1: pad, y1: height - pad, x2: width - pad, y2: height - pad, stroke: "#34343d", "stroke-width": "1" }),
        svgNode("polygon", { points: areaPoints, fill: `url(#${gradientId})`, "pointer-events": "none" }),
        svgNode("polyline", { points, fill: "none", stroke: trendStroke, "stroke-width": "3.5", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        ...dots,
      );
      panel.append(
        h("div", { class: "between mb-3" },
          h("span", { class: "label" }, "// Rating trend · last " + series.length),
          h("span", { class: "label" }, `${Math.round(min)}–${Math.round(max)}`)),
        chartWrap,
        h("div", { class: "divide mt-4" }, ...rows.map((row) => {
          const won = row.result === "win" || row.result === "solved";
          const delta = Number(row.delta ?? 0);
          const title = row.mode === "ranked"
            ? `Ranked · ${row.opponentUsername || "Opponent"}`
            : `Unranked · ${row.difficulty || "Run"}`;
          const detail = row.mode === "ranked"
            ? `${row.result || "complete"}${row.winBy ? ` · ${row.winBy}` : ""}`
            : `${row.result || "complete"}${row.timeMs ? ` · ${fmtTime(row.timeMs)}` : ""}`;
          return h("div", { class: "list-row" },
            h("div", {},
              h("div", { class: "mono", style: { fontSize: "12.5px", fontWeight: "700" } }, title),
              h("div", { class: "label mt-1", style: { textTransform: "none", letterSpacing: "0" } }, `${detail} · ${fmtAgo(row.createdAt)}`)),
            h("span", { class: "mono tnum", style: { color: delta > 0 ? "var(--ok)" : delta < 0 ? "var(--primary)" : "var(--muted)" } },
              `${delta >= 0 ? "+" : ""}${delta}`));
        })),
      );
    }).catch((error) => {
      console.error("history load failed", error);
      const panel = host.querySelector(".panel");
      clear(panel).append(h("div", { class: "empty", style: { border: "none" } }, "Match history is temporarily unavailable."));
    });
    return host;
  }

  function formatHistoryDate(value) {
    const millis = typeof value?.toMillis === "function" ? value.toMillis() : Number(value);
    const date = new Date(Number.isFinite(millis) ? millis : Date.now());
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function openProfileSettings() {
    const bio = h("textarea", { class: "input", maxlength: "240", rows: "5", placeholder: "Tell players a little about yourself…" });
    bio.value = p.bio || "";
    const email = auth.currentUser?.email || "";
    const reveal = h("input", { type: "checkbox", checked: !!p.emailVisible && !!p.publicEmail, disabled: !email });
    const note = h("p", { class: "label mt-2", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.55" } },
      email
        ? "When enabled, your sign-in email appears next to your join date on your public profile. When disabled, no email is stored in the public profile."
        : "This account has no email address available to display.");
    const save = h("button", { class: "btn btn-primary grow", onClick: async () => {
      save.disabled = true;
      try {
        const patch = await saveProfilePresentation(p, { bio: bio.value, emailVisible: reveal.checked, email });
        Object.assign(p, patch);
        m.close();
        toast("Profile settings saved.", "ok");
        navigate("/profile/" + p.uid);
      } catch (error) {
        console.error(error);
        save.disabled = false;
        toast("Couldn't save profile settings.", "err");
      }
    } }, "Save settings");
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Profile settings"),
      h("h2", { class: "head mb-3" }, "Public profile"),
      h("label", { class: "label mb-2", style: { display: "block" } }, "// Bio · 240 characters"),
      bio,
      h("label", { class: "row gap-3 mt-5", style: { alignItems: "flex-start", cursor: email ? "pointer" : "not-allowed" } },
        reveal,
        h("span", {}, h("span", { class: "mono", style: { fontSize: "13px", fontWeight: "700" } }, "Show email publicly"), note)),
      h("div", { class: "row gap-2 mt-5" }, save,
        h("button", { class: "btn grow", onClick: () => m.close() }, "Cancel"))));
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
