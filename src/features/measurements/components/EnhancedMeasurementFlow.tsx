"use client";
/**
 * @file EnhancedMeasurementFlow.tsx
 * @description Full AI body scan orchestration component.
 *
 * This is the DASHBOARD version of the scan flow.
 *
 * Feature set:
 * - Phone orientation detection with continuous level guard
 * - Full-screen camera viewport like a selfie preview
 * - Voice AI coaching at every phase transition
 * - Auto-capture countdown with safety gates
 * - Landmark buffer averaging
 * - Distance + centering detection with directional guidance
 * - Two-pose flow: front → side → submit
 * - Brand-compliant colors (#01454A, #FDA600, #F8F5ED, #1A1208)
 */

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEnhancedMeasurementCapture } from "../hooks/useEnhancedMeasurementCapture";
import type { EnhancedCaptureFrame } from "../hooks/useEnhancedMeasurementCapture";
import { useAutoCapture } from "../hooks/useAutoCapture";
import { useVoiceCoach } from "../hooks/useVoiceCoach";
import { usePhoneOrientation, type OrientationStatus } from "../hooks/usePhoneOrientation";
import { CalibrationGuide } from "./CalibrationGuide";
import { VoiceCoachDisplay } from "./VoiceCoachDisplay";
import { PhoneOrientationIndicator } from "./PhoneOrientationIndicator";
import { CountdownOverlay } from "./CountdownOverlay";
import { ScanTutorialOverlay } from "./ScanTutorialOverlay";
import { MeasurementReveal } from "./MeasurementReveal";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { ScanFallbackManual } from "./ScanFallbackManual";
import { CameraViewport } from "./CameraViewport";
import { useScanStore } from "../store/scanStore";
import { encryptLandmarks, decryptLandmarks } from "../lib/scanCrypto";
import { cn } from "@/lib/utils";
import { POSE_THRESHOLDS, CAPTURE_CONFIG } from "@/lib/brand";
import { analyzePose } from "../lib/poseIntelligence";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCamera  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>;
const IconCheck   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const IconLoader  = () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
const IconRefresh = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EnhancedMeasurementFlowProps {
  onComplete?: (profileId: string | number | null) => void;
  onCancel?:   () => void;
  /** Pre-filled height from marketing entry modal */
  initialHeightCm?: number;
  /** Pre-filled age for backend prediction — A-5 FIX: now actually forwarded to backend */
  initialAge?: number;
  /** Pre-filled weight for BMI correction */
  initialWeightKg?: number;
  /** Pre-filled biological sex for BMI correction */
  initialSex?: "male" | "female" | "neutral";
  /** Session ID from backend initiate — if provided, used for submitLandmarks */
  sessionId?: string;
  className?: string;
}

// ─── Phase steps for progress stepper ────────────────────────────────────────



// ─── Animation variants ───────────────────────────────────────────────────────

const PAGE_VARIANTS = {
  initial: { opacity: 0, x: 30  },
  animate: { opacity: 1, x: 0   },
  exit:    { opacity: 0, x: -30 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EnhancedMeasurementFlow({
  onComplete,
  onCancel,
  initialHeightCm,
  initialAge,
  initialWeightKg,
  initialSex,
  sessionId,
  className,
}: EnhancedMeasurementFlowProps) {
  // Camera refs owned by the component (avoids React Compiler ref-during-render warnings)
  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orientation = usePhoneOrientation();
  const orientationConfidence = orientation.permissionState === "granted"
    ? orientation.isLevel
      ? 1
      : 0.5
    : 0;

  const capture = useEnhancedMeasurementCapture(videoRef, {
    sessionId,
    initialWeightKg,
    initialSex,
    orientationConfidence,
  });

  const voice  = useVoiceCoach();
  const haptic = useHapticFeedback();
  const [tutorialDone, setTutorialDone] = useState(false);

  // Separate auto-capture instances for front and side
  const frontAutoCapture = useAutoCapture({
    onCapture: () => {
      haptic.trigger("autoCapture");
      capture.triggerFrontCapture();
    },
    qualityThreshold:       POSE_THRESHOLDS.frontGood,
    stabilityFramesRequired: CAPTURE_CONFIG.landmarkBufferSize,
    enabled: capture.phase === "front_aligning" || capture.phase === "front_countdown",
  });

  const sideAutoCapture = useAutoCapture({
    onCapture: () => {
      haptic.trigger("autoCapture");
      capture.triggerSideCapture();
    },
    qualityThreshold:       POSE_THRESHOLDS.sideGood,
    stabilityFramesRequired: Math.round(CAPTURE_CONFIG.landmarkBufferSize * 0.7),
    enabled: capture.phase === "side_aligning" || capture.phase === "side_countdown",
  });

  // RAF refs
  const rafRef = useRef<number | null>(null);
  const frameLoopRef = useRef<() => void>(() => {});
  const prevNosePosRef = useRef<{ x: number; y: number } | null>(null);

  // ── Destructure capture properties used for persistence and frame loop ───
  const { processFrame, phase: capturePhase, skipDeviceSetup, frontLandmarks: captureFrontLandmarks, userHeightCm: captureUserHeightCm } = capture;

  const scanStorePhase     = useScanStore((s) => s.enhancedPhase);
  const scanStoreSessionId = useScanStore((s) => s.sessionId);
  const frontLandmarksCipher = useScanStore((s) => s.frontLandmarksCipher);
  const persistEnhancedState = useScanStore((s) => s.persistEnhancedState);
  const resetScanStore = useScanStore((s) => s.reset);
  const setScanPhase = useScanStore((s) => s.setPhase);

  // ── Sync phase + front landmarks to scanStore for refresh-resume ───────
  useEffect(() => {
    if (!sessionId) return;

    const mapToScanPhase = (phase: typeof capturePhase): import("../store/scanStore").ScanPhase => {
      switch (phase) {
        case "idle": return "idle";
        case "loading_model":
        case "device_setup":
        case "positioning":
        case "front_aligning":
        case "front_countdown":
          return "capturing_front";
        case "front_captured":
          return "side_prompt";
        case "side_transition":
        case "side_positioning":
        case "side_aligning":
        case "side_countdown":
          return "capturing_side";
        case "side_captured":
        case "submitting":
          return "submitting";
        case "processing": return "processing";
        case "completed":  return "completed";
        case "failed":     return "failed";
        default:           return "capturing_front";
      }
    };

    const save = async () => {
      let cipher: string | null = null;
      if (captureFrontLandmarks && capturePhase !== "idle") {
        cipher = await encryptLandmarks(captureFrontLandmarks, sessionId);
      }
      persistEnhancedState(capturePhase, cipher);
      setScanPhase(mapToScanPhase(capturePhase));
    };
    void save();
  }, [capturePhase, captureFrontLandmarks, sessionId, persistEnhancedState, setScanPhase]);

  // ── Trigger auto-start / resume from persisted scanStore state ─────────
  const didAutoStartRef = useRef(false);
  useEffect(() => {
    if (didAutoStartRef.current) return;
    if (sessionId && scanStoreSessionId === sessionId && scanStorePhase && scanStorePhase !== "idle") {
      didAutoStartRef.current = true;
      void (async () => {
        await capture.startCapture(initialHeightCm, initialAge ?? undefined);
        if (["positioning", "front_aligning", "front_countdown"].includes(scanStorePhase)) {
          capture.skipDeviceSetup();
        } else if (scanStorePhase === "front_captured" && frontLandmarksCipher) {
          const landmarks = await decryptLandmarks(frontLandmarksCipher, sessionId);
          if (landmarks) {
            capture.restoreFrontLandmarks(landmarks);
          } else {
            capture.skipDeviceSetup();
          }
        } else if (["side_transition", "side_positioning", "side_aligning", "side_countdown"].includes(scanStorePhase)) {
          capture.skipDeviceSetup();
          capture.advanceToSidePhase();
        }
      })();
    }
  }, [sessionId, scanStoreSessionId, scanStorePhase, initialHeightCm, initialAge, frontLandmarksCipher, capture]);

  // ── On completion reset scan store ─────────────────────────────────────
  useEffect(() => {
    if (capturePhase === "completed" || capturePhase === "failed") {
      resetScanStore();
    }
  }, [capturePhase, resetScanStore]);

  const { tick: frontTick } = frontAutoCapture;
  const { tick: sideTick }   = sideAutoCapture;
  const { speak } = voice;

  // BUG-004 FIX: Mirror capture.phase into a ref so the rAF closure always
  // reads the CURRENT phase (not the stale value from when useCallback fired).
  const capturePhaseRef = useRef<typeof capturePhase>(capturePhase);
  useEffect(() => {
    capturePhaseRef.current = capturePhase;
  }, [capturePhase]);

  // ── Jitter / Stability helper ─────────────────────────────────────────────
  function isFrameStable(frame: EnhancedCaptureFrame): boolean {
    const nose = frame.normalLandmarks?.[0];
    if (!nose || (nose.visibility ?? 0) < 0.5) return false;
    const prev = prevNosePosRef.current;
    const jitterThreshold = 0.02 * 0.02; // 0.0004 in normalised units
    const isStable = prev
      ? (nose.x - prev.x) ** 2 + (nose.y - prev.y) ** 2 < jitterThreshold
      : false;
    prevNosePosRef.current = { x: nose.x, y: nose.y };
    return isStable;
  }

  // ── Frame loop ───────────────────────────────────────────────────────────
  const frameLoop = useCallback(() => {
    const videoEl = videoRef.current;
    const ready   =
      videoEl !== null &&
      videoEl.readyState >= 2 &&
      videoEl.videoWidth  > 0 &&
      videoEl.videoHeight > 0;

    if (ready) {
      const frame = processFrame();
      if (frame) {
        const quality = frame.quality;
        const phase   = capturePhaseRef.current;

        // Tick auto-capture state machines — A-2 FIX: pass isStable for jitter gate
        // A-3 FIX: quality gated by readyToArm (pose intelligence) — computed below
        const isStable = isFrameStable(frame);

        // ── Intelligence-driven Voice Coaching ─────────────────────────────
        // Re-use or compute pose intelligence for this frame
        const intel = (frame.normalLandmarks && frame.worldLandmarks)
          ? analyzePose(frame.normalLandmarks, frame.worldLandmarks, captureUserHeightCm ?? undefined)
          : null;

        // ── Intelligence gate for auto-capture tick ─────────────────────────
        // CRITICAL FIX: readyToArm was computed but frontTick/sideTick were NEVER called.
        // Auto-capture countdown could never fire without these ticks.
        // If intel is available, require overallReady (score ≥ 70/100).
        // If intel is unavailable, fall back to pure quality score.
        const readyToArm = intel
          ? intel.overallReady
          : quality >= (phase.startsWith("side_") ? POSE_THRESHOLDS.sideGood : POSE_THRESHOLDS.frontGood);

        // Drive exactly one auto-capture state machine per processed frame.
        const orientationReady =
          orientation.isLevel ||
          orientation.permissionState === "unsupported" ||
          orientation.permissionState === "denied";

        if (phase === "front_aligning" || phase === "front_countdown") {
          frontTick({ quality, isStable, overallReady: readyToArm, orientationReady });
        } else if (phase === "side_aligning" || phase === "side_countdown") {
          sideTick({ quality, isStable, overallReady: readyToArm, orientationReady });
        }

        if (intel) {
          // Full body visibility
          if (!intel.isFullBodyVisible && intel.missingParts.includes("head")) {
            speak("stepBack", { minIntervalMs: 6000 });
          } else if (!intel.isFullBodyVisible && intel.missingParts.includes("ankles")) {
            speak("stepBack", { minIntervalMs: 6000 });
          }

          // Distance
          if (intel.distanceStatus === "too_close") speak("stepBack", { minIntervalMs: 5000 });
          if (intel.distanceStatus === "too_far")   speak("stepForward", { minIntervalMs: 5000 });

          // Centering — use direct left/right first
          if (intel.centeringStatus === "too_left")  speak("moveRight", { minIntervalMs: 5000 });
          if (intel.centeringStatus === "too_right") speak("moveLeft",  { minIntervalMs: 5000 });

          // Arms coaching
          if (intel.armsStatus === "at_sides")   speak("armsOpen",   { minIntervalMs: 7000 });
          if (intel.armsStatus === "too_high")   speak("spreadArms", { minIntervalMs: 7000 });

          // Overall readiness → perfect position / hold still
          if (intel.overallReady && (phase === "front_aligning" || phase === "side_aligning")) {
            speak("perfectPosition", { minIntervalMs: 8000 });
          }
        } else {
          // Fallback: use raw frame distance/centering
          if (frame.distanceStatus === "too_close") speak("stepBack", { minIntervalMs: 5000 });
          if (frame.distanceStatus === "too_far")   speak("stepForward", { minIntervalMs: 5000 });
          if (frame.centeringStatus === "too_left")  speak("moveRight", { minIntervalMs: 5000 });
          if (frame.centeringStatus === "too_right") speak("moveLeft",  { minIntervalMs: 5000 });
        }
      }
    }

    const activePhases = [
      "device_setup",
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    // BUG-004 FIX: Use ref to avoid stale closure
    if (activePhases.includes(capturePhaseRef.current)) {
      rafRef.current = requestAnimationFrame(() => frameLoopRef.current());
    }
  }, [processFrame, frontTick, sideTick, speak, videoRef, orientation.isLevel, orientation.permissionState, captureUserHeightCm]);

  useEffect(() => {
    frameLoopRef.current = frameLoop;
  }, [frameLoop]);

  useEffect(() => {
    const activePhases = [
      "device_setup",
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    if (activePhases.includes(capturePhase)) {
      rafRef.current = requestAnimationFrame(() => frameLoopRef.current());
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [capturePhase]);

  // ── Voice coaching on phase transitions ──────────────────────────────────
  useEffect(() => {
    const phase = capture.phase;
    const map: Partial<Record<typeof phase, Parameters<typeof speak>[0]>> = {
      device_setup:     "placePhone",
      positioning:      "stepIntoFrame",
      front_aligning:   "standStraight",
      front_captured:   "frontCaptured",
      side_transition:  "turnSide",
      side_aligning:    "sideHoldStill",
      side_captured:    "sideCaptured",
      submitting:       "processing",
      completed:        "complete",
    };
    const key = map[phase as keyof typeof map];
    if (key) speak(key, { priority: true });
  }, [capture.phase, speak]);

  // ── Speak welcome on first mount ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => speak("welcome", { priority: true }), 500);
    return () => clearTimeout(timer);
  }, [speak]);

  // ── On completion ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (capture.phase === "completed") {
      const profileId = capture.sessionStatus?.measurement_profile_id ?? null;
      onComplete?.(profileId ?? null);
    }
  }, [capture.phase, capture.sessionStatus, onComplete]);

  // ── Phone orientation voice coaching ─────────────────────────────────────
  const handleOrientationChange = useCallback(
    (status: OrientationStatus) => {
      if (status === "good") speak("phoneReady", { priority: false });
      if (status === "bad")  speak("phoneNotLevel");
    },
    [speak]
  );

  // ── Real-time Pose Intelligence (drives silhouette + coaching) ────────────
  const poseIntelligence = useMemo(() => {
    const frame = capture.currentFrame;
    if (!frame?.normalLandmarks || !frame.worldLandmarks) return null;
    return analyzePose(frame.normalLandmarks, frame.worldLandmarks, captureUserHeightCm ?? undefined);
  }, [capture.currentFrame, captureUserHeightCm]);

  // ── Render helpers ───────────────────────────────────────────────────────

  const canContinueSetup =
    orientation.isLevel ||
    orientation.permissionState === "unsupported" ||
    orientation.permissionState === "denied";

  // A-2: Optional auto-advance after phone has been steadily level for 2.5s
  useEffect(() => {
    if (capturePhase === "device_setup" && orientation.isSustainedGood) {
      skipDeviceSetup();
    }
  }, [capturePhase, orientation.isSustainedGood, skipDeviceSetup]);

  const isCameraActive =
    ["device_setup", "positioning", "front_aligning", "front_countdown",
     "side_positioning", "side_aligning", "side_countdown"].includes(capture.phase);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("relative w-full", className)}>

      {/* ── Tutorial overlay (first-visit only) ─────────────────────────── */}
      {!tutorialDone && capture.phase === "idle" && (
        <ScanTutorialOverlay onComplete={() => setTutorialDone(true)} />
      )}

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {capture.phase === "idle" && (
          <motion.div
            key="idle"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5 min-h-[80vh] justify-center px-4"
          >
            <div className="rounded-2xl border border-[var(--BV-green)]/10 bg-[var(--BV-surface)] p-6 flex flex-col gap-5 max-w-sm mx-auto shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--BV-green)]/10 flex items-center justify-center text-[var(--BV-green)]">
                  <IconCamera />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--BV-ink)]">AI Body Scan</h3>
                  <p className="text-xs text-[var(--BV-muted)]">30-second measurement scan</p>
                </div>
              </div>

              <ul className="text-xs text-[var(--BV-slate)] space-y-1 list-disc list-inside">
                <li>Stand 1.5–2 metres from camera</li>
                <li>Wear fitted clothing (no baggy clothes)</li>
                <li>Good lighting (face the window)</li>
                <li>Keep arms slightly away from body</li>
              </ul>

              <button
                onClick={async () => {
                  // WRONG-4 FIX: iOS 13+ DeviceOrientation permission MUST run inside
                  // a user gesture before orientation events fire. Request first, then start.
                  try {
                    await orientation.requestPermission();
                  } catch {
                    // Continue without orientation — desktop / denied still usable
                  }
                  await capture.startCapture(initialHeightCm, initialAge ?? undefined);
                }}
                className="w-full rounded-xl bg-[var(--BV-gold)] text-[var(--BV-ink)]
                           font-semibold py-3 hover:bg-[var(--BV-gold-dark)]
                           transition flex items-center justify-center gap-2 shadow-md"
              >
                <IconCamera />
                Start Body Scan
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-[var(--BV-muted)] hover:text-[var(--BV-ink)] transition text-center"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── LOADING MODEL ── */}
        {capture.phase === "loading_model" && (
          <motion.div
            key="loading"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 py-12 min-h-[80vh] justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--BV-green)]/10 flex items-center justify-center text-[var(--BV-green)]">
              <IconLoader />
            </div>
            <p className="text-[var(--BV-ink)]/70 font-medium">Loading AI pose detection model...</p>
            <p className="text-[var(--BV-muted)] text-xs">This usually takes 3–5 seconds</p>
          </motion.div>
        )}

        {/* ── CAMERA ACTIVE (all camera phases) ── */}
        {isCameraActive && (
          <CameraViewport
            key="camera_active"
            videoRef={videoRef}
            canvasRef={canvasRef}
            phase={capture.phase}
            frame={capture.currentFrame}
            intelligence={poseIntelligence}
            orientationStatus={orientation.status}
            phoneBadForMs={orientation.badForMs}
          >
            {capture.phase === "device_setup" && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 pointer-events-none">
                <div className="flex flex-col items-center gap-3 mt-8">
                  <div className="rounded-xl bg-[var(--BV-cream)]/85 px-4 py-2 text-center backdrop-blur-sm border border-[var(--BV-cream-dark)]">
                    <h3 className="text-[var(--BV-ink)] font-bold text-lg">Position Your Phone</h3>
                    <p className="text-[var(--BV-slate)] text-sm">Prop it upright at chest height</p>
                  </div>
                  <div className="pointer-events-auto">
                    <PhoneOrientationIndicator
                      status={orientation.status}
                      gamma={orientation.gamma}
                      tiltDegrees={orientation.tiltDegrees}
                      tiltDirection={orientation.tiltDirection}
                      onStatusChange={handleOrientationChange}
                      onRequestPermission={orientation.requestPermission}
                    />
                  </div>
                  <div
                    className="rounded-full bg-[var(--BV-cream)]/85 px-3 py-1 text-[11px] text-[var(--BV-slate)] backdrop-blur-sm border border-[var(--BV-cream-dark)]"
                    aria-live="polite"
                  >
                    {capture.cameraStatus === "ready"
                      ? "Camera live"
                      : capture.cameraStatus === "waiting_for_metadata"
                      ? "Waiting for first camera frame…"
                      : capture.cameraStatus === "attaching"
                      ? "Connecting camera…"
                      : capture.cameraStatus === "requesting"
                      ? "Requesting camera permission…"
                      : "Preparing camera…"}
                  </div>
                </div>

                <div className="w-full max-w-sm pointer-events-auto mb-6 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (canContinueSetup) skipDeviceSetup();
                    }}
                    disabled={!canContinueSetup}
                    className={cn(
                      "w-full rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                      canContinueSetup
                        ? "bg-[var(--BV-gold)] text-[var(--BV-ink)] hover:bg-[var(--BV-gold-dark)]"
                        : "bg-[var(--BV-surface)] text-[var(--BV-muted)] cursor-not-allowed"
                    )}
                  >
                    <IconCamera />
                    {orientation.isLevel
                      ? "Phone is level — Continue"
                      : canContinueSetup
                      ? "Continue without orientation"
                      : "Level the phone to continue"}
                  </button>

                  <p className="text-[var(--BV-muted)] text-xs text-center">
                    Or use without orientation check →{" "}
                    <button
                      className="underline text-[var(--BV-slate)] hover:text-[var(--BV-ink)]"
                      onClick={() => skipDeviceSetup()}
                    >
                      Skip
                    </button>
                  </p>
                </div>
              </div>
            )}

            {capture.phase !== "device_setup" && (
              <>
                <CalibrationGuide
                  phase={capture.phase}
                  intelligence={poseIntelligence}
                  qualityScore={capture.currentFrame?.quality ?? 0}
                  estimatedHeight={captureUserHeightCm}
                />
                <VoiceCoachDisplay
                  text={voice.currentText}
                  isSpeaking={voice.isSpeaking}
                />
                <CountdownOverlay
                  countdown={
                    capture.phase.startsWith("side_")
                      ? sideAutoCapture.countdown
                      : frontAutoCapture.countdown
                  }
                  isCapturing={
                    capture.phase.startsWith("side_")
                      ? sideAutoCapture.isCapturing
                      : frontAutoCapture.isCapturing
                  }
                  isArming={
                    capture.phase.startsWith("side_")
                      ? sideAutoCapture.isArming
                      : frontAutoCapture.isArming
                  }
                />

                {/* Direction guidance */}
                {capture.currentFrame?.distanceStatus === "too_close" && (
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-40">
                    <div className="bg-[var(--BV-ink)]/70 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                      <span className="text-[var(--BV-gold)] text-lg">⬆</span>
                      <p className="text-[var(--BV-gold)] font-bold text-sm">Step back</p>
                    </div>
                  </div>
                )}
                {capture.currentFrame?.distanceStatus === "too_far" && (
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-40">
                    <div className="bg-[var(--BV-ink)]/70 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                      <span className="text-[var(--BV-gold)] text-lg">⬇</span>
                      <p className="text-[var(--BV-gold)] font-bold text-sm">Step closer</p>
                    </div>
                  </div>
                )}
                {capture.currentFrame?.centeringStatus === "too_left" && (
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none z-40">
                    <div className="bg-[var(--BV-ink)]/70 rounded-full px-3 py-2">
                      <p className="text-[var(--BV-gold)] font-bold text-xl">→</p>
                    </div>
                  </div>
                )}
                {capture.currentFrame?.centeringStatus === "too_right" && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none z-40">
                    <div className="bg-[var(--BV-ink)]/70 rounded-full px-3 py-2">
                      <p className="text-[var(--BV-gold)] font-bold text-xl">←</p>
                    </div>
                  </div>
                )}

                {/* Quality bar */}
                <div className="absolute bottom-24 left-4 right-4 z-40 max-w-sm mx-auto">
                  <QualityProgressBar
                    quality={capture.currentFrame?.quality ?? 0}
                    bufferProgress={capture.bufferProgress}
                    isSide={capture.isSidePosePhase}
                  />
                </div>

                {/* Manual capture */}
                <div className="absolute bottom-6 left-4 right-4 z-40 flex gap-3 max-w-sm mx-auto">
                  <button
                    onClick={
                      capture.isSidePosePhase
                        ? sideAutoCapture.forceCapture
                        : frontAutoCapture.forceCapture
                    }
                    disabled={!(capture.currentFrame?.isGoodPose)}
                    className={cn(
                      "flex-1 rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                      capture.currentFrame?.isGoodPose
                        ? "bg-[var(--BV-gold)] text-[var(--BV-ink)] hover:bg-[var(--BV-gold-dark)]"
                        : "bg-[var(--BV-surface)] text-[var(--BV-muted)] cursor-not-allowed"
                    )}
                  >
                    <IconCamera />
                    {capture.currentFrame?.isGoodPose
                      ? (capture.isSidePosePhase ? "Capture Side Pose" : "Capture Front Pose")
                      : "Hold Still..."}
                  </button>
                  <button
                    onClick={capture.reset}
                    className="px-4 py-3 rounded-xl bg-[var(--BV-surface)] text-[var(--BV-slate)] hover:bg-[var(--BV-cream-dark)] transition text-sm"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </CameraViewport>
        )}

        {/* ── FRONT CAPTURED ── */}
        {capture.phase === "front_captured" && (
          <motion.div
            key="front_captured"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 py-10 text-center min-h-[80vh] justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-[var(--BV-green)]/10 ring-4 ring-[var(--BV-green)]/30 flex items-center justify-center text-[var(--BV-green)]"
            >
              <IconCheck />
            </motion.div>
            <div>
              <h3 className="text-[var(--BV-ink)] font-bold text-lg">Front Pose ✓</h3>
              <p className="text-[var(--BV-muted)] text-sm mt-1">
                Excellent! Now turning for side pose...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── SIDE TRANSITION ── */}
        {capture.phase === "side_transition" && (
          <motion.div
            key="side_transition"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 py-10 text-center min-h-[80vh] justify-center"
          >
            <motion.div
              animate={{ rotateY: [0, 90, 0] }}
              transition={{ duration: 1.5, repeat: 1 }}
              className="text-5xl"
            >
              🔄
            </motion.div>
            <div>
              <h3 className="text-[var(--BV-ink)] font-bold text-lg">Turn to Your Right Side</h3>
              <p className="text-[var(--BV-muted)] text-sm mt-1">
                Stand sideways with your right shoulder facing the camera
              </p>
            </div>
            <button
              onClick={capture.advanceToSidePhase}
              className="rounded-xl bg-[var(--BV-gold)] text-[var(--BV-ink)] font-semibold px-6 py-3 hover:bg-[var(--BV-gold-dark)] transition"
            >
              I&apos;m in position →
            </button>
          </motion.div>
        )}

        {/* ── SUBMITTING / PROCESSING ── */}
        {(capture.phase === "submitting" || capture.phase === "processing") && (
          <motion.div
            key="processing"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-6 py-12 min-h-[80vh] justify-center px-4"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--BV-green)]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[var(--BV-green)] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[var(--BV-green)]">
                <IconLoader />
              </div>
            </div>
            <div className="text-center max-w-sm">
              <p className="text-[var(--BV-ink)] font-semibold">
                {capture.phase === "submitting" ? "Uploading scan data..." : "AI is processing your measurements..."}
              </p>
              <p className="text-[var(--BV-muted)] text-xs mt-1">Usually takes 5–15 seconds</p>
            </div>
            <div className="w-full max-w-sm space-y-2 text-xs text-[var(--BV-muted)]">
              {[
                "Validating pose quality",
                "Extracting body landmarks",
                "Computing 14 measurements",
                "Saving your profile",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    i === 0 ? "border-[var(--BV-green)] bg-[var(--BV-green)]/10" : "border-[var(--BV-muted)]/20"
                  )}>
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--BV-green)] animate-pulse" />}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── COMPLETED ── */}
        {capture.phase === "completed" && capture.sessionStatus && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MeasurementReveal
              scanResult={capture.sessionStatus}
              qualityScore={capture.sessionStatus.scan_confidence ?? 0.8}
              onRetake={capture.reset}
              onViewProfile={() => {
                const profileId = capture.sessionStatus?.measurement_profile_id;
                if (profileId) {
                  window.location.href = "/client/dashboard/measurements";
                }
              }}
            />
          </motion.div>
        )}

        {/* -- FAILED -- */}
        {capture.phase === "failed" && (
          <motion.div
            key="failed"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 min-h-[80vh] justify-center px-4"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--BV-red-alert)]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--BV-red-alert)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[var(--BV-ink)] font-bold">Scan Failed</p>
              {capture.error && <p className="text-[var(--BV-red-alert)]/80 text-xs">{capture.error}</p>}
              <button
                onClick={capture.reset}
                className="rounded-xl bg-[var(--BV-green)] hover:bg-[var(--BV-green-light)] text-[var(--BV-cream)] px-6 py-2 font-medium text-sm transition flex items-center gap-2"
              >
                <IconRefresh /> Try Again
              </button>
            </div>
            <ScanFallbackManual variant="inline" />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Quality Progress Bar ─────────────────────────────────────────────────────

function QualityProgressBar({
  quality,
  bufferProgress,
  isSide,
}: {
  quality: number;
  bufferProgress: number;
  isSide: boolean;
}) {
  const pct = Math.round(quality * 100);
  const threshold = isSide ? POSE_THRESHOLDS.sideGood : POSE_THRESHOLDS.frontGood;
  const isGood   = quality >= threshold;
  const isMed    = quality >= (isSide ? POSE_THRESHOLDS.sideMedium : POSE_THRESHOLDS.frontMedium);

  const barColor = isGood ? "bg-[var(--BV-green)]" : isMed ? "bg-[var(--BV-gold)]" : "bg-[var(--BV-red-alert)]";
  const textColor = isGood ? "text-[var(--BV-green)]" : isMed ? "text-[var(--BV-gold)]" : "text-[var(--BV-red-alert)]/80";

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-[var(--BV-muted)]">
        <span>Pose quality</span>
        <span className={cn("font-semibold", textColor)}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--BV-cream-dark)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-200", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Buffer progress (stability accumulator) */}
      {bufferProgress > 0 && (
        <>
          <div className="flex justify-between text-xs text-[var(--BV-muted)]">
            <span>Stability</span>
            <span>{Math.round(bufferProgress * 100)}%</span>
          </div>
          <div className="h-0.5 rounded-full bg-[var(--BV-cream-dark)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--BV-gold)] transition-all duration-100"
              style={{ width: `${bufferProgress * 100}%` }}
            />
          </div>
        </>
      )}
      <p className="text-xs text-[var(--BV-muted)]">
        {isGood
          ? "✓ Great pose — auto-capturing..."
          : isMed
          ? "Adjust your position..."
          : "Stand straight and face the camera"}
      </p>
    </div>
  );
}