// ============================================================================
// C4 local Burst authoring model — intentionally separate from code analysis.
// It stays in the browser, uses WebGPU, and lets the browser cache its weights.
// ============================================================================

const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.84";
// SmolLM2 360M is the fast path for constrained JSON drafts. Qwen 0.5B
// remains available as a quality fallback via localStorage for stronger devices.
const FAST_MODEL_ID = "SmolLM2-360M-Instruct-q4f16_1-MLC";
const QUALITY_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
const MODEL_ID = (() => {
  // The model now emits only a tiny recipe; use the compact model by default.
  // The larger model remains available for devices that prefer it.
  try { return localStorage.getItem("bb_burst_model") === "quality" ? QUALITY_MODEL_ID : FAST_MODEL_ID; }
  catch { return FAST_MODEL_ID; }
})();
let engine = null;
let enginePromise = null;

export function setLocalBurstModelPreference(preference) {
  try { localStorage.setItem("bb_burst_model", preference === "quality" ? "quality" : "fast"); } catch {}
}

export function localBurstModelPreference() {
  try { return localStorage.getItem("bb_burst_model") === "quality" ? "quality" : "fast"; } catch { return "fast"; }
}

export function localBurstModelStatus() {
  if (!navigator.gpu) {
    return { available: false, loaded: false, reason: "AI Burst generation needs a WebGPU-capable browser to run locally." };
  }
  return { available: true, loaded: !!engine };
}

export async function loadLocalBurstModel(onProgress = () => {}) {
  if (engine) return engine;
  if (!navigator.gpu) throw new Error("AI Burst generation runs locally and needs a WebGPU-capable browser.");
  if (!enginePromise) {
    enginePromise = (async () => {
      onProgress({ text: "Preparing the local Burst author…", progress: 0 });
      const webllm = await import(WEBLLM_URL);
      const create = (modelId, fallback = false) => webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (event) => onProgress({
          text: fallback ? "Loading the compatible local Burst author…" : (event?.text || "Loading the local Burst author…"),
          progress: event?.progress ?? 0,
        }),
      });
      try {
        engine = await create(MODEL_ID);
      } catch (fastError) {
        if (MODEL_ID === QUALITY_MODEL_ID) throw fastError;
        console.warn("Fast local Burst model unavailable; falling back to Qwen 0.5B.", fastError);
        engine = await create(QUALITY_MODEL_ID, true);
      }
      onProgress({ text: "Local Burst author ready.", progress: 1 });
      return engine;
    })().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

export function warmLocalBurstModel(onProgress = () => {}) {
  return loadLocalBurstModel(onProgress).catch((error) => {
    // Callers that only prewarm should not disrupt normal authored-question play.
    console.warn("Local Burst model could not prewarm", error);
    return null;
  });
}
