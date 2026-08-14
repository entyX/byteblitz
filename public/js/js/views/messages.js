// ============================================================================
// Messages — one conversation per friend pair, live via Firestore snapshots.
// ============================================================================

import { h, clear, toast, fmtAgo, icon, avatar } from "../ui.js";
import { session, requireAccount, openAuthModal } from "../session.js";
import {
  watchConversations, watchMessages, sendMessage, ensureConversation,
  getProfile, convIdFor, getFriends, editMessage, deleteMessage,
} from "../store.js";
import { navigate } from "../router.js";
import { challengeFriend } from "../game.js";

export async function renderMessages(params, root) {
  const unsubs = [];
  const page = h("div", { class: "wrap", style: { paddingTop: "36px", paddingBottom: "72px" } });
  root.append(page);

  const me = session.profile;
  if (!me || me.isAnonymous) {
    page.append(
      h("div", { class: "eyebrow mb-2" }, "// Messages"),
      h("h1", { class: "head mb-5" }, "Direct ", h("span", { class: "gradient-text" }, "line")),
      h("div", { class: "empty" },
        me?.isGuest
          ? "Guests can't message anyone. Create an account to add friends and chat."
          : "Messaging needs an account."),
      h("button", { class: "btn btn-primary mt-4", onClick: async () => {
        if (me?.isGuest) { openAuthModal({ intent: "gate", allowAnonymous: false }); return; }
        if (await requireAccount("gate")) navigate("/messages");
      } }, me?.isGuest ? "Create an account" : "Sign in"),
    );
    return;
  }

  let activeUid = params.uid || null;
  let conversations = [];
  let msgUnsub = null;

  const listHost = h("div", { class: "chat-list" });
  const bodyHost = h("div", { class: "chat-body" });

  page.append(
    h("div", { class: "eyebrow mb-2" }, "// Messages"),
    h("h1", { class: "head mb-6" }, "Direct ", h("span", { class: "gradient-text" }, "line")),
    h("div", { class: "chat-shell" }, listHost, bodyHost),
  );

  // ── Conversation list ────────────────────────────────────────────────────
  function paintList() {
    clear(listHost);
    listHost.append(h("div", { class: "panel-head" },
      h("span", { class: "label" }, "// Chats"),
      h("button", { class: "btn btn-sm", onClick: newChat }, "New")));

    if (!conversations.length) {
      listHost.append(h("div", { class: "empty", style: { border: "none" } }, "No conversations yet."));
      return;
    }

    conversations.forEach((c) => {
      const otherUid = c.participants.find((u) => u !== me.uid);
      const name = c.names?.[otherUid] || "Player";
      listHost.append(h("button", { class: "chat-item" + (otherUid === activeUid ? " active" : ""),
        onClick: () => { activeUid = otherUid; navigate("/messages/" + otherUid); } },
        h("div", { class: "row gap-3" },
          avatar(name, "sm"),
          h("div", { class: "grow", style: { minWidth: "0" } },
            h("div", { class: "between gap-2" },
              h("span", { class: "mono", style: { fontSize: "13.5px", fontWeight: "700" } }, name),
              h("span", { class: "label", style: { fontSize: "10px" } }, fmtAgo(c.lastAt))),
            h("div", { class: "mono mt-1", style: { fontSize: "11.5px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
              c.lastMessage || "—")))));
    });
  }

  async function newChat() {
    let friends = [];
    try { friends = await getFriends(me.uid); } catch {}
    if (!friends.length) { toast("Add a friend first.", "err"); return; }
    const { modal } = await import("../ui.js");
    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// New conversation"),
      h("h2", { class: "head mb-5" }, "Message a friend"),
      h("div", { class: "panel divide" },
        ...friends.map((f) => h("button", { class: "list-row", style: { width: "100%", background: "none", border: "none" },
          onClick: async () => {
            m.close();
            try { await ensureConversation(me, f); } catch {}
            activeUid = f.uid;
            navigate("/messages/" + f.uid);
          } },
          h("span", { class: "mono", style: { fontSize: "13px" } }, f.username),
          icon("message", 13))))));
  }

  // ── Thread ───────────────────────────────────────────────────────────────
  async function paintThread() {
    msgUnsub?.();
    msgUnsub = null;
    clear(bodyHost);

    if (!activeUid) {
      bodyHost.append(h("div", { class: "empty", style: { border: "none", margin: "auto" } },
        "Pick a conversation, or start a new one."));
      return;
    }

    let other = conversations.find((c) => c.participants.includes(activeUid));
    let otherName = other?.names?.[activeUid];
    if (!otherName) {
      const prof = await getProfile(activeUid);
      otherName = prof?.username ?? "Player";
      if (prof) { try { await ensureConversation(me, prof); } catch {} }
    }

    const msgHost = h("div", { class: "chat-msgs" });
    const input = h("input", { class: "input", placeholder: "Write a message…", maxlength: "1000" });
    const sendBtn = h("button", { class: "btn btn-primary", onClick: submit }, icon("send", 14));

    const form = h("form", { class: "row gap-2", style: { padding: "12px", borderTop: "1px solid var(--border)" },
      onSubmit: (e) => { e.preventDefault(); submit(); } }, input, sendBtn);

    bodyHost.append(
      h("div", { class: "panel-head" },
        h("button", { class: "row gap-3", style: { background: "none", border: "none", padding: "0", color: "var(--foreground)" },
          onClick: () => navigate("/profile/" + activeUid) },
          avatar(otherName, "sm"),
          h("span", { class: "mono", style: { fontSize: "14px", fontWeight: "700" } }, otherName)),
        h("div", { class: "row gap-2" },
          h("button", { class: "btn btn-sm", onClick: () => navigate("/profile/" + activeUid) }, "Profile"),
          h("button", { class: "btn btn-sm", onClick: () => challengeFriend({ uid: activeUid, username: otherName }) },
            icon("swords", 12), "Duel"))),
      msgHost, form);

    async function submit() {
      const text = input.value;
      if (!text.trim()) return;
      input.value = "";
      try { await sendMessage(convIdFor(me.uid, activeUid), me, { uid: activeUid, username: otherName }, text); }
      catch (e) { console.error(e); toast("Message failed to send.", "err"); input.value = text; }
    }

    msgUnsub = watchMessages(convIdFor(me.uid, activeUid), (msgs) => {
      // If the user is near the bottom, auto-scroll; otherwise preserve their
      // viewport so spamming doesn't jump them away from recent unseen messages.
      const nearBottom = (msgHost.scrollHeight - msgHost.scrollTop - msgHost.clientHeight) < 120;
      clear(msgHost);
      if (!msgs.length) {
        msgHost.append(h("div", { class: "empty", style: { border: "none", margin: "auto" } }, "Say something."));
        return;
      }

      msgs.forEach((m2) => {
        if (m2.system) {
          msgHost.append(h("div", { class: "sys-msg" }, m2.text));
          return;
        }

        // Row holds time and bubble; time sits outside the bubble on left for
        // others and right for the current user's messages.
        const row = h("div", { class: "msg-row", style: { display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "8px" } });
        const bubble = h("div", { class: "bubble" + (m2.fromUid === me.uid ? " mine" : "") });
        const content = m2.deleted ? h("em", { style: { color: "var(--muted)" } }, "[deleted]") : h("div", {}, m2.text);
        bubble.append(content);

        const timeSpan = h("span", { class: "msg-time label", style: { fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap" } }, fmtAgo(m2.createdAt));

        // Actions container — hidden until hover. Use icon glyphs for compact UI.
        const actions = h("div", { class: "msg-actions", style: { display: "none", gap: "6px", alignItems: "center" } });
        if (!m2.deleted && m2.fromUid === me.uid) {
          const editI = h("button", { class: "btn-icon", title: "Edit", onClick: () => startEdit(m2, bubble) }, icon("edit", 14));
          const delI = h("button", { class: "btn-icon", title: "Delete", onClick: async () => {
            if (!confirm("Delete this message?")) return;
            try { await deleteMessage(convIdFor(me.uid, activeUid), m2.id, me); }
            catch (e) { console.error(e); toast("Delete failed.", "err"); }
          } }, icon("trash", 14));
          actions.append(editI, delI);
        }

        // Place time to the right for own messages, left for others
        if (m2.fromUid === me.uid) {
          row.append(bubble, timeSpan, actions);
        } else {
          row.append(timeSpan, bubble, actions);
        }

        // Show actions only when hovering the row to support mouseover across
        // bubble and icons without flicker.
        row.onmouseenter = () => { actions.style.display = actions.children.length ? "inline-flex" : "none"; };
        row.onmouseleave = () => { actions.style.display = "none"; };

        msgHost.append(row);
      });

      // Auto-scroll only when near bottom or when the newest message is from me.
      const last = msgs[msgs.length - 1];
      if (nearBottom || last?.fromUid === me.uid) {
        msgHost.scrollTop = msgHost.scrollHeight;
        const existing = msgHost.querySelector(".jump-btn");
        if (existing) existing.remove();
      } else {
        // Show a sticky "New messages" jump button if not already present.
        if (!msgHost.querySelector(".jump-btn")) {
          const jump = h("button", { class: "jump-btn btn btn-sm", style: { position: "sticky", bottom: "8px", float: "right" },
            onClick: () => { msgHost.scrollTop = msgHost.scrollHeight; jump.remove(); } }, "New messages");
          msgHost.append(jump);
        }
      }
    });

    // Inline edit helper: swaps the bubble contents for an input row.
    function startEdit(msg, bubble) {
      const origText = msg.text || "";
      const contentNode = bubble.firstChild;
      contentNode.style.display = "none";
      const input = h("input", { class: "input", value: origText });
      const save = h("button", { class: "btn btn-primary btn-sm", onClick: async () => {
        try {
          await editMessage(convIdFor(me.uid, activeUid), msg.id, me, input.value);
        } catch (e) { console.error(e); toast("Edit failed.", "err"); }
      } }, "Save");
      const cancel = h("button", { class: "btn btn-sm", onClick: () => {
        row.remove(); contentNode.style.display = "block";
      } }, "Cancel");
      const row = h("div", { class: "row gap-2", style: { marginTop: "6px" } }, input, save, cancel);
      bubble.append(row);
    }

    unsubs.push(() => msgUnsub?.());
    input.focus();
  }

  const unsubConv = watchConversations(me.uid, (list) => {
    conversations = list;
    paintList();
  });
  unsubs.push(unsubConv);

  paintList();
  await paintThread();

  return () => unsubs.forEach((fn) => { try { fn(); } catch {} });
}
