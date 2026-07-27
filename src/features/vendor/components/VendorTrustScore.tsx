"use client";

/**
 * @file VendorTrustScore.tsx
 * @description Trust score badge and breakdown for vendor storefronts.
 *
 * Psychological triggers:
 *   - Authority: Data-driven trust score positions vendor as credible
 *   - Social Proof: Sales count, rating, verification status
 *   - Trust: Transparent scoring builds platform confidence
 */

import { Shield, Star, TrendingUp, Award } from "lucide-react";

interface VendorTrustScoreProps {
  isVerified: boolean;
  avgRating: number;
  reviewCount: number;
  totalSales: number;
  totalProducts: number;
}

function computeTrustScore(rating: number, reviews: number, sales: number, verified: boolean, products: number): number {
  let score = 50;
  if (rating > 0) score += (rating / 5) * 25;
  if (reviews > 10) score += Math.min(10, reviews / 10);
  if (sales > 50) score += Math.min(10, sales / 50);
  if (verified) score += 5;
  if (products > 20) score += 5;
  return Math.min(100, Math.round(score));
}

function getTrustTier(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-[#01454A]", bg: "bg-[#01454A]" };
  if (score >= 55) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-500" };
  return { label: "New", color: "text-muted-foreground", bg: "bg-muted-foreground" };
}

export function VendorTrustScore({
  isVerified,
  avgRating,
  reviewCount,
  totalSales,
  totalProducts,
}: VendorTrustScoreProps) {
  const score = computeTrustScore(avgRating, reviewCount, totalSales, isVerified, totalProducts);
  const tier = getTrustTier(score);

  const metrics = [
    { icon: Star, label: "Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—" },
    { icon: TrendingUp, label: "Sales", value: totalSales > 0 ? totalSales.toLocaleString() : "—" },
    { icon: Award, label: "Reviews", value: reviewCount > 0 ? reviewCount.toLocaleString() : "—" },
    { icon: Shield, label: "Verified", value: isVerified ? "Yes" : "No" },
  ];

  return (
    <div
      className="rounded-2xl border border-[#01454A]/10 bg-white p-5 shadow-sm"
      data-testid="vendor-trust-score"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#01454A]" />
          <h3 className="text-sm font-bold text-foreground">Trust Score</h3>
        </div>
        <span className={`text-xs font-bold ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${tier.bg} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <Icon size={14} className="text-[#01454A]/60" />
            <span className="text-xs font-semibold text-foreground">{value}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
