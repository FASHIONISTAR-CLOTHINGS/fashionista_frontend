/**
 * features/catalog/components/CatalogTagsRail.tsx
 *
 * Phase C5 — Trending Tags Horizontal Rail
 *
 * A horizontally scrollable, snap-on row of taxonomy tags.
 * Connects to useCatalogTags() → GET /catalog/tags/ (10-min TTL cache).
 *
 * Design:
 *  - Brand-gold active pill, charcoal hover on unselected
 *  - Smooth scroll with overflow-x-auto + scroll-hide
 *  - snap-x scroll on mobile for swipe-friendly UX
 *  - 44px touch targets (Apple HIG / Material spec)
 *  - Accessible: role="list", aria-label, keyboard-focusable
 */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCatalogTags } from "@/features/catalog";

interface CatalogTagsRailProps {
  /** If provided, wraps the rail in a section with a heading. */
  heading?: string;
  /** Optional base URL prefix for tag navigation (default: /products) */
  baseHref?: string;
  /** Limit the number of tags shown (default: all) */
  limit?: number;
  /** Extra className for the outer wrapper */
  className?: string;
}

export function CatalogTagsRail({
  heading,
  baseHref = "/products",
  limit,
  className = "",
}: CatalogTagsRailProps) {
  const { data, isLoading } = useCatalogTags();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") ?? "";

  const tags = limit ? (data?.tags ?? []).slice(0, limit) : (data?.tags ?? []);

  if (isLoading) {
    return (
      <div className={`w-full overflow-hidden ${className}`} aria-busy="true" aria-label="Loading tags">
        <div className="flex gap-2 px-5 md:px-10 lg:px-20 py-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="shimmer h-9 rounded-full"
              style={{ width: `${60 + (i % 4) * 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!tags.length) return null;

  return (
    <section className={`w-full ${className}`} aria-label="Trending tags">
      {heading && (
        <div className="px-5 pt-6 pb-2 md:px-10 lg:px-20">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl">{heading}</h2>
        </div>
      )}

      {/* Scrollable rail */}
      <div
        className="
          w-full overflow-x-auto scroll-hide
          scroll-smooth snap-x snap-mandatory
          px-5 py-3 md:px-10 lg:px-20
          border-b border-border
        "
        role="list"
        aria-label="Trending catalog tags"
      >
        <div className="flex items-center gap-2 min-w-max">
          {/* "All" chip */}
          <Link
            href={baseHref}
            role="listitem"
            aria-current={!activeTag ? "page" : undefined}
            className={`
              snap-start inline-flex items-center justify-center
              h-9 px-5 rounded-full text-xs font-semibold tracking-wide uppercase
              transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2
              min-w-[44px] touch-target whitespace-nowrap
              ${!activeTag
                ? "bg-[#01454A] text-white shadow-sm"
                : "border border-border text-foreground hover:bg-[#01454A]/10 hover:border-[#01454A]/50"
              }
            `}
          >
            All
          </Link>

          {tags.map((tag) => {
            const isActive = activeTag === tag.slug;
            // Use the tag's brand color if provided, fallback to gold
            const accentColor = tag.color_hex || "#FDA600";

            return (
              <Link
                key={tag.id}
                href={`${baseHref}?tag=${tag.slug}`}
                role="listitem"
                aria-current={isActive ? "page" : undefined}
                style={
                  isActive
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : { borderColor: accentColor + "40" }
                }
                className={`
                  snap-start inline-flex items-center justify-center gap-1.5
                  h-9 px-5 rounded-full text-xs font-semibold tracking-wide
                  transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2
                  min-w-[44px] touch-target whitespace-nowrap
                  border
                  ${isActive
                    ? "text-white shadow-sm scale-105"
                    : "text-foreground hover:scale-105 hover:shadow-sm"
                  }
                `}
              >
                {/* Trending dot */}
                {tag.is_trending && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: isActive ? "white" : accentColor }}
                    aria-hidden="true"
                  />
                )}
                {tag.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CatalogTagsRail;
