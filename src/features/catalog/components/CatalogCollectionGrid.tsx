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
 *
 * Palette: mirrors the Category section — cream/white background, forest-green
 * text accents, gold highlights. NO dark/black backgrounds.
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
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCollectionGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="section-wrapper bg-[var(--BV-cream)]/40" aria-busy="true">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-3 w-24 rounded mb-2" />
          <div className="shimmer h-8 w-56 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-[#01454A]/10">
            <div className="shimmer aspect-[4/3]" />
            <div className="p-4 flex flex-col gap-2 bg-white">
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
      className="section-wrapper bg-[var(--BV-cream)]/40"
      aria-labelledby="collections-heading"
      id="latest-collections"
    >
      {/* ── Section Header (light version — mirrors Category section) ──────── */}
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
            className="text-sm font-semibold text-[#01454A] hover:text-[#012e31] underline underline-offset-4 decoration-[#FDA600] transition-colors duration-200 whitespace-nowrap"
            aria-label="View all vendor collections"
          >
            All collections →
          </Link>
        )}
      </div>

      {collections.length > 0 ? (
        <>
          {/* ── Collection filter nav — horizontally scrollable on mobile ─── */}
          {navItems.length > 1 && (
            <div className="overflow-x-auto scroll-hide -mx-5 px-5 mb-8 sm:mx-0 sm:px-0">
              <nav
                className="flex items-center gap-2 pb-1 min-w-max md:flex-wrap md:min-w-0"
                aria-label="Collection filters"
              >
                <Link
                  href="/"
                  scroll={false}
                  className={`touch-target rounded-full border border-[#01454A] px-5 py-2 text-sm font-semibold whitespace-nowrap transition md:px-6 md:py-3 ${
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
                    className={`touch-target rounded-full border border-[#01454A] px-5 py-2 text-sm font-semibold whitespace-nowrap transition md:px-6 md:py-3 ${
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

          {/* ── Collection cards grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              const imgSrc = resolveCollectionImage(item);
              const staggerDelay = idx < 6 ? `stagger-${idx + 1}` : "";
              return (
                <Link
                  key={item.id}
                  href={`/collections/${item.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#01454A]/10 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-card-enter ${staggerDelay}`}
                  data-testid="collection-card"
                >
                  {/* Collection image */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#F8F5ED]">
                    {imgSrc ? (
                      <FashionistarImage
                        src={imgSrc}
                        alt={item.title}
                        fill
                        transformation="card"
                        objectFit="contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        imgClassName="p-6 group-hover:scale-105 transition-transform duration-500 object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl opacity-20" aria-hidden="true">👗</span>
                      </div>
                    )}
                    {/* Hover gradient overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#01454A]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Collection info */}
                  <div className="flex flex-col gap-1.5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDA600]">
                      {item.sub_title || "Fashionistar Collection"}
                    </p>
                    <h3 className="text-lg font-semibold text-[#1A1208] leading-snug group-hover:text-[#01454A] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[#01454A]/60">
                      {item.description ||
                        "A curated collection for precise fit and modern fashion commerce."}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#01454A]">
                      <span>Explore collection</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#01454A]/20 bg-[#F8F5ED]/60 px-6 py-14 text-center">
          <p className="font-bon_foyage text-3xl text-[#01454A]">
            Collections Will Appear Here Soon
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#01454A]/60 md:text-base">
            We only show live published collections on this surface. Once they are available, they
            will appear here automatically.
          </p>
        </div>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      {showCta && (
        <div className="flex justify-center mt-8">
          <Link
            href="/collections"
            className="touch-target rounded-full bg-[#01454A] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#012e31] focus-visible:ring-2 focus-visible:ring-[#FDA600] md:text-lg"
          >
            See All Collections
          </Link>
        </div>
      )}
    </section>
  );
}
