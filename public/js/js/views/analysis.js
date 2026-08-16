// ============================================================================
// C3 Code Analysis workspace — private/public code viewing, detailed guidance,
// and a responsive three-pane layout for problem, code, and assistant insights.
// ============================================================================

import { h, clear, emptyState, icon, fmtTime, toast, esc } from "../ui.js";
import { session } from "../session.js";
import { getSavedSolution, getPublicPuzzleSolution, getPublicSolutionShare, saveSolutionAnalysis, setSolutionVisibility } from "../store.js";
import { getDuel, getDuelSubmissionHistory } from "../matchmaking.js";
import { loadAllPools, problemById, outputMatches } from "../problems.js";
import { navigate } from "../router.js";
import { analyzeCode, askCodeCoach, fastCodeAnalysis, improveCode, gradeForScore, metricRating, reviewDecision } from "../analysis-engine.js";
import { runCode, getRunTimeout, warmRuntime, highlight } from "../runner.js";

function setAnalysisMetadata(subject, canonicalPath) {
  const owner = subject.ownerUsername || subject.username || "A ByteBlitz player";
  const title = subject.title || "a coding problem";
  const pageTitle = `Analysis: ${owner}'s solution to ${title} | ByteBlitz`;
  const description = `Explore ${owner}'s submitted code and detailed ByteBlitz analysis for ${title}.`;
  document.title = pageTitle;
  const tags = { description, "og:title": pageTitle, "og:description": description, "og:type": "article", "og:url": `${window.location.origin}${canonicalPath}`, "twitter:card": "summary", "twitter:title": pageTitle, "twitter:description": description };
  Object.entries(tags).forEach(([key, content]) => {
    const social = key.startsWith("og:") || key.startsWith("twitter:");
    const selector = social ? `meta[property="${key}"]` : `meta[name="${key}"]`;
    let meta = document.head.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(social ? "property" : "name", key);
      document.head.append(meta);
    }
    meta.content = content;
  });
}

async function resolveProblem(archetypeId, difficulty = "") {
  const fallback = { archetypeId, title: archetypeId || "Coding problem", difficulty: difficulty || "Practice", description: "Problem details are unavailable for this saved solution." };
  try {
    if (difficulty) {
      const direct = await problemById(difficulty, archetypeId);
      if (direct) return direct;
    }
    const pools = await loadAllPools();
    return Object.values(pools).flat().find((problem) => problem.id === archetypeId || problem.archetypeId === archetypeId) || fallback;
  } catch {
    return fallback;
  }
}

function privateMessage(root) {
  root.append(h("div", { class: "wrap analysis-private-wrap" },
    emptyState("This solution is private. Ask the owner to make it public."),
    h("div", { class: "center mt-4" }, h("button", { class: "btn", onClick: () => navigate("/training") }, "Open Training Grounds"))));
}

function tooltipButton(options) {
  return h("button", {
    class: options.className || "icon-btn analysis-icon-action",
    "data-tooltip": options.tooltip,
    "aria-label": options.tooltip,
    disabled: !!options.disabled,
    onClick: options.onClick,
  }, icon(options.icon, options.size || 15));
}

function textBlock(label, body, className = "") {
  return h("section", { class: "analysis-detail-block " + className },
    h("div", { class: "label mb-2" }, "// " + label),
    h("p", { class: "body-text" }, body || "No details were recorded."));
}

function listBlock(label, items, tone = "") {
  const values = Array.isArray(items) && items.length ? items : ["No observations yet."];
  const rows = values.map((value) => h("li", {}, value));
  return h("section", { class: "analysis-list-panel " + tone },
    h("div", { class: "label mb-3" }, "// " + label),
    h("ul", {}, ...rows));
}

function metricCard(label, value, explanation, best = "", decisionRating = null) {
  const rating = decisionRating || (best ? metricRating(value, best) : null);
  return h("article", { class: `analysis-metric-card${rating ? ` metric-grade-${rating.tier}` : ""}` },
    h("div", { class: "between gap-2" }, h("div", { class: "label" }, label), rating ? h("span", { class: "analysis-metric-grade" }, `${rating.percent}% · ${rating.letter}`) : null),
    h("strong", { class: "mono" }, value || "—"),
    best ? h("span", { class: "analysis-metric-best" }, `Best target: ${best}`) : null,
    h("p", {}, explanation || "The assistant will explain this metric after analysis."));
}

function collapseButton(collapsed, label, onClick) {
  return h("button", { class: "analysis-collapse-btn", "data-tooltip": collapsed ? `Expand ${label}` : `Collapse ${label}`, "aria-label": collapsed ? `Expand ${label}` : `Collapse ${label}`, onClick }, collapsed ? "Expand" : "Collapse");
}

function problemPane(problem, state, rerender) {
  problem = problem || {};
  const sampleParts = [];
  if (problem.sampleInput) sampleParts.push(h("div", { class: "analysis-sample" }, h("span", { class: "label" }, "Sample input"), h("pre", { class: "io-block" }, String(problem.sampleInput))));
  if (problem.sampleOutput) sampleParts.push(h("div", { class: "analysis-sample" }, h("span", { class: "label" }, "Sample output"), h("pre", { class: "io-block" }, String(problem.sampleOutput))));
  const collapsed = !!state.problemCollapsed;
  const details = collapsed ? null : h("div", { class: "analysis-collapsible-content" },
    h("h2", { class: "head mt-3" }, problem.title || "Coding problem"),
    problem.definition ? textBlock("Background", problem.definition) : null,
    textBlock("Task", problem.description),
    problem.constraints ? textBlock("Constraints", Array.isArray(problem.constraints) ? problem.constraints.join("\n") : problem.constraints) : null,
    problem.inputFormat ? textBlock("Input format", problem.inputFormat) : null,
    problem.outputFormat ? textBlock("Output format", problem.outputFormat) : null,
    sampleParts.length ? h("div", { class: "analysis-samples" }, ...sampleParts) : null);
  return h("aside", { class: "analysis-pane analysis-problem-pane" },
    h("div", { class: "analysis-pane-head" }, h("span", { class: "label" }, "// Problem"), h("div", { class: "row gap-2" }, h("span", { class: "pill" }, problem.difficulty || "Practice"), collapseButton(collapsed, "problem", () => { state.problemCollapsed = !collapsed; rerender(); }))),
    details,
    coachPanel(state, rerender));
}

function runnerLanguage(language = "") {
  return /javascript|\bjs\b/i.test(String(language)) ? "javascript" : "python";
}

function syntaxCode(source, language = "") {
  return highlight(String(source || ""), runnerLanguage(language));
}

function normalizeCodeBlock(code) {
  const lines = String(code || "").replace(/^\n+|\n+$/g, "").split("\n");
  const indents = lines.filter((line) => line.trim()).map((line) => (line.match(/^\s*/) || [""])[0].length);
  const commonIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(commonIndent)).join("\n");
}

function materiallyDifferentCode(first, second) {
  return String(first || "").replace(/\s+/g, "") !== String(second || "").replace(/\s+/g, "");
}

function inlineMarkdown(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

function coachProse(text) {
  const blocks = String(text || "").trim().split(/\n\s*\n/).filter(Boolean);
  return blocks.flatMap((block) => {
    const lines = block.split("\n").map((line) => line.trimEnd());
    const bullets = lines.length && lines.every((line) => /^[-*]\s+/.test(line));
    if (bullets) return [h("ul", { class: "analysis-chat-list" }, ...lines.map((line) => h("li", { html: inlineMarkdown(line.replace(/^[-*]\s+/, "")) })))];
    return [h("p", { html: inlineMarkdown(lines.join("\n")).replace(/\n/g, "<br>") })];
  });
}

function coachMessageBody(content, language = "", state, rerender) {
  const source = String(content || "");
  const parts = [];
  const fence = /```([\w+-]*)\s*\n?([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = fence.exec(source))) {
    const prose = source.slice(last, match.index).trim();
    if (prose) parts.push(...coachProse(prose));
    const codeLanguage = match[1] || language;
    const code = normalizeCodeBlock(match[2]);
    const activeKey = state?.activeCodeTab || "mine";
    const currentCode = state?.codeEdits?.[activeKey] ?? (activeKey === "opponent" ? state?.opponent?.code : state?.solution?.code) ?? "";
    if (!materiallyDifferentCode(code, currentCode)) {
      parts.push(h("p", { class: "analysis-coach-unchanged" }, "The coach returned the current code unchanged, so no duplicate snippet was applied."));
      last = fence.lastIndex;
      continue;
    }
    const apply = state?.owner && activeKey === "mine" ? h("button", { class: "btn btn-sm", onClick: () => {
      state.codeEdits = { ...(state.codeEdits || {}), [activeKey]: code };
      state.editorMode = true;
      toast("Coach snippet loaded into the local editor. It has not been saved or submitted.", "ok");
      rerender?.();
    } }, icon("pencil", 13), "Apply to editor") : null;
    parts.push(h("section", { class: "analysis-chat-code-wrap" }, h("div", { class: "analysis-chat-code-head" }, h("span", { class: "label" }, codeLanguage || "code"), apply), h("pre", { class: "analysis-chat-code" }, h("code", { class: `syntax-code language-${codeLanguage || "plain"}`, html: syntaxCode(code, codeLanguage) }))));
    last = fence.lastIndex;
  }
  const tail = source.slice(last).trim();
  if (tail) parts.push(...coachProse(tail));
  return parts.length ? parts : [h("p", {}, "No response was returned.")];
}

async function runSandboxTests(state, activeKey, language, rerender) {
  const code = state.codeEdits?.[activeKey] ?? (activeKey === "opponent" ? state.opponent?.code : state.solution?.code) ?? "";
  const tests = Array.isArray(state.problem?.testCases) ? state.problem.testCases : [];
  if (!tests.length) { state.editorResults = [{ pass: false, error: "No test cases are available for this problem." }]; rerender(); return; }
  state.editorRunning = true;
  state.editorResults = [];
  state.editorRuntimeStatus = "Preparing local sandbox…";
  rerender();
  try {
    const lang = runnerLanguage(language);
    await warmRuntime(lang, (text) => { state.editorRuntimeStatus = text; rerender(); });
    const results = [];
    for (let index = 0; index < tests.length; index++) {
      const test = tests[index];
      const result = await runCode(lang, code, test.input, getRunTimeout(lang));
      results.push({ index: index + 1, hidden: !!test.hidden, pass: !result.error && outputMatches(result.output, test.expected), output: result.output, expected: test.expected, error: result.error || "" });
    }
    state.editorResults = results;
    state.editorRuntimeStatus = "Local sandbox finished. These runs do not affect solves, timing, or saved submissions.";
  } catch (error) {
    state.editorResults = [{ pass: false, error: error.message || "Local test run failed." }];
  } finally { state.editorRunning = false; rerender(); }
}

function codePane(state, rerender) {
  const isDuel = !!state.opponent;
  const activeKey = state.activeCodeTab || "mine";
  const selected = activeKey === "opponent" ? state.opponent : state.solution;
  const submittedCode = String(selected?.code || "");
  const displayCode = state.codeEdits?.[activeKey] ?? submittedCode;
  const tabButtons = [];
  if (isDuel) {
    tabButtons.push(h("button", { class: "analysis-code-tab" + (activeKey === "mine" ? " active" : ""), onClick: () => { state.activeCodeTab = "mine"; rerender(); } }, "Your code"));
    tabButtons.push(h("button", { class: "analysis-code-tab" + (activeKey === "opponent" ? " active" : ""), onClick: () => { state.activeCodeTab = "opponent"; rerender(); } }, "Opponent code"));
  }
  const language = selected?.language || state.solution.language || "python";
  const canEdit = !!state.owner && activeKey === "mine";
  const restore = tooltipButton({ icon: "x", tooltip: "Restore submitted code", onClick: () => { state.codeEdits = { ...(state.codeEdits || {}), [activeKey]: submittedCode }; state.improvements = { ...(state.improvements || {}), [activeKey]: null }; state.improvementStates = { ...(state.improvementStates || {}), [activeKey]: null }; rerender(); } });
  const copy = tooltipButton({ icon: "clipboard", tooltip: "Copy code", onClick: async () => { try { await navigator.clipboard.writeText(state.codeEdits?.[activeKey] ?? submittedCode); toast("Code copied.", "ok"); } catch { toast("Couldn't copy code.", "err"); } } });
  const editor = tooltipButton({ icon: "pencil", tooltip: canEdit ? (state.editorMode ? "Exit local editor" : "Open local editor") : "Only your submitted code can be edited", disabled: !canEdit, onClick: () => { state.editorMode = !state.editorMode; rerender(); } });
  const share = shareControl(state, rerender);
  const improvement = state.improvements?.[activeKey];
  const changeRows = improvement?.steps?.slice(0, state.appliedSteps?.[activeKey] || 0).map((step, index) => h("div", { class: "analysis-code-change" }, h("strong", {}, `${index + 1}. ${step.title}`), h("p", {}, step.explanation))) || [];
  const editorTextarea = h("textarea", { class: "analysis-editor-input", spellcheck: "false", onInput: (event) => {
    state.codeEdits = { ...(state.codeEdits || {}), [activeKey]: event.target.value };
    state.editorResults = [];
    state.editorRuntimeStatus = "Draft changed; run tests again before analyzing.";
    if (state.primaryAnalysisLabel) state.primaryAnalysisLabel.textContent = materiallyDifferentCode(event.target.value, submittedCode) ? "Analyze local edits" : "Refresh analysis";
  } });
  editorTextarea.value = displayCode;
  const results = Array.isArray(state.editorResults) ? state.editorResults : [];
  const passed = results.filter((result) => result.pass).length;
  const resultRows = results.map((result) => h("article", { class: "analysis-editor-result " + (result.pass ? "pass" : "fail") }, h("strong", {}, result.index ? `Test ${result.index}${result.hidden ? " · hidden" : ""}` : "Run status"), h("span", {}, result.pass ? "Passed" : result.error || "Wrong answer"), !result.hidden && !result.pass && result.expected !== undefined ? h("pre", {}, `Expected: ${result.expected}\nReceived: ${result.output || "(empty)"}`) : null));
  const editorPanel = state.editorMode && canEdit ? h("section", { class: "analysis-editor" },
    h("div", { class: "analysis-editor-head" }, h("div", {}, h("div", { class: "label" }, "// Local editor"), h("p", {}, "Edits and test runs stay in this browser. They never affect solve time, completion, or saved submissions. Use the Analysis button to review local edits against the original.")), h("button", { class: "btn btn-sm btn-primary", disabled: state.editorRunning || !displayCode.trim(), onClick: () => runSandboxTests(state, activeKey, language, rerender) }, icon("play", 13), state.editorRunning ? "Running…" : "Run tests")),
    editorTextarea,
    state.editorRuntimeStatus ? h("p", { class: "analysis-editor-status" }, state.editorRuntimeStatus) : null,
    results.length ? h("div", { class: "analysis-editor-results" }, h("div", { class: "label mb-2" }, `// ${passed}/${results.length} tests passed`), ...resultRows) : null) : null;
  const codeView = state.editorMode && canEdit ? editorPanel : h("pre", { class: "solution-code analysis-workspace-code" }, h("code", { class: `syntax-code language-${language}`, html: syntaxCode(displayCode || "// No saved source is available.", language) }));
  return h("main", { class: "analysis-pane analysis-code-pane" },
    h("div", { class: "analysis-code-top" },
      h("div", { class: "analysis-code-tabs" }, ...(tabButtons.length ? tabButtons : [h("span", { class: "label" }, "// Your submitted code")])),
      h("div", { class: "row gap-2 analysis-code-actions" }, h("span", { class: "pill" }, language), copy, editor, share?.button, restore)),
    share?.panel,
    codeView,
    changeRows.length ? h("section", { class: "analysis-code-changes" }, h("div", { class: "label mb-2" }, "// Applied improvements"), ...changeRows) : null);
}

function progressBlock(state) {
  if (!state.running && !state.modelProgress) return null;
  return h("div", { class: "analysis-progress" },
    h("div", { class: "bar" }, h("i", { style: { width: state.running ? "72%" : "100%" } })),
    h("span", { class: "mono" }, state.modelProgress || "Preparing analysis…"));
}

function reportContent(analysis, state) {
  if (!analysis) return h("section", { class: "analysis-empty-report" },
    icon("bulb", 22),
    h("h2", { class: "head" }, "Ready when you are"),
    h("p", { class: "body-text" }, "Start an analysis to see complexity, quality, strategy, and practical next steps for the selected code."));
  const decision = analysis.reviewDecision || reviewDecision(analysis);
  const grade = gradeForScore(decision.score);
  const score = h("section", { class: `analysis-score-card grade-${grade.tier}` },
    h("div", { class: "analysis-score-ring" }, h("strong", {}, grade.letter)),
    h("div", {}, h("div", { class: "label" }, "// Code grade"), h("h2", { class: "head mt-1" }, grade.label), h("p", { class: "body-text mt-2" }, grade.description)));
  const metrics = h("div", { class: "analysis-metrics-grid" },
    metricCard("Time complexity", analysis.timeComplexity, analysis.timeComplexityExplanation, analysis.bestTimeComplexity, decision.time),
    metricCard("Space complexity", analysis.spaceComplexity, analysis.spaceComplexityExplanation, analysis.bestSpaceComplexity, decision.space),
    metricCard("Code quality", analysis.codeQuality, analysis.codeQualityExplanation));
  const localFailures = Array.isArray(analysis.localTestResults) ? analysis.localTestResults.filter((result) => !result.pass) : [];
  const sections = [
    score,
    metrics,
    localFailures.length ? textBlock("Local draft test evidence", `${localFailures.length} local test${localFailures.length === 1 ? "" : "s"} failed for this exact draft. The original submission review is not being used to grade this version.`, "analysis-failure-block") : null,
    textBlock("Your approach", analysis.approach),
    listBlock("Strengths", analysis.strengths, "good"),
    ...(decision.complete ? [textBlock("Review conclusion", "This solution is S tier under the current evidence: it meets the feasible targets and has no unresolved source-level issue. No code change is recommended.", "analysis-complete-block")] : [listBlock("Weaknesses", analysis.weaknesses, "warn"), listBlock("Optimization suggestions", analysis.suggestions, "primary"), textBlock("Why the other approach may be better", analysis.opponentComparison)]),
  ];
  if (state.matchContext?.duelId) {
    sections.push(textBlock("What happened in the match", analysis.matchReview));
    sections.push(textBlock("Failed-test diagnosis", analysis.failureDiagnosis, "analysis-failure-block"));
    sections.push(submissionTimeline(analysis.submissionProgress || state.submissions || []));
  }
  return h("div", { class: "analysis-report" }, ...sections);
}

function submissionTimeline(entries) {
  const rows = Array.isArray(entries) ? entries : [];
  const entriesUi = rows.map((entry, index) => h("article", { class: "analysis-timeline-row" },
    h("span", { class: "analysis-timeline-number" }, String(entry.submission || index + 1).padStart(2, "0")),
    h("div", {}, h("strong", { class: "mono" }, `${entry.testsPassed || 0} tests passed`), h("p", {}, entry.note || "Submission retained for review."))));
  const body = entriesUi.length ? h("div", { class: "analysis-timeline-list" }, ...entriesUi) : h("p", { class: "body-text" }, "No per-submission snapshots were available for this match.");
  return h("section", { class: "analysis-timeline" }, h("div", { class: "label mb-3" }, "// Submission progression"), body);
}

function selectedPayload(state) {
  const key = state.activeCodeTab || "mine";
  const selected = key === "opponent" ? state.opponent : state.solution;
  const originalCode = String(selected?.code || "");
  const displayCode = state.codeEdits?.[key] ?? originalCode;
  const other = key === "opponent" ? state.solution : state.opponent;
  const isLocalEdit = materiallyDifferentCode(displayCode, originalCode);
  const originalAnalysis = state.analyses?.[key] ?? (key === "mine" ? state.analysis : null);
  const localAnalysis = state.localAnalysisSources?.[key] === displayCode ? state.localAnalyses?.[key] || null : null;
  const analysis = isLocalEdit ? localAnalysis : originalAnalysis;
  return { key, selected, originalCode, displayCode, other, isLocalEdit, originalAnalysis, analysis };
}

function coachPanel(state, rerender) {
  const messages = state.coachMessages || [];
  const input = h("textarea", { class: "input analysis-coach-input", placeholder: "Ask about an algorithm, constraint, edge case, or an improvement…", rows: "3" });
  const chatRows = messages.map((message) => h("article", { class: "analysis-chat-message " + message.role }, h("span", { class: "label" }, message.role === "user" ? "You" : "Coach"), ...(message.role === "assistant" ? coachMessageBody(message.content, state.solution?.language, state, rerender) : [h("p", {}, message.content)])));
  const chatLog = chatRows.length ? h("div", { class: "analysis-chat-log mt-4" }, ...chatRows) : null;
  const send = h("button", { class: "btn btn-primary", onClick: async () => {
    const question = input.value.trim();
    if (!question || state.coachBusy) return;
    const payload = selectedPayload(state);
    state.coachBusy = true;
    state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: "Working on it…" }];
    rerender();
    try {
      const reply = await askCodeCoach({ question, analysis: payload.analysis, code: payload.displayCode, originalCode: payload.originalCode, originalAnalysis: payload.originalAnalysis, problem: state.problem, history: messages, opponentCode: payload.other?.code || "", subjectLabel: payload.isLocalEdit ? "your unsaved local edits compared with the original submission" : payload.key === "opponent" ? "opponent code" : "your original submitted code" }, (progress) => { state.modelProgress = progress?.text || "Preparing response…"; rerender(); });
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: reply }];
    } catch (error) {
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: `I couldn't complete that explanation: ${error.message || "please try again"}` }];
    } finally { state.coachBusy = false; state.modelProgress = ""; rerender(); }
  } }, icon("send", 15), "Ask");
  const collapsed = !!state.coachCollapsed;
  return h("section", { class: "analysis-coach" },
    h("div", { class: "between gap-3 wrapflex" }, h("div", {}, h("div", { class: "label" }, "// Ask ByteBlitz Coach"), h("h3", { class: "head mt-1" }, "Learn the next concept")), collapseButton(collapsed, "coach", () => { state.coachCollapsed = !collapsed; rerender(); })),
    collapsed ? null : h("div", { class: "analysis-collapsible-content" },
      h("p", { class: "body-text mt-3" }, "Ask why an approach works, how a constraint changes the algorithm, or how to handle a particular edge case."),
      chatLog,
      h("div", { class: "analysis-coach-compose mt-4" }, input, send)));
}

async function runAnalysis(state, rerender) {
  if (state.running) return;
  const payload = selectedPayload(state);
  if (!String(payload.displayCode || "").trim()) return;
  const subjectLabel = payload.key === "opponent" ? "opponent code" : "your code";
  if (payload.isLocalEdit) {
    await runSandboxTests(state, payload.key, payload.selected?.language || state.solution.language || "python", rerender);
  }
  state.running = true;
  state.modelProgress = "Reading the problem and code…";
  state.analysisError = "";
  rerender();
  try {
    const analyzed = await analyzeCode({ code: payload.displayCode, originalCode: payload.originalCode, language: payload.selected?.language || state.solution.language, problem: state.problem, opponentCode: payload.other?.code || "", submissions: state.submissions, matchContext: state.matchContext, localTestResults: payload.isLocalEdit ? (state.editorResults || []) : [], subjectLabel: payload.isLocalEdit ? "your unsaved local edits compared with the original submission" : subjectLabel }, (progress) => { state.modelProgress = progress?.text || "Analyzing…"; rerender(); });
    if (payload.isLocalEdit) {
      state.localAnalyses = { ...(state.localAnalyses || {}), [payload.key]: analyzed };
      state.localAnalysisSources = { ...(state.localAnalysisSources || {}), [payload.key]: payload.displayCode };
    } else {
      state.analyses = { ...(state.analyses || {}), [payload.key]: analyzed };
      if (payload.key === "mine") state.analysis = analyzed;
      if (state.owner && payload.key === "mine") {
        try { state.analysis = await saveSolutionAnalysis(session.profile, state.solution.archetypeId, analyzed, { source: state.matchContext?.duelId ? "duel" : "training", duelId: state.matchContext?.duelId }); state.analyses.mine = state.analysis; } catch {}
      }
    }
    toast(payload.isLocalEdit ? "Local-edit analysis ready. Your saved original remains unchanged." : "Analysis ready.", "ok");
  } catch (error) {
    state.analysisError = error.message || "Analysis could not start.";
    const baseline = fastCodeAnalysis({ code: payload.displayCode, language: payload.selected?.language, problem: state.problem, opponentCode: payload.other?.code || "", submissions: state.submissions, matchContext: state.matchContext });
    if (payload.isLocalEdit) {
      state.localAnalyses = { ...(state.localAnalyses || {}), [payload.key]: baseline };
      state.localAnalysisSources = { ...(state.localAnalysisSources || {}), [payload.key]: payload.displayCode };
    }
    else {
      state.analyses = { ...(state.analyses || {}), [payload.key]: baseline };
      if (payload.key === "mine") state.analysis = baseline;
    }
    toast(state.analysisError, "err", 5000);
  } finally { state.running = false; state.modelProgress = ""; rerender(); }
}

function analysisPane(state, rerender) {
  const payload = selectedPayload(state);
  const subjectLabel = payload.key === "opponent" ? "opponent code" : "your code";
  const analyzeLabel = h("span", {}, payload.isLocalEdit ? "Analyze local edits" : payload.analysis ? "Refresh analysis" : "Start analysis");
  const analyze = h("button", { class: "btn btn-primary", disabled: state.running || !String(payload.displayCode || "").trim(), onClick: () => runAnalysis(state, rerender) }, icon("bulb", 15), analyzeLabel);
  state.primaryAnalysisLabel = analyzeLabel;
  const improvement = state.improvements?.[payload.key];
  const improvementState = state.improvementStates?.[payload.key];
  const appliedCount = state.appliedSteps?.[payload.key] || 0;
  const topTier = !!payload.analysis && (payload.analysis.reviewDecision || reviewDecision(payload.analysis)).complete;
  const requestImprovement = h("button", { class: "btn", disabled: state.improving || !state.owner || !String(payload.displayCode || "").trim() || topTier, onClick: async () => {
    if (improvement && appliedCount < improvement.steps.length) {
      const next = improvement.steps[appliedCount];
      state.codeEdits = { ...(state.codeEdits || {}), [payload.key]: next.code || payload.displayCode };
      state.appliedSteps = { ...(state.appliedSteps || {}), [payload.key]: appliedCount + 1 };
      toast("Applied the next guided improvement to the code pane.", "ok");
      rerender();
      return;
    }
    state.editorMode = true;
    state.improving = true;
    state.modelProgress = "Reviewing possible improvements…";
    rerender();
    try {
      const prepared = await improveCode({ code: payload.displayCode, language: payload.selected?.language || state.solution.language, problem: state.problem, analysis: payload.analysis, opponentCode: payload.other?.code || "" }, (progress) => { state.modelProgress = progress?.text || "Reviewing possible improvements…"; rerender(); });
      state.improvementStates = { ...(state.improvementStates || {}), [payload.key]: prepared };
      if (prepared.noChange) {
        toast("No distinct rewrite was prepared. Ask the coach for a focused explanation or edit locally to compare your own approach.", "ok");
      } else {
        state.improvements = { ...(state.improvements || {}), [payload.key]: prepared };
        state.appliedSteps = { ...(state.appliedSteps || {}), [payload.key]: 0 };
        toast("Improvement plan ready. Review it, then apply the first change.", "ok");
      }
    } catch (error) { toast(error.message || "Couldn't review improvements.", "err"); }
    finally { state.improving = false; state.modelProgress = ""; rerender(); }
  } }, icon("zap", 15), state.improving ? "Reviewing…" : topTier ? "S tier complete" : improvementState?.noChange ? "No safe rewrite found" : improvement ? appliedCount < improvement.steps.length ? `Apply improvement ${appliedCount + 1}` : "Request another review" : "Request improvements");
  const improvementNote = !topTier && improvementState?.summary && !improvementState.noChange ? h("section", { class: "analysis-improvement-note" }, h("div", { class: "label mb-2" }, "// Improvement plan"), h("p", {}, improvementState.summary), improvement?.steps?.[appliedCount] ? h("p", { class: "analysis-next-step" }, `Next: ${improvement.steps[appliedCount].title} — ${improvement.steps[appliedCount].explanation}`) : null) : null;
  const controls = h("div", { class: "analysis-actions" }, analyze, requestImprovement);
  const error = state.analysisError ? h("div", { class: "analysis-error" }, icon("x", 15), h("span", {}, state.analysisError)) : null;
  return h("aside", { class: "analysis-pane analysis-insights-pane" },
    h("div", { class: "analysis-pane-head" }, h("span", { class: "label" }, payload.isLocalEdit ? "// Local edits vs original" : "// Analysis"), h("span", { class: "label" }, subjectLabel)),
    controls,
    progressBlock(state),
    error,
    improvementNote,
    reportContent(payload.analysis, state));
}

function shareControl(state, rerender) {
  const solution = state.solution || {};
  const sharePath = state.solution?.publicShareId ? `/share/${encodeURIComponent(state.solution.publicShareId)}` : state.sharePath;
  if (!state.owner && !state.publicView) return null;
  const button = tooltipButton({ icon: "share", tooltip: state.publicView ? "Copy public analysis link" : "Share and privacy settings", onClick: async () => {
    if (state.publicView && sharePath) {
      const url = `${window.location.origin}${sharePath}`;
      try { await navigator.clipboard.writeText(url); toast("Public link copied.", "ok"); } catch { prompt("Copy public link:", url); }
      return;
    }
    state.shareOpen = !state.shareOpen;
    rerender();
  } });
  if (state.publicView || !state.shareOpen) return { button, panel: null };
  const visibility = h("label", { class: "solution-visibility-switch compact", "data-tooltip": solution.completed ? "Make code and analysis public" : "Complete the solution before sharing" },
    h("input", { type: "checkbox", checked: !!solution.isPublic, disabled: !solution.completed }),
    h("span", { class: "solution-switch-ui" }),
    h("span", { class: "label" }, solution.isPublic ? "Public" : "Private"));
  const toggle = visibility.querySelector("input");
  toggle?.addEventListener("change", async () => {
    toggle.disabled = true;
    try {
      const updated = await setSolutionVisibility(session.profile, solution.archetypeId, toggle.checked);
      state.solution = { ...state.solution, ...updated };
      state.sharePath = updated.publicShareId ? `/share/${encodeURIComponent(updated.publicShareId)}` : null;
      toast(state.solution.isPublic ? "Public code and analysis link ready." : "Solution is private again.", "ok");
      rerender();
    } catch (error) {
      toggle.checked = !toggle.checked;
      toast(error.message || "Couldn't update visibility.", "err");
    } finally { toggle.disabled = !state.solution.completed; }
  });
  const publicPath = state.solution?.publicShareId ? `/share/${encodeURIComponent(state.solution.publicShareId)}` : state.sharePath;
  const link = publicPath && state.solution?.isPublic
    ? h("div", { class: "analysis-share-link" }, h("span", { class: "label" }, "Public code + analysis link"), h("a", { href: publicPath, target: "_blank", rel: "noopener", class: "solution-share-link" }, `${window.location.origin}${publicPath}`))
    : null;
  const privateHint = link ? null : h("p", { class: "analysis-share-private" }, solution.completed ? "Private. Turn on public sharing to create a link." : "Complete this solution before a public link can be created.");
  return { button, panel: h("section", { class: "analysis-share-popover" }, visibility, link, privateHint) };
}

function defaultPaneSizes() {
  const viewport = typeof window === "undefined" ? 1600 : window.innerWidth;
  const side = Math.min(520, Math.max(220, Math.floor((viewport - 358) / 2)));
  return { problem: side, analysis: side };
}

function paneGridColumns(state) {
  const sizes = state.paneSizes || defaultPaneSizes();
  return `${sizes.problem}px 9px minmax(340px, 1fr) 9px ${sizes.analysis}px`;
}

function paneResizer(side, state, grid, rerender) {
  return h("div", { class: "analysis-pane-resizer", role: "separator", tabindex: "0", "aria-orientation": "vertical", "aria-label": `Resize ${side} pane`, onPointerdown: (event) => {
    if (window.innerWidth <= 880) return;
    event.preventDefault();
    const sizes = state.paneSizes || defaultPaneSizes();
    const initial = side === "problem" ? sizes.problem : sizes.analysis;
    const startX = event.clientX;
    const adjust = (move) => {
      const delta = move.clientX - startX;
      const next = side === "problem" ? initial + delta : initial - delta;
      state.paneSizes = { ...sizes, [side]: Math.max(side === "problem" ? 220 : 260, Math.min(side === "problem" ? 520 : 520, next)) };
      grid.style.gridTemplateColumns = paneGridColumns(state);
    };
    const finish = () => {
      window.removeEventListener("pointermove", adjust);
      window.removeEventListener("pointerup", finish);
      rerender();
    };
    window.addEventListener("pointermove", adjust);
    window.addEventListener("pointerup", finish, { once: true });
  } });
}

function renderWorkspace(root, state) {
  state.solution = state.solution || {};
  state.problem = state.problem || { archetypeId: state.solution.archetypeId, title: state.solution.title || "Coding problem", description: "Problem details are unavailable for this saved solution." };
  state.paneSizes = state.paneSizes || defaultPaneSizes();
  clear(root);
  const page = h("div", { class: "analysis-workspace" });
  root.append(page);
  const rerender = () => renderWorkspace(root, state);
  const body = h("div", { class: "analysis-workspace-grid", style: { gridTemplateColumns: paneGridColumns(state) } });
  body.append(problemPane(state.problem, state, rerender), paneResizer("problem", state, body, rerender), codePane(state, rerender), paneResizer("analysis", state, body, rerender), analysisPane(state, rerender));
  page.append(body);
  if (state.autoAnalyze && !state.autoAnalyzeStarted) {
    state.autoAnalyzeStarted = true;
    setTimeout(() => runAnalysis(state, rerender), 0);
  }
}

export async function renderPrivateAnalysis(params, root) {
  const profile = session.profile;
  if (!profile || profile.isGuest || profile.isAnonymous) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("Sign in to analyze your private code."))); return; }
  if (profile.uid !== params.uid) {
    const share = await getPublicPuzzleSolution(params.uid, params.archetypeId).catch(() => null);
    if (!share) { privateMessage(root); return; }
    const problem = await resolveProblem(share.archetypeId, share.difficulty);
    setAnalysisMetadata(share, `/share/${encodeURIComponent(share.id)}`);
    renderWorkspace(root, { owner: false, publicView: true, sharePath: `/share/${encodeURIComponent(share.id)}`, solution: share, problem, analysis: share.analysis || null, analyses: { mine: share.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
    return;
  }
  const solution = await getSavedSolution(profile.uid, params.archetypeId).catch(() => null);
  if (!solution) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("No saved code is available for this analysis."))); return; }
  const problem = await resolveProblem(solution.archetypeId, solution.difficulty);
  renderWorkspace(root, { owner: true, publicView: false, autoAnalyze: params.query?.auto === "1", sharePath: solution.publicShareId ? `/share/${encodeURIComponent(solution.publicShareId)}` : null, solution, problem, analysis: solution.analysis || null, analyses: { mine: solution.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
}

export async function renderPublicAnalysis(params, root) {
  const share = await getPublicSolutionShare(params.id).catch(() => null);
  if (!share) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("This solution link is unavailable or has been removed."))); return; }
  const problem = await resolveProblem(share.archetypeId, share.difficulty);
  setAnalysisMetadata(share, `/share/${encodeURIComponent(params.id)}`);
  renderWorkspace(root, { owner: false, publicView: true, sharePath: `/share/${encodeURIComponent(share.id)}`, solution: share, problem, analysis: share.analysis || null, analyses: { mine: share.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
}

export async function renderDuelAnalysis(params, root) {
  const profile = session.profile;
  if (!profile || profile.isGuest || profile.isAnonymous) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("Sign in to access post-match analysis."))); return; }
  const duel = await getDuel(params.id).catch(() => null);
  if (!duel || (duel.player1?.uid !== profile.uid && duel.player2?.uid !== profile.uid)) { privateMessage(root); return; }
  const mineIsP1 = duel.player1.uid === profile.uid;
  const ownSubmission = mineIsP1 ? duel.p1Submission : duel.p2Submission;
  const opponentSubmission = mineIsP1 ? duel.p2Submission : duel.p1Submission;
  const compactHistory = mineIsP1 ? duel.p1SubmissionHistory : duel.p2SubmissionHistory;
  const duelProblem = await resolveProblemFromDuel(duel);
  const problem = await resolveProblem(duelProblem.archetypeId, duelProblem.difficulty || duel.difficulty);
  const saved = await getSavedSolution(profile.uid, problem.archetypeId).catch(() => null);
  const fullHistory = await getDuelSubmissionHistory(duel.id, profile.uid).catch(() => []);
  const solution = { ...(saved || {}), ...(ownSubmission || {}), archetypeId: problem.archetypeId, title: problem.title, difficulty: problem.difficulty, lastMode: "ranked" };
  const matchContext = { duelId: duel.id, mode: duel.mode, lost: duel.winner && duel.winner !== profile.uid, winBy: duel.winBy };
  const existingAnalysis = saved?.analysis?.context?.duelId === duel.id ? saved.analysis : null;
  const submissions = fullHistory.length ? fullHistory : (Array.isArray(compactHistory) ? compactHistory : []);
  renderWorkspace(root, { owner: true, publicView: false, solution, opponent: opponentSubmission || null, problem, analysis: existingAnalysis, analyses: { mine: existingAnalysis, opponent: null }, submissions, matchContext, coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {}, activeCodeTab: "mine" });
}

async function resolveProblemFromDuel(duel) {
  try {
    const { problemForSeed } = await import("../problems.js");
    return await problemForSeed(duel.difficulty, duel.problemSeed);
  } catch {
    return { archetypeId: duel.id, title: "Match problem", difficulty: duel.difficulty, description: "" };
  }
}
