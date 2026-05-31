"use client";

/**
 * @file ProductGrid.tsx
 * @description Client-side product grid with TanStack Query + infinite scroll.
 *
 * Usage:
 *   <ProductGrid params={{ category: "agbada", page: 1 }} />
 *   <ProductGrid params={{ category & sub_category : "summer-vibes", page: 1 }} pageSize={12} />
 */

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Package, Loader2 } from "lucide-react";
import { useProducts } from "../hooks/use-product";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductCardSkeleton";
import type { PaginatedProductList, ProductFilterParams } from "../types/product.types";


interface ProductGridProps {
  params?: ProductFilterParams;
  /** Optional server-prefetched data (dehydrated via TanStack prefetch). */
  initialData?: PaginatedProductList;
  /** Override number of skeleton cards during loading. */
  skeletonCount?: number;
  /** Items per page — default 12. */
  pageSize?: number;
  /** If true, show page X of Y text under controls. */
  showPageInfo?: boolean;
  /** Optional callback when page changes */
  onPageChange?: (page: number) => void;
}

export default function ProductGrid({
  params,
  initialData,
  skeletonCount = 12,
  pageSize = 12,
  showPageInfo = true,
  onPageChange,
}: ProductGridProps) {
  const [page, setPage] = useState<number>(params?.page ?? 1);

  const mergedParams: ProductFilterParams = {
    ...params,
    page,
    page_size: pageSize,
  };

  const { data, isLoading, isFetching, isError, error } = useProducts(
    mergedParams,
    initialData ? { initialData } : undefined,
  );

  const products = (data ?? initialData)?.results ?? [];
  const totalCount = data?.count ?? initialData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = useCallback(
    (next: number) => {
      if (next < 1 || next > totalPages) return;
      setPage(next);
      onPageChange?.(next);
      // Smooth scroll to the grid top on page change
      const el = document.getElementById("product-grid-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [totalPages, onPageChange]
  );

  // ── Loading (first fetch) ─────────────────────────────────────────────────
  if (isLoading && !initialData) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle size={48} className="text-destructive" />
        <p className="text-lg font-semibold text-foreground font-raleway">
          Unable to load products right now
        </p>
        <p className="text-sm text-muted-foreground max-w-sm font-raleway">
          {error instanceof Error ? error.message : "Please check your connection and try again."}
        </p>
        <button
          onClick={() => handlePageChange(1)}
          className="mt-2 px-6 py-2 rounded-full bg-[#01454A] text-white font-raleway text-sm font-semibold hover:bg-[#01454A]/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package size={48} className="text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground font-raleway">No products found</p>
        <p className="text-sm text-muted-foreground font-raleway">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  // ── Grid + Pagination ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Scroll anchor */}
      <div id="product-grid-anchor" className="-mt-4" aria-hidden="true" />

      {/* Re-fetch overlay — shows spinner over grid on page change */}
      <div className="relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#01454A]" size={36} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>

      {/* Pagination controls — shown only when there are multiple pages */}
      {totalPages > 1 && (
        <nav
          aria-label="Product page navigation"
          className="flex flex-col items-center gap-4"
        >
          {/* Page info */}
          {showPageInfo && (
            <p className="text-sm text-muted-foreground font-raleway">
              Page{" "}
              <span className="font-semibold text-foreground">{page}</span>
              {" "}of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
              {totalCount > 0 && (
                <>
                  {" "}·{" "}
                  <span className="font-semibold text-foreground">{totalCount}</span> products
                </>
              )}
            </p>
          )}

          {/* Prev / Page numbers / Next */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#01454A]/30 font-raleway text-sm font-semibold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {/* Page number buttons (up to 5 visible) */}
            {buildPageButtons(page, totalPages).map((item, idx) =>
              item === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground font-raleway">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  aria-label={`Go to page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => handlePageChange(item as number)}
                  className={
                    item === page
                      ? "w-9 h-9 rounded-full bg-[#01454A] text-white font-raleway text-sm font-bold shadow"
                      : "w-9 h-9 rounded-full border border-[#01454A]/30 text-[#01454A] font-raleway text-sm font-semibold hover:bg-[#01454A]/10 transition-colors"
                  }
                >
                  {item}
                </button>
              )
            )}

            {/* Next */}
            <button
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#01454A]/30 font-raleway text-sm font-semibold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build visible page button array with ellipsis
// e.g. page=5, total=12 → [1, "...", 4, 5, 6, "...", 12]
// ─────────────────────────────────────────────────────────────────────────────

function buildPageButtons(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
