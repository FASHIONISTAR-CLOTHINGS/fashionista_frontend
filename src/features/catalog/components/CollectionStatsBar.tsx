"use client";

/**
 * @file CollectionStatsBar.tsx
 * @description Stats dashboard showing key collection metrics.
 *
 * Psychological triggers:
 *   - Social Proof: "500+ products", "50+ vendors"
 *   - Authority: Verified metrics
 *   - Trust: Transparent numbers
 */

import { Package, Store, Star, Users } from "lucide-react";

interface CollectionStatsBarProps {
  productCount: number;
  vendorCount?: number;
  avgRating?: number;
  totalReviews?: number;
}

export function CollectionStatsBar({
  productCount,
  vendorCount = 0,
  avgRating = 0,
  totalReviews = 0,
}: CollectionStatsBarProps) {
  const stats = [
    {
      icon: Package,
      label: "Products",
      value: productCount.toLocaleString(),
      color: "text-[#01454A]",
    },
    {
      icon: Store,
      label: "Vendors",
      value: vendorCount > 0 ? vendorCount.toLocaleString() : "—",
      color: "text-[#FDA600]",
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: avgRating > 0 ? avgRating.toFixed(1) : "—",
      color: "text-amber-500",
    },
    {
      icon: Users,
      label: "Reviews",
      value: totalReviews > 0 ? totalReviews.toLocaleString() : "—",
      color: "text-blue-500",
    },
  ];

  return (
    <section
      className="border-b border-border/50 bg-white"
      data-testid="collection-stats-bar"
    >
      <div className="px-5 py-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-border/40 bg-card/50 p-4 text-center"
            >
              <stat.icon size={20} className={stat.color} />
              <span className="font-bon_foyage text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
