/**
 * features/catalog/components/CatalogCollectionGrid.tsx
 * CatalogCollectionGrid.tsx — Premium Compact 2026 Edition
 *
 * RSC — "Latest Collections" section.
 * Now uses the SAME compact tile pattern as CatalogCategoryGrid:
 *   - Grid: 3-col mobile → 4-col tablet → 6-col desktop
 *   - Tile: small square image (w-14 h-14 → w-18 h-18 → w-20 h-20) + name below
 *   - Staggered card-enter CSS animation — no Framer Motion
 *   - product-card-glass background (identical to category tiles)
 *   - Hover: border-gold, scale image, green underline accent
 *
 * Taxonomy note: COLLECTIONS are for VENDORS.
 * Vendors join collections to signal the fashion categories they specialise in.
 */

import Link from "next/link";

import { FashionistarImage } from "@/components/media";
import { getCatalogCollections } from "../api/catalog.server";
import type { HomepageCollectionCard } from "../types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveCollectionImage(item: HomepageCollectionCard): string | null {
  const candidates = [item.cloudinary_url, item.image_url, item.image];
  for (const c of candidates) {
    if (c && !c.endsWith("/media/None") && !c.endsWith("/media/null") && c !== "null") {
      return c;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton (Suspense / PPR fallback) — mirrors CatalogCategoryGridSkeleton
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCollectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="section-wrapper bg-[var(--BV-cream)]/40" aria-busy="true">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-3 w-24 rounded mb-2" />
          <div className="shimmer h-8 w-56 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl">
            <div className="shimmer w-14 h-14 sm:w-20 sm:h-20 rounded-2xl" />
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

interface CatalogCollectionGridProps {
  /** Pre-fetched from HomepageBundle (avoids double-fetch). */
  collections?: HomepageCollectionCard[];
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
  limit?: number;
  showCta?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component (RSC)
// ─────────────────────────────────────────────────────────────────────────────

export default async function CatalogCollectionGrid({
  collections: collectionsProp,
  searchParams,
  limit,
  showCta = true,
}: CatalogCollectionGridProps) {
  const resolvedParams = await Promise.resolve(searchParams ?? {});
  const selectedCollection =
    typeof resolvedParams.collection === "string" ? resolvedParams.collection : "";

  const collections = collectionsProp ?? (await getCatalogCollections());
  const filteredItems = selectedCollection
    ? collections.filter((item) => item.slug === selectedCollection)
    : collections;
  const items = (filteredItems.length ? filteredItems : collections).slice(0, limit);
  const navItems = collections.slice(0, 6);

  return (
    <section
      className="section-wrapper bg-[var(--BV-cream)]/40"
      aria-labelledby="collections-heading"
      id="latest-collections"
    >
      {/* ── Section Header (mirrors CatalogCategoryGrid header) ────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 animate-slide-up gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Vendor Collections
          </p>
          <h2 id="collections-heading" className="section-title">
            Latest Collections
          </h2>
          <p className="mt-1 text-sm text-[var(--BV-muted)] max-w-md">
            Curated vendor drops — ready-to-wear, custom tailoring, and premium showcases.
          </p>
        </div>
        {showCta && (
          <Link
            href="/collections"
            className="text-sm font-semibold text-[var(--BV-green)] hover:text-[var(--BV-green-light)] underline underline-offset-4 decoration-[var(--BV-gold)] transition-colors duration-200 whitespace-nowrap"
            aria-label="View all vendor collections"
          >
            All collections →
          </Link>
        )}
      </div>

      {collections.length > 0 ? (
        <>
          {/* ── Collection filter nav — scrollable on mobile ─────────────────── */}
          {navItems.length > 1 && (
            <div className="overflow-x-auto scroll-hide -mx-5 px-5 mb-8 sm:mx-0 sm:px-0">
              <nav
                className="flex items-center gap-2 pb-1 min-w-max md:flex-wrap md:min-w-0"
                aria-label="Collection filters"
              >
                <Link
                  href="/"
                  scroll={false}
                  className={`touch-target rounded-full border border-[#01454A] px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    !selectedCollection
                      ? "bg-[#01454A] text-white"
                      : "text-[#01454A] hover:bg-[#01454A] hover:text-white"
                  }`}
                >
                  All
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/?collection=${item.slug}`}
                    scroll={false}
                    className={`touch-target rounded-full border border-[#01454A] px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                      selectedCollection === item.slug
                        ? "bg-[#01454A] text-white"
                        : "text-[#01454A] hover:bg-[#01454A] hover:text-white"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* ── Collection tile grid — SAME pattern as CatalogCategoryGrid ─── */}
          <div
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
            role="list"
            aria-label="Vendor collections"
          >
            {items.map((item, idx) => {
              const imgSrc = resolveCollectionImage(item);
              const staggerClass = `stagger-${Math.min(idx + 1, 12)}`;

              return (
                <Link
                  key={item.id}
                  href={`/collections/${item.slug}`}
                  role="listitem"
                  data-testid="collection-card"
                  aria-label={`Browse ${item.title} collection`}
                  className={`
                    group flex flex-col items-center gap-2.5 p-3 sm:p-4
                    rounded-2xl text-center cursor-pointer
                    product-card-glass animate-card-enter ${staggerClass}
                    hover:border-[var(--BV-gold)]/40
                    focus-visible:outline-2 focus-visible:outline-[var(--BV-green)] focus-visible:outline-offset-2
                  `}
                >
                  {/* Collection image tile — identical dimensions to category tiles */}
                  <div className="relative w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-[var(--BV-surface)] flex-shrink-0">
                    {imgSrc ? (
                      <FashionistarImage
                        src={imgSrc}
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

                  {/* Collection name */}
                  <p className="text-xs sm:text-sm font-semibold text-[var(--BV-ink)] leading-tight group-hover:text-[var(--BV-green)] transition-colors duration-200 line-clamp-2">
                    {item.title}
                  </p>

                  {/* Gold underline accent on hover — same as category tiles */}
                  <span
                    className="block h-0.5 w-0 group-hover:w-8 bg-[var(--BV-gold)] rounded-full transition-all duration-300"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--BV-border)] bg-[var(--BV-surface)] px-6 py-14 text-center">
          <p className="text-2xl font-bold text-[var(--BV-ink)]">Collections Will Appear Here Soon</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--BV-muted)] md:text-base">
            We only show live published collections on this surface. Once they are available, they
            will appear here automatically.
          </p>
        </div>
      )}

      {/* ── CTA Button ──────────────────────────────────────────────────────── */}
      {showCta && (
        <div className="flex justify-center mt-10">
          <Link
            href="/collections"
            className="btn-primary px-10 py-3 text-sm"
            aria-label="Browse all vendor collections"
          >
            See All Collections
          </Link>
        </div>
      )}
    </section>
  );
}
