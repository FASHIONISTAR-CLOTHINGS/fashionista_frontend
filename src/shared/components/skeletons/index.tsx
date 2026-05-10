/**
 * @module skeletons/index
 *
 * Per-content-type skeleton components for the Fashionistar platform.
 *
 * All skeletons use the Shadcn `<Skeleton>` primitive, which handles the
 * animated shimmer effect via CSS custom properties.
 *
 * Export catalogue:
 *   CardSkeleton       — Product/vendor card (image + title + price)
 *   TableRowSkeleton   — Data-table rows
 *   ListItemSkeleton   — Stacked list items (orders, tickets, etc.)
 *   StatSkeleton       — Dashboard stat cards
 *   ProfileSkeleton    — User/vendor profile header
 *   FormSkeleton       — Multi-field form placeholder
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Card Skeleton ─────────────────────────────────────────────────────────────

export interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className
      )}
      aria-busy="true"
      aria-label="Loading card"
    >
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Render a grid of card skeletons. */
export function CardGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────────

export interface TableRowSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export function TableRowSkeleton({ columns = 5, rows = 6, className }: TableRowSkeletonProps) {
  return (
    <div className={cn("w-full space-y-2", className)} aria-busy="true" aria-label="Loading table">
      {/* Header */}
      <div className="flex gap-4 px-4 py-2 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-3 border-b border-border/50 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn("h-4 flex-1", colIdx === 0 && "w-8 flex-none rounded-full")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── List Item Skeleton ────────────────────────────────────────────────────────

export interface ListItemSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListItemSkeleton({
  count = 5,
  showAvatar = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <ul
      className={cn("space-y-3", className)}
      aria-busy="true"
      aria-label="Loading list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
        </li>
      ))}
    </ul>
  );
}

// ─── Stat Skeleton ─────────────────────────────────────────────────────────────

export function StatSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}
      aria-busy="true"
      aria-label="Loading stats"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Profile Skeleton ──────────────────────────────────────────────────────────

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-5", className)}
      aria-busy="true"
      aria-label="Loading profile"
    >
      <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
  );
}

// ─── Form Skeleton ─────────────────────────────────────────────────────────────

export function FormSkeleton({ fields = 5, className }: { fields?: number; className?: string }) {
  return (
    <div
      className={cn("space-y-5", className)}
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg mt-2" />
    </div>
  );
}
