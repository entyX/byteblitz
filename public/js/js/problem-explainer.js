import { h, modal } from "./ui.js";

const TERM_GUIDES = [
  {
    match: /contiguous subarray|subarray/i,
    term: "Contiguous subarray",
    meaning: "One uninterrupted slice of the array. Choose a start and end position, then include every value between them; you may not skip a value in the middle.",
  },
  {
    match: /subsequence/i,
    term: "Subsequence",
    meaning: "A selection of values that keeps their original left-to-right order, but may skip values between selected positions.",
  },
  {
    match: /1-based|1-indexed/i,
    term: "1-based positions",
    meaning: "The first item has position 1, the second has position 2, and so on. This differs from many programming languages, which often start array indices at 0.",
  },
  {
    match: /0-based|0-indexed/i,
    term: "0-based positions",
    meaning: "The first item has position 0, the second has position 1, and so on.",
  },
  {
    match: /half-open interval|\[start, end\)/i,
    term: "Half-open interval [start, end)",
    meaning: "The start time is included but the end time is not. A meeting ending at time 5 does not overlap one starting exactly at time 5.",
  },
  {
    match: /undirected graph/i,
    term: "Undirected graph",
    meaning: "Every edge can be travelled in both directions. An edge u v connects u to v and v to u.",
  },
  {
    match: /directed graph/i,
    term: "Directed graph",
    meaning: "Each edge has a direction. An edge u v allows travel from u to v, but not automatically from v to u.",
  },
  {
    match: /binary grid|grid/i,
    term: "Grid movement",
    meaning: "Grid coordinates identify rows and columns. Unless the statement says otherwise, cells connect only up, down, left, and right—not diagonally.",
  },
  {
    match: /prefix sum|sum exactly/i,
    term: "Prefix sum",
    meaning: "A prefix sum is the running total from the beginning through a position. Comparing two running totals lets you reason about the sum of the values between those positions.",
  },
  {
    match: /strictly increasing/i,
    term: "Strictly increasing",
    meaning: "Every next selected value must be larger than the previous one. Equal neighboring selected values are not allowed.",
  },
  {
    match: /diameter/i,
    term: "Tree diameter",
    meaning: "The diameter is the longest simple route between any two vertices, measured here by number of edges.",
  },
];

function clean(value) { return String(value ?? "").trim(); }

function plainGoal(problem) {
  const text = clean(problem.description);
  if (/contiguous subarray.*sum exactly/i.test(text)) return "Look at every possible uninterrupted segment of the sequence and count only the segments whose total equals T.";
  if (/pairs? .*sum.*T|sum to T/i.test(text)) return "Treat positions as distinct. Your goal is to count every valid pair of positions whose two values add to the requested target.";
  if (/distinct.*window/i.test(text)) return "Compare every block of the requested fixed length and report the largest number of different values found in one block.";
  if (/islands?/i.test(text)) return "Group touching land cells together. Each separate group counts once, even if it contains many cells.";
  if (/shortest path|minimum number of moves/i.test(text)) return "Find the smallest total cost or number of moves needed to reach the destination while obeying the allowed connections.";
  if (/knapsack|capacity/i.test(text)) return "Choose a combination of items that stays within the capacity limit while maximizing the total value.";
  if (/edit distance/i.test(text)) return "Measure how many single-character changes are needed to turn the first word into the second.";
  return text || "Read the input, apply the stated rule to the required objects, and print exactly the requested result.";
}

function termsFor(problem) {
  const source = [problem.title, problem.definition, problem.description, problem.inputFormat, problem.explanation].map(clean).join("\n");
  const found = TERM_GUIDES.filter((guide) => guide.match.test(source));
  return found.length ? found : [{ term: "Input and output", meaning: "Read the input exactly in the stated order. Your program should print only the requested result, with no labels or extra commentary." }];
}

function strategyFor(problem) {
  const authoredExplanation = clean(problem.explanation);
  if (authoredExplanation) return authoredExplanation;
  const constraints = Array.isArray(problem.constraints) ? problem.constraints.join(" ") : "";
  if (/200,?000|10\^5|10\^6/i.test(constraints)) return "The input can be large, so first identify whether repeated scanning would be too slow. Aim to process each value or edge only a small number of times.";
  return "Before coding, identify the objects being counted or compared, decide what information must be remembered while reading the input, and check edge cases described in the statement.";
}

export function openProblemExplainer(problem) {
  const p = problem || {};
  const terms = termsFor(p);
  const modalBody = h("div", { class: "problem-explainer" },
    h("div", { class: "eyebrow mb-2" }, "// AI Explain · no code"),
    h("h2", { class: "head mb-3" }, p.title || "Problem explanation"),
    h("p", { class: "body-text mb-5", style: { lineHeight: "1.7" } }, "This guide explains the wording and intended reasoning without showing code, pseudocode, or a finished implementation."),
    h("div", { class: "panel panel-pad" },
      h("div", { class: "label mb-2" }, "// What the task means"),
      h("p", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.75", margin: "0" } }, plainGoal(p))),
    h("div", { class: "mt-5" },
      h("div", { class: "label mb-2" }, "// Terms in plain English"),
      ...terms.map((guide) => h("div", { class: "panel panel-pad mb-3" },
        h("h3", { class: "mono", style: { fontSize: "13px", margin: "0 0 8px" } }, guide.term),
        h("p", { class: "mono", style: { fontSize: "12px", lineHeight: "1.7", color: "var(--muted-fg)", margin: "0" } }, guide.meaning)))),
    h("div", { class: "mt-5" },
      h("div", { class: "label mb-2" }, "// How to think about it"),
      h("p", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.75", margin: "0" } }, strategyFor(p))),
    h("p", { class: "label mt-5", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.6" } }, "No code, pseudocode, or code examples are included in this explanation."),
  );
  return modal(modalBody, { wide: true });
}
