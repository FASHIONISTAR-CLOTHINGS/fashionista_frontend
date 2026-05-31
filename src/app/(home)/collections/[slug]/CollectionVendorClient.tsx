"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ProductGrid } from "@/features/product";

interface CollectionProductsClientProps {
  collectionSlug: string;
}

/**
 * CollectionProductsClient (file: CollectionVendorClient.tsx)
 *
 * Fetches products filtered by collection slug via TanStack Query → Ninja API.
 * Page state is URL-synced (?page=N) for bookmarkable, shareable paginated results.
 * Optional sub_category filter from ?sub_category= URL param.
 * Rendered inside a Suspense boundary by the parent server page.
 *
 * Architecture:
 *   - Uses ProductGrid with params.collection = collectionSlug
 *   - Page changes update ?page= in the URL (browser Back works, bookmarkable)
 *   - sub_category param allows category filtering within a collection
 */
export default function CollectionProductsClient({
  collectionSlug,
}: CollectionProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const sub_category = searchParams.get("sub_category") ?? undefined;

  const handlePageChange = useCallback(
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
        // Backend maps ?collection= to products belonging to this collection
        // Falls back to q= search if collection filter not supported yet
        q: collectionSlug,
        sub_category,
        page,
        page_size: 12,
      }}
      skeletonCount={12}
      pageSize={12}
      showPageInfo
    />
  );
}
