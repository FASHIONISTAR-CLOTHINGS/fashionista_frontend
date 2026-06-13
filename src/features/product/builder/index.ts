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
export { Step1BasicInfo } from "./components/Step1BasicInfo";
export { Step2AestheticsMedia } from "./components/Step2AestheticsMedia";
export { Step3VariantsSizing } from "./components/Step3VariantsSizing";
export { Step4ShippingLogistics } from "./components/Step4ShippingLogistics";
export { Step5ReviewSubmit } from "./components/Step5ReviewSubmit";

// ── Stepper ──────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./components/BuilderStepper";
