// ============================================================================
// C4 local Burst authoring model — intentionally separate from code analysis.
// It stays in the browser, uses WebGPU, and lets the browser cache its weights.
// ============================================================================

const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.84";
// A compact instruct model is sufficient for constrained JSON problem drafts and
// starts materially faster than the 1.5B code-review model.
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
let engine = null;
let enginePromise = null;

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
      engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (event) => onProgress({
          text: event?.text || "Loading the local Burst author…",
          progress: event?.progress ?? 0,
        }),
      });
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
