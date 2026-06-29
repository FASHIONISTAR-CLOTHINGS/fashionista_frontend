/**
 * @file usePoseLandmarker.ts
 * @description React hook that initialises and manages the MediaPipe Tasks Vision
 * PoseLandmarker — the NEW 2024 API (replaces legacy BlazePose/Holistic).
 *
 * Key features:
 * - Lazy initialisation (loads model only when called)
 * - GPU delegate with automatic CPU fallback
 * - VIDEO running mode for real-time detection
 * - Returns worldLandmarks (in metres — no pixel conversion needed)
 * - Exposes pose quality score (avg visibility of key landmarks)
 * - Auto-cleanup on unmount
 *
 * MediaPipe Tasks Vision model:
 *   pose_landmarker_full — highest accuracy, recommended for body measurement
 *   (see: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)
 *
 * Usage:
 *   const { initialize, detectFromVideo, isReady, cleanup } = usePoseLandmarker();
 *   await initialize();
 *   const result = detectFromVideo(videoRef.current);
 *   const landmarks = result?.worldLandmarks[0];
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


// Key landmark indices for quality scoring
const KEY_LANDMARK_INDICES = [
  11, 12,   // shoulders
  23, 24,   // hips
  25, 26,   // knees
  27, 28,   // ankles
];

const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";

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
  const landmarkerRef = useRef<unknown>(null);
  const [status, setStatus] = useState<LandmarkerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Initialize ─────────────────────────────────────────────────────────────
  const initialize = useCallback(async () => {
    if (status === "ready" || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      // Dynamic import — keeps bundle size minimal (tree-shaken on pages that don't use it)
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

      landmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        options
      );

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
  }, [status]);

  // ── Detect from video ───────────────────────────────────────────────────────
  const detectFromVideo = useCallback(
    (videoEl: HTMLVideoElement): PoseLandmarkerResult | null => {
      if (!landmarkerRef.current || status !== "ready") return null;

      try {
        const lm = landmarkerRef.current as {
          detectForVideo: (el: HTMLVideoElement, ts: number) => PoseLandmarkerResult;
        };
        return lm.detectForVideo(videoEl, performance.now());
      } catch (err) {
        console.warn("[usePoseLandmarker] detectForVideo error:", err);
        return null;
      }
    },
    [status]
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
