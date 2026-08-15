// ============================================================================
// Public solution share — read-only, linkable view of a completed submission.
// ============================================================================

import { h, clear, emptyState, fmtTime, toast, avatar } from "../ui.js";
import { getPublicSolutionShare } from "../store.js";
import { navigate } from "../router.js";

export async function renderPublicSolution(params, root) {
  const page = h("div", { class: "wrap", style: { paddingTop: "42px", paddingBottom: "72px", maxWidth: "980px" } });
  root.append(page);
  page.append(h("div", { class: "empty" }, "Loading shared solution…"));

  let share = null;
  try { share = await getPublicSolutionShare(params.id); }
  catch (error) { console.error(error); }
  clear(page);

  if (!share) {
    page.append(emptyState("This solution link is unavailable or has been removed."),
      h("button", { class: "btn mt-4", onClick: () => navigate("/training") }, "Open Training Grounds"));
    return;
  }

  const copy = h("button", { class: "btn btn-sm", type: "button", onClick: async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Share link copied.", "ok");
    } catch { prompt("Copy this solution link:", window.location.href); }
  } }, "Copy link");

  page.append(
    h("section", { class: "share-hero" },
      h("div", { class: "share-stamp" }, "BYTEBLITZ // PUBLIC SOLUTION"),
      h("div", { class: "between gap-4 wrapflex mt-4" },
        h("div", {},
          h("div", { class: "eyebrow mb-2" }, "// " + String(share.difficulty || "Training").toUpperCase()),
          h("h1", { class: "head" }, share.title || "Solved problem"),
          h("p", { class: "mono mt-2", style: { fontSize: "12px", color: "var(--muted-fg)" } },
            `${share.language || "code"} · ${share.mode || "training"}${share.bestTimeMs ? ` · best ${fmtTime(share.bestTimeMs)}` : ""}`)),
        h("div", { class: "row gap-2 wrapflex" },
          share.accomplishment ? h("span", { class: "pill pill-warn" }, "★ Accomplishment") : null,
          copy)),
      h("button", { class: "share-owner mt-5", onClick: () => navigate("/profile/" + share.ownerUid) },
        avatar({ username: share.ownerUsername, avatarIcon: share.ownerAvatarIcon, avatarHue: share.ownerAvatarHue }, "sm"),
        h("span", {},
          h("span", { class: "label" }, "Shared by"),
          h("span", { class: "mono", style: { fontWeight: "700", fontSize: "13px" } }, share.ownerUsername || "ByteBlitz player"))),
    ),
    h("section", { class: "share-code-card mt-5" },
      h("div", { class: "between gap-3 share-code-head" },
        h("span", { class: "label" }, "// Accepted source"),
        h("span", { class: "pill" }, share.language || "code")),
      h("pre", { class: "solution-code share-code" }, share.code || "// Source unavailable")),
    h("div", { class: "row gap-3 wrapflex mt-5" },
      h("button", { class: "btn btn-primary", onClick: () => navigate("/training") }, "Try a problem ▸"),
      h("button", { class: "btn", onClick: () => navigate("/profile/" + share.ownerUid) }, "View player profile")),
  );
}
