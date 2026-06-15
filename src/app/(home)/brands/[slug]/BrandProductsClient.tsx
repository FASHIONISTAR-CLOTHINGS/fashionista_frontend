"use client";

import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";
import { useBrandProducts } from "@/features/catalog";

interface BrandProductsClientProps {
  brandSlug: string;
}

function toProductCardItem(product: any): ProductListItem {
  return {
    ...product,
    is_discounted: product.is_discounted ?? false,
    discounted_price: product.discounted_price ?? null,
    cash_payment_mode: product.cash_payment_mode ?? false,
    brand_name: null,
    brand_slug: null,
    created_at: product.created_at ?? new Date(0).toISOString(),
  };
}

export default function BrandProductsClient({ brandSlug }: BrandProductsClientProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBrandProducts(brandSlug);

  const products = data?.pages.flatMap((page) => page.results).map(toProductCardItem) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <p className="font-bon_foyage text-3xl text-foreground">Products Are Temporarily Unavailable</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          We could not load this brand&apos;s product catalog just now. Please refresh and try again.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <p className="font-bon_foyage text-3xl text-foreground">No Live Products Yet</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          This brand does not have published products on the storefront right now. We are showing an honest empty state instead of a placeholder grid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="brand-products-client">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full bg-[#01454A] px-8 py-3 font-raleway text-sm font-bold text-white hover:bg-[#01454A]/90 transition-colors disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More Products"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
