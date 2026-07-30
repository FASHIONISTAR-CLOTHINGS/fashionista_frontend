"use client";
/**
 * @file ScanProgressStepper.tsx
 * @description Step 37 / TASK-025: Visual 5-step progress stepper for the body scan flow.
 *
 * Displayed at the top of the scan page throughout the measurement flow.
 * Steps: Setup → Front Pose → Side Pose → Processing → Results
 *
 * Color coding:
 *   - Completed steps: Forest Green (#2D6A4F) with checkmark
 *   - Active step:     Golden Yellow (#F4C430) with pulsing indicator
 *   - Upcoming steps:  Gray (white/20)
 *
 * Framer Motion:
 *   - Step transitions animate with spring physics
 *   - Connector lines fill with Forest Green as steps complete
 */

import { motion } from "framer-motion";
import type { EnhancedCapturePhase } from "@/features/measurements/hooks/useEnhancedMeasurementCapture";

// ─── Step Definitions ─────────────────────────────────────────────────────────

interface Step {
  id:     string;
  label:  string;
  icon:   string;
  /** Which CapturePhase values map to this step being ACTIVE */
  phases: EnhancedCapturePhase[];
  /** Which CapturePhase values mean this step is COMPLETED */
  donePhases: EnhancedCapturePhase[];
}

const STEPS: Step[] = [
  {
    id:         "setup",
    label:      "Setup",
    icon:       "📱",
    phases:     ["idle", "device_setup", "loading_model"],
    donePhases: ["positioning", "front_aligning", "front_countdown", "front_captured",
                 "side_transition", "side_positioning", "side_aligning",
                 "side_countdown", "side_captured", "submitting", "processing", "completed"],
  },
  {
    id:         "front",
    label:      "Front Pose",
    icon:       "🧍",
    phases:     ["positioning", "front_aligning", "front_countdown", "front_captured"],
    donePhases: ["side_transition", "side_positioning", "side_aligning",
                 "side_countdown", "side_captured", "submitting", "processing", "completed"],
  },
  {
    id:         "side",
    label:      "Side Pose",
    icon:       "🧍‍♂️",
    phases:     ["side_transition", "side_positioning", "side_aligning", "side_countdown", "side_captured"],
    donePhases: ["submitting", "processing", "completed"],
  },
  {
    id:         "processing",
    label:      "AI Analysis",
    icon:       "⚡",
    phases:     ["submitting", "processing"],
    donePhases: ["completed"],
  },
  {
    id:         "results",
    label:      "Results",
    icon:       "✅",
    phases:     ["completed"],
    donePhases: [],
  },
];

// ─── Step Status ─────────────────────────────────────────────────────────────

type StepStatus = "completed" | "active" | "upcoming";

function getStepStatus(step: Step, currentPhase: EnhancedCapturePhase): StepStatus {
  if (step.donePhases.includes(currentPhase)) return "completed";
  if (step.phases.includes(currentPhase))     return "active";
  return "upcoming";
}

// ─── Individual Step Circle ───────────────────────────────────────────────────

function StepCircle({ status, icon }: {
  status:    StepStatus;
  icon:      string;
}) {
  const bg     = status === "completed" ? "#2D6A4F" :
                 status === "active"    ? "#F4C430" :
                 "rgba(255,255,255,0.08)";

  const border = status === "completed" ? "#2D6A4F" :
                 status === "active"    ? "#F4C430" :
                 "rgba(255,255,255,0.15)";

  return (
    <motion.div
      className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
      style={{ background: bg, borderColor: border }}
      animate={{ scale: status === "active" ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 1.8, repeat: status === "active" ? Infinity : 0, ease: "easeInOut" }}
    >
      {status === "completed" ? (
        <motion.span
          className="text-white text-sm font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          ✓
        </motion.span>
      ) : (
        <span className="text-base">{icon}</span>
      )}

      {/* Active pulse ring */}
      {status === "active" && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: "#F4C430" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}

// ─── Connector Line ───────────────────────────────────────────────────────────

function Connector({ fromStatus }: { fromStatus: StepStatus }) {
  const isDone = fromStatus === "completed";
  return (
    <div className="flex-1 h-0.5 mx-1 bg-white/10 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "#2D6A4F" }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: isDone ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ScanProgressStepperProps {
  phase:      EnhancedCapturePhase;
  className?: string;
  /** Show labels below step circles (default: true on wider screens) */
  showLabels?: boolean;
}

export function ScanProgressStepper({
  phase,
  className = "",
  showLabels = true,
}: ScanProgressStepperProps) {
  // Don't show stepper on failed state
  if (phase === "failed") return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const status = getStepStatus(step, phase);
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <StepCircle status={status} icon={step.icon} />
                {showLabels && (
                  <motion.span
                    className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{
                      color: status === "completed" ? "#52B788" :
                             status === "active"    ? "#F4C430" :
                             "rgba(255,255,255,0.25)",
                    }}
                    animate={{ opacity: status === "upcoming" ? 0.4 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.label}
                  </motion.span>
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 flex items-center pb-4 mx-1">
                  <Connector fromStatus={status} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
