"use client";

/**
 * @file PricingBadges.tsx
 * @description Reusable badge system for product cards and detail views.
 *
 * Psychological triggers:
 *   - Scarcity: "Low Stock", "Flash Sale"
 *   - Social Proof: "Trending", "Just Sold"
 *   - Loss Aversion: "Price Drop"
 *
 * Usage:
 *   <PricingBadges product={product} />
 *   <PricingBadges product={product} variant="compact" />
 */

import { Flame, Zap, TrendingUp, Package, ArrowDown } from "lucide-react";

interface PricingBadgesProduct {
  discount_percentage?: number;
  stock_qty?: number;
  ai_trend_score?: number;
  featured?: boolean;
  hot_deal?: boolean;
  price_dropped?: boolean;
  just_sold?: boolean;
}

interface PricingBadgesProps {
  product: PricingBadgesProduct;
  variant?: "default" | "compact";
  className?: string;
}

interface BadgeConfig {
  label: string;
  icon: typeof Flame;
  bg: string;
  text: string;
  show: boolean;
  priority: number;
}

export function PricingBadges({
  product,
  variant = "default",
  className = "",
}: PricingBadgesProps) {
  const badges: BadgeConfig[] = [
    {
      label: "Flash Sale",
      icon: Zap,
      bg: "bg-[#FDA600]",
      text: "text-black",
      show: !!product.hot_deal || (product.discount_percentage ?? 0) >= 20,
      priority: 1,
    },
    {
      label: "Low Stock",
      icon: Flame,
      bg: "bg-red-500",
      text: "text-white",
      show: (product.stock_qty ?? 99) > 0 && (product.stock_qty ?? 99) <= 5,
      priority: 2,
    },
    {
      label: "Trending",
      icon: TrendingUp,
      bg: "bg-[#01454A]",
      text: "text-white",
      show: (product.ai_trend_score ?? 0) > 0.7,
      priority: 3,
    },
    {
      label: "Just Sold",
      icon: Package,
      bg: "bg-green-600",
      text: "text-white",
      show: !!product.just_sold,
      priority: 4,
    },
    {
      label: "Price Drop",
      icon: ArrowDown,
      bg: "bg-blue-600",
      text: "text-white",
      show: !!product.price_dropped,
      priority: 5,
    },
  ];

  const visible = badges
    .filter((b) => b.show)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, variant === "compact" ? 2 : 3);

  if (visible.length === 0) return null;

  const sizeCls =
    variant === "compact"
      ? "px-1.5 py-0.5 text-[9px] gap-0.5"
      : "px-2 py-1 text-[10px] gap-1";

  return (
    <div
      className={`flex flex-wrap gap-1 ${className}`}
      data-testid="pricing-badges"
    >
      {visible.map((badge) => {
        const Icon = badge.icon;
        return (
          <span
            key={badge.label}
            className={`inline-flex items-center rounded-full font-bold ${badge.bg} ${badge.text} ${sizeCls}`}
          >
            <Icon size={variant === "compact" ? 8 : 10} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
