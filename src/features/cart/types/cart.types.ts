/**
 * @file cart.types.ts
 * @description Canonical TypeScript types for the Fashionistar Cart domain.
 * Source of truth: `apps/cart/serializers/cart_serializers.py`
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutSessionStatus =
  | "draft"
  | "prepared"
  | "submitted"
  | "expired";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT REFERENCE (lightweight — in cart context)
// ─────────────────────────────────────────────────────────────────────────────

export interface CartProductRef {
  id: string;
  slug: string;
  title: string;
  sku: string;
  cover_image_url: string | null;
  requires_measurement: boolean;
  vendor_name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CART ITEM
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  product: CartProductRef;
  variant_id: string | null;
  size_label: string | null;
  color_label: string | null;
  quantity: number;
  unit_price: string;               // Snapshot at add-to-cart
  line_total: string;
  currency: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLIED COUPON
// ─────────────────────────────────────────────────────────────────────────────

export interface AppliedCoupon {
  code: string;
  coupon_type: string;
  discount_amount: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────────────────

export interface Cart {
  id: string | null;
  items: CartItem[];
  item_count: number;
  subtotal: string;
  currency: string;
  expires_at: string | null;
  applied_coupon?: AppliedCoupon | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT QUOTE
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckoutQuote {
  subtotal: string;
  shipping_cost: string;
  measurement_fee: string;          // ₦1,000 if any item requires_measurement
  discount_amount: string;
  tax_amount: string;
  final_total: string;
  currency: string;
  applied_coupon: AppliedCoupon | null;
  measurement_required: boolean;    // checkout gate flag
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT SESSION
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  id: string;
  status: CheckoutSessionStatus;
  quote: CheckoutQuote | null;
  shipping_address: Record<string, unknown> | null;
  idempotency_key: string;
  expires_at: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM INPUTS
// ─────────────────────────────────────────────────────────────────────────────

export interface AddCartItemInput {
  product_id: string;
  product_slug?: string;
  variant_id?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface ApplyCouponInput {
  code: string;
}

export interface PrepareCheckoutInput {
  shipping_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code?: string;
  };
}

export interface SubmitCheckoutInput {
  idempotency_key: string;
  payment_method?: string;
}

export interface SubmitCheckoutResponse {
  order_id: string;
  order_number: string;
  payment_url: string | null;       // Paystack payment page URL
  message: string;
}
