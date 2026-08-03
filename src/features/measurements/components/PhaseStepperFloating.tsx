"use client";
/**
 * @file PhaseStepperFloating.tsx
 * @description Compact, single, floating phase stepper for the measurement camera.
 *
 * - Sits at the top of the full-screen camera viewport.
 * - Does not duplicate; replaces the old inline ScanProgressStepper.
 * - Uses brand colors and tiny icon+label pills.
 */

import { cn } from "@/lib/utils";
import type { EnhancedCapturePhase } from "../hooks/useEnhancedMeasurementCapture";

type StepId = "setup" | "front" | "side" | "processing" | "results";

interface Step {
  id: StepId;
  label: string;
  icon: string;
  active: EnhancedCapturePhase[];
  completed: EnhancedCapturePhase[];
}

const STEPS: Step[] = [
  {
    id: "setup",
    label: "Setup",
    icon: "📱",
    active: ["idle", "loading_model", "device_setup"],
    completed: [
      "positioning", "front_aligning", "front_countdown", "front_captured",
      "side_transition", "side_positioning", "side_aligning", "side_countdown",
      "side_captured", "submitting", "processing", "completed",
    ],
  },
  {
    id: "front",
    label: "Front",
    icon: "🧍",
    active: ["positioning", "front_aligning", "front_countdown", "front_captured"],
    completed: [
      "side_transition", "side_positioning", "side_aligning", "side_countdown",
      "side_captured", "submitting", "processing", "completed",
    ],
  },
  {
    id: "side",
    label: "Side",
    icon: "🧍‍♂️",
    active: ["side_transition", "side_positioning", "side_aligning", "side_countdown", "side_captured"],
    completed: ["submitting", "processing", "completed"],
  },
  {
    id: "processing",
    label: "AI",
    icon: "⚡",
    active: ["submitting", "processing"],
    completed: ["completed"],
  },
  {
    id: "results",
    label: "Done",
    icon: "✅",
    active: ["completed"],
    completed: [],
  },
];

function getStepStatus(step: Step, phase: EnhancedCapturePhase): "completed" | "active" | "upcoming" {
  if (step.completed.includes(phase)) return "completed";
  if (step.active.includes(phase)) return "active";
  return "upcoming";
}

interface PhaseStepperFloatingProps {
  phase: EnhancedCapturePhase;
  className?: string;
}

export function PhaseStepperFloating({ phase, className }: PhaseStepperFloatingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 px-2 py-1.5 rounded-full",
        "bg-[var(--BV-cream)]/80 backdrop-blur-md border border-[var(--BV-cream-dark)]",
        className
      )}
    >
      {STEPS.map((step, index) => {
        const status = getStepStatus(step, phase);
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors",
                status === "completed" && "bg-[var(--BV-green)]/20 text-[var(--BV-green)]",
                status === "active" && "bg-[var(--BV-gold)]/20 text-[var(--BV-gold)]",
                status === "upcoming" && "text-[var(--BV-muted)]"
              )}
            >
              <span className="text-[10px]">{status === "completed" ? "✓" : step.icon}</span>
              <span className="text-[10px] font-semibold hidden sm:inline">{step.label}</span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "w-3 h-px mx-0.5",
                  status === "completed" ? "bg-[var(--BV-green)]/40" : "bg-[var(--BV-cream-dark)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
