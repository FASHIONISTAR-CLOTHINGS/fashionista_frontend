/**
 * @file WishlistNudge.tsx
 * @description Persistent sticky bottom bar: re-engages users who have saved wishlist items.
 *
 * Revenue strategy: Wishlist savers convert 3-4× higher when nudged within 24h.
 * - Desktop: slim gold bar at bottom of viewport
 * - Mobile: bottom sheet card (rounded-t-2xl)
 * - Dismissable per 24h (localStorage guard via useWishlistNudge)
 * - Animated slide-up entrance, slide-down on dismiss
 */
"use client";

import { useState, useCallback } from "react";
import { ShoppingBag, X, Heart } from "lucide-react";
import Link from "next/link";
import { useWishlistNudge, dismissWishlistNudge } from "../hooks/use-wishlist-nudge";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WishlistNudgeProps {
  /** Live wishlist item count from Zustand / server state. */
  wishlistCount: number;
  /** Route to navigate to wishlist (default: /wishlist). */
  wishlistHref?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WishlistNudge — sticky re-engagement bar.
 *
 * Renders nothing until the nudge condition is met (60s delay, items in wishlist,
 * not nudged in last 24h). Animates in from the bottom and supports dismissal.
 *
 * Args:
 *   wishlistCount: Current number of items in the user's wishlist.
 *   wishlistHref:  The URL to link to (default /wishlist).
 *   className:     Optional extra className override.
 */
export function WishlistNudge({
  wishlistCount,
  wishlistHref = "/wishlist",
  className,
}: WishlistNudgeProps) {
  const shouldShow = useWishlistNudge(wishlistCount);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dismissWishlistNudge();
  }, []);

  if (!shouldShow || dismissed) return null;

  const itemLabel = wishlistCount === 1 ? "item" : "items";

  return (
    <div
      role="complementary"
      aria-label="Wishlist re-engagement"
      className={cn(
        // Base — fixed bottom bar, above any floating buttons (z-40)
        "fixed bottom-0 left-0 right-0 z-40",
        // Desktop: horizontal slim bar
        "md:flex md:items-center md:justify-between md:px-6 md:py-3 md:gap-4",
        // Mobile: bottom sheet appearance
        "flex flex-col items-center gap-3 px-4 py-4 md:rounded-none rounded-t-2xl",
        // Brand styling
        "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
        "shadow-[0_-4px_24px_rgba(0,0,0,0.18)]",
        // Entrance animation
        "animate-in slide-in-from-bottom duration-300",
        className,
      )}
    >
      {/* Left — icon + message */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">
            You have {wishlistCount} saved {itemLabel} — don&apos;t lose them!
          </p>
          <p className="text-xs opacity-80 hidden md:block">
            Complete your purchase before they sell out.
          </p>
        </div>
      </div>

      {/* Right — CTA + dismiss */}
      <div className="flex items-center gap-2">
        <Link
          href={wishlistHref}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-white",
            "px-5 py-2 text-sm font-semibold",
            "text-[hsl(var(--accent))] hover:bg-white/90 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          )}
          aria-label={`View your ${wishlistCount} saved ${itemLabel}`}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          View Wishlist
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss wishlist reminder"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-white/20 hover:bg-white/30 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
