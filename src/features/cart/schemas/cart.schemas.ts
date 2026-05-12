/**
 * @file cart.schemas.ts
 * @description Zod validation schemas for the Cart domain.
 */
import { z } from "zod";

export const CartProductRefSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  sku: z.string(),
  cover_image_url: z.string().url().nullable(),
  requires_measurement: z.boolean(),
  vendor_name: z.string(),
});

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  product: CartProductRefSchema,
  variant_id: z.string().uuid().nullable(),
  size_label: z.string().nullable(),
  color_label: z.string().nullable(),
  quantity: z.number().int().min(1),
  unit_price: z.string(),
  line_total: z.string(),
  currency: z.string(),
});

export const AppliedCouponSchema = z.object({
  code: z.string(),
  coupon_type: z.string(),
  discount_amount: z.string(),
});

export const CartSchema = z.object({
  id: z.string().uuid().nullable(),
  items: z.array(CartItemSchema),
  item_count: z.number().int().min(0),
  subtotal: z.string(),
  currency: z.string(),
  expires_at: z.string().nullable(),
  applied_coupon: AppliedCouponSchema.nullable().optional(),
});

export const CheckoutQuoteSchema = z.object({
  subtotal: z.string(),
  shipping_cost: z.string(),
  measurement_fee: z.string(),
  discount_amount: z.string(),
  tax_amount: z.string(),
  final_total: z.string(),
  currency: z.string(),
  applied_coupon: AppliedCouponSchema.nullable(),
  measurement_required: z.boolean(),
});

export const CheckoutSessionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "prepared", "submitted", "expired"]),
  quote: CheckoutQuoteSchema.nullable(),
  shipping_address: z.record(z.unknown()).nullable(),
  idempotency_key: z.string(),
  expires_at: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
});

export const SubmitCheckoutResponseSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string(),
  payment_url: z.string().url().nullable(),
  message: z.string(),
});

/** Parse helper — fail loudly in dev, log + fallback in prod. */
export function parseCartResponse<T>(schema: z.ZodType<T>, data: unknown, ctx?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = `[Zod/Cart] Schema mismatch${ctx ? ` in ${ctx}` : ""}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(msg, result.error.flatten(), data);
      throw new Error(msg);
    }
    console.error(msg);
    return data as T;
  }
  return result.data;
}
