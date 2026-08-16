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

function teachingFor(problem) {
  const text = [problem.title, problem.definition, problem.description, problem.inputFormat, problem.explanation].map(clean).join(" ").toLowerCase();
  if (/contiguous subarray.*sum exactly|exact-sum segment/.test(text)) return {
    observation: "The same ending position can complete more than one valid segment. The useful question is not “which segment do I try next?” but “how many earlier running totals would make the current total end at T?”",
    steps: ["As you move left to right, keep track of the total of all values seen so far.", "At each position, ask which earlier running total would leave exactly T between that earlier position and the current one.", "Count every earlier occurrence of that needed total, then record the current running total for later positions."],
    pitfall: "Do not use the usual two-pointer or shrinking-window trick when negative values are allowed. Adding a negative value can decrease the sum, so the window no longer moves predictably.",
  };
  if (/pair.*sum|target pairs?/.test(text)) return {
    observation: "Each value needs a partner equal to target minus that value. Repeated values matter because different positions create different valid pairs.",
    steps: ["Process the sequence from left to right.", "For the current value, determine the one partner value that would reach the target.", "Count how many such partners have already appeared, then remember the current value for later positions."],
    pitfall: "Do not count a value as pairing with itself unless an earlier copy at a different position has already appeared.",
  };
  if (/balanced.*binary|same number of zeros and ones/.test(text)) return {
    observation: "Replace the two kinds of values with opposite effects. A segment is balanced exactly when its transformed total returns to a running total seen earlier.",
    steps: ["Treat one kind of value as adding one and the other as subtracting one.", "Track the first position where each running total occurs.", "Whenever the same running total reappears, the values between those positions cancel out; compare that length with the best so far."],
    pitfall: "Remember the starting running total before reading any values. That is what allows a balanced segment beginning at the first position to be counted.",
  };
  if (/window.*distinct|most diverse window/.test(text)) return {
    observation: "Adjacent fixed-length windows overlap heavily, so rebuilding the answer from scratch wastes work. Only one value enters and one value leaves when the window shifts.",
    steps: ["Track how many times each value appears in the current window.", "When the window moves, remove the outgoing value and add the incoming one.", "Keep the number of values whose count is still positive, and remember the largest number seen."],
    pitfall: "A value is no longer distinct in the window only when its count becomes zero, not merely when one copy leaves.",
  };
  if (/interval|meeting rooms|half-open/.test(text)) return {
    observation: "The answer is the largest number of intervals active at the same moment. You do not need to assign actual room numbers to find it.",
    steps: ["Put every start and end on one timeline.", "Process an ending before a start at the same time when the interval is [start, end).", "Track the active count and retain its maximum."],
    pitfall: "Treating an end and a start at the same time as overlapping produces one unnecessary room.",
  };
  if (/islands?|grid/.test(text)) return {
    observation: "Once one land cell is discovered, every connected land cell belongs to the same island and must not be counted again.",
    steps: ["Scan the grid for an unvisited land cell.", "From that cell, visit every land neighbor reachable through shared sides.", "Mark those cells visited, then continue scanning; each new search represents one island."],
    pitfall: "Unless the statement explicitly allows it, diagonal contact does not connect two islands.",
  };
  if (/shortest path|minimum number of moves/.test(text)) return {
    observation: "When every permitted move costs the same amount, exploring all positions one move away before positions two moves away guarantees the first route found is shortest.",
    steps: ["Begin from the starting position and mark it visited.", "Explore all valid neighboring positions in layers of equal distance.", "Stop when the destination is first reached, or report failure if no new reachable position remains."],
    pitfall: "Mark a position when it is discovered, not after it is removed later, so it is not added repeatedly.",
  };
  if (/knapsack|capacity/.test(text)) return {
    observation: "Choosing the locally best-value item can block a better combination. Think in terms of the best value possible for every smaller capacity.",
    steps: ["For each capacity, represent the best total value achievable within that limit.", "Consider each item as either excluded or included if it fits.", "Update capacities in the direction that prevents the same item from being used more than once."],
    pitfall: "Updating capacities in the wrong direction silently turns a one-use item into an unlimited-use item.",
  };
  if (/strictly increasing|longest.*subsequence/.test(text)) return {
    observation: "A subsequence may skip values, so it is not the same as an uninterrupted segment. Preserve the smallest possible ending value for each attainable length.",
    steps: ["Read values in order and decide which existing length the new value can extend.", "For each length, prefer the smallest ending value because it leaves more room for future growth.", "The number of achievable lengths at the end is the answer."],
    pitfall: "Equal values do not extend a strictly increasing sequence.",
  };
  const constraints = Array.isArray(problem.constraints) ? problem.constraints.join(" ") : "";
  return {
    observation: /200,?000|10\^5|10\^6/i.test(constraints) ? "The constraints are the main clue: repeated work over the same values is likely too slow, so look for information you can carry forward in one pass or near-linear passes." : "Separate the exact object the problem asks you to count, find, or optimize from the wording around it.",
    steps: ["Restate the required output in your own words before choosing an approach.", "List the smallest pieces of information that must be remembered while processing the input.", "Test your reasoning on boundary cases such as an empty-looking result, repeated values, and the first or last position."],
    pitfall: "Do not begin by translating every sentence directly into code. First identify the invariant or quantity that must stay correct throughout the process.",
  };
}

export function openProblemExplainer(problem) {
  const p = problem || {};
  const terms = termsFor(p);
  const teaching = teachingFor(p);
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
      h("div", { class: "label mb-2" }, "// Key observation"),
      h("div", { class: "panel panel-pad" }, h("p", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.75", margin: "0" } }, teaching.observation))),
    h("div", { class: "mt-5" },
      h("div", { class: "label mb-2" }, "// Reasoning path"),
      h("ol", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.8", paddingLeft: "20px", margin: "0" } }, ...teaching.steps.map((step) => h("li", { class: "mb-2" }, step)))),
    h("div", { class: "mt-5" },
      h("div", { class: "label mb-2" }, "// Common trap"),
      h("div", { class: "panel panel-pad", style: { borderLeft: "2px solid var(--warn)" } }, h("p", { class: "mono", style: { fontSize: "12px", lineHeight: "1.7", margin: "0" } }, teaching.pitfall))),
    h("div", { class: "mt-5" },
      h("div", { class: "label mb-2" }, "// Complexity clue"),
      h("p", { class: "mono", style: { fontSize: "12.5px", lineHeight: "1.75", margin: "0" } }, strategyFor(p))),
    h("p", { class: "label mt-5", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.6" } }, "No code, pseudocode, code examples, or finished implementation are included in this explanation."),
  );
  return modal(modalBody, { wide: true });
}
