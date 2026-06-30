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
  | "awaiting_cash_confirmation"
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
/** Includes legacy PAYMENT_STATUS tuple values from pre-migration orders. */
export type PaymentStatus =
  | "unpaid" | "paid" | "failed" | "refunded"
  | "pending" | "processing" | "cancelled" | "initiated" | "expired" | "refunding";
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";
export type CashPaymentMode = "disabled" | "cod" | "pay_at_shop" | "both";
export type OrderPaymentPath = "wallet" | "gateway" | "cod" | "pay_at_shop";
export type OrderDeliveryMode = "platform_courier" | "vendor_shop_pickup" | "cod";

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

export interface OrderPaymentRecord {
  sequence_number: number;
  payment_source: string;
  provider: string;
  selected_percent: number;
  applied_percent: string;
  amount: string;
  currency: string;
  cumulative_amount_paid: string;
  cumulative_percent_paid: string;
  remaining_amount: string;
  remaining_percent: string;
  is_final_payment: boolean;
  paid_at: string | null;
  correlation_id: string;
  metadata: Record<string, unknown>;
}

export interface OrderCommercialTransitionLog {
  transition_type: string;
  from_status: string;
  to_status: string;
  delivery_mode: string;
  cash_payment_mode_snapshot: CashPaymentMode;
  selected_percent: number;
  cumulative_percent_paid: string;
  amount_delta: string;
  balance_after: string;
  actor_role: string;
  occurred_at: string | null;
  correlation_id: string;
  note: string;
  metadata: Record<string, unknown>;
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
  order_number: string;              // Human-readable e.g. "FSN-ORD-019E3984-ACC"
  status: OrderStatus;
  /** Derived from is_fully_paid — not returned by list serializer directly */
  payment_status?: PaymentStatus;
  /** Not returned by list serializer — default "held" */
  escrow_status?: EscrowStatus;
  amount_paid_total: string;
  percent_paid_total: string;
  amount_outstanding: string;
  is_fully_paid: boolean;
  cash_payment_mode_snapshot: CashPaymentMode;
  delivery_mode: OrderDeliveryMode;
  item_count: number;
  /** Backend list serializer field — canonical order total */
  total_amount: string;
  /** Not returned by list serializer — optional, defaults to "0.00" */
  subtotal?: string;
  /** Normalized from total_amount — used by UI components */
  final_total: string;
  currency: string;
  /** Product field — not on order list serializer */
  requires_measurement?: boolean;
  /** Returned by OrderListSerializer */
  vendor_name?: string | null;
  paid_at?: string | null;
  fulfillment_type?: string;
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
  /** Legacy / alternative delivery address field sent by some serializer variants */
  delivery_address?: string | Record<string, unknown> | null;
  items: OrderItemSnapshot[];
  status_history: OrderStatusHistory[];
  delivery_tracking: OrderDeliveryTracking | null;
  refund_request: OrderRefundRequest | null;
  notes: string;
  idempotency_key: string;
  paid_at: string | null;
  first_paid_at: string | null;
  final_paid_at: string | null;
  active_payment_path: string;
  delivered_at: string | null;
  cancelled_at: string | null;
  payment_records: OrderPaymentRecord[];
  commercial_transition_logs: OrderCommercialTransitionLog[];
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

/** Gateway / provider identifiers accepted by the payment mutation. */
export type PaymentProvider =
  | "wallet"
  | "paystack"
  | "flutterwave"
  | "olive_pay"
  | "cod"
  | "pay_at_shop";

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
