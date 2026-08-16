const PREFIX = "bb_analysis_attempt_v1_";

function clean(value) { return String(value ?? "").trim(); }

function snapshot(problem = {}) {
  return {
    generated: !!problem.generated,
    id: problem.id ?? null,
    archetypeId: problem.archetypeId ?? null,
    sourceArchetypeId: problem.sourceArchetypeId ?? null,
    title: problem.title ?? "Coding problem",
    difficulty: problem.difficulty ?? "Practice",
    category: problem.category ?? null,
    color: problem.color ?? null,
    definition: problem.definition ?? "",
    description: problem.description ?? "",
    inputFormat: problem.inputFormat ?? "",
    outputFormat: problem.outputFormat ?? "",
    constraints: Array.isArray(problem.constraints) ? problem.constraints : [],
    explanation: problem.explanation ?? "",
    allowedTechniques: Array.isArray(problem.allowedTechniques) ? problem.allowedTechniques : [],
    timeLimitSeconds: Number(problem.timeLimitSeconds ?? problem.timeLimit ?? 300),
  };
}

function key(uid, archetypeId) { return `${PREFIX}${encodeURIComponent(uid)}_${encodeURIComponent(archetypeId)}`; }

export function cacheAnalysisAttempt(profile, problem, submission = {}, mode = "unranked") {
  if (!profile?.uid || !problem?.archetypeId || !clean(submission.code)) return null;
  const value = {
    uid: profile.uid,
    username: profile.username ?? "Player",
    archetypeId: problem.archetypeId,
    title: problem.title ?? "Coding problem",
    difficulty: problem.difficulty ?? "Practice",
    category: problem.category ?? null,
    code: String(submission.code).slice(0, 100000),
    language: submission.language || "python",
    lastMode: mode,
    completed: Number(submission.passed ?? 0) >= Number(problem.testCases?.length ?? Infinity),
    analysisOnly: !!problem.generated,
    problemSnapshot: snapshot(problem),
    lastSavedAt: Date.now(),
  };
  try { sessionStorage.setItem(key(profile.uid, problem.archetypeId), JSON.stringify(value)); } catch {}
  return value;
}

export function getCachedAnalysisAttempt(uid, archetypeId) {
  if (!uid || !archetypeId) return null;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key(uid, archetypeId)) || "null");
    return parsed && clean(parsed.code) && parsed.problemSnapshot ? parsed : null;
  } catch { return null; }
}
