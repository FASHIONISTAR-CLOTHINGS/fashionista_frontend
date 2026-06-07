"use client";

/**
 * src/entities/cart/components/CartSummary.tsx
 * Glassmorphism cart summary panel — totals, discount, delivery estimate.
 */


import type { Cart } from "../types";
import { Badge, Button } from "@/shared/ui";

interface CartSummaryProps {
  cart: Cart;
  onCheckout: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CartSummary({ cart, onCheckout, isLoading, className = "" }: CartSummaryProps) {
  const fmt = (val: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: cart.currency ?? "NGN" }).format(val);

  return (
    <aside
      className={`rounded-2xl bg-white/5 border border-white/12 backdrop-blur-xl p-5 space-y-4 ${className}`}
      id="cart-summary"
    >
      <h3 className="text-base font-semibold text-white">Order Summary</h3>

      {/* Line items */}
      <div className="space-y-2 text-sm">
        <Row label={`Subtotal (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""})`} value={fmt(cart.subtotal)} />
        {cart.discountAmount > 0 && (
          <Row label="Discount" value={`-${fmt(cart.discountAmount)}`} valueClass="text-emerald-400" />
        )}
        <Row label="Delivery" value="Calculated at checkout" valueClass="text-slate-400" />
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-300">Estimated Total</span>
        <span className="text-lg font-bold text-amber-400">{fmt(cart.estimatedTotal)}</span>
      </div>

      {/* Measurement gate warning */}
      {cart.hasMeasurementGate && cart.hasMissingMeasurements && (
        <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-base flex-shrink-0">📐</span>
          <p className="text-xs text-amber-300 leading-relaxed">
            Some items require measurements before checkout.{" "}
            <a href="/measurements" className="underline hover:text-amber-200" id="cart-summary-measure-link">
              Add now →
            </a>
          </p>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onCheckout}
        isLoading={isLoading}
        disabled={cart.itemCount === 0 || (cart.hasMeasurementGate && cart.hasMissingMeasurements)}
        className="w-full"
        size="lg"
        id="cart-checkout-btn"
        rightIcon={<span>→</span>}
      >
        Proceed to Checkout
      </Button>

      {/* Promo code */}
      {cart.promoCode && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Applied: </span>
          <Badge color="success" className="font-mono">{cart.promoCode}</Badge>
        </div>
      )}
    </aside>
  );
}

function Row({
  label, value, valueClass = "text-white",
}: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
