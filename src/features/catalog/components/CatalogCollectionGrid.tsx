/**
 * features/catalog/components/CatalogCollectionGrid.tsx
 * CatalogCollectionGrid.tsx — Premium 2026 Edition
 *
 * RSC — "Latest Collections" hero grid.
 * Uses cloudinary_url (CDN w_800 fill) with image_url fallback.
 * Parallax-style scale + translate hover transform on collection hero images.
 * Staggered card-enter animation on mount — no Framer Motion.
 *
 * Taxonomy note: COLLECTIONS are for VENDORS.
 * Vendors join collections to signal the fashion categories they specialise in.
 * A collection groups vendors — not products.
 *
 * Grid: 1-col mobile → 2-col tablet → 3-col desktop
 */

import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import { getCatalogCollections } from "../api/catalog.server";
import type { HomepageCollectionCard } from "../types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveCollectionImage(item: HomepageCollectionCard): string | null {
  // Prefer Cloudinary URL (CDN-optimised, w_800)
  const candidates = [item.cloudinary_url, item.image_url, item.image];
  for (const c of candidates) {
    if (c && !c.endsWith("/media/None") && !c.endsWith("/media/null") && c !== "null") {
      return c;
    }
  }
  return null;
}

function resolveBackgroundImage(item: HomepageCollectionCard): string | null {
  // Use background as a secondary hero image if present
  if (item.background_image_url && !item.background_image_url.endsWith("/media/None")) {
    return item.background_image_url;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCollectionGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="section-wrapper bg-[var(--BV-ink)]" aria-busy="true">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-3 w-24 rounded mb-2" />
          <div className="shimmer h-8 w-56 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="shimmer aspect-[4/3]" />
            <div className="p-4 flex flex-col gap-2">
              <div className="shimmer h-3 w-20 rounded" />
              <div className="shimmer h-5 w-full rounded" />
              <div className="shimmer h-3 w-3/4 rounded" />
            </div>
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
      className="section-wrapper bg-[var(--BV-ink)]"
      aria-labelledby="collections-heading"
      id="latest-collections"
    >
      {/* ── Section Header (dark version) ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 animate-slide-up gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Vendor Collections
          </p>
          <h2
            id="collections-heading"
            className="section-title text-[var(--BV-cream)]"
          >
            Latest Collections
          </h2>
          <p className="mt-1 text-sm text-[var(--BV-cream)]/60 max-w-md">
            Curated vendor drops — ready-to-wear, custom tailoring, and premium showcases.
          </p>
        </div>
        {showCta && (
          <Link
            href="/collections"
            className="text-sm font-semibold text-[var(--BV-gold)] hover:text-[var(--BV-gold-dark)] underline underline-offset-4 transition-colors duration-200 whitespace-nowrap"
            aria-label="View all vendor collections"
          >
            All collections →
          </Link>
        )}
      </div>

      {collections.length > 0 ? (
        <>
          {/* ── Filter Pills ─────────────────────────────────────────────── */}
          {navItems.length > 1 && (
            <div className="overflow-x-auto scroll-hide -mx-5 px-5 mb-8 sm:mx-0 sm:px-0">
              <nav
                className="flex items-center gap-2 pb-1 min-w-max sm:flex-wrap sm:min-w-0"
                aria-label="Filter by collection"
              >
                <Link
                  href="/"
                  scroll={false}
                  className={`
                    touch-target rounded-full border px-5 py-2 text-sm font-semibold
                    whitespace-nowrap transition-all duration-200
                    ${!selectedCollection
                      ? "bg-[var(--BV-gold)] border-[var(--BV-gold)] text-[var(--BV-ink)]"
                      : "border-[var(--BV-gold)]/40 text-[var(--BV-gold)] hover:bg-[var(--BV-gold)] hover:text-[var(--BV-ink)]"
                    }
                  `}
                >
                  All
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/?collection=${item.slug}`}
                    scroll={false}
                    className={`
                      touch-target rounded-full border px-5 py-2 text-sm font-semibold
                      whitespace-nowrap transition-all duration-200
                      ${selectedCollection === item.slug
                        ? "bg-[var(--BV-gold)] border-[var(--BV-gold)] text-[var(--BV-ink)]"
                        : "border-[var(--BV-gold)]/40 text-[var(--BV-gold)] hover:bg-[var(--BV-gold)] hover:text-[var(--BV-ink)]"
                      }
                    `}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* ── Collection Cards ─────────────────────────────────────────── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            role="list"
            aria-label="Vendor collections"
          >
            {items.map((item, idx) => {
              const heroSrc = resolveCollectionImage(item);
              const bgSrc = resolveBackgroundImage(item);
              const staggerClass = `stagger-${Math.min(idx + 1, 12)}`;

              return (
                <Link
                  key={item.id}
                  href={`/collections/${item.slug}`}
                  role="listitem"
                  data-testid="collection-card"
                  aria-label={`View ${item.title} collection`}
                  className={`
                    group relative overflow-hidden rounded-2xl cursor-pointer
                    animate-card-enter ${staggerClass}
                    border border-white/5 hover:border-[var(--BV-gold)]/30
                    transition-all duration-300
                    shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-[var(--BV-gold)]/10
                    hover:-translate-y-2
                  `}
                >
                  {/* Hero image — 4:3 aspect ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--BV-ink)]">
                    {heroSrc ? (
                      <FashionistarImage
                        src={heroSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                    ) : bgSrc ? (
                      <FashionistarImage
                        src={bgSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 opacity-60"
                      />
                    ) : (
                      /* Brand gradient fallback */
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--BV-green)] to-[var(--BV-ink)]" />
                    )}

                    {/* Gradient vignette over image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--BV-ink)] via-[var(--BV-ink)]/20 to-transparent" />

                    {/* Gold "Collection" badge */}
                    <span className="absolute top-4 right-4 bg-[var(--BV-gold)] text-[var(--BV-ink)] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-card-pop">
                      Collection
                    </span>

                    {/* Glimmer sweep on mount */}
                    <div className="glimmer-overlay" aria-hidden="true" />
                  </div>

                  {/* Card body */}
                  <div className="relative bg-[var(--BV-ink)] p-5 space-y-2">
                    {/* Sub-title / editorial label */}
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)]">
                      {item.sub_title || "Fashionistar Edit"}
                    </p>

                    {/* Collection title */}
                    <h3 className="text-lg font-semibold text-[var(--BV-cream)] leading-snug group-hover:text-white transition-colors duration-200">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-[var(--BV-cream)]/60 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Explore CTA */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-sm font-semibold text-[var(--BV-gold)] group-hover:text-[var(--BV-gold-dark)] transition-colors">
                        Explore
                      </span>
                      <svg
                        className="w-4 h-4 text-[var(--BV-gold)] transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
          <p className="text-2xl font-bold text-[var(--BV-cream)]">Collections Coming Soon</p>
          <p className="mt-2 text-sm text-[var(--BV-cream)]/50 max-w-sm mx-auto">
            Vendor collections will appear here once they are published and live.
          </p>
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {showCta && collections.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/collections"
            className="btn-gold px-10 py-3 text-sm"
            aria-label="Browse all vendor collections"
          >
            See All Collections
          </Link>
        </div>
      )}
    </section>
  );
}
