/**
 * @file order.schemas.ts
 * @description Zod validation schemas for the Order domain.
 */
import { z } from "zod";

// ─── Enum schemas with .catch() to survive legacy / migrated DB values ────────
// Backend may serve "pending" (legacy PAYMENT_STATUS tuple) or "standard" (old
// delivery_mode) on orders created before the OrderStatus TextChoices migration.
// Using .catch() coerces unknown strings to a safe default instead of crashing.
const OrderStatusSchema = z
  .enum([
    "pending_payment",
    "payment_confirmed",
    "awaiting_cash_confirmation",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "completed",
    "cancelled",
    "refund_requested",
    "refunded",
    "disputed",
  ])
  .catch("pending_payment"); // Coerce legacy "pending" / unknown → pending_payment

const CashPaymentModeSchema = z.enum(["disabled", "cod", "pay_at_shop", "both"]);

const OrderDeliveryModeSchema = z
  .enum(["platform_courier", "vendor_shop_pickup", "cod"])
  .catch("platform_courier"); // Coerce legacy "standard" / unknown → platform_courier
const EscrowStatusSchema = z.enum(["held", "released", "refunded", "disputed"]).catch("held");
// Legacy PAYMENT_STATUS tuple includes "pending", "processing", "cancelled", "initiated", "expired"
const PaymentStatusSchema = z
  .enum(["unpaid", "paid", "failed", "refunded", "pending", "processing", "cancelled", "initiated", "expired", "refunding"])
  .catch("unpaid");

export const OrderItemSnapshotSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  product_id: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "")),
  product_title: z.string().optional(),
  product_title_snapshot: z.string().optional(),
  product_sku: z.string().optional(),
  product_sku_snapshot: z.string().optional(),
  product_cover_image_url: z.string().nullable().optional(),
  product_cover_image_url_snapshot: z.string().nullable().optional(),
  vendor_id: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "")),
  vendor_name: z.string().optional().default(""),
  vendor_name_snapshot: z.string().optional().default(""),
  variant_id: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value === null || value === undefined ? null : String(value)),
  size_label: z.string().nullable().optional().default(null),
  color_label: z.string().nullable().optional().default(null),
  quantity: z.number().int().min(1).catch(1),
  unit_price: z.union([z.string(), z.number()]).transform(String).catch("0.00"),
  line_total: z.union([z.string(), z.number()]).transform(String).catch("0.00"),
  commission_rate: z.union([z.string(), z.number()]).transform(String).optional().default("0.00"),
  currency_code: z.string().optional().default("NGN"),
  requires_measurement: z.boolean().optional().default(false),
}).transform((data) => {
  return {
    ...data,
    product_title: data.product_title || data.product_title_snapshot || "Custom Tailored Outfit",
    product_sku: data.product_sku || data.product_sku_snapshot || "",
    product_cover_image_url: data.product_cover_image_url || data.product_cover_image_url_snapshot || null,
    vendor_name: data.vendor_name || data.vendor_name_snapshot || "",
  };
});

export const OrderStatusHistorySchema = z.object({
  id: z.union([z.string(), z.number()]).optional().default("").transform((val) => val ? String(val) : Math.random().toString(36).substring(2)),
  status: OrderStatusSchema.optional(),
  from_status: z.string().nullable().optional(),
  to_status: z.string().nullable().optional(),
  note: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  actor_name: z.string().nullable().optional().default(null),
  created_at: z.string(),
});

export const OrderDeliveryTrackingSchema = z.object({
  id: z.string().uuid(),
  carrier: z.string(),
  tracking_id: z.string(),
  tracking_url: z.string().url().nullable(),
  status: z.string(),
  estimated_delivery: z.string().nullable(),
  updated_at: z.string().datetime({ offset: true }),
});

export const OrderRefundRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string(),
  amount_requested: z.string(),
  status: z.enum(["pending", "approved", "rejected", "processed"]),
  admin_notes: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
});

export const OrderPaymentRecordSchema = z.object({
  sequence_number: z.number().int().min(1),
  payment_source: z.string(),
  provider: z.string(),
  selected_percent: z.number().int().min(0).max(100),
  applied_percent: z.string(),
  amount: z.string(),
  currency: z.string().default("NGN"),
  cumulative_amount_paid: z.string(),
  cumulative_percent_paid: z.string(),
  remaining_amount: z.string(),
  remaining_percent: z.string(),
  is_final_payment: z.boolean(),
  paid_at: z.string().nullable().optional().default(null),
  correlation_id: z.string().optional().default(""),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const OrderCommercialTransitionLogSchema = z.object({
  transition_type: z.string(),
  from_status: z.string().optional().default(""),
  to_status: z.string().optional().default(""),
  delivery_mode: z.string().optional().default(""),
  cash_payment_mode_snapshot: CashPaymentModeSchema.optional().default("disabled"),
  selected_percent: z.number().int().min(0).max(100),
  cumulative_percent_paid: z.string(),
  amount_delta: z.string(),
  balance_after: z.string(),
  actor_role: z.string().optional().default(""),
  occurred_at: z.string().nullable().optional().default(null),
  correlation_id: z.string().optional().default(""),
  note: z.string().optional().default(""),
  metadata: z.record(z.unknown()).optional().default({}),
});

/**
 * Base ZodObject kept separate from .transform() so OrderDetailSchema
 * can call .extend() on it (ZodEffects does not support .extend()).
 */
const OrderListItemBaseSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  order_number: z.string(),
  status: OrderStatusSchema,
  // Backend OrderListSerializer does NOT return payment_status / escrow_status in list view.
  payment_status: PaymentStatusSchema.optional().default("unpaid"),
  escrow_status: EscrowStatusSchema.optional().default("held"),
  // Escrow amount fields — present in list serializer
  amount_paid_total: z.string().optional().default("0.00"),
  percent_paid_total: z.string().optional().default("0.00"),
  amount_outstanding: z.string().optional().default("0.00"),
  is_fully_paid: z.boolean().optional().default(false),
  cash_payment_mode_snapshot: CashPaymentModeSchema.optional().default("disabled"),
  delivery_mode: OrderDeliveryModeSchema.optional().default("platform_courier"),
  item_count: z.number().int().min(0).optional().default(0),
  // Backend sends "total_amount"; subtotal is not in the list serializer
  total_amount: z.string().optional().default("0.00"),
  subtotal: z.string().optional().default("0.00"),
  // final_total is NOT returned by backend list — aliased from total_amount via transform
  final_total: z.string().optional().default("0.00"),
  currency: z.string().optional().default("NGN"),
  // requires_measurement is a Product field, not on Order list serializer
  requires_measurement: z.boolean().optional().default(false),
  // vendor_name is present in OrderListSerializer
  vendor_name: z.string().nullable().optional().default(null),
  paid_at: z.string().nullable().optional().default(null),
  fulfillment_type: z.string().optional().default("delivery"),
  created_at: z.string(),
});

/** Normalize helper: alias total_amount → final_total so UI code can use one field name */
function normalizeFinalTotal<T extends { final_total?: string; total_amount?: string; delivery_address?: any; buyer_name?: string; buyer_phone?: string | null; buyer_address?: any; buyer_email?: string }>(order: T): T & { final_total: string; buyer_name: string; buyer_phone: string | null; buyer_address: any; buyer_email: string } {
  let deliveryAddress = order.delivery_address;
  if (typeof deliveryAddress === "string") {
    try {
      deliveryAddress = JSON.parse(deliveryAddress);
    } catch {
      deliveryAddress = {};
    }
  }
  const buyer_name = order.buyer_name || deliveryAddress?.full_name || deliveryAddress?.buyer_name || "";
  const buyer_phone = order.buyer_phone || deliveryAddress?.phone || deliveryAddress?.buyer_phone || "";
  const buyer_email = order.buyer_email || deliveryAddress?.email || deliveryAddress?.buyer_email || "";
  const buyer_address = order.buyer_address && Object.keys(order.buyer_address).length > 0 ? order.buyer_address : (deliveryAddress || {});

  return {
    ...order,
    buyer_name,
    buyer_phone,
    buyer_email,
    buyer_address,
    final_total:
      order.final_total && order.final_total !== "0.00"
        ? order.final_total
        : order.total_amount ?? "0.00",
  };
}

/** Exported list schema — wraps base with the final_total normalization transform. */
export const OrderListItemSchema = OrderListItemBaseSchema.transform(normalizeFinalTotal);

export const OrderDetailSchema = OrderListItemBaseSchema.extend({
  buyer_name: z.string().optional().default(""),
  buyer_email: z.string().optional().default(""),
  buyer_phone: z.string().nullable().optional().default(null),
  buyer_address: z.record(z.unknown()).optional().default({}),
  delivery_address: z.any().optional(),
  items: z.array(OrderItemSnapshotSchema),
  status_history: z.array(OrderStatusHistorySchema),
  delivery_tracking: OrderDeliveryTrackingSchema.nullable().optional().default(null),
  refund_request: OrderRefundRequestSchema.nullable().optional().default(null),
  notes: z.string().optional().default(""),
  idempotency_key: z.string().optional().default(""),
  paid_at: z.string().nullable().optional().default(null),
  first_paid_at: z.string().nullable().optional().default(null),
  final_paid_at: z.string().nullable().optional().default(null),
  active_payment_path: z.string().optional().default(""),
  delivered_at: z.string().nullable().optional().default(null),
  cancelled_at: z.string().nullable().optional().default(null),
  payment_records: z.array(OrderPaymentRecordSchema).optional().default([]),
  commercial_transition_logs: z
    .array(OrderCommercialTransitionLogSchema)
    .optional()
    .default([]),
  updated_at: z.string(),
}).transform(normalizeFinalTotal);

export const PaginatedOrderListSchema = z.object({
  count: z.number().int().min(0),
  next: z.string().nullable().optional().default(null),
  previous: z.string().nullable().optional().default(null),
  results: z.array(OrderListItemSchema),
});

/** Parse helper — warns on mismatch but always returns data so UI can render. */
export function parseOrderResponse<T>(schema: z.ZodType<T, any, any>, data: unknown, ctx?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = `[Zod/Order] Schema mismatch${ctx ? ` in ${ctx}` : ""}: ${result.error.message}`;
    // Warn rather than throw — prevents a stale DB record from hard-crashing the page.
    console.warn(msg, result.error.flatten(), data);
    return data as T;
  }
  return result.data;
}
