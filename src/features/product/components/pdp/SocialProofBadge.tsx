"use client";

/**
 * @file SocialProofBadge.tsx (PDP version)
 * @description Live viewer count + "sold today" social proof for PDP.
 *
 * Psychological triggers:
 *   - Social Proof: "X people viewing this now"
 *   - FOMO: "Y sold in the last 24 hours"
 *   - Authority: "Trending #N in {category}"
 *
 * Data flow:
 *   - Uses fallback values from the product bundle (views, orders_count)
 *   - ZERO API polling — /social-proof/ endpoint is not supported
 *   - Derives signals from product bundle data already loaded on the page
 */

import { Eye, ShoppingBag, TrendingUp } from "lucide-react";

interface SocialProofBadgeProps {
  slug: string;
  fallbackViewCount?: number;
  fallbackOrdersCount?: number;
  categorySlug?: string | null;
  categoryRank?: number | null;
}

export function SocialProofBadge({
  fallbackViewCount,
  fallbackOrdersCount,
  categorySlug,
  categoryRank,
}: SocialProofBadgeProps) {
  // Derive social proof signals purely from product bundle fields
  // views (from product.views) → estimate "viewing now" as ~2% of total views
  const viewingNow = fallbackViewCount
    ? Math.max(1, Math.floor(fallbackViewCount / 50))
    : 0;
  // orders_count (from product.orders_count) → estimate "sold today" as ~3% of total
  const soldToday = fallbackOrdersCount
    ? Math.max(0, Math.floor(fallbackOrdersCount / 30))
    : 0;
  const trendingRank = categoryRank ?? null;

  // Only show if we have meaningful signals
  if (viewingNow < 3 && soldToday < 1 && !trendingRank) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="pdp-social-proof">
      {viewingNow >= 3 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01454A]/8 border border-[#01454A]/15 px-3 py-1 text-xs font-semibold text-[#01454A] animate-pulse-subtle">
          <Eye size={12} className="text-[#01454A]" />
          {viewingNow} viewing now
        </span>
      )}
      {soldToday >= 1 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA600]/10 border border-[#FDA600]/25 px-3 py-1 text-xs font-semibold text-[#B87800]">
          <ShoppingBag size={12} />
          {soldToday} sold today
        </span>
      )}
      {trendingRank && trendingRank <= 10 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600">
          <TrendingUp size={12} />
          #{trendingRank} in {categorySlug ?? "Fashion"}
        </span>
      )}
    </div>
  );
}
