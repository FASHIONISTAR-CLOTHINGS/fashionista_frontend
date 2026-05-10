"use client";

/**
 * @file /app/(home)/products/page.tsx
 * @description Fashionistar main product catalog listing page.
 *
 * Architecture:
 *   - URL state via Nuqs (useProductFilters) — all filters are bookmarkable
 *   - Server data via TanStack Query (useCatalogProducts hook)
 *   - Responsive: sidebar on desktop, bottom-sheet drawer on mobile
 *   - SEO: dynamic <title> + <meta> tags via useMetadata pattern
 *   - Accessible: ARIA landmarks, live regions for result count
 *
 * Data flow:
 *   URL params → useProductFilters → builds API query string
 *   → useCatalogProducts (TanStack Query) → ProductGrid
 */

import { Suspense, useState, useCallback } from "react";
import { useProductFilters } from "@/features/product/hooks/use-product-filters";
import ProductFilterPanel from "@/features/product/components/ProductFilterPanel";
import { SlidersHorizontal, X, PackageSearch, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalogProducts } from "@/features/catalog/hooks/use-catalog-products";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: CatalogProduct }) {
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.old_price!)) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PackageSearch size={40} className="text-muted-foreground/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.featured && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              Featured
            </span>
          )}
          {product.hot_deal && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              🔥 Hot
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Stock badge */}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        {product.brand_name && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            {product.brand_name}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug">
          {product.title}
        </h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-3 w-3 ${star <= Math.round(product.rating) ? "text-amber-400" : "text-muted-foreground/20"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-foreground">
            ₦{parseFloat(product.price).toLocaleString("en-NG")}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ₦{parseFloat(product.old_price!).toLocaleString("en-NG")}
            </span>
          )}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.sizes.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="rounded border border-border/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
              >
                {s.name}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[9px] text-muted-foreground">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Grid
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  old_price?: string | null;
  currency: string;
  image_url?: string | null;
  in_stock: boolean;
  featured: boolean;
  hot_deal: boolean;
  rating: number;
  review_count: number;
  brand_name?: string | null;
  sizes?: { id: string; name: string }[];
  colors?: { id: string; name: string; hex_code: string }[];
}

function ProductGrid({
  products,
  isLoading,
  isFetching,
}: {
  products: CatalogProduct[];
  isLoading: boolean;
  isFetching: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-muted/40">
            <div className="aspect-[4/5] w-full rounded-t-2xl bg-muted/60" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-16 rounded bg-muted/60" />
              <div className="h-4 w-full rounded bg-muted/60" />
              <div className="h-4 w-2/3 rounded bg-muted/60" />
              <div className="h-5 w-20 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch size={64} className="mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground">No products found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Loader2 size={11} className="animate-spin" />
          Updating…
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Controls
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onNext,
  onPrev,
}: {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="flex items-center gap-1.5 rounded-xl border border-border/40 px-4 py-2 text-sm font-medium transition-all hover:border-primary/40 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page <strong className="text-foreground">{page}</strong> of{" "}
        <strong className="text-foreground">{totalPages}</strong>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 rounded-xl border border-border/40 px-4 py-2 text-sm font-medium transition-all hover:border-primary/40 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

function CatalogPage() {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy,
    page,
    setPage,
    hasActiveFilters,
  } = useProductFilters();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isLoading, isFetching } = useCatalogProducts({
    page,
    q: search,
    category: category ?? undefined,
    brand: brand ?? undefined,
    min_price: minPrice > 0 ? String(minPrice) : undefined,
    max_price: maxPrice > 0 ? String(maxPrice) : undefined,
    ordering: sortBy ?? "-created_at",
    page_size: 24,
  });

  const products: CatalogProduct[] = data?.results ?? [];
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 24);

  const handleNext = useCallback(() => void setPage(page + 1), [page, setPage]);
  const handlePrev = useCallback(() => void setPage(Math.max(1, page - 1)), [page, setPage]);

  return (
    <>
      {/* SEO head (static — layout.tsx handles the base title) */}
      <main className="min-h-screen bg-background">
        {/* Page header */}
        <div className="border-b border-border/40 bg-card/60 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {search ? `Results for "${search}"` : category ? `${category}` : "All Products"}
            </h1>
            <p
              className="mt-1 text-sm text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading
                ? "Loading products…"
                : `${totalCount.toLocaleString()} product${totalCount !== 1 ? "s" : ""} found`}
            </p>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {search && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Search: {search}
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Category: {category}
                  </span>
                )}
                {brand && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Brand: {brand}
                  </span>
                )}
                {(minPrice > 0 || maxPrice > 0) && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    ₦{minPrice.toLocaleString()} — ₦{maxPrice.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {/* Sidebar — desktop only */}
            <div className="hidden lg:block">
              <ProductFilterPanel />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter button */}
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-border/40 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/30"
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="mobile-filter-drawer"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      •
                    </span>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  {totalCount.toLocaleString()} results
                </p>
              </div>

              <ProductGrid
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
          id="mobile-filter-drawer"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border/40 bg-card shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <ProductFilterPanel
              compact
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <CatalogPage />
    </Suspense>
  );
}
