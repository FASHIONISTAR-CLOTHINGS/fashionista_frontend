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
import { useDraftStore } from "../store";
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
import { Button } from "@/components/ui/button";
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
  const syncStatus = useDraftStore((state) => state.syncStatus);

  const renderSyncStatus = () => {
    switch (syncStatus) {
      case "saving":
        return <span className="text-[#7A6B44] text-xs animate-pulse">Syncing…</span>;
      case "synced":
        return <span className="text-[#01454A] text-xs font-semibold">✓ Synced to cloud</span>;
      case "failed":
        return <span className="text-red-500 text-xs font-semibold">Sync failed</span>;
      default:
        return <span className="text-[#7A6B44] text-xs">Saved locally</span>;
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-[#ECE6D6] mt-8">
      {/* ── Back ── */}
      <Button
        type="button"
        variant="ghost"
        onClick={prevStep}
        disabled={isFirst || isSubmitting}
        className={cn(
          "text-[#7A6B44] hover:text-[#1A1208] hover:bg-[#F8F5ED] border border-[#ECE6D6] gap-2",
          isFirst && "invisible",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      {/* ── Step indicator (center) ── */}
      <div className="flex flex-col items-center select-none">
        <span className="text-[#7A6B44] text-sm font-medium">
          Step {currentStep} of {BUILDER_STEPS.length}
        </span>
        {renderSyncStatus()}
      </div>

      {/* ── Next / Submit ── */}
      {isLast ? (
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "gap-2 px-6 font-semibold",
            publishIntent === "pending"
              ? "bg-[#FDA600] hover:bg-[#E8960A] text-black shadow-lg shadow-[#FDA600]/30"
              : "bg-[#01454A] hover:bg-[#01454A]/90 text-white shadow-lg shadow-[#01454A]/25",
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : publishIntent === "pending" ? (
            <><SendHorizontal className="w-4 h-4" /> Submit for Review</>
          ) : (
            <><Save className="w-4 h-4" /> Save as Draft</>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={nextStep}
          disabled={isSubmitting}
          className="gap-2 px-6 bg-[#FDA600] hover:bg-[#E8960A] text-black font-semibold shadow-lg shadow-[#FDA600]/25"
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
        <Loader2 className="w-8 h-8 animate-spin text-[#01454A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stepper ── */}
      <BuilderStepper />

      {/* ── Step header ── */}
      <div className="pb-4 border-b border-[#ECE6D6] mb-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#FDA600] to-[#FDA600]/40 flex-shrink-0" />
          <div>
            <h2 className="text-[#1A1208] font-bold text-xl leading-tight">
              {stepMeta.label}
            </h2>
            <p className="text-[#7A6B44] text-sm mt-0.5">{stepMeta.description}</p>
          </div>
        </div>
      </div>

      {/* ── Active step content ── */}
      <div className="min-h-[400px] animate-step-enter">
        {StepComponent && <StepComponent />}
      </div>

      {/* ── Navigation ── */}
      <BuilderNavigation />
    </div>
  );
}
