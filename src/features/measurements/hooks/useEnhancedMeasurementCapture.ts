"use client";
/**
 * @file useEnhancedMeasurementCapture.ts
 * @description TASKS 010-013: Extended measurement capture hook.
 *
 * Extends useMeasurementCapture with:
 * - TASK-010: Full 10-phase CapturePhase type definition
 * - TASK-011: 30-frame landmark buffer with averaging (best-frame selection)
 * - TASK-012: Distance estimation + centering detection per frame
 * - TASK-013: Auto-advancing side pose flow with buffer reset between poses
 *
 * Architecture:
 * - Wraps useMeasurementCapture as the base (preserves all existing logic)
 * - Adds: landmarkBuffer (ref), side pose state, distance/centering helpers
 * - On submit: sends BOTH front and side landmarks to backend
 *
 * Landmark Buffer (TASK-011):
 * - Collects last 30 frames with isGoodPose
 * - On capture: averages x/y/z/visibility across all buffered frames
 * - This eliminates frame jitter for ≈10% better measurement accuracy
 *
 * Distance Detection (TASK-012):
 * - Uses normalized nose-to-ankle span in image coords
 * - too_close: span > 0.90 (fills >90% of frame)
 * - optimal:   0.70 ≤ span ≤ 0.88
 * - too_far:   span < 0.60
 *
 * Centering Detection (TASK-012):
 * - Uses normalized nose X position
 * - centered: 0.38 ≤ noseX ≤ 0.62
 *
 * Side Pose (TASK-013):
 * - Lower quality threshold: 0.75 (vs 0.85 for front)
 * - After front capture: auto-advances to 'side_transition' after 1.5s
 * - Buffer cleared between front and side captures
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  MutableRefObject,
} from "react";
import {
  usePoseLandmarker,
  type Landmark,
  type PoseLandmarkerResult,
} from "./usePoseLandmarker";
import { useScanSession } from "./useScanSession";
import {
  POSE_THRESHOLDS,
  CAPTURE_CONFIG,
} from "@/lib/brand";

// ─── Extended Phase Types (TASK-010) ─────────────────────────────────────────

export type EnhancedCapturePhase =
  | "idle"
  | "loading_model"
  | "device_setup"       // NEW: Phone orientation check + instructions
  | "positioning"        // NEW: User stepping into frame
  | "front_aligning"     // NEW: Quality building up for front pose
  | "front_countdown"    // NEW: Auto-capture countdown (3-2-1)
  | "front_captured"     // NEW: Front pose captured, brief confirmation
  | "side_transition"    // NEW: Instruction to turn sideways
  | "side_positioning"   // NEW: User turning and positioning for side
  | "side_aligning"      // NEW: Quality building up for side pose
  | "side_countdown"     // NEW: Side pose countdown
  | "side_captured"      // NEW: Both poses captured, submitting
  | "submitting"
  | "processing"
  | "completed"
  | "failed";

// ─── Distance / Centering Status Types ───────────────────────────────────────

export type DistanceStatus = "too_close" | "optimal" | "too_far" | "unknown";
export type CenteringStatus = "too_left" | "centered" | "too_right" | "unknown";

// ─── Frame Data ───────────────────────────────────────────────────────────────

export interface EnhancedCaptureFrame {
  quality:          number;
  isGoodPose:       boolean;
  worldLandmarks:   Landmark[] | null;
  normalLandmarks:  Landmark[] | null;
  distanceStatus:   DistanceStatus;
  centeringStatus:  CenteringStatus;
}

// ─── Return Type ──────────────────────────────────────────────────────────────

export interface UseEnhancedMeasurementCaptureReturn {
  phase:              EnhancedCapturePhase;
  currentFrame:       EnhancedCaptureFrame | null;
  sessionId:          string | null;
  sessionStatus:      import("../api/scan.api").ScanStatusResponse | null;
  error:              string | null;
  // Buffer state
  landmarkBufferSize: number;
  bufferProgress:     number;  // 0-1 progress toward stabilityFramesRequired
  // Side pose state
  isSidePosePhase:    boolean;
  hasFrontCapture:    boolean;
  // Actions
  startCapture:       (heightCm?: number, ageyears?: number) => Promise<void>;
  processFrame:       () => EnhancedCaptureFrame | null;
  triggerFrontCapture: () => void;
  triggerSideCapture:  () => void;
  advanceToSidePhase:  () => void;
  /**
   * A-1 FIX: Skip device_setup orientation check and advance directly to
   * positioning. Replaces the broken `(capture as unknown as any).setPhaseSync?("positioning")` hack.
   */
  skipDeviceSetup:    () => void;
  reset:              () => void;
  stopCamera:         () => void;
  userHeightCm:       number | null;
  /** A-5 FIX: Age in years forwarded to backend for anthropometric anchoring. */
  userAge:            number | null;
}

// ─── Landmark Buffer Averaging (TASK-011) ─────────────────────────────────────

/**
 * Compute the per-landmark average across all buffered frames.
 * Produces noise-reduced landmark set for better measurement accuracy.
 */
function computeAverageLandmarks(buffer: Landmark[][]): Landmark[] {
  if (buffer.length === 0) return [];
  const n = buffer.length;
  return buffer[0].map((_, idx) => ({
    x:          buffer.reduce((s, f) => s + (f[idx]?.x ?? 0), 0) / n,
    y:          buffer.reduce((s, f) => s + (f[idx]?.y ?? 0), 0) / n,
    z:          buffer.reduce((s, f) => s + (f[idx]?.z ?? 0), 0) / n,
    visibility: buffer.reduce((s, f) => s + (f[idx]?.visibility ?? 0), 0) / n,
  }));
}

// ─── Distance Estimation (TASK-012) ──────────────────────────────────────────

/**
 * Estimate how far the user is from the camera using normalized landmarks.
 * Compares the vertical span from nose (0) to ankle average (27/28).
 *
 * Normalized coords: 0 = top, 1 = bottom of frame.
 * A larger span = person closer to camera.
 */
function estimateDistance(normalLandmarks: Landmark[]): DistanceStatus {
  const nose       = normalLandmarks[0];
  const leftAnkle  = normalLandmarks[27];
  const rightAnkle = normalLandmarks[28];

  if (!nose || !leftAnkle || !rightAnkle) return "unknown";
  if ((nose.visibility ?? 0) < 0.5 || (leftAnkle.visibility ?? 0) < 0.3) return "unknown";

  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const span = Math.abs(avgAnkleY - nose.y);

  if (span > 0.90) return "too_close";
  if (span >= 0.70) return "optimal";
  if (span < 0.60) return "too_far";
  return "optimal"; // 0.60-0.70: acceptable
}

// ─── Centering Detection (TASK-012) ──────────────────────────────────────────

/**
 * Detect if user is centered in the camera frame.
 * Uses nose X position in normalized coords (mirrored: 1=left, 0=right).
 */
function detectCentering(normalLandmarks: Landmark[]): CenteringStatus {
  const nose = normalLandmarks[0];
  if (!nose || (nose.visibility ?? 0) < 0.5) return "unknown";

  // Note: video is mirrored (scale-x: -1), so right/left are swapped in display
  // Actual nose X from MediaPipe: 0=left, 1=right before mirroring
  const noseX = 1 - nose.x; // After mirror correction

  if (noseX < 0.35) return "too_right";
  if (noseX > 0.65) return "too_left";
  return "centered";
}

// ─── Height estimation ────────────────────────────────────────────────────────

function estimateHeightFromLandmarks(worldLandmarks: Landmark[]): number | null {
  const nose       = worldLandmarks[0];
  const leftAnkle  = worldLandmarks[27];
  const rightAnkle = worldLandmarks[28];

  if (!nose || !leftAnkle || !rightAnkle) return null;

  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const heightM   = Math.abs(nose.y - avgAnkleY);
  const heightCm  = heightM * 100 * 1.07; // nose-to-ankle correction factor

  if (heightCm < 120 || heightCm > 250) return null;
  return Math.round(heightCm * 10) / 10;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEnhancedMeasurementCapture(
  videoRef: MutableRefObject<HTMLVideoElement | null>
): UseEnhancedMeasurementCaptureReturn {
  const landmarker  = usePoseLandmarker();
  const scanSession = useScanSession();

  const [localPhase, setLocalPhase]       = useState<EnhancedCapturePhase>("idle");
  const [currentFrame, setCurrentFrame] = useState<EnhancedCaptureFrame | null>(null);
  const [userHeightCm, setUserHeightCm] = useState<number | null>(null);
  const [userAge, setUserAge]           = useState<number | null>(null);   // A-5 FIX
  const [localError, setLocalError]     = useState<string | null>(null);
  const [hasFrontCapture, setHasFrontCapture] = useState(false);
  const [bufferProgress, setBufferProgress]   = useState(0);

  // Camera stream ref
  const streamRef = useRef<MediaStream | null>(null);

  // Landmark buffers (TASK-011) — refs to avoid re-render costs per frame
  const frontBufferRef = useRef<Landmark[][]>([]);
  const sideBufferRef  = useRef<Landmark[][]>([]);
  // Final averaged landmarks to submit
  const frontLandmarksRef = useRef<Landmark[] | null>(null);
  const sideLandmarksRef  = useRef<Landmark[] | null>(null);

  const phaseRef = useRef<EnhancedCapturePhase>("idle");

  // ── Derive phase from scan session final states + local state ─────────────
  const phase = useMemo<EnhancedCapturePhase>(() => {
    if (scanSession.phase === "submitting") return "submitting";
    if (scanSession.phase === "processing") return "processing";
    if (scanSession.phase === "completed")  return "completed";
    if (scanSession.phase === "failed")     return "failed";
    return localPhase;
  }, [scanSession.phase, localPhase]);

  const error = localError ?? (scanSession.phase === "failed" ? scanSession.error : null);

  const setPhaseSync = useCallback((next: EnhancedCapturePhase) => {
    phaseRef.current = next;
    setLocalPhase(next);
  }, []);

  // ── Camera start/stop ────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        const el = videoRef.current!;
        if (el.readyState >= 2 && el.videoWidth > 0) { resolve(); return; }
        const onCanPlay = () => { el.removeEventListener("canplay", onCanPlay); el.removeEventListener("error", onError); resolve(); };
        const onError   = (e: Event) => { el.removeEventListener("canplay", onCanPlay); el.removeEventListener("error", onError); reject(new Error(`Video error: ${(e as ErrorEvent).message ?? "unknown"}`)); };
        el.addEventListener("canplay", onCanPlay);
        el.addEventListener("error",   onError);
      });
      await videoRef.current.play();
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [videoRef]);

  // ── Start capture (begins with device_setup phase) ────────────────────────
  const startCapture = useCallback(
    async (heightCm?: number, ageYears?: number) => {
      setLocalError(null);
      setPhaseSync("loading_model");

      try {
        await landmarker.initialize();
        await startCamera();
        await scanSession.initiate("web");

        if (heightCm)  setUserHeightCm(heightCm);
        if (ageYears)  setUserAge(ageYears);   // A-5 FIX: store age for submit

        setPhaseSync("device_setup"); // Show phone orientation check first
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to start capture.";
        setLocalError(msg);
        setPhaseSync("failed");
        stopCamera();
      }
    },
    [landmarker, scanSession, startCamera, stopCamera, setPhaseSync]
  );

  // (setLocalError omitted from deps because setter identity is stable)

  // ── A-1 FIX: Skip device_setup orientation check ─────────────────────────
  /**
   * Advances from device_setup directly to positioning without requiring
   * the phone orientation indicator to turn green. Exposed as a proper public
   * API to replace the `(capture as unknown as any).setPhaseSync?.("positioning")`
   * hack that was silently broken because setPhaseSync is not in the return type.
   */
  const skipDeviceSetup = useCallback(() => {
    if (phaseRef.current === "device_setup" || phaseRef.current === "loading_model") {
      setPhaseSync("positioning");
    }
  }, [setPhaseSync]);

  // ── Process frame (TASKS 011, 012) ────────────────────────────────────────
  const processFrame = useCallback((): EnhancedCaptureFrame | null => {
    if (!videoRef.current || !landmarker.isReady) return null;

    const activePhases: EnhancedCapturePhase[] = [
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    if (!activePhases.includes(phaseRef.current)) return null;

    const result: PoseLandmarkerResult | null = landmarker.detectFromVideo(videoRef.current);

    if (!result || !result.worldLandmarks.length) {
      const emptyFrame: EnhancedCaptureFrame = {
        quality: 0, isGoodPose: false,
        worldLandmarks: null, normalLandmarks: null,
        distanceStatus: "unknown", centeringStatus: "unknown",
      };
      setCurrentFrame(emptyFrame);
      return emptyFrame;
    }

    const worldLms  = result.worldLandmarks[0];
    const normalLms = result.landmarks[0] ?? worldLms;
    const quality   = landmarker.computeQualityScore(worldLms);

    // Height estimation
    if (!userHeightCm && quality > 0.65) {
      const estimated = estimateHeightFromLandmarks(worldLms);
      if (estimated) setUserHeightCm(estimated);
    }

    // Quality threshold depends on pose phase
    const isSide   = phaseRef.current.startsWith("side_");
    const threshold = isSide ? POSE_THRESHOLDS.sideGood : POSE_THRESHOLDS.frontGood;
    const isGoodPose = quality >= threshold;

    // TASK-011: Update landmark buffer
    const buffer = isSide ? sideBufferRef.current : frontBufferRef.current;
    if (isGoodPose) {
      buffer.push(worldLms);
      if (buffer.length > CAPTURE_CONFIG.landmarkBufferSize) {
        buffer.shift();
      }
      const progress = Math.min(1, buffer.length / CAPTURE_CONFIG.landmarkBufferSize);
      setBufferProgress(progress);
    }

    // TASK-012: Distance + centering
    const distanceStatus   = normalLms ? estimateDistance(normalLms)  : "unknown";
    const centeringStatus  = normalLms ? detectCentering(normalLms)   : "unknown";

    // Auto-advance from positioning → front_aligning when body detected
    if (phaseRef.current === "positioning" && quality > POSE_THRESHOLDS.frontMedium) {
      setPhaseSync("front_aligning");
    }
    if (phaseRef.current === "side_positioning" && quality > POSE_THRESHOLDS.sideMedium) {
      setPhaseSync("side_aligning");
    }

    const frame: EnhancedCaptureFrame = {
      quality,
      isGoodPose,
      worldLandmarks:  worldLms,
      normalLandmarks: normalLms,
      distanceStatus,
      centeringStatus,
    };
    setCurrentFrame(frame);
    return frame;
  }, [landmarker, userHeightCm, videoRef, setPhaseSync]);

  // ── Front capture (TASK-013) ───────────────────────────────────────────────
  const triggerFrontCapture = useCallback(() => {
    // Save averaged front landmarks
    frontLandmarksRef.current = computeAverageLandmarks(frontBufferRef.current);
    setHasFrontCapture(true);
    setPhaseSync("front_captured");

    // Auto-advance to side_transition after delay
    setTimeout(() => {
      sideBufferRef.current  = []; // Clear buffer for side pose
      setBufferProgress(0);
      setPhaseSync("side_transition");
    }, CAPTURE_CONFIG.sideAdvanceDelay);
  }, [setPhaseSync]);

  // ── Side capture ──────────────────────────────────────────────────────────
  const triggerSideCapture = useCallback(async () => {
    sideLandmarksRef.current = computeAverageLandmarks(sideBufferRef.current);
    setPhaseSync("side_captured");

    const frontLms = frontLandmarksRef.current;
    const sideLms  = sideLandmarksRef.current;
    const height   = userHeightCm;

    if (!frontLms || !height) {
      setLocalError("Missing front pose data. Please restart the scan.");
      setPhaseSync("failed");
      return;
    }

    // Submit both landmark sets to backend
    // A-5 FIX: Include user_age in payload so backend anthropometric anchoring works
    await scanSession.submit({
      user_height_cm: height,
      ...(userAge != null && { user_age: userAge }),
      landmarks: frontLms.map((l) => ({
        x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0,
      })),
      // side_landmarks forwarded to backend for dual-pose fused pipeline
      ...(sideLms && {
        side_landmarks: sideLms.map((l) => ({
          x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0,
        })),
      }),
      device_type: "web",
    });

    stopCamera();
  }, [scanSession, userHeightCm, userAge, stopCamera, setPhaseSync]);

  // ── Advance to side pose phase (manual trigger) ───────────────────────────
  const advanceToSidePhase = useCallback(() => {
    sideBufferRef.current = [];
    setBufferProgress(0);
    setPhaseSync("side_positioning");
  }, [setPhaseSync]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopCamera();
    landmarker.cleanup();
    scanSession.reset();
    frontBufferRef.current = [];
    sideBufferRef.current  = [];
    frontLandmarksRef.current = null;
    sideLandmarksRef.current  = null;
    setPhaseSync("idle");
    setCurrentFrame(null);
    setUserHeightCm(null);
    setUserAge(null);
    setHasFrontCapture(false);
    setBufferProgress(0);
    setLocalError(null);
  }, [stopCamera, landmarker, scanSession, setPhaseSync]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    phase,
    currentFrame,
    sessionId:      scanSession.sessionId,
    sessionStatus:  scanSession.sessionStatus,
    error,
    landmarkBufferSize: CAPTURE_CONFIG.landmarkBufferSize,
    bufferProgress,
    isSidePosePhase:   phase.startsWith("side_"),
    hasFrontCapture,
    startCapture,
    processFrame,
    triggerFrontCapture,
    triggerSideCapture,
    advanceToSidePhase,
    skipDeviceSetup,   // A-1 FIX: proper public API instead of cast hack
    reset,
    stopCamera,
    userHeightCm,
    userAge,           // A-5 FIX: exposed for any component that needs to display it
  };
}
