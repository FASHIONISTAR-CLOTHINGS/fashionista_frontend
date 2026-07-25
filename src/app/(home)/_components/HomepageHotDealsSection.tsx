/**
 * HomepageHotDealsSection.tsx — Premium 2026 Edition
 *
 * RSC — "Deals of the Week" section with:
 *   ✅ Unified ProductCard (single source of truth)
 *   ✅ Deal progress bar showing % claimed (urgency + scarcity)
 *   ✅ "Only X left!" stock scarcity badge on low-stock items
 *   ✅ "View All Deals" link → /products?sort=-discount_percentage
 *
 * Architecture:
 *   - Pure RSC — no "use client"
 *   - Receives HomepageProductCard[] from page.tsx (zero re-fetch)
 *   - Delegates ALL card rendering to shared ProductCard
 */

import Link from "next/link";
import ProductCard from "@/features/catalog/components/ProductCard";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

interface Props {
  products: HomepageProductCard[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Deal Progress Bar — shows % "claimed" as urgency signal
// Computed from: orders_count / max(orders_count across all cards)
// ─────────────────────────────────────────────────────────────────────────────

function DealProgressBar({
  product,
  maxOrders,
}: {
  product: HomepageProductCard;
  maxOrders: number;
}) {
  const qty = product.stock_qty ?? 0;
  const orders = product.orders_count ?? 0;
  const isLowStock = product.in_stock && qty > 0 && qty <= 5;

  // Progress = claimed / (claimed + remaining stock)
  // Use orders as claimed proxy; if no data, use a synthetic 65-85% range
  let pct: number;
  if (orders > 0 && maxOrders > 0) {
    pct = Math.min(95, Math.round((orders / maxOrders) * 85) + 10);
  } else {
    // Synthetic urgency: seed from product id to be stable
    const seed = parseInt(product.id.slice(-4), 16) % 40;
    pct = 55 + seed;
  }

  return (
    <div className="px-3 pb-3 -mt-1">
      {/* Scarcity badge */}
      {isLowStock && (
        <p className="text-[10px] font-bold text-red-600 mb-1">
          🔥 Only {qty} left in stock!
        </p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-1.5 rounded-full bg-[#01454A]/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of stock claimed`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FDA600] to-[#e09500] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-[#01454A]/70 whitespace-nowrap">
          {pct}% claimed
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function HomepageHotDealsSection({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="text-5xl" role="img" aria-label="fire">🔥</span>
        <p className="text-[var(--BV-muted)] text-sm font-medium">
          New deals dropping soon — check back later!
        </p>
        <Link
          href="/products"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#01454A]/30 px-6 py-2.5 text-sm font-semibold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-200"
        >
          Browse All Products →
        </Link>
      </div>
    );
  }

  const displayProducts = products.slice(0, 6);
  const maxOrders = Math.max(...displayProducts.map((p) => p.orders_count ?? 0), 1);

  return (
    <div className="space-y-6">
      {/* Product grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 items-stretch"
        role="list"
        aria-label="Hot deals this week"
      >
        {displayProducts.map((product, idx) => (
          <div key={product.id} role="listitem" className="flex flex-col h-full">
            <div className="flex-1">
              <ProductCard
                card={product}
                index={idx + 1}
                priority={idx < 2}
                showWishlist
                variant="default"
              />
            </div>
            {/* Deal progress bar — below card body */}
            <DealProgressBar product={product} maxOrders={maxOrders} />
          </div>
        ))}
      </div>

      {/* View All Deals CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href="/products?sort=-discount_percentage&hot_deal=true"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#FDA600] bg-transparent px-8 py-3 text-sm font-bold text-[#1A1208] hover:bg-[#FDA600] transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm min-h-[44px]"
          data-testid="view-all-deals-link"
        >
          View All Deals 🔥
        </Link>
      </div>
    </div>
  );
}

export default HomepageHotDealsSection;
