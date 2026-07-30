/**
 * @file registerMediaPipeSW.ts
 * @description Phase 13 / TASK-041: Registers sw-mediapipe.js and triggers
 *              proactive cache warm-up for the pose landmarker model.
 *
 * Call this once from the scan page layout or a root client component.
 *
 * What it does:
 *   1. Registers /sw-mediapipe.js as a Service Worker (scope: '/')
 *   2. On registration, sends a WARM_CACHE message with the MediaPipe model URLs
 *   3. Returns cleanup function (for useEffect)
 *
 * The model URLs should match exactly what usePoseLandmarker.ts fetches —
 * so the first real scan load is a cache hit (≈0ms vs ≈4000ms cold load).
 *
 * Usage:
 *   useEffect(() => registerMediaPipeSW(), []);
 */

"use client";

// The MediaPipe model URL used by usePoseLandmarker.ts
// Must match the URL in usePoseLandmarker.ts exactly
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";

// The WASM loader bundle used internally by MediaPipe
// These are loaded by @mediapipe/tasks-vision internally from jsdelivr CDN
const MEDIAPIPE_WASM_URLS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/vision_wasm_internal.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/vision_wasm_internal.wasm",
];

export function registerMediaPipeSW(): () => void {
  if (typeof window === "undefined")        return () => {};
  if (!("serviceWorker" in navigator))       return () => {};

  let registration: ServiceWorkerRegistration | null = null;

  const register = async () => {
    try {
      registration = await navigator.serviceWorker.register("/sw-mediapipe.js", {
        scope: "/",
      });

      console.log("[SW] MediaPipe SW registered:", registration.scope);

      // Wait for the SW to be active
      const active = await new Promise<ServiceWorker | null>((resolve) => {
        if (registration?.active) { resolve(registration.active); return; }
        const handler = () => {
          if (registration?.active) {
            resolve(registration.active);
            registration?.removeEventListener("updatefound", handler);
          }
        };
        registration?.addEventListener("updatefound", handler);
        // Timeout after 10s
        setTimeout(() => resolve(null), 10_000);
      });

      if (!active) {
        console.warn("[SW] Could not get active SW reference — skipping warm-up");
        return;
      }

      // Send warm-up message with all URLs to pre-cache
      const urlsToWarm = [POSE_MODEL_URL, ...MEDIAPIPE_WASM_URLS];
      active.postMessage({ type: "WARM_CACHE", urls: urlsToWarm });
      console.log(`[SW] Sent WARM_CACHE for ${urlsToWarm.length} URLs`);

      // Listen for completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "CACHE_WARMED") {
          console.log("[SW] MediaPipe model cache is warm ✅");
          navigator.serviceWorker.removeEventListener("message", handleMessage);
        }
      };
      navigator.serviceWorker.addEventListener("message", handleMessage);
    } catch (err) {
      console.warn("[SW] MediaPipe SW registration failed:", err);
    }
  };

  register();

  return () => {
    // Cleanup: unregister on hot-reload in dev (optional)
    if (process.env.NODE_ENV === "development") {
      registration?.unregister();
    }
  };
}

/**
 * React hook wrapper. Call in a useEffect on the scan page.
 * @example
 *   const scanPageClient = () => {
 *     useEffect(() => registerMediaPipeSW(), []);
 *     ...
 *   }
 */
export function useMediaPipeSW(): void {
  // Intentionally a standalone function — call via useEffect
  // This export is a type-safe reminder to use the function in useEffect
}
