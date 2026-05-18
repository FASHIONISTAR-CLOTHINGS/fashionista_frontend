"use client";

/**
 * @file CheckoutPageSkeleton.tsx
 * @description Shimmer skeleton shown while the CheckoutPage hydrates.
 * Matches the exact layout of CheckoutPage to prevent CLS.
 */

export function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 lg:px-20 animate-pulse">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="h-14 w-64 rounded-xl bg-muted" />
        <div className="mt-2 h-4 w-40 rounded bg-muted" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left: address form skeleton */}
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)] space-y-4">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-12 w-full rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)] space-y-4">
            <div className="h-5 w-40 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: order summary skeleton */}
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)] lg:sticky lg:top-24 lg:w-[420px] space-y-4">
          <div className="h-5 w-32 rounded bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
          <div className="h-14 w-full rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
