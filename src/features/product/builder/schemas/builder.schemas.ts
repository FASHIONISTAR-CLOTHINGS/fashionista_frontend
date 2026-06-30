import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const QtySchema = z.coerce
  .number({
    invalid_type_error: "Enter stock quantity as a whole number, for example 12.",
  })
  .int("Enter stock quantity as a whole number, for example 12.")
  .min(0, "Quantity cannot be negative");

const MoneySchema = z
  .string()
  .trim()
  .min(1, "Enter the new product price, for example ₦15,000.00.")
  .regex(/^\d+(\.\d{1,2})?$/, "Use numbers only for price, for example 12500.00.")
  .refine((val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 5000;
  }, {
    message: "New price must be at least ₦5,000.00.",
  });

const OptionalMoneySchema = z
  .string()
  .trim()
  .regex(/^(\d+(\.\d{1,2})?)?$/, "Use numbers only, or leave this blank.")
  .optional()
  .or(z.literal(""))
  .refine((val) => {
    if (!val || val === "") return true;
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 5000;
  }, {
    message: "Old price must be at least ₦5,000.00 when provided.",
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

const MediaColorGalleryItemSchema = GalleryItemSchema.omit({ size_id: true });

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
  category_ids: z
    .array(z.string().uuid())
    .min(1, "Choose at least one product category.")
    .max(15, "Choose no more than 15 categories.")
    .default([]),
  gender_target: z.string().optional().default(""),
  age_group: z.string().optional().default(""),
});

export type Step1Values = z.infer<typeof Step1Schema>;

// STEP 2: Media & Mapping
export const Step2MediaAndMappingSchema = z.object({
  cover_image_public_id: z.string().min(1, "A cover image is required"),
  cover_image_url: z.string().url().nullable().optional(),
  cover_image_sku: z.string().optional().default(""),
  cover_image_color_name: z.string().optional().default(""),
  cover_image_color_hex: z.string().optional().default(""),
  gallery: z
    .array(MediaColorGalleryItemSchema)
    .max(3, "Maximum 3 gallery items allowed in addition to the cover image")
    .default([]),
});

export type Step2MediaAndMappingValues = z.infer<typeof Step2MediaAndMappingSchema>;

export const Step2Schema = Step2MediaAndMappingSchema;
export type Step2Values = Step2MediaAndMappingValues;

// STEP 3: Pricing & Measurements
export const Step3PricingAndMeasurementsBaseSchema = z.object({
  price: MoneySchema,
  old_price: OptionalMoneySchema,
  is_discounted: z.boolean().default(false),
  discount_percentage: z.number().min(0).max(100).default(0),
  discounted_price: OptionalMoneySchema,
  currency: z.string().length(3).default("NGN"),
  stock_qty: QtySchema.min(1, "Enter at least 1 available unit for this product."),
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
  cover_image_size_id: z.string().uuid().nullable().optional(),
  gallery: z.array(GalleryItemSchema).max(3).default([]),

  requires_measurement: z.boolean().default(false),
  is_customisable: z.boolean().default(false),
  
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

export const Step3PricingAndMeasurementsSchema = Step3PricingAndMeasurementsBaseSchema.superRefine((data, ctx) => {
  if (data.old_price && data.old_price !== "") {
    const oldP = parseFloat(data.old_price);
    const current = parseFloat(data.price);
    if (!isNaN(oldP) && !isNaN(current) && oldP <= current) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["old_price"], message: "Original price must be higher than current price" });
    }
  }
  if (data.is_pre_order) {
    if (!data.pre_order_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pre_order_date"],
        message: "Choose an expected availability date for pre-order items.",
      });
      return;
    }
    const selected = new Date(`${data.pre_order_date}T00:00:00`);
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(minDate.getDate() + 3);
    if (Number.isNaN(selected.getTime()) || selected < minDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pre_order_date"],
        message: "Pre-order availability date must be at least 3 days from today.",
      });
    }
  }
});

export type Step3PricingAndMeasurementsValues = z.infer<typeof Step3PricingAndMeasurementsSchema>;

export const Step3Schema = Step3PricingAndMeasurementsSchema;
export type Step3Values = Step3PricingAndMeasurementsValues;

// STEP 4: Shipping
export const Step4BaseSchema = z.object({
  weight_kg: z.string().regex(/^(\d+(\.\d{1,3})?)?$/, "Enter weight using numbers only, for example 1.5 kg.").optional().or(z.literal("")),
  length_cm: z.coerce.number().min(0, "Length cannot be negative.").default(0),
  width_cm: z.coerce.number().min(0, "Width cannot be negative.").default(0),
  height_cm: z.coerce.number().min(0, "Height cannot be negative.").default(0),
  dimensions_cm: z.record(z.string(), z.any()).nullable().optional(),
  is_fragile: z.boolean().default(false),
  requires_signature: z.boolean().default(false),
  processing_days: z.coerce.number().int("Processing days must be a whole number.").min(1, "Processing days must be at least 1 day.").max(90, "Processing days cannot exceed 90 days.").default(1),
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
});

export type Step5Values = z.infer<typeof Step5Schema>;

export const ProductBuilderFormSchema = Step1Schema
  .merge(Step2MediaAndMappingSchema)
  .merge(Step3PricingAndMeasurementsBaseSchema)
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
