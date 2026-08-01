/**
 * TrendingTagsRail.tsx — Consolidated homepage bundle section
 *
 * Horizontally scrollable row of trending taxonomy tags.
 * Receives tags as props from the 12-way asyncio.gather bundle —
 * ZERO client-side fetches on the homepage.
 *
 * Design:
 *  - Brand-gold active pill, charcoal hover on unselected
 *  - Smooth scroll with overflow-x-auto + scroll-hide
 *  - snap-x scroll on mobile for swipe-friendly UX
 *  - 44px touch targets (Apple HIG / Material spec)
 *  - Accessible: role="list", aria-label, keyboard-focusable
 *  - Typed empty state (section never disappears)
 */

import Link from "next/link";
import type { HomepageTrendingTag } from "@/features/catalog/types/catalog.types";
import { Hash } from "lucide-react";

interface Props {
  tags: HomepageTrendingTag[];
}

export function TrendingTagsRail({ tags }: Props) {
  // Typed empty state — section never disappears, degrades gracefully
  if (!tags || tags.length === 0) {
    return (
      <section
        className="py-6 bg-background"
        data-testid="trending-tags-rail"
        aria-label="Trending tags"
      >
        <div className="px-5 md:px-10 lg:px-20">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600] mb-3">
            Trending Tags
          </p>
          <div className="flex items-center gap-2 py-4 text-muted-foreground/60">
            <Hash size={16} aria-hidden="true" />
            <span className="font-raleway text-sm">No trending tags available right now.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-6 bg-background"
      data-testid="trending-tags-rail"
      aria-label="Trending tags"
    >
      <div className="px-5 md:px-10 lg:px-20">
        <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600] mb-3">
          Trending Tags
        </p>
        <div
          className="flex gap-2 overflow-x-auto branded-scroll pb-2 snap-x"
          role="list"
          aria-label="Trending taxonomy tags"
        >
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/products?tag=${tag.slug}`}
              role="listitem"
              data-testid={`tag-${tag.slug}`}
              className="snap-start flex-shrink-0 min-h-[44px] inline-flex items-center px-4 py-2 rounded-full border border-border bg-card font-raleway text-sm font-medium text-foreground hover:bg-[#FDA600] hover:text-black hover:border-[#FDA600] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]"
              style={tag.color_hex ? { borderColor: `${tag.color_hex}40` } : undefined}
            >
              <Hash size={12} className="mr-1 opacity-60" aria-hidden="true" />
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
