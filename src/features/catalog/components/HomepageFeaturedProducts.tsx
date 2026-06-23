/**
 * HomepageFeaturedProducts.tsx — Premium 2026 Edition
 * features/catalog/components/HomepageFeaturedProducts.tsx — C2 (v2)
 *
 * RSC wrapper for the "Featured Products" section on the homepage.
 * Delegates all card rendering to the shared <ProductCard /> component
 * (single source of truth for card UI across all catalog pages).
 *
 * Architecture:
 *   - Props: HomepageBundle (already fetched by page.tsx — zero extra HTTP round-trip)
 *   - Grid: 2-col mobile → 3-col tablet → 4-col widescreen
 *   - Entrance: staggered card-enter CSS animation (no JS lib required)
 *   - Skeleton: uses the ProductCardSkeleton for PPR/Suspense fallback
 */

import Link from "next/link";
import ProductCard from "./ProductCard";
import type { HomepageBundle } from "../types/catalog.types";

interface Props {
  bundle: HomepageBundle;
  /** Max cards to render (default 12). */
  limit?: number;
}

/**
 * Skeleton variant — used as Suspense fallback.
 * Pure CSS shimmer, no JS, compatible with PPR.
 */
export function HomepageFeaturedProductsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="section-wrapper" aria-busy="true" aria-label="Loading featured products">
      {/* Section header skeleton */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-4 w-32 rounded mb-2" />
          <div className="shimmer h-8 w-64 rounded" />
        </div>
        <div className="shimmer h-4 w-20 rounded" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden">
            {/* Image */}
            <div className="shimmer aspect-[4/5] rounded-2xl" />
            {/* Body */}
            <div className="p-3 flex flex-col gap-2">
              <div className="shimmer h-2.5 w-20 rounded" />
              <div className="shimmer h-3.5 w-full rounded" />
              <div className="shimmer h-3 w-3/4 rounded" />
              <div className="shimmer h-4 w-16 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Main HomepageFeaturedProducts — RSC (Server Component).
 * No "use client" — renders on the server for optimal LCP.
 */
export default function HomepageFeaturedProducts({ bundle, limit = 12 }: Props) {
  const products = bundle.featured_products.slice(0, limit);

  if (products.length === 0) return null;

  return (
    <section
      className="section-wrapper"
      aria-labelledby="featured-products-heading"
      id="featured-products"
    >
      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-8 animate-slide-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Curated for you
          </p>
          <h2
            id="featured-products-heading"
            className="section-title"
          >
            Featured Pieces
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold text-[var(--BV-green)] hover:text-[var(--BV-green-light)] underline underline-offset-4 decoration-[var(--BV-gold)] transition-colors duration-200 whitespace-nowrap"
          aria-label="Browse all featured products"
        >
          View all →
        </Link>
      </div>

      {/* ── Product Grid ────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch"
        role="list"
        aria-label="Featured products"
      >
        {products.map((card, idx) => (
          <div key={card.id} role="listitem" className="h-full">
            <ProductCard
              card={card}
              index={idx + 1}
              priority={idx < 2}
              showWishlist
            />
          </div>
        ))}
      </div>
    </section>
  );
}
