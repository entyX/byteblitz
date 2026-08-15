// ============================================================================
// The arena — where a match actually happens.
//
// One screen serves all three modes (solo, training, ranked duel). It owns the
// problem panel, the editor, the clock, the judge, and the lockdown that ends
// your match if you leave the page.
// ============================================================================

import { h, clear, fmtClock, toast, confirmModal, modal } from "./ui.js";
import { runCode, getRunTimeout, warmRuntime, highlight, LANGS, LANG_ORDER } from "./runner.js";
import { outputMatches } from "./problems.js";

const LS_LANG = "bb_language";
const LS_FONT = "bb_fontsize";

let activeArena = null;

export function arenaIsOpen() { return !!activeArena; }

/**
 * @param {object} cfg
 *  mode        "solo" | "training" | "duel"
 *  problem     resolved problem object
 *  timeLimit   seconds
 *  title       label shown in the arena bar
 *  startAtMs   (duel) absolute epoch ms the clock starts
 *  me / opponent (duel) { uid, username, rating, rd }
 *  hooks: onSolved({timeMs, passed}), onFailed({reason, passed, timeMs}),
 *         onTestProgress(passedCount), onExit()
 *  externalEnd() -> optional; arena calls it to ask "has the duel already ended?"
 */
export function openArena(cfg) {
  if (activeArena) activeArena.destroy();
  const a = new Arena(cfg);
  activeArena = a;
  a.mount();
  return a;
}

class Arena {
  constructor(cfg) {
    this.cfg = cfg;
    this.problem = cfg.problem;
    this.timeLimit = cfg.timeLimit;
    this.lang = localStorage.getItem(LS_LANG) || "python";
    if (!LANGS[this.lang]) this.lang = "python";
    this.fontSize = Number(localStorage.getItem(LS_FONT)) || 14;
    this.code = "";
    this.finished = false;
    this.started = false;
    this.enteringFs = false;
    this.bestPassed = 0;
    this.submitting = false;
    this.timer = null;
    this.timeLeft = cfg.timeLimit;
    this.cleanups = [];
        this.results = [];
    this.referenceWindow = null;
    this.referenceBody = null;
    this.referenceCleanups = [];

  }

  // ── Mount / teardown ──────────────────────────────────────────────────────
  mount() {
    this.root = h("div", { class: "arena" });
    document.body.append(this.root);
    document.body.style.overflow = "hidden";
    this.renderTerms();
  }

    destroy() {
    this.stopClock();
    this.releaseLockdown();
    this.referenceCleanups.forEach((fn) => { try { fn(); } catch {} });
    this.referenceCleanups = [];
    this.root?.remove();

    document.body.style.overflow = "";
    if (document.fullscreenElement) { document.exitFullscreen?.().catch(() => {}); }
    if (activeArena === this) activeArena = null;
  }

  exit() {
    const cb = this.cfg.onExit;
    this.destroy();
    cb?.();
  }

  // ── Pre-match terms + user gesture for fullscreen ─────────────────────────
  renderTerms() {
    const startBtn = h("button", { class: "btn btn-primary btn-lg", style: { minWidth: "220px" }, onClick: () => this.beginBoot() },
      "Enter the arena ▸");

    // Python is a ~10 MB wasm download and a duel's clock starts whether or not
    // it has finished. Start pulling it now, while the player reads the rules,
    // so the boot screen usually has nothing left to wait for.
    const runtimeNote = h("span", { class: "label" }, "");
    warmRuntime(this.lang, (msg) => { runtimeNote.textContent = msg; })
      .then(() => { runtimeNote.textContent = "Runtime ready ✓"; })
      .catch(() => { runtimeNote.textContent = ""; });

    const langSel = h("select", { class: "input", style: { maxWidth: "220px" },
      onChange: (e) => {
        this.lang = e.target.value;
        localStorage.setItem(LS_LANG, this.lang);
        runtimeNote.textContent = "";
        warmRuntime(this.lang, (msg) => { runtimeNote.textContent = msg; })
          .then(() => { runtimeNote.textContent = "Runtime ready ✓"; })
          .catch(() => { runtimeNote.textContent = ""; });
      } },
      ...LANG_ORDER.map((k) => h("option", { value: k, selected: k === this.lang }, LANGS[k].label)));

    clear(this.root).append(
      h("div", { class: "bg-fx grid-bg" }),
      h("div", { class: "stack", style: { flex: "1", alignItems: "center", justifyContent: "center", padding: "28px", overflowY: "auto", position: "relative", zIndex: "2" } },
        h("div", { class: "eyebrow mb-2" }, "// " + (this.cfg.title || "Code Burst")),
        h("h1", { class: "head mb-3", style: { textAlign: "center" } },
          "Match ", h("span", { class: "accent" }, "rules")),
        h("div", { class: "panel panel-pad", style: { maxWidth: "620px", width: "100%" } },
          h("div", { class: "stack gap-4" },
            rule("The arena runs fullscreen", "Your match opens in fullscreen. Leaving fullscreen ends it."),
            this.cfg.mode === "duel"
              ? rule("Leaving the page auto-resigns", "Switching tabs, minimising, or clicking away from this window resigns the rated match immediately. There is no warning and no undo.")
              : rule("Leaving a solo run is neutral", "Switching tabs or windows ends an Unranked run without gaining or losing ELO."),
            rule("Copy and paste are disabled", "The editor blocks paste, copy, and the context menu."),
            rule("The clock does not stop", `${fmtClock(this.timeLimit)} on the clock. Submit as many times as you like — only a full pass ends it.`),
          ),
          h("div", { class: "mt-6 stack gap-2" },
            h("div", { class: "label" }, "Language"),
            langSel,
            runtimeNote),
          h("div", { class: "mt-6 row gap-3 wrapflex" },
            startBtn,
            h("button", { class: "btn", onClick: () => this.confirmAbandon() }, "Back")),
        ),
      ),
    );

    function rule(t, d) {
      return h("div", { class: "row gap-3", style: { alignItems: "flex-start" } },
        h("span", { class: "dot", style: { marginTop: "7px" } }),
        h("div", {},
          h("div", { class: "mono", style: { fontSize: "13px", fontWeight: "700" } }, t),
          h("div", { class: "mono mt-1", style: { fontSize: "11.5px", color: "var(--muted-fg)", lineHeight: "1.6" } }, d)),
      );
    }
  }

  async confirmAbandon() {
    if (this.cfg.mode === "duel") {
      const ok = await confirmModal(
        "Abandon match",
        "Your opponent is already waiting. Backing out now counts as a resignation and costs you rating.",
        "Resign"
      );
      if (!ok) return;
      this.cfg.onFailed?.({ reason: "abandoned", passed: 0, timeMs: 0 });
    }
    this.exit();
  }

  // ── Boot screen (warms the runtime) ───────────────────────────────────────
  async beginBoot() {
    // Fullscreen must be requested from inside the click handler.
    this.enteringFs = true;
    try {
      await (this.root.requestFullscreen?.() ?? Promise.resolve());
    } catch { /* browser refused — the visibility guards still apply */ }
    this.enteringFs = false;

    const lines = h("div", { class: "stack gap-1" });
    const pct = h("span", {}, "0%");
    const bar = h("i", { style: { width: "0%" } });
    let progress = 0;

    const push = (text) => {
      [...lines.children].forEach((c) => c.querySelector(".caret")?.remove());
      const el = h("div", { class: "boot-line" }, text, h("span", { class: "caret" }));
      el.style.color = text.includes("✓") ? "var(--ok)"
        : text.includes("⚠") ? "var(--warn)"
        : text.startsWith("BYTEBLITZ") ? "var(--primary)"
        : text.includes("LAUNCH") ? "var(--foreground)"
        : "var(--muted-fg)";
      lines.append(el);
    };
    const bump = (n) => {
      progress = Math.min(100, n);
      pct.textContent = progress + "%";
      bar.style.width = progress + "%";
    };

    clear(this.root).append(
      h("div", { class: "bg-fx grid-bg" }),
      h("div", { class: "boot" },
        h("div", { class: "boot-box" },
          h("div", { class: "term-bar" },
            h("div", { class: "row gap-3" },
              h("div", { class: "term-dots" },
                h("i", { style: { background: "hsl(0 70% 50% / .7)" } }),
                h("i", { style: { background: "hsl(45 90% 55% / .7)" } }),
                h("i", { style: { background: "hsl(140 60% 50% / .7)" } })),
              h("span", { class: "label" }, "byteblitz — burst-init")),
            h("div", { class: "row gap-2" },
              h("span", { class: "dot dot-live" }),
              h("span", { class: "label", style: { color: "var(--primary)" } }, "Live"))),
          h("div", { style: { padding: "20px", minHeight: "230px", display: "flex", flexDirection: "column", justifyContent: "space-between" } },
            lines,
            h("div", { class: "mt-5" },
              h("div", { class: "between mb-2" },
                h("span", { class: "label" }, "Initialising"),
                h("span", { class: "label" }, pct)),
              h("div", { class: "bar" }, bar))))),
    );

        push("BYTEBLITZ // CODE BURST v1.3 [C1 BETA]");

    await wait(180); push("> Establishing secure session…"); bump(15);
    await wait(220); push("> Session authenticated. ✓"); bump(30);
    await wait(200); push(`> Problem loaded — ${this.problem.difficulty} · ${this.problem.title} ✓`); bump(45);

    try {
      await warmRuntime(this.lang, (msg) => { push("> " + msg); bump(progress + 18); });
    } catch {
      push("> Runtime unavailable — check your connection. ⚠");
    }
    bump(90);

    // In a duel, hold here until the shared start time arrives.
    if (this.cfg.mode === "duel" && this.cfg.startAtMs) {
      while (Date.now() < this.cfg.startAtMs) {
        if (this.cfg.externalEnded?.()) { this.exit(); return; }
        const left = Math.ceil((this.cfg.startAtMs - Date.now()) / 1000);
        const last = lines.lastElementChild;
        if (last && last.textContent.startsWith("> Opponent")) last.remove();
        push(`> Opponent synced. Match starts in ${left}…`);
        await wait(400);
      }
    }

    push("> MATCH READY. LAUNCHING…"); bump(100);
    await wait(420);
    this.renderMatch();
  }

  // ── Match screen ──────────────────────────────────────────────────────────
  renderMatch() {
    this.started = true;
    this.cfg.onStarted?.();
    const p = this.problem;

    // Problem panel ---------------------------------------------------------
    const constraints = p.constraints.length
      ? h("div", { class: "mt-5" },
          h("div", { class: "label mb-2" }, "// Constraints"),
          h("ul", { class: "mono", style: { fontSize: "12px", lineHeight: "1.8", color: "var(--muted-fg)", paddingLeft: "18px", margin: "0" } },
            ...p.constraints.map((c) => h("li", {}, c))))
      : null;

    this.resultsHost = h("div", { class: "stack gap-2" });
    this.resultsWrap = h("div", { class: "mt-5 hidden" },
      h("div", { class: "label mb-2" }, "// Test results"),
      this.resultsHost);

    const problemPanel = h("div", { class: "arena-problem" },
      h("div", { class: "row gap-3 mb-3 wrapflex" },
        h("span", { class: "tier-badge", style: { color: p.color } }, p.difficulty),
        p.category ? h("span", { class: "pill" }, p.category.replace(/_/g, " ")) : null),
      h("h2", { class: "head mb-4" }, p.title),

      p.definition ? h("div", { class: "panel", style: { padding: "13px 15px", borderLeft: "2px solid var(--primary)" } },
        h("div", { class: "label mb-2" }, "// Background"),
        h("p", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.75", color: "var(--muted-fg)", margin: "0", whiteSpace: "pre-wrap" } }, p.definition)) : null,

      h("div", { class: "mt-5" },
        h("div", { class: "label mb-2" }, "// Task"),
        h("p", { class: "mono", style: { fontSize: "13.5px", lineHeight: "1.8", margin: "0", whiteSpace: "pre-wrap" } }, p.description)),

      p.inputFormat ? h("div", { class: "mt-5" },
        h("div", { class: "label mb-2" }, "// Input format"),
        h("p", { class: "mono", style: { fontSize: "12px", lineHeight: "1.75", color: "var(--muted-fg)", margin: "0", whiteSpace: "pre-wrap" } }, p.inputFormat)) : null,

      constraints,

      h("div", { class: "mt-5" },
        h("div", { class: "label mb-2" }, "// Sample input"),
        h("div", { class: "io-block" }, p.sampleInput),
        h("div", { class: "label mb-2 mt-4" }, "// Sample output"),
        h("div", { class: "io-block" }, p.sampleOutput)),

      this.resultsWrap,
      h("div", { style: { height: "40px" } }),
    );

    // Editor ---------------------------------------------------------------
    this.lineNos = h("div", { class: "linenos" });
    this.pre = h("pre", { "aria-hidden": "true", style: this.editorTypeStyle() });
    this.ta = h("textarea", {
      spellcheck: "false", autocorrect: "off", autocapitalize: "off",
      placeholder: LANGS[this.lang].placeholder,
      style: this.editorTypeStyle(),
    });
    this.ta.value = LANGS[this.lang].starter;
    this.code = this.ta.value;

    this.ta.addEventListener("input", () => { this.code = this.ta.value; this.paintCode(); });
    this.ta.addEventListener("scroll", () => this.syncScroll());
    this.ta.addEventListener("keydown", (e) => this.onEditorKey(e));
    ["copy", "cut", "paste", "contextmenu", "drop"].forEach((ev) =>
      this.ta.addEventListener(ev, (e) => {
        e.preventDefault();
        if (ev === "paste") toast("Paste is disabled in the arena.", "err", 2000);
      })
    );

    this.submitBtn = h("button", { class: "btn btn-primary grow", style: { padding: "13px" }, onClick: () => this.submit() },
      "Submit solution ▸");

    const langSel = h("select", {
      class: "input", style: { width: "auto", padding: "5px 8px", fontSize: "11px" },
      onChange: (e) => this.setLanguage(e.target.value),
    }, ...LANG_ORDER.map((k) => h("option", { value: k, selected: k === this.lang }, LANGS[k].label)));

    const editorPanel = h("div", { class: "arena-editor" },
      h("div", { class: "term-bar" },
        h("div", { class: "row gap-3" },
          h("div", { class: "term-dots" },
            h("i", { style: { background: "hsl(0 70% 50% / .7)" } }),
            h("i", { style: { background: "hsl(45 90% 55% / .7)" } }),
            h("i", { style: { background: "hsl(140 60% 50% / .7)" } })),
          h("span", { class: "label" }, `solution.${LANGS[this.lang].ext}`)),
        h("div", { class: "row gap-3" },
          h("span", { class: "row gap-2", style: { fontSize: "10px" } },
            h("span", { class: "kbd" }, "Tab"), h("span", { class: "label" }, "indent")),
          h("button", { class: "btn btn-sm", onClick: () => this.bumpFont(-1) }, "A−"),
          h("button", { class: "btn btn-sm", onClick: () => this.bumpFont(1) }, "A+"),
          langSel)),
      h("div", { class: "editor-wrap" },
        h("div", { class: "scanline-fx" }),
        this.lineNos,
        h("div", { class: "ed-host" }, this.pre, this.ta)),
      h("div", { style: { borderTop: "1px solid var(--border)", padding: "12px", flex: "none" } },
        h("div", { class: "row gap-2" },
          h("button", { class: "btn", onClick: () => this.openReference() }, "Reference"),
          this.submitBtn),
        h("div", { class: "row gap-2 mt-2" },
          this.cfg.mode === "duel"
            ? h("button", { class: "btn grow", onClick: () => this.offerDraw() }, "Offer draw")
            : null,
          h("button", { class: "btn grow", onClick: () => this.resign() }, "Resign"))),
    );

    // Top bar --------------------------------------------------------------
    this.clockEl = h("span", { class: "timer tnum" }, fmtClock(this.timeLeft));
    const bar = h("div", { class: "arena-bar" },
      h("div", { class: "row gap-4" },
        h("span", { class: "logo" }, "Byte", h("span", { class: "accent" }, "Blitz")),
        h("span", { class: "pill" }, this.cfg.title || "Burst")),
      this.cfg.mode === "duel" ? this.versusBlock() : h("div", { class: "row gap-3" },
        h("span", { class: "label label-bright" },
          this.cfg.mode === "training" ? "Training Grounds" : "Unranked · vs the clock"),
      ),
      h("div", { class: "row gap-4" },
        h("span", { class: "dot dot-live" }),
        this.clockEl),
    );

    clear(this.root).append(bar, h("div", { class: "arena-body" }, problemPanel, editorPanel));

    this.paintCode();
    this.applyFont();
    this.ta.focus();
    this.startClock();
    this.engageLockdown();
  }

  versusBlock() {
    const me = this.cfg.me, opp = this.cfg.opponent;
    this.oppStatus = h("span", { class: "label" }, "coding…");
    return h("div", { class: "vs" },
      h("div", { class: "vs-side", style: { alignItems: "flex-end", textAlign: "right" } },
        h("span", { class: "vs-name" }, me.username),
        h("span", { class: "label" }, Math.round(me.rating))),
      h("span", { class: "vs-sep" }, "VS"),
      h("div", { class: "vs-side" },
        h("span", { class: "vs-name" }, opp.username),
        h("span", { class: "label" }, Math.round(opp.rating), " · ", this.oppStatus)),
    );
  }

  setOpponentStatus(text) {
    if (this.oppStatus) this.oppStatus.textContent = text;
  }

  // ── Editor plumbing ───────────────────────────────────────────────────────
  editorTypeStyle() {
    return {
      fontSize: this.fontSize + "px",
      lineHeight: Math.round(this.fontSize * 1.8) + "px",
    };
  }

  applyFont() {
    Object.assign(this.pre.style, this.editorTypeStyle());
    Object.assign(this.ta.style, this.editorTypeStyle());
    this.paintCode();
  }

  bumpFont(d) {
    this.fontSize = Math.max(10, Math.min(22, this.fontSize + d));
    localStorage.setItem(LS_FONT, String(this.fontSize));
    this.applyFont();
  }

  setLanguage(lang) {
    this.lang = lang;
    localStorage.setItem(LS_LANG, lang);
    this.ta.placeholder = LANGS[lang].placeholder;
    if (!this.code.trim()) { this.ta.value = LANGS[lang].starter; this.code = this.ta.value; }
    this.paintCode();
    warmRuntime(lang).catch(() => {});
  }

  paintCode() {
    this.pre.innerHTML = highlight(this.code, this.lang) + "\n";
    const n = Math.max(this.code.split("\n").length, 1);
    if (this.lineNos.childElementCount !== n) {
      clear(this.lineNos);
      const lh = Math.round(this.fontSize * 1.8) + "px";
      for (let i = 1; i <= n; i++) {
        this.lineNos.append(h("div", { style: { fontSize: (this.fontSize - 1) + "px", lineHeight: lh } }, String(i)));
      }
    }
    this.syncScroll();
  }

  syncScroll() {
    this.pre.scrollTop = this.ta.scrollTop;
    this.pre.scrollLeft = this.ta.scrollLeft;
    this.lineNos.scrollTop = this.ta.scrollTop;
  }

  onEditorKey(e) {
    if (e.key === "Backspace" && !e.shiftKey) {
      const ta = this.ta;
      const s = ta.selectionStart, t = ta.selectionEnd, v = ta.value;
      if (s === t) {
        const lineStart = v.lastIndexOf("\n", s - 1) + 1;
        const beforeCaret = v.slice(lineStart, s);
        // When the caret sits immediately after indentation, backspace removes
        // one whole indentation unit: a tab, up to four spaces, or the editor's
        // two-space JavaScript indent. It never makes players erase spaces one by one.
        const unit = beforeCaret.match(/(?:\t| {1,4})$/)?.[0] || "";
        if (unit && /^\s+$/.test(beforeCaret)) {
          e.preventDefault();
          const from = s - unit.length;
          ta.value = v.slice(0, from) + v.slice(s);
          ta.selectionStart = ta.selectionEnd = from;
          this.code = ta.value;
          this.paintCode();
          return;
        }
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = this.ta;
      const s = ta.selectionStart, t = ta.selectionEnd, v = ta.value;
      if (e.shiftKey) {
        const ls = v.lastIndexOf("\n", s - 1) + 1;
        const spaces = (v.slice(ls).match(/^ {1,4}/) || [""])[0];
        if (spaces.length) {
          ta.value = v.slice(0, ls) + v.slice(ls + spaces.length);
          const pos = Math.max(ls, s - spaces.length);
          ta.selectionStart = ta.selectionEnd = pos;
        }
      } else {
        ta.value = v.slice(0, s) + "    " + v.slice(t);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
      this.code = ta.value;
      this.paintCode();
      return;
    }
    // Auto-indent: keep the previous line's leading whitespace, and add a level
    // after a Python block opener.
    if (e.key === "Enter") {
      const ta = this.ta;
      const s = ta.selectionStart, v = ta.value;
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      const line = v.slice(ls, s);
      let indent = (line.match(/^[ \t]*/) || [""])[0];
      if (this.lang === "python" && /:\s*$/.test(line)) indent += "    ";
      if (this.lang === "javascript" && /\{\s*$/.test(line)) indent += "  ";
      if (!indent) return;
      e.preventDefault();
      const ins = "\n" + indent;
      ta.value = v.slice(0, s) + ins + v.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + ins.length;
      this.code = ta.value;
      this.paintCode();
    }
  }

  openReference() {
    const py = this.lang === "python";
    const rows = py ? [
      ["Read one line", "s = input()"], ["Read an int", "n = int(input())"],
      ["Read a list of ints", "a = list(map(int, input().split()))"],
      ["Read N lines", "rows = [input() for _ in range(n)]"],
      ["Read everything", "import sys\ndata = sys.stdin.read().split()"],
      ["Print", "print(x)"], ["Print a list space-separated", "print(*a)"],
      ["Print joined", "\"\".join(map(str, a))"], ["Sort with key", "a.sort(key=lambda x: -x)"],
      ["Counter / defaultdict", "from collections import Counter, defaultdict, deque"],
      ["Heap", "import heapq; heapq.heappush(h, x)"], ["Binary search", "from bisect import bisect_left"],
    ] : [
      ["Read one line", "const s = input();"], ["Read an int", "const n = readInt();"],
      ["Read a list of ints", "const a = readInts();"], ["Read N lines", "const rows = Array.from({length:n}, () => input());"],
      ["Print", "print(x)"], ["Print a list space-separated", "print(a.join(' '))"],
      ["Sort numerically", "a.sort((x, y) => x - y);"], ["Map / Set", "const m = new Map(); const s = new Set();"],
      ["Max of array", "Math.max(...a)"], ["Fill a grid", "Array.from({length:n}, () => new Array(m).fill(0))"], ["Big integers", "BigInt(x)"],
    ];

    if (!this.referenceWindow) {
      this.referenceBody = h("div", { class: "reference-window-body" });
      const close = h("button", { class: "reference-window-close", title: "Close reference", "aria-label": "Close reference", onClick: () => {
        this.referenceWindow.classList.add("hidden");
      } }, "×");
      const handle = h("div", { class: "reference-window-bar" },
        h("div", { class: "row gap-2" }, h("span", { class: "dot" }), h("span", { class: "label label-bright" }, "Reference guide · drag me")), close);
      this.referenceWindow = h("aside", { class: "reference-window", role: "dialog", "aria-label": "Reference guide" }, handle, this.referenceBody);
      this.referenceWindow.style.left = "calc(100vw - min(480px, 100vw - 32px) - 24px)";
      this.referenceWindow.style.top = "92px";
      this.root.append(this.referenceWindow);
      this.makeReferenceDraggable(this.referenceWindow, handle);
    } else {
      this.referenceWindow.classList.remove("hidden");
    }

    clear(this.referenceBody).append(
      h("div", { class: "eyebrow mb-2" }, "// " + LANGS[this.lang].label + " I/O"),
      h("p", { class: "mono mb-4", style: { marginTop: "0", fontSize: "11.5px", color: "var(--muted-fg)", lineHeight: "1.6" } },
        py ? "Input arrives on stdin. Print your answer to stdout — nothing else."
           : "input() returns the next line as a string. print() writes one line to stdout."),
      h("div", { class: "panel divide" }, ...rows.map(([key, value]) => h("div", { style: { padding: "10px 14px" } },
        h("div", { class: "label mb-2" }, key),
        h("pre", { class: "mono", style: { margin: "0", fontSize: "12px", color: "hsl(0 0% 88%)", whiteSpace: "pre-wrap" } }, value)))));
  }

  makeReferenceDraggable(win, handle) {
    let drag = null;
    const onMove = (event) => {
      if (!drag) return;
      const width = win.offsetWidth, height = win.offsetHeight;
      const left = Math.max(8, Math.min(window.innerWidth - width - 8, drag.left + event.clientX - drag.x));
      const top = Math.max(8, Math.min(window.innerHeight - height - 8, drag.top + event.clientY - drag.y));
      win.style.left = left + "px";
      win.style.top = top + "px";
    };
    const onUp = () => { drag = null; };
    const onDown = (event) => {
      if (event.target.closest("button")) return;
      event.preventDefault();
      const rect = win.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    };
    handle.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    this.referenceCleanups.push(() => {
      handle.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    });
  }

  // ── Clock ─────────────────────────────────────────────────────────────────
  startClock() {
    this.startedAt = this.cfg.startAtMs && this.cfg.mode === "duel"
      ? this.cfg.startAtMs
      : Date.now();
    const tick = () => {
      const elapsed = (Date.now() - this.startedAt) / 1000;
      this.timeLeft = Math.max(0, this.timeLimit - elapsed);
      this.clockEl.textContent = fmtClock(this.timeLeft);
      this.clockEl.classList.toggle("warn", this.timeLeft <= 60 && this.timeLeft > 20);
      this.clockEl.classList.toggle("crit", this.timeLeft <= 20);
      if (this.timeLeft <= 0) {
        this.stopClock();
        this.end("timeout", "Time's up.");
      }
    };
    tick();
    this.timer = setInterval(tick, 250);
  }

  stopClock() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  elapsedMs() { return Date.now() - this.startedAt; }

  // ── Lockdown ──────────────────────────────────────────────────────────────
  engageLockdown() {
    const bail = (msg) => {
      if (this.finished || !this.started || this.enteringFs) return;
      // A duel needs a decisive result for the waiting opponent. Solo activity
      // is different: switching focus is not evidence of a failed attempt, so
      // it ends neutrally and does not touch the Unranked rating.
      this.end(this.cfg.mode === "duel" ? "left" : "neutralExit", msg);
    };

    const onFs = () => {
      if (!document.fullscreenElement) bail("You exited fullscreen. Match resigned.");
    };
    const onVis = () => {
      if (document.hidden) bail("You switched away from the page. Match resigned.");
    };
    const onBlur = () => bail("You left the arena window. Match resigned.");
    const onBeforeUnload = (e) => {
      if (this.finished || !this.started) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);
    // Treat hard closes just like visibility changes. Duels forfeit; solo runs
    // settle as neutral exits so no ELO is awarded or lost after a tab switch.
    const onPageHide = () => bail(this.cfg.mode === "duel" ? "Page closed. Match resigned." : "Solo run left.");
    window.addEventListener("pagehide", onPageHide);

    this.cleanups.push(
      () => document.removeEventListener("fullscreenchange", onFs),
      () => document.removeEventListener("visibilitychange", onVis),
      () => window.removeEventListener("blur", onBlur),
      () => window.removeEventListener("beforeunload", onBeforeUnload),
      () => window.removeEventListener("pagehide", onPageHide),
    );
  }

  releaseLockdown() {
    this.cleanups.forEach((fn) => { try { fn(); } catch {} });
    this.cleanups = [];
  }

  // ── Judging ───────────────────────────────────────────────────────────────
  async submit() {
    if (this.submitting || this.finished) return;
    // Read the live textarea value rather than relying on the cached `this.code`.
    const codeNow = (this.ta && this.ta.value) ? this.ta.value : (this.code || "");
    if (!codeNow.trim()) { toast("Write something first.", "err"); return; }

    this.submitting = true;
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = "Running tests…";
    this.resultsWrap.classList.remove("hidden");
    clear(this.resultsHost);

    const rows = this.problem.testCases.map((tc, i) =>
      h("div", { class: "tc running" },
        h("span", {}, tc.hidden ? `Hidden test ${i + 1}` : `Test ${i + 1}`),
        h("span", { class: "row gap-2" }, h("span", { class: "spinner" }), "running"))
    );
    rows.forEach((r) => this.resultsHost.append(r));

    let passed = 0;

    for (let i = 0; i < this.problem.testCases.length; i++) {
      const tc = this.problem.testCases[i];
    // Use the live code captured above so we're always running what the
    // textarea currently contains (protects against any DOM races).
    const res = await runCode(this.lang, codeNow, tc.input, getRunTimeout(this.lang));
      const ok = !res.error && outputMatches(res.output, tc.expected);
      if (ok) passed++;

      const row = rows[i];
      const label = tc.hidden ? `Hidden test ${i + 1}` : `Test ${i + 1}`;
      const verdict = ok ? "PASS ✓" : res.error ? "ERROR" : "FAIL ✗";

      clear(row);
      row.className = "tc " + (ok ? "pass" : "fail");

      // A failing visible test shows what went wrong; hidden tests only ever
      // report the verdict, and a runtime error on a hidden test shows the
      // exception without revealing the input that triggered it.
      const showDetail = !ok && (!tc.hidden || res.error);
      if (showDetail) {
        row.style.display = "block";
        const detail = h("div", { class: "tc-detail mt-2" });
        detail.textContent = res.error
          ? res.error
          : `expected: ${tc.expected}\n     got: ${res.output || "(no output)"}`;
        row.append(
          h("div", { class: "between" }, h("span", {}, label), h("span", {}, verdict)),
          detail
        );
      } else {
        row.style.display = "";
        row.append(h("span", {}, label), h("span", {}, verdict));
      }

      if (this.finished) { this.submitting = false; return; }
    }

    this.bestPassed = Math.max(this.bestPassed, passed);
    this.cfg.onTestProgress?.(this.bestPassed);

    this.submitting = false;
    this.submitBtn.disabled = false;
    this.submitBtn.textContent = "Submit solution ▸";

    if (passed === this.problem.testCases.length) {
      this.end("solved", "All tests passed.");
    } else {
      toast(`${passed}/${this.problem.testCases.length} tests passed.`, "err", 2600);
    }
  }

  // ── Ending ────────────────────────────────────────────────────────────────
  end(reason, message) {
    if (this.finished) return;
    this.finished = true;
    this.stopClock();
    this.releaseLockdown();

    const timeMs = this.elapsedMs();
    const submission = {
      timeMs,
      passed: reason === "solved" ? this.problem.testCases.length : this.bestPassed,
      message,
      code: this.ta?.value ?? this.code ?? "",
      language: this.lang,
    };
    if (reason === "solved") {
      this.cfg.onSolved?.(submission);
    } else {
      this.cfg.onFailed?.({ ...submission, reason });
    }
  }

  async resign() {
    const ok = await confirmModal(
      "Resign",
      this.cfg.mode === "duel"
        ? "Your opponent takes the win and you lose rating. This cannot be undone."
        : "The run ends here and the attempt is recorded as a loss.",
      "Confirm resign"
    );
    if (!ok || this.finished) return;
    this.end("resigned", "You resigned.");
  }

  offerDraw() { this.cfg.onOfferDraw?.(); }

  /** Called by the duel controller when the other player finished first. */
  forceEnd(reason, message) {
    if (this.finished) return;
    this.finished = true;
    this.stopClock();
    this.releaseLockdown();
    this.cfg.onForcedEnd?.({ reason, message, timeMs: this.elapsedMs(), passed: this.bestPassed });
  }

  /** Swap the arena contents for an outcome screen. */
  showResult(node) {
    this.stopClock();
    this.releaseLockdown();
    this.finished = true;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    document.body.style.overflow = "";
    clear(this.root).append(
      h("div", { class: "bg-fx grid-bg" }),
      h("div", { class: "stack", style: { flex: "1", alignItems: "center", justifyContent: "center", padding: "28px", overflowY: "auto", position: "relative", zIndex: "2" } }, node)
    );
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
