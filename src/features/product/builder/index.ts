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
export { Step2SizingAndFabric } from "./components/Step2SizingAndFabric";
export { Step3MediaAndMapping } from "./components/Step3MediaAndMapping";
export { Step4PricingAndSKUs } from "./components/Step4PricingAndSKUs";
export { Step5ReviewSubmit } from "./components/Step5ReviewSubmit";

// ── Stepper ──────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./components/BuilderStepper";
