import { z } from "zod";

// ── Coerce helper — Django DecimalField serialises to string, not number ──────
// Using z.coerce.number() safely converts "123.45" → 123.45 and 0 → 0.
const coerceNumber = z.coerce.number();

export const ClientAddressSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  full_name: z.string(),
  phone: z.string(),
  street_address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postal_code: z.string(),
  is_default: z.boolean(),
});

export const ClientProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_email: z.string(),
  bio: z.string(),
  default_shipping_address: z.string(),
  state: z.string(),
  country: z.string(),
  preferred_size: z.string(),
  style_preferences: z.array(z.string()),
  favourite_colours: z.array(z.string()),
  total_orders: coerceNumber,
  // Backend Django DecimalField sends this as a string e.g. "5400.00"
  // z.coerce.number() safely parses string → number at runtime
  total_spent_ngn: coerceNumber,
  is_profile_complete: z.boolean(),
  email_notifications_enabled: z.boolean(),
  sms_notifications_enabled: z.boolean(),
  addresses: z.array(ClientAddressSchema),
});

export const ClientDashboardSchema = z.object({
  profile: z.object({
    id: z.string(),
    bio: z.string(),
    preferred_size: z.string(),
    style_preferences: z.array(z.string()),
    favourite_colours: z.array(z.string()),
    country: z.string(),
    state: z.string(),
    is_profile_complete: z.boolean(),
  }),
  analytics: z.object({
    total_orders: coerceNumber,
    total_spent_ngn: coerceNumber,
    saved_addresses: coerceNumber,
  }),
  ai_recommendations: z.array(z.unknown()),
});

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
});

export type ClientAddressInput = z.infer<typeof ClientAddressSchema>;
export type ClientProfileInput = z.infer<typeof ClientProfileSchema>;
export type ClientDashboardInput = z.infer<typeof ClientDashboardSchema>;
export type ClientProfileUpdateInput = z.infer<typeof ClientProfileUpdateSchema>;
