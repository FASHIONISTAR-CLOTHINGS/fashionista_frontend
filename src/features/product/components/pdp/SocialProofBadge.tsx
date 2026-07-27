"use client";

/**
 * @file SocialProofBadge.tsx
 * @description Live viewer count + "sold today" social proof for PDP.
 *
 * Psychological triggers:
 *   - Social Proof: "X people viewing this now"
 *   - FOMO: "Y sold in the last 24 hours"
 *   - Authority: "Trending #3 in {category}"
 *
 * Data flow:
 *   - Polls GET /api/v1/ninja/products/{slug}/social-proof/ every 30s
 *   - Falls back to static product fields (view_count, orders_count) if API unavailable
 *   - Never blocks render — shows nothing while loading
 */

import { useEffect, useState } from "react";
import { Eye, ShoppingBag, TrendingUp } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

interface SocialProofData {
  viewing_now: number;
  sold_today: number;
  added_to_cart_today: number;
  trending_rank: number | null;
}

interface SocialProofBadgeProps {
  slug: string;
  fallbackViewCount?: number;
  fallbackOrdersCount?: number;
  categorySlug?: string | null;
  categoryRank?: number | null;
}

export function SocialProofBadge({
  slug,
  fallbackViewCount,
  fallbackOrdersCount,
  categorySlug,
}: SocialProofBadgeProps) {
  const [data, setData] = useState<SocialProofData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let active = true;

    const fetchSocialProof = async () => {
      try {
        const res = await apiAsync
          .get(`products/${slug}/social-proof/`)
          .json<SocialProofData>();
        if (active && res) setData(res);
      } catch {
        // Silent fail — use fallbacks
      }
    };

    void fetchSocialProof();
    const interval = setInterval(fetchSocialProof, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [slug]);

  if (!mounted) return null;

  const viewingNow = data?.viewing_now ?? (fallbackViewCount ? Math.max(1, Math.floor(fallbackViewCount / 50)) : 0);
  const soldToday = data?.sold_today ?? (fallbackOrdersCount ? Math.max(0, Math.floor(fallbackOrdersCount / 30)) : 0);
  const trendingRank = data?.trending_rank ?? null;

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
