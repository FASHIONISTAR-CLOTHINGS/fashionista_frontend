"use client";

/**
 * @file CategoryDealsBanner.tsx
 * @description Shows a deals banner when products in a category have discounts.
 *
 * Psychological triggers:
 *   - Scarcity: "23 products on sale — Save up to 40%"
 *   - Urgency: Links to filtered sale view
 */

import Link from "next/link";
import { Flame } from "lucide-react";

interface CategoryDealsBannerProps {
  categorySlug: string;
  categoryName: string;
  maxDiscountPct: number;
  saleProductCount: number;
}

export function CategoryDealsBanner({
  categorySlug,
  categoryName,
  maxDiscountPct,
  saleProductCount,
}: CategoryDealsBannerProps) {
  if (saleProductCount === 0 || maxDiscountPct <= 0) return null;

  return (
    <section
      className="border-b border-border/50 bg-gradient-to-r from-orange-50 to-red-50"
      data-testid="category-deals-banner"
    >
      <div className="flex flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row md:px-10 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Flame size={18} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {saleProductCount} product{saleProductCount !== 1 ? "s" : ""} on sale in {categoryName}
            </p>
            <p className="text-xs text-muted-foreground">
              Save up to {maxDiscountPct}% — Shop the deals before they&apos;re gone
            </p>
          </div>
        </div>
        <Link
          href={`/products?category=${categorySlug}&on_sale=true`}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Shop Sale Items
        </Link>
      </div>
    </section>
  );
}
