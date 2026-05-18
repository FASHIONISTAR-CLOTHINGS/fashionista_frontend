/**
 * @file cart.api.ts
 * @description Cart domain API client — Fashionistar frontend (2027 Edition).
 *
 * Architecture:
 *  - Cart READS  → `apiAsync` (Ky → Django-Ninja async router). High-concurrency,
 *    non-blocking, prefetch-friendly. Ninja returns the same CartOut schema.
 *  - Cart WRITES → `apiSync`  (Axios → DRF sync router). Strict transaction
 *    boundaries, atomic, idempotency-key echoed in response headers.
 *
 * Changes (2027 modernization):
 *  • fetchCart now hits /v1/async/cart/ (Ninja) instead of DRF /v1/cart/current/.
 *  • All write responses pass through unwrapApiData() for consistency.
 *  • addCartItem / updateCartItem forward X-Idempotency-Key header.
 *  • removeCartItem returns the updated Cart (backend already returns it).
 *  • mergeAnonymousCommerce uses sessionKeyExists() to skip unnecessary
 *    network calls and calls clearFashionistarSessionKey() after success.
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
  sessionKeyExists,
  clearFashionistarSessionKey,
} from "../lib/anonymous-session";
import { z } from "zod";
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
import { v4 as uuidv4 } from "uuid";

// Helper: cast schema to ZodType<T> to satisfy parseCartResponse<T> generic.
// ZodEffects<ZodObject<...>> is a valid ZodType at runtime; the cast is safe.
const cartSchema = CartSchema as z.ZodType<Cart>;

// Ky uses prefixUrl (http://host/api/v1/ninja). Paths must be relative (no leading slash).
// Wrong: `v1/async/cart` → resolves to http://host/v1/async/cart (strips ninja prefix)
// Right: `cart`          → resolves to http://host/api/v1/ninja/cart/
const BASE_SYNC = "v1/cart";
const BASE_NINJA_CART = "cart";

// ── Session helpers ───────────────────────────────────────────────────────────

function guestPayload() {
  return readAccessToken() ? {} : anonymousSessionPayload();
}

/**
 * Build per-request write headers.
 * Injects both the anonymous session key (if present) and a unique
 * idempotency key (caller-supplied or auto-generated per request).
 */
function writeHeaders(idempotencyKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Idempotency-Key": idempotencyKey ?? uuidv4(),
  };
  if (!readAccessToken()) {
    Object.assign(headers, anonymousSessionHeaders());
  }
  return headers;
}

async function mergeEndpoint(path: string, sessionKey: string): Promise<void> {
  await apiSync.post(
    path,
    { session_key: sessionKey },
    { headers: { "X-Fashionistar-Session-Key": sessionKey } },
  );
}

// ── MERGE ─────────────────────────────────────────────────────────────────────

/**
 * Merge anonymous cart and wishlist rows into the newly authenticated account.
 *
 * Guard: exits early when no anonymous session key exists to avoid a wasted
 * network round-trip on users who signed up fresh without browsing first.
 *
 * Post-merge: clears the anonymous session key so the same guest key cannot
 * accumulate items across multiple authenticated sessions.
 */
export async function mergeAnonymousCommerce(): Promise<void> {
  const sessionKey = peekFashionistarSessionKey();
  if (!sessionKeyExists() || !sessionKey || !readAccessToken()) return;

  const results = await Promise.allSettled([
    mergeEndpoint(`${BASE_SYNC}/merge/`, sessionKey),
    mergeEndpoint("v1/products/wishlist/merge/", sessionKey),
  ]);

  const failed = results.find((result) => result.status === "rejected");
  if (failed) {
    throw new Error("Anonymous commerce merge failed.");
  }

  // Clear the anonymous key post-merge — prevents key reuse across sessions.
  clearFashionistarSessionKey();
}

// ── CART READS ────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's cart via the high-concurrency Ninja async endpoint.
 *
 * Previously hit DRF /v1/cart/current/ (sync). Now routes through
 * /v1/async/cart/ (Ninja) for non-blocking, prefetch-friendly reads.
 */
export async function fetchCart(): Promise<Cart> {
  const sessionKey = readAccessToken() ? undefined : getFashionistarSessionKey();

  const params = new URLSearchParams();
  if (sessionKey) params.set("session_key", sessionKey);

  const searchStr = params.toString();
  // Ky relative path: prefixUrl is http://host/api/v1/ninja, so "cart" → http://host/api/v1/ninja/cart/
  const url = searchStr ? `${BASE_NINJA_CART}?${searchStr}` : `${BASE_NINJA_CART}`;

  const guestHdrs = sessionKey ? { "X-Fashionistar-Session-Key": sessionKey } : {};
  const authHeader = readAccessToken()
    ? { Authorization: `Bearer ${readAccessToken()}` }
    : {};

  const data = await apiAsync
    .get(url, { headers: { ...guestHdrs, ...authHeader } })
    .json<unknown>();

  return parseCartResponse(cartSchema, data, "fetchCart");
}

// ── CART WRITES ───────────────────────────────────────────────────────────────
// apiSync base: http://host/api (Axios baseURL)
// BASE_SYNC = "v1/cart" → Axios resolves to http://host/api/v1/cart
// All paths below are relative to Axios baseURL (no leading slash).

/** Add a product/variant to the cart. Returns the updated cart. */
export async function addCartItem(
  input: AddCartItemInput & { idempotencyKey?: string },
): Promise<Cart> {
  const { idempotencyKey, ...rest } = input;
  const { data } = await apiSync.post<unknown>(`${BASE_SYNC}/add/`, {
    product_slug: rest.product_slug ?? rest.product_id,
    variant_id: rest.variant_id ?? null,
    quantity: rest.quantity ?? 1,
    ...guestPayload(),
  }, {
    headers: writeHeaders(idempotencyKey),
  });
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "addCartItem");
}

/** Update quantity of a cart item. Returns the updated cart. */
export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput & { idempotencyKey?: string },
): Promise<Cart> {
  const { idempotencyKey, ...rest } = input;
  const { data } = await apiSync.patch<unknown>(
    `${BASE_SYNC}/items/${itemId}/quantity/`,
    { ...rest, ...guestPayload() },
    { headers: writeHeaders(idempotencyKey) },
  );
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "updateCartItem");
}

/** Remove a cart item. Returns the updated cart. */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiSync.delete<unknown>(
    `${BASE_SYNC}/items/${itemId}/`,
    {
      headers: writeHeaders(),
      params: guestPayload(),
    },
  );
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "removeCartItem");
}

// ── COUPON ────────────────────────────────────────────────────────────────────

/** Apply a coupon code to the cart. Returns updated cart. */
export async function applyCoupon(input: ApplyCouponInput): Promise<Cart> {
  const { data } = await apiSync.post<unknown>(
    `${BASE_SYNC}/coupon/`,
    { ...input, ...guestPayload() },
    { headers: writeHeaders() },
  );
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "applyCoupon");
}

/** Remove the currently applied coupon. Returns updated cart. */
export async function removeCoupon(): Promise<Cart> {
  const { data } = await apiSync.delete<unknown>(`${BASE_SYNC}/coupon/`, {
    headers: writeHeaders(),
    params: guestPayload(),
  });
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "removeCoupon");
}

/** Clear all items from the cart. Returns the empty cart. */
export async function clearCart(): Promise<Cart> {
  const { data } = await apiSync.delete<unknown>(`${BASE_SYNC}/clear/`, {
    headers: writeHeaders(),
    params: guestPayload(),
  });
  return parseCartResponse(cartSchema, unwrapApiData(data) as unknown, "clearCart");
}

// ── CHECKOUT ──────────────────────────────────────────────────────────────────

/**
 * Prepare a checkout session — validates cart, builds quote, checks measurement gate.
 * Returns a `CheckoutSession` with status `prepared` and a full `CheckoutQuote`.
 */
export async function prepareCheckout(
  input: PrepareCheckoutInput,
): Promise<CheckoutSession> {
  const { data } = await apiSync.post<unknown>(
    `${BASE_SYNC}/checkout/prepare/`,
    input,
  );
  return parseCartResponse(CheckoutSessionSchema, unwrapApiData(data), "prepareCheckout");
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
    `${BASE_SYNC}/checkout/submit/`,
    input,
    {
      headers: { "X-Idempotency-Key": input.idempotency_key },
    },
  );
  return parseCartResponse(
    SubmitCheckoutResponseSchema,
    unwrapApiData(data),
    "submitCheckout",
  );
}
