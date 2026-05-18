/**
 * @file use-cart-badge.ts
 * @description Reactive cart item count hook for the navbar badge.
 *
 * Architecture (2027 upgrade):
 *  Previously used `getQueryData` (passive, cache-only). This returned 0 on
 *  cold start until the cart drawer was opened first — causing a broken badge.
 *
 *  Now uses `useQuery` with `staleTime: Infinity` to:
 *   1. Reactively subscribe to the TanStack Query cache — badge updates
 *      instantly when any mutation (addCartItem, removeCartItem) settles.
 *   2. Initiate a background fetch on cold start so the badge populates
 *      on every page load, not only after opening the cart drawer.
 *   3. Share the same cache entry as `useCart()` — zero duplicate fetches.
 *
 * Pattern: background-fetch + cache subscriber
 *   • cartKeys.detail() is the single shared cache key for the full cart.
 *   • `staleTime: 30s` allows safe re-use across route navigations.
 *   • `refetchOnWindowFocus: false` prevents badge flicker on tab switch.
 *
 * @example
 *   function NavBar() {
 *     const count = useCartBadge();
 *     return <CartIcon count={count} />;
 *   }
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { cartKeys } from "./use-cart";
import { fetchCart } from "../api/cart.api";
import type { Cart } from "../types/cart.types";

/**
 * Reactively returns the current cart item count.
 *
 * - Returns 0 on cold start (hydration-safe, no layout flash).
 * - Populates from the server within the first render cycle.
 * - Stays in sync with all cart mutations via shared cache key.
 */
export function useCartBadge(): number {
  const { data } = useQuery<Cart>({
    queryKey: cartKeys.detail(),
    queryFn: fetchCart,
    staleTime: 30 * 1000,          // 30s — reuse across page navigations
    gcTime: 5 * 60 * 1000,         // 5m — keep cart warm in memory
    refetchOnWindowFocus: false,   // prevent flicker on tab switch
    refetchOnMount: true,          // always verify on mount for fresh badge
  });

  return data?.item_count ?? 0;
}
