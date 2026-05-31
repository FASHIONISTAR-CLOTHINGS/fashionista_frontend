"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ProductGrid } from "@/features/product";

interface CategoryProductsClientProps {
  categorySlug: string;
}

/**
 * CategoryProductsClient
 *
 * Fetches products filtered by category slug + optional brand/sub_category/page
 * query params. All state is URL-synced (?page=N, ?brand=, ?sub_category=) so
 * results are bookmarkable and shareable. Rendered inside a Suspense boundary
 * on the category slug page.
 */
export default function CategoryProductsClient({
  categorySlug,
}: CategoryProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const brand = searchParams.get("brand") ?? undefined;
  const sub_category = searchParams.get("sub_category") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  // Sync page change to URL (?page=N keeps it bookmarkable + browser Back works)
  const onPageChange = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <ProductGrid
      params={{
        category: categorySlug,
        sub_category,
        brand,
        page,
        page_size: 12,
      }}
      skeletonCount={12}
      pageSize={12}
      showPageInfo
      onPageChange={onPageChange}
    />
  );
}
