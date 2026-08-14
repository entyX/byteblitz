// Sandboxed JavaScript execution worker.
//
// Runs one submission against one stdin payload and posts back {output, error}.
// The worker is terminated by the host on timeout, which is what stops infinite
// loops — nothing inside the worker can hang the page.

self.onmessage = (e) => {
  const { code, stdin } = e.data;

  const lines = String(stdin ?? "").replace(/\r\n/g, "\n").split("\n");
  let ptr = 0;
  const out = [];

  const input = () => (ptr < lines.length ? lines[ptr++] : "");
  const readline = input;
  const readInts = () => input().trim().split(/\s+/).filter(Boolean).map(Number);
  const readInt = () => Number(input().trim());
  const print = (...args) => { out.push(args.map(fmt).join(" ")); };

  function fmt(v) {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.join(" ");
    if (v === null || v === undefined) return String(v);
    if (typeof v === "object") { try { return JSON.stringify(v); } catch { return String(v); } }
    return String(v);
  }

  const sandboxConsole = {
    log: print, info: print, warn: print, debug: print,
    error: (...a) => print(...a),
  };

  try {
    // Shadow the worker globals a submission has no business touching.
    const fn = new Function(
      "input", "readline", "readInt", "readInts", "print", "console",
      "self", "postMessage", "importScripts", "fetch", "XMLHttpRequest",
      '"use strict";\n' + code
    );
    fn(input, readline, readInt, readInts, print, sandboxConsole,
       undefined, undefined, undefined, undefined, undefined);

    self.postMessage({ output: out.join("\n").replace(/\s+$/, ""), error: null });
  } catch (err) {
    const name = (err && err.name) || "Error";
    const msg = (err && err.message) || String(err);
    self.postMessage({
      output: out.join("\n").replace(/\s+$/, ""),
      error: `${name}: ${msg}`,
    });
  }
};
