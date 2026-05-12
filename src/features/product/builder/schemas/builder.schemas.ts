/**
 * @file builder.schemas.ts
 * @description 8-step product builder Zod FormSchema.
 *
 * Every step has:
 *   1. An isolated StepSchema (validates only that step's fields → clean UX errors)
 *   2. A combined ProductBuilderFormSchema (validates the whole form on final submit)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Step map:
 *   Step 1 – BasicInformation   (title, description, condition, capped categories)
 *   Step 2 – Pricing & Stock    (price, old_price, currency, stock_qty, shipping)
 *   Step 3 – Gallery            (cover image + up-to-12 gallery media)
 *   Step 4 – Sizes & Colors     (multiselect sizes + colors from catalog)
 *   Step 5 – Variants           (SKU-level rows linking size/color to price/qty)
 *   Step 6 – Specifications     (key-value attribute table)
 *   Step 7 – FAQs               (Q&A pairs)
 *   Step 8 – PublishSettings    (status, featured flags, shipping courier)
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
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 12500.00)")
  .min(1, "Price is required");

/** Optional monetary string — allows empty string. */
const OptionalMoneySchema = z
  .string()
  .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid price or leave blank")
  .optional()
  .or(z.literal(""));

/** UUID or empty string — used for FK references. */
const FKIdSchema = z.string().uuid("Select a valid option").optional().nullable();

/** Non-empty slug-safe label. */
const LabelSchema = z.string().min(1, "This field is required").max(255);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — BASIC INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export const Step1Schema = z.object({
  /** Full product title shown on PDP and catalog listings. */
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title is too long (max 255 characters)"),

  /** Rich-text description (HTML string from editor). Min 30 chars when stripped. */
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(10_000, "Description is too long"),

  /** Short marketing copy shown on listing cards. */
  short_description: z
    .string()
    .max(500, "Short description is too long (max 500 characters)")
    .optional()
    .or(z.literal("")),

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
    .max(5, "You can select up to 5 categories")
    .default([]),

  /** Optional deeper discovery facets. Also capped at five backend-side. */
  sub_category_ids: z
    .array(z.string().uuid("Select a valid sub-category"))
    .max(5, "You can select up to 5 sub-categories")
    .default([]),

  /** Comma-separated tag UUIDs — multi-select from ProductTag catalog. */
  tag_ids: z.array(z.string().uuid()).max(10, "You can add up to 10 tags").default([]),
});

export type Step1Values = z.infer<typeof Step1Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — PRICING & STOCK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Step2BaseSchema — the raw object without superRefine, used for .merge()
 * in the composite ProductBuilderFormSchema (ZodEffects is incompatible with .merge()).
 */
export const Step2BaseSchema = z.object({
  /** Selling price in the selected currency. */
  price: MoneySchema,

  /** Strike-through price (before discount). Must be > price when provided. */
  old_price: OptionalMoneySchema,

  /** ISO-4217 currency code. Platform default: NGN. */
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").default("NGN"),

  /** Physical stock quantity. */
  stock_qty: QtySchema.min(1, "Stock must be at least 1 unit"),

  /**
   * Whether this product requires a body measurement before ordering.
   * True = tailored/made-to-measure item.
   */
  requires_measurement: z.boolean().default(false),

  /** True if the customer can send customisation notes. */
  is_customisable: z.boolean().default(false),

  /** Flat shipping amount added to cart total. */
  shipping_amount: OptionalMoneySchema,

  /** Delivery courier UUID — optional; platform default used when absent. */
  courier_id: FKIdSchema,
});

/**
 * Step2Schema — for standalone step-level validation (includes old_price cross-check).
 * NOT used in .merge() — use Step2BaseSchema there instead.
 */
export const Step2Schema = Step2BaseSchema.superRefine((data, ctx) => {
  // old_price must be strictly greater than selling price when provided
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

export type Step2Values = z.infer<typeof Step2Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — GALLERY (media upload references)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single gallery item produced by the two-phase Cloudinary upload.
 * After direct upload succeeds, the client stores the resulting public_id here.
 */
export const GalleryItemSchema = z.object({
  /** Cloudinary public_id returned after direct upload. */
  public_id: z.string().min(1, "Upload not complete"),

  /** Pre-signed URL from Cloudinary for display in the builder preview. */
  secure_url: z.string().url("Invalid media URL"),

  /** Media type: 'image' | 'video'. */
  media_type: z.enum(["image", "video"]).default("image"),

  /** Descriptive alt text for accessibility and SEO. */
  alt_text: z.string().max(200).optional().or(z.literal("")),

  /** Display ordering — managed by DnD handler. */
  ordering: z.number().int().min(0).default(0),
});

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const Step3Schema = z.object({
  /**
   * Primary product image — required for publishing.
   * May be null during draft-save, validated on submit.
   */
  cover_image_public_id: z
    .string()
    .min(1, "A cover image is required")
    .nullable()
    .optional(),

  cover_image_url: z.string().url("Invalid cover image URL").nullable().optional(),

  /** Gallery media array — up to 12 items, at least 1 after cover. */
  gallery: z
    .array(GalleryItemSchema)
    .max(12, "Maximum 12 gallery items allowed")
    .default([]),
});

export type Step3Values = z.infer<typeof Step3Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — SIZES & COLORS
// ─────────────────────────────────────────────────────────────────────────────

export const Step4Schema = z.object({
  /**
   * Array of ProductSize UUIDs selected from the catalog.
   * At least one size required when variants will be created.
   */
  size_ids: z
    .array(z.string().uuid())
    .max(30, "You can select up to 30 sizes")
    .default([]),

  /**
   * Array of ProductColor UUIDs selected from the catalog.
   * At least one color required when variants will be created.
   */
  color_ids: z
    .array(z.string().uuid())
    .max(20, "You can select up to 20 colors")
    .default([]),
});

export type Step4Values = z.infer<typeof Step4Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single variant row — one SKU per size+color combination.
 * The vendor table is auto-generated by the step component from
 * the Cartesian product of Step 4's size_ids × color_ids.
 */
export const VariantRowSchema = z.object({
  /** UUID of the size dimension — must match a Step4 size_ids entry. */
  size_id: z.string().uuid().nullable().optional(),

  /** UUID of the color dimension — must match a Step4 color_ids entry. */
  color_id: z.string().uuid().nullable().optional(),

  /**
   * Variant-specific price override. If empty, the product base price applies.
   * Allows premium pricing for e.g. extra-large sizes.
   */
  price_override: OptionalMoneySchema,

  /** Stock units for this specific SKU. */
  stock_qty: QtySchema,

  /**
   * Explicit SKU code. Auto-generated from product slug + size + color
   * when left blank; vendor can customise.
   */
  sku: z.string().max(100).optional().or(z.literal("")),

  /** Whether this variant is currently offered. */
  is_active: z.boolean().default(true),
});

export type VariantRow = z.infer<typeof VariantRowSchema>;

export const Step5Schema = z.object({
  /**
   * Variant rows. May be empty if the product has no size/color matrix
   * (simple product). When populated, each row must be valid.
   */
  variants: z.array(VariantRowSchema).max(100, "Too many variants (max 100)").default([]),
});

export type Step5Values = z.infer<typeof Step5Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const SpecRowSchema = z.object({
  /** Specification title e.g. "Material", "Care Instructions". */
  title: LabelSchema.max(100, "Spec title is too long"),

  /** Rich-text or plain-text content for the spec value. */
  content: z.string().min(1, "Specification value is required").max(2_000),
});

export type SpecRow = z.infer<typeof SpecRowSchema>;

export const Step6Schema = z.object({
  /**
   * Key-value specification pairs. Free-form — up to 20 rows.
   * Displayed on PDP in a structured table.
   */
  specifications: z.array(SpecRowSchema).max(20, "Maximum 20 specifications allowed").default([]),
});

export type Step6Values = z.infer<typeof Step6Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — FAQs
// ─────────────────────────────────────────────────────────────────────────────

export const FaqRowSchema = z.object({
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question is too long"),
  answer: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(2_000, "Answer is too long"),
});

export type FaqRow = z.infer<typeof FaqRowSchema>;

export const Step7Schema = z.object({
  /** Customer FAQ pairs — up to 10. Renders as an accordion on PDP. */
  faqs: z.array(FaqRowSchema).max(10, "Maximum 10 FAQs allowed").default([]),
});

export type Step7Values = z.infer<typeof Step7Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8 — PUBLISH SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export const Step8Schema = z.object({
  /**
   * Publish intent:
   *   "draft"   → save, not visible to customers
   *   "pending" → submit for admin review
   */
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
});

export type Step8Values = z.infer<typeof Step8Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE FULL-FORM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merged schema used for final form submission.
 * Step-level schemas are merged so react-hook-form can share one
 * FormProvider across all 8 steps.
 *
 * Additional cross-step refinements are applied here:
 *  - cover_image_public_id is required when publish_intent === "pending"
 *  - stock_qty sum from variants must not exceed product-level stock
 */
export const ProductBuilderFormSchema = Step1Schema.merge(Step2BaseSchema)
  .merge(Step3Schema)
  .merge(Step4Schema)
  .merge(Step5Schema)
  .merge(Step6Schema)
  .merge(Step7Schema)
  .merge(Step8Schema)
  .superRefine((data, ctx) => {
    // old_price must be strictly greater than selling price when provided
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

    // Require cover image when submitting for review
    if (data.publish_intent === "pending" && !data.cover_image_public_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cover_image_public_id"],
        message: "A cover image is required before submitting for review",
      });
    }

    // Variant stock sum validation
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
  { step: 1, label: "Basic Info",       icon: "Info",         description: "Product title, description, and category facets" },
  { step: 2, label: "Pricing & Stock",  icon: "DollarSign",   description: "Set pricing, currency, stock and shipping" },
  { step: 3, label: "Gallery",          icon: "Image",        description: "Upload cover image and media gallery" },
  { step: 4, label: "Sizes & Colors",   icon: "Palette",      description: "Select available sizes and colours" },
  { step: 5, label: "Variants",         icon: "Layers",       description: "Define SKU-level price and stock per variation" },
  { step: 6, label: "Specifications",   icon: "ListChecks",   description: "Add material, care, and technical specs" },
  { step: 7, label: "FAQs",             icon: "HelpCircle",   description: "Add frequently asked questions" },
  { step: 8, label: "Publish",          icon: "SendHorizontal", description: "Configure visibility and SEO, then publish" },
] as const;

/** Total number of builder steps — used for progress calculation. */
export const TOTAL_STEPS = BUILDER_STEPS.length;

/** Returns 0–100 progress percentage for current step. */
export const builderProgress = (currentStep: number): number =>
  Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
