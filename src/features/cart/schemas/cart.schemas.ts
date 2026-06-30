/**
 * @file cart.schemas.ts
 * @description Zod validation schemas for the Cart domain.
 */
import { z } from "zod";

const MoneyStringSchema = z.union([z.string(), z.number()]).transform((value) => String(value));

const LegacyAppliedCouponSchema = z
  .object({
    coupon_code: z.string().nullable().optional(),
    coupon_discount: MoneyStringSchema.optional(),
  })
  .transform((cart) => {
    if (!cart.coupon_code) return null;
    return {
      code: cart.coupon_code,
      coupon_type: "legacy",
      discount_amount: cart.coupon_discount ?? "0",
    };
  });

export const CartProductRefSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    sku: z.string(),
    cover_image_url: z.string().url().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    requires_measurement: z.boolean(),
    vendor_name: z.string(),
  })
  .transform((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    sku: product.sku,
    cover_image_url: product.cover_image_url ?? product.image_url ?? null,
    requires_measurement: product.requires_measurement,
    vendor_name: product.vendor_name,
  }));

export const CartItemSchema = z
  .object({
    id: z.string().uuid(),
    product: CartProductRefSchema,
    variant_id: z.string().uuid().nullable().optional(),
    variant: z.union([z.string().uuid(), z.null()]).optional(),
    size_label: z.string().nullable().optional(),
    color_label: z.string().nullable().optional(),
    quantity: z.number().int().min(1),
    unit_price: MoneyStringSchema,
    line_total: MoneyStringSchema,
    currency: z.string().optional(),
  })
  .transform((item) => ({
    id: item.id,
    product: item.product,
    variant_id: item.variant_id ?? item.variant ?? null,
    size_label: item.size_label ?? null,
    color_label: item.color_label ?? null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
    currency: item.currency ?? "NGN",
  }));

export const AppliedCouponSchema = z.object({
  code: z.string(),
  coupon_type: z.string(),
  discount_amount: z.string(),
});

export const CartSchema = z
  .object({
    id: z.string().uuid().nullable(),
    items: z.array(CartItemSchema),
    item_count: z.number().int().min(0),
    subtotal: MoneyStringSchema,
    currency: z.string().optional(),
    expires_at: z.string().nullable().optional(),
    last_activity: z.string().nullable().optional(),
    applied_coupon: AppliedCouponSchema.nullable().optional(),
    coupon_code: z.string().nullable().optional(),
    coupon_discount: MoneyStringSchema.optional(),
  })
  .transform((cart) => ({
    id: cart.id,
    items: cart.items,
    item_count: cart.item_count,
    subtotal: cart.subtotal,
    currency: cart.currency ?? "NGN",
    expires_at: cart.expires_at ?? cart.last_activity ?? null,
    applied_coupon:
      cart.applied_coupon ??
      LegacyAppliedCouponSchema.parse({
        coupon_code: cart.coupon_code,
        coupon_discount: cart.coupon_discount,
      }),
  }));

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
