"use client";

/**
 * @file RelatedProductsCarousel.tsx
 * @description "You May Also Like" carousel for the Product Detail Page.
 * Fetches same-category products, excludes current product, renders snap-scroll rail.
 */

import Link from "next/link";
import { useCatalogProducts } from "@/features/catalog/hooks/use-catalog-products";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Star } from "lucide-react";

interface RelatedProductsCarouselProps {
  currentSlug: string;
  categorySlug: string | null | undefined;
  categoryName?: string | null;
}

function RelatedCardSkeleton() {
  return (
    <div className="shrink-0 w-44 md:w-52 animate-pulse">
      <div className="h-56 w-full rounded-2xl bg-muted mb-2" />
      <div className="h-3 w-32 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export function RelatedProductsCarousel({
  currentSlug,
  categorySlug,
  categoryName,
}: RelatedProductsCarouselProps) {
  const { data, isLoading } = useCatalogProducts(
    categorySlug ? { category: categorySlug, page_size: 10 } : { page_size: 10 },
  );

  const related = (data?.results ?? [])
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 8);

  if (!isLoading && related.length < 2) return null;

  return (
    <section className="mt-16" aria-labelledby="related-products-heading">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FDA600] mb-1">
            Curated For You
          </p>
          <h2 id="related-products-heading" className="font-bon_foyage text-3xl text-foreground">
            You May Also Like
          </h2>
          {categoryName && (
            <p className="text-sm text-muted-foreground mt-0.5">More from {categoryName}</p>
          )}
        </div>
        {categorySlug && (
          <Link
            href={`/categories/${categorySlug}`}
            className="text-xs font-semibold text-[#01454A] underline underline-offset-4 decoration-[#FDA600] hover:opacity-80 transition whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
        role="list"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <RelatedCardSkeleton key={i} />)
          : related.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                role="listitem"
                className="group shrink-0 w-44 md:w-52 snap-start rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-56 w-full overflow-hidden bg-muted">
                  <FashionistarImage
                    src={p.image_url ?? null}
                    alt={p.title}
                    fill
                    sizes="208px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDA600] shadow-lg">
                      <ShoppingBag size={14} className="text-black" />
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  {p.vendor_name && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#01454A] truncate">
                      {p.vendor_name}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-[#01454A] transition-colors">
                    {p.title}
                  </p>
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={9} fill="hsl(var(--accent))" stroke="hsl(var(--accent))" />
                      <span className="text-[10px] text-muted-foreground">
                        {(p.computed_avg_rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {formatCurrency(parseFloat(p.price ?? "0"), p.currency ?? "NGN")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
