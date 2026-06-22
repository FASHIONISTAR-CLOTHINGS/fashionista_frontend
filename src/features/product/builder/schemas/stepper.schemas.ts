// fashionista_frontend/src/features/product/builder/schemas/stepper.schemas.ts
import { z } from "zod";

// Step 1 Schema: Core Garment Definitions (Completely excludes Sub-Categories)
export const Step1CoreSchema = z.object({
  title: z
    .string()
    .min(5, "Garment title must contain at least 5 characters.")
    .max(120, "Garment title cannot exceed 120 characters."),
  description: z
    .string()
    .min(10, "Provide a comprehensive description of at least 10 characters."),
  base_price: z
    .coerce
    .number()
    .positive("Base price must be a positive coefficient.")
    .min(500, "Minimum listing threshold is ₦500."),
  compare_at_price: z
    .coerce
    .number()
    .positive()
    .optional()
    .nullable(),
  category_ids: z
    .array(z.number().int().positive())
    .min(1, "Assign at least one active parent category for search indexing."),
  requires_measurement: z.boolean().default(false),
});

// Step 2 Schema: Media & Admin Shipping
export const Step2LogisticsSchema = z.object({
  images: z
    .array(z.string().url("Invalid media upload URL."))
    .min(1, "Upload at least one cover garment photo."),
  weight_kg: z
    .coerce
    .number()
    .positive("Physical package weight must be positive.")
    .default(0.5),
  dimensions: z.object({
    length: z.coerce.number().positive().default(0),
    width: z.coerce.number().positive().default(0),
    height: z.coerce.number().positive().default(0),
  }),
  preferred_couriers: z
    .array(z.number().int().positive())
    .min(1, "Select at least one admin-configured courier (DHL/FedEx)."),
});

// Step 3 Schema: Custom Sizing Specifications
export const Step3SizingSchema = z.object({
  requires_measurement: z.boolean(),
  size_chart_template_id: z.number().int().optional().nullable(),
  custom_measurement_keys: z.array(z.string()).optional().default([]),
});

// Step 4 Schema: Color & Size Variants
export const VariantItemSchema = z.object({
  id: z.number().int().optional(),
  sku: z.string().min(3, "SKU definition is required."),
  color: z.string().min(1, "Define a color hex swatch value."),
  size: z.string().min(1, "Define a standard size tag (S/M/L/XL)."),
  stock_qty: z.coerce.number().int().nonnegative("Inventory cannot be negative."),
  price_override: z.coerce.number().positive().optional().nullable(),
});

export const Step4VariantsSchema = z.object({
  variants: z
    .array(VariantItemSchema)
    .min(1, "Provide at least one color/size variant or SKU."),
});

// Consolidated Master Schema
export const ProductBuilderSchema = z.object({
  idempotency_token: z.string().uuid("Invalid idempotency token definition."),
  step1: Step1CoreSchema,
  step2: Step2LogisticsSchema,
  step3: Step3SizingSchema,
  step4: Step4VariantsSchema,
});

export type ProductBuilderType = z.infer<typeof ProductBuilderSchema>;
export type VariantItem = z.infer<typeof VariantItemSchema>;
