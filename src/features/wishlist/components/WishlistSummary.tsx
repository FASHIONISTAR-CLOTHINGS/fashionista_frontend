"use client";

/**
 * @file WishlistSummary.tsx
 * @description Analytics summary for wishlist — total value, savings, low-stock alerts.
 *
 * Psychological triggers:
 *   - Loss Aversion: "3 items running low — buy now!"
 *   - Endowment Effect: "Your wishlist is worth ₦234,500"
 *   - Reciprocity: Shows savings from price drops
 */

import { Wallet, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

interface WishlistSummaryProps {
  items: Array<{
    price: number;
    oldPrice: number | null;
    inStock: boolean;
  }>;
  currency?: string;
}

export function WishlistSummary({ items, currency = "NGN" }: WishlistSummaryProps) {
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = items.reduce(
    (sum, item) =>
      item.oldPrice && item.oldPrice > item.price
        ? sum + (item.oldPrice - item.price)
        : sum,
    0,
  );
  const lowStockCount = items.filter((i) => !i.inStock).length;

  if (items.length === 0) return null;

  const stats = [
    {
      icon: Wallet,
      label: "Total wishlist value",
      value: formatCurrency(totalValue, currency),
      color: "text-[hsl(var(--foreground))]",
    },
    ...(totalSavings > 0
      ? [{
          icon: TrendingDown,
          label: "Total savings from price drops",
          value: formatCurrency(totalSavings, currency),
          color: "text-emerald-600",
        }]
      : []),
    ...(lowStockCount > 0
      ? [{
          icon: AlertTriangle,
          label: "Items running low on stock",
          value: `${lowStockCount} item${lowStockCount !== 1 ? "s" : ""}`,
          color: "text-amber-600",
        }]
      : []),
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4 shadow-[var(--card-shadow)]"
      data-testid="wishlist-summary"
    >
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-2.5">
          <Icon size={16} className={color} />
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${color}`}>{value}</span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
