/**
 * @file useMeasurementCapture.ts
 * @description Orchestration hook for the complete AI body measurement capture flow.
 *
 * Combines:
 *   - usePoseLandmarker — MediaPipe model + detection
 *   - useScanSession    — Backend session lifecycle
 *   - Camera access     — getUserMedia API
 *   - Height estimation — Auto-estimate from landmarks if not provided by user
 *
 * State machine:
 *   idle → loading_model → awaiting_height → capturing → validating
 *        → submitting → processing → completed | failed
 *
 * Usage:
 *   const capture = useMeasurementCapture();
 *   await capture.startCapture();
 *   // mount <AICameraCapture /> and pass capture.videoRef + capture.onFrame
 */
"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  MutableRefObject,
} from "react";
import { usePoseLandmarker, type Landmark, type PoseLandmarkerResult } from "./usePoseLandmarker";
import { useScanSession } from "./useScanSession";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CapturePhase =
  | "idle"
  | "loading_model"
  | "awaiting_height"
  | "capturing"
  | "validating"
  | "submitting"
  | "processing"
  | "completed"
  | "failed";

export interface CaptureFrame {
  /** Average visibility of key landmarks (0-1). */
  quality: number;
  /** Whether the pose quality is good enough to submit. */
  isGoodPose: boolean;
  /** Current world landmarks if detected, else null. */
  worldLandmarks: Landmark[] | null;
}

export interface UseMeasurementCaptureReturn {
  phase:          CapturePhase;
  currentFrame:   CaptureFrame | null;
  sessionId:      string | null;
  sessionStatus:  import("../api/scan.api").ScanStatusResponse | null;
  error:          string | null;
  videoRef:       MutableRefObject<HTMLVideoElement | null>;
  canvasRef:      MutableRefObject<HTMLCanvasElement | null>;

  /** Step 1: Load MediaPipe model + open camera. */
  startCapture:   (heightCm?: number) => Promise<void>;
  /** Step 2: Process a video frame (call in requestAnimationFrame loop). */
  processFrame:   () => CaptureFrame | null;
  /** Step 3: Capture the best frame and submit to backend. */
  captureAndSubmit: (heightCm?: number) => Promise<void>;
  /** Reset everything — allows starting a fresh scan. */
  reset:          () => void;
  /** Stored user height (auto-estimated if not provided). */
  userHeightCm:   number | null;
  /** Stop camera stream. */
  stopCamera:     () => void;
}

// ─── Height estimation from landmarks ─────────────────────────────────────────

/**
 * Estimate user height from world landmarks.
 * Uses nose (top) to ankle (bottom) vertical distance.
 * Result is in cm. Multiply by a correction factor (1.07) to account for the
 * head above the nose landmark.
 */
function estimateHeightFromLandmarks(worldLandmarks: Landmark[]): number | null {
  const nose        = worldLandmarks[0];
  const leftAnkle   = worldLandmarks[27];
  const rightAnkle  = worldLandmarks[28];

  if (!nose || !leftAnkle || !rightAnkle) return null;

  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const heightM   = Math.abs(nose.y - avgAnkleY);
  const heightCm  = heightM * 100 * 1.07; // nose-to-ankle correction

  // Sanity bounds: 120cm to 250cm
  if (heightCm < 120 || heightCm > 250) return null;

  return Math.round(heightCm * 10) / 10;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMeasurementCapture(): UseMeasurementCaptureReturn {
  const landmarker = usePoseLandmarker();
  const scanSession = useScanSession();

  const [phase, setPhase]                 = useState<CapturePhase>("idle");
  const [currentFrame, setCurrentFrame]   = useState<CaptureFrame | null>(null);
  const [userHeightCm, setUserHeightCm]   = useState<number | null>(null);
  const [capturedLandmarks, setCapturedLandmarks] = useState<Landmark[] | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Sync phases with scan session ──────────────────────────────────────────
  useEffect(() => {
    if (scanSession.phase === "submitting") setPhase("submitting");
    if (scanSession.phase === "processing") setPhase("processing");
    if (scanSession.phase === "completed")  setPhase("completed");
    if (scanSession.phase === "failed") {
      setPhase("failed");
      setError(scanSession.error);
    }
  }, [scanSession.phase, scanSession.error]);

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",       // Front camera
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ── CRITICAL: Wait for video to decode first frame ─────────────────
        // We MUST wait until videoEl.readyState >= 2 (HAVE_CURRENT_DATA)
        // before allowing the MediaPipe frame loop to start.
        // Without this, detectForVideo() fires on a 0×0 frame and crashes the
        // internal C++ graph with "ROI width/height > 0" assertion failures.
        await new Promise<void>((resolve, reject) => {
          const el = videoRef.current!;

          // If already ready (e.g. srcObject swap), resolve immediately
          if (el.readyState >= 2 && el.videoWidth > 0) {
            resolve();
            return;
          }

          const onCanPlay = () => {
            el.removeEventListener("canplay", onCanPlay);
            el.removeEventListener("error",   onError);
            resolve();
          };
          const onError = (e: Event) => {
            el.removeEventListener("canplay", onCanPlay);
            el.removeEventListener("error",   onError);
            reject(new Error(`Video error: ${(e as ErrorEvent).message ?? "unknown"}`));
          };

          el.addEventListener("canplay", onCanPlay);
          el.addEventListener("error",   onError);
        });

        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Camera access denied.";
      throw new Error(`Camera error: ${msg}`);
    }
  }, []);


  // ── Stop camera ─────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── Start capture flow ──────────────────────────────────────────────────────
  const startCapture = useCallback(
    async (heightCm?: number) => {
      setError(null);
      setPhase("loading_model");

      try {
        // 1. Load MediaPipe model
        await landmarker.initialize();

        // 2. Start camera
        await startCamera();

        // 3. Initiate backend session
        await scanSession.initiate("web");

        // 4. Store provided height (can be updated or auto-estimated later)
        if (heightCm) setUserHeightCm(heightCm);

        setPhase(heightCm ? "capturing" : "awaiting_height");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to start capture.";
        setError(msg);
        setPhase("failed");
        stopCamera();
      }
    },
    [landmarker, scanSession, startCamera, stopCamera]
  );

  // ── Process a single video frame ────────────────────────────────────────────
  const processFrame = useCallback((): CaptureFrame | null => {
    if (!videoRef.current || !landmarker.isReady) return null;
    if (phase !== "capturing" && phase !== "awaiting_height") return null;

    const result: PoseLandmarkerResult | null = landmarker.detectFromVideo(
      videoRef.current
    );

    if (!result || !result.worldLandmarks.length) {
      const frame: CaptureFrame = {
        quality: 0,
        isGoodPose: false,
        worldLandmarks: null,
      };
      setCurrentFrame(frame);
      return frame;
    }

    const worldLms = result.worldLandmarks[0];
    const quality  = landmarker.computeQualityScore(worldLms);

    // Auto-estimate height if not provided
    if (!userHeightCm && quality > 0.65) {
      const estimated = estimateHeightFromLandmarks(worldLms);
      if (estimated) {
        setUserHeightCm(estimated);
        if (phase === "awaiting_height") setPhase("capturing");
      }
    }

    // Store best frame (highest quality)
    const isGoodPose = quality >= 0.72;
    if (isGoodPose) {
      setCapturedLandmarks(worldLms);
    }

    const frame: CaptureFrame = {
      quality,
      isGoodPose,
      worldLandmarks: worldLms,
    };
    setCurrentFrame(frame);
    return frame;
  }, [landmarker, phase, userHeightCm]);

  // ── Capture + submit ────────────────────────────────────────────────────────
  const captureAndSubmit = useCallback(
    async (heightCm?: number) => {
      const lms = capturedLandmarks;
      if (!lms) {
        setError("No valid pose detected. Please stand fully visible in the frame.");
        return;
      }

      const height = heightCm ?? userHeightCm;
      if (!height || height < 100 || height > 250) {
        setError("Unable to determine your height. Please enter it manually.");
        return;
      }

      setPhase("validating");

      // Basic client-side validation (backend does the full validation)
      const quality = landmarker.computeQualityScore(lms);
      if (quality < 0.60) {
        setError(
          `Pose quality too low (${Math.round(quality * 100)}%). ` +
          "Please ensure you are fully visible and well-lit."
        );
        setPhase("failed");
        return;
      }

      // Submit to backend — map Landmark (visibility?: number) → LandmarkPoint (visibility: number)
      await scanSession.submit({
        user_height_cm: height,
        landmarks:      lms.map((l) => ({
          x:          l.x,
          y:          l.y,
          z:          l.z,
          visibility: l.visibility ?? 0,
        })),
        device_type:    "web",
      });

      // Stop camera after submission (processing continues on backend)
      stopCamera();
    },
    [capturedLandmarks, userHeightCm, landmarker, scanSession, stopCamera]
  );

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopCamera();
    landmarker.cleanup();
    scanSession.reset();
    setPhase("idle");
    setCurrentFrame(null);
    setUserHeightCm(null);
    setCapturedLandmarks(null);
    setError(null);
  }, [stopCamera, landmarker, scanSession]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    phase,
    currentFrame,
    sessionId:     scanSession.sessionId,
    sessionStatus: scanSession.sessionStatus,
    error,
    videoRef,
    canvasRef,
    startCapture,
    processFrame,
    captureAndSubmit,
    reset,
    userHeightCm,
    stopCamera,
  };
}
