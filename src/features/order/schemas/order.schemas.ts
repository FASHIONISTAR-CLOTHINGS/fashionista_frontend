/**
 * @file order.schemas.ts
 * @description Zod validation schemas for the Order domain.
 */
import { z } from "zod";

const OrderStatusSchema = z.enum([
  "pending_payment",
  "payment_confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refund_requested",
  "refunded",
  "disputed",
]);
const EscrowStatusSchema = z.enum(["held", "released", "refunded", "disputed"]);
const PaymentStatusSchema = z.enum(["unpaid", "paid", "failed", "refunded"]);

export const OrderItemSnapshotSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  product_id: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "")),
  product_title: z.string(),
  product_sku: z.string().optional().default(""),
  product_cover_image_url: z.string().nullable().optional().default(null),
  vendor_id: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "")),
  vendor_name: z.string().optional().default(""),
  variant_id: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value === null || value === undefined ? null : String(value)),
  size_label: z.string().nullable().optional().default(null),
  color_label: z.string().nullable().optional().default(null),
  quantity: z.number().int().min(1),
  unit_price: z.string(),
  line_total: z.string(),
  commission_rate: z.string().optional().default("0.00"),
  currency_code: z.string().optional().default("NGN"),
  requires_measurement: z.boolean().optional().default(false),
});

export const OrderStatusHistorySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
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

export const OrderListItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  order_number: z.string(),
  status: OrderStatusSchema,
  payment_status: PaymentStatusSchema,
  escrow_status: EscrowStatusSchema,
  item_count: z.number().int().min(0),
  subtotal: z.string(),
  final_total: z.string(),
  currency: z.string(),
  requires_measurement: z.boolean(),
  created_at: z.string(),
});

export const OrderDetailSchema = OrderListItemSchema.extend({
  buyer_name: z.string().optional().default(""),
  buyer_email: z.string().optional().default(""),
  buyer_phone: z.string().nullable().optional().default(null),
  buyer_address: z.record(z.unknown()).optional().default({}),
  items: z.array(OrderItemSnapshotSchema),
  status_history: z.array(OrderStatusHistorySchema),
  delivery_tracking: OrderDeliveryTrackingSchema.nullable().optional().default(null),
  refund_request: OrderRefundRequestSchema.nullable().optional().default(null),
  notes: z.string().optional().default(""),
  idempotency_key: z.string().optional().default(""),
  paid_at: z.string().nullable().optional().default(null),
  delivered_at: z.string().nullable().optional().default(null),
  cancelled_at: z.string().nullable().optional().default(null),
  updated_at: z.string(),
});

export const PaginatedOrderListSchema = z.object({
  count: z.number().int().min(0),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(OrderListItemSchema),
});

/** Parse helper. */
export function parseOrderResponse<T>(schema: z.ZodType<T>, data: unknown, ctx?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = `[Zod/Order] Schema mismatch${ctx ? ` in ${ctx}` : ""}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(msg, result.error.flatten(), data);
      throw new Error(msg);
    }
    console.error(msg);
    return data as T;
  }
  return result.data;
}
