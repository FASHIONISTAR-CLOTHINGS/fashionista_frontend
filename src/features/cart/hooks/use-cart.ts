/**
 * @file use-cart.ts
 * @description TanStack Query v5 hooks for the Cart domain — 2027 Edition.
 *
 * Architecture:
 *  - All mutations apply INSTANT optimistic updates before the server round-trip.
 *  - On network failure the cache is rolled back to the pre-mutation snapshot.
 *  - Quantity updates are debounced (500ms) to batch rapid stepper interactions.
 *  - Cart prefetch fires on user intent (hover over cart icon) via `usePrefetchCart`.
 *  - `gcTime: 10_min` keeps cart data warm in memory even after component unmount.
 *  - `placeholderData: keepPreviousData` prevents empty-cart flashes during refetch.
 *
 * Optimistic accuracy (2027 improvements):
 *  - useRemoveCartItem: recomputes item_count and subtotal in cache.
 *  - useUpdateCartItem: recomputes line_total per item and subtotal in cache.
 *  - useAddCartItem:    carries product title/slug through for meaningful display.
 *
 * New hooks:
 *  - useClearCart      — empties the entire cart with optimistic clear.
 *  - useMergeCart      — wraps mergeAnonymousCommerce with pending/error states.
 *
 * Checkout flow:
 *  1. `useCart()` → displays items
 *  2. `useAddCartItem()` / `useUpdateCartItem()` → optimistic updates
 *  3. `usePrepareCheckout()` → builds quote, validates measurement gate
 *  4. `useSubmitCheckout()` → atomic order creation with idempotency key
 *     On success → navigate to `/orders/<order_id>/confirmation`
 */
"use client";

import { useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} from "../api/cart.api";
import { mergeAnonymousCommerce } from "../api/cart.api";
import type {
  Cart,
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  PrepareCheckoutInput,
} from "../types/cart.types";
import { prepareCheckout, submitCheckout } from "../api/cart.api";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS (factory pattern — avoids typos, enables surgical invalidation)
// ─────────────────────────────────────────────────────────────────────────────

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  checkout: () => [...cartKeys.all, "checkout"] as const,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(n) ? 0 : n;
}

function recomputeCartTotals(cart: Cart): Cart {
  const activeItems = cart.items;
  const item_count = activeItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = activeItems
    .reduce((sum, i) => sum + toNumber(i.unit_price) * i.quantity, 0)
    .toFixed(2);
  return { ...cart, item_count, subtotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// CART READ
// staleTime:  30s — data is "fresh" for 30 seconds, preventing waterfall calls
//             while the user is actively browsing.
// gcTime:    10m — keeps cart warm in memory even when CartDrawer unmounts,
//             so reopening is instant with no network round-trip.
// placeholderData: keepPreviousData — prevents the drawer from flashing empty
//             while a background revalidation is in-flight.
// ─────────────────────────────────────────────────────────────────────────────

/** Hook: get current cart with items. */
export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: fetchCart,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Prefetch the cart on user intent (hover over cart icon, focus on add-to-cart
 * button). Provides zero-latency experience when the user finally opens the
 * drawer. Wire this to `onMouseEnter` / `onFocus` on your cart trigger.
 */
export function usePrefetchCart() {
  const qc = useQueryClient();
  return useCallback(() => {
    void qc.prefetchQuery({
      queryKey: cartKeys.detail(),
      queryFn: fetchCart,
      staleTime: 30_000,
    });
  }, [qc]);
}

// ─────────────────────────────────────────────────────────────────────────────
// CART MUTATIONS
// All mutations follow the TanStack Query v5 optimistic pattern:
//   1. onMutate  → cancel inflight fetches + snapshot + write optimistic cache
//   2. onError   → rollback to snapshot
//   3. onSettled → always revalidate from server (eventual consistency)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optimistic add-to-cart.
 * The item appears in the drawer INSTANTLY. If the server rejects (e.g. out of
 * stock), the drawer reverts and shows a toast with the server's reason.
 */
export function useAddCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => addCartItem(input),

    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = qc.getQueryData<Cart>(cartKeys.detail());

      qc.setQueryData<Cart>(cartKeys.detail(), (old) => {
        if (!old) return old;

        const existing = old.items.find(
          (i) =>
            i.product.id === (input.product_id ?? input.product_slug) &&
            i.variant_id === input.variant_id,
        );

        let nextItems;
        if (existing) {
          nextItems = old.items.map((i) =>
            i === existing
              ? {
                  ...i,
                  quantity: i.quantity + (input.quantity ?? 1),
                  line_total: String(
                    toNumber(i.unit_price) * (i.quantity + (input.quantity ?? 1)),
                  ),
                }
              : i,
          );
        } else {
          // Append a placeholder — onSettled will replace with real server data
          nextItems = [
            ...old.items,
            {
              id: `optimistic-${Date.now()}`,
              product: {
                id: input.product_id ?? input.product_slug ?? "",
                slug: input.product_slug ?? "",
                title: input.product_slug ?? "New item",
                sku: "",
                cover_image_url: null,
                requires_measurement: false,
                vendor_name: "",
              },
              variant_id: input.variant_id ?? null,
              size_label: null,
              color_label: null,
              quantity: input.quantity ?? 1,
              unit_price: "0",
              line_total: "0",
              currency: "NGN",
            },
          ];
        }

        return recomputeCartTotals({ ...old, items: nextItems });
      });

      return { previousCart };
    },

    onError: (_err, _input, ctx) => {
      if (ctx?.previousCart !== undefined) {
        qc.setQueryData(cartKeys.detail(), ctx.previousCart);
      }
      toast.error("Could not add item — please try again.");
    },

    onSuccess: () => {
      toast.success("Added to cart! 🛍️");
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * Optimistic remove-from-cart.
 * The item disappears INSTANTLY. item_count and subtotal recomputed in cache.
 * Reappears if the server rejects.
 */
export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),

    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = qc.getQueryData<Cart>(cartKeys.detail());

      qc.setQueryData<Cart>(cartKeys.detail(), (old) => {
        if (!old) return old;
        const nextItems = old.items.filter((i) => i.id !== itemId);
        return recomputeCartTotals({ ...old, items: nextItems });
      });

      return { previousCart };
    },

    onError: (_err, _itemId, ctx) => {
      if (ctx?.previousCart !== undefined) {
        qc.setQueryData(cartKeys.detail(), ctx.previousCart);
      }
      toast.error("Could not remove item.");
    },

    onSuccess: () => {
      toast.success("Item removed.");
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * Debounced optimistic quantity update.
 *
 * Why debounced? When a user clicks the stepper 5× in a row we want the UI
 * to feel instant (optimistic) but we should only send ONE API request after
 * they pause — not 5 separate PATCH calls. The 500ms debounce is invisible
 * to the user but saves ~80% of the server calls for quantity changes.
 *
 * line_total and subtotal are recomputed in cache so the price panel stays
 * accurate during the debounce window.
 *
 * Usage:
 *   const { mutateDebounced } = useUpdateCartItem();
 *   mutateDebounced({ itemId, input: { quantity: 3 } });
 */
export function useUpdateCartItem() {
  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      itemId,
      input,
    }: {
      itemId: string;
      input: UpdateCartItemInput;
    }) => updateCartItem(itemId, input),

    onMutate: async ({ itemId, input }) => {
      await qc.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = qc.getQueryData<Cart>(cartKeys.detail());

      qc.setQueryData<Cart>(cartKeys.detail(), (old) => {
        if (!old) return old;
        const nextItems = old.items.map((i) => {
          if (i.id !== itemId) return i;
          const newQty = input.quantity;
          const lineTotal = (toNumber(i.unit_price) * newQty).toFixed(2);
          return { ...i, quantity: newQty, line_total: lineTotal };
        });
        return recomputeCartTotals({ ...old, items: nextItems });
      });

      return { previousCart };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousCart !== undefined) {
        qc.setQueryData(cartKeys.detail(), ctx.previousCart);
      }
      toast.error("Could not update quantity.");
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });

  /** Debounced version — call this instead of `mutation.mutate` for steppers. */
  const mutateDebounced = useCallback(
    (vars: { itemId: string; input: UpdateCartItemInput }) => {
      // Apply optimistic update instantly on every call
      qc.setQueryData<Cart>(cartKeys.detail(), (old) => {
        if (!old) return old;
        const nextItems = old.items.map((i) => {
          if (i.id !== vars.itemId) return i;
          const lineTotal = (toNumber(i.unit_price) * vars.input.quantity).toFixed(2);
          return { ...i, quantity: vars.input.quantity, line_total: lineTotal };
        });
        return recomputeCartTotals({ ...old, items: nextItems });
      });

      // But only fire the API after a 500ms pause
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        mutation.mutate(vars);
      }, 500);
    },
    [qc, mutation],
  );

  return { ...mutation, mutateDebounced };
}

/**
 * Optimistic clear-cart.
 * Instantly empties the drawer. Rolls back if the server rejects.
 */
export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearCart,

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = qc.getQueryData<Cart>(cartKeys.detail());

      qc.setQueryData<Cart>(cartKeys.detail(), (old) =>
        old
          ? { ...old, items: [], item_count: 0, subtotal: "0.00" }
          : old,
      );

      return { previousCart };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousCart !== undefined) {
        qc.setQueryData(cartKeys.detail(), ctx.previousCart);
      }
      toast.error("Could not clear cart.");
    },

    onSuccess: () => {
      toast.success("Cart cleared.");
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * Merge anonymous (guest) cart into the authenticated user cart.
 *
 * Call this once inside the auth login success handler. The mutation
 * gives the caller proper `isPending` / `isError` states so the UI
 * can show a spinner or error banner during the merge.
 */
export function useMergeCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mergeAnonymousCommerce,
    onSuccess: () => {
      // Invalidate so the newly merged server cart is fetched immediately
      void qc.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: () => {
      toast.error("Could not sync your guest cart — items may be lost.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED STATE — Cart membership
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` if the product is currently in the cart.
 *
 * Derives its answer from the existing cart query cache — zero extra
 * network calls. The `select` option means this hook only re-renders
 * a subscriber when THIS product's membership changes, not on every
 * unrelated cart mutation.
 *
 * @param productId - The product UUID or slug to check.
 *
 * @example
 *   const inCart = useIsInCart(product.id);
 *   // → true after user clicks "Add to Cart"
 */
export function useIsInCart(productId: string): boolean {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: fetchCart,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1_000,
    select: (cart) =>
      cart.items.some(
        (item) =>
          item.product.id === productId ||
          item.product.slug === productId,
      ),
  }).data ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: apply coupon code. Writes server response directly into cache. */
export function useApplyCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyCouponInput) => applyCoupon(input),
    onSuccess: (cart) => {
      void qc.setQueryData(cartKeys.detail(), cart);
      toast.success("Coupon applied! 🎉");
    },
    onError: () => {
      toast.error("Invalid or expired coupon code.");
    },
  });
}

/** Mutation: remove applied coupon. Writes server response directly into cache. */
export function useRemoveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeCoupon,
    onSuccess: (cart) => {
      void qc.setQueryData(cartKeys.detail(), cart);
      toast.success("Coupon removed.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: prepare checkout session + build quote. */
export function usePrepareCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PrepareCheckoutInput) => prepareCheckout(input),
    onSuccess: (session) => {
      void qc.setQueryData(cartKeys.checkout(), session);
    },
    onError: () => {
      toast.error("Could not prepare checkout. Please review your cart.");
    },
  });
}

/**
 * Mutation: submit checkout atomically.
 *
 * The idempotency key is generated ONCE per checkout session (via `useRef`)
 * and passed on every retry. The backend deduplicates on this key, so network
 * retries never create duplicate orders.
 *
 * @example
 *   const idempotencyKey = useRef(uuidv4()); // stable for this checkout session
 *   const { mutate: submit } = useSubmitCheckout(onSuccess);
 *   submit(idempotencyKey.current);
 */
export function useSubmitCheckout(
  onSuccess?: (orderId: string, paymentUrl: string | null) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey?: string) =>
      submitCheckout({ idempotency_key: idempotencyKey ?? uuidv4() }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: cartKeys.all });
      toast.success(`Order ${res.order_number} placed! 🎊`);
      onSuccess?.(res.order_id, res.payment_url);
    },
    onError: () => {
      toast.error(
        "Order submission failed. Your cart is unchanged — please retry.",
      );
    },
  });
}
