"use client";
/**
 * @file AICameraCapture.tsx
 * @description Main AI camera capture component for body measurements.
 *
 * Features:
 * - Real-time pose detection via MediaPipe Tasks Vision
 * - Live skeleton overlay on canvas
 * - Automatic height estimation from landmarks (optional fallback)
 * - User height input with CM/INCH toggle
 * - Smooth status transitions with animated feedback
 * - Mobile-first responsive layout
 *
 * Usage:
 *   <AICameraCapture onComplete={(profileId) => router.push(`/dashboard/measurements/${profileId}`)} />
 */

import { useEffect, useState } from "react";
import { useMeasurementCapture } from "../hooks/useMeasurementCapture";
import { useVoiceGuidance, type GuidanceKey } from "../hooks/useVoiceGuidance";
import { useDeviceOrientation } from "../hooks/useDeviceOrientation";
import { predictHeightCm } from "../utils/predictHeight";
import { PoseOverlay }      from "./PoseOverlay";
import { CalibrationGuide } from "./CalibrationGuide";
import { cn } from "@/lib/utils";

// ─── Icons (inline SVGs — no icon library dependency) ─────────────────────────

const IconCamera    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>;
const IconCheck     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const IconLoader    = () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
const IconRuler     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" /></svg>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AICameraCaptureProps {
  /** Called when measurements are saved. Receives the new MeasurementProfile ID. */
  onComplete?: (profileId: string | number | null) => void;
  /** Called when user cancels. */
  onCancel?: () => void;
  /** Pre-filled age from entry modal (stored for scan submission). */
  initialAge?: number;
  /** Pre-filled sex from entry modal (stored for scan submission). */
  initialSex?: "male" | "female" | "neutral";
  /** Pre-filled height in cm from prediction/entry (pre-fills height input). */
  initialHeightCm?: number;
  /** Pre-filled weight in kg from entry modal (stored for scan submission). */
  initialWeightKg?: number;
  /** Existing session ID from URL / QR (skip initiate, use pre-existing session). */
  sessionId?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AICameraCapture({
  onComplete,
  onCancel,
  initialAge,
  initialSex,
  initialHeightCm,
  initialWeightKg,
  sessionId,
  className,
}: AICameraCaptureProps) {
  const {
    phase,
    currentFrame,
    userHeightCm,
    sessionStatus,
    error,
    processFrame,
    startCapture,
    captureFront,
    proceedToSideCapture,
    skipSideCapture,
    captureSideAndSubmit,
    reset,
    retry,
    isOffline,
    isTimedOut,
    videoRef,
    canvasRef,
  } = useMeasurementCapture({
    initialAge,
    initialSex,
    initialHeightCm,
    initialWeightKg,
    sessionId,
  });
  const voice   = useVoiceGuidance();
  const orientation = useDeviceOrientation();

  // Height / age input state
  const [heightInput, setHeightInput]     = useState("");
  const [heightUnit, setHeightUnit]       = useState<"cm" | "inch">("cm");
  const [heightError, setHeightError]     = useState("");
  const [userAge, setUserAge]             = useState("");

  // T-015: Pre-fill height from entry modal / prediction
  useEffect(() => {
    if (initialHeightCm && initialHeightCm > 0) {
      setHeightUnit("cm");
      setHeightInput(String(Math.round(initialHeightCm)));
    }
  }, [initialHeightCm]);

  // T-015: Pre-fill age from entry modal
  useEffect(() => {
    if (initialAge && initialAge > 0) {
      setUserAge(String(initialAge));
    }
  }, [initialAge]);

  // ── Frame loop (single self-contained effect) ───────────────────────────────
  // The frameLoop function is defined inside the effect so it can reference
  // itself for recursive requestAnimationFrame calls — no ref indirection
  // needed. This avoids "refs during render" and "declaration order" lint
  // warnings that arise from the useCallback + ref-sync pattern.
  useEffect(() => {
    if (phase !== "capturing_front" && phase !== "awaiting_height" && phase !== "capturing_side") {
      return;
    }

    let rafId: number | null = null;

    const frameLoop = () => {
      // Secondary guard: only process when the video element has actual dimensions.
      // Primary guard is inside usePoseLandmarker.detectFromVideo.
      // Both guards together prevent the MediaPipe "ROI width/height > 0" assertion.
      const videoEl = videoRef.current;
      const videoReady =
        videoEl !== null &&
        videoEl.readyState >= 2 &&
        videoEl.videoWidth > 0 &&
        videoEl.videoHeight > 0;

      if (videoReady) {
        processFrame();
      }

      // Re-check phase inside the loop — the effect cleanup will cancel
      // the frame if the phase changes, but this prevents scheduling
      // an extra frame during the transition.
      if (phase === "capturing_front" || phase === "awaiting_height" || phase === "capturing_side") {
        rafId = requestAnimationFrame(frameLoop);
      }
    };

    rafId = requestAnimationFrame(frameLoop);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [phase, processFrame, videoRef]);

  // ── Voice guidance phase mapping ──────────────────────────────────────────
  useEffect(() => {
    const phaseToGuidance: Partial<Record<string, GuidanceKey>> = {
      awaiting_height:  "POSITION_PHONE",
      capturing_front:  "HOLD_STILL",
      side_prompt:      "TURN_SIDEWAYS",
      capturing_side:   "HOLD_STILL_SIDE",
      submitting:       "PROCESSING",
      processing:       "PROCESSING",
      completed:        "DONE",
    };
    const key = phaseToGuidance[phase];
    if (key) voice.speak(key);
  }, [phase, voice]);

  // ── Request device orientation permission on camera start ───────────────────
  useEffect(() => {
    if (phase === "capturing_front" || phase === "awaiting_height") {
      orientation.requestPermission();
    }
  }, [phase, orientation]);

  // ── On completion ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "completed") {
      const profileId = sessionStatus?.measurement_profile_id ?? null;
      onComplete?.(profileId ?? null);
    }
  }, [phase, sessionStatus, onComplete]);

  // ── Height helpers ──────────────────────────────────────────────────────────
  const parsedHeightCm = (): number | null => {
    const val = parseFloat(heightInput);
    if (isNaN(val)) return null;
    return heightUnit === "inch" ? Math.round(val * 2.54 * 10) / 10 : val;
  };

  const handleStartCapture = async () => {
    const height = parsedHeightCm();
    if (heightInput && height !== null) {
      if (height < 100 || height > 250) {
        setHeightError(
          heightUnit === "cm"
            ? "Height must be between 100–250 cm."
            : "Height must be between 39–98 inches."
        );
        return;
      }
    }
    setHeightError("");
    await startCapture(height ?? undefined);
  };

  const handleSubmit = async () => {
    if (phase === "capturing_side") {
      const height = parsedHeightCm() ?? userHeightCm ?? undefined;
      await captureSideAndSubmit(height);
    } else {
      captureFront();
    }
  };

  // ── Age-based height prediction ─────────────────────────────────────────────
  const handleAgeChange = (age: string) => {
    setUserAge(age);
    const ageNum = parseInt(age, 10);
    if (!isNaN(ageNum) && ageNum >= 5 && ageNum <= 120) {
      const predicted = predictHeightCm(ageNum);
      if (!heightInput) {
        setHeightInput(String(predicted));
      }
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* ── IDLE PHASE: Height input + start button ── */}
      {phase === "idle" && (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <div className="rounded-2xl border border-[#ECE6D6] bg-white p-6 flex flex-col gap-5 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FDA600]/15 flex items-center justify-center text-[#FDA600]">
                <IconRuler />
              </div>
              <div>
                <h3 className="font-semibold text-[#01454A]">AI Body Scan</h3>
                <p className="text-xs text-[#7A6B44]">30-second measurement scan</p>
              </div>
            </div>

            {/* Height input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#565960]">
                Your Height
                <span className="text-[#7A6B44] text-xs ml-1">(optional — auto-estimated if blank)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 68"}
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="flex-1 rounded-xl bg-[#F4F3EC] border border-[#ECE6D6] text-[#141414] px-4 py-2.5 text-sm
                             placeholder:text-[#7A6B44]/50 focus:outline-none focus:border-[#FDA600] focus:ring-1 focus:ring-[#FDA600] transition"
                />
                {/* CM / INCH toggle */}
                <div className="flex rounded-xl overflow-hidden border border-[#ECE6D6]">
                  {(["cm", "inch"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setHeightUnit(unit)}
                      className={cn(
                        "px-3 py-2 text-xs font-semibold transition",
                        heightUnit === unit
                          ? "bg-[#FDA600] text-white"
                          : "bg-[#F4F3EC] text-[#7A6B44] hover:bg-[#ECE6D6]"
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              {heightError && (
                <p className="text-red-400 text-xs">{heightError}</p>
              )}
            </div>

            {/* Age input (optional — for AI height prediction) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#565960]">
                Your Age
                <span className="text-[#7A6B44] text-xs ml-1">(optional — improves height estimate)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={userAge}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="flex-1 rounded-xl bg-[#F4F3EC] border border-[#ECE6D6] text-[#141414] px-4 py-2.5 text-sm
                           placeholder:text-[#7A6B44]/50 focus:outline-none focus:border-[#FDA600] focus:ring-1 focus:ring-[#FDA600] transition"
              />
            </div>

            {/* Instructions */}
            <ul className="text-xs text-[#565960] space-y-1 list-disc list-inside">
              <li>Stand 1.5–2 metres from camera</li>
              <li>Wear fitted clothing (no baggy clothes)</li>
              <li>Good lighting (face the window)</li>
              <li>Keep arms slightly away from body</li>
            </ul>

            <button
              onClick={handleStartCapture}
              className="w-full rounded-xl bg-gradient-to-r from-[#FDA600] to-[#E8960A] text-white
                         font-semibold py-3 hover:from-[#E8960A] hover:to-[#FDA600] transition
                         flex items-center justify-center gap-2 shadow-lg shadow-[#FDA600]/25"
            >
              <IconCamera />
              Start Body Scan
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-[#7A6B44] hover:text-[#01454A] transition text-center"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── LOADING MODEL PHASE ── */}
      {phase === "loading_model" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-[#FDA600]/15 flex items-center justify-center text-[#FDA600]">
            <IconLoader />
          </div>
          <p className="text-[#01454A] font-medium">Loading AI pose detection model...</p>
          <p className="text-[#7A6B44] text-xs">First load takes ~3 seconds</p>
        </div>
      )}

      {/* ── CAMERA ACTIVE PHASES (awaiting_height + capturing_front + capturing_side) ── */}
      {(phase === "capturing_front" || phase === "awaiting_height" || phase === "capturing_side") && (
        <div className="flex flex-col gap-4">
          {/* Voice mute toggle + caption */}
          {voice.isSupported && (
            <div className="flex items-center justify-between max-w-sm mx-auto w-full">
              <p className="text-xs text-[#565960] truncate flex-1">
                {voice.currentCaption ?? ""}
              </p>
              <button
                onClick={voice.toggleMute}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ml-2",
                  voice.muted
                    ? "bg-[#ECE6D6] text-[#7A6B44] hover:bg-[#ECE6D6]/80"
                    : "bg-[#FDA600]/15 text-[#FDA600]"
                )}
              >
                {voice.muted ? "🔇 Muted" : "🔊 Voice On"}
              </button>
            </div>
          )}

          {/* Camera viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[70vh] mx-auto w-full max-w-sm shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full scale-x-[-1]"
            />
            {/* Pose overlay */}
            <PoseOverlay
              frame={currentFrame}
              canvasRef={canvasRef}
              videoRef={videoRef}
            />
            {/* Calibration guide overlay */}
            <CalibrationGuide
              phase={phase}
              qualityScore={currentFrame?.quality ?? 0}
              estimatedHeight={userHeightCm}
              tiltStatus={orientation.tiltStatus}
              caption={voice.currentCaption}
            />
          </div>

          {/* Quality indicator */}
          <div className="max-w-sm mx-auto w-full">
            <QualityBar quality={currentFrame?.quality ?? 0} phase={phase} />
          </div>

          {/* Capture button */}
          <div className="flex gap-3 max-w-sm mx-auto w-full">
            <button
              onClick={handleSubmit}
              disabled={!currentFrame?.isGoodPose}
              className={cn(
                "flex-1 rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                currentFrame?.isGoodPose
                  ? "bg-gradient-to-r from-[#01454A] to-[#FDA600] text-white shadow-lg shadow-[#01454A]/25"
                  : "bg-[#ECE6D6] text-[#7A6B44]/50 cursor-not-allowed"
              )}
            >
              <IconCheck />
              {currentFrame?.isGoodPose
                ? phase === "capturing_side" ? "Capture Side Pose" : "Capture Front Pose"
                : "Hold Still..."}
            </button>
            {phase === "capturing_side" ? (
              <button
                onClick={() => skipSideCapture()}
                className="px-4 py-3 rounded-xl bg-[#ECE6D6] text-[#7A6B44] hover:bg-[#ECE6D6]/80 transition text-sm"
              >
                Skip Side
              </button>
            ) : (
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl bg-[#ECE6D6] text-[#7A6B44] hover:bg-[#ECE6D6]/80 transition text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── SIDE PROMPT PHASE (front captured, asking user to turn) ── */}
      {phase === "side_prompt" && (
        <div className="flex flex-col items-center gap-6 py-12 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-[#FDA600]/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#FDA600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#01454A] font-bold text-xl">Front Pose Captured!</h3>
            <p className="text-[#7A6B44] text-sm mt-1">
              Now turn 90° to your right so we can capture your side profile.
              This improves measurement accuracy by ~30%.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={proceedToSideCapture}
              className="w-full rounded-xl bg-[#FDA600] hover:bg-[#E8960A] text-white
                         font-semibold py-3 transition flex items-center justify-center gap-2"
            >
              <IconCamera />
              Capture Side Pose
            </button>
            <button
              onClick={skipSideCapture}
              className="w-full rounded-xl border border-[#ECE6D6] bg-white text-[#7A6B44]
                         hover:bg-[#F8F5ED] font-semibold text-sm py-3 transition"
            >
              Skip — Submit Front Only
            </button>
            <button
              onClick={reset}
              className="text-xs text-[#7A6B44] hover:text-[#01454A] transition"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTING / PROCESSING PHASES ── */}
      {(phase === "submitting" || phase === "processing") && (
        <div className="flex flex-col items-center gap-6 py-12 max-w-sm mx-auto">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-[#FDA600]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FDA600] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[#FDA600]">
              <IconRuler />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#01454A] font-semibold">
              {phase === "submitting" ? "Uploading scan data..." : "AI is processing your measurements..."}
            </p>
            <p className="text-[#7A6B44] text-xs mt-1">
              {phase === "processing" ? "Usually takes 5–10 seconds" : ""}
            </p>
          </div>
          {/* T-030: Offline indicator */}
          {isOffline && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠ You appear to be offline. Scan will resume when connection returns.
            </p>
          )}
          {/* Processing steps */}
          <div className="w-full space-y-2 text-xs text-[#7A6B44]">
            {["Validating pose quality", "Extracting body landmarks", "Computing measurements", "Saving your profile"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center",
                  i === 0 ? "border-[#FDA600] bg-[#FDA600]/20" : "border-[#ECE6D6]"
                )}>
                  {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#FDA600] animate-pulse" />}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPLETED PHASE ── */}
      {phase === "completed" && (
        <div className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-[#FDA600]/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#FDA600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#01454A] font-bold text-xl">Measurements Captured!</h3>
            <p className="text-[#7A6B44] text-sm mt-1">
              Your body measurements have been saved to your profile.
            </p>
          </div>
          {sessionStatus?.scan_confidence != null && (
            <div className="text-xs text-[#7A6B44]">
              Scan accuracy:{" "}
              <span className="text-[#FDA600] font-semibold">
                {Math.round(sessionStatus.scan_confidence * 100)}%
              </span>
            </div>
          )}
          {/* T-042: BMI display */}
          {sessionStatus?.bmi != null && (
            <div className="text-xs text-[#7A6B44]">
              BMI:{" "}
              <span className="text-[#01454A] font-semibold">
                {sessionStatus.bmi.toFixed(1)}
              </span>
            </div>
          )}
          {/* T-041: Plausibility warnings display */}
          {sessionStatus?.plausibility_warnings && sessionStatus.plausibility_warnings.length > 0 && (
            <div className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3 text-left">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                ⚠ Measurement Quality Notes:
              </p>
              <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                {sessionStatus.plausibility_warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="text-xs text-amber-500 mt-2">
                Consider re-scanning for improved accuracy.
              </p>
            </div>
          )}
          <button
            onClick={reset}
            className="text-xs text-[#7A6B44] hover:text-[#01454A] transition"
          >
            Scan again
          </button>
        </div>
      )}

      {/* ── FAILED PHASE ── */}
      {phase === "failed" && (
        <div className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#01454A] font-bold">Scan Failed</h3>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
            {isTimedOut && (
              <p className="text-[#7A6B44] text-xs mt-2">
                The AI server took too long to respond. This is usually temporary.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="rounded-xl bg-[#FDA600] hover:bg-[#E8960A] text-white px-6 py-2.5 font-medium text-sm transition"
            >
              Retry Submission
            </button>
            <button
              onClick={reset}
              className="rounded-xl bg-[#ECE6D6] hover:bg-[#ECE6D6]/80 text-[#01454A] px-6 py-2.5 font-medium text-sm transition"
            >
              Try Again
            </button>
          </div>
          {/* T-036: Manual entry fallback */}
          <a
            href="/dashboard/measurements/manual"
            className="text-xs text-[#7A6B44] hover:text-[#01454A] transition underline"
          >
            Enter measurements manually instead
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Quality Bar ──────────────────────────────────────────────────────────────

function QualityBar({ quality, phase }: { quality: number; phase?: string }) {
  const pct = Math.round(quality * 100);
  const color =
    pct >= 72 ? "bg-[#FDA600]" :
    pct >= 50 ? "bg-[#FDA600]/70" :
    "bg-red-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-[#7A6B44]">
        <span>Pose quality</span>
        <span className={cn(
          "font-semibold",
          pct >= 72 ? "text-[#FDA600]" : pct >= 50 ? "text-[#FDA600]/70" : "text-red-400"
        )}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#ECE6D6] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-[#7A6B44]/60">
        {pct >= 72 ? (phase === "capturing_side" ? "✓ Good side pose — ready to capture!" : "✓ Good pose — ready to capture!") :
         pct >= 50 ? "Adjust your position..." :
         "Step back and face the camera"}
      </p>
    </div>
  );
}
