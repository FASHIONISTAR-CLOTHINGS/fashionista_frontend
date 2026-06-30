// features/product/types/shipping.types.ts
// TypeScript types for ProductShippingProfile

export interface ShippingProfile {
  id: string;
  vendor_id?: string | null;
  weight_kg: string;
  dimensions_cm?: Record<string, unknown> | null;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  is_fragile: boolean;
  requires_signature: boolean;
  restricted_countries: string[];
  free_shipping_threshold?: string | null;
  processing_days: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ShippingProfileCreatePayload {
  weight_kg?: string | number;
  length_cm?: string | number;
  width_cm?: string | number;
  height_cm?: string | number;
  is_fragile?: boolean;
  requires_signature?: boolean;
  restricted_countries?: string[];
  free_shipping_threshold?: string | number | null;
  processing_days?: number;
}
