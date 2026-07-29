"use client";

/**
 * @file ScanProgressStepper.tsx
 * @description Horizontal stepper showing scan phases.
 *
 * 5 steps: Setup → Front Pose → Side Pose → Processing → Results
 * Active step highlighted in #F4C430, completed in #52B788, upcoming in muted.
 */

import { motion } from "framer-motion";

const STEPS = ["Setup", "Front Pose", "Side Pose", "Processing", "Results"];

const PHASE_TO_STEP: Record<string, number> = {
  idle: 0,
  loading_model: 0,
  awaiting_height: 0,
  capturing_front: 1,
  validating_front: 1,
  side_prompt: 2,
  capturing_side: 2,
  validating_side: 2,
  submitting: 3,
  processing: 3,
  completed: 4,
  failed: 3,
};

export interface ScanProgressStepperProps {
  currentPhase: string;
  className?: string;
}

export function ScanProgressStepper({ currentPhase, className = "" }: ScanProgressStepperProps) {
  const activeStep = PHASE_TO_STEP[currentPhase] ?? 0;

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {STEPS.map((label, i) => {
        const isCompleted = i < activeStep;
        const isActive = i === activeStep;

        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="absolute top-4 left-1/2 w-full h-0.5"
                style={{
                  backgroundColor: isCompleted ? "#52B788" : "rgba(255,255,255,0.15)",
                }}
              />
            )}

            {/* Step circle */}
            <motion.div
              className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              animate={{
                backgroundColor: isCompleted
                  ? "#52B788"
                  : isActive
                    ? "#F4C430"
                    : "rgba(255,255,255,0.1)",
                color: isCompleted || isActive ? "#0A0A0A" : "rgba(255,255,255,0.4)",
                scale: isActive ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {isCompleted ? "✓" : i + 1}
            </motion.div>

            {/* Label */}
            <span
              className="mt-2 text-[10px] font-medium text-center hidden sm:block"
              style={{
                color: isActive ? "#F4C430" : isCompleted ? "#52B788" : "rgba(255,255,255,0.3)",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
