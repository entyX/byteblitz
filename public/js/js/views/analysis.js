// ============================================================================
// C3 Code Analysis workspace — private/public code viewing, detailed guidance,
// and a responsive three-pane layout for problem, code, and assistant insights.
// ============================================================================

import { h, clear, emptyState, icon, fmtTime, toast } from "../ui.js";
import { session } from "../session.js";
import { getSavedSolution, getPublicPuzzleSolution, getPublicSolutionShare, saveSolutionAnalysis } from "../store.js";
import { getDuel, getDuelSubmissionHistory } from "../matchmaking.js";
import { loadPool, problemById } from "../problems.js";
import { navigate } from "../router.js";
import { analyzeCode, askCodeCoach, fastCodeAnalysis, improveCode } from "../analysis-engine.js";

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

async function resolveProblem(archetypeId) {
  try {
    await loadPool();
    return problemById(archetypeId) || { archetypeId, title: archetypeId, description: "" };
  } catch {
    return { archetypeId, title: archetypeId, description: "" };
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

function metricCard(label, value, explanation) {
  return h("article", { class: "analysis-metric-card" },
    h("div", { class: "label" }, label),
    h("strong", { class: "mono" }, value || "—"),
    h("p", {}, explanation || "The assistant will explain this metric after analysis."));
}

function problemPane(problem, state, rerender) {
  const sampleParts = [];
  if (problem.sampleInput) sampleParts.push(h("div", { class: "analysis-sample" }, h("span", { class: "label" }, "Sample input"), h("pre", { class: "io-block" }, String(problem.sampleInput))));
  if (problem.sampleOutput) sampleParts.push(h("div", { class: "analysis-sample" }, h("span", { class: "label" }, "Sample output"), h("pre", { class: "io-block" }, String(problem.sampleOutput))));
  return h("aside", { class: "analysis-pane analysis-problem-pane" },
    h("div", { class: "analysis-pane-head" }, h("span", { class: "label" }, "// Problem"), h("span", { class: "pill" }, problem.difficulty || "Practice")),
    h("h2", { class: "head mt-3" }, problem.title || "Coding problem"),
    problem.definition ? textBlock("Background", problem.definition) : null,
    textBlock("Task", problem.description),
    problem.constraints ? textBlock("Constraints", Array.isArray(problem.constraints) ? problem.constraints.join("\n") : problem.constraints) : null,
    problem.inputFormat ? textBlock("Input format", problem.inputFormat) : null,
    problem.outputFormat ? textBlock("Output format", problem.outputFormat) : null,
    sampleParts.length ? h("div", { class: "analysis-samples" }, ...sampleParts) : null,
    coachPanel(state, rerender));
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
  const restore = tooltipButton({ icon: "x", tooltip: "Restore submitted code", disabled: displayCode === submittedCode, onClick: () => { state.codeEdits = { ...(state.codeEdits || {}), [activeKey]: submittedCode }; state.improvements = { ...(state.improvements || {}), [activeKey]: null }; rerender(); } });
  const copy = tooltipButton({ icon: "pencil", tooltip: "Copy code to clipboard", onClick: async () => { try { await navigator.clipboard.writeText(displayCode); toast("Code copied.", "ok"); } catch { toast("Couldn't copy code.", "err"); } } });
  const improvement = state.improvements?.[activeKey];
  const changeRows = improvement?.steps?.slice(0, state.appliedSteps?.[activeKey] || 0).map((step, index) => h("div", { class: "analysis-code-change" }, h("strong", {}, `${index + 1}. ${step.title}`), h("p", {}, step.explanation))) || [];
  return h("main", { class: "analysis-pane analysis-code-pane" },
    h("div", { class: "analysis-code-top" },
      h("div", { class: "analysis-code-tabs" }, ...(tabButtons.length ? tabButtons : [h("span", { class: "label" }, "// Your submitted code")])),
      h("div", { class: "row gap-2" }, h("span", { class: "pill" }, selected?.language || state.solution.language || "code"), copy, restore)),
    h("pre", { class: "solution-code analysis-workspace-code" }, displayCode || "// No saved source is available."),
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
  const score = h("section", { class: "analysis-score-card" },
    h("div", { class: "analysis-score-ring" }, h("strong", {}, String(analysis.efficiencyScore ?? "—")), h("span", {}, "/100")),
    h("div", {}, h("div", { class: "label" }, "// Efficiency score"), h("h2", { class: "head mt-1" }, analysis.efficiencyScore >= 80 ? "Strong foundation" : analysis.efficiencyScore >= 60 ? "Solid, with room to improve" : "A useful first pass"), h("p", { class: "body-text mt-2" }, "This score combines algorithmic efficiency, correctness signals, readability, and fit with the problem constraints.")));
  const metrics = h("div", { class: "analysis-metrics-grid" },
    metricCard("Time complexity", analysis.timeComplexity, analysis.timeComplexityExplanation),
    metricCard("Space complexity", analysis.spaceComplexity, analysis.spaceComplexityExplanation),
    metricCard("Code quality", analysis.codeQuality, analysis.codeQualityExplanation));
  const sections = [
    score,
    metrics,
    textBlock("Your approach", analysis.approach),
    listBlock("Strengths", analysis.strengths, "good"),
    listBlock("Weaknesses", analysis.weaknesses, "warn"),
    listBlock("Optimization suggestions", analysis.suggestions, "primary"),
    textBlock("Why the other approach may be better", analysis.opponentComparison),
  ];
  if (state.matchContext?.duelId) {
    sections.push(textBlock("What happened in the match", analysis.matchReview));
    sections.push(textBlock("Failed-test diagnosis", analysis.failureDiagnosis, "analysis-failure-block"));
    sections.push(submissionTimeline(analysis.submissionProgress || state.submissions || []));
  }
  if (analysis.codeReferences?.length) sections.push(listBlock("Specific code references", analysis.codeReferences, "primary"));
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
  const displayCode = state.codeEdits?.[key] ?? selected?.code ?? "";
  const other = key === "opponent" ? state.solution : state.opponent;
  const analysis = state.analyses?.[key] ?? (key === "mine" ? state.analysis : null);
  return { key, selected, displayCode, other, analysis };
}

function coachPanel(state, rerender) {
  const messages = state.coachMessages || [];
  const input = h("textarea", { class: "input analysis-coach-input", placeholder: "Ask about an algorithm, constraint, edge case, or an improvement…", rows: "3" });
  const chatRows = messages.map((message) => h("article", { class: "analysis-chat-message " + message.role }, h("span", { class: "label" }, message.role === "user" ? "You" : "Coach"), h("p", {}, message.content)));
  const chatLog = chatRows.length ? h("div", { class: "analysis-chat-log mt-4" }, ...chatRows) : null;
  const send = h("button", { class: "btn btn-primary", onClick: async () => {
    const question = input.value.trim();
    if (!question || state.coachBusy) return;
    const payload = selectedPayload(state);
    state.coachBusy = true;
    state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: "Working on it…" }];
    rerender();
    try {
      const reply = await askCodeCoach({ question, analysis: payload.analysis, code: payload.displayCode, problem: state.problem, history: messages, opponentCode: payload.other?.code || "", subjectLabel: payload.key === "opponent" ? "opponent code" : "your code" }, (progress) => { state.modelProgress = progress?.text || "Preparing response…"; rerender(); });
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: reply }];
    } catch (error) {
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: `I couldn't complete that explanation: ${error.message || "please try again"}` }];
    } finally { state.coachBusy = false; state.modelProgress = ""; rerender(); }
  } }, icon("send", 15), "Ask");
  return h("section", { class: "analysis-coach" },
    h("div", { class: "between gap-3 wrapflex" }, h("div", {}, h("div", { class: "label" }, "// Ask ByteBlitz Coach"), h("h3", { class: "head mt-1" }, "Learn the next concept"))),
    h("p", { class: "body-text mt-3" }, "Ask why an approach works, how a constraint changes the algorithm, or how to handle a particular edge case."),
    chatLog,
    h("div", { class: "analysis-coach-compose mt-4" }, input, send));
}

function analysisPane(state, rerender) {
  const payload = selectedPayload(state);
  const subjectLabel = payload.key === "opponent" ? "opponent code" : "your code";
  const analyze = h("button", { class: "btn btn-primary", disabled: state.running || !String(payload.displayCode || "").trim(), onClick: async () => {
    state.running = true;
    state.modelProgress = "Reading the problem and code…";
    state.analysisError = "";
    rerender();
    try {
      const analyzed = await analyzeCode({ code: payload.displayCode, language: payload.selected?.language || state.solution.language, problem: state.problem, opponentCode: payload.other?.code || "", submissions: state.submissions, matchContext: state.matchContext, subjectLabel }, (progress) => { state.modelProgress = progress?.text || "Analyzing…"; rerender(); });
      state.analyses = { ...(state.analyses || {}), [payload.key]: analyzed };
      if (payload.key === "mine") state.analysis = analyzed;
      if (state.owner && payload.key === "mine") {
        try { state.analysis = await saveSolutionAnalysis(session.profile, state.solution.archetypeId, analyzed, { source: state.matchContext?.duelId ? "duel" : "training", duelId: state.matchContext?.duelId }); state.analyses.mine = state.analysis; } catch {}
      }
      toast("Analysis ready.", "ok");
    } catch (error) {
      state.analysisError = error.message || "Analysis could not start.";
      const baseline = fastCodeAnalysis({ code: payload.displayCode, language: payload.selected?.language, problem: state.problem, opponentCode: payload.other?.code || "", submissions: state.submissions, matchContext: state.matchContext });
      state.analyses = { ...(state.analyses || {}), [payload.key]: baseline };
      if (payload.key === "mine") state.analysis = baseline;
      toast(state.analysisError, "err", 5000);
    } finally { state.running = false; state.modelProgress = ""; rerender(); }
  } }, icon("bulb", 15), payload.analysis ? "Refresh analysis" : "Start analysis");
  const improve = h("button", { class: "btn", disabled: state.improving || !state.owner || !String(payload.displayCode || "").trim(), onClick: async () => {
    state.improving = true;
    state.modelProgress = "Preparing a guided improvement…";
    rerender();
    try {
      let improvement = state.improvements?.[payload.key];
      let stepIndex = state.appliedSteps?.[payload.key] || 0;
      if (!improvement || stepIndex >= improvement.steps.length) {
        improvement = await improveCode({ code: payload.displayCode, language: payload.selected?.language || state.solution.language, problem: state.problem, analysis: payload.analysis, opponentCode: payload.other?.code || "" }, (progress) => { state.modelProgress = progress?.text || "Preparing improvement…"; rerender(); });
        state.improvements = { ...(state.improvements || {}), [payload.key]: improvement };
        stepIndex = 0;
      }
      const next = improvement.steps[stepIndex];
      state.codeEdits = { ...(state.codeEdits || {}), [payload.key]: next.code || payload.displayCode };
      state.appliedSteps = { ...(state.appliedSteps || {}), [payload.key]: stepIndex + 1 };
      toast("Applied the next guided improvement to the code pane.", "ok");
    } catch (error) { toast(error.message || "Couldn't prepare an improvement.", "err"); }
    finally { state.improving = false; state.modelProgress = ""; rerender(); }
  } }, icon("zap", 15), state.improving ? "Preparing…" : "Apply next improvement");
  const controls = h("div", { class: "analysis-actions" }, analyze, improve);
  const error = state.analysisError ? h("div", { class: "analysis-error" }, icon("x", 15), h("span", {}, state.analysisError)) : null;
  return h("aside", { class: "analysis-pane analysis-insights-pane" },
    h("div", { class: "analysis-pane-head" }, h("span", { class: "label" }, "// Analysis"), h("span", { class: "label" }, subjectLabel)),
    controls,
    progressBlock(state),
    error,
    reportContent(payload.analysis, state));
}

function progressBlock(state) {
  if (!state.running && !state.modelProgress) return null;
  return h("div", { class: "analysis-progress" }, h("div", { class: "bar" }, h("i", { style: { width: state.running ? "72%" : "100%" } })), h("span", { class: "mono" }, state.modelProgress || "Preparing analysis…"));
}

function renderWorkspace(root, state) {
  clear(root);
  const page = h("div", { class: "analysis-workspace" });
  root.append(page);
  const rerender = () => renderWorkspace(root, state);
  const title = state.solution.title || state.problem.title || "Code analysis";
  const returnLabel = state.publicView ? "Try a problem" : "Training Grounds";
  const header = h("header", { class: "analysis-workspace-head" },
    h("div", {}, h("div", { class: "eyebrow mb-2" }, state.matchContext?.duelId ? "// Post-match review" : state.publicView ? "// Public solution review" : "// Personal code review"), h("h1", { class: "head" }, title)),
    h("div", { class: "row gap-2 wrapflex" }, h("span", { class: "pill" }, state.solution.language || "code"), h("button", { class: "btn btn-sm", onClick: () => navigate("/training") }, returnLabel)));
  const body = h("div", { class: "analysis-workspace-grid" }, problemPane(state.problem, state, rerender), codePane(state, rerender), analysisPane(state, rerender));
  page.append(header, body);
}

export async function renderPrivateAnalysis(params, root) {
  const profile = session.profile;
  if (!profile || profile.isGuest || profile.isAnonymous) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("Sign in to analyze your private code."))); return; }
  if (profile.uid !== params.uid) {
    const share = await getPublicPuzzleSolution(params.uid, params.archetypeId).catch(() => null);
    if (!share) { privateMessage(root); return; }
    const problem = await resolveProblem(share.archetypeId);
    setAnalysisMetadata(share, `/share/${encodeURIComponent(share.id)}`);
    renderWorkspace(root, { owner: false, publicView: true, solution: share, problem, analysis: share.analysis || null, analyses: { mine: share.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
    return;
  }
  const solution = await getSavedSolution(profile.uid, params.archetypeId).catch(() => null);
  if (!solution) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("No saved code is available for this analysis."))); return; }
  const problem = await resolveProblem(solution.archetypeId);
  renderWorkspace(root, { owner: true, publicView: false, solution, problem, analysis: solution.analysis || null, analyses: { mine: solution.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
}

export async function renderPublicAnalysis(params, root) {
  const share = await getPublicSolutionShare(params.id).catch(() => null);
  if (!share) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("This solution link is unavailable or has been removed."))); return; }
  const problem = await resolveProblem(share.archetypeId);
  setAnalysisMetadata(share, `/share/${encodeURIComponent(params.id)}`);
  renderWorkspace(root, { owner: false, publicView: true, solution: share, problem, analysis: share.analysis || null, analyses: { mine: share.analysis || null }, submissions: [], coachMessages: [], codeEdits: {}, improvements: {}, appliedSteps: {} });
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
  const problem = await resolveProblem(duelProblem.archetypeId);
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
