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
export { Step1BasicInfo } from "./Step1BasicInfo";
export { Step2AestheticsMedia } from "./Step2AestheticsMedia";
export { Step3VariantsSizing } from "./Step3VariantsSizing";
export { Step4ShippingLogistics } from "./Step4ShippingLogistics";
export { Step5ReviewSubmit } from "./Step5ReviewSubmit";

// ── Navigation ────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./BuilderStepper";
