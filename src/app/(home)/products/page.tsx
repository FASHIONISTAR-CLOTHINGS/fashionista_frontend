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

import { Suspense, useState } from "react";
import { useProductFilters } from "@/features/product/hooks/use-product-filters";
import { useToggleWishlist } from "@/features/product/hooks/use-product";
import { useWishlistItemIds } from "@/features/client/hooks/use-client-wishlist";
import ProductFilterPanel from "@/features/product/components/ProductFilterPanel";
import { SlidersHorizontal, X, PackageSearch, Loader2, Heart, ShoppingBag } from "lucide-react";
import { useCatalogProducts } from "@/features/catalog/hooks/use-catalog-products";
import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Premium Product Card (mirrors shared ProductCard design — brand tokens)
// ─────────────────────────────────────────────────────────────────────────────

function CatalogProductCard({ product, index = 1 }: { product: CatalogProduct; index?: number }) {
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.old_price!)) * 100)
    : 0;
  const { mutate: toggleWishlist, isPending: wishlistLoading } = useToggleWishlist();
  const wishlistIds = useWishlistItemIds();
  const isWishlisted = wishlistIds.has(product.id) || wishlistIds.has(product.slug);

  const [addedToCart, setAddedToCart] = useState(false);

  const handleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.slug);
  };

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const staggerClass = `stagger-${Math.min(index, 12)}`;

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer product-card-glass animate-card-enter ${staggerClass}`}
      aria-label={`Product: ${product.title}`}
    >
      {/* ── Image Container ─────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden"
        aria-label={`View ${product.title}`}
        prefetch={false}
      >
        {/* 4:5 aspect ratio — fashion industry standard */}
        <div className="relative w-full aspect-[4/5] bg-[#F8F5ED]">
          {product.image_url ? (
            <FashionistarImage
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              imgClassName="transition-transform duration-500 group-hover:scale-105 object-cover object-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#F8F5ED] to-[#01454A]/5">
              <PackageSearch size={40} className="text-[#01454A]/20" />
            </div>
          )}

          {/* Glimmer sweep on mount */}
          <div className="glimmer-overlay" aria-hidden="true" />

          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1208]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* ── Badges (top-left) ─────────────────────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase bg-[#01454A] text-white font-bold animate-card-pop">
              Featured
            </span>
          )}
          {product.hot_deal && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase bg-red-500 text-white font-bold animate-card-pop">
              🔥 Hot
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase bg-[#FDA600] text-[#1A1208] font-bold animate-card-pop">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* ── Out-of-stock overlay ──────────────────────────────────────── */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-[#1A1208]/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-white/90 text-[#1A1208] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* ── Wishlist button (top-right) ───────────────────────────────── */}
        <button
          type="button"
          data-testid="wishlist-btn"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60 ${
            isWishlisted
              ? "bg-[#FDA600] text-[#1A1208] shadow-lg"
              : "bg-white/80 text-[#01454A] backdrop-blur-sm hover:bg-white"
          }`}
        >
          {wishlistLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          )}
        </button>

        {/* ── Quick-add (appears on hover) ──────────────────────────────── */}
        {product.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                addedToCart
                  ? "bg-[#01454A] text-white"
                  : "bg-[#FDA600] text-[#1A1208] hover:bg-[#e09500]"
              }`}
            >
              {addedToCart ? "✓ Added!" : (
                <>
                  <ShoppingBag size={15} />
                  Quick Add
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* ── Card Body ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col gap-1.5 p-3 flex-1"
        aria-label={`View details for ${product.title}`}
        prefetch={false}
      >
        {/* Brand name */}
        {product.brand_name && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#01454A] truncate">
            {product.brand_name}
          </p>
        )}

        {/* Product title */}
        <h3 className="text-sm font-semibold text-[#1A1208] line-clamp-2 leading-snug group-hover:text-[#01454A] transition-colors duration-200">
          {product.title}
        </h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-3 w-3 ${star <= Math.round(product.rating) ? "text-[#FDA600]" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-[#01454A]/60">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-[#FDA600]">
            ₦{parseFloat(product.price).toLocaleString("en-NG")}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#01454A]/50 line-through">
              ₦{parseFloat(product.old_price!).toLocaleString("en-NG")}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.id}
                className="color-swatch"
                style={{ backgroundColor: c.hex_code }}
                title={c.name}
                aria-label={`Color: ${c.name}`}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[9px] text-[#01454A]/60">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Size chips */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.sizes.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border border-[#01454A]/20 text-[#01454A]/70 bg-white/70"
              >
                {s.name}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[9px] text-[#01454A]/60">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}
      </Link>
    </article>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden">
            <div className="shimmer aspect-[4/5] rounded-2xl" />
            <div className="p-3 flex flex-col gap-2">
              <div className="shimmer h-2.5 w-20 rounded" />
              <div className="shimmer h-3.5 w-full rounded" />
              <div className="shimmer h-3 w-3/4 rounded" />
              <div className="shimmer h-4 w-16 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch size={64} className="mb-4 text-[#01454A]/20" />
        <h3 className="text-lg font-semibold text-[#1A1208]">No products found</h3>
        <p className="mt-1 text-sm text-[#01454A]/60">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-full bg-[#01454A]/10 px-3 py-1 text-xs font-medium text-[#01454A] z-10">
          <Loader2 size={11} className="animate-spin" />
          Updating…
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, idx) => (
          <CatalogProductCard key={product.id} product={product} index={idx + 1} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Controls
// ─────────────────────────────────────────────────────────────────────────────

// Unused Pagination component replaced by global FashionistarPagination

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

  return (
    <>
      {/* SEO head (static — layout.tsx handles the base title) */}
      <main className="min-h-screen bg-background">
        {/* Page header */}
        <div className="border-b border-[#01454A]/10 bg-[#F8F5ED]/60 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl">
            <h1 className="text-2xl font-bold text-[#1A1208] sm:text-3xl">
              {search ? `Results for "${search}"` : category ? `${category}` : "All Products"}
            </h1>
            <p
              className="mt-1 text-sm text-[#01454A]/60"
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
                  <span className="flex items-center gap-1 rounded-full bg-[#01454A]/10 px-3 py-1 text-xs font-medium text-[#01454A]">
                    Search: {search}
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1 rounded-full bg-[#01454A]/10 px-3 py-1 text-xs font-medium text-[#01454A]">
                    Category: {category}
                  </span>
                )}
                {brand && (
                  <span className="flex items-center gap-1 rounded-full bg-[#01454A]/10 px-3 py-1 text-xs font-medium text-[#01454A]">
                    Brand: {brand}
                  </span>
                )}
                {(minPrice > 0 || maxPrice > 0) && (
                  <span className="flex items-center gap-1 rounded-full bg-[#FDA600]/20 px-3 py-1 text-xs font-medium text-[#1A1208]">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-border/40 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/30 h-auto"
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
                </Button>
                <p className="text-xs text-muted-foreground">
                  {totalCount.toLocaleString()} results
                </p>
              </div>

              <ProductGrid
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
              />

              <FashionistarPagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={24}
                baseHref="/products"
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground h-auto w-auto"
              >
                <X size={18} />
              </Button>
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
