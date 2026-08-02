"use client";
/**
 * @file EnhancedMeasurementFlow.tsx
 * @description TASK-014: Full AI body scan orchestration component with all enhanced features.
 *
 * This is the DASHBOARD version of the scan flow. The public page uses
 * InHouseMeasurementFlow (simpler, no auth required).
 *
 * Feature set:
 * ✅ Phone orientation detection (90° indicator: GREEN/YELLOW/RED)
 * ✅ Voice AI coaching at every phase transition
 * ✅ Auto-capture countdown (3-2-1 after 30 stable frames)
 * ✅ Landmark buffer averaging (best-frame selection)
 * ✅ Distance + centering detection with directional arrows
 * ✅ Two-pose flow: front → side → submit
 * ✅ Framer Motion phase transitions
 * ✅ Manual capture override button (accessibility)
 * ✅ Forest Green + Golden Yellow brand system throughout
 *
 * Phase flow:
 *   device_setup → positioning → front_aligning → front_countdown
 *   → front_captured → side_transition → side_positioning → side_aligning
 *   → side_countdown → side_captured → submitting → processing → completed
 *
 * Architecture:
 *   useEnhancedMeasurementCapture (state + hooks)
 *   useAutoCapture (state machine per pose)
 *   useVoiceCoach (speech synthesis)
 *   usePhoneOrientation (DeviceOrientationEvent)
 *
 * Usage:
 *   <EnhancedMeasurementFlow onComplete={(id) => router.push(`/measurements/${id}`)} />
 */

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEnhancedMeasurementCapture } from "../hooks/useEnhancedMeasurementCapture";
import { useAutoCapture } from "../hooks/useAutoCapture";
import { useVoiceCoach } from "../hooks/useVoiceCoach";
import { usePhoneOrientation, type OrientationStatus } from "../hooks/usePhoneOrientation";
import { PoseOverlay } from "./PoseOverlay";
import { CalibrationGuide } from "./CalibrationGuide";
import { VoiceCoachDisplay } from "./VoiceCoachDisplay";
import { PhoneOrientationIndicator } from "./PhoneOrientationIndicator";
import { CountdownOverlay } from "./CountdownOverlay";
import { ScanProgressStepper } from "./ScanProgressStepper";
import { ScanTutorialOverlay } from "./ScanTutorialOverlay";
import { MeasurementReveal } from "./MeasurementReveal";
import { BodySilhouetteOverlay } from "./BodySilhouetteOverlay";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { ScanFallbackManual } from "./ScanFallbackManual";
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
  const capture     = useEnhancedMeasurementCapture(videoRef, {
    sessionId: sessionId,
    initialWeightKg: initialWeightKg,
    initialSex: initialSex,
  });
  const voice       = useVoiceCoach();
  const orientation = usePhoneOrientation();
  const haptic      = useHapticFeedback();
  const [tutorialDone, setTutorialDone] = useState(false);

  // Separate auto-capture instances for front and side
  const frontAutoCapture = useAutoCapture({
    onCapture: () => {
      haptic.trigger("autoCapture");
      capture.triggerFrontCapture();
    },
    qualityThreshold:       POSE_THRESHOLDS.frontGood,
    stabilityFramesRequired: CAPTURE_CONFIG.landmarkBufferSize,
    enabled: capture.phase === "front_aligning",
  });

  const sideAutoCapture = useAutoCapture({
    onCapture: () => {
      haptic.trigger("autoCapture");
      capture.triggerSideCapture();
    },
    qualityThreshold:       POSE_THRESHOLDS.sideGood,
    stabilityFramesRequired: Math.round(CAPTURE_CONFIG.landmarkBufferSize * 0.7),
    enabled: capture.phase === "side_aligning",
  });

  // RAF refs
  const rafRef = useRef<number | null>(null);
  const frameLoopRef = useRef<() => void>(() => {});
  // A-2 FIX: Track previous frame's landmarks for jitter / stability detection
  const prevNosePosRef = useRef<{ x: number; y: number } | null>(null);

  // Destructure stable callbacks/values used inside the frame loop
  const { processFrame, phase: capturePhase } = capture;
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
  /**
   * Returns true when nose (landmark 0) hasn't moved more than JITTER_THRESHOLD
   * in normalised coords between consecutive frames.
   * dx²+dy² < 0.0004 ≡ sub-pixel motion at 720p → "stable".
   */
  function isFrameStable(frame: import("../hooks/useEnhancedMeasurementCapture").EnhancedCaptureFrame): boolean {
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
        const phase   = capturePhaseRef.current; // BUG-004 FIX: use ref, not stale closure

        // Tick auto-capture state machines — A-2 FIX: pass isStable for jitter gate
        // A-3 FIX: quality gated by readyToArm (pose intelligence) — computed below
        const isStable = isFrameStable(frame);

        // ── Intelligence-driven Voice Coaching ─────────────────────────────
        // Re-use or compute pose intelligence for this frame
        const intel = (frame.normalLandmarks && frame.worldLandmarks)
          ? analyzePose(frame.normalLandmarks, frame.worldLandmarks)
          : null;

        // ── Intelligence gate for auto-capture tick ─────────────────────────
        // CRITICAL FIX: readyToArm was computed but frontTick/sideTick were NEVER called.
        // Auto-capture countdown could never fire without these ticks.
        // If intel is available, require overallReady (score ≥ 70/100).
        // If intel is unavailable, fall back to pure quality score.
        const readyToArm = intel
          ? intel.overallReady
          : quality >= (phase.startsWith("side_") ? POSE_THRESHOLDS.sideGood : POSE_THRESHOLDS.frontGood);

        // Drive auto-capture state machines every frame
        // 3rd arg = overallReady so useAutoCapture can gate internally (WRONG-3)
        if (phase === "front_aligning" || phase === "front_countdown") {
          frontTick(quality, isStable, readyToArm);
        } else if (phase === "side_aligning" || phase === "side_countdown") {
          sideTick(quality, isStable, readyToArm);
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
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    // BUG-004 FIX: Use ref to avoid stale closure
    if (activePhases.includes(capturePhaseRef.current)) {
      rafRef.current = requestAnimationFrame(() => frameLoopRef.current());
    }
  }, [processFrame, frontTick, sideTick, speak, videoRef]);


  useEffect(() => {
    frameLoopRef.current = frameLoop;
  }, [frameLoop]);

  useEffect(() => {
    const activePhases = [
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

  // ── BUG-003 FIX: Auto-advance from device_setup when orientation unsupported ──
  // On desktop / HuggingFace web, DeviceOrientationEvent returns null gamma/beta
  // → status = "unsupported". We skip the orientation check automatically after
  // a 600ms grace period (long enough to show the camera preview).
  useEffect(() => {
    if (capture.phase !== "device_setup") return;
    if (orientation.status !== "unsupported") return;
    const timer = setTimeout(() => {
      capture.skipDeviceSetup();
    }, 600);
    return () => clearTimeout(timer);
  }, [capture.phase, orientation.status, capture.skipDeviceSetup]);

  // ── PHASE 2: Auto-advance from device_setup when phone is sustainedly level ──
  // isSustainedGood = phone has been GREEN for ≥ 1500ms continuous.
  // This gives real mobile users a seamless auto-advance to the scan phase.
  useEffect(() => {
    if (capture.phase !== "device_setup") return;
    if (!orientation.isSustainedGood) return;
    speak("phoneReady", { priority: false });
    const timer = setTimeout(() => {
      capture.skipDeviceSetup();
    }, 300); // 300ms grace — let the "Camera Ready" voice finish
    return () => clearTimeout(timer);
  }, [capture.phase, orientation.isSustainedGood, capture.skipDeviceSetup, speak]);

  // ── Real-time Pose Intelligence (drives silhouette + coaching) ────────────
  const poseIntelligence = useMemo(() => {
    const frame = capture.currentFrame;
    if (!frame?.normalLandmarks || !frame.worldLandmarks) return null;
    return analyzePose(frame.normalLandmarks, frame.worldLandmarks);
  }, [capture.currentFrame]);


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-4 w-full max-w-sm mx-auto", className)}>

      {/* ── Tutorial overlay (first-visit only) ─────────────────────────── */}
      {!tutorialDone && (
        <ScanTutorialOverlay onComplete={() => setTutorialDone(true)} />
      )}

      {/* ── Progress Stepper ── */}
      {capture.phase !== "idle" && capture.phase !== "loading_model" && capture.phase !== "failed" && (
        <ScanProgressStepper phase={capture.phase} className="px-1" />
      )}

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {capture.phase === "idle" && (
          <motion.div
            key="idle"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center text-[#52B788]">
                  <IconCamera />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Body Scan</h3>
                  <p className="text-xs text-white/50">30-second measurement scan</p>
                </div>
              </div>

              <ul className="text-xs text-white/50 space-y-1 list-disc list-inside">
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
                className="w-full rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#1B4332]
                           text-white font-semibold py-3 hover:from-[#1B4332] hover:to-[#0D2818]
                           transition flex items-center justify-center gap-2 shadow-lg shadow-[#2D6A4F]/25"
              >
                <IconCamera />
                Start Body Scan
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-white/40 hover:text-white/70 transition text-center"
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
            className="flex flex-col items-center gap-4 py-12"
          >
            <div className="w-16 h-16 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center">
              <IconLoader />
            </div>
            <p className="text-white/70 font-medium">Loading AI pose detection model...</p>
            <p className="text-white/30 text-xs">This usually takes 3–5 seconds</p>
          </motion.div>
        )}

        {/* ── DEVICE SETUP: Phone orientation check (with camera preview behind) ── */}
        {capture.phase === "device_setup" && (
          <motion.div
            key="device_setup"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 py-6"
          >
            {/* Camera preview BEHIND orientation UI */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[50vh] mx-auto w-full max-w-sm shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
              {/* Semi-transparent dark overlay for orientation UI */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 p-4">
                <h3 className="text-white font-bold text-lg text-center">Position Your Phone</h3>
                <p className="text-white/60 text-sm text-center">
                  Prop your phone upright at chest height
                </p>
                <PhoneOrientationIndicator
                  status={orientation.status}
                  gamma={orientation.gamma}
                  tiltDegrees={orientation.tiltDegrees}
                  tiltDirection={orientation.tiltDirection}
                  onStatusChange={handleOrientationChange}
                  onRequestPermission={orientation.requestPermission}
                />
              </div>
            </div>

            {/* A-1 FIX: Use capture.skipDeviceSetup() — replaces broken `as unknown as any` cast */}
            <button
              onClick={() => {
                if (orientation.isLevel || orientation.status === "unsupported") {
                  capture.skipDeviceSetup();
                }
              }}
              disabled={orientation.status === "bad"}
              className={cn(
                "w-full max-w-sm rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                orientation.isLevel || orientation.status === "unsupported"
                  ? "bg-[#2D6A4F] hover:bg-[#1B4332] text-white"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              <IconCamera />
              {orientation.isLevel ? "Camera Ready — Start Scan" : orientation.status === "unsupported" ? "Start Scan" : "Level the phone to continue"}
            </button>

            <p className="text-white/20 text-xs text-center">
              Or use without orientation check →{" "}
              <button
                className="underline text-white/40 hover:text-white/60"
                onClick={() => capture.skipDeviceSetup()}
              >
                Skip
              </button>
            </p>
          </motion.div>
        )}


        {/* ── CAMERA ACTIVE: positioning, front_aligning, front_countdown ── */}
        {["positioning", "front_aligning", "front_countdown",
          "side_positioning", "side_aligning", "side_countdown"].includes(capture.phase) && (
          <motion.div
            key="camera_active"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Camera viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[70vh] mx-auto w-full max-w-sm shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {/* Body silhouette guide — ghost outline user must step into (MirrSize-style) */}
              <BodySilhouetteOverlay
                isBodyDetected={(capture.currentFrame?.quality ?? 0) > 0.2}
                isFullBodyVisible={poseIntelligence?.isFullBodyVisible ?? false}
                isDistanceOptimal={poseIntelligence?.distanceStatus === "optimal"}
                isCentered={poseIntelligence?.centeringStatus === "centered"}
              />
              <PoseOverlay
                normalLandmarks={capture.currentFrame?.normalLandmarks ?? null}
                quality={capture.currentFrame?.quality ?? 0}
                canvasRef={canvasRef}
                videoRef={videoRef}
              />
              <CalibrationGuide
                phase={capture.phase}
                intelligence={poseIntelligence}
                qualityScore={capture.currentFrame?.quality ?? 0}
                estimatedHeight={capture.userHeightCm}
              />
              {/* Voice coaching text overlay */}
              <VoiceCoachDisplay
                text={voice.currentText}
                isSpeaking={voice.isSpeaking}
              />
              {/* Auto-capture countdown */}
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

              {/* Direction arrows (distance + centering) */}
              {capture.currentFrame?.distanceStatus === "too_close" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                  <div className="bg-black/70 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                    <span className="text-[#F4C430] text-lg">⬆</span>
                    <p className="text-[#F4C430] font-bold text-sm">Step back</p>
                  </div>
                </div>
              )}
              {capture.currentFrame?.distanceStatus === "too_far" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                  <div className="bg-black/70 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                    <span className="text-[#F4C430] text-lg">⬇</span>
                    <p className="text-[#F4C430] font-bold text-sm">Step closer</p>
                  </div>
                </div>
              )}
              {capture.currentFrame?.centeringStatus === "too_left" && (
                <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                  <div className="bg-black/70 rounded-full px-3 py-2">
                    <p className="text-[#F4C430] font-bold text-xl">→</p>
                  </div>
                </div>
              )}
              {capture.currentFrame?.centeringStatus === "too_right" && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                  <div className="bg-black/70 rounded-full px-3 py-2">
                    <p className="text-[#F4C430] font-bold text-xl">←</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quality bar */}
            <QualityProgressBar
              quality={capture.currentFrame?.quality ?? 0}
              bufferProgress={capture.bufferProgress}
              isSide={capture.isSidePosePhase}
            />

            {/* Manual capture override */}
            <div className="flex gap-3 max-w-sm mx-auto w-full">
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
                    ? "bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] text-white shadow-lg shadow-[#2D6A4F]/25"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                <IconCamera />
                {capture.currentFrame?.isGoodPose
                  ? (capture.isSidePosePhase ? "Capture Side Pose" : "Capture Front Pose")
                  : "Hold Still..."}
              </button>
              <button
                onClick={capture.reset}
                className="px-4 py-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition text-sm"
              >
                Cancel
              </button>
            </div>

            <p className="text-center text-white/30 text-xs">
              Auto-capture activates after {CAPTURE_CONFIG.landmarkBufferSize} stable frames
            </p>
          </motion.div>
        )}

        {/* ── FRONT CAPTURED confirmation ── */}
        {capture.phase === "front_captured" && (
          <motion.div
            key="front_captured"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-[#2D6A4F]/20 ring-4 ring-[#2D6A4F]/40 flex items-center justify-center text-[#52B788]"
            >
              <IconCheck />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">Front Pose ✓</h3>
              <p className="text-white/50 text-sm mt-1">
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
            className="flex flex-col items-center gap-5 py-10 text-center"
          >
            <motion.div
              animate={{ rotateY: [0, 90, 0] }}
              transition={{ duration: 1.5, repeat: 1 }}
              className="text-5xl"
            >
              🔄
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">Turn to Your Right Side</h3>
              <p className="text-white/50 text-sm mt-1">
                Stand sideways with your right shoulder facing the camera
              </p>
            </div>
            <button
              onClick={capture.advanceToSidePhase}
              className="rounded-xl bg-[#F4C430] text-[#0A0A0A] font-semibold px-6 py-3 hover:bg-[#C9A227] transition"
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
            className="flex flex-col items-center gap-6 py-12 max-w-sm mx-auto"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[#2D6A4F]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#2D6A4F] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#52B788]">
                <IconLoader />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">
                {capture.phase === "submitting" ? "Uploading scan data..." : "AI is processing your measurements..."}
              </p>
              <p className="text-white/40 text-xs mt-1">Usually takes 5–15 seconds</p>
            </div>
            <div className="w-full space-y-2 text-xs text-white/40">
              {[
                "Validating pose quality",
                "Extracting body landmarks",
                "Computing 14 measurements",
                "Saving your profile",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    i === 0 ? "border-[#2D6A4F] bg-[#2D6A4F]/20" : "border-white/10"
                  )}>
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── COMPLETED — Full MeasurementReveal ── */}
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
                  window.location.href = `/client/dashboard/measurements`;
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
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-16 h-16 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white font-bold">Scan Failed</p>
              {capture.error && <p className="text-red-400/80 text-xs">{capture.error}</p>}
              <button
                onClick={capture.reset}
                className="rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-2 font-medium text-sm transition flex items-center gap-2"
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

  const barColor = isGood ? "bg-[#2D6A4F]" : isMed ? "bg-[#F4C430]" : "bg-[#DC2626]";
  const textColor = isGood ? "text-[#52B788]" : isMed ? "text-[#F4C430]" : "text-[#DC2626]/80";

  return (
    <div className="max-w-sm mx-auto w-full flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-white/40">
        <span>Pose quality</span>
        <span className={cn("font-semibold", textColor)}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-200", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Buffer progress (stability accumulator) */}
      {bufferProgress > 0 && (
        <>
          <div className="flex justify-between text-xs text-white/30">
            <span>Stability</span>
            <span>{Math.round(bufferProgress * 100)}%</span>
          </div>
          <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F4C430] transition-all duration-100"
              style={{ width: `${bufferProgress * 100}%` }}
            />
          </div>
        </>
      )}
      <p className="text-xs text-white/30">
        {isGood
          ? "✓ Great pose — auto-capturing..."
          : isMed
          ? "Adjust your position..."
          : "Stand straight and face the camera"}
      </p>
    </div>
  );
}
