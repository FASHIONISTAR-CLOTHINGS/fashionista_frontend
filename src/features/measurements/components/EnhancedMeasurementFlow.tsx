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

import { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEnhancedMeasurementCapture } from "../hooks/useEnhancedMeasurementCapture";
import { useAutoCapture } from "../hooks/useAutoCapture";
import { useVoiceCoach } from "../hooks/useVoiceCoach";
import { usePhoneOrientation } from "../hooks/usePhoneOrientation";
import { PoseOverlay } from "./PoseOverlay";
import { CalibrationGuide } from "./CalibrationGuide";
import { VoiceCoachDisplay } from "./VoiceCoachDisplay";
import { PhoneOrientationIndicator } from "./PhoneOrientationIndicator";
import { CountdownOverlay } from "./CountdownOverlay";
import { cn } from "@/lib/utils";
import { POSE_THRESHOLDS, CAPTURE_CONFIG } from "@/lib/brand";

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
  /** Pre-filled age for backend prediction */
  initialAge?: number;
  className?: string;
}

// ─── Phase steps for progress stepper ────────────────────────────────────────

const STEPPER_STEPS = [
  { key: "setup",    label: "Setup"    },
  { key: "front",    label: "Front"    },
  { key: "side",     label: "Side"     },
  { key: "results",  label: "Results"  },
] as const;

function getStepperIndex(phase: string): number {
  if (phase === "device_setup" || phase === "loading_model") return 0;
  if (phase.startsWith("front") || phase === "positioning") return 1;
  if (phase.startsWith("side")) return 2;
  if (phase === "submitting" || phase === "processing" || phase === "completed") return 3;
  return 0;
}

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
  className,
}: EnhancedMeasurementFlowProps) {
  const capture     = useEnhancedMeasurementCapture();
  const voice       = useVoiceCoach();
  const orientation = usePhoneOrientation();

  // Separate auto-capture instances for front and side
  const frontAutoCapture = useAutoCapture({
    onCapture: () => capture.triggerFrontCapture(),
    qualityThreshold:       POSE_THRESHOLDS.frontGood,
    stabilityFramesRequired: CAPTURE_CONFIG.landmarkBufferSize,
    enabled: capture.phase === "front_aligning",
  });

  const sideAutoCapture = useAutoCapture({
    onCapture: () => capture.triggerSideCapture(),
    qualityThreshold:       POSE_THRESHOLDS.sideGood,
    stabilityFramesRequired: Math.round(CAPTURE_CONFIG.landmarkBufferSize * 0.7),
    enabled: capture.phase === "side_aligning",
  });

  // RAF ref
  const rafRef = useRef<number | null>(null);

  // ── Frame loop ───────────────────────────────────────────────────────────
  const frameLoop = useCallback(() => {
    const videoEl = capture.videoRef.current;
    const ready   =
      videoEl !== null &&
      videoEl.readyState >= 2 &&
      videoEl.videoWidth  > 0 &&
      videoEl.videoHeight > 0;

    if (ready) {
      const frame = capture.processFrame();
      if (frame) {
        const quality = frame.quality;
        const phase   = capture.phase;

        // Tick auto-capture state machines
        if (phase === "front_aligning" || phase === "front_countdown") {
          frontAutoCapture.tick(quality);
        }
        if (phase === "side_aligning" || phase === "side_countdown") {
          sideAutoCapture.tick(quality);
        }

        // Voice coaching for distance + centering (debounced internally)
        if (frame.distanceStatus === "too_close") voice.speak("tooClose");
        if (frame.distanceStatus === "too_far")   voice.speak("tooFar");
        if (frame.centeringStatus === "too_left")  voice.speak("centerLeft", { minIntervalMs: 5000 });
        if (frame.centeringStatus === "too_right") voice.speak("centerRight", { minIntervalMs: 5000 });
      }
    }

    const activePhases = [
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    if (activePhases.includes(capture.phase)) {
      rafRef.current = requestAnimationFrame(frameLoop);
    }
  }, [capture, frontAutoCapture, sideAutoCapture, voice]);

  useEffect(() => {
    const activePhases = [
      "positioning", "front_aligning", "front_countdown",
      "side_positioning", "side_aligning", "side_countdown",
    ];
    if (activePhases.includes(capture.phase)) {
      rafRef.current = requestAnimationFrame(frameLoop);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [capture.phase, frameLoop]);

  // ── Voice coaching on phase transitions ──────────────────────────────────
  useEffect(() => {
    const phase = capture.phase;
    const map: Partial<Record<typeof phase, Parameters<typeof voice.speak>[0]>> = {
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
    if (key) voice.speak(key, { priority: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture.phase]);

  // ── Speak welcome on first mount ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => voice.speak("welcome", { priority: true }), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── On completion ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (capture.phase === "completed") {
      const profileId = capture.sessionStatus?.measurement_profile_id ?? null;
      onComplete?.(profileId ?? null);
    }
  }, [capture.phase, capture.sessionStatus, onComplete]);

  // ── Phone orientation voice coaching ─────────────────────────────────────
  const handleOrientationChange = useCallback(
    (status: typeof orientation.status) => {
      if (status === "good") voice.speak("phoneReady", { priority: false });
      if (status === "bad")  voice.speak("phoneNotLevel");
    },
    [voice]
  );

  const stepperIndex = getStepperIndex(capture.phase);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-4 w-full max-w-sm mx-auto", className)}>

      {/* ── Progress Stepper ── */}
      {capture.phase !== "idle" && capture.phase !== "loading_model" && (
        <div className="flex items-center justify-between px-1">
          {STEPPER_STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300",
                i < stepperIndex  ? "bg-[#2D6A4F] text-white" :
                i === stepperIndex ? "bg-[#F4C430] text-[#0A0A0A]" :
                "bg-white/10 text-white/30"
              )}>
                {i < stepperIndex ? <IconCheck /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium hidden sm:block transition-colors",
                i === stepperIndex ? "text-[#F4C430]" : "text-white/30"
              )}>
                {step.label}
              </span>
              {i < STEPPER_STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-2 transition-colors duration-300",
                  i < stepperIndex ? "bg-[#2D6A4F]" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>
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
                onClick={() => capture.startCapture(initialHeightCm)}
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

        {/* ── DEVICE SETUP: Phone orientation check ── */}
        {capture.phase === "device_setup" && (
          <motion.div
            key="device_setup"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 py-6"
          >
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">Position Your Phone</h3>
              <p className="text-white/50 text-sm mt-1">
                Prop it upright against a wall at chest height
              </p>
            </div>

            <PhoneOrientationIndicator
              status={orientation.status}
              gamma={orientation.gamma}
              tiltDegrees={orientation.tiltDegrees}
              tiltDirection={orientation.tiltDirection}
              onStatusChange={handleOrientationChange}
              onRequestPermission={orientation.requestPermission}
            />

            <button
              onClick={() => {
                capture.startCapture === undefined
                  ? undefined
                  : (capture as unknown as { setPhaseSync: (p: string) => void }).setPhaseSync?.("positioning");
                // Navigate to positioning using the exported advanceToSidePhase approach
                // Since device_setup transitions to positioning directly:
                void (async () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (capture as unknown as any).setPhaseSync?.("positioning");
                })();
              }}
              disabled={orientation.status === "bad"}
              className={cn(
                "w-full rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                orientation.isLevel || orientation.status === "unsupported"
                  ? "bg-[#2D6A4F] hover:bg-[#1B4332] text-white"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              <IconCamera />
              {orientation.isLevel ? "Camera Ready — Start Scan" : "Level the phone to continue"}
            </button>

            <p className="text-white/20 text-xs text-center">
              Or use without orientation check →{" "}
              <button
                className="underline text-white/40 hover:text-white/60"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (capture as unknown as any).setPhaseSync?.("positioning");
                }}
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
                ref={capture.videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
              <canvas
                ref={capture.canvasRef}
                className="absolute inset-0 w-full h-full scale-x-[-1]"
              />
              <PoseOverlay
                frame={capture.currentFrame}
                canvasRef={capture.canvasRef}
                videoRef={capture.videoRef}
              />
              <CalibrationGuide
                phase={capture.phase}
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <p className="text-[#F4C430] font-bold text-2xl drop-shadow-lg">↑ Step back</p>
                </div>
              )}
              {capture.currentFrame?.distanceStatus === "too_far" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <p className="text-[#F4C430] font-bold text-2xl drop-shadow-lg">↓ Step closer</p>
                </div>
              )}
              {capture.currentFrame?.centeringStatus === "too_left" && (
                <div className="absolute top-1/2 left-4 pointer-events-none">
                  <p className="text-[#F4C430] font-bold text-2xl drop-shadow-lg">→</p>
                </div>
              )}
              {capture.currentFrame?.centeringStatus === "too_right" && (
                <div className="absolute top-1/2 right-4 pointer-events-none">
                  <p className="text-[#F4C430] font-bold text-2xl drop-shadow-lg">←</p>
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

        {/* ── COMPLETED ── */}
        {capture.phase === "completed" && (
          <motion.div
            key="completed"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-[#2D6A4F]/20 ring-4 ring-[#2D6A4F]/30 flex items-center justify-center text-[#52B788]"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-xl">Measurements Captured!</h3>
              <p className="text-white/50 text-sm mt-1">
                14 precise measurements saved to your profile.
              </p>
            </div>
            {capture.sessionStatus?.scan_confidence != null && (
              <div className="text-xs text-white/40">
                Scan accuracy:{" "}
                <span className="text-[#52B788] font-semibold">
                  {Math.round(capture.sessionStatus.scan_confidence * 100)}%
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              <a
                href="/client/dashboard/measurements"
                className="rounded-xl bg-[#F4C430] text-[#0A0A0A] font-semibold py-3 text-sm
                           text-center hover:bg-[#C9A227] transition"
              >
                View My Measurements →
              </a>
              <button
                onClick={capture.reset}
                className="text-xs text-white/40 hover:text-white/70 transition"
              >
                Scan again
              </button>
            </div>
          </motion.div>
        )}

        {/* ── FAILED ── */}
        {capture.phase === "failed" && (
          <motion.div
            key="failed"
            {...PAGE_VARIANTS}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold">Scan Failed</h3>
              <p className="text-red-400/80 text-sm mt-1">{capture.error}</p>
            </div>
            <button
              onClick={capture.reset}
              className="rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-2.5
                         font-medium text-sm transition flex items-center gap-2"
            >
              <IconRefresh />
              Try Again
            </button>
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
