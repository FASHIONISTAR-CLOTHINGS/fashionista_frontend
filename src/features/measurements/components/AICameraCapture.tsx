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

import { useEffect, useRef, useCallback, useState } from "react";
import { useMeasurementCapture } from "../hooks/useMeasurementCapture";
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
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AICameraCapture({
  onComplete,
  onCancel,
  className,
}: AICameraCaptureProps) {
  const capture = useMeasurementCapture();

  // Height input state
  const [heightInput, setHeightInput]     = useState("");
  const [heightUnit, setHeightUnit]       = useState<"cm" | "inch">("cm");
  const [heightError, setHeightError]     = useState("");

  // Animation frame ref
  const rafRef = useRef<number | null>(null);

  // ── Frame loop ──────────────────────────────────────────────────────────────
  const frameLoop = useCallback(() => {
    // Secondary guard: only process when the video element has actual dimensions.
    // Primary guard is inside usePoseLandmarker.detectFromVideo.
    // Both guards together prevent the MediaPipe "ROI width/height > 0" assertion.
    const videoEl = capture.videoRef.current;
    const videoReady =
      videoEl !== null &&
      videoEl.readyState >= 2 &&
      videoEl.videoWidth  > 0 &&
      videoEl.videoHeight > 0;

    if (videoReady) {
      capture.processFrame();
    }

    if (capture.phase === "capturing" || capture.phase === "awaiting_height") {
      rafRef.current = requestAnimationFrame(frameLoop);
    }
  }, [capture]);


  useEffect(() => {
    if (capture.phase === "capturing" || capture.phase === "awaiting_height") {
      rafRef.current = requestAnimationFrame(frameLoop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [capture.phase, frameLoop]);

  // ── On completion ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (capture.phase === "completed") {
      const profileId = capture.sessionStatus?.measurement_profile_id ?? null;
      onComplete?.(profileId ?? null);
    }
  }, [capture.phase, capture.sessionStatus, onComplete]);

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
    await capture.startCapture(height ?? undefined);
  };

  const handleSubmit = async () => {
    const height = parsedHeightCm() ?? capture.userHeightCm ?? undefined;
    await capture.captureAndSubmit(height);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* ── IDLE PHASE: Height input + start button ── */}
      {capture.phase === "idle" && (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col gap-5">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <IconRuler />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Body Scan</h3>
                <p className="text-xs text-white/50">30-second measurement scan</p>
              </div>
            </div>

            {/* Height input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">
                Your Height
                <span className="text-white/40 text-xs ml-1">(optional — auto-estimated if blank)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 68"}
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="flex-1 rounded-xl bg-white/10 border border-white/10 text-white px-4 py-2.5 text-sm
                             placeholder:text-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                />
                {/* CM / INCH toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10">
                  {(["cm", "inch"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setHeightUnit(unit)}
                      className={cn(
                        "px-3 py-2 text-xs font-semibold transition",
                        heightUnit === unit
                          ? "bg-violet-600 text-white"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
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

            {/* Instructions */}
            <ul className="text-xs text-white/50 space-y-1 list-disc list-inside">
              <li>Stand 1.5–2 metres from camera</li>
              <li>Wear fitted clothing (no baggy clothes)</li>
              <li>Good lighting (face the window)</li>
              <li>Keep arms slightly away from body</li>
            </ul>

            <button
              onClick={handleStartCapture}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white
                         font-semibold py-3 hover:from-violet-700 hover:to-purple-700 transition
                         flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
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
        </div>
      )}

      {/* ── LOADING MODEL PHASE ── */}
      {capture.phase === "loading_model" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
            <IconLoader />
          </div>
          <p className="text-white/70 font-medium">Loading AI pose detection model...</p>
          <p className="text-white/30 text-xs">First load takes ~3 seconds</p>
        </div>
      )}

      {/* ── CAMERA ACTIVE PHASES (awaiting_height + capturing) ── */}
      {(capture.phase === "capturing" || capture.phase === "awaiting_height") && (
        <div className="flex flex-col gap-4">
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
            {/* Pose overlay */}
            <PoseOverlay
              frame={capture.currentFrame}
              canvasRef={capture.canvasRef}
              videoRef={capture.videoRef}
            />
            {/* Calibration guide overlay */}
            <CalibrationGuide
              phase={capture.phase}
              qualityScore={capture.currentFrame?.quality ?? 0}
              estimatedHeight={capture.userHeightCm}
            />
          </div>

          {/* Quality indicator */}
          <div className="max-w-sm mx-auto w-full">
            <QualityBar quality={capture.currentFrame?.quality ?? 0} />
          </div>

          {/* Capture button */}
          <div className="flex gap-3 max-w-sm mx-auto w-full">
            <button
              onClick={handleSubmit}
              disabled={!capture.currentFrame?.isGoodPose}
              className={cn(
                "flex-1 rounded-xl font-semibold py-3 transition flex items-center justify-center gap-2",
                capture.currentFrame?.isGoodPose
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              <IconCheck />
              {capture.currentFrame?.isGoodPose ? "Capture Measurements" : "Hold Still..."}
            </button>
            <button
              onClick={capture.reset}
              className="px-4 py-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTING / PROCESSING PHASES ── */}
      {(capture.phase === "submitting" || capture.phase === "processing") && (
        <div className="flex flex-col items-center gap-6 py-12 max-w-sm mx-auto">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <IconRuler />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">
              {capture.phase === "submitting" ? "Uploading scan data..." : "AI is processing your measurements..."}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {capture.phase === "processing" ? "Usually takes 5–10 seconds" : ""}
            </p>
          </div>
          {/* Processing steps */}
          <div className="w-full space-y-2 text-xs text-white/40">
            {["Validating pose quality", "Extracting body landmarks", "Computing measurements", "Saving your profile"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center",
                  i === 0 ? "border-violet-500 bg-violet-500/20" : "border-white/10"
                )}>
                  {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPLETED PHASE ── */}
      {capture.phase === "completed" && (
        <div className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Measurements Captured!</h3>
            <p className="text-white/50 text-sm mt-1">
              Your body measurements have been saved to your profile.
            </p>
          </div>
          {capture.sessionStatus?.scan_confidence != null && (
            <div className="text-xs text-white/40">
              Scan accuracy:{" "}
              <span className="text-green-400 font-semibold">
                {Math.round(capture.sessionStatus.scan_confidence * 100)}%
              </span>
            </div>
          )}
          <button
            onClick={capture.reset}
            className="text-xs text-white/40 hover:text-white/70 transition"
          >
            Scan again
          </button>
        </div>
      )}

      {/* ── FAILED PHASE ── */}
      {capture.phase === "failed" && (
        <div className="flex flex-col items-center gap-5 py-12 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
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
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 font-medium text-sm transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quality Bar ──────────────────────────────────────────────────────────────

function QualityBar({ quality }: { quality: number }) {
  const pct = Math.round(quality * 100);
  const color =
    pct >= 72 ? "bg-green-500" :
    pct >= 50 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-white/40">
        <span>Pose quality</span>
        <span className={cn(
          "font-semibold",
          pct >= 72 ? "text-green-400" : pct >= 50 ? "text-amber-400" : "text-red-400"
        )}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-white/30">
        {pct >= 72 ? "✓ Good pose — ready to capture!" :
         pct >= 50 ? "Adjust your position..." :
         "Step back and face the camera"}
      </p>
    </div>
  );
}
