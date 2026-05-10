/**
 * @file cart.api.ts
 * @description Cart domain API client — Fashionistar frontend.
 *
 * Cart reads use `apiAsync` (Ky → Ninja) for high-concurrency user state.
 * Cart writes use `apiSync` (Axios → DRF) for strict transaction boundaries.
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";
import {
  anonymousSessionHeaders,
  anonymousSessionPayload,
  getFashionistarSessionKey,
  peekFashionistarSessionKey,
} from "../lib/anonymous-session";
import {
  parseCartResponse,
  CartSchema,
  CheckoutSessionSchema,
  SubmitCheckoutResponseSchema,
} from "../schemas/cart.schemas";
import type {
  Cart,
  CheckoutSession,
  SubmitCheckoutResponse,
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  PrepareCheckoutInput,
  SubmitCheckoutInput,
} from "../types/cart.types";

const BASE = "/cart";

function guestOptions() {
  if (readAccessToken()) return {};
  return {
    headers: anonymousSessionHeaders(),
  };
}

function guestPayload() {
  return readAccessToken() ? {} : anonymousSessionPayload();
}

async function mergeEndpoint(path: string, sessionKey: string): Promise<void> {
  await apiSync.post(
    path,
    { session_key: sessionKey },
    { headers: { "X-Fashionistar-Session-Key": sessionKey } },
  );
}

/**
 * Merge anonymous cart and wishlist rows into the newly authenticated account.
 *
 * This is intentionally safe to call after login and again before checkout:
 * backend services lock rows and deduplicate existing user-owned items.
 */
export async function mergeAnonymousCommerce(): Promise<void> {
  const sessionKey = peekFashionistarSessionKey();
  if (!sessionKey || !readAccessToken()) return;

  const results = await Promise.allSettled([
    mergeEndpoint(`${BASE}/merge/`, sessionKey),
    mergeEndpoint("/products/wishlist/merge/", sessionKey),
  ]);

  const failed = results.find((result) => result.status === "rejected");
  if (failed) {
    throw new Error("Anonymous commerce merge failed.");
  }
}

// ── CART ─────────────────────────────────────────────────────────────────────

/** Fetch or create the current user's cart. */
export async function fetchCart(): Promise<Cart> {
  const sessionKey = readAccessToken() ? undefined : getFashionistarSessionKey();
  const data = await apiAsync
    .get("cart/", {
      ...guestOptions(),
      searchParams: sessionKey ? { session_key: sessionKey } : undefined,
    })
    .json();
  return parseCartResponse(CartSchema, unwrapApiData(data), "fetchCart");
}

/** Add a product/variant to the cart. */
export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const { data } = await apiSync.post<unknown>(`${BASE}/add/`, {
    product_slug: input.product_slug ?? input.product_id,
    variant_id: input.variant_id,
    quantity: input.quantity,
    ...guestPayload(),
  });
  return parseCartResponse(CartSchema, data, "addCartItem");
}

/** Update quantity of a cart item. */
export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput,
): Promise<Cart> {
  const { data } = await apiSync.patch<unknown>(
    `${BASE}/items/${itemId}/quantity/`,
    { ...input, ...guestPayload() },
    guestOptions(),
  );
  return parseCartResponse(CartSchema, data, "updateCartItem");
}

/** Remove a cart item. */
export async function removeCartItem(itemId: string): Promise<void> {
  await apiSync.delete(`${BASE}/items/${itemId}/`, {
    ...guestOptions(),
    params: guestPayload(),
  });
}

// ── COUPON ───────────────────────────────────────────────────────────────────

/** Apply a coupon code to the cart. Returns updated cart. */
export async function applyCoupon(input: ApplyCouponInput): Promise<Cart> {
  const { data } = await apiSync.post<unknown>(
    `${BASE}/coupon/`,
    { ...input, ...guestPayload() },
    guestOptions(),
  );
  return parseCartResponse(CartSchema, data, "applyCoupon");
}

/** Remove the currently applied coupon. Returns updated cart. */
export async function removeCoupon(): Promise<Cart> {
  const { data } = await apiSync.delete<unknown>(`${BASE}/coupon/`, {
    ...guestOptions(),
    params: guestPayload(),
  });
  return parseCartResponse(CartSchema, data, "removeCoupon");
}

// ── CHECKOUT ──────────────────────────────────────────────────────────────────

/**
 * Prepare a checkout session — validates cart, builds quote, checks measurement gate.
 * Returns a `CheckoutSession` with status `prepared` and a full `CheckoutQuote`.
 */
export async function prepareCheckout(
  input: PrepareCheckoutInput,
): Promise<CheckoutSession> {
  const { data } = await apiSync.post<unknown>(`${BASE}/checkout/prepare/`, input);
  return parseCartResponse(CheckoutSessionSchema, data, "prepareCheckout");
}

/**
 * Submit checkout — atomic order creation behind idempotency key.
 * On network retry, the same key returns the existing order without duplication.
 *
 * @param input.idempotency_key - UUID generated client-side before submission
 */
export async function submitCheckout(
  input: SubmitCheckoutInput,
): Promise<SubmitCheckoutResponse> {
  await mergeAnonymousCommerce();

  const { data } = await apiSync.post<unknown>(
    `${BASE}/checkout/submit/`,
    input,
    {
      // Explicit idempotency key header (apiSync also auto-injects but we
      // want the client-generated session key, not a random one per retry)
      headers: { "X-Idempotency-Key": input.idempotency_key },
    },
  );
  return parseCartResponse(
    SubmitCheckoutResponseSchema,
    data,
    "submitCheckout",
  );
}
