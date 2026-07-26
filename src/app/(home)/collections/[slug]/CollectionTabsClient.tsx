"use client";

/**
 * CollectionTabsClient.tsx
 *
 * Tabbed interface for collection detail page:
 *   Vendors | Products
 *
 * - Vendors tab: existing CollectionVendorClient (infinite scroll)
 * - Products tab: grid of ProductCard components from collection products API
 * - Tab state is client-side (no URL sync needed — both are server-fetched)
 * - Smooth fadeIn animation on tab switch via key remount
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import ProductCard from "@/components/commerce/ProductCard";
import type { UnifiedProductCard } from "@/components/commerce/ProductCard";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";
import CollectionVendorClient from "./CollectionVendorClient";

interface CollectionTabsClientProps {
  collectionSlug: string;
  collectionTitle: string;
}

type TabId = "vendors" | "products";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "vendors", label: "Vendors", emoji: "🏪" },
  { id: "products", label: "Products", emoji: "🛍️" },
];

function mapToUnifiedCard(p: HomepageProductCard): UnifiedProductCard {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    sku: p.id,
    price: p.price,
    old_price: p.old_price ?? null,
    discount_percentage: p.discount_percentage ?? 0,
    currency: p.currency ?? "NGN",
    image_url: p.image_url ?? null,
    cloudinary_url: p.cloudinary_url ?? null,
    in_stock: p.in_stock ?? true,
    stock_qty: p.stock_qty ?? 10,
    featured: p.featured ?? false,
    hot_deal: p.hot_deal ?? false,
    rating: p.rating ?? 0,
    review_count: p.review_count ?? 0,
    computed_review_count: p.review_count ?? 0,
    computed_avg_rating: p.rating ?? 0,
    category_name: p.category_name ?? null,
    category_slug: p.category_slug ?? null,
    vendor_name: p.vendor_name ?? "FASHIONISTAR",
    vendor_slug: p.vendor_slug ?? null,
    store_name: p.store_name ?? p.vendor_name ?? "FASHIONISTAR",
    store_slug: p.store_slug ?? p.vendor_slug ?? null,
    requires_measurement: p.requires_measurement ?? false,
    is_customisable: false,
    gender_target: p.gender_target ?? "",
    age_group: "",
    condition: p.condition ?? "new",
    is_pre_order: p.is_pre_order ?? false,
    orders_count: p.orders_count ?? 0,
    views: p.views ?? 0,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    ai_trend_score: p.ai_trend_score,
  };
}

export default function CollectionTabsClient({
  collectionSlug,
  collectionTitle,
}: CollectionTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("vendors");

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["catalog", "collection-products", collectionSlug],
    queryFn: () => catalogApi.getCollectionProducts(collectionSlug, 1, 12),
    staleTime: 5 * 60 * 1_000,
  });

  const products = productsData?.results ?? [];
  const productCount = productsData?.count ?? 0;

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 mb-8 overflow-x-auto pb-1 branded-scroll"
        role="tablist"
        aria-label="Collection view tabs"
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
              className={`flex items-center gap-1.5 flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                isActive
                  ? "bg-[#01454A] text-white shadow-sm"
                  : "bg-[#01454A]/8 text-[#01454A]/70 hover:bg-[#01454A]/15 hover:text-[#01454A]"
              }`}
              data-testid={`collection-tab-${tab.id}`}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        key={activeTab}
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-label={TABS.find((t) => t.id === activeTab)?.label}
        style={{ animation: "fadeIn 0.35s ease-out both" }}
      >
        {activeTab === "vendors" ? (
          <CollectionVendorClient collectionSlug={collectionSlug} />
        ) : (
          <div className="space-y-6">
            {productCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {productCount} product{productCount !== 1 ? "s" : ""} in this collection
              </p>
            )}

            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="shimmer aspect-[4/5] rounded-2xl"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                {products.map((p, idx) => (
                  <div key={p.id} className="h-full">
                    <ProductCard
                      card={mapToUnifiedCard(p)}
                      index={idx + 1}
                      priority={idx < 4}
                      showWishlist
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="text-5xl">🛍️</div>
                <p className="font-raleway font-semibold text-lg text-foreground">
                  No products in this collection yet
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Products from vendors in the {collectionTitle} collection will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
