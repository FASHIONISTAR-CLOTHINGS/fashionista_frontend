"use client";

/**
 * features/checkout/components/OrderConfirmation.tsx
 * Post-payment success screen shown after order is confirmed.
 * Displays: order number, tracking, gift details, carbon offset status,
 * estimated delivery, and CTAs to track/continue shopping.
 */

import { useEffect } from "react";
import Link from "next/link";
import { Button, Badge } from "@/shared/ui";
import confetti from "canvas-confetti";

interface OrderDetails {
  id: string;
  order_number: string;
  tracking_number?: string;
  courier_service?: string;
  estimated_delivery_at?: string;
  total_amount: number;
  is_gift: boolean;
  gift_message?: string;
  carbon_offset_purchased: boolean;
  carbon_footprint_kg?: number;
  item_count: number;
  status: string;
}

interface OrderConfirmationProps {
  order: OrderDetails;
  onContinueShopping?: () => void;
}

export function OrderConfirmation({ order, onContinueShopping }: OrderConfirmationProps) {
  // Fire confetti on mount
  useEffect(() => {
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55, colors: ["#f59e0b", "#fbbf24", "#fcd34d"] });
    fire(0.2,  { spread: 60, colors: ["#10b981", "#34d399", "#6ee7b7"] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  }, []);

  const estimatedDate = order.estimated_delivery_at
    ? new Date(order.estimated_delivery_at).toLocaleDateString("en-NG", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center animate-in zoom-in-75 duration-500">
          <span className="text-4xl">🎉</span>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Order Confirmed!</h2>
          <p className="text-sm text-slate-400 mt-1">
            Your FASHIONISTAR order is on its way
          </p>
        </div>
      </div>

      {/* Order Number Card */}
      <div className="p-5 rounded-2xl bg-white/4 border border-white/10 text-left space-y-4">
        {/* Order # */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Order Number</span>
          <span className="text-sm font-bold text-amber-400 font-mono">#{order.order_number}</span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Amount Paid</span>
          <span className="text-sm font-bold text-white">₦{order.total_amount.toLocaleString("en-NG")}</span>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tracking</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white">{order.tracking_number}</span>
              {order.courier_service && (
                <Badge color="info" size="xs">{order.courier_service}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Estimated delivery */}
        {estimatedDate && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Estimated Delivery</span>
            <span className="text-xs font-semibold text-white">{estimatedDate}</span>
          </div>
        )}

        {/* Gift */}
        {order.is_gift && (
          <div className="pt-3 border-t border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎁</span>
              <span className="text-xs font-semibold text-amber-300">Gift Order</span>
            </div>
            {order.gift_message && (
              <p className="text-xs text-slate-400 italic leading-relaxed pl-7">
                &ldquo;{order.gift_message}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Carbon offset */}
        {order.carbon_offset_purchased && (
          <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <span className="text-xs text-emerald-400 font-medium">Carbon Offset Purchased</span>
            </div>
            {order.carbon_footprint_kg && (
              <span className="text-[10px] text-emerald-400/70">
                {order.carbon_footprint_kg.toFixed(2)} kg CO₂ offset
              </span>
            )}
          </div>
        )}
      </div>

      {/* What's next */}
      <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
        <p className="text-xs font-semibold text-amber-300 mb-2">What happens next?</p>
        <div className="space-y-1.5 text-left">
          {[
            { icon: "📧", text: "Order confirmation email sent to your inbox" },
            { icon: "🏭", text: "Vendor is preparing your order" },
            { icon: "🚚", text: order.courier_service ? `${order.courier_service} will handle delivery` : "Courier will pick up within 24h" },
            { icon: "📱", text: "You'll receive tracking updates via SMS/email" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        {order.tracking_number && (
          <Link href={`/orders/${order.id}/track`}>
            <Button className="w-full" size="lg" id="order-confirm-track-btn">
              📦 Track My Order
            </Button>
          </Link>
        )}
        <Link href={`/orders/${order.id}`}>
          <Button variant="secondary" className="w-full" id="order-confirm-view-btn">
            View Order Details
          </Button>
        </Link>
        <button
          onClick={onContinueShopping}
          className="text-sm text-slate-400 hover:text-white transition-colors"
          id="order-confirm-continue-btn"
        >
          Continue Shopping →
        </button>
      </div>
    </div>
  );
}
