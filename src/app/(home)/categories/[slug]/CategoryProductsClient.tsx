"use client";

import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/features/product";

interface CategoryProductsClientProps {
  categorySlug: string;
}

/**
 * CategoryProductsClient
 * Fetches products filtered by category slug + optional brand query param.
 * Rendered inside a Suspense boundary on the category slug page.
 */
export default function CategoryProductsClient({
  categorySlug,
}: CategoryProductsClientProps) {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? undefined;

  return (
    <ProductGrid
      params={{
        category: categorySlug,
        brand,
        page: 1,
      }}
      skeletonCount={8}
    />
  );
}
