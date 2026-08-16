// ── Tiny DOM + formatting helpers ───────────────────────────────────────────

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  return add(el, ...children);
}

/**
 * `el.append(...)` that drops null / undefined / false instead of stringifying
 * them. Native `append` would happily insert the text "null", so any call site
 * appending a conditional child needs this.
 */
export function add(el, ...children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ── Overlay host ────────────────────────────────────────────────────────────
/**
 * Where floating UI must be mounted.
 *
 * While an element is fullscreen the browser paints *only* that element's
 * subtree, so anything appended to <body> is invisible — which silently broke
 * every modal and toast raised from inside the arena (resign, reference, draw
 * offers, test results). Overlays therefore go inside the fullscreen element
 * whenever there is one.
 */
function overlayHost() {
  return document.fullscreenElement ?? document.body;
}

// ── Toasts ──────────────────────────────────────────────────────────────────
export function toast(msg, kind = "", ms = 3800) {
  const parent = overlayHost();
  let host = parent.querySelector(":scope > #toasts");
  if (!host) {
    // A stale host left in a different parent would be invisible again.
    document.getElementById("toasts")?.remove();
    host = h("div", { id: "toasts" });
    parent.append(host);
  }
  const t = h("div", { class: `toast ${kind}` }, msg);
  host.append(t);
  setTimeout(() => {
    t.style.transition = "opacity .25s, transform .25s";
    t.style.opacity = "0";
    t.style.transform = "translateY(6px)";
    setTimeout(() => t.remove(), 260);
  }, ms);
  return t;
}

// ── Modal ───────────────────────────────────────────────────────────────────
// Returns { close }. `onClose` fires for backdrop / Escape / X dismissals.
export function modal(content, opts = {}) {
  const box = h("div", { class: `modal ${opts.wide ? "modal-wide" : ""} ${opts.className || ""}`.trim() });
  if (opts.closable !== false) {
    box.append(h("button", { class: "modal-x", "aria-label": "Close", onClick: () => close() }, "×"));
  }
  box.append(content);

  const backdrop = h("div", { class: "modal-backdrop" }, box);
  if (opts.closable !== false) {
    backdrop.addEventListener("mousedown", (e) => { if (e.target === backdrop) close(); });
  }

  function onKey(e) { if (e.key === "Escape" && opts.closable !== false) close(); }
  document.addEventListener("keydown", onKey);

  function close() {
    document.removeEventListener("keydown", onKey);
    backdrop.remove();
    opts.onClose?.();
  }

  overlayHost().append(backdrop);
  const focusable = box.querySelector("input, button, textarea, select");
  focusable?.focus();
  return { close, el: box };
}

export function confirmModal(title, body, confirmLabel = "Confirm") {
  return new Promise((resolve) => {
    let decided = false;
    const content = h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// " + title),
      h("p", { class: "mono mb-6", style: { fontSize: "13px", lineHeight: "1.65", color: "var(--muted-fg)" } }, body),
      h("div", { class: "row gap-2" },
        h("button", { class: "btn btn-danger grow", onClick: () => { decided = true; m.close(); resolve(true); } }, confirmLabel),
        h("button", { class: "btn grow", onClick: () => { decided = true; m.close(); resolve(false); } }, "Cancel"),
      ),
    );
    const m = modal(content, { onClose: () => { if (!decided) resolve(false); } });
  });
}

// ── Formatting ──────────────────────────────────────────────────────────────
export function fmtClock(secs) {
  const s = Math.max(0, Math.floor(secs));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtTime(ms) {
  if (ms == null) return "—";
  const s = ms / 1000;
  if (s < 60) return s.toFixed(2) + "s";
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toFixed(2).padStart(5, "0")}`;
}

export function fmtAgo(ms) {
  if (!ms) return "";
  const d = Date.now() - ms;
  if (d < 60000) return "just now";
  if (d < 3600000) return Math.floor(d / 60000) + "m ago";
  if (d < 86400000) return Math.floor(d / 3600000) + "h ago";
  if (d < 604800000) return Math.floor(d / 86400000) + "d ago";
  return new Date(ms).toLocaleDateString();
}

export function initials(name) {
  return String(name || "?").trim().slice(0, 2).toUpperCase();
}

// ── Avatars ─────────────────────────────────────────────────────────────────
// No uploads: a profile picture is a symbol plus a colour, both stored as short
// strings on the profile doc. That keeps them free, instantly available, safe
// to show on public boards, and available to guests offline.
//
// A player who has never picked one still gets a stable identity: the colour is
// derived from their name, so they look the same everywhere.

export const AVATAR_HUES = [0, 18, 42, 96, 152, 190, 262, 320];

export const AVATAR_ICONS = {
  bolt:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  skull:    '<path d="M12 2a8 8 0 0 0-8 8v3.5a2 2 0 0 0 1 1.73V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.77a2 2 0 0 0 1-1.73V10a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10 21v-3M14 21v-3"/>',
  crown:    '<path d="M3 6l4 5 5-7 5 7 4-5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  terminal: '<polyline points="5 7 10 12 5 17"/><line x1="12" y1="17" x2="19" y2="17"/>',
  flame:    '<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.4-2-1-3 3 1.5 4 4 4 6a6 6 0 0 1-12 0c0-5 6-6 6-12Z"/>',
  star:     '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/>',
  gem:      '<path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20M12 3 8 9l4 12 4-12-4-6"/>',
  target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  rocket:   '<path d="M5 15c-1 3 0 5 0 5s2 1 5 0"/><path d="M12 2c4 3 6 7 6 11l-4 4h-4l-4-4c0-4 2-8 6-11Z"/><circle cx="12" cy="10" r="2"/>',
  ghost:    '<path d="M5 21V10a7 7 0 0 1 14 0v11l-3-2-2 2-2-2-2 2-2-2Z"/><circle cx="9.5" cy="10" r="1.3"/><circle cx="14.5" cy="10" r="1.3"/>',
  brain:    '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 4 2 2 0 0 0 3-2V4a2 2 0 0 0-3-1Z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 4 2 2 0 0 1-3-2"/>',
  swords:   '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/>',
};

export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS);

function hashOf(s) {
  let n = 0;
  const str = String(s || "?");
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return n;
}

/** The hue a player falls back to when they've never picked one. */
export function defaultHue(name) {
  return AVATAR_HUES[hashOf(name) % AVATAR_HUES.length];
}

/**
 * @param {string|object} who  a username, or any object with
 *                             { username, avatarIcon, avatarHue }
 */
export function avatar(who, size = "") {
  const p = typeof who === "string" ? { username: who } : (who || {});
  const name = p.username ?? "?";
  const hue = Number.isFinite(p.avatarHue) ? p.avatarHue : defaultHue(name);
  const glyph = AVATAR_ICONS[p.avatarIcon];

  const state = p.inMatch ? "busy" : p.online ? "online" : "offline";
  const el = h("span", {
    class: "avatar avatar-" + state + (size ? " avatar-" + size : ""),
    style: { position: "relative", background: `linear-gradient(135deg, hsl(${hue} 78% 56%), hsl(${(hue + 26) % 360} 82% 42%))` },
    title: `${name} — ${state === "busy" ? "in a battle" : state === "online" ? "online" : "offline"}`,
  });

  if (glyph) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = glyph;
    el.append(svg);
  } else {
    el.append(initials(name));
  }
  return el;
}

/** A single avatar icon as a standalone SVG, for the picker grid. */
export function avatarIcon(key, size = 20) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size); svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = AVATAR_ICONS[key] ?? "";
  return svg;
}

// ── Icons (inline SVG, currentColor) ────────────────────────────────────────
const ICONS = {
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/><path d="M9 6V4h6v2"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.2 14.3A7 7 0 1 1 15.8 14.3c-.95.8-1.55 1.64-1.67 2.7H9.87c-.12-1.06-.72-1.9-1.67-2.7Z"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  google: 'GOOGLE',
};

export function icon(name, size = 16) {
  if (name === "google") {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size); s.setAttribute("height", size);
    s.innerHTML =
      '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/>' +
      '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>' +
      '<path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"/>' +
      '<path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"/>';
    return s;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = ICONS[name] ?? "";
  return svg;
}

// ── Misc ────────────────────────────────────────────────────────────────────
export function debounce(fn, ms = 250) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function sectionTitle(text) {
  return h("div", { class: "eyebrow mb-3" }, "// " + text);
}

export function emptyState(text) {
  return h("div", { class: "empty" }, text);
}
