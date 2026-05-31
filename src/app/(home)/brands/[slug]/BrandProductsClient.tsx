"use client";

import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";
import { useBrandProducts } from "@/features/catalog";

interface BrandProductsClientProps {
  brandSlug: string;
}

function toProductCardItem(product: {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: string;
  old_price: string | null;
  discount_percentage: number;
  currency: string;
  image_url: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  digital: boolean;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  category_name: string | null;
  category_slug: string | null;
  vendor_name: string;
  vendor_slug: string | null;
  requires_measurement: boolean;
  is_customisable: boolean;
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hex_code: string }[];
  created_at: string | null;
}): ProductListItem {
  return {
    ...product,
    brand_name: null,
    brand_slug: null,
    vendor_name: product.vendor_name,
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
