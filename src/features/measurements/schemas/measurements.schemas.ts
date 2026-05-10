/**
 * @file measurements.schemas.ts
 * @description Zod schemas for Measurements domain — runtime parse safety.
 *
 * Schema parity with:
 *   apps/measurements/serializers/measurement_serializers.py (MeasurementProfileSerializer)
 *   apps/measurements/apis/async_/measurement_views.py (_serialize_profile)
 */
import { z } from "zod";

// ── Nullable decimal string (backend serializes Decimals as strings) ──────────
const decimalStr = z.string().nullable().optional().default(null);

export const MeasurementProfileSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().default("My Measurements"),
  is_default: z.boolean().default(false),
  unit: z.enum(["cm", "inch"]).default("cm"),
  is_verified: z.boolean().default(false),
  has_core_measurements: z.boolean().default(false),

  // Torso
  bust: decimalStr,
  waist: decimalStr,
  hips: decimalStr,
  shoulder_width: decimalStr,
  neck: decimalStr,

  // Lower body
  inseam: decimalStr,
  thigh: decimalStr,
  knee: decimalStr,
  ankle: decimalStr,

  // Arms
  arm_length: decimalStr,
  bicep: decimalStr,
  wrist: decimalStr,

  // Full body
  height: decimalStr,
  weight_kg: decimalStr,

  // Media
  reference_photo_url: z.string().nullable().optional().default(null),

  // Notes & timestamps
  notes: z.string().default(""),
  created_at: z.string().default(""),
  updated_at: z.string().default(""),
});

export type MeasurementProfileZod = z.infer<typeof MeasurementProfileSchema>;

/** List envelope from GET /api/v1/ninja/measurements/ */
export const MeasurementListEnvelopeSchema = z.object({
  status: z.string().optional(),
  data: z.array(MeasurementProfileSchema).default([]),
});

/** Single profile envelope from GET /api/v1/ninja/measurements/{id}/ */
export const MeasurementDetailEnvelopeSchema = z.object({
  status: z.string().optional(),
  data: MeasurementProfileSchema,
});

export const MirrorSizeSessionSchema = z.object({
  provider: z.literal("mirrorsize").default("mirrorsize"),
  access_code: z.string().min(1),
  qr_code: z.string().default(""),
  measurement_url: z.string().url(),
});

export const MirrorSizeSessionEnvelopeSchema = z.object({
  status: z.string().optional(),
  data: MirrorSizeSessionSchema,
});

/**
 * Parse and validate a measurements API response with safe error handling.
 * In development, throws on schema mismatch to surface integration issues fast.
 * In production, logs and falls back gracefully.
 */
export function parseMeasurementResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  ctx: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = `[Zod/Measurements] Schema mismatch in ${ctx}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(message, result.error.flatten(), data);
      throw new Error(message);
    }
    console.error(message);
    return data as T;
  }
  return result.data;
}
