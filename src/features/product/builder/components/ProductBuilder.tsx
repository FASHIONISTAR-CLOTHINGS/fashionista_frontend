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
import { Step1InfoAndSpecs } from "./Step1InfoAndSpecs";
import { Step2SizingAndFabric } from "./Step2SizingAndFabric";
import { Step3MediaAndMapping } from "./Step3MediaAndMapping";
import { Step4PricingAndSKUs } from "./Step4PricingAndSKUs";
import { Step5ReviewSubmit } from "./Step5ReviewSubmit";
import { BUILDER_STEPS } from "../schemas/builder.schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2, SendHorizontal, Save } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STEP → COMPONENT MAP
// ─────────────────────────────────────────────────────────────────────────────

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1InfoAndSpecs,
  2: Step2SizingAndFabric,
  3: Step3MediaAndMapping,
  4: Step4PricingAndSKUs,
  5: Step5ReviewSubmit,
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION BAR
// ─────────────────────────────────────────────────────────────────────────────

const isStepComplete = (step: number, values: any): boolean => {
  if (step === 1) {
    const title = (values.title || "").trim();
    const description = (values.description || "").trim();
    const categoryIds = values.category_ids || [];
    return title.length >= 5 && description.length >= 30 && categoryIds.length >= 1;
  }
  if (step === 3) {
    const coverImage = (values.cover_image_public_id || "").trim();
    return coverImage.length > 0;
  }
  if (step === 4) {
    const price = (values.price || "").trim();
    const stockQty = Number(values.stock_qty);
    return price.length > 0 && !isNaN(stockQty) && stockQty >= 1;
  }
  return true;
};

function BuilderNavigation() {
  const { currentStep, nextStep, prevStep, isSubmitting, form } = useBuilderContext();
  const isFirst = currentStep === 1;
  const isLast = currentStep === BUILDER_STEPS.length;
  const publishIntent = form.watch("publish_intent");
  const syncStatus = useDraftStore((state) => state.syncStatus);

  const values = form.watch();
  const stepComplete = isStepComplete(currentStep, values);

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
          className={cn(
            "gap-2 px-6 font-semibold transition-all duration-200",
            stepComplete
              ? "bg-[#FDA600] hover:bg-[#E8960A] text-black shadow-lg shadow-[#FDA600]/25 opacity-100"
              : "bg-[#FDA600]/35 text-black/40 hover:bg-[#FDA600]/45 shadow-none border border-[#FDA600]/10 cursor-pointer"
          )}
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
