/**
 * @file RecentlyViewedRail.tsx
 * @description Horizontal scroll rail showing the last 12 viewed products.
 *
 * Revenue strategy: 35% of e-commerce conversions come from recently viewed.
 * - Reads from localStorage ring-buffer via useRecentlyViewed()
 * - Fully client-side; no API request needed
 * - Uses existing ProductCard for visual consistency
 * - Empty state: hidden (better UX — no "you haven't viewed anything" placeholder)
 * - Renders on: homepage, catalog, cart, order success page
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock } from "lucide-react";
import { useRecentlyViewed, type RecentlyViewedItem } from "../hooks/use-recently-viewed";
import { CardSkeleton } from "@/shared/components/skeletons";
import { cn } from "@/lib/utils";

// ─── Sub-component: single recently-viewed card ───────────────────────────────

function RecentCard({ item }: { item: RecentlyViewedItem }) {
  return (
    <Link
      href={`/products/${item.slug}`}
      className={cn(
        "group flex-shrink-0 w-40 rounded-xl overflow-hidden border border-border bg-card",
        "hover:border-[hsl(var(--accent))] hover:shadow-md transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
      )}
      aria-label={`View ${item.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            sizes="160px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-3xl">👗</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5 space-y-0.5">
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
          {item.title}
        </p>
        <p className="text-xs font-bold text-[hsl(var(--accent))]">{item.price}</p>
      </div>
    </Link>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RecentlyViewedRailProps {
  /** Optional heading override. */
  heading?: string;
  /** Max items to show (default: 8 — respects 12-item buffer cap). */
  maxVisible?: number;
  className?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * RecentlyViewedRail — horizontal scroll product rail.
 *
 * Renders nothing if the user has no recently viewed products.
 * Hydrates from localStorage on mount (SSR-safe).
 *
 * Args:
 *   heading:    Section heading text.
 *   maxVisible: Maximum items to display (default: 8).
 *   className:  Container className overrides.
 */
export function RecentlyViewedRail({
  heading = "Recently Viewed",
  maxVisible = 8,
  className,
}: RecentlyViewedRailProps) {
  const { items } = useRecentlyViewed();
  const [hydrated, setHydrated] = useState(false);

  // Prevent SSR/client mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Show skeleton while hydrating
    return (
      <section className={cn("space-y-3", className)} aria-label={heading}>
        <div className="h-5 w-36 rounded bg-muted animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="flex-shrink-0 w-40" />
          ))}
        </div>
      </section>
    );
  }

  // Nothing to show — hide completely
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);

  return (
    <section className={cn("space-y-3", className)} aria-label={heading}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {heading}
        </h2>
        {items.length > maxVisible && (
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
          >
            See all <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll rail */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted"
        aria-label={`${visible.length} recently viewed products`}
      >
        {visible.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
