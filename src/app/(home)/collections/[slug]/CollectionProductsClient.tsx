"use client";
import { ProductGrid } from "@/features/product";

interface CollectionProductsClientProps {
  collectionSlug: string;
}

/**
 * CollectionProductsClient
 * Fetches products filtered by collection slug via TanStack Query → Ninja API.
 * Rendered inside a Suspense boundary by the parent server page.
 */
export default function CollectionProductsClient({
  collectionSlug,
}: CollectionProductsClientProps) {
  return (
    <ProductGrid
      params={{ q: collectionSlug, page: 1 }}
      skeletonCount={8}
    />
  );
}
