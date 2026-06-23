/**
 * @file use-cart-badge.ts
 * @description Reactive cart item count hook for the navbar badge.
 */
"use client";

import { useCartStore } from "../store/cart.store";

/**
 * Reactively returns the current cart item count.
 */
export function useCartBadge(): number {
  const items = useCartStore((s) => s.items);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
