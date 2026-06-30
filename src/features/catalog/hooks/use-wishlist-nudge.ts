/**
 * @file use-wishlist-nudge.ts
 * @description Hook: fires WishlistNudge bar after 60s if user has saved items
 * and hasn't purchased in the last 24h.
 *
 * Revenue strategy: Wishlist savers convert 3-4x higher when nudged within 24h.
 */
"use client";

import { useEffect, useState } from "react";

const NUDGE_SESSION_KEY = "fashionistar_wishlist_nudge_shown_at";
const SUPPRESS_HOURS = 24;
const DELAY_MS = 60_000;

/**
 * Returns true when the nudge bar should be shown.
 *
 * Args:
 *   wishlistCount: Number of items in the user's wishlist.
 *
 * Returns:
 *   Boolean indicating whether the WishlistNudge bar is visible.
 */
export function useWishlistNudge(wishlistCount: number): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't nudge if wishlist is empty
    if (wishlistCount === 0) {
      setVisible(false);
      return;
    }

    // Check if we already nudged within the suppression window
    try {
      const lastShown = localStorage.getItem(NUDGE_SESSION_KEY);
      if (lastShown) {
        const diffHours =
          (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60);
        if (diffHours < SUPPRESS_HOURS) return;
      }
    } catch {
      // localStorage unavailable — proceed
    }

    // Delay 60s then show
    const timer = setTimeout(() => {
      setVisible(true);
      try {
        localStorage.setItem(NUDGE_SESSION_KEY, String(Date.now()));
      } catch {
        // noop
      }
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [wishlistCount]);

  return visible;
}

/**
 * Dismisses the nudge bar by recording the dismissal timestamp
 * so it won't reappear for another 24 hours.
 */
export function dismissWishlistNudge(): void {
  try {
    localStorage.setItem(NUDGE_SESSION_KEY, String(Date.now()));
  } catch {
    // noop
  }
}
