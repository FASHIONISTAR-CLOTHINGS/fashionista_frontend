/**
 * @file use-cart.ts
 * @description TanStack Query v5 hooks for the Cart domain.
 *
 * Checkout flow:
 *  1. `useCart()` → displays items
 *  2. `useAddCartItem()` / `useUpdateCartItem()` → optimistic updates
 *  3. `usePrepareCheckout()` → builds quote, validates measurement gate
 *  4. `useSubmitCheckout()` → atomic order creation with idempotency key
 *     On success → navigate to `/orders/<order_id>/confirmation`
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  prepareCheckout,
  submitCheckout,
} from "../api/cart.api";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  PrepareCheckoutInput,
} from "../types/cart.types";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────────────────────

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  checkout: () => [...cartKeys.all, "checkout"] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CART READ
// ─────────────────────────────────────────────────────────────────────────────

/** Hook: get current cart with items. */
export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: fetchCart,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CART MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: add item to cart. */
export function useAddCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => addCartItem(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
      toast.success("Item added to cart!");
    },
    onError: () => {
      toast.error("Could not add item. Please try again.");
    },
  });
}

/** Mutation: update item quantity with optimistic update. */
export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      input,
    }: {
      itemId: string;
      input: UpdateCartItemInput;
    }) => updateCartItem(itemId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
    },
    onError: () => {
      toast.error("Could not update quantity.");
    },
  });
}

/** Mutation: remove item from cart. */
export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.detail() });
      toast.success("Item removed from cart.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: apply coupon code. */
export function useApplyCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyCouponInput) => applyCoupon(input),
    onSuccess: (cart) => {
      void qc.setQueryData(cartKeys.detail(), cart);
      toast.success("Coupon applied!");
    },
    onError: () => {
      toast.error("Invalid or expired coupon code.");
    },
  });
}

/** Mutation: remove applied coupon. */
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
 * Client generates the idempotency key ONCE before calling.
 * Network retries with the same key will not create duplicate orders.
 *
 * @example
 *   const idempotencyKey = useRef(uuidv4()); // stable per session
 *   const { mutate: submit } = useSubmitCheckout();
 *   submit({ idempotency_key: idempotencyKey.current });
 */
export function useSubmitCheckout(
  onSuccess?: (orderId: string, paymentUrl: string | null) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey?: string) =>
      submitCheckout({ idempotency_key: idempotencyKey ?? uuidv4() }),
    onSuccess: (res) => {
      // Clear cart and checkout from cache after order creation
      void qc.invalidateQueries({ queryKey: cartKeys.all });
      toast.success(`Order ${res.order_number} placed successfully!`);
      onSuccess?.(res.order_id, res.payment_url);
    },
    onError: () => {
      toast.error("Order submission failed. Your cart is unchanged — please retry.");
    },
  });
}
