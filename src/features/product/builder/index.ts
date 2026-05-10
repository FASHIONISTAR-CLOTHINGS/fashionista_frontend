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
export { Step2Pricing } from "./components/Step2Pricing";
export { Step3Gallery } from "./components/Step3Gallery";
export { Step4SizesColors } from "./components/Step4SizesColors";
export { Step5Variants } from "./components/Step5Variants";
export { Step6Specifications } from "./components/Step6Specifications";
export { Step7Faqs } from "./components/Step7Faqs";
export { Step8Publish } from "./components/Step8Publish";

// ── Stepper ──────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./components/BuilderStepper";
