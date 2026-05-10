"use client";

/**
 * @file ProductBuilder.tsx
 * @description Root orchestrator component for the 8-step product builder.
 *
 * Renders: BuilderStepper → active step component → BuilderNavigation
 * Wrapped by ProductBuilderProvider which owns form state and draft persistence.
 *
 * Usage:
 *   <ProductBuilder vendorId={user.vendorId} onSubmit={handleCreate} />
 */

import React from "react";
import { useBuilderContext } from "./ProductBuilderProvider";
import { BuilderStepper } from "./BuilderStepper";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Pricing } from "./Step2Pricing";
import { Step3Gallery } from "./Step3Gallery";
import { Step4SizesColors } from "./Step4SizesColors";
import { Step5Variants } from "./Step5Variants";
import { Step6Specifications } from "./Step6Specifications";
import { Step7Faqs } from "./Step7Faqs";
import { Step8Publish } from "./Step8Publish";
import { BUILDER_STEPS } from "../schemas/builder.schemas";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2, SendHorizontal, Save } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STEP → COMPONENT MAP
// ─────────────────────────────────────────────────────────────────────────────

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1BasicInfo,
  2: Step2Pricing,
  3: Step3Gallery,
  4: Step4SizesColors,
  5: Step5Variants,
  6: Step6Specifications,
  7: Step7Faqs,
  8: Step8Publish,
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION BAR
// ─────────────────────────────────────────────────────────────────────────────

function BuilderNavigation() {
  const { currentStep, nextStep, prevStep, isSubmitting, form } = useBuilderContext();
  const isFirst = currentStep === 1;
  const isLast = currentStep === BUILDER_STEPS.length;
  const publishIntent = form.watch("publish_intent");

  return (
    <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
      {/* ── Back ── */}
      <Button
        type="button"
        variant="ghost"
        onClick={prevStep}
        disabled={isFirst || isSubmitting}
        className={cn(
          "text-white/60 hover:text-white hover:bg-white/5 gap-2",
          isFirst && "invisible",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      {/* ── Step indicator (center) ── */}
      <span className="text-white/30 text-sm select-none">
        Step {currentStep} of {BUILDER_STEPS.length}
      </span>

      {/* ── Next / Submit ── */}
      {isLast ? (
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "gap-2 px-6 font-semibold",
            publishIntent === "pending"
              ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white shadow-lg shadow-violet-500/25"
              : "bg-zinc-700 hover:bg-zinc-600 text-white",
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : publishIntent === "pending" ? (
            <><SendHorizontal className="w-4 h-4" /> Submit for Review</>
          ) : (
            <><Save className="w-4 h-4" /> Save Draft</>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={nextStep}
          disabled={isSubmitting}
          className="gap-2 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/20"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN BUILDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ProductBuilder() {
  const { currentStep, draftLoaded } = useBuilderContext();
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepMeta = BUILDER_STEPS[currentStep - 1];

  if (!draftLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stepper ── */}
      <BuilderStepper />

      {/* ── Step header ── */}
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-white font-bold text-xl">
          {stepMeta.label}
        </h2>
        <p className="text-white/40 text-sm mt-0.5">{stepMeta.description}</p>
      </div>

      {/* ── Active step content ── */}
      <div className="min-h-[400px]">
        {StepComponent && <StepComponent />}
      </div>

      {/* ── Navigation ── */}
      <BuilderNavigation />
    </div>
  );
}
