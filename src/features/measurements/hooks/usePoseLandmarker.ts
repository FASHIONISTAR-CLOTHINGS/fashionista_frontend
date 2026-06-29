/**
 * @file usePoseLandmarker.ts
 * @description React hook that initialises and manages the MediaPipe Tasks Vision
 * PoseLandmarker — the NEW Tasks Vision API (replaces legacy BlazePose/Holistic).
 *
 * ── CRITICAL BUG FIXES (2026-06-29) ──────────────────────────────────────────
 *
 * BUG 1 — "ROI width and height must be > 0"
 *   MediaPipe's detectForVideo() throws an internal C++ assertion failure when
 *   the video element has videoWidth === 0 or videoHeight === 0 (i.e. the camera
 *   stream hasn't decoded its first frame yet). We MUST guard with:
 *     videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0
 *   before calling detectForVideo().
 *
 * BUG 2 — Graph corruption cascade (800+ console errors)
 *   After an internal MediaPipe graph error, the graph enters a corrupted state
 *   and throws on every subsequent frame call. We detect consecutive errors and
 *   auto-reinitialize the landmarker (close + recreate) to recover cleanly.
 *
 * BUG 3 — @latest WASM URL instability
 *   Using @latest CDN URL is non-deterministic in production. Pinned to @0.10.14.
 *
 * Key features:
 * - Lazy initialisation (loads model only when called)
 * - GPU delegate with automatic CPU fallback
 * - VIDEO running mode for real-time detection
 * - Returns worldLandmarks (in metres — no pixel conversion needed)
 * - Exposes pose quality score (avg visibility of key landmarks)
 * - Auto-cleanup on unmount
 */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ─── MediaPipe Types (from @mediapipe/tasks-vision) ───────────────────────────

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseLandmarkerResult {
  landmarks: Landmark[][];
  worldLandmarks: Landmark[][];
  segmentationMasks?: unknown[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Key landmark indices for quality scoring
const KEY_LANDMARK_INDICES = [
  11, 12,   // shoulders
  23, 24,   // hips
  25, 26,   // knees
  27, 28,   // ankles
];

// Pinned to a stable version — @latest causes non-deterministic WASM loads
const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";

/**
 * Maximum consecutive detectForVideo errors before we trigger graph recovery.
 * Prevents the 800+ error console flood.
 */
const MAX_CONSECUTIVE_ERRORS = 3;

// ─── Hook state types ─────────────────────────────────────────────────────────

export type LandmarkerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export interface UsePoseLandmarkerReturn {
  /** Current status of the PoseLandmarker lifecycle. */
  status: LandmarkerStatus;
  /** True when the model is loaded and ready for detection. */
  isReady: boolean;
  /** Error message if initialisation failed. */
  error: string | null;
  /**
   * Load the MediaPipe Tasks Vision WASM + pose model.
   * Safe to call multiple times (idempotent).
   */
  initialize: () => Promise<void>;
  /**
   * Run pose detection on a single video frame.
   *
   * GUARDS:
   *   - Returns null if model not ready
   *   - Returns null if videoEl.readyState < 2 (no decoded frame yet)
   *   - Returns null if videoEl.videoWidth === 0 || videoEl.videoHeight === 0
   *   - Auto-reinitializes after MAX_CONSECUTIVE_ERRORS internal graph errors
   *
   * @param videoEl  The <video> element to detect from.
   * @returns PoseLandmarkerResult or null if not ready.
   */
  detectFromVideo: (videoEl: HTMLVideoElement) => PoseLandmarkerResult | null;
  /**
   * Compute the average visibility of the key body landmarks.
   * Returns 0-1. Values below 0.6 should be rejected.
   */
  computeQualityScore: (worldLandmarks: Landmark[]) => number;
  /** Release the PoseLandmarker resources. Called automatically on unmount. */
  cleanup: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePoseLandmarker(): UsePoseLandmarkerReturn {
  const landmarkerRef        = useRef<unknown>(null);
  const consecutiveErrorsRef = useRef<number>(0);
  const isReinitializingRef  = useRef<boolean>(false);

  const [status, setStatus] = useState<LandmarkerStatus>("idle");
  const [error, setError]   = useState<string | null>(null);

  // ── Core create helper (shared by initialize + recovery) ───────────────────
  const createLandmarker = useCallback(async (): Promise<void> => {
    const { PoseLandmarker, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );

    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      baseOptions: {
        modelAssetPath: POSE_MODEL_URL,
        delegate: "GPU",  // auto-falls back to CPU on unsupported browsers
      },
      runningMode: "VIDEO" as const,
      numPoses: 1,
      minPoseDetectionConfidence: 0.65,
      minPosePresenceConfidence: 0.65,
      minTrackingConfidence: 0.65,
      outputSegmentationMasks: false,
    };

    landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, options);
  }, []);

  // ── Initialize ─────────────────────────────────────────────────────────────
  const initialize = useCallback(async () => {
    if (status === "ready" || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      await createLandmarker();
      consecutiveErrorsRef.current = 0;
      setStatus("ready");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to initialise pose detection model.";
      setError(msg);
      setStatus("error");
      console.error("[usePoseLandmarker] Initialisation failed:", err);
    }
  }, [status, createLandmarker]);

  // ── Graph recovery (auto-reinitialize after internal error storm) ───────────
  const recoverGraph = useCallback(async () => {
    if (isReinitializingRef.current) return;
    isReinitializingRef.current = true;

    console.info("[usePoseLandmarker] Graph corrupted — recovering (close + reinit)...");

    try {
      // Close the corrupted landmarker
      if (landmarkerRef.current) {
        try {
          const lm = landmarkerRef.current as { close?: () => void };
          lm.close?.();
        } catch {
          // Ignore close errors on a corrupted graph
        }
        landmarkerRef.current = null;
      }

      // Brief pause to let WASM internals reset
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      // Recreate
      await createLandmarker();
      consecutiveErrorsRef.current = 0;
      setStatus("ready");
      console.info("[usePoseLandmarker] Graph recovery successful.");
    } catch (err) {
      console.error("[usePoseLandmarker] Graph recovery failed:", err);
      setStatus("error");
      setError("Pose detection graph failed to recover. Please refresh.");
    } finally {
      isReinitializingRef.current = false;
    }
  }, [createLandmarker]);

  // ── Detect from video ───────────────────────────────────────────────────────
  const detectFromVideo = useCallback(
    (videoEl: HTMLVideoElement): PoseLandmarkerResult | null => {
      if (!landmarkerRef.current || status !== "ready") return null;

      // ── CRITICAL GUARD: ROI width/height > 0 ──────────────────────────────
      // MediaPipe throws "roi->width > 0 && roi->height > 0" if the video
      // hasn't decoded its first frame yet (readyState < HAVE_CURRENT_DATA).
      // We MUST skip the call in this case — not doing so corrupts the graph.
      if (
        videoEl.readyState < 2 ||     // HTMLMediaElement.HAVE_CURRENT_DATA = 2
        videoEl.videoWidth  === 0 ||
        videoEl.videoHeight === 0
      ) {
        return null;  // Video not ready — silently skip this frame
      }

      // ── Skip if graph is currently being reinitialised ─────────────────────
      if (isReinitializingRef.current) return null;

      try {
        const lm = landmarkerRef.current as {
          detectForVideo: (el: HTMLVideoElement, ts: number) => PoseLandmarkerResult;
        };
        const result = lm.detectForVideo(videoEl, performance.now());
        // Success — reset error counter
        consecutiveErrorsRef.current = 0;
        return result;
      } catch (err) {
        consecutiveErrorsRef.current += 1;

        // Log the FIRST error only — suppress subsequent ones to avoid flood
        if (consecutiveErrorsRef.current === 1) {
          console.warn(
            "[usePoseLandmarker] detectForVideo error (will auto-recover):",
            err
          );
        }

        // After MAX_CONSECUTIVE_ERRORS, trigger graph recovery
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          void recoverGraph();
        }

        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, recoverGraph]
  );

  // ── Quality score ───────────────────────────────────────────────────────────
  const computeQualityScore = useCallback(
    (worldLandmarks: Landmark[]): number => {
      if (!worldLandmarks?.length) return 0;

      const visibilities = KEY_LANDMARK_INDICES.map((idx) => {
        const lm = worldLandmarks[idx];
        return lm?.visibility ?? 0;
      });

      const avg = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;
      return Math.round(avg * 100) / 100;
    },
    []
  );

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (landmarkerRef.current) {
      try {
        const lm = landmarkerRef.current as { close?: () => void };
        lm.close?.();
      } catch {
        // Ignore cleanup errors
      }
      landmarkerRef.current = null;
      setStatus("idle");
    }
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isReady: status === "ready",
    error,
    initialize,
    detectFromVideo,
    computeQualityScore,
    cleanup,
  };
}

export type { Landmark, PoseLandmarkerResult };
