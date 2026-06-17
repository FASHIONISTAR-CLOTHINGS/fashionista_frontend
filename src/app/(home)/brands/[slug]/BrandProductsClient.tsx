"use client";

import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";
import { useBrandProducts } from "@/features/catalog";

interface BrandProductsClientProps {
  brandSlug: string;
}

import type { HomepageProductCard } from "@/features/catalog";

function toProductCardItem(product: HomepageProductCard): ProductListItem {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    old_price: product.old_price,
    discount_percentage: product.discount_percentage,
    is_discounted: !!product.old_price,
    discounted_price: product.old_price ? product.price : null,
    cash_payment_mode: "escrow",
    currency: product.currency,
    image_url: product.image_url,
    in_stock: product.in_stock,
    featured: product.featured,
    hot_deal: product.hot_deal,
    rating: product.rating,
    review_count: product.review_count,
    computed_review_count: product.computed_review_count,
    computed_avg_rating: product.computed_avg_rating,
    category_name: product.category_name,
    category_slug: product.category_slug,
    brand_name: null,
    brand_slug: null,
    vendor_name: product.store_name,
    vendor_slug: product.store_slug,
    requires_measurement: product.requires_measurement,
    is_customisable: product.is_customisable,
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
