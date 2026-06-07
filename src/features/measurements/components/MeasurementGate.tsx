"use client";

/**
 * features/measurements/components/MeasurementGate.tsx
 * Guards checkout: ensures all cart items requiring custom fit have
 * a measurement profile linked before allowing the user to proceed.
 *
 * Integration:
 *   - CartItem: has `requires_measurement: boolean` from Django Product.requires_measurement
 *   - MeasurementProfile: fetched via useMeasurements() TanStack hook
 *   - If all items are OK → renders children
 *   - Otherwise → shows blocker with CTA to the measurements page
 */

import React from "react";
import Link from "next/link";
import { LoadingSpinner, Button } from "@/shared/ui";
import { useMeasurements } from "@/entities/measurement/hooks/use-measurements";

interface CartItemLike {
  id: string;
  requires_measurement?: boolean;
  vendor_id?: string;
  product_name?: string;
}

interface MeasurementGateProps {
  cartItems: CartItemLike[];
  /** If provided, blocks checkout for the specific vendor's items */
  vendorId?: string;
  children: React.ReactNode;
  /** Override to skip the gate for non-tailored carts */
  forceOpen?: boolean;
}

export function MeasurementGate({
  cartItems,
  vendorId,
  children,
  forceOpen = false,
}: MeasurementGateProps) {
  const { data, isLoading } = useMeasurements();

  // Items requiring measurements
  const itemsNeedingMeasurement = cartItems.filter((item) => {
    if (!item.requires_measurement) return false;
    if (vendorId && item.vendor_id !== vendorId) return false;
    return true;
  });

  const needsMeasurement = itemsNeedingMeasurement.length > 0;

  // Loading state
  if (isLoading && needsMeasurement) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // No measurements in cart — just pass through
  if (!needsMeasurement || forceOpen) {
    return <>{children}</>;
  }

  // Check if user has any measurement profile
  const measurementCount = (data as { count?: number })?.count ?? 0;
  const hasMeasurements = measurementCount > 0;

  if (hasMeasurements) {
    // User has profiles — all good
    return <>{children}</>;
  }

  // ── Blocker UI ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4" role="alert">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📏</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-300">Measurements Required</h3>
          <p className="text-xs text-slate-400 mt-1">
            {itemsNeedingMeasurement.length === 1
              ? `"${itemsNeedingMeasurement[0].product_name ?? "This item"}" requires your body measurements for a custom fit.`
              : `${itemsNeedingMeasurement.length} items in your cart require custom fit measurements.`
            }
          </p>
        </div>
      </div>

      {/* Affected items list */}
      {itemsNeedingMeasurement.length <= 4 && (
        <ul className="space-y-1.5 pl-2">
          {itemsNeedingMeasurement.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              {item.product_name ?? `Item ${item.id}`}
            </li>
          ))}
        </ul>
      )}

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 py-2">
        {[
          { icon: "✂️", label: "Perfect fit" },
          { icon: "🔄", label: "Fewer returns" },
          { icon: "⚡", label: "2 minutes" },
        ].map(({ icon, label }) => (
          <div key={label} className="text-center">
            <div className="text-xl mb-1">{icon}</div>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Link href="/measurements/new" className="flex-1">
          <Button className="w-full" id="measurement-gate-add-btn" size="md">
            Add My Measurements
          </Button>
        </Link>
        <Link href="/measurements" className="flex-1">
          <Button variant="secondary" className="w-full" size="md">
            View Profiles
          </Button>
        </Link>
      </div>
    </div>
  );
}
