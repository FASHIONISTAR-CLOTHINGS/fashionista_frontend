/**
 * features/catalog/components/CatalogCategoryGrid.tsx
 * CatalogCategoryGrid.tsx — Premium 2026 Edition
 *
 * RSC — "Shop by Category" grid section.
 * Uses cloudinary_url when available (CDN-optimised tiles) with image_url fallback.
 * Staggered card-enter CSS entrance animation — no JS library required.
 *
 * Taxonomy note: CATEGORIES are for PRODUCTS.
 * A product belongs to 1-15 categories. Only active (non-deleted) categories
 * are served by the backend — `active: true` is always guaranteed here.
 *
 * Grid: 3-col mobile → 4-col tablet → 6-col desktop
 * Touch targets: min 44×44px per Apple HIG
 */

import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import { getCatalogCategories } from "../api/catalog.server";
import type { HomepageCategoryCard } from "../types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Pick the best image src: cloudinary_url > image_url > image > null */
function resolveCategoryImage(item: HomepageCategoryCard): string | null {
  const candidates = [item.cloudinary_url, item.image_url, item.image];
  for (const c of candidates) {
    if (c && !c.endsWith("/media/None") && !c.endsWith("/media/null") && c !== "null") {
      return c;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton (Suspense / PPR fallback)
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="section-wrapper" aria-busy="true">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-3 w-24 rounded mb-2" />
          <div className="shimmer h-8 w-52 rounded" />
        </div>
        <div className="shimmer h-3 w-24 rounded" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl">
            <div className="shimmer w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
            <div className="shimmer h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogCategoryGridProps {
  /** Pre-fetched categories from HomepageBundle (avoids double-fetch). */
  categories?: HomepageCategoryCard[];
  limit?: number;
  showCta?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component (RSC)
// ─────────────────────────────────────────────────────────────────────────────

export default async function CatalogCategoryGrid({
  categories: categoriesProp,
  limit,
  showCta = true,
}: CatalogCategoryGridProps) {
  const categories = categoriesProp ?? (await getCatalogCategories());
  const items = limit ? categories.slice(0, limit) : categories;

  return (
    <section
      className="section-wrapper bg-[var(--BV-cream)]/40"
      aria-labelledby="category-grid-heading"
      id="shop-by-category"
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 animate-slide-up gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Discover
          </p>
          <h2
            id="category-grid-heading"
            className="section-title"
          >
            Shop by Category
          </h2>
          <p className="mt-1 text-sm text-[var(--BV-muted)] max-w-md">
            Explore fashion domains powered by the Fashionistar catalog.
          </p>
        </div>
        {showCta && (
          <Link
            href="/categories"
            className="text-sm font-semibold text-[var(--BV-green)] hover:text-[var(--BV-green-light)] underline underline-offset-4 decoration-[var(--BV-gold)] transition-colors duration-200 whitespace-nowrap"
            aria-label="View all categories"
          >
            All categories →
          </Link>
        )}
      </div>

      {/* ── Category Grid ────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          role="list"
          aria-label="Product categories"
        >
          {items.map((item, idx) => {
            const src = resolveCategoryImage(item);
            const staggerClass = `stagger-${Math.min(idx + 1, 12)}`;

            return (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                role="listitem"
                data-testid="category-card"
                aria-label={`Browse ${item.title} category`}
                className={`
                  group flex flex-col items-center gap-2.5 p-3 sm:p-4
                  rounded-2xl text-center cursor-pointer
                  product-card-glass animate-card-enter ${staggerClass}
                  hover:border-[var(--BV-gold)]/40
                  focus-visible:outline-2 focus-visible:outline-[var(--BV-green)] focus-visible:outline-offset-2
                `}
              >
                {/* Category image tile */}
                <div className="relative w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-[var(--BV-surface)] flex-shrink-0">
                  {src ? (
                    <FashionistarImage
                      src={src}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                      showBlurUp={false}
                    />
                  ) : (
                    /* Branded monogram fallback */
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--BV-cream)] to-[var(--BV-green)]/10">
                      <span className="text-lg font-bold text-[var(--BV-green)]/40">
                        {item.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category name */}
                <p className="text-xs sm:text-sm font-semibold text-[var(--BV-ink)] leading-tight group-hover:text-[var(--BV-green)] transition-colors duration-200 line-clamp-2">
                  {item.title || item.name}
                </p>

                {/* Gold underline accent on hover */}
                <span
                  className="block h-0.5 w-0 group-hover:w-8 bg-[var(--BV-gold)] rounded-full transition-all duration-300"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--BV-border)] bg-[var(--BV-surface)] px-6 py-14 text-center">
          <p className="text-2xl font-bold text-[var(--BV-ink)]">Categories Are Being Curated</p>
          <p className="mt-2 text-sm text-[var(--BV-muted)] max-w-sm mx-auto">
            Fresh catalog categories will appear as soon as they are published.
          </p>
        </div>
      )}

      {/* ── CTA Button ────────────────────────────────────────────────────── */}
      {showCta && items.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/categories"
            className="btn-primary px-10 py-3 text-sm"
            aria-label="Browse all product categories"
          >
            Explore All Categories
          </Link>
        </div>
      )}
    </section>
  );
}
