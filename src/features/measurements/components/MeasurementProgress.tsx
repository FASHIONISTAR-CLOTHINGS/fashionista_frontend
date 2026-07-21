"use client";
/**
 * @file MeasurementProgress.tsx
 * @description Real-time scan progress indicator displayed while:
 *   1. MediaPipe model is loading (phase: "loading")
 *   2. Pose detection is warming up (phase: "initialising")
 *   3. Landmarks are being submitted to backend (phase: "submitting")
 *   4. Backend Celery task is processing (phase: "processing")
 *   5. Final save complete (phase: "saving")
 *
 * Premium animated progress bar with step labels and spinner.
 * Designed to fill the scan UI dead-time with a polished loading experience.
 */

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanProgressPhase =
  | "idle"
  | "loading"       // Loading MediaPipe WASM model
  | "initialising"  // Warming up pose detector
  | "detecting"     // Active pose detection loop
  | "submitting"    // Sending landmarks to DRF API
  | "processing"    // Celery task running on server
  | "saving"        // Writing MeasurementProfile to DB
  | "completed"     // Done
  | "failed";       // Error

interface PhaseConfig {
  label:    string;
  sublabel: string;
  pct:      number;   // 0-100
  color:    string;   // Tailwind class fragment
}

const PHASE_CONFIG: Record<ScanProgressPhase, PhaseConfig> = {
  idle:          { label: "Ready",                    sublabel: "Press start to begin scan",        pct: 0,   color: "[#2D6A4F]/40" },
  loading:       { label: "Loading AI Model",         sublabel: "Downloading pose detector...",      pct: 12,  color: "[#2D6A4F]"    },
  initialising:  { label: "Initialising Camera",      sublabel: "Starting pose detection engine...", pct: 28,  color: "[#2D6A4F]"    },
  detecting:     { label: "Detecting Pose",            sublabel: "Hold still — capturing landmarks",  pct: 50,  color: "[#52B788]"    },
  submitting:    { label: "Uploading Measurements",   sublabel: "Sending body data to server...",    pct: 68,  color: "[#F4C430]"    },
  processing:    { label: "AI Processing",            sublabel: "Computing body measurements...",    pct: 82,  color: "[#F4C430]"    },
  saving:        { label: "Saving Profile",           sublabel: "Creating your measurement profile", pct: 95,  color: "[#2D6A4F]"    },
  completed:     { label: "Complete",                 sublabel: "Measurements saved successfully",   pct: 100, color: "[#52B788]"    },
  failed:        { label: "Scan Failed",              sublabel: "Please try again",                  pct: 0,   color: "[#DC2626]"    },
};

interface MeasurementProgressProps {
  phase:         ScanProgressPhase;
  errorMessage?: string;
  className?:    string;
  /** Optional: override % (0-100) — useful for polling-based progress */
  overridePct?:  number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementProgress({
  phase,
  errorMessage,
  className,
  overridePct,
}: MeasurementProgressProps) {
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.idle;
  const pct    = overridePct ?? config.pct;

  const isActive    = !["idle", "completed", "failed"].includes(phase);
  const isCompleted = phase === "completed";
  const isFailed    = phase === "failed";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Spinner or completion icon */}
          {isActive && (
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-transparent animate-spin",
              `border-t-${config.color}`,
              "flex-shrink-0",
            )}
              style={{ borderTopColor: phaseColorHex(phase) }}
            />
          )}
          {isCompleted && (
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-white">✓</span>
            </div>
          )}
          {isFailed && (
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-white">✕</span>
            </div>
          )}
          {phase === "idle" && (
            <div className="w-4 h-4 rounded-full border-2 border-white/10 flex-shrink-0" />
          )}

          <span className={cn(
            "text-sm font-semibold",
            isFailed    ? "text-red-400"   :
            isCompleted ? "text-green-400" :
            isActive    ? "text-white"     :
            "text-white/40",
          )}>
            {config.label}
          </span>
        </div>

        <span className={cn(
          "text-xs font-mono tabular-nums",
          isFailed ? "text-red-400/60" : "text-white/30",
        )}>
          {isFailed ? "Error" : `${pct}%`}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        {/* Background shimmer when active */}
        {isActive && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)",
              animation: "shimmer 1.8s ease infinite",
              backgroundSize: "200% 100%",
            }}
          />
        )}

        {/* Filled portion */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:      `${isFailed ? 100 : pct}%`,
            background: isFailed ? "#ef4444" : phaseGradient(phase),
          }}
        />
      </div>

      {/* ── Sublabel / error ── */}
      <p className={cn(
        "text-xs transition-all duration-300",
        isFailed    ? "text-red-400/80"  :
        isCompleted ? "text-green-400/70" :
        "text-white/35",
      )}>
        {isFailed && errorMessage ? errorMessage : config.sublabel}
      </p>

      {/* ── Detailed step list (only visible when active) ── */}
      {(isActive || isCompleted) && (
        <div className="grid grid-cols-5 gap-1 mt-1">
          {STEP_LABELS.map((step, i) => {
            const stepPct = (i + 1) * 20;
            const isDone  = pct >= stepPct;
            const isCurr  = !isDone && pct >= stepPct - 20;
            return (
              <div key={step} className="flex flex-col items-center gap-0.5">
                <div className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  isDone ? "bg-green-400" :
                  isCurr ? "bg-white/60 animate-pulse" :
                  "bg-white/10",
                )} />
                <span className={cn(
                  "text-[9px] leading-tight text-center",
                  isDone ? "text-white/40" : "text-white/15",
                )}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Global shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEP_LABELS = ["Load", "Camera", "Pose", "Upload", "Save"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function phaseColorHex(phase: ScanProgressPhase): string {
  const map: Partial<Record<ScanProgressPhase, string>> = {
    loading:      "#2D6A4F",
    initialising: "#2D6A4F",
    detecting:    "#52B788",
    submitting:   "#F4C430",
    processing:   "#F4C430",
    saving:       "#2D6A4F",
    completed:    "#52B788",
    failed:       "#DC2626",
  };
  return map[phase] ?? "#ffffff20";
}

function phaseGradient(phase: ScanProgressPhase): string {
  if (phase === "completed") return "linear-gradient(90deg, #2D6A4F, #52B788)";
  if (phase === "failed")    return "#DC2626";
  if (["loading", "initialising"].includes(phase))
    return "linear-gradient(90deg, #1B4332, #2D6A4F)";
  if (phase === "detecting")   return "linear-gradient(90deg, #2D6A4F, #52B788)";
  if (phase === "submitting")  return "linear-gradient(90deg, #C9A227, #F4C430)";
  if (phase === "processing")  return "linear-gradient(90deg, #C9A227, #F4C430)";
  if (phase === "saving")      return "linear-gradient(90deg, #1B4332, #2D6A4F)";
  return "rgba(255,255,255,0.1)";
}

// ─── Compact pill variant (for dashboard use) ─────────────────────────────────

export function MeasurementProgressPill({ phase }: { phase: ScanProgressPhase }) {
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.idle;
  const isActive = !["idle", "completed", "failed"].includes(phase);

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
      phase === "completed" ? "border-green-500/30 bg-green-500/10 text-green-400" :
      phase === "failed"    ? "border-red-500/30 bg-red-500/10 text-red-400" :
      isActive              ? "border-white/10 bg-white/5 text-white/60" :
      "border-white/5 bg-transparent text-white/25",
    )}>
      {isActive && (
        <span
          className="w-2 h-2 rounded-full border border-transparent animate-spin"
          style={{ borderTopColor: phaseColorHex(phase) }}
        />
      )}
      {config.label}
    </div>
  );
}
