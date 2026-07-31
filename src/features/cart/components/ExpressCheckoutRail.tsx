"use client";

/**
 * @file ExpressCheckoutRail.tsx
 * @description One-click express checkout buttons at the top of checkout.
 *
 * Psychological triggers:
 *   - Friction Reduction: Skip form, one-click payment
 *   - Commitment Consistency: Fast path to conversion
 */

import { useState } from "react";
import { CreditCard, Wallet, Zap } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatCurrency } from "@/lib/formatting";

interface ExpressCheckoutRailProps {
  cartTotal: number;
  currency: string;
  onExpressCheckout: (method: "paystack" | "wallet") => void;
}

export function ExpressCheckoutRail({
  cartTotal,
  currency,
  onExpressCheckout,
}: ExpressCheckoutRailProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: cart } = useCart();
  const [loading, setLoading] = useState<"paystack" | "wallet" | null>(null);

  if (!isAuthenticated || !cart || cart.items.length === 0) return null;

  const handleExpress = (method: "paystack" | "wallet") => {
    setLoading(method);
    onExpressCheckout(method);
  };

  return (
    <section
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]"
      data-testid="express-checkout-rail"
    >
      <div className="mb-4 flex items-center gap-2">
        <Zap size={18} className="text-[hsl(var(--accent))]" />
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
          Express Checkout
        </h2>
      </div>
      <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
        Skip the form and pay instantly with your saved details.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleExpress("paystack")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#01454A] px-6 py-4 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          data-testid="express-paystack-btn"
        >
          {loading === "paystack" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <CreditCard size={18} />
              Pay with Paystack
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleExpress("wallet")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] px-6 py-4 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:bg-[hsl(var(--primary)/0.1)] active:scale-95 disabled:opacity-60"
          data-testid="express-wallet-btn"
        >
          {loading === "wallet" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))]" />
          ) : (
            <>
              <Wallet size={18} />
              Pay with Wallet
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-center">
        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          or fill the form below · {formatCurrency(cartTotal, currency)}
        </span>
        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
      </div>
    </section>
  );
}
