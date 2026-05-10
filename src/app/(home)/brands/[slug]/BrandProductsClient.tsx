"use client";

import { ProductGridSkeleton } from "@/features/product";
import { useCatalogBrands } from "@/features/catalog";

interface BrandProductsClientProps {
  brandSlug: string;
}

/**
 * BrandProductsClient — client component that renders products for a brand.
 *
 * Currently filters from the catalog brands hook and links through to product
 * search/filter.  Once the backend exposes /api/v1/products/?brand=<slug>,
 * this can be replaced with a dedicated useBrandProducts() hook.
 */
export default function BrandProductsClient({ brandSlug }: BrandProductsClientProps) {
  const { data: brands, isLoading } = useCatalogBrands();

  if (isLoading) return <ProductGridSkeleton count={8} />;

  const brand = brands?.find((b) => b.slug === brandSlug);

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="font-raleway text-base text-[#475367]">
          No products found for this brand yet.
        </p>
      </div>
    );
  }

  // Link to product listing filtered by brand name
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <p className="font-raleway text-base text-[#475367]">
        Browse all {brand.title} products on the products page.
      </p>
      <a
        href={`/products?brand=${brandSlug}`}
        className="rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#fda600]/90 transition-colors"
      >
        View Products
      </a>
    </div>
  );
}
