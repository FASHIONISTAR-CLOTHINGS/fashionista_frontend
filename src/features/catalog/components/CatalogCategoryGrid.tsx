/**
 * features/catalog/components/CatalogCategoryGrid.tsx
 *
 * RSC — Shop by Category grid section.
 * Migrated from next/image → FashionistarImage (Phase 2 overhaul).
 *
 * FashionistarImage handles:
 *   - Cloudinary publicId transforms (thumbnail preset: 300×300 object-contain)
 *   - /media/ backend URL passthrough with invalid-src guard
 *   - LQIP blur-up, IntersectionObserver lazy load, retry on error
 *   - Branded placeholder when no image available
 *
 * Mobile responsive: 2-col (mobile) → 3-col (tablet) → 4-col (desktop)
 * Touch targets: min 44×44px per Apple HIG / Material spec
 */

import Link from "next/link";

import { FashionistarImage } from "@/components/media";
import { getCatalogCategories } from "../api/catalog.server";
import type { HomepageCategoryCard } from "../types/catalog.types";

interface CatalogCategoryGridProps {
  /** Pre-fetched categories from HomepageBundle (avoids double-fetch). */
  categories?: HomepageCategoryCard[];
  limit?: number;
  showCta?: boolean;
}

export default async function CatalogCategoryGrid({
  categories: categoriesProp,
  limit,
  showCta = true,
}: CatalogCategoryGridProps) {
  // C1 fix: if caller passes bundle.categories, skip the internal fetch entirely.
  const categories = categoriesProp ?? (await getCatalogCategories());
  const items = limit ? categories.slice(0, limit) : categories;

  return (
    <section className="space-y-6 bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-bon_foyage text-[30px] text-[hsl(var(--foreground))] md:text-5xl">
          Shop by Category
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Explore fashion domains powered by Fashionistar catalog metadata.
        </p>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.slug}`}
              className="card-shadow card-shadow-hover group flex min-h-[165px] flex-col justify-between rounded-xl border border-border bg-card p-3 text-card-foreground transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:min-h-[245px] md:p-6"
              data-testid="category-card"
            >
              {/* Category image — FashionistarImage handles missing/invalid src gracefully */}
              <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-[hsl(var(--brand-cream))] md:h-32">
                <FashionistarImage
                  src={item.image_url || item.image || null}
                  alt={item.title}
                  width={96}
                  height={96}
                  transformation="thumbnail"
                  objectFit="contain"
                  sizes="(max-width: 768px) 56px, 96px"
                  imgClassName="h-14 w-14 object-contain md:h-20 md:w-20 group-hover:scale-105 transition-transform duration-300"
                  showBlurUp={false}
                  className="h-full w-full"
                />
              </div>

              {/* Category info */}
              <div className="mt-3 space-y-1.5">
                <span className="inline-flex rounded-full bg-[hsl(var(--accent)/0.14)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--accent))] md:px-3 md:py-1 md:text-xs">
                  Catalog
                </span>
                <p className="text-sm font-semibold leading-5 md:text-xl md:leading-7">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="font-bon_foyage text-3xl text-foreground">Categories Are Being Curated</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            We do not show placeholder categories here. Fresh catalog categories will appear as
            soon as they are published.
          </p>
        </div>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      {showCta ? (
        <div className="flex justify-center">
          <Link
            href="/categories"
            className="touch-target rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-[hsl(var(--brand-green-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:text-lg"
          >
            More Categories
          </Link>
        </div>
      ) : null}
    </section>
  );
}
