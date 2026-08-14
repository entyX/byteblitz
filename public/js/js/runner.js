// ============================================================================
// Code execution + syntax highlighting.
//
// Python runs on Pyodide (CPython compiled to wasm, loaded from CDN).
// JavaScript runs in a Web Worker the host can terminate on timeout.
// Both execute entirely in the browser — no judge server, no rate limits.
// ============================================================================

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";

export const LANGS = {
  python: {
    label: "Python 3", ext: "py", comment: "# ",
    starter: "",
    placeholder: "# Read from stdin with input(), print your answer.",
  },
  javascript: {
    label: "JavaScript", ext: "js", comment: "// ",
    starter: "",
    placeholder: "// Read a line with input(), print your answer with print().",
  },
};

export const LANG_ORDER = ["python", "javascript"];

// ── Pyodide ─────────────────────────────────────────────────────────────────
let py = null;
let bootPromise = null;
export const pyStatus = { ready: false, error: "" };

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export async function initPyodide(onStep) {
  if (py) return;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    try {
      onStep?.("Downloading Python runtime…");
      await loadScript(PYODIDE_CDN + "pyodide.js");
      onStep?.("Initialising Python sandbox…");
      py = await self.loadPyodide({ indexURL: PYODIDE_CDN });
      py.runPython("import sys, io");
      pyStatus.ready = true;
      onStep?.("Python runtime ready. ✓");
    } catch (e) {
      pyStatus.error = e?.message ?? String(e);
      bootPromise = null;
      throw e;
    }
  })();
  return bootPromise;
}

// Each test runs in a fresh namespace so nothing leaks between test cases or
// between matches. The step tracer kills runaway loops before they can block
// the main thread — Pyodide runs synchronously, so a `while True` would
// otherwise freeze the tab and the match timer with it.
async function runPython(code, stdin, timeoutMs) {
  if (!py) {
    try { await initPyodide(); }
    catch { return { output: "", error: "Python runtime unavailable" }; }
  }

  const wrapper = `
import sys
from io import StringIO as _SIO

sys.stdin  = _SIO(${JSON.stringify(stdin)})
_buf = _SIO()
sys.stdout = _buf
sys.stderr = _buf

_step_count = [0]
def _step_tracer(frame, event, arg):
    _step_count[0] += 1
    if _step_count[0] > 3_000_000:
        raise TimeoutError("Execution step limit exceeded — possible infinite loop")
    return _step_tracer

sys.settrace(_step_tracer)
_err = None
_ns  = {}
try:
    exec(compile(${JSON.stringify(code)}, "<solution>", "exec"), _ns)
except SystemExit:
    pass
except TimeoutError as _e:
    _err = "TimeoutError: " + str(_e)
except Exception as _e:
    _err = type(_e).__name__ + ": " + str(_e)
finally:
    sys.settrace(None)
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

[_buf.getvalue(), _err]
`;

  try {
    const res = await Promise.race([
      py.runPythonAsync(wrapper),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("Time Limit Exceeded")), timeoutMs)
      ),
    ]);
    const js = res?.toJs?.() ?? res;
    const output = String(js?.[0] ?? "").replace(/\s+$/, "");
    const errVal = js?.[1];
    const error = errVal && errVal !== "None" ? String(errVal) : null;
    res?.destroy?.();
    return { output, error };
  } catch (e) {
    return { output: "", error: e?.message ?? String(e) };
  }
}

// ── JavaScript worker ───────────────────────────────────────────────────────
function runJavaScript(code, stdin, timeoutMs) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker("/js/js-worker.js");
    } catch {
      resolve({ output: "", error: "JavaScript sandbox unavailable" });
      return;
    }

    let settled = false;
    const finish = (r) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { worker.terminate(); } catch {}
      resolve(r);
    };

    const timer = setTimeout(
      () => finish({ output: "", error: "Time Limit Exceeded" }),
      timeoutMs
    );

    worker.onmessage = (e) => finish(e.data);
    worker.onerror = (e) => finish({ output: "", error: e.message || "Runtime error" });
    worker.postMessage({ code, stdin });
  });
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function runCode(lang, code, stdin, timeoutMs = 5000) {
  if (lang === "javascript") return runJavaScript(code, stdin, timeoutMs);
  return runPython(code, stdin, timeoutMs);
}

export function getRunTimeout(lang) {
  return lang === "javascript" ? 3000 : 5000;
}

export async function warmRuntime(lang, onStep) {
  if (lang === "python") return initPyodide(onStep);
  onStep?.("JavaScript sandbox ready. ✓");
}

// ── Syntax highlighting ─────────────────────────────────────────────────────
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PY_KW = new Set(["def","class","if","elif","else","for","while","return","import","from","in","not","and","or","True","False","None","pass","break","continue","yield","with","as","try","except","finally","raise","del","global","lambda","assert","nonlocal","is"]);
const PY_BI = new Set(["print","input","len","range","int","str","float","list","dict","set","tuple","bool","type","sorted","reversed","enumerate","zip","map","filter","sum","max","min","abs","round","open","hasattr","getattr","isinstance","super","any","all","hex","bin","oct","chr","ord","repr","hash","id","vars","dir","iter","next","append","extend","join","split","strip","replace","format","collections","sys","math","heapq","deque","defaultdict","Counter","inf"]);

const JS_KW = new Set(["var","let","const","function","return","if","else","for","while","do","break","continue","new","delete","typeof","instanceof","in","of","this","class","extends","super","try","catch","finally","throw","switch","case","default","null","undefined","true","false","async","await","yield","void","static","get","set","import","export","from","as"]);
const JS_BI = new Set(["print","input","readline","readInt","readInts","console","log","Math","JSON","Array","Object","String","Number","Boolean","Map","Set","Promise","parseInt","parseFloat","isNaN","push","pop","shift","unshift","slice","splice","map","filter","reduce","forEach","join","split","sort","reverse","indexOf","includes","length","trim","charCodeAt","fromCharCode","toString","keys","values","entries","Infinity","BigInt"]);

const C_STR = "#ce9178", C_NUM = "#b5cea8", C_KWD = "#569cd6",
      C_FN = "#dcdcaa", C_CMT = "#6a9955", C_OP = "#d4d4d4";

function highlightLine(line, kw, bi, lineComment) {
  let out = "", i = 0;
  while (i < line.length) {
    if (lineComment === "#" && line[i] === "#") {
      out += `<span style="color:${C_CMT};font-style:italic">${esc(line.slice(i))}</span>`;
      break;
    }
    if (lineComment === "//" && line[i] === "/" && line[i + 1] === "/") {
      out += `<span style="color:${C_CMT};font-style:italic">${esc(line.slice(i))}</span>`;
      break;
    }
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i];
      if (lineComment === "#" && line.slice(i, i + 3) === q.repeat(3)) {
        out += `<span style="color:${C_STR}">${esc(line.slice(i))}</span>`;
        break;
      }
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") { j += 2; continue; }
        if (line[j] === q) { j++; break; }
        j++;
      }
      out += `<span style="color:${C_STR}">${esc(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9._xXbBoOeE]/.test(line[j])) j++;
      out += `<span style="color:${C_NUM}">${esc(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const w = line.slice(i, j);
      out += kw.has(w) ? `<span style="color:${C_KWD};font-weight:600">${esc(w)}</span>`
           : bi.has(w) ? `<span style="color:${C_FN}">${esc(w)}</span>`
           : esc(w);
      i = j;
      continue;
    }
    // Group adjacent operator characters into one token so sequences like ==, !=,
    // >=, <=, <<, >> etc. render as a single span. Also disable font ligatures
    // for the operator span so the browser doesn't render them as a single
    // combined glyph; users should see the separate ASCII characters.
    if ("+-*/%=<>!&|^~".includes(line[i])) {
      let j = i;
      while (j < line.length && "+-*/%=<>!&|^~".includes(line[j])) j++;
      const op = line.slice(i, j);
      out += `<span style="color:${C_OP};font-variant-ligatures: none; -webkit-font-feature-settings: 'liga' 0; -moz-font-feature-settings: 'liga' 0;">${esc(op)}</span>`;
      i = j;
      continue;
    }
    out += esc(line[i]);
    i++;
  }
  return out;
}

export function highlight(code, lang) {
  const [kw, bi, lc] = lang === "javascript"
    ? [JS_KW, JS_BI, "//"]
    : [PY_KW, PY_BI, "#"];
  return code.split("\n").map((l) => highlightLine(l, kw, bi, lc)).join("\n");
}
