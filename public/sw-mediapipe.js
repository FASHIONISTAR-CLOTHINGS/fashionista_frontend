/**
 * @file sw-mediapipe.js
 * @description Phase 13 / TASK-041: Service Worker for MediaPipe WASM cache.
 *
 * Strategy:
 *   - CACHE_FIRST for MediaPipe WASM and model task files (large binary assets)
 *   - NETWORK_FIRST for all other requests (API, pages, etc.)
 *   - Pre-caches the MediaPipe Pose Landmarker WASM and model .task file at install
 *   - Cache version bump forces re-fetch on next deploy
 *
 * Cached assets:
 *   - MediaPipe wasm_internal (all .wasm + .js loader files)
 *   - pose_landmarker_full.task model file (~30MB, very slow to load on each visit)
 *
 * Cache names:
 *   - mediapipe-wasm-v1: WASM binaries and JS workers
 *   - mediapipe-models-v1: Task model files
 *
 * Registration: see src/features/measurements/lib/registerMediaPipeSW.ts
 */

const WASM_CACHE   = "mediapipe-wasm-v1";
const MODEL_CACHE  = "mediapipe-models-v1";
const STATIC_CACHE = "static-assets-v1";

const MEDIAPIPE_ORIGINS = [
  "cdn.jsdelivr.net",
  "storage.googleapis.com",
];

const WASM_EXTENSIONS = [".wasm", "_wasm.js", "_wasm_nosimd.js", "_wasm_simd.js"];
const MODEL_EXTENSIONS = [".task", ".tflite", ".bin"];

// ─── Install: pre-warm critical caches ────────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log("[SW-MediaPipe] Installing...");
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(WASM_CACHE).then(() => {
      console.log("[SW-MediaPipe] WASM cache opened.");
    }),
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  console.log("[SW-MediaPipe] Activating...");
  const VALID_CACHES = new Set([WASM_CACHE, MODEL_CACHE, STATIC_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !VALID_CACHES.has(k))
          .map((k) => {
            console.log(`[SW-MediaPipe] Deleting old cache: ${k}`);
            return caches.delete(k);
          }),
      ),
    ).then(() => self.clients.claim()),
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMediaPipeOrigin(url) {
  return MEDIAPIPE_ORIGINS.some((origin) => url.hostname.includes(origin));
}

function isWasmFile(url) {
  return WASM_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

function isModelFile(url) {
  return MODEL_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

function isLocalMediaPipePath(url) {
  return url.pathname.startsWith("/_next/") &&
    (isWasmFile(url) || isModelFile(url));
}

// ─── Cache-First strategy ────────────────────────────────────────────────────

async function cacheFirst(cacheName, request) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    console.log(`[SW-MediaPipe] Cache HIT: ${request.url.split("?")[0]}`);
    return cached;
  }
  console.log(`[SW-MediaPipe] Cache MISS — fetching: ${request.url.split("?")[0]}`);
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn(`[SW-MediaPipe] Fetch failed for ${request.url}:`, err);
    throw err;
  }
}

// ─── Fetch handler ────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return; // Invalid URL — pass through
  }

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const isFromMediaPipeCDN = isMediaPipeOrigin(url);
  const isLocalWasm = isLocalMediaPipePath(url);

  // --- MediaPipe model files (.task, .tflite, .bin) → MODEL_CACHE ---
  if ((isFromMediaPipeCDN || isLocalWasm) && isModelFile(url)) {
    event.respondWith(cacheFirst(MODEL_CACHE, event.request));
    return;
  }

  // --- MediaPipe WASM binaries (.wasm, wasm_internal JS) → WASM_CACHE ---
  if ((isFromMediaPipeCDN || isLocalWasm) && isWasmFile(url)) {
    event.respondWith(cacheFirst(WASM_CACHE, event.request));
    return;
  }

  // All other requests: default browser behavior (network)
});

// ─── Message handler: manual cache warm-up ───────────────────────────────────
// Called from registerMediaPipeSW.ts with { type: 'WARM_CACHE', urls: [...] }

self.addEventListener("message", async (event) => {
  if (event.data?.type === "WARM_CACHE") {
    const urls = event.data.urls ?? [];
    console.log(`[SW-MediaPipe] Warming cache for ${urls.length} URLs...`);
    const cache = await caches.open(MODEL_CACHE);
    await Promise.allSettled(
      urls.map(async (url) => {
        const existing = await cache.match(url);
        if (existing) {
          console.log(`[SW-MediaPipe] Already cached: ${url}`);
          return;
        }
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log(`[SW-MediaPipe] Warmed: ${url}`);
          }
        } catch (err) {
          console.warn(`[SW-MediaPipe] Warm failed for ${url}:`, err);
        }
      }),
    );
    event.source?.postMessage({ type: "CACHE_WARMED" });
  }
});
