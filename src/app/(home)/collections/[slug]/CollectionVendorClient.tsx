"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ProductGrid } from "@/features/product";



interface CollectionVendorClientProps {
  collectionSlug: string;
}

/**
 * CollectionVendorClient
 *
 * Fetches products filtered by collection slug via TanStack Query → Ninja API.
 * Page state is URL-synced (?page=N) for bookmarkable, shareable paginated results.
 * Rendered inside a Suspense boundary by the parent server page.
 *
 * Fix: was incorrectly passing { q: collectionSlug } (search query).
 * Now correctly passes { collection: collectionSlug } (collection filter).
 */
export default function CollectionVendorClient({
  collectionSlug,
}: CollectionVendorClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));


  return (
    <ProductGrid
      params={{
        collection: collectionSlug,
        page,
        page_size: 12,
      }}
      skeletonCount={12}
      pageSize={12}
      showPageInfo
    />
  );
}
