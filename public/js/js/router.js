// ── Hash router ─────────────────────────────────────────────────────────────
// Hash routing keeps the whole thing a static site: no server rewrites needed
// and a refresh on /leaderboard can never 404.

const routes = [];
let renderTarget = null;
let currentCleanup = null;

export function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp(
    "^" + pattern.replace(/:[A-Za-z0-9_]+/g, (m) => { keys.push(m.slice(1)); return "([^/]+)"; }) + "$"
  );
  routes.push({ rx, keys, handler, pattern });
}

export function navigate(path, opts = {}) {
  const target = "#" + (path.startsWith("/") ? path : "/" + path);
  if (location.hash === target) { resolve(); return; }
  if (opts.replace) location.replace(target);
  else location.hash = target;
}

export function currentPath() {
  const h = location.hash.replace(/^#/, "");
  return h && h.startsWith("/") ? h : "/";
}

export function startRouter(target) {
  renderTarget = target;
  window.addEventListener("hashchange", resolve);
  resolve();
}

export function refresh() { resolve(); }

async function resolve() {
  const rawPath = currentPath();
  const [path, queryString = ""] = rawPath.split("?");

  try { currentCleanup?.(); } catch {}
  currentCleanup = null;

  for (const r of routes) {
    const m = path.match(r.rx);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    params.query = Object.fromEntries(new URLSearchParams(queryString).entries());
    while (renderTarget.firstChild) renderTarget.removeChild(renderTarget.firstChild);
    try {
      const cleanup = await r.handler(params, renderTarget);
      if (typeof cleanup === "function") currentCleanup = cleanup;
    } catch (e) {
      console.error("route failed", path, e);
      renderTarget.innerHTML =
        '<div class="wrap" style="padding:60px 24px"><div class="empty">Something broke loading this page. Try refreshing.</div></div>';
    }
    window.scrollTo(0, 0);
    return;
  }

  navigate("/", { replace: true });
}
