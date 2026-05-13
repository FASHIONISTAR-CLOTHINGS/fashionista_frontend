/**
 * @file src/components/shared/ui/Skeleton.tsx
 *
 * COMPATIBILITY SHIM — do not import new code from here.
 *
 * Re-exports the branded `Skeleton` and `PageSkeleton` composites
 * from the canonical shared skeletons catalog.
 *
 * Route loading.tsx files that import from this path will continue
 * to work without modification.  Migrate them to import directly
 * from `@/shared/components/skeletons` when convenient.
 */

import { cn } from "@/lib/utils";

// ── Branded skeleton primitive ──────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const baseClass =
    "animate-pulse bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10";

  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-3/4",
    card: "rounded-2xl h-48 w-full shadow-sm",
  };

  return (
    <div
      className={cn(baseClass, variants[variant], className)}
      {...props}
    />
  );
}

// ── Generic full-page loading skeleton ──────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rectangular" className="h-10 w-48" />
        <Skeleton variant="circular" className="h-12 w-12" />
      </div>

      {/* Banner / Hero */}
      <Skeleton variant="card" className="h-64 md:h-96 w-full" />

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton variant="card" className="h-48 md:h-60" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
