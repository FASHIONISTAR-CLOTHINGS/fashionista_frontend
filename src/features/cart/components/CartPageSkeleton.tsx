/**
 * @file CartPageSkeleton.tsx
 * @description PPR-optimised shimmer skeleton for the CartPage.
 * Pure CSS, server-renderable, zero JS needed.
 */

export function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 lg:px-20" aria-hidden="true">
      {/* Header skeleton */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="h-16 w-64 rounded-xl shimmer" />
        <div className="mt-2 h-4 w-24 rounded shimmer" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="h-28 w-24 shrink-0 rounded-xl shimmer" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded shimmer" />
                  <div className="h-4 w-3/4 rounded shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded shimmer" />
                  <div className="h-9 w-28 rounded-full shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary panel */}
        <div className="w-full rounded-2xl border border-border bg-card p-6 lg:w-[420px]">
          <div className="h-6 w-40 rounded shimmer mb-5" />
          <div className="space-y-3 border-b border-border pb-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-40 rounded shimmer" />
                <div className="h-4 w-16 rounded shimmer" />
              </div>
            ))}
          </div>
          <div className="py-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
            </div>
          </div>
          <div className="h-14 w-full rounded-xl shimmer mt-4" />
        </div>
      </div>
    </div>
  );
}
