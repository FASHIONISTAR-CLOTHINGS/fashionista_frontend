/**
 * @file ProductDetailSkeleton.tsx
 * @description PPR shimmer skeleton for the product detail page.w
 */

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 lg:px-20" aria-hidden="true">
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Gallery */}
        <div className="flex-1 space-y-3">
          <div className="h-[480px] w-full rounded-2xl shimmer" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl shimmer" />
            ))}
          </div>
        </div>

        {/* Details panel */}
        <div className="w-full lg:max-w-[480px] space-y-5">
          {/* Vendor */}
          <div className="h-4 w-32 rounded shimmer" />
          {/* Title */}
          <div className="h-8 w-full rounded shimmer" />
          <div className="h-8 w-3/4 rounded shimmer" />
          {/* Rating */}
          <div className="h-4 w-40 rounded shimmer" />
          {/* Price */}
          <div className="h-10 w-36 rounded shimmer" />
          {/* Variants */}
          <div className="h-20 w-full rounded-xl shimmer" />
          {/* Qty + CTA */}
          <div className="h-14 w-full rounded-xl shimmer" />
          <div className="h-14 w-full rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}
