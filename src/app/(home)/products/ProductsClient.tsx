"use client";

/**
 * @file /app/(home)/products/ProductsClient.tsx
 * @description Client component for the product catalog listing.
 *
 * Extracted from page.tsx to allow RSC-level generateMetadata for SEO.
 * All interactive logic (filters, sort, grid/list, infinite scroll) lives here.
 *
 * Architecture:
 *   - URL state via Nuqs (useProductFilters) — all filters are bookmarkable
 *   - Server data via TanStack Query (useCatalogProducts hook)
 *   - Canonical ProductCard component from @/components/commerce/ProductCard
 *   - Responsive: sidebar on desktop, bottom-sheet drawer on mobile
 *   - Dynamic result count & active filter chips with removable X
 *   - Sort dropdown synced to URL
 *   - Grid / List view toggle
 *   - Infinite scroll toggle with IntersectionObserver sentinel
 */

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useProductFilters } from "@/features/product/hooks/use-product-filters";
import ProductFilterPanel from "@/features/product/components/ProductFilterPanel";
import {
  SlidersHorizontal,
  X,
  PackageSearch,
  Loader2,
  LayoutGrid,
  LayoutList,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { useCatalogProducts, useInfiniteCatalogProducts } from "@/features/catalog/hooks/use-catalog-products";
import ProductCard, { type UnifiedProductCard } from "@/components/commerce/ProductCard";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/components/hooks/use-infinite-scroll";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { VisualSearchModal } from "@/features/catalog/components/VisualSearchModal";
import { Camera } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  old_price?: string | null;
  currency: string;
  image_url?: string | null;
  cloudinary_url?: string | null;
  in_stock: boolean;
  featured: boolean;
  hot_deal: boolean;
  rating: number;
  review_count: number;
  brand_name?: string | null;
  vendor_name?: string | null;
  vendor_slug?: string | null;
  requires_measurement?: boolean;
  is_pre_order?: boolean;
  discount_percentage?: number;
  stock_qty?: number;
  ai_trend_score?: number;
  gender_target?: string;
  condition?: string;
  sizes?: { id: string; name: string }[];
  colors?: { id: string; name: string; hex_code: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sort Options
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "price",       label: "Price: Low to High" },
  { value: "-price",      label: "Price: High to Low" },
  { value: "-rating",     label: "Highest Rated" },
  { value: "-orders_count", label: "Best Selling" },
  { value: "-ai_trend_score", label: "🔥 Trending Now" },
  { value: "best_value",  label: "⭐ Best Value" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Product Grid (skeleton + results)
// ─────────────────────────────────────────────────────────────────────────────

function ProductGrid({
  products,
  isLoading,
  isFetching,
  viewMode,
}: {
  products: CatalogProduct[];
  isLoading: boolean;
  isFetching: boolean;
  viewMode: "grid" | "list";
}) {
  const gridClass =
    viewMode === "list"
      ? "flex flex-col gap-3"
      : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden">
            <div className="shimmer aspect-[4/5] rounded-2xl bg-muted/40" />
            <div className="p-3 flex flex-col gap-2">
              <div className="shimmer h-2.5 w-20 rounded bg-muted/40" />
              <div className="shimmer h-3.5 w-full rounded bg-muted/40" />
              <div className="shimmer h-3 w-3/4 rounded bg-muted/40" />
              <div className="shimmer h-4 w-16 rounded mt-1 bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        <PackageSearch size={72} className="text-[#01454A]/20" />
        <div>
          <h3 className="text-xl font-semibold text-[#1A1208]">No products found</h3>
          <p className="mt-2 text-sm text-[#01454A]/60 max-w-xs mx-auto">
            Try adjusting your filters or search query. Browse our categories to discover more styles.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/categories"
            className="flex items-center gap-1.5 rounded-xl bg-[#01454A] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#01454A]/90 transition-colors min-h-[44px]"
          >
            Browse Categories <ChevronRight size={14} />
          </Link>
          <Link
            href="/collections"
            className="flex items-center gap-1.5 rounded-xl border border-[#01454A]/20 text-[#01454A] px-4 py-2.5 text-sm font-semibold hover:bg-[#01454A]/5 transition-colors min-h-[44px]"
          >
            View Collections <ChevronRight size={14} />
          </Link>
        </div>
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
      <div className={gridClass}>
        {products.map((product, idx) => {
          const card: UnifiedProductCard = {
            id: product.id,
            title: product.title,
            slug: product.slug,
            sku: product.id,
            price: product.price,
            old_price: product.old_price ?? null,
            discount_percentage: product.discount_percentage ?? 0,
            currency: product.currency ?? "NGN",
            image_url: product.image_url ?? null,
            cloudinary_url: product.cloudinary_url ?? null,
            in_stock: product.in_stock ?? true,
            stock_qty: product.stock_qty ?? 10,
            featured: product.featured ?? false,
            hot_deal: product.hot_deal ?? false,
            rating: product.rating ?? 0,
            review_count: product.review_count ?? 0,
            computed_review_count: product.review_count ?? 0,
            computed_avg_rating: product.rating ?? 0,
            category_name: null,
            category_slug: null,
            vendor_name: product.vendor_name ?? product.brand_name ?? "FASHIONISTAR",
            vendor_slug: product.vendor_slug ?? null,
            store_name: product.vendor_name ?? product.brand_name ?? "FASHIONISTAR",
            store_slug: product.vendor_slug ?? null,
            requires_measurement: product.requires_measurement ?? false,
            is_customisable: false,
            gender_target: product.gender_target ?? "",
            age_group: "",
            condition: product.condition ?? "new",
            is_pre_order: product.is_pre_order ?? false,
            orders_count: 0,
            views: 0,
            sizes: product.sizes ?? [],
            colors: product.colors ?? [],
            ai_trend_score: product.ai_trend_score,
          };
          return (
            <ProductCard
              key={product.id}
              card={card}
              index={idx + 1}
              priority={idx < 4}
              variant={viewMode === "list" ? "horizontal" : "default"}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active Filter Chip (removable)
// ─────────────────────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01454A]/10 px-3 py-1 text-xs font-medium text-[#01454A]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex-shrink-0 rounded-full hover:bg-[#01454A]/20 p-0.5 transition-colors"
      >
        <X size={10} />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sort Dropdown
// ─────────────────────────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-[#01454A]/20 bg-white px-3 py-2 text-xs font-medium text-[#01454A] hover:border-[#01454A]/40 transition-colors min-h-[36px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ArrowUpDown size={13} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">Sort</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-[#01454A]/10 bg-white shadow-xl overflow-hidden"
          role="listbox"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#01454A]/5 ${
                value === opt.value ? "font-semibold text-[#01454A] bg-[#01454A]/5" : "text-[#1A1208]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Catalog Page (client component — uses Nuqs + TanStack Query)
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
    setSearch,
    setCategory,
    setBrand,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    setPage,
    resetFilters,
  } = useProductFilters();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);

  // Count active filters for badge
  const activeFilterCount = [
    !!search,
    !!category,
    !!brand,
    minPrice > 0,
    maxPrice > 0 && maxPrice < 500_000,
  ].filter(Boolean).length;

  const { data, isLoading, isFetching } = useCatalogProducts({
    page,
    q: search || undefined,
    category: category || undefined,
    brand: brand || undefined,
    min_price: minPrice > 0 ? String(minPrice) : undefined,
    max_price: maxPrice > 0 && maxPrice < 500_000 ? String(maxPrice) : undefined,
    ordering: sortBy ?? "-created_at",
    page_size: 24,
  });

  const infiniteQuery = useInfiniteCatalogProducts({
    q: search || undefined,
    category: category || undefined,
    brand: brand || undefined,
    min_price: minPrice > 0 ? String(minPrice) : undefined,
    max_price: maxPrice > 0 && maxPrice < 500_000 ? String(maxPrice) : undefined,
    ordering: sortBy ?? "-created_at",
    page_size: 24,
  });

  const infiniteProducts: CatalogProduct[] =
    infiniteQuery.data?.pages.flatMap((p) => p.results) as CatalogProduct[] ?? [];
  const infiniteTotalCount = infiniteQuery.data?.pages[0]?.count ?? 0;

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => infiniteQuery.fetchNextPage(),
    hasMore: !!infiniteQuery.hasNextPage,
    isLoading: infiniteQuery.isFetchingNextPage,
    disabled: !infiniteScroll,
    rootMargin: "300px",
  });

  const products: CatalogProduct[] = infiniteScroll
    ? infiniteProducts
    : ((data?.results ?? []) as CatalogProduct[]);
  const totalCount: number = infiniteScroll ? infiniteTotalCount : (data?.count ?? 0);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Newest First";

  const handleSortChange = useCallback(
    (val: string) => {
      void setSortBy(val);
      void setPage(1);
    },
    [setSortBy, setPage],
  );

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav className="mx-auto max-w-screen-2xl px-4 pt-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-[#01454A]/60">
            <li><Link href="/" className="hover:text-[#01454A] transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-[#01454A] font-medium">Products</li>
          </ol>
        </nav>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="border-b border-[#01454A]/10 bg-[#F8F5ED]/60 px-4 py-6 sm:px-6 lg:px-8 mt-4">
          <div className="mx-auto max-w-screen-2xl">
            <h1 className="text-2xl font-bold text-[#1A1208] sm:text-3xl">
              {search
                ? `Results for "${search}"`
                : category
                ? `${category}`
                : "All Products"}
            </h1>
            <p
              className="mt-1 text-sm text-[#01454A]/60"
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading
                ? "Loading products…"
                : `${totalCount.toLocaleString()} product${totalCount !== 1 ? "s" : ""} found · Sorted by: ${currentSortLabel}`}
            </p>

            {/* Active filter chips — removable */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {search && (
                  <FilterChip label={`Search: ${search}`} onRemove={() => { void setSearch(null); void setPage(1); }} />
                )}
                {category && (
                  <FilterChip label={`Category: ${category}`} onRemove={() => { void setCategory(null); void setPage(1); }} />
                )}
                {brand && (
                  <FilterChip label={`Brand: ${brand}`} onRemove={() => { void setBrand(null); void setPage(1); }} />
                )}
                {(minPrice > 0 || (maxPrice > 0 && maxPrice < 500_000)) && (
                  <FilterChip
                    label={`${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`}
                    onRemove={() => { void setMinPrice(null); void setMaxPrice(null); void setPage(1); }}
                  />
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#01454A]/60 underline underline-offset-2 hover:text-[#01454A] transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {/* Sidebar — desktop only */}
            <div className="hidden lg:block flex-shrink-0">
              <ProductFilterPanel />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar: mobile filter + sort + view toggle */}
              <div className="mb-4 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  {/* Work 5: Visual Search button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVisualSearchOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-[#01454A]/20 px-3 py-2 text-sm font-medium hover:border-[#01454A]/40 hover:bg-[#01454A]/5 h-auto"
                    aria-label="Search by image"
                    data-testid="visual-search-btn"
                  >
                    <Camera size={15} />
                    <span className="hidden sm:inline">Visual Search</span>
                  </Button>

                  {/* Mobile filter button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-[#01454A]/20 px-4 py-2 text-sm font-medium hover:border-[#01454A]/40 hover:bg-[#01454A]/5 h-auto lg:hidden"
                    aria-expanded={mobileFiltersOpen}
                    aria-controls="mobile-filter-drawer"
                    data-testid="mobile-filter-btn"
                  >
                    <SlidersHorizontal size={15} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#01454A] text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Right-side toolbar */}
                <div className="ml-auto flex items-center gap-2">
                  <p className="hidden sm:block text-xs text-[#01454A]/60">
                    {totalCount.toLocaleString()} results
                  </p>

                  {/* Sort dropdown */}
                  <SortDropdown value={sortBy ?? "-created_at"} onChange={handleSortChange} />

                  {/* View mode toggle */}
                  <div className="flex items-center rounded-xl border border-[#01454A]/20 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                      aria-pressed={viewMode === "grid"}
                      className={`p-2.5 transition-colors min-h-[36px] ${
                        viewMode === "grid"
                          ? "bg-[#01454A] text-white"
                          : "text-[#01454A]/60 hover:bg-[#01454A]/5"
                      }`}
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                      aria-pressed={viewMode === "list"}
                      className={`p-2.5 transition-colors min-h-[36px] ${
                        viewMode === "list"
                          ? "bg-[#01454A] text-white"
                          : "text-[#01454A]/60 hover:bg-[#01454A]/5"
                      }`}
                    >
                      <LayoutList size={14} />
                    </button>
                  </div>

                  {/* Infinite scroll toggle */}
                  <button
                    type="button"
                    onClick={() => setInfiniteScroll((v) => !v)}
                    aria-pressed={infiniteScroll}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors min-h-[36px] ${
                      infiniteScroll
                        ? "border-[#FDA600] bg-[#FDA600]/10 text-[#1A1208]"
                        : "border-[#01454A]/20 bg-white text-[#01454A]/60 hover:border-[#01454A]/40"
                    }`}
                    data-testid="infinite-scroll-toggle"
                  >
                    <Loader2 size={13} className={infiniteScroll ? "animate-spin" : ""} />
                    {infiniteScroll ? "Infinite" : "Pages"}
                  </button>
                </div>
              </div>

              <ProductGrid
                products={products}
                isLoading={isLoading || (infiniteScroll && infiniteQuery.isLoading)}
                isFetching={isFetching || (infiniteScroll && infiniteQuery.isFetching)}
                viewMode={viewMode}
              />

              {/* Infinite scroll sentinel */}
              {infiniteScroll && products.length > 0 && (
                <>
                  <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-8"
                    aria-hidden="true"
                  >
                    {infiniteQuery.isFetchingNextPage && (
                      <div className="flex items-center gap-2 text-sm text-[#01454A]/60">
                        <Loader2 size={16} className="animate-spin" />
                        Loading more products…
                      </div>
                    )}
                  </div>
                  {!infiniteQuery.hasNextPage && products.length > 0 && (
                    <p className="text-center py-6 text-xs text-[#01454A]/40">
                      You&apos;ve reached the end — {totalCount.toLocaleString()} products total
                    </p>
                  )}
                </>
              )}

              {/* Pagination — only shown when not in infinite scroll mode */}
              {!infiniteScroll && (
                <FashionistarPagination
                  currentPage={page}
                  totalCount={totalCount}
                  pageSize={24}
                  baseHref="/products"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile filter drawer ──────────────────────────────────────── */}
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
            className="absolute inset-0 bg-[#1A1208]/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-[#01454A]/10 bg-card shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#01454A]/10 bg-card px-4 py-3">
              <span className="font-semibold text-[#1A1208]">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#01454A] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-[#01454A]/60 hover:bg-[#01454A]/5 hover:text-[#01454A] h-auto w-auto"
                aria-label="Close filters"
              >
                <X size={18} />
              </Button>
            </div>
            <ProductFilterPanel compact onClose={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Work 5: Visual Search Modal ──────────────────────────────── */}
      <VisualSearchModal
        isOpen={visualSearchOpen}
        onClose={() => setVisualSearchOpen(false)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export (Suspense wraps Nuqs + TanStack Query contexts)
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#01454A]" />
        </div>
      }
    >
      <CatalogPage />
    </Suspense>
  );
}
