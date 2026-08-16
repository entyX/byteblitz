import { h, clear, icon } from "../ui.js";
import { navigate } from "../router.js";
import { startSolo } from "../game.js";

export async function renderBurstLoading(_params, root) {
  let status = "Preparing your local Burst question…";
  let progress = 0.02;
  let failed = null;
  let active = true;

  const page = h("main", { class: "wrap", style: { minHeight: "calc(100vh - 96px)", display: "grid", placeItems: "center", paddingTop: "42px", paddingBottom: "72px" } });
  const card = h("section", { class: "panel panel-pad", style: { width: "min(620px, 100%)", textAlign: "center", padding: "clamp(28px, 6vw, 64px)" } });
  const mark = h("div", { class: "elo-rank-badge", style: { width: "68px", height: "68px", margin: "0 auto", display: "grid", placeItems: "center", borderRadius: "50%" } }, icon("bulb", 28));
  const statusNode = h("p", { class: "mono mt-4", style: { color: "var(--muted-fg)", minHeight: "22px" } }, status);
  const progressTrack = h("div", { class: "bar mt-5", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "2" }, h("i", { style: { width: "2%", background: "var(--primary)", transition: "width .25s ease" } }));
  const detail = h("p", { class: "label mt-4", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.6" } }, "Everything runs locally in your browser. The first model download is cached on this device.");
  const actions = h("div", { class: "row gap-3 wrapflex mt-6", style: { justifyContent: "center" } });
  card.append(
    mark,
    h("div", { class: "eyebrow mt-5" }, "// Local AI Burst"),
    h("h1", { class: "head mt-2" }, "Building your question"),
    statusNode,
    progressTrack,
    detail,
    actions,
  );
  page.append(card);
  clear(root).append(page);

  function paint() {
    if (!active) return;
    statusNode.textContent = failed || status;
    statusNode.style.color = failed ? "var(--danger, #ef4444)" : "var(--muted-fg)";
    const pct = Math.max(2, Math.min(100, Math.round(progress * 100)));
    progressTrack.setAttribute("aria-valuenow", String(pct));
    progressTrack.firstChild.style.width = `${pct}%`;
    clear(actions);
    if (failed) {
      actions.append(
        h("button", { class: "btn btn-primary", onClick: () => { navigate("/burst-loading", { replace: true }); } }, icon("refresh", 14), "Try again"),
        h("button", { class: "btn", onClick: () => navigate("/") }, "Back to arena"),
      );
    } else {
      actions.append(h("button", { class: "btn", onClick: () => { active = false; navigate("/"); } }, "Cancel"));
    }
  }

  try {
    await startSolo(undefined, {
      onProgress: (next) => {
        if (!active) return;
        status = next?.text || "Preparing your local Burst question…";
        progress = Number.isFinite(next?.progress) ? next.progress : progress;
        failed = null;
        paint();
      },
      onError: (error) => {
        failed = error?.message || "The local Burst question could not be created.";
        progress = 1;
        paint();
      },
    });
  } catch (error) {
    if (active) {
      failed = error?.message || "The local Burst question could not be created.";
      progress = 1;
      paint();
    }
  }

  return () => { active = false; };
}
