"use client";

/**
 * TabbedFeaturedProducts.tsx
 *
 * Client component for the homepage featured products section with tabs:
 *   Featured | New Arrivals | Trending | Best Sellers
 *
 * Data source: HomepageBundle (passed as props — zero extra fetch)
 * Tab switching: client-side state (no page navigation)
 *
 * Deriving tabs from a single bundle:
 *   Featured    → bundle.featured_products (already server-curated)
 *   New Arrivals → filtered by most recent created_at
 *   Trending    → filtered by ai_trend_score > 0.5 or views > 100
 *   Best Sellers → filtered by orders_count desc
 */

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/features/catalog/components/ProductCard";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — exported for Suspense fallback in app/(home)/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

export function HomepageFeaturedProductsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="section-wrapper" aria-busy="true" aria-label="Loading featured products">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-4 w-32 rounded mb-2" />
          <div className="shimmer h-8 w-64 rounded" />
        </div>
        <div className="shimmer h-4 w-20 rounded" />
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden">
            <div className="shimmer aspect-[4/5] rounded-2xl" />
            <div className="p-3 flex flex-col gap-2">
              <div className="shimmer h-2.5 w-20 rounded" />
              <div className="shimmer h-3.5 w-full rounded" />
              <div className="shimmer h-3 w-3/4 rounded" />
              <div className="shimmer h-4 w-16 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs definition
// ─────────────────────────────────────────────────────────────────────────────

type TabId = "featured" | "new" | "trending" | "bestselling";

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
  href: string;
}

const TABS: Tab[] = [
  { id: "featured",    label: "Featured",     emoji: "⭐",  href: "/products?featured=true" },
  { id: "new",         label: "New Arrivals", emoji: "🆕",  href: "/products?sort=-created_at" },
  { id: "trending",    label: "Trending",     emoji: "🔥",  href: "/products?sort=-views" },
  { id: "bestselling", label: "Best Sellers", emoji: "🏆",  href: "/products?sort=-orders_count" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab-filtered product sets
// ─────────────────────────────────────────────────────────────────────────────

function getTabProducts(
  all: HomepageProductCard[],
  tab: TabId,
  limit: number,
): HomepageProductCard[] {
  switch (tab) {
    case "featured":
      return all.filter((p) => p.featured).slice(0, limit);

    case "new":
      // Sort by created_at descending; fall back to existing order
      return [...all]
        .sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, limit);

    case "trending":
      return [...all]
        .filter((p) => (p.ai_trend_score ?? 0) > 0.3 || (p.views ?? 0) > 50)
        .sort((a, b) => (b.ai_trend_score ?? 0) - (a.ai_trend_score ?? 0))
        .slice(0, limit);

    case "bestselling":
      return [...all]
        .sort((a, b) => (b.orders_count ?? 0) - (a.orders_count ?? 0))
        .slice(0, limit);

    default:
      return all.slice(0, limit);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TabbedFeaturedProductsProps {
  products: HomepageProductCard[];
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function TabbedFeaturedProducts({
  products,
  limit = 8,
}: TabbedFeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("featured");

  const tabProducts = getTabProducts(products, activeTab, limit);
  const currentTab = TABS.find((t) => t.id === activeTab)!;

  if (products.length === 0) return null;

  return (
    <section
      className="section-wrapper"
      aria-labelledby="featured-products-heading"
      id="featured-products"
    >
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Discover More
          </p>
          <h2
            id="featured-products-heading"
            className="section-title"
          >
            Curated For You
          </h2>
        </div>
        <Link
          href={currentTab.href}
          className="text-sm font-semibold text-[var(--BV-green)] hover:underline decoration-[var(--BV-gold)] underline-offset-4 transition-colors whitespace-nowrap"
        >
          View all {currentTab.label} →
        </Link>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 branded-scroll"
        role="tablist"
        aria-label="Product category tabs"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold
                transition-all duration-200 min-h-[40px]
                ${isActive
                  ? "bg-[#01454A] text-white shadow-sm"
                  : "bg-[#01454A]/8 text-[#01454A]/70 hover:bg-[#01454A]/15 hover:text-[#01454A]"
                }
              `}
              data-testid={`tab-${tab.id}`}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Product Grid ──────────────────────────────────────────────── */}
      <div
        key={activeTab}
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-label={`${currentTab.label} products`}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {tabProducts.length > 0 ? (
          tabProducts.map((card, idx) => (
            <div key={card.id} className="h-full">
              <ProductCard
                card={card}
                index={idx + 1}
                priority={idx < 2}
                showWishlist
              />
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl" aria-hidden="true">{currentTab.emoji}</span>
            <p className="text-sm text-[#01454A]/60">
              No {currentTab.label.toLowerCase()} products available right now.
            </p>
            <Link
              href="/products"
              className="text-sm font-semibold text-[#01454A] underline underline-offset-4"
            >
              Browse all products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default TabbedFeaturedProducts;
