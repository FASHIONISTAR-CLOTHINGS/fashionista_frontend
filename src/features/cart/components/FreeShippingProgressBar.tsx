"use client";

/**
 * @file FreeShippingProgressBar.tsx
 * @description Animated free shipping progress bar for cart.
 *
 * Psychological triggers:
 *   - Goal Gradient Effect: Visual progress toward free shipping threshold
 *   - Anchoring: Shows remaining amount needed
 *   - Reciprocity: "You've unlocked FREE shipping!" celebration
 */

import { Truck, Check } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

interface FreeShippingProgressBarProps {
  subtotal: number;
  currency: string;
  threshold?: number;
}

export function FreeShippingProgressBar({
  subtotal,
  currency,
  threshold = 50_000,
}: FreeShippingProgressBarProps) {
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  const unlocked = remaining === 0;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        unlocked
          ? "border-emerald-200 bg-emerald-50"
          : "border-[#01454A]/15 bg-[#01454A]/5"
      }`}
      data-testid="cart-free-shipping-progress"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
          unlocked ? "text-emerald-600" : "text-[#01454A]"
        }`}>
          {unlocked ? (
            <><Check size={14} /> You&apos;ve unlocked FREE shipping!</>
          ) : (
            <><Truck size={14} /> Add {formatCurrency(remaining, currency)} more for FREE shipping</>
          )}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            unlocked
              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : "bg-gradient-to-r from-[#01454A] to-[#0a6b72]"
          }`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      {unlocked && (
        <p className="mt-1.5 text-[10px] text-emerald-600 font-semibold animate-pulse-subtle">
          🎉 Free shipping applied automatically at checkout
        </p>
      )}
    </div>
  );
}
