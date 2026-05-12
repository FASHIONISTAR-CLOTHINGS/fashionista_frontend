"use client";

/**
 * @file BuilderStepper.tsx
 * @description Visual step indicator bar for the 8-step product builder.
 *
 * Features:
 *  - Horizontal scrollable nav on mobile, full bar on desktop
 *  - Completed steps show checkmark; active step highlighted; future steps muted
 *  - Animated progress bar fills from left to right
 *  - Accessible: role="navigation", aria-current="step"
 */


import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUILDER_STEPS } from "../schemas/builder.schemas";
import { useBuilderContext } from "./ProductBuilderProvider";

export function BuilderStepper() {
  const { currentStep, goToStep, progress } = useBuilderContext();

  return (
    <nav
      role="navigation"
      aria-label="Product builder steps"
      className="w-full"
    >
      {/* ── Progress bar ── */}
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* ── Step list ── */}
      <ol className="flex items-start gap-1 overflow-x-auto pb-2 scrollbar-none">
        {BUILDER_STEPS.map(({ step, label, description }) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li key={step} className="flex-shrink-0 flex-1 min-w-[80px]">
              <button
                type="button"
                title={description}
                aria-current={isActive ? "step" : undefined}
                onClick={() => isCompleted && goToStep(step)} // only allow going back
                disabled={!isCompleted && !isActive}
                className={cn(
                  "w-full flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  isActive && "bg-white/10",
                  isCompleted && "cursor-pointer hover:bg-white/5",
                  !isCompleted && !isActive && "opacity-40 cursor-not-allowed",
                )}
              >
                {/* Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                    isCompleted && "border-violet-500 bg-violet-500/20 text-violet-400",
                    isActive && "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-300",
                    !isCompleted && !isActive && "border-white/20 text-white/40",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight",
                    isActive && "text-white",
                    isCompleted && "text-violet-300",
                    !isCompleted && !isActive && "text-white/40",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
