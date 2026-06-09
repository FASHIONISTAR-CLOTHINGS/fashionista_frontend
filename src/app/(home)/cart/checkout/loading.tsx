/**
 * @file loading.tsx (Checkout)
 * @description Checkout page skeleton matching the 2-col layout: form + order summary.
 */
import { FormSkeleton } from "@/components";

export default function CheckoutLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto"
      aria-label="Loading checkout" aria-busy="true">

      {/* Left — checkout form */}
      <div className="lg:col-span-3 space-y-6">
        <div className="h-7 w-32 rounded bg-muted shimmer" />
        {/* Contact info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-5 w-36 rounded bg-muted shimmer mb-4" />
          <FormSkeleton fields={3} />
        </div>
        {/* Shipping */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-5 w-32 rounded bg-muted shimmer mb-4" />
          <FormSkeleton fields={5} />
        </div>
        {/* Payment */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-5 w-32 rounded bg-muted shimmer mb-4" />
          <FormSkeleton fields={3} />
        </div>
      </div>

      {/* Right — order summary */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-16 w-16 rounded-xl bg-muted shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded bg-muted shimmer" />
                <div className="h-3 w-2/3 rounded bg-muted shimmer" />
              </div>
              <div className="h-4 w-16 rounded bg-muted shimmer" />
            </div>
          ))}
          <div className="border-t border-border pt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 rounded bg-muted shimmer" />
                <div className="h-4 w-16 rounded bg-muted shimmer" />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <div className="h-5 w-16 rounded bg-muted shimmer" />
              <div className="h-6 w-24 rounded bg-muted shimmer" />
            </div>
          </div>
          <div className="h-12 w-full rounded-xl bg-muted shimmer" />
        </div>
      </div>
    </div>
  );
}
