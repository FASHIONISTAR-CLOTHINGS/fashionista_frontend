/**
 * features/catalog/components/CatalogCollectionGrid.tsx
 *
 * RSC — Latest Collections grid section.
 * Migrated from next/image → FashionistarImage (Phase 2 overhaul).
 *
 * Fixes:
 *   - next/image fill replaced with FashionistarImage fill (absolute inset-0 pattern)
 *   - Mobile filter nav wrapped in overflow-x-auto scroll-hide to prevent horizontal overflow
 *   - Touch targets min 44×44px on filter pills
 *   - Proper image_url null handling via FashionistarImage isInvalidSrc guard
 *
 * Mobile: single column → 2-col tablet → 3-col desktop
 */

import Link from "next/link";

import { FashionistarImage } from "@/components/media";
import { getCatalogCollections } from "../api/catalog.server";
import type { HomepageCollectionCard } from "../types/catalog.types";

interface CatalogCollectionGridProps {
  /** Pre-fetched collections from HomepageBundle (avoids double-fetch). */
  collections?: HomepageCollectionCard[];
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
  limit?: number;
  showCta?: boolean;
}

export default async function CatalogCollectionGrid({
  collections: collectionsProp,
  searchParams,
  limit,
  showCta = true,
}: CatalogCollectionGridProps) {
  const resolvedParams = await Promise.resolve(searchParams ?? {});
  const selectedCollection =
    typeof resolvedParams.collection === "string" ? resolvedParams.collection : "";

  // C1 fix: use prop when provided (bundle flow), otherwise fetch standalone.
  const collections = collectionsProp ?? (await getCatalogCollections());
  const baseItems = collections;
  const filteredItems = selectedCollection
    ? baseItems.filter((item) => item.slug === selectedCollection)
    : baseItems;
  const items = (filteredItems.length ? filteredItems : baseItems).slice(
    0,
    limit,
  );
  // Show up to 6 nav pills for collection filtering
  const navItems = baseItems.slice(0, 6);

  return (
    <section className="space-y-6 bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-bon_foyage text-[30px] text-[hsl(var(--foreground))] md:text-5xl">
          Latest Collections
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Curated drops for ready-to-wear, custom tailoring, and premium vendor showcases.
        </p>
      </div>

      {baseItems.length > 0 ? (
        <>
          {/* ── Collection filter nav — horizontally scrollable on mobile ── */}
          <div className="overflow-x-auto scroll-hide -mx-5 px-5 md:mx-0 md:px-0">
            <nav
              className="flex items-center gap-2 pb-1 min-w-max md:flex-wrap md:min-w-0"
              aria-label="Collection filters"
            >
              <Link
                href="/"
                scroll={false}
                className={`touch-target rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold whitespace-nowrap transition md:px-6 md:py-3 ${
                  !selectedCollection
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                    : "text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                }`}
              >
                All
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/?collection=${item.slug}`}
                  scroll={false}
                  className={`touch-target rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold whitespace-nowrap transition md:px-6 md:py-3 ${
                    selectedCollection === item.slug
                      ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                      : "text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Collection cards grid ───────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/collections/${item.slug}`}
                className="card-shadow card-shadow-hover group overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1"
                data-testid="collection-card"
              >
                {/* Collection image container — FashionistarImage with fill */}
                <div className="relative h-56 w-full overflow-hidden bg-[hsl(var(--brand-cream))]">
                  <FashionistarImage
                    src={item.image_url || item.image || null}
                    alt={item.title}
                    fill
                    transformation="card"
                    objectFit="contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent-foreground))]">
                    Featured
                  </span>
                </div>

                {/* Collection info */}
                <div className="space-y-2 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                    {item.sub_title || "Fashionistar edit"}
                  </p>
                  <h3 className="text-xl font-semibold leading-7">{item.title}</h3>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {item.description ||
                      "A curated collection for precise fit and modern fashion commerce."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="font-bon_foyage text-3xl text-foreground">
            Collections Will Appear Here Soon
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            We only show live published collections on this surface. Once they are available, they
            will appear here automatically.
          </p>
        </div>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      {showCta ? (
        <div className="flex justify-center">
          <Link
            href="/collections"
            className="touch-target rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-[hsl(var(--brand-green-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:text-lg"
          >
            See All
          </Link>
        </div>
      ) : null}
    </section>
  );
}
