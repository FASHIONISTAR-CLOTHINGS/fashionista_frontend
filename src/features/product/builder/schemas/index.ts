/**
 * @file index.ts
 * @description Backward-compatibility barrel for legacy `builder/schemas` import.
 *
 * actions.ts was written against an older schema naming convention.
 * This module re-exports the canonical builder.schemas.ts under the legacy
 * names so that existing action code compiles without modification.
 *
 * ⚠️  For new code, always import from `./builder.schemas` directly.
 */
export {
  Step1Schema as BasicInformationSchema,
  Step2Schema as PricesSchema,
  Step3Schema as GallerySchema,
  Step4Schema as SizesSchema,
  Step6Schema as SpecificationSchema,
} from "./builder.schemas";

// CategorySchema — Step 1 owns category_ids/sub_category_ids; expose Step1Schema for it.
export { Step1Schema as CategorySchema } from "./builder.schemas";

// Re-export everything else for completeness
export * from "./builder.schemas";
