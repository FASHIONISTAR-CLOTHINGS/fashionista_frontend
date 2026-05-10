/**
 * @file components/index.ts
 * @description Enterprise Product Builder component barrel.
 *
 * ONLY export the 8-step enterprise builder components.
 * Legacy MultiStep components (MultiStep, BasicInformation, Prices,
 * Category, Gallery, Sizes, Color, Specification) have been deleted.
 */

// ── Orchestrator ──────────────────────────────────────────────────────────────
export { ProductBuilder } from "./ProductBuilder";

// ── Provider / Context ────────────────────────────────────────────────────────
export { ProductBuilderProvider, useBuilderContext } from "./ProductBuilderProvider";

// ── Step Components ───────────────────────────────────────────────────────────
export { Step1BasicInfo } from "./Step1BasicInfo";
export { Step2Pricing } from "./Step2Pricing";
export { Step3Gallery } from "./Step3Gallery";
export { Step4SizesColors } from "./Step4SizesColors";
export { Step5Variants } from "./Step5Variants";
export { Step6Specifications } from "./Step6Specifications";
export { Step7Faqs } from "./Step7Faqs";
export { Step8Publish } from "./Step8Publish";

// ── Navigation ────────────────────────────────────────────────────────────────
export { BuilderStepper } from "./BuilderStepper";
