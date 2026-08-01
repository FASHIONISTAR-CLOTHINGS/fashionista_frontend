"use client";

/**
 * NewArrivalsRail.tsx — Consolidated homepage bundle section
 *
 * "Just Landed" horizontal scroll rail surfacing the newest products.
 * Receives products as props from the 12-way asyncio.gather bundle —
 * ZERO client-side fetches. Ordered by created_at DESC on the backend.
 *
 * Design:
 *  - Forest green accent label "JUST LANDED"
 *  - Horizontal scroll rail with branded-scroll custom scrollbar
 *  - Compact product cards (image + title + price + vendor)
 *  - "NEW" badge on each card
 *  - "View All" link to /products?sort=newest
 *  - Typed empty state (section never disappears)
 */

import Link from "next/link";
import Image from "next/image";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";
import { Sparkles } from "lucide-react";

// ─── Product card in the rail ─────────────────────────────────────────────────

function NewArrivalCard({
  card,
  rank,
}: {
  card: HomepageProductCard;
  rank: number;
}) {
  const imageUrl = card.cloudinary_url || card.image_url;
  const priceNum = parseFloat(card.price);
  const formattedPrice = isNaN(priceNum)
    ? card.price
    : `₦${priceNum.toLocaleString("en-NG")}`;

  return (
    <Link
      href={`/products/${card.slug}`}
      data-testid={`new-arrival-card-${rank}`}
      className="group flex-shrink-0 w-40 sm:w-48 flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01454A]"
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
            <span className="text-4xl">✨</span>
          </div>
        )}

        {/* NEW badge */}
        <span className="absolute top-2 left-2 rounded-full bg-[#01454A] text-white text-[10px] font-bold px-2 py-0.5 font-raleway uppercase tracking-wide shadow">
          New
        </span>

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

// ─── Main Rail ────────────────────────────────────────────────────────────────

export function NewArrivalsRail({ products }: { products: HomepageProductCard[] }) {
  // Typed empty state — section never disappears, degrades gracefully
  if (!products || products.length === 0) {
    return (
      <section
        className="py-10 bg-background border-b border-border/50"
        data-testid="new-arrivals-rail"
        aria-label="New arrivals"
      >
        <div className="flex items-center justify-between px-5 mb-5 md:px-10 lg:px-20">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden="true">✨</span>
            <div>
              <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#01454A]">
                Just Landed
              </p>
              <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
                New Arrivals
              </h2>
            </div>
          </div>
          <Link
            href="/products?sort=newest"
            data-testid="new-arrivals-view-all"
            className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
          >
            View All {"->"}
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
          <Sparkles size={32} className="text-muted-foreground/40 mb-3" aria-hidden="true" />
          <p className="font-raleway text-sm text-muted-foreground">
            New arrivals are being added daily. Check back soon!
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
      className="py-10 bg-background border-b border-border/50"
      data-testid="new-arrivals-rail"
      aria-label="New arrivals"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-5 md:px-10 lg:px-20">
        <div className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden="true">✨</span>
          <div>
            <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#01454A]">
              Just Landed
            </p>
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
              New Arrivals
            </h2>
          </div>
        </div>
        <Link
          href="/products?sort=newest"
          data-testid="new-arrivals-view-all"
          className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
        >
          View All {"->"}
        </Link>
      </div>

      {/* Scroll container */}
      <div
        className="overflow-x-auto branded-scroll pb-2"
        role="list"
        aria-label="New arrivals"
      >
        <div className="flex gap-3 px-5 md:px-10 lg:px-20 w-max">
          {products.map((card, i) => (
            <div key={card.id} role="listitem">
              <NewArrivalCard card={card} rank={i + 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
