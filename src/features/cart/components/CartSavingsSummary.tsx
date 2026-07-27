"use client";

/**
 * @file CartSavingsSummary.tsx
 * @description Displays total savings from discounts on cart items.
 *
 * Psychological triggers:
 *   - Loss Aversion: "You're saving X" reinforces value
 *   - Reciprocity: Smart shopper badge rewards purchase decision
 *   - Anchoring: Shows original vs discounted price
 */

import { TrendingDown, Award } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

interface CartSavingsSummaryProps {
  items: Array<{
    unit_price: string;
    quantity: number;
    line_total: string;
  }>;
  currency: string;
}

export function CartSavingsSummary({ items, currency }: CartSavingsSummaryProps) {
  let totalSavings = 0;
  let subtotal = 0;

  for (const item of items) {
    const unitPrice = parseFloat(item.unit_price);
    const lineTotal = parseFloat(item.line_total);
    const expectedTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    if (expectedTotal > lineTotal) {
      totalSavings += expectedTotal - lineTotal;
    }
  }

  if (totalSavings <= 0) return null;

  const savingsPct = subtotal > 0 ? (totalSavings / (subtotal + totalSavings)) * 100 : 0;
  const isSmartShopper = savingsPct > 10;

  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
      data-testid="cart-savings-summary"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
          <TrendingDown size={15} />
          You&apos;re saving {formatCurrency(totalSavings, currency)}!
        </span>
        {isSmartShopper && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            <Award size={10} />
            Smart Shopper
          </span>
        )}
      </div>
      <p className="mt-1 text-[10px] text-emerald-600/80">
        Original price: {formatCurrency(subtotal + totalSavings, currency)} → You pay: {formatCurrency(subtotal, currency)}
      </p>
    </div>
  );
}
