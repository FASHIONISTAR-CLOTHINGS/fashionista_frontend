"use client";

/**
 * @file ProductCard.tsx
 * @description Wrapper forwarding to canonical @/components/commerce/ProductCard.tsx
 *
 * APEX Sprint (U1): This file is now a thin adapter that maps ProductListItem
 * to the unified UnifiedProductCard interface. The canonical implementation
 * lives at @/components/commerce/ProductCard.tsx.
 *
 * Fixes: B4 (duplicate ProductCard implementations) from implementation_plan.md
 */

import SharedProductCard, { type UnifiedProductCard } from "@/components/commerce/ProductCard";
import type { ProductListItem } from "../types/product.types";

interface ProductCardProps {
  product: ProductListItem;
  index?: number;
  showQuickAdd?: boolean;
}

export default function ProductCard({
  product,
  index = 0,
  showQuickAdd = true,
}: ProductCardProps) {
  const card: UnifiedProductCard = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.id,
    price: product.price,
    old_price: product.old_price ?? null,
    discount_percentage: product.discount_percentage ?? 0,
    currency: product.currency ?? "NGN",
    image_url: product.image_url ?? null,
    cloudinary_url: product.image_url ?? null,
    in_stock: product.in_stock ?? true,
    stock_qty: product.stock_qty ?? 0,
    featured: product.featured ?? false,
    hot_deal: product.hot_deal ?? false,
    rating: product.rating ?? 0,
    review_count: product.review_count ?? 0,
    computed_review_count: product.computed_review_count ?? 0,
    computed_avg_rating: product.computed_avg_rating ?? 0,
    category_name: product.category_name ?? null,
    category_slug: product.category_slug ?? null,
    vendor_name: product.vendor_name ?? "FASHIONISTAR",
    vendor_slug: product.vendor_slug ?? null,
    store_name: product.vendor_name ?? "FASHIONISTAR",
    store_slug: product.vendor_slug ?? null,
    requires_measurement: product.requires_measurement ?? false,
    is_customisable: product.is_customisable ?? false,
    gender_target: product.gender_target ?? "",
    age_group: product.age_group ?? "",
    condition: product.condition ?? "new",
    is_pre_order: product.is_pre_order ?? false,
    orders_count: 0,
    views: 0,
    sizes: [],
    colors: [],
    ai_trend_score: product.ai_trend_score,
    sustainability_score: product.sustainability_score ?? undefined,
  };

  return (
    <SharedProductCard
      card={card}
      index={index}
      showQuickAdd={showQuickAdd}
    />
  );
}

export { ProductCard };
