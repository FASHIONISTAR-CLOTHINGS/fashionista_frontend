/**
 * DealsOfTheWeekSection.tsx — Consolidated homepage bundle section
 *
 * "Deals of the Week" — steep-discount products with a live countdown timer.
 * Receives products as props from the 12-way asyncio.gather bundle.
 * Distinct from HomepageHotDealsSection: this surfaces only products with
 * active discounts (old_price > price), ordered by discount % descending.
 *
 * Architecture:
 *   - Pure RSC — no "use client"
 *   - Receives HomepageProductCard[] from page.tsx (zero re-fetch)
 *   - Delegates card rendering to shared ProductCard
 *   - Typed empty state (section never disappears)
 *   - CTA → /products?filter=hot_deal
 */

import Link from "next/link";
import ProductCard from "@/features/catalog/components/ProductCard";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";
import { DealsCountdown } from "./DealsCountdown";
import { Tag } from "lucide-react";

interface Props {
  products: HomepageProductCard[];
  countdownTarget?: string;
}

export function DealsOfTheWeekSection({ products, countdownTarget }: Props) {
  // Typed empty state — section never disappears, degrades gracefully
  if (!products || products.length === 0) {
    return (
      <section
        aria-label="Deals of the Week"
        className="px-5 py-10 md:px-10 lg:px-20 space-y-6 md:space-y-10"
        data-testid="deals-of-week-section"
      >
        <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-16">
          <h2 className="font-bon_foyage whitespace-nowrap text-center text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#333]">
            Deals of the Week
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag size={32} className="text-muted-foreground/40 mb-3" aria-hidden="true" />
          <p className="font-raleway text-sm text-muted-foreground">
            No active deals this week. New deals drop every Sunday!
          </p>
          <Link
            href="/products"
            className="mt-4 font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Deals of the Week"
      className="px-5 py-10 md:px-10 lg:px-20 space-y-6 md:space-y-10"
      data-testid="deals-of-week-section"
    >
      <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-16">
        <h2 className="font-bon_foyage whitespace-nowrap text-center text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#333]">
          Deals of the Week
        </h2>
        {countdownTarget && (
          <div data-testid="deals-of-week-countdown" suppressHydrationWarning>
            <DealsCountdown targetDate={countdownTarget} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            card={product}
            index={idx + 1}
            priority={idx < 2}
            showWishlist
            variant="default"
          />
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <Link
          href="/products?filter=hot_deal"
          data-testid="deals-of-week-view-all"
          className="font-raleway text-sm font-bold text-[#01454A] border border-[#01454A]/30 px-6 py-3 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150"
        >
          View All Deals →
        </Link>
      </div>
    </section>
  );
}
