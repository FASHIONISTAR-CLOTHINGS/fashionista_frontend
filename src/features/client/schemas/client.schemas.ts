// features/client/schemas/client.schemas.ts
/**
 * Client Domain — Zod Runtime Validation Schemas.
 * Updated: 2026-05-26 — Expanded with rich analytics, measurement snapshot,
 *                         custom order milestones, support tickets, notifications.
 */
import { z } from "zod";

// ── Coerce helper — Django DecimalField serialises to string, not number ──────
// Using z.coerce.number() safely converts "123.45" → 123.45 and 0 → 0.
const coerceNumber = z.coerce.number();
const nullableCoerceNumber = z.preprocess(
  (value) => (value === null ? undefined : value),
  coerceNumber.optional(),
);
const nullableString = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().optional(),
);

// ── Address ───────────────────────────────────────────────────────────────────
export const ClientAddressSchema = z.object({
  id: z.string(),
  label: z.string(),
  full_name: z.string(),
  phone: z.string(),
  street_address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postal_code: z.string(),
  is_default: z.boolean(),
  created_at: z.string().optional(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const ClientProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  user_email: z.string(),
  bio: z.string().default(""),
  default_shipping_address: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  preferred_size: z.string().default(""),
  style_preferences: z.array(z.string()).default([]),
  favourite_colours: z.array(z.string()).default([]),
  total_orders: coerceNumber.default(0),
  // Backend Django DecimalField sends this as a string e.g. "5400.00"
  // z.coerce.number() safely parses string → number at runtime
  total_spent_ngn: coerceNumber.default(0),
  is_profile_complete: z.boolean().default(false),
  email_notifications_enabled: z.boolean().default(true),
  sms_notifications_enabled: z.boolean().default(true),
  last_active_at: z.string().nullable().optional(),
  phone_verified: z.boolean().default(false),
  loyalty_tier: z.string().default("standard"),
  loyalty_points: coerceNumber.default(0),
  referral_code: z.string().nullable().optional(),
  referral_count: coerceNumber.default(0),
  body_type: z.string().default(""),
  occasion_preferences: z.array(z.string()).default([]),
  addresses: z.array(ClientAddressSchema).default([]),
});

// ── Profile Update ────────────────────────────────────────────────────────────
export const ClientProfileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  default_shipping_address: z.string().optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  preferred_size: z.string().optional(),
  style_preferences: z.array(z.string()).optional(),
  favourite_colours: z.array(z.string()).optional(),
  email_notifications_enabled: z.boolean().optional(),
  sms_notifications_enabled: z.boolean().optional(),
  body_type: z.string().optional(),
  occasion_preferences: z.array(z.string()).optional(),
});

// ── Measurement Snapshot ──────────────────────────────────────────────────────
export const MeasurementSnapshotSchema = z
  .object({
    id: nullableString,
    height_cm: nullableCoerceNumber,
    weight_kg: nullableCoerceNumber,
    chest_cm: nullableCoerceNumber,
    waist_cm: nullableCoerceNumber,
    hip_cm: nullableCoerceNumber,
    shoulder_cm: nullableCoerceNumber,
    arm_length_cm: nullableCoerceNumber,
    inseam_cm: nullableCoerceNumber,
    updated_at: nullableString,
  })
  .default({});

// ── Dashboard Analytics ───────────────────────────────────────────────────────
export const ClientDashboardAnalyticsSchema = z.object({
  total_orders: coerceNumber.default(0),
  total_spent_ngn: coerceNumber.default(0),
  saved_addresses: coerceNumber.default(0),
  pending_orders: coerceNumber.default(0),
  active_orders: coerceNumber.default(0),
  completed_orders: coerceNumber.default(0),
  wishlist_count: coerceNumber.default(0),
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const ClientDashboardSchema = z.object({
  profile: z.object({
    id: z.string(),
    bio: z.string().default(""),
    preferred_size: z.string().default(""),
    style_preferences: z.array(z.string()).default([]),
    favourite_colours: z.array(z.string()).default([]),
    country: z.string().default(""),
    state: z.string().default(""),
    is_profile_complete: z.boolean().default(false),
    last_active_at: z.string().nullable().optional(),
    phone_verified: z.boolean().default(false),
    user_id: z.string().optional(),
    user_email: z.string().optional(),
    total_orders: coerceNumber.optional(),
    total_spent_ngn: coerceNumber.optional(),
    email_notifications_enabled: z.boolean().optional(),
    sms_notifications_enabled: z.boolean().optional(),
    default_shipping_address: z.string().optional(),
    addresses: z.array(ClientAddressSchema).default([]),
    loyalty_tier: z.string().default("standard"),
    loyalty_points: coerceNumber.default(0),
    referral_code: z.string().nullable().optional(),
    referral_count: coerceNumber.default(0),
    body_type: z.string().default(""),
    occasion_preferences: z.array(z.string()).default([]),
  }),
  analytics: ClientDashboardAnalyticsSchema,
  measurement_snapshot: MeasurementSnapshotSchema,
  ai_recommendations: z.array(z.unknown()).default([]),
});

// ── Custom Order ──────────────────────────────────────────────────────────────
export const CustomOrderMilestoneSchema = z.object({
  id: z.string(),
  milestone_pct: z.number(),
  amount_ngn: coerceNumber,
  payment_status: z.enum(["pending", "paid", "failed", "waived"]),
  paid_at: z.string().nullable().optional(),
});

export const CustomOrderSchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.enum([
    "draft", "submitted", "approved", "in_production", "completed", "cancelled", "disputed",
  ]),
  design_brief: z.string(),
  vendor_approval_note: z.string().default(""),
  budget_ngn: coerceNumber,
  agreed_amount_ngn: coerceNumber.optional(),
  product_snapshot_id: z.string().nullable().optional(),
  order_snapshot_id: z.string().nullable().optional(),
  vendor_store_name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  milestones: z.array(CustomOrderMilestoneSchema).default([]),
});

// ── Inferred types ─────────────────────────────────────────────────────────────
export type ClientAddressInput = z.infer<typeof ClientAddressSchema>;
export type ClientProfileInput = z.infer<typeof ClientProfileSchema>;
export type ClientDashboardInput = z.infer<typeof ClientDashboardSchema>;
export type ClientProfileUpdateInput = z.infer<typeof ClientProfileUpdateSchema>;
export type CustomOrderInput = z.infer<typeof CustomOrderSchema>;
export type CustomOrderMilestoneInput = z.infer<typeof CustomOrderMilestoneSchema>;
