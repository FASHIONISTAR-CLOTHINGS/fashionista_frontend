/**
 * @file builder.schemas.ts
 * @description Consolidated 5-step product builder Zod FormSchema.
 *
 * Every step has:
 *   1. An isolated StepSchema (validates only that step's fields → clean UX errors)
 *   2. A combined ProductBuilderFormSchema (validates the whole form on final submit)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Step map:
 *   Step 1 – Info & Specs       (title, description, condition, categories, specifications)
 *   Step 2 – Sizing & Fabric    (sizes, colors, fabric composition/care, templates, measurement guides)
 *   Step 3 – Media & Gallery    (cover image, gallery media with color/variant mapping)
 *   Step 4 – Pricing & SKUs     (base price, old_price, stock, weight, variants SKU table)
 *   Step 5 – FAQs & Publish     (Q&A accordion, publish intent, featured/hot_deal, SEO meta, demographic tags)
 * ────────────────────────────────────────────────────────────────────────────
 */
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES reused across steps
// ─────────────────────────────────────────────────────────────────────────────

/** Positive-integer quantity — min 0 for draft saves, min 1 for publish. */
const QtySchema = z.number().int().min(0, "Quantity cannot be negative");

/** Monetary string — mirrors backend DecimalField precision(12,2). */
const MoneySchema = z
  .string()
  .min(1, "Price is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 12500.00)")
  .refine((val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 5000;
  }, {
    message: "Price must be at least ₦5,000.00",
  });

/** Optional monetary string — allows empty string. */
const OptionalMoneySchema = z
  .string()
  .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid price or leave blank")
  .optional()
  .or(z.literal(""))
  .refine((val) => {
    if (!val || val === "") return true;
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 5000;
  }, {
    message: "Price must be at least ₦5,000.00",
  });

/** UUID or empty string — used for FK references. */
const FKIdSchema = z.string().uuid("Select a valid option").optional().nullable();

/** Non-empty slug-safe label. */
const LabelSchema = z.string().min(1, "This field is required").max(255);

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const SpecRowSchema = z.object({
  title: LabelSchema.max(100, "Spec title is too long"),
  content: z.string().min(1, "Specification value is required").max(2000),
});

export type SpecRow = z.infer<typeof SpecRowSchema>;

export const FabricCompositionItemSchema = z.object({
  material: z.string().min(1, "Material name is required"),
  percentage: z.number().int().min(0).max(100, "Percentage must be 0-100"),
});

export type FabricCompositionItem = z.infer<typeof FabricCompositionItemSchema>;

export const MeasurementGuideRowSchema = z.object({
  size_id: z.string().uuid().nullable().optional(),
  size_label: z.enum(["XS", "S", "M", "L", "XL", "XXL", "Custom"], { required_error: "Size label is required" }),
  chest_cm: z.string().optional().default(""),
  waist_cm: z.string().optional().default(""),
  hip_cm: z.string().optional().default(""),
  shoulder_cm: z.string().optional().default(""),
  sleeve_cm: z.string().optional().default(""),
  length_cm: z.string().optional().default(""),
  inseam_cm: z.string().optional().default(""),
  foot_length_cm: z.string().optional().default(""),
  sort_order: z.number().int().default(0),
});

export type MeasurementGuideRow = z.infer<typeof MeasurementGuideRowSchema>;

export const GalleryItemSchema = z.object({
  public_id: z.string().min(1, "Upload not complete"),
  secure_url: z.string().url("Invalid media URL"),
  media_type: z.enum(["image", "video"]).default("image"),
  alt_text: z.string().max(200).optional().or(z.literal("")),
  ordering: z.number().int().min(0).default(0),
  variant_id: z.string().uuid().nullable().optional(),
  color_id: z.string().uuid().nullable().optional(),
});

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const VariantRowSchema = z.object({
  size_id: z.string().uuid().nullable().optional(),
  color_id: z.string().uuid().nullable().optional(),
  price_override: OptionalMoneySchema,
  stock_qty: QtySchema,
  sku: z.string().max(100).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  barcode: z.string().max(100).optional().or(z.literal("")),
  weight_kg: z
    .string()
    .regex(/^(\d+(\.\d{1,3})?)?$/, "Weight must be decimal")
    .optional()
    .or(z.literal("")),
  dimensions_cm: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional()
    .nullable(),
  notes: z.string().optional().default(""),
  is_default: z.boolean().default(false),
});

export type VariantRow = z.infer<typeof VariantRowSchema>;

export const FaqRowSchema = z.object({
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question is too long"),
  answer: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(2000, "Answer is too long"),
});

export type FaqRow = z.infer<typeof FaqRowSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// STEP 1: Info & Specs
export const Step1Schema = z.object({
  /** Full product title shown on PDP and catalog listings. */
  title: z
    .string()
    .min(1, "Product title is required")
    .max(255, "Title is too long (max 255 characters)")
    .refine((val) => val.length === 0 || val.length >= 5, {
      message: "Title must be at least 5 characters",
    }),

  /** Rich-text description (HTML string from editor). Min 30 characters. */
  description: z
    .string()
    .min(1, "Product description is required")
    .refine((val) => val.length === 0 || val.trim().length >= 30, {
      message: "Description must be at least 30 characters",
    }),

  /**
   * Product condition — maps to backend ProductCondition choices.
   * Defaults to "new" for apparel use-case.
   */
  condition: z.enum(["new", "used", "refurbished"], {
    required_error: "Select a product condition",
  }),

  /**
   * Canonical catalog categories.
   *
   * Mirrors the backend Product.categories M2M contract:
   * one selection is required, five is the hard cap for SEO/ranking quality.
   */
  category_ids: z
    .array(z.string().uuid("Select a valid category"))
    .min(1, "Select at least one category")
    .max(15, "You can select up to 15 categories")
    .default([]),

  /** Optional deeper discovery facets. Also capped at 15 backend-side. */
  sub_category_ids: z
    .array(z.string().uuid("Select a valid sub-category"))
    .max(15, "You can select up to 15 sub-categories")
    .default([]),

  /** Comma-separated tag UUIDs — multi-select from ProductTag catalog. */
  tag_ids: z.array(z.string().uuid()).max(10, "You can add up to 10 tags").default([]),
  specifications: z.array(SpecRowSchema).max(20, "Maximum 20 specifications allowed").default([]),
});

export type Step1Values = z.infer<typeof Step1Schema>;

// STEP 2: Sizing & Fabric
export const Step2BaseSchema = z.object({
  size_ids: z
    .array(z.string().uuid())
    .max(30, "You can select up to 30 sizes")
    .default([]),
  color_ids: z
    .array(z.string().uuid())
    .max(20, "You can select up to 20 colors")
    .default([]),
  requires_measurement: z.boolean().default(false),
  is_customisable: z.boolean().default(false),
  measurement_template: z.string().uuid().nullable().optional(),
  measurement_guide: z.array(MeasurementGuideRowSchema).default([]),
  
  // Fabric details
  fabric_type: z.string().max(120).optional().or(z.literal("")),
  fabric_composition: z.array(FabricCompositionItemSchema).default([]),
  fabric_care_instructions: z
    .enum([
      "machine_wash",
      "hand_wash",
      "dry_clean",
      "do_not_wash",
      "cold_wash",
      "tumble_dry",
      "air_dry",
    ])
    .default("machine_wash"),
  fabric_care_notes: z.string().optional().default(""),
  fabric_is_organic: z.boolean().default(false),
  fabric_is_vegan: z.boolean().default(false),
  fabric_country_of_origin: z.string().max(80).optional().default(""),
});

export const Step2Schema = Step2BaseSchema;
export type Step2Values = z.infer<typeof Step2Schema>;

// STEP 3: Media & Gallery Mapping
export const Step3Schema = z.object({
  cover_image_public_id: z
    .string({ required_error: "A cover image is required" })
    .min(1, "A cover image is required"),
  cover_image_url: z.string().url("Invalid cover image URL").nullable().optional(),
  gallery: z
    .array(GalleryItemSchema)
    .max(12, "Maximum 12 gallery items allowed")
    .default([]),
});

export type Step3Values = z.infer<typeof Step3Schema>;

// STEP 4: Pricing & SKUs
export const Step4BaseSchema = z.object({
  price: MoneySchema,

  /** Strike-through price (before discount). Must be > price when provided. */
  old_price: OptionalMoneySchema,

  /** ISO-4217 currency code. Platform default: NGN. */
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").default("NGN"),

  /** Physical stock quantity. */
  stock_qty: QtySchema.min(1, "Stock must be at least 1 unit"),
  max_stock: QtySchema.optional().nullable(),
  weight_kg: z
    .string()
    .regex(/^(\d+(\.\d{1,3})?)?$/, "Enter a valid weight in kg (e.g. 1.5)")
    .optional()
    .or(z.literal("")),
  shipping_amount: OptionalMoneySchema,

  /** Delivery courier UUID — optional; platform default used when absent. */
  courier_id: FKIdSchema,
  variants: z.array(VariantRowSchema).max(100, "Too many variants").default([]),
});

export const Step4Schema = Step4BaseSchema.superRefine((data, ctx) => {
  if (data.old_price && data.old_price !== "") {
    const oldP = parseFloat(data.old_price);
    const current = parseFloat(data.price);
    if (!isNaN(oldP) && !isNaN(current) && oldP <= current) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["old_price"],
        message: "Original price must be higher than the current price",
      });
    }
  }
});

export type Step4Values = z.infer<typeof Step4Schema>;

// STEP 5: FAQs & Publish
export const Step5Schema = z.object({
  faqs: z.array(FaqRowSchema).max(10, "Maximum 10 FAQs allowed").default([]),
  publish_intent: z.enum(["draft", "pending"], {
    required_error: "Select a publish intent",
  }),

  /** Feature this product on the homepage hero carousel. */
  featured: z.boolean().default(false),

  /** Mark as a hot-deal / flash-sale item. */
  hot_deal: z.boolean().default(false),

  /** True for downloadable digital goods (no shipping required). */
  digital: z.boolean().default(false),

  /** SEO meta title override. Falls back to product title when blank. */
  meta_title: z.string().max(160).optional().or(z.literal("")),

  /** SEO meta description override. Shown in search-engine snippets. */
  meta_description: z.string().max(320).optional().or(z.literal("")),
  age_group: z.string().optional().default(""),
  gender_target: z.string().optional().default(""),
});

export type Step5Values = z.infer<typeof Step5Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE FULL-FORM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const ProductBuilderFormSchema = Step1Schema.merge(Step2BaseSchema)
  .merge(Step3Schema)
  .merge(Step4BaseSchema)
  .merge(Step5Schema)
  .superRefine((data, ctx) => {
    // Pricing check
    if (data.old_price && data.old_price !== "") {
      const oldP = parseFloat(data.old_price as string);
      const current = parseFloat(data.price);
      if (!isNaN(oldP) && !isNaN(current) && oldP <= current) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["old_price"],
          message: "Original price must be higher than the current price",
        });
      }
    }

    // Cover image check
    if (data.publish_intent === "pending" && !data.cover_image_public_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cover_image_public_id"],
        message: "A cover image is required before submitting for review",
      });
    }

    // Variant stock sum check
    const variants = data.variants as Array<{ stock_qty?: number }> | undefined;
    if (variants && variants.length > 0) {
      const variantTotal = variants.reduce((sum: number, v) => sum + (v.stock_qty ?? 0), 0);
      if (variantTotal > (data.stock_qty as number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stock_qty"],
          message: `Total variant stock (${variantTotal}) exceeds product stock (${data.stock_qty})`,
        });
      }
    }
  });

export type ProductBuilderFormValues = z.infer<typeof ProductBuilderFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP METADATA — drives the stepper UI component
// ─────────────────────────────────────────────────────────────────────────────

export interface StepMeta {
  /** 1-indexed step number. */
  step: number;
  /** Label shown in the stepper bar. */
  label: string;
  /** Icon name from lucide-react. */
  icon: string;
  /** Tooltip / helper text shown on hover. */
  description: string;
}

export const BUILDER_STEPS: StepMeta[] = [
  { step: 1, label: "Info & Specs",     icon: "Info",           description: "Basic details, categories, and technical specifications" },
  { step: 2, label: "Sizing & Fabric",  icon: "Palette",        description: "Sizes, colors, fabric properties, and size charts" },
  { step: 3, label: "Media & Mapping",  icon: "Image",          description: "Upload cover and gallery media with variant mappings" },
  { step: 4, label: "Pricing & SKUs",   icon: "DollarSign",     description: "Set base price, stock, and variations matrix" },
  { step: 5, label: "FAQs & Publish",   icon: "SendHorizontal", description: "Frequently asked questions, SEO tags, and publish settings" },
] as const;

/** Total number of builder steps — used for progress calculation. */
export const TOTAL_STEPS = BUILDER_STEPS.length;

/** Returns 0–100 progress percentage for current step. */
export const builderProgress = (currentStep: number): number =>
  Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
