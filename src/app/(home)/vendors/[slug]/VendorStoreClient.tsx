"use client";

import { useProducts } from "@/features/product";
import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";
import { PackageOpen } from "lucide-react";

interface VendorStoreClientProps {
  vendorSlug: string;
}

/**
 * VendorStoreClient — renders a live product grid filtered by vendor slug.
 * Uses TanStack Query → Ninja API for high-performance reads.
 */
export default function VendorStoreClient({ vendorSlug }: VendorStoreClientProps) {
  const { data, isLoading, isError } = useProducts({
    vendor: vendorSlug,
  });

  // useProducts returns PaginatedProductList | undefined — extract results array
  const products: ProductListItem[] = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <PackageOpen size={48} className="text-[#D9D9D9]" />
        <p className="font-raleway text-base text-[#475367]">
          Unable to load products right now. Please try again later.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <PackageOpen size={48} className="text-[#D9D9D9]" />
        <p className="font-raleway text-base text-[#475367]">
          This vendor has no products listed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product: ProductListItem) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

