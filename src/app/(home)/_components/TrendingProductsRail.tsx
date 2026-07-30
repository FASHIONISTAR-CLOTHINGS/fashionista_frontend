"use client";

/**
 * TrendingProductsRail.tsx — R20
 *
 * Horizontal scroll rail surfacing trending products using ai_trend_score.
 * Fetches products ordered by AI trend score descending and shows them
 * as compact horizontal scroll cards with a "🔥 Trending" badge indicator.
 *
 * Data: POST-loads client-side via TanStack Query (no SSR needed — below fold)
 * Uses catalogApi.listProducts({ ordering: "-ai_trend_score", page_size: 12 })
 *
 * Design:
 *  - Gold accent label "TRENDING NOW" with flame emoji
 *  - Horizontal scroll rail with branded-scroll custom scrollbar
 *  - Compact product cards (image + title + price + vendor)
 *  - Flame badge on each card if ai_trend_score > 0.7
 *  - "View All" link to /products?ordering=-ai_trend_score
 *  - Skeleton loading state
 */

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, type CatalogProductCard } from "@/features/catalog/api/catalog.api";
import { Flame } from "lucide-react";

// ─── Product card in the rail ─────────────────────────────────────────────────

function TrendingCard({
  card,
  rank,
}: {
  card: CatalogProductCard;
  rank: number;
}) {
  const imageUrl = card.cloudinary_url || card.image_url;
  const isHotTrend =
    typeof card.ai_trend_score === "number" && card.ai_trend_score > 0.7;

  const priceNum = parseFloat(card.price);
  const formattedPrice = isNaN(priceNum)
    ? card.price
    : `₦${priceNum.toLocaleString("en-NG")}`;

  return (
    <Link
      href={`/products/${card.slug}`}
      data-testid={`trending-card-${rank}`}
      className="group flex-shrink-0 w-40 sm:w-48 flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-52 w-full bg-muted overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={card.title}
            fill
            sizes="(max-width: 640px) 160px, 192px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/40">
            <span className="text-4xl">👗</span>
          </div>
        )}

        {/* Rank badge */}
        <span className="absolute top-2 left-2 h-5 w-5 rounded-full bg-[#FDA600] text-black text-[10px] font-bold flex items-center justify-center shadow">
          {rank}
        </span>

        {/* Trending badge */}
        {isHotTrend && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-[#FDA600]">
            <Flame size={9} aria-hidden="true" />
            Hot
          </span>
        )}

        {/* Out of stock */}
        {!card.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-0.5 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground font-raleway line-clamp-1 uppercase tracking-wide">
          {card.vendor_name}
        </p>
        <h3 className="text-xs font-semibold text-foreground font-raleway line-clamp-2 leading-snug">
          {card.title}
        </h3>
        <div className="mt-auto pt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-foreground">{formattedPrice}</span>
          {card.old_price && parseFloat(card.old_price) > priceNum && (
            <span className="text-[10px] text-muted-foreground line-through">
              ₦{parseFloat(card.old_price).toLocaleString("en-NG")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TrendingRailSkeleton() {
  return (
    <div className="flex gap-3 px-5 md:px-10 lg:px-20 w-max" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-40 sm:w-48 rounded-2xl overflow-hidden bg-card border border-border"
        >
          <div className="h-44 sm:h-52 w-full bg-muted animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Rail ────────────────────────────────────────────────────────────────

export function TrendingProductsRail() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending-products-rail"],
    queryFn: () =>
      catalogApi.listProducts({
        ordering: "-ai_trend_score",
        page_size: 12,
        in_stock: true,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const products = data?.results ?? [];

  // Don't render section at all if no trending data
  if (!isLoading && (isError || products.length === 0)) return null;

  return (
    <section
      className="py-10 bg-background border-b border-border/50"
      data-testid="trending-products-rail"
      aria-label="Trending products"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-5 md:px-10 lg:px-20">
        <div className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden="true">🔥</span>
          <div>
            <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600]">
              Trending Now
            </p>
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
              What Everyone&apos;s Wearing
            </h2>
          </div>
        </div>
        <Link
          href="/products?ordering=-ai_trend_score"
          data-testid="trending-view-all"
          className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
        >
          View All {"->"}
        </Link>
      </div>

      {/* Scroll container */}
      <div
        className="overflow-x-auto branded-scroll pb-2"
        role="list"
        aria-label="Trending products"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <TrendingRailSkeleton />
        ) : (
          <div className="flex gap-3 px-5 md:px-10 lg:px-20 w-max">
            {products.map((card, i) => (
              <div key={card.id} role="listitem">
                <TrendingCard card={card} rank={i + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
