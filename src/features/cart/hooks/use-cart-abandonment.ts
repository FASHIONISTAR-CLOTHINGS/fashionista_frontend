/**
 * @file use-cart-abandonment.ts
 * @description Hook: triggers a recovery toast after 3 min of cart inactivity.
 *
 * Revenue strategy: Abandoned-cart recovery reduces abandonment by 15-25%.
 * - Fires once per session (sessionStorage guard)
 * - Resets timer on any cart interaction
 * - Non-intrusive: integrates with platform useToast
 */
"use client";

import { useEffect, useRef } from "react";

const INACTIVITY_MS = 3 * 60 * 1000; // 3 minutes
const SESSION_GUARD_KEY = "fashionistar_cart_nudge_fired";

interface UseCartAbandonmentOptions {
  /** Cart item count — resets inactivity timer when it changes. */
  cartItemCount: number;
  /** Callback to fire the toast. Use platform useToast inside a parent component. */
  onFire: () => void;
}

/**
 * Monitors cart inactivity and calls `onFire` after 3 minutes.
 *
 * Usage:
 *   const { toast } = useToast();
 *   useCartAbandonment({
 *     cartItemCount,
 *     onFire: () => toast({ title: "Still deciding? Your cart is waiting 🛍️", ... })
 *   });
 */
export function useCartAbandonment({
  cartItemCount,
  onFire,
}: UseCartAbandonmentOptions): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only monitor if cart has items
    if (cartItemCount === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // One-fire-per-session guard
    try {
      if (sessionStorage.getItem(SESSION_GUARD_KEY)) return;
    } catch {
      // noop — sessionStorage unavailable
    }

    // Clear existing timer and restart on cart changes
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        if (sessionStorage.getItem(SESSION_GUARD_KEY)) return;
        sessionStorage.setItem(SESSION_GUARD_KEY, "1");
      } catch {
        // noop
      }
      onFire();
    }, INACTIVITY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cartItemCount, onFire]);
}
