"use client";

/**
 * entities/order/components/OrderTimeline.tsx
 * Visual timeline of order status progression.
 * Mirrors Django Order.status choices: pending_payment → confirmed → processing
 *   → tailoring → shipped → delivered / cancelled / refunded
 */



type OrderStatus =
  | "pending_payment" | "confirmed" | "processing"
  | "tailoring" | "shipped" | "out_for_delivery"
  | "delivered" | "cancelled" | "refunded";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  { status: "pending_payment", label: "Payment", icon: "💳", description: "Awaiting payment confirmation" },
  { status: "confirmed", label: "Confirmed", icon: "✅", description: "Order accepted by vendor" },
  { status: "tailoring", label: "Tailoring", icon: "🧵", description: "Your garment is being crafted" },
  { status: "shipped", label: "Shipped", icon: "📦", description: "On its way to you" },
  { status: "delivered", label: "Delivered", icon: "🏠", description: "Successfully delivered" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending_payment: 0,
  confirmed: 1,
  processing: 1,
  tailoring: 2,
  shipped: 3,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

interface OrderTimelineProps {
  status: OrderStatus;
  courierService?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryAt?: string | null;
  className?: string;
}

export function OrderTimeline({
  status, courierService, trackingNumber, estimatedDeliveryAt, className = "",
}: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER[status] ?? 0;
  const isCancelled = status === "cancelled" || status === "refunded";

  if (isCancelled) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 ${className}`}>
        <span className="text-2xl">❌</span>
        <div>
          <p className="text-sm font-semibold text-red-300 capitalize">{status}</p>
          <p className="text-xs text-slate-400 mt-0.5">This order has been {status}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10" />
        <div
          className="absolute left-4 top-4 w-0.5 bg-gradient-to-b from-amber-500 to-amber-400 transition-all duration-700"
          style={{ height: `${Math.min((currentIndex / (STEPS.length - 1)) * 100, 100)}%` }}
        />

        <div className="space-y-5 relative">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.status} className="flex items-start gap-4 pl-0">
                {/* Dot */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-amber-500 border-2 border-amber-400 shadow-lg shadow-amber-500/40"
                    : isCurrent
                    ? "bg-amber-500/20 border-2 border-amber-500 animate-pulse"
                    : "bg-slate-800 border-2 border-white/15"
                }`}>
                  {isDone ? "✓" : step.icon}
                </div>

                {/* Content */}
                <div className={`pt-1 transition-opacity duration-300 ${
                  isDone || isCurrent ? "opacity-100" : "opacity-40"
                }`}>
                  <p className={`text-sm font-semibold ${isCurrent ? "text-amber-300" : isDone ? "text-white" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  {isCurrent && courierService && (
                    <p className="text-xs text-amber-400/80 mt-1">via {courierService}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking info */}
      {trackingNumber && (
        <div className="mt-3 p-3 rounded-xl bg-white/4 border border-white/8">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">Tracking #</span>
            <span className="text-xs font-mono font-semibold text-amber-300">{trackingNumber}</span>
          </div>
          {estimatedDeliveryAt && (
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-xs text-slate-400">Est. Delivery</span>
              <span className="text-xs text-white">
                {new Date(estimatedDeliveryAt).toLocaleDateString("en-NG", {
                  weekday: "short", month: "short", day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
