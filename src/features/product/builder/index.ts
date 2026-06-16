/**
 * @file index.ts
 * @description Builder feature barrel — exports all schemas, context, and components.
 */

// ── Schemas ─────────────────────────────────────────────────────────────────
export * from "./schemas/builder.schemas";

// ── Provider / Context ───────────────────────────────────────────────────────
export { ProductBuilderProvider, useBuilderContext } from "./components/ProductBuilderProvider";

// ── Orchestrator ─────────────────────────────────────────────────────────────
export { ProductBuilder } from "./components/ProductBuilder";

// ── Step Components ──────────────────────────────────────────────────────────
export { Step1InfoAndSpecs } from "./components/Step1InfoAndSpecs";
export { Step2PricingAndMeasurements } from "./components/Step2PricingAndMeasurements";
export { Step3MediaAndMapping } from "./components/Step3MediaAndMapping";
export { Step4Shipping } from "./components/Step4Shipping";
export { Step5FAQAndReview, FASHION_FAQS } from "./components/Step5FAQAndReview";

// ── Stepper ──────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./components/BuilderStepper";
