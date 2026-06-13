/**
 * @file components/index.ts
 * @description Enterprise Product Builder component barrel.
 * Exporting the 5-step consolidated product builder components.
 */

// ── Orchestrator ──────────────────────────────────────────────────────────────
export { ProductBuilder } from "./ProductBuilder";

// ── Provider / Context ────────────────────────────────────────────────────────
export { ProductBuilderProvider, useBuilderContext } from "./ProductBuilderProvider";

// ── Step Components ───────────────────────────────────────────────────────────
export { Step1InfoAndSpecs } from "./Step1InfoAndSpecs";
export { Step2SizingAndFabric } from "./Step2SizingAndFabric";
export { Step3MediaAndMapping } from "./Step3MediaAndMapping";
export { Step4PricingAndSKUs } from "./Step4PricingAndSKUs";
export { Step5ReviewSubmit } from "./Step5ReviewSubmit";

// ── Navigation ────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./BuilderStepper";
