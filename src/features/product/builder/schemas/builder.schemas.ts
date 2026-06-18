import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const QtySchema = z.number().int().min(0, "Quantity cannot be negative");

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

const FKIdSchema = z.string().uuid("Select a valid option").optional().nullable();

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
  color_name: z.string().max(100).optional().default(""),
  color_hex: z.string().max(7).optional().default(""),
  size_id: z.string().uuid().nullable().optional(),
  sku: z.string().optional().default(""),
  barcode: z.string().max(100).optional().default(""),
  video_thumbnail: z.string().optional().default(""),
  duration_sec: z.number().int().min(0).nullable().optional(),
});

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const FaqRowSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(10).max(2000),
});

export type FaqRow = z.infer<typeof FaqRowSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// STEP 1: Info & Specs
export const Step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(30, "Description must be at least 30 characters"),
  condition: z.enum(["new", "used", "refurbished"], { required_error: "Select a condition" }),
  category_ids: z.array(z.string().uuid()).min(1).max(15).default([]),
  sub_category_ids: z.array(z.string().uuid()).max(15).default([]),
  gender_target: z.string().optional().default(""),
  age_group: z.string().optional().default(""),
});

export type Step1Values = z.infer<typeof Step1Schema>;

// Pricing & Measurements page, rendered as Step 3 in the vendor builder.
export const Step2BaseSchema = z.object({
  price: MoneySchema,
  old_price: OptionalMoneySchema,
  is_discounted: z.boolean().default(false),
  discount_percentage: z.number().min(0).max(100).default(0),
  discounted_price: OptionalMoneySchema,
  currency: z.string().length(3).default("NGN"),
  stock_qty: QtySchema.min(1, "Stock must be at least 1 unit"),
  max_stock: QtySchema.optional().nullable(),
  cash_payment_mode: z.enum([
    "disabled",
    "cod",
    "pay_at_shop",
    "payment_on_delivery",
    "payment_before_delivery",
    "part_payment_before_delivery",
    "allow_all",
  ]).default("disabled"),
  is_pre_order: z.boolean().default(false),
  pre_order_date: z.string().nullable().optional(),

  requires_measurement: z.boolean().default(false),
  is_customisable: z.boolean().default(false),
  measurement_guide: z.array(MeasurementGuideRowSchema).default([]),
  
  fabric_type: z.string().max(120).optional().or(z.literal("")),
  fabric_care_instructions: z.enum([
    "machine_wash",
    "hand_wash",
    "dry_clean",
    "do_not_wash",
    "cold_wash",
    "tumble_dry",
    "air_dry",
    "allow_all",
  ]).default("machine_wash"),
  fabric_is_organic: z.boolean().default(false),
  fabric_is_vegan: z.boolean().default(false),
  fabric_country_of_origin: z.string().max(80).optional().default(""),
});

export const Step2Schema = Step2BaseSchema.superRefine((data, ctx) => {
  if (data.old_price && data.old_price !== "") {
    const oldP = parseFloat(data.old_price);
    const current = parseFloat(data.price);
    if (!isNaN(oldP) && !isNaN(current) && oldP <= current) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["old_price"], message: "Original price must be higher than current price" });
    }
  }
});

export type Step2Values = z.infer<typeof Step2Schema>;

// Media & Mapping page, rendered as Step 2 in the vendor builder.
export const Step3Schema = z.object({
  cover_image_public_id: z.string().min(1, "A cover image is required"),
  cover_image_url: z.string().url().nullable().optional(),
  cover_image_sku: z.string().optional().default(""),
  cover_image_color_name: z.string().optional().default(""),
  cover_image_color_hex: z.string().optional().default(""),
  cover_image_size_id: z.string().uuid().nullable().optional(),
  gallery: z
    .array(GalleryItemSchema)
    .max(3, "Maximum 3 gallery items allowed in addition to the cover image")
    .default([]),
});

export type Step3Values = z.infer<typeof Step3Schema>;

// STEP 4: Shipping
export const Step4BaseSchema = z.object({
  weight_kg: z.string().regex(/^(\d+(\.\d{1,3})?)?$/, "Enter a valid weight in kg (e.g. 1.5)").optional().or(z.literal("")),
  length_cm: z.coerce.number().min(0).default(0),
  width_cm: z.coerce.number().min(0).default(0),
  height_cm: z.coerce.number().min(0).default(0),
  dimensions_cm: z.record(z.string(), z.any()).nullable().optional(),
  is_fragile: z.boolean().default(false),
  requires_signature: z.boolean().default(false),
  restricted_countries: z.array(z.string().min(2).max(80)).default([]),
  free_shipping_threshold: z
    .string()
    .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid threshold or leave blank")
    .optional()
    .or(z.literal("")),
  processing_days: z.coerce.number().int().min(1).max(90).default(1),
  shipping_amount: z
    .string()
    .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid price or leave blank")
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      const parsed = parseFloat(val);
      return !isNaN(parsed) && parsed >= 2500;
    }, {
      message: "Fixed shipping cost must be at least ₦2,500.00",
    }),
  courier_id: FKIdSchema,
});

export const Step4Schema = Step4BaseSchema;
export type Step4Values = z.infer<typeof Step4Schema>;

// STEP 5: FAQs & Publish
export const Step5Schema = z.object({
  faqs: z.array(FaqRowSchema).max(5, "Maximum 5 FAQs allowed").default([]),
  publish_intent: z.enum(["draft", "pending"], { required_error: "Select a publish intent" }),
  featured: z.boolean().default(false),
  hot_deal: z.boolean().default(false),
  meta_title: z.string().max(160).optional().or(z.literal("")),
  meta_description: z.string().max(320).optional().or(z.literal("")),
});

export type Step5Values = z.infer<typeof Step5Schema>;

export const ProductBuilderFormSchema = Step1Schema
  .merge(Step2BaseSchema)
  .merge(Step3Schema)
  .merge(Step4BaseSchema)
  .merge(Step5Schema);

export type ProductBuilderFormValues = z.infer<typeof ProductBuilderFormSchema>;

export interface StepMeta {
  step: number;
  label: string;
  icon: string;
  description: string;
}

export const BUILDER_STEPS: StepMeta[] = [
  { step: 1, label: "Info & Specs",     icon: "Info",           description: "Basic details and categories" },
  { step: 2, label: "Media & Mapping",  icon: "Image",          description: "Upload cover and gallery media with mappings" },
  { step: 3, label: "Pricing & Measurements",  icon: "DollarSign",        description: "Prices, fabric, and measurements" },
  { step: 4, label: "Shipping",   icon: "Truck",     description: "Shipping profile" },
  { step: 5, label: "FAQs & Publish",   icon: "SendHorizontal", description: "FAQs and publish settings" },
] as const;

export const TOTAL_STEPS = BUILDER_STEPS.length;
export const builderProgress = (currentStep: number): number =>
  Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
