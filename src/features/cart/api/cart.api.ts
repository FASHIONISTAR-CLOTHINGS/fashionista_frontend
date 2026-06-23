/**
 * @file cart.api.ts
 * @description Cart domain API client — Pure Client-Side Checkout and Coupon Validation.
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";
import {
  clearFashionistarSessionKey,
  peekFashionistarSessionKey,
  sessionKeyExists,
} from "../lib/anonymous-session";
import { parseCartResponse, SubmitCheckoutResponseSchema } from "../schemas/cart.schemas";
import type { AppliedCoupon, SubmitCheckoutInput, SubmitCheckoutResponse } from "../types/cart.types";

async function mergeEndpoint(path: string, sessionKey: string): Promise<void> {
  await apiSync.post(
    path,
    { session_key: sessionKey },
    { headers: { "X-Fashionistar-Session-Key": sessionKey } },
  );
}

/**
 * Merge anonymous wishlist items post-login.
 */
export async function mergeAnonymousCommerce(): Promise<void> {
  const sessionKey = peekFashionistarSessionKey();
  if (!sessionKeyExists() || !sessionKey || !readAccessToken()) return;

  // ── Role Gate ──────────────────────────────────────────────────────────────
  // Lazy import to avoid circular deps: auth store → cart → auth store
  // At this point in the auth flow, useAuthStore is guaranteed to be hydrated
  // because setUser() has already been called by the login/OTP success handler.
  const { useAuthStore } = await import("@/features/auth/store/auth.store");
  const user = useAuthStore.getState().user;
  const userRole = user?.role ?? "";

  // Canonical "non-client" roles that must NOT access commerce features.
  // Matches the server-side RBAC policy in apps/cart/views.py CartMergeView.
  const NON_CLIENT_ROLES = new Set([
    "admin", "super_admin",
    "vendor", "super_vendor",
    "staff", "super_staff",
    "support", "super_support",
    "editor", "super_editor",
    "assistant", "super_assistant",
    "moderator", "super_moderator",
    "sales",
  ]);

  const isNonClientRole =
    user?.is_staff === true ||
    NON_CLIENT_ROLES.has(userRole.toLowerCase());

  if (isNonClientRole) {
    // Purge guest session storage immediately — no API call, no merge.
    // This discards any items the user may have added while browsing
    // anonymously, preventing them from appearing in admin/vendor sessions.
    clearFashionistarSessionKey();
    return;
  }

  // Merge client anonymous wishlist to database
  await mergeEndpoint("v1/products/wishlist/merge/", sessionKey);
  clearFashionistarSessionKey();
}

/**
 * Validate coupon code server-side against the subtotal.
 */
export async function validateCoupon(code: string, subtotal: string): Promise<AppliedCoupon> {
  const data = await apiAsync
    .post("products/coupons/validate/", {
      json: {
        code,
        order_subtotal: parseFloat(subtotal),
      },
    })
    .json<{
      coupon_id: string;
      code: string;
      discount_type: string;
      discount_amount: number | string;
    }>();

  return {
    code: data.code,
    coupon_type: data.discount_type,
    discount_amount: String(data.discount_amount),
  };
}

/**
 * Submit checkout — atomic order creation behind idempotency key.
 */
export async function submitCheckout(
  input: SubmitCheckoutInput & {
    items: Array<{
      product_id: string;
      variant_id: string | null;
      quantity: number;
    }>;
    coupon_code?: string | null;
  },
): Promise<SubmitCheckoutResponse> {
  await mergeAnonymousCommerce();

  const { data } = await apiSync.post<unknown>(
    `v1/orders/place/`,
    {
      delivery_address: input.delivery_address,
      fulfillment_type: input.fulfillment_type ?? "delivery",
      measurement_profile_id: input.measurement_profile_id ?? null,
      notes: input.notes ?? "",
      items: input.items,
      coupon_code: input.coupon_code ?? null,
    },
    {
      // Explicit idempotency key header (apiSync also auto-injects but we
      // want the client-generated session key, not a random one per retry)
      headers: { "X-Idempotency-Key": input.idempotency_key },
      _suppressGlobalToast: true,
    } as never,
  );
  const order = unwrapApiData<{
    id: string;
    order_number: string;
  }>(data);

  return parseCartResponse(
    SubmitCheckoutResponseSchema,
    {
      order_id: order.id,
      order_number: order.order_number,
      payment_url: null,
      message: "Order placed successfully.",
    },
    "submitCheckout",
  );
}
