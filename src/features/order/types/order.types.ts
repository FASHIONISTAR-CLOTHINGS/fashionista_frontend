/**
 * @file order.types.ts
 * @description Canonical TypeScript types for the Fashionistar Order domain.
 * Source of truth: `apps/order/serializers/order_serializers.py`
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded"
  | "disputed";

export type EscrowStatus = "held" | "released" | "refunded" | "disputed";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";

// ─────────────────────────────────────────────────────────────────────────────
// IMMUTABLE SNAPSHOTS
// ─────────────────────────────────────────────────────────────────────────────

/** Immutable snapshot of a line item at the time of purchase. */
export interface OrderItemSnapshot {
  id: string;
  product_id: string;                // Snapshot — product may be deleted
  product_title: string;             // Snapshot
  product_sku: string;               // Snapshot
  product_cover_image_url: string | null;
  vendor_id: string;                 // Snapshot
  vendor_name: string;               // Snapshot
  variant_id: string | null;
  size_label: string | null;
  color_label: string | null;
  quantity: number;
  unit_price: string;                // Decimal string — snapshot at purchase
  line_total: string;                // Decimal string
  commission_rate: string;           // Decimal % snapshot
  currency_code: string;
  requires_measurement: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderStatusHistory {
  id: string;
  status?: OrderStatus;
  from_status?: string | null;
  to_status?: string | null;
  note?: string;
  notes: string;
  actor_name: string | null;         // SET_NULL on user delete
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderDeliveryTracking {
  id: string;
  carrier: string;
  tracking_id: string;
  tracking_url: string | null;
  status: string;
  estimated_delivery: string | null;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFUND REQUEST
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderRefundRequest {
  id: string;
  reason: string;
  amount_requested: string;
  status: RefundStatus;
  admin_notes: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER LIST ITEM (lightweight)
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderListItem {
  id: string;                        // UUID
  order_number: string;              // Human-readable e.g. "ORD-20260428-00012"
  status: OrderStatus;
  payment_status: PaymentStatus;
  escrow_status: EscrowStatus;
  item_count: number;
  subtotal: string;
  final_total: string;
  currency: string;
  requires_measurement: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER DETAIL (full)
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderDetail extends OrderListItem {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_address: Record<string, unknown>;
  items: OrderItemSnapshot[];
  status_history: OrderStatusHistory[];
  delivery_tracking: OrderDeliveryTracking | null;
  refund_request: OrderRefundRequest | null;
  notes: string;
  idempotency_key: string;
  paid_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED ENVELOPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedOrderList {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderListItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM INPUTS
// ─────────────────────────────────────────────────────────────────────────────

export interface CancelOrderInput {
  reason: string;
}

export interface VendorProductionStatusInput {
  status: "payment_confirmed" | "processing" | "shipped";
  notes?: string;
}

export interface AdminDeliveryStatusInput {
  status: OrderStatus;
  tracking_id?: string;
  carrier?: string;
  notes?: string;
}
