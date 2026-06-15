/**
 * @file components/index.ts
 * @description Enterprise Product Builder component barrel.
 * Exporting the 5-step consolidated product builder components.
 */

// ── Orchestrator ──────────────────────────────────────────────────────────────
export { ProductBuilder } from "./ProductBuilder";

// ── Provider / Context ────────────────────────────────────────────────────────
export { ProductBuilderProvider, useBuilderContext } from "./ProductBuilderProvider";

// ── Individual step components ───────────────────────────────────────────────
export * from "./Step1InfoAndSpecs";
export * from "./Step2PricingAndMeasurements";
export * from "./Step3MediaAndMapping";
export * from "./Step4Shipping";
export * from "./Step5FAQAndReview";
export * from "./ProductBuilder";
export * from "./ProductBuilderProvider";
export * from "./BuilderStepper";
