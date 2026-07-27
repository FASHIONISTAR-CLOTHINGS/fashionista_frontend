"use client";

/**
 * @file WishlistPriceAlertBadge.tsx
 * @description Price drop alert badge for wishlist items.
 *
 * Psychological triggers:
 *   - Loss Aversion: "Price dropped!" creates urgency to buy now
 *   - Reciprocity: Platform proactively notifies user of savings
 *   - Commitment: User already wishlist-ed item, now motivated to purchase
 */

import { TrendingDown, Bell } from "lucide-react";

interface WishlistPriceAlertBadgeProps {
  currentPrice: number;
  oldPrice: number | null;
  addedAtPrice?: number | null;
}

export function WishlistPriceAlertBadge({
  currentPrice,
  oldPrice,
  addedAtPrice,
}: WishlistPriceAlertBadgeProps) {
  const originalPrice = addedAtPrice ?? oldPrice;
  if (!originalPrice || originalPrice <= currentPrice) return null;

  const dropAmount = originalPrice - currentPrice;
  const dropPct = Math.round((dropAmount / originalPrice) * 100);

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
      data-testid="wishlist-price-alert"
    >
      <TrendingDown size={11} />
      Price dropped {dropPct}%
      <Bell size={9} className="opacity-70" />
    </div>
  );
}
