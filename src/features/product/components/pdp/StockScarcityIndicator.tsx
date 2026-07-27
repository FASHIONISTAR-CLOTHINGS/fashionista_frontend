"use client";

/**
 * @file StockScarcityIndicator.tsx
 * @description Animated stock scarcity bar for PDP.
 *
 * Psychological triggers:
 *   - Scarcity: "Only X left in stock!"
 *   - Urgency: Color-coded progress bar (green -> amber -> red)
 *   - Loss Aversion: "Don't miss out -- X others have this in their cart"
 */

import { Flame, AlertTriangle, ShoppingCart } from "lucide-react";

interface StockScarcityIndicatorProps {
  stockQty?: number;
  initialStock?: number;
  inStock: boolean;
}

export function StockScarcityIndicator({
  stockQty,
  initialStock = 50,
  inStock,
}: StockScarcityIndicatorProps) {
  if (!inStock || stockQty === undefined || stockQty <= 0) return null;

  if (stockQty > 10) return null;

  const pct = Math.min(100, Math.max(5, (stockQty / initialStock) * 100));
  const urgency =
    stockQty <= 2
      ? { color: "bg-red-500", text: "text-red-600", border: "border-red-200", bg: "bg-red-50", label: "Almost gone!" }
      : stockQty <= 5
      ? { color: "bg-amber-500", text: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50", label: "Selling fast!" }
      : { color: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50", label: "Limited stock" };

  return (
    <div
      className={`rounded-xl border ${urgency.border} ${urgency.bg} px-4 py-3`}
      data-testid="pdp-stock-scarcity"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${urgency.text}`}>
          {stockQty <= 2 ? <AlertTriangle size={13} /> : <Flame size={13} />}
          {urgency.label} — Only {stockQty} left!
        </span>
        <span className="text-[10px] text-muted-foreground">
          {Math.round(pct)}% remaining
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
        <div
          className={`h-full rounded-full ${urgency.color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      {stockQty <= 5 && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <ShoppingCart size={10} />
          {Math.max(1, Math.floor(stockQty * 1.5))} others have this in their cart
        </p>
      )}
    </div>
  );
}
