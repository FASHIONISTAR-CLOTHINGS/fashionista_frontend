/**
 * HomepageHotDealsSection.tsx — Premium 2026 Edition
 *
 * RSC — "Deals of the Week" section.
 * Upgraded to use the shared <ProductCard /> for brand UI consistency.
 *
 * Architecture:
 *   - Pure RSC — no "use client"
 *   - Receives HomepageProductCard[] from page.tsx (zero re-fetch)
 *   - Delegates ALL card rendering to shared ProductCard (single source of truth)
 *   - Shows up to 4 hot-deal cards in a 2-col / 4-col grid
 */

import ProductCard from "@/features/catalog/components/ProductCard";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

interface Props {
  products: HomepageProductCard[];
}

export function HomepageHotDealsSection({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <span className="text-4xl" role="img" aria-label="fire">🔥</span>
        <p className="text-[var(--BV-muted)] text-sm font-medium">
          New deals dropping soon — check back later!
        </p>
      </div>
    );
  }

  const displayProducts = products.slice(0, 4);

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
      role="list"
      aria-label="Hot deals this week"
    >
      {displayProducts.map((product, idx) => (
        <div key={product.id} role="listitem">
          <ProductCard
            card={product}
            index={idx + 1}
            priority={idx === 0}
            showWishlist
          />
        </div>
      ))}
    </div>
  );
}

export default HomepageHotDealsSection;
