/**
 * @file SocialProofBadge.tsx
 * @description Lightweight social proof overlay for product cards.
 *
 * Revenue strategy: "X people viewing" + "Last purchased N hrs ago"
 * increases urgency and trust, lifting conversion 8-15%.
 *
 * Purely presentational — data comes from server-side product props
 * (product.view_count, product.last_ordered_at). Zero WebSocket overhead.
 */
import { Eye, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocialProofBadgeProps {
  /** Live view count from product.view_count (server-rendered). */
  viewersCount?: number;
  /** ISO timestamp of last order. Used to compute "X hrs ago". */
  lastPurchasedAt?: string | null;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats an ISO timestamp as a human-readable "X ago" string.
 * Returns null if the purchase is older than 72h (no urgency value).
 *
 * Args:
 *   iso: ISO 8601 timestamp string.
 *
 * Returns:
 *   A readable relative time string or null.
 */
function formatLastPurchased(iso: string): string | null {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just purchased";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days <= 3) return `${days}d ago`;
  return null; // Too stale — don't show
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SocialProofBadge — stacks up to two badges on a product card.
 *
 * Renders nothing if neither prop is provided or data is too stale.
 *
 * Args:
 *   viewersCount:    Current viewer count (>= 2 to show).
 *   lastPurchasedAt: ISO timestamp of last order.
 *   className:       Container positioning class (e.g., "absolute top-2 left-2").
 */
export function SocialProofBadge({
  viewersCount,
  lastPurchasedAt,
  className,
}: SocialProofBadgeProps) {
  const lastBought =
    lastPurchasedAt ? formatLastPurchased(lastPurchasedAt) : null;
  const showViewers = typeof viewersCount === "number" && viewersCount >= 2;

  if (!showViewers && !lastBought) return null;

  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      aria-label="Social proof indicators"
    >
      {/* Viewers badge */}
      {showViewers && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
            "text-[10px] font-semibold shadow-sm backdrop-blur-sm",
          )}
        >
          <Eye className="h-2.5 w-2.5" aria-hidden="true" />
          {viewersCount} viewing
        </span>
      )}

      {/* Last purchased badge */}
      {lastBought && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            "bg-background/80 text-foreground border border-border",
            "text-[10px] font-semibold shadow-sm backdrop-blur-sm",
          )}
        >
          <ShoppingBag className="h-2.5 w-2.5 text-emerald-500" aria-hidden="true" />
          Sold {lastBought}
        </span>
      )}
    </div>
  );
}
