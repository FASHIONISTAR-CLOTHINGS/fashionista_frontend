/**
 * @file index.ts
 * @description Builder feature barrel — exports all schemas, context, and components.
 */

// ── Schemas ─────────────────────────────────────────────────────────────────
export * from "./schemas/builder.schemas";
export * from "./schemas/stepper.schemas";

// ── Provider / Context ───────────────────────────────────────────────────────
export { ProductBuilderProvider, useBuilderContext } from "./components/ProductBuilderProvider";
export { useProductBuilderStore } from "./store/useProductBuilderStore";
export { BuilderErrorBoundary } from "./components/BuilderErrorBoundary";
export { HydrationGuard } from "./components/HydrationGuard";


// ── API Actions ──────────────────────────────────────────────────────────────
export {
  BasicInformationAction,
  PricesAction,
  CategoryAction,
  GalleryAction,
  SpecificationAction,
  SizesAction,
  newProduct,
  deleteProduct,
  editProduct,
} from "./api/actions";

// ── Orchestrator ─────────────────────────────────────────────────────────────
export { ProductBuilder } from "./components/ProductBuilder";

// ── Step Components ──────────────────────────────────────────────────────────
export { Step1InfoAndSpecs } from "./components/Step1InfoAndSpecs";
export { Step2MediaAndMapping } from "./components/Step2MediaAndMapping";
export { Step3PricingAndMeasurements } from "./components/Step3PricingAndMeasurements";
export { Step4Shipping } from "./components/Step4Shipping";
export { Step5FAQAndReview, FASHION_FAQS } from "./components/Step5FAQAndReview";

// ── Stepper ──────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./components/BuilderStepper";
