/**
 * @file index.ts
 * @description Backward-compatibility barrel for legacy `builder/schemas` import.
 */
export {
  Step1Schema as BasicInformationSchema,
  Step3Schema as PricesSchema,
  Step1Schema as CategorySchema,
  Step2Schema as GallerySchema,
  Step3Schema as SizesSchema,
  Step5Schema as SpecificationSchema,
} from "./builder.schemas";

export * from "./builder.schemas";
