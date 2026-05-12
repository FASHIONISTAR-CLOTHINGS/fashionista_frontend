"use client";

/**
 * @file ProductGrid.tsx
 * @description Client-side product grid with TanStack Query + infinite scroll.
 *
 * Usage:
 *   <ProductGrid params={{ category: "agbada", page: 1 }} />
 *
 * Data flow:
 *   useProducts(params) → apiAsync (Ky → Ninja /products/) → Zod parse → render
 */

import { useProducts } from "../hooks/use-product";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductCardSkeleton";
import { AlertTriangle, Package } from "lucide-react";
import type { PaginatedProductList } from "../types/product.types";

interface ProductGridProps {
  params?: Parameters<typeof useProducts>[0];
  /** Optional server-prefetched data (dehydrated via TanStack prefetch). */
  initialData?: PaginatedProductList;
  /** Override number of skeleton cards during loading. */
  skeletonCount?: number;
}

export default function ProductGrid({
  params,
  initialData,
  skeletonCount = 8,
}: ProductGridProps) {
  const { data, isLoading, isError, error } = useProducts(
    params,
    initialData ? { initialData } : undefined,
  );

  if (isLoading && !initialData) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle size={48} className="text-destructive" />
        <p className="text-lg font-semibold text-foreground">
          Unable to load products right now
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error instanceof Error ? error.message : "Please check your connection and try again."}
        </p>
      </div>
    );
  }

  const products = (data ?? initialData)?.results ?? [];

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package size={48} className="text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  );
}
