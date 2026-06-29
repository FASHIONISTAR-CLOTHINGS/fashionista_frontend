"use client";
/**
 * @file InHouseMeasurementFlow.tsx
 * @description Full AI Body Scan orchestration component (Production Implementation).
 *
 * PRODUCTION IMPLEMENTATION — replaces the previous photo-upload stub.
 *
 * Flow:
 *   1. Intro card — explains the scan process, shows requirements
 *   2. AICameraCapture — real-time MediaPipe pose detection + submission
 *   3. Processing state — shows animated progress while Celery processes
 *   4. Success state — shows profile ID and links to profile
 *
 * Integration:
 *   - Uses useMeasurementCapture hook (MediaPipe + session lifecycle)
 *   - Calls /api/v1/measurements/scan/initiate/ (DRF POST)
 *   - Polls /api/v1/ninja/ai/scan/{id}/status/ (Ninja GET)
 *   - On complete: calls onComplete(profileId) for router.push
 *
 * Props:
 *   onComplete(profileId) — called when scan saves measurement profile
 *   onCancel()            — called when user clicks Cancel
 */

import { useState, useCallback } from "react";
import { AICameraCapture } from "./AICameraCapture";
import { cn } from "@/lib/utils";

// ─── Icons (inline SVG — zero dependency) ─────────────────────────────────────

const IconCheck    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const IconCamera   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>;
const IconRuler    = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" /></svg>;
const IconStar     = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

// ─── Flow phases ──────────────────────────────────────────────────────────────

type FlowPhase = "intro" | "scanning" | "success";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InHouseMeasurementFlowProps {
  /** Called when scan completes and measurement profile is saved. */
  onComplete?: (profileId: string | number | null) => void;
  /** Called when user cancels. */
  onCancel?: () => void;
  className?: string;
}

// ─── Requirements checklist ───────────────────────────────────────────────────

const REQUIREMENTS = [
  "Wear fitted clothing (no baggy tops or skirts)",
  "Stand in a well-lit area with a plain background",
  "Allow camera permission when prompted",
  "Stand 1.5–2 metres from your device",
  "Your full body must be visible — head to toe",
];

const MEASUREMENT_LIST = [
  "Bust", "Waist", "Hips", "Shoulder Width",
  "Arm Length", "Inseam", "Thigh", "Height",
  "Neck", "Wrist", "Knee", "Ankle",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function InHouseMeasurementFlow({
  onComplete,
  onCancel,
  className,
}: InHouseMeasurementFlowProps) {
  const [phase, setPhase]         = useState<FlowPhase>("intro");
  const [profileId, setProfileId] = useState<string | number | null>(null);

  const handleScanComplete = useCallback(
    (id: string | number | null) => {
      setProfileId(id);
      setPhase("success");
      onComplete?.(id);
    },
    [onComplete]
  );

  const handleScanCancel = useCallback(() => {
    setPhase("intro");
    onCancel?.();
  }, [onCancel]);

  // ── INTRO PHASE ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>

        {/* Header badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-400 ring-1 ring-violet-500/20">
            <IconRuler />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              In-House AI Body Scan
            </h2>
            <p className="text-sm text-white/50">
              30 seconds · 14 measurements · 100% private
            </p>
          </div>
        </div>

        {/* Measurement preview */}
        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            What We Measure
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MEASUREMENT_LIST.map((m) => (
              <div key={m} className="flex items-center gap-1.5">
                <span className="text-violet-400"><IconStar /></span>
                <span className="text-xs text-white/70">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Before You Start
          </p>
          <ul className="flex flex-col gap-2">
            {REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-emerald-400 shrink-0"><IconCheck /></span>
                <span className="text-sm text-white/70">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy note */}
        <div className="rounded-xl bg-blue-500/8 border border-blue-500/15 px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-300/80">
            <strong className="text-blue-300">100% Private.</strong> Only pose coordinates are transmitted — no video
            or images are recorded or stored on our servers.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10
                         font-semibold text-sm py-3 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setPhase("scanning")}
            className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white
                       font-semibold text-sm py-3 transition-colors flex items-center justify-center gap-2"
          >
            <IconCamera />
            Start AI Scan
          </button>
        </div>
      </div>
    );
  }

  // ── SCANNING PHASE ──────────────────────────────────────────────────────────
  if (phase === "scanning") {
    return (
      <AICameraCapture
        className={className}
        onComplete={handleScanComplete}
        onCancel={handleScanCancel}
      />
    );
  }

  // ── SUCCESS PHASE ───────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col items-center gap-6 py-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/25
                      flex items-center justify-center text-emerald-400 animate-bounce-once">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">Measurements Saved!</h3>
        <p className="text-sm text-white/50 max-w-xs mx-auto">
          Your AI body scan is complete. Your measurement profile is ready
          for size recommendations and perfect fit.
        </p>
        {profileId && (
          <p className="text-xs text-white/30 mt-1">Profile ID: {profileId}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {profileId && (
          <a
            href={`/client/dashboard/measurements/${profileId}`}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold
                       text-sm py-3 transition-colors text-center"
          >
            View My Measurements
          </a>
        )}
        <button
          onClick={() => setPhase("intro")}
          className="rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10
                     font-semibold text-sm py-3 transition-colors"
        >
          Scan Again
        </button>
      </div>
    </div>
  );
}
