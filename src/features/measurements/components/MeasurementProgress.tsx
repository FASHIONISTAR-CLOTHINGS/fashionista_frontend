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
  idle:          { label: "Ready",                    sublabel: "Press start to begin scan",        pct: 0,   color: "white/20"   },
  loading:       { label: "Loading AI Model",         sublabel: "Downloading pose detector...",      pct: 12,  color: "violet-500" },
  initialising:  { label: "Initialising Camera",      sublabel: "Starting pose detection engine...", pct: 28,  color: "violet-500" },
  detecting:     { label: "Detecting Pose",            sublabel: "Hold still — capturing landmarks",  pct: 50,  color: "blue-500"   },
  submitting:    { label: "Uploading Measurements",   sublabel: "Sending body data to server...",    pct: 68,  color: "sky-500"    },
  processing:    { label: "AI Processing",            sublabel: "Computing body measurements...",    pct: 82,  color: "amber-500"  },
  saving:        { label: "Saving Profile",           sublabel: "Creating your measurement profile", pct: 95,  color: "green-500"  },
  completed:     { label: "Complete",                 sublabel: "Measurements saved successfully",   pct: 100, color: "green-400"  },
  failed:        { label: "Scan Failed",              sublabel: "Please try again",                  pct: 0,   color: "red-500"    },
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
    loading:      "#8b5cf6",
    initialising: "#8b5cf6",
    detecting:    "#3b82f6",
    submitting:   "#0ea5e9",
    processing:   "#f59e0b",
    saving:       "#22c55e",
    completed:    "#4ade80",
    failed:       "#ef4444",
  };
  return map[phase] ?? "#ffffff20";
}

function phaseGradient(phase: ScanProgressPhase): string {
  if (phase === "completed") return "linear-gradient(90deg, #22c55e, #4ade80)";
  if (phase === "failed")    return "#ef4444";
  if (["loading", "initialising"].includes(phase))
    return "linear-gradient(90deg, #7c3aed, #8b5cf6)";
  if (phase === "detecting")   return "linear-gradient(90deg, #1d4ed8, #3b82f6)";
  if (phase === "submitting")  return "linear-gradient(90deg, #0369a1, #0ea5e9)";
  if (phase === "processing")  return "linear-gradient(90deg, #b45309, #f59e0b)";
  if (phase === "saving")      return "linear-gradient(90deg, #15803d, #22c55e)";
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
