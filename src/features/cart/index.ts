/**
 * @file index.ts
 * @description Public API for the `features/cart` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)   → /v1/cart/ (item add/update/remove, coupon, checkout submit)
 *  - Ninja (async) → /ninja/cart/ (read cart — high-concurrency, anonymous + auth)
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  Cart,
  CartItem,
  CartProductRef,
  CheckoutSession,
  CheckoutQuote,
  AppliedCoupon,
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  PrepareCheckoutInput,
  SubmitCheckoutInput,
  SubmitCheckoutResponse,
} from "./types/cart.types";

// ── Schemas ────────────────────────────────────────────────────────────────
export {
  CartSchema,
  CartItemSchema,
  CheckoutSessionSchema,
  CheckoutQuoteSchema,
} from "./schemas/cart.schemas";

// ── API ────────────────────────────────────────────────────────────────────
export {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  mergeAnonymousCommerce,
  prepareCheckout,
  submitCheckout,
} from "./api/cart.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  cartKeys,
  useCart,
  useAddCartItem,
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyCoupon,
  useRemoveCoupon,
  usePrepareCheckout,
  useSubmitCheckout,
} from "./hooks/use-cart";

// ── Zustand Stores ─────────────────────────────────────────────────────────
export { useCartStore } from "./store/cart.store";

// ── Components ─────────────────────────────────────────────────────────────
export { default as CartPage } from "./components/CartPage";
export { CartPageSkeleton } from "./components/CartPageSkeleton";
