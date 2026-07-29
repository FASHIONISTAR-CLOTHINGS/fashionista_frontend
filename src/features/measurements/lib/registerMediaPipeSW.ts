/**
 * @file registerMediaPipeSW.ts
 * @description Registers a service worker that caches MediaPipe model files.
 *
 * The MediaPipe BlazePose WASM + model files total ~30MB. By registering a
 * service worker we can cache these on first load and serve from cache on
 * subsequent visits, reducing scan page load time from 8s → <1s.
 *
 * Graceful no-op if Service Workers are unsupported or already registered.
 */

const SW_CACHE_NAME = "mediapipe-v1";
const MEDIAPIPE_ASSETS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm",
  "https://cdn.jsdelivr.net/npm/@mediapipe/pose_landmarker@0.1.0/pose_landmarker_lite.task",
  "https://cdn.jsdelivr.net/npm/@mediapipe/pose_landmarker@0.1.0/pose_landmarker_full.task",
];

export async function registerMediaPipeSW(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    // Check if already registered
    const registrations = await navigator.serviceWorker.getRegistrations();
    const existing = registrations.find(
      (r) => r.scope.includes("mediapipe") || r.active?.scriptURL.includes("mediapipe-sw"),
    );
    if (existing) return;

    // Register a minimal inline service worker via Blob URL
    // This avoids needing a separate SW file in /public
    const swCode = `
      const CACHE_NAME = "${SW_CACHE_NAME}";
      const ASSETS = ${JSON.stringify(MEDIAPIPE_ASSETS)};

      self.addEventListener("install", (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
        );
        self.skipWaiting();
      });

      self.addEventListener("activate", (event) => {
        event.waitUntil(
          caches.keys().then((names) =>
            Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
          )
        );
        self.clients.claim();
      });

      self.addEventListener("fetch", (event) => {
        const url = event.request.url;
        if (!ASSETS.some((a) => url.startsWith(a))) return;
        event.respondWith(
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
              }
              return response;
            }).catch(() => cached);
          })
        );
      });
    `;

    const blob = new Blob([swCode], { type: "application/javascript" });
    const swUrl = URL.createObjectURL(blob);

    await navigator.serviceWorker.register(swUrl, { scope: "./" });

    // Pre-warm the cache by fetching model files
    if ("caches" in window) {
      const cache = await caches.open(SW_CACHE_NAME);
      await Promise.allSettled(
        MEDIAPIPE_ASSETS.map((url) => cache.match(url).then((r) => r ?? fetch(url).then((res) => cache.put(url, res.clone())))),
      );
    }
  } catch (err) {
    // Graceful no-op — SW registration is a progressive enhancement
    console.warn("[MediaPipeSW] Registration failed (non-blocking):", err);
  }
}
