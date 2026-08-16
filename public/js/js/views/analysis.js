// ============================================================================
// C3 Code Analysis — dedicated private/public analysis screens powered by the
// browser-local Qwen model. Public shares reuse the same screen; private owner
// URLs never reveal source to other players.
// ============================================================================

import { h, clear, emptyState, icon, fmtTime, toast, avatar } from "../ui.js";
import { session } from "../session.js";
import { getSavedSolution, getPublicPuzzleSolution, getPublicSolutionShare, saveSolutionAnalysis } from "../store.js";
import { getDuel, getDuelSubmissionHistory } from "../matchmaking.js";
import { loadPool, problemById } from "../problems.js";
import { navigate } from "../router.js";
import { analyzeCode, askCodeCoach, fastCodeAnalysis, localModelStatus } from "../analysis-engine.js";

function setAnalysisMetadata(subject, canonicalPath) {
  const owner = subject.ownerUsername || subject.username || "A ByteBlitz player";
  const title = subject.title || "a coding problem";
  const pageTitle = `AI analysis: ${owner}'s solution to ${title} | ByteBlitz`;
  const description = `Explore ${owner}'s code, complexity review, efficiency score, and ByteBlitz Coach analysis for ${title}.`;
  document.title = pageTitle;
  const tags = { description, "og:title": pageTitle, "og:description": description, "og:type": "article", "og:url": `${window.location.origin}${canonicalPath}`, "twitter:card": "summary", "twitter:title": pageTitle, "twitter:description": description };
  Object.entries(tags).forEach(([key, content]) => {
    const social = key.startsWith("og:") || key.startsWith("twitter:");
    const selector = social ? `meta[property="${key}"]` : `meta[name="${key}"]`;
    let meta = document.head.querySelector(selector);
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute(social ? "property" : "name", key); document.head.append(meta); }
    meta.content = content;
  });
}

async function resolveProblem(archetypeId) {
  try { await loadPool(); return problemById(archetypeId) || { archetypeId, title: archetypeId, description: "" }; }
  catch { return { archetypeId, title: archetypeId, description: "" }; }
}

function privateMessage(root) {
  root.append(h("div", { class: "wrap analysis-private-wrap" },
    emptyState("This solution is private. Ask the owner to make it public."),
    h("div", { class: "center mt-4" }, h("button", { class: "btn", onClick: () => navigate("/training") }, "Open Training Grounds"))));
}

function analysisChip(label, value) {
  return h("div", { class: "analysis-chip" }, h("span", { class: "label" }, label), h("strong", { class: "mono" }, value || "—"));
}

function listPanel(title, items, tone = "") {
  const values = Array.isArray(items) && items.length ? items : ["No observations yet."];
  const rows = values.map((item) => h("li", {}, item));
  return h("section", { class: "analysis-list-panel " + tone },
    h("div", { class: "label mb-3" }, "// " + title),
    h("ul", {}, ...rows));
}

function analysisReport(analysis, context) {
  if (!analysis) return h("section", { class: "analysis-empty-report" },
    icon("bulb", 22),
    h("h2", { class: "head" }, "Ready for an AI review"),
    h("p", { class: "body-text" }, "Run the local Qwen analysis to receive a complexity review, efficiency score, detailed strengths, improvement ideas, and a submission-by-submission breakdown."));
  const suggestionRows = (analysis.suggestions || []).map((tip, index) => h("div", { class: "analysis-suggestion" },
    h("span", {}, String(index + 1).padStart(2, "0")),
    h("p", {}, tip)));
  const suggestionPanel = h("section", { class: "analysis-suggestions" },
    h("div", { class: "label mb-2" }, "// Optimization suggestions"),
    ...suggestionRows);
  return h("div", { class: "analysis-report" },
    h("section", { class: "analysis-score-card" },
      h("div", { class: "analysis-score-ring" }, h("strong", {}, String(analysis.efficiencyScore ?? "—")), h("span", {}, "/100")),
      h("div", {}, h("div", { class: "label" }, "// Efficiency score"), h("h2", { class: "head mt-1" }, analysis.efficiencyScore >= 80 ? "Strong foundation" : analysis.efficiencyScore >= 60 ? "Solid, with room to improve" : "A useful first pass"), h("p", { class: "body-text mt-2" }, analysis.codeQuality || "Analysis complete."))),
    h("section", { class: "analysis-complexity-grid" },
      analysisChip("Time complexity", analysis.timeComplexity),
      analysisChip("Space complexity", analysis.spaceComplexity),
      analysisChip("Analysis engine", analysis.provider === "qwen-local" ? "Local Qwen" : "Fast baseline")),
    h("section", { class: "analysis-approach" }, h("div", { class: "label mb-2" }, "// Your approach"), h("p", { class: "body-text" }, analysis.approach)),
    h("div", { class: "analysis-list-grid" },
      listPanel("Strengths", analysis.strengths, "good"),
      listPanel("Improve next", analysis.weaknesses, "warn")),
    suggestionPanel,
    context.hasOpponent ? h("section", { class: "analysis-opponent" }, h("div", { class: "label mb-2" }, "// Opponent comparison"), h("p", { class: "body-text" }, analysis.opponentComparison || "No direct comparison was generated.")) : null,
    context.match ? h("section", { class: "analysis-match-review" }, h("div", { class: "label mb-2" }, "// Match review"), h("p", { class: "body-text" }, analysis.matchReview || "Review your submission progression below.")) : null,
    context.match ? submissionTimeline(analysis.submissionProgress || context.submissions || []) : null,
  );
}

function submissionTimeline(entries) {
  const rows = Array.isArray(entries) ? entries : [];
  const timelineRows = rows.map((entry, index) => h("article", { class: "analysis-timeline-row" },
    h("span", { class: "analysis-timeline-number" }, String(entry.submission || index + 1).padStart(2, "0")),
    h("div", {},
      h("strong", { class: "mono" }, `${entry.testsPassed || 0} tests passed`),
      h("p", {}, entry.note || "Submission retained for review."))));
  const body = timelineRows.length
    ? h("div", { class: "analysis-timeline-list" }, ...timelineRows)
    : h("p", { class: "body-text" }, "No per-submission snapshots were available for this older match.");
  return h("section", { class: "analysis-timeline" },
    h("div", { class: "between gap-3 wrapflex mb-3" },
      h("div", { class: "label" }, "// Submission progression"),
      h("span", { class: "label" }, `${rows.length} retained attempt${rows.length === 1 ? "" : "s"}`)),
    body);
}

function coachPanel(state, rerender) {
  const messages = state.coachMessages || [];
  const input = h("textarea", { class: "input analysis-coach-input", placeholder: "Ask how to reduce complexity, handle an edge case, or improve the next submission…", rows: "3" });
  const chatRows = messages.map((message) => h("article", { class: "analysis-chat-message " + message.role },
    h("span", { class: "label" }, message.role === "user" ? "You" : "Coach"),
    h("p", {}, message.content)));
  const chatLog = chatRows.length ? h("div", { class: "analysis-chat-log mt-4" }, ...chatRows) : null;
  const send = h("button", { class: "btn btn-primary", onClick: async () => {
    const question = input.value.trim();
    if (!question || state.coachBusy) return;
    state.coachBusy = true;
    state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: "Thinking locally…" }];
    rerender();
    try {
      const reply = await askCodeCoach({ question, analysis: state.analysis, code: state.solution.code, problem: state.problem, history: messages }, (progress) => { state.modelProgress = progress?.text || "Preparing local coach…"; rerender(); });
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: reply }];
    } catch (error) {
      state.coachMessages = [...messages, { role: "user", content: question }, { role: "assistant", content: `Local coach couldn't start: ${error.message || "unknown error"}` }];
    } finally { state.coachBusy = false; state.modelProgress = ""; rerender(); }
  } }, icon("send", 15), "Ask coach");
  return h("section", { class: "analysis-coach" },
    h("div", { class: "between gap-3 wrapflex" }, h("div", {}, h("div", { class: "label" }, "// ByteBlitz Coach"), h("h2", { class: "head mt-1" }, "Talk through the next improvement")), h("span", { class: "analysis-local-badge" }, icon("bulb", 13), "Local Qwen")),
    h("p", { class: "body-text mt-3" }, "Your source stays in this browser while the coach explains trade-offs and next steps."),
    chatLog,
    h("div", { class: "analysis-coach-compose mt-4" }, input, send),
    state.modelProgress ? h("p", { class: "mono mt-2", style: { fontSize: "11px", color: "var(--muted-fg)" } }, state.modelProgress) : null);
}

function renderWorkspace(root, state) {
  clear(root);
  const page = h("div", { class: "wrap analysis-wrap" });
  root.append(page);
  const rerender = () => renderWorkspace(root, state);
  const status = localModelStatus();
  const run = h("button", { class: "btn btn-primary", disabled: state.running || !String(state.solution.code || "").trim(), onClick: async () => {
    state.running = true;
    state.modelProgress = "Preparing local Qwen analysis…";
    rerender();
    try {
      state.analysis = await analyzeCode({
        code: state.solution.code,
        language: state.solution.language,
        problem: state.problem,
        opponentCode: state.opponent?.code || "",
        submissions: state.submissions,
        matchContext: state.matchContext,
      }, (progress) => { state.modelProgress = progress?.text || "Analyzing locally…"; rerender(); });
      if (state.owner) {
        try { state.analysis = await saveSolutionAnalysis(session.profile, state.solution.archetypeId, state.analysis, { source: state.matchContext?.duelId ? "duel" : "training", duelId: state.matchContext?.duelId }); }
        catch (error) { console.warn("Analysis rendered but could not be saved", error); }
      }
      toast("Code analysis complete.", "ok");
    } catch (error) {
      state.analysisError = error.message || "Local Qwen could not load.";
      state.analysis = fastCodeAnalysis({ code: state.solution.code, language: state.solution.language, problem: state.problem, opponentCode: state.opponent?.code || "", submissions: state.submissions, matchContext: state.matchContext });
      if (state.owner) {
        try { state.analysis = await saveSolutionAnalysis(session.profile, state.solution.archetypeId, state.analysis, { source: state.matchContext?.duelId ? "duel" : "training", duelId: state.matchContext?.duelId }); } catch {}
      }
      toast(state.analysisError, "err", 6000);
    } finally { state.running = false; state.modelProgress = ""; rerender(); }
  } }, state.running ? "Analyzing locally…" : state.analysis ? "Refresh analysis" : "Analyze code");
  page.append(
    h("section", { class: "analysis-hero" },
      h("div", { class: "between gap-4 wrapflex" },
        h("div", {}, h("div", { class: "eyebrow mb-2" }, state.publicView ? "// Public solution analysis" : state.matchContext?.duelId ? "// Post-match code analysis" : "// Training Grounds code analysis"), h("h1", { class: "head" }, state.solution.title || state.problem.title), h("p", { class: "mono mt-2", style: { fontSize: "12px", color: "var(--muted-fg)" } }, `${state.solution.language || "code"} · ${state.solution.lastMode || state.matchContext?.mode || "training"}${state.solution.bestTimeMs ? ` · best ${fmtTime(state.solution.bestTimeMs)}` : ""}`)),
        h("div", { class: "analysis-hero-actions" }, run, state.publicView ? h("button", { class: "btn", onClick: () => navigate("/training") }, "Try a problem") : h("button", { class: "btn", onClick: () => navigate("/training") }, "Training Grounds"))),
      h("div", { class: "analysis-model-status mt-4" }, icon("bulb", 14), h("span", {}, status.available ? (status.loaded ? "Local Qwen is ready in this browser." : "Analysis runs locally with Qwen and loads on demand.") : status.reason)),
    ),
    state.modelProgress ? h("div", { class: "analysis-progress mt-5" }, h("div", { class: "bar" }, h("i", { style: { width: state.running ? "76%" : "0%" } })), h("span", { class: "mono" }, state.modelProgress)) : null,
    state.analysisError ? h("div", { class: "analysis-error mt-5" }, icon("x", 15), h("span", {}, state.analysisError), h("p", {}, "The baseline review remains available; try again on a WebGPU-enabled Chromium browser for local Qwen insights.")) : null,
    analysisReport(state.analysis, { hasOpponent: !!state.opponent?.code, match: !!state.matchContext?.duelId, submissions: state.submissions }),
    h("section", { class: "analysis-code-card mt-5" }, h("div", { class: "between gap-3 analysis-code-head" }, h("span", { class: "label" }, "// Submitted source"), h("span", { class: "pill" }, state.solution.language || "code")), h("pre", { class: "solution-code analysis-code" }, state.solution.code || "// No saved source is available.")),
    coachPanel(state, rerender),
  );
}

export async function renderPrivateAnalysis(params, root) {
  const profile = session.profile;
  if (!profile || profile.isGuest || profile.isAnonymous) {
    root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("Sign in to analyze your private code and use ByteBlitz Coach.")));
    return;
  }
  if (profile.uid !== params.uid) {
    const share = await getPublicPuzzleSolution(params.uid, params.archetypeId).catch(() => null);
    if (!share) { privateMessage(root); return; }
    const problem = await resolveProblem(share.archetypeId);
    setAnalysisMetadata(share, `/share/${encodeURIComponent(share.id)}`);
    renderWorkspace(root, { owner: false, publicView: true, solution: share, problem, analysis: share.analysis || null, submissions: [], coachMessages: [] });
    return;
  }
  const solution = await getSavedSolution(profile.uid, params.archetypeId).catch(() => null);
  if (!solution) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("No saved code is available for this analysis."))); return; }
  const problem = await resolveProblem(solution.archetypeId);
  renderWorkspace(root, { owner: true, publicView: false, solution, problem, analysis: solution.analysis || null, submissions: [], coachMessages: [] });
}

export async function renderPublicAnalysis(params, root) {
  const share = await getPublicSolutionShare(params.id).catch(() => null);
  if (!share) { root.append(h("div", { class: "wrap analysis-private-wrap" }, emptyState("This solution link is unavailable or has been removed."))); return; }
  const problem = await resolveProblem(share.archetypeId);
  setAnalysisMetadata(share, `/share/${encodeURIComponent(params.id)}`);
  renderWorkspace(root, { owner: false, publicView: true, solution: share, problem, analysis: share.analysis || null, submissions: [], coachMessages: [] });
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
  renderWorkspace(root, { owner: true, publicView: false, solution, problem, analysis: existingAnalysis, opponent: opponentSubmission || null, submissions: fullHistory.length ? fullHistory : (Array.isArray(compactHistory) ? compactHistory : []), matchContext, coachMessages: [] });
}

async function resolveProblemFromDuel(duel) {
  try {
    const { problemForSeed } = await import("../problems.js");
    return await problemForSeed(duel.difficulty, duel.problemSeed);
  } catch { return { archetypeId: duel.id, title: "Match problem", difficulty: duel.difficulty, description: "" }; }
}
