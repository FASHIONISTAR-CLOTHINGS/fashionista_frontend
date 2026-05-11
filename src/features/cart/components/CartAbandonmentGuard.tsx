/**
 * @file CartAbandonmentGuard.tsx
 * @description Client component that wraps cart page to fire abandonment recovery toast.
 *
 * Usage — place once inside the cart page layout:
 *   <CartAbandonmentGuard cartItemCount={items.length} />
 *
 * The toast is fired once per session after 3 min of cart inactivity.
 */
"use client";

import { useCallback } from "react";
import { useCartAbandonment } from "../hooks/use-cart-abandonment";
import { useToast } from "@/shared/hooks/use-toast";

export interface CartAbandonmentGuardProps {
  cartItemCount: number;
}

/**
 * Invisible component — renders no visible UI.
 * Mounts the abandonment detection hook and fires toast when triggered.
 *
 * Args:
 *   cartItemCount: Live count of cart items from cart state.
 */
export function CartAbandonmentGuard({ cartItemCount }: CartAbandonmentGuardProps) {
  const { info } = useToast();

  const handleFire = useCallback(() => {
    info("Still deciding? Your cart is waiting 🛍️", {
      description: "Complete your order before items sell out. Head to your cart now.",
      duration: 8000,
    });
  }, [info]);

  useCartAbandonment({ cartItemCount, onFire: handleFire });

  return null;
}
