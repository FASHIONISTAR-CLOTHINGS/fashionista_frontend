"use client";

/**
 * @file BuilderStepper.tsx
 * @description Visual step indicator bar for the 8-step product builder.
 *
 * Features:
 *  - Horizontal scrollable nav on mobile, full bar on desktop
 *  - Completed steps show checkmark; active step highlighted; future steps muted
 *  - Dual-tone animated progress bar (forest → gold gradient)
 *  - Step numbers for quick orientation
 *  - Accessible: role="navigation", aria-current="step"
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUILDER_STEPS } from "../schemas/builder.schemas";
import { useBuilderContext } from "./ProductBuilderProvider";

export function BuilderStepper() {
  const { currentStep, goToStep, progress, isEditMode } = useBuilderContext();

  return (
    <nav
      role="navigation"
      aria-label="Product builder steps"
      className="w-full"
    >
      {/* ── Progress bar ── */}
      <div className="relative h-1.5 bg-[#ECE6D6] rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #01454A 0%, #FDA600 100%)",
          }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* ── Step list ── */}
      <ol className="flex items-start gap-1 overflow-x-auto pb-2 scroll-hide">
        {BUILDER_STEPS.map(({ step, label, description }) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li key={step} className="flex-shrink-0 flex-1 min-w-[72px]">
              <button
                type="button"
                title={description}
                aria-current={isActive ? "step" : undefined}
                onClick={() => (isEditMode || isCompleted) && goToStep(step)}
                disabled={!isEditMode && !isCompleted && !isActive}
                className={cn(
                  "w-full flex flex-col items-center gap-1.5 px-1.5 py-2 rounded-xl transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01454A] focus-visible:ring-offset-1",
                  isActive && "bg-[#FFF6E3]",
                  (isEditMode || isCompleted) && "cursor-pointer hover:bg-[#F8F5ED]",
                  !isEditMode && !isCompleted && !isActive && "opacity-45 cursor-not-allowed",
                )}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all text-xs font-bold",
                    isCompleted && "border-[#01454A] bg-[#01454A] text-white shadow-sm shadow-[#01454A]/25",
                    isActive && "border-[#FDA600] bg-[#FDA600] text-black shadow-md shadow-[#FDA600]/30",
                    !isCompleted && !isActive && "border-[#D9D9D9] bg-white text-[#7A6B44]",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{step}</span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight",
                    isActive && "text-[#1A1208] font-bold",
                    isCompleted && "text-[#01454A] font-semibold",
                    !isCompleted && !isActive && "text-[#7A6B44]",
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
