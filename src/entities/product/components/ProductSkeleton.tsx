"use client";

/**
 * entities/product/components/ProductSkeleton.tsx
 * Animated skeleton placeholder for ProductCard during loading.
 * Mirrors the exact dimensions and layout of ProductCard for zero layout shift.
 */

import React from "react";

interface ProductSkeletonProps {
  variant?: "card" | "list" | "compact";
  count?: number;
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/6 animate-pulse rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

function SingleProductSkeleton({ variant = "card" }: { variant?: "card" | "list" | "compact" }) {
  if (variant === "list") {
    return (
      <div className="flex gap-4 p-4 rounded-2xl bg-white/4 border border-white/8">
        {/* Image */}
        <SkeletonPulse className="w-20 h-20 flex-shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <SkeletonPulse className="h-4 w-3/4" />
          <SkeletonPulse className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <SkeletonPulse className="h-3 w-14" />
            <SkeletonPulse className="h-3 w-10" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SkeletonPulse className="h-5 w-20" />
          <SkeletonPulse className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-xl overflow-hidden bg-white/4 border border-white/8">
        <SkeletonPulse className="h-28 w-full rounded-none" />
        <div className="p-2 space-y-1.5">
          <SkeletonPulse className="h-3 w-4/5" />
          <SkeletonPulse className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  // Default: card
  return (
    <div className="rounded-2xl overflow-hidden bg-white/4 border border-white/8">
      {/* Image area */}
      <SkeletonPulse className="h-56 w-full rounded-none" />
      <div className="p-4 space-y-3">
        {/* Vendor badge */}
        <SkeletonPulse className="h-3 w-20 rounded-full" />
        {/* Title */}
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-2/3" />
        {/* Tags */}
        <div className="flex gap-1.5 pt-1">
          <SkeletonPulse className="h-5 w-16 rounded-full" />
          <SkeletonPulse className="h-5 w-12 rounded-full" />
          <SkeletonPulse className="h-5 w-14 rounded-full" />
        </div>
        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2">
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton({ variant = "card", count = 1 }: ProductSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleProductSkeleton key={i} variant={variant} />
      ))}
    </>
  );
}
