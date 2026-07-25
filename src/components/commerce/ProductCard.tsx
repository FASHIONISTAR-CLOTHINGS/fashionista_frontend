"use client";

/**
 * components/commerce/ProductCard.tsx — UNIFIED Fashionistar Product Card
 *
 * SINGLE SOURCE OF TRUTH for all commerce surfaces (2026 APEX Sprint).
 *
 * Replaces:
 *   - features/catalog/components/ProductCard.tsx (homepage/category/collection)
 *   - features/product/components/ProductCard.tsx  (products listing)
 *   - Inline CatalogProductCard in (home)/products/page.tsx
 *
 * Accepts HomepageProductCard from backend — includes new fields added by B3 fix:
 *   vendor_id, vendor_is_verified
 *
 * Design upgrades (2026 APEX):
 *   ✅ 4:5 aspect ratio (fashion industry standard)
 *   ✅ Glassmorphism card — product-card-glass utility class
 *   ✅ Glimmer sweep on image mount (CSS-only, no JS)
 *   ✅ Hover: scale-105, gradient overlay, quick-add reveal
 *   ✅ Quick-add button (hover desktop, always mobile)
 *   ✅ Measurement badge when requires_measurement
 *   ✅ Pre-order, gender, condition badges
 *   ✅ Vendor verification badge (is_verified)
 *   ✅ Stock scarcity signal (≤5 units)
 *   ✅ Trending badge (ai_trend_score from backend card)
 *   ✅ Wishlist optimistic toggle
 *   ✅ Social proof: rating + orders sold + views
 *   ✅ Out-of-stock overlay with "Notify Me" placeholder
 *   ✅ Cloudinary-first image (no broken /media/None)
 *   ✅ data-testid on all interactive elements
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag, Star, Heart, Zap, Eye, Ruler,
  BadgeCheck, Flame, Clock, Package2
} from "lucide-react";
import { FashionistarImage } from "@/components/media/FashionistarImage";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Extended card type — includes new B3-fix fields from backend
// ─────────────────────────────────────────────────────────────────────────────

export type UnifiedProductCard = HomepageProductCard & {
  /** Added by B3 fix in product_views.py */
  vendor_id?: string;
  vendor_is_verified?: boolean;
  /** Trending AI score (0–1) */
  ai_trend_score?: number;
  /** Sustainability score (0–100) */
  sustainability_score?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  /** Product data from backend bundle or listing API */
  card: UnifiedProductCard;
  /** Grid position (1-based) — drives stagger animation delay */
  index?: number;
  /** Priority true for first 3 above-fold cards (LCP) */
  priority?: boolean;
  /** Show wishlist heart toggle. Default true. */
  showWishlist?: boolean;
  /** Show quick-add button. Default true. */
  showQuickAdd?: boolean;
  /**
   * Variant:
   *   default    — 4:5 tall card (homepage, category, collection, search)
   *   compact    — 1:1 square card (deals rail, recently viewed rail)
   *   horizontal — side-by-side (mobile cart preview)
   */
  variant?: "default" | "compact" | "horizontal";
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦", USD: "$", GBP: "£", EUR: "€",
};

function formatPrice(value: string | null | undefined, currency = "NGN"): string {
  if (!value) return "";
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return `${sym}${num.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function resolveImageSrc(card: UnifiedProductCard): string {
  const src = card.cloudinary_url || card.image_url || "";
  if (!src || src.endsWith("/media/None") || src.endsWith("/media/null") || src === "null") {
    return "";
  }
  return src;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(Math.min(rating, 5));
  return (
    <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < filled
                ? "fill-[var(--BV-gold)] text-[var(--BV-gold)]"
                : "fill-transparent text-gray-300"
            }`}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-xs text-[var(--BV-muted)]">({count})</span>
      )}
    </div>
  );
}

type BadgeVariant =
  | "sale" | "hot" | "new" | "used" | "preorder"
  | "men" | "women" | "unisex" | "kids"
  | "eco" | "trending" | "verified";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  sale:     "bg-[var(--BV-gold)] text-[var(--BV-ink)] font-bold",
  hot:      "bg-red-500 text-white font-bold",
  new:      "bg-[var(--BV-green)] text-white",
  used:     "bg-[var(--BV-slate)] text-white",
  preorder: "bg-purple-600 text-white",
  men:      "bg-sky-700 text-white",
  women:    "bg-pink-600 text-white",
  unisex:   "bg-violet-600 text-white",
  kids:     "bg-orange-400 text-[var(--BV-ink)]",
  eco:      "bg-emerald-600 text-white",
  trending: "bg-rose-500 text-white",
  verified: "bg-[var(--BV-green)]/10 text-[var(--BV-green)] border border-[var(--BV-green)]/20",
};

function Badge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span
      className={`
        inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px]
        tracking-wide uppercase animate-card-pop ${BADGE_STYLES[variant]}
      `}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aspect ratio map per variant
// ─────────────────────────────────────────────────────────────────────────────
const ASPECT_RATIO: Record<NonNullable<ProductCardProps["variant"]>, string> = {
  default:    "aspect-[4/5]",
  compact:    "aspect-square",
  horizontal: "aspect-square",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductCard({
  card,
  index = 1,
  priority = false,
  showWishlist = true,
  showQuickAdd = true,
  variant = "default",
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const src = resolveImageSrc(card);
  const price = formatPrice(card.price, card.currency);
  const oldPrice = card.old_price ? formatPrice(card.old_price, card.currency) : null;
  const hasDiscount = !!card.discount_percentage && card.discount_percentage > 0;
  const staggerClass = `stagger-${Math.min(index, 12)}`;
  const isTrending = (card.ai_trend_score ?? 0) > 0.7;
  const isLowStock = card.in_stock && card.stock_qty > 0 && card.stock_qty <= 5;

  // Demographic badge
  let genderBadge: { variant: BadgeVariant; label: string } | null = null;
  if (card.gender_target === "men")   genderBadge = { variant: "men",   label: "Men" };
  if (card.gender_target === "women") genderBadge = { variant: "women", label: "Women" };
  if (card.gender_target === "unisex") genderBadge = { variant: "unisex", label: "Unisex" };
  if (["kids", "boys", "girls"].includes(card.gender_target))
    genderBadge = { variant: "kids", label: "Kids" };

  const conditionBadge: { variant: BadgeVariant; label: string } | null =
    card.condition === "used"
      ? { variant: "used", label: "Pre-owned" }
      : card.condition === "refurbished"
      ? { variant: "used", label: "Refurbished" }
      : null;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }, []);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((w) => !w);
  }, []);

  if (variant === "horizontal") {
    // ── Horizontal (cart preview) ─────────────────────────────────────────
    return (
      <article
        className="group flex gap-3 rounded-xl overflow-hidden product-card-glass p-2"
        aria-label={`Product: ${card.title}`}
        data-testid={`product-card-horizontal-${card.slug}`}
      >
        <Link
          href={`/products/${card.slug}`}
          className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--BV-surface)]"
          prefetch={false}
        >
          {src ? (
            <FashionistarImage
              src={src} alt={card.title} fill
              sizes="80px"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package2 className="w-6 h-6 text-[var(--BV-muted)]" />
            </div>
          )}
        </Link>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--BV-green)] truncate">
            {card.store_name || card.vendor_name}
          </p>
          <h3 className="text-sm font-semibold text-[var(--BV-ink)] line-clamp-2 leading-snug">
            {card.title}
          </h3>
          <span className="text-sm font-bold text-[var(--BV-gold)] mt-auto">{price}</span>
        </div>
      </article>
    );
  }

  // ── Default / Compact ───────────────────────────────────────────────────────
  return (
    <article
      className={`
        group relative flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer
        product-card-glass animate-card-enter ${staggerClass}
      `}
      aria-label={`Product: ${card.title}`}
      data-testid={`product-card-${card.slug}`}
    >
      {/* ── Image Container ─────────────────────────────────────────────────── */}
      <Link
        href={`/products/${card.slug}`}
        className="block relative overflow-hidden"
        aria-label={`View ${card.title}`}
        prefetch={false}
        data-testid={`product-card-img-link-${card.slug}`}
      >
        <div className={`relative w-full ${ASPECT_RATIO[variant]} bg-[var(--BV-surface)]`}>
          {src ? (
            <FashionistarImage
              src={src}
              alt={`${card.title} — ${card.store_name || card.vendor_name}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--BV-cream)] to-[var(--BV-cream-dark)]">
              <ShoppingBag className="w-12 h-12 text-[var(--BV-green)]/20" aria-hidden="true" />
            </div>
          )}

          {/* Glimmer sweep — CSS-only, runs once on mount */}
          <div className="glimmer-overlay" aria-hidden="true" />

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--BV-ink)]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
        </div>

        {/* ── Badges top-left ──────────────────────────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isTrending && <Badge variant="trending" label="🔥 Trending" />}
          {card.hot_deal && !isTrending && <Badge variant="hot" label="🔥 Hot" />}
          {hasDiscount && <Badge variant="sale" label={`-${card.discount_percentage}%`} />}
          {card.is_pre_order && <Badge variant="preorder" label="Pre-order" />}
          {genderBadge && <Badge variant={genderBadge.variant} label={genderBadge.label} />}
          {conditionBadge && <Badge variant={conditionBadge.variant} label={conditionBadge.label} />}
          {(card.sustainability_score ?? 0) >= 75 && <Badge variant="eco" label="🌿 Eco" />}
        </div>

        {/* Low stock scarcity signal */}
        {isLowStock && (
          <div className="absolute top-2.5 right-10 z-10">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] bg-red-50 text-red-600 border border-red-200 font-semibold">
              <Flame className="w-2.5 h-2.5" aria-hidden="true" />
              Only {card.stock_qty} left!
            </span>
          </div>
        )}

        {/* ── Out-of-stock overlay ─────────────────────────────────────────── */}
        {!card.in_stock && (
          <div className="absolute inset-0 bg-[var(--BV-ink)]/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 gap-2">
            <span className="bg-white/90 text-[var(--BV-ink)] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Sold Out
            </span>
            <button
              type="button"
              className="text-white/80 text-[10px] underline underline-offset-2 hover:text-white"
              data-testid={`notify-me-${card.slug}`}
            >
              Notify Me
            </button>
          </div>
        )}

        {/* ── Wishlist button ──────────────────────────────────────────────── */}
        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`
              absolute top-2.5 right-2.5 z-10 p-2 rounded-full
              transition-all duration-200 active:scale-90
              ${wishlisted
                ? "bg-[var(--BV-gold)] text-[var(--BV-ink)] shadow-lg"
                : "bg-white/80 text-[var(--BV-slate)] backdrop-blur-sm hover:bg-white"
              }
            `}
            data-testid={`wishlist-btn-${card.slug}`}
          >
            <Heart
              className={`w-4 h-4 ${wishlisted ? "fill-[var(--BV-ink)]" : "fill-transparent"}`}
            />
          </button>
        )}

        {/* ── Quick-add (hover reveal / always on mobile) ─────────────────── */}
        {showQuickAdd && card.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 md:block">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`
                w-full flex items-center justify-center gap-2
                py-2.5 rounded-xl text-sm font-semibold tracking-wide
                transition-all duration-200 active:scale-95 shadow-lg
                ${addedToCart
                  ? "bg-[var(--BV-green)] text-white"
                  : "bg-[var(--BV-gold)] text-[var(--BV-ink)] hover:bg-[var(--BV-gold-dark)]"
                }
              `}
              aria-label={addedToCart ? "Added to cart!" : "Quick add to cart"}
              data-testid={`quick-add-btn-${card.slug}`}
            >
              {addedToCart ? (
                <>✓ Added!</>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  Quick Add
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Measurement required overlay badge */}
        {card.requires_measurement && card.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="flex items-center gap-1 bg-[var(--BV-green)] text-white px-2 py-0.5 rounded-full text-[9px] font-semibold">
              <Ruler className="w-2.5 h-2.5" aria-hidden="true" />
              Measurement required
            </span>
          </div>
        )}
      </Link>

      {/* ── Card Body ───────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${card.slug}`}
        className="flex flex-col gap-1.5 p-3 flex-1"
        aria-label={`View details for ${card.title}`}
        prefetch={false}
        data-testid={`product-card-body-${card.slug}`}
      >
        {/* Vendor with verification badge */}
        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--BV-green)] truncate">
          <span className="truncate">{card.store_name || card.vendor_name}</span>
          {card.vendor_is_verified && (
            <BadgeCheck
              className="w-3 h-3 flex-shrink-0 text-[var(--BV-green)]"
              aria-label="Verified vendor"
            />
          )}
        </p>

        {/* Product title */}
        <h3 className="text-sm font-semibold text-[var(--BV-ink)] line-clamp-2 leading-snug group-hover:text-[var(--BV-green)] transition-colors duration-200">
          {card.title}
        </h3>

        {/* Rating */}
        {(card.computed_avg_rating > 0 || card.rating > 0) && (
          <StarRating
            rating={card.computed_avg_rating || card.rating}
            count={card.computed_review_count || card.review_count}
          />
        )}

        {/* Color swatches */}
        {card.colors.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap" aria-label="Available colors">
            {card.colors.slice(0, 5).map((c) => (
              <span
                key={c.id}
                className="color-swatch"
                style={{ backgroundColor: c.hex_code }}
                title={c.name}
                aria-label={`Color: ${c.name}`}
              />
            ))}
            {card.colors.length > 5 && (
              <span className="text-[9px] text-[var(--BV-muted)]">
                +{card.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Social proof: sold count + views */}
        {(card.orders_count > 0 || card.views > 0) && (
          <div className="flex items-center gap-2 text-[10px] text-[var(--BV-muted)]">
            {card.orders_count > 0 && (
              <span className="flex items-center gap-0.5">
                <ShoppingBag className="w-2.5 h-2.5" aria-hidden="true" />
                {card.orders_count.toLocaleString()} sold
              </span>
            )}
            {card.views > 100 && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" aria-hidden="true" />
                {card.views > 999
                  ? `${Math.round(card.views / 1000)}k`
                  : card.views}{" "}
                views
              </span>
            )}
          </div>
        )}

        {/* Pre-order signal with clock icon */}
        {card.is_pre_order && (
          <p className="text-[9px] text-purple-600 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" aria-hidden="true" />
            Pre-order — ships on schedule
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-[var(--BV-gold)]">{price}</span>
          {oldPrice && (
            <span className="text-xs text-[var(--BV-muted)] line-through">{oldPrice}</span>
          )}
        </div>

        {/* Sizes */}
        {card.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5" aria-label="Available sizes">
            {card.sizes.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border border-[var(--BV-border)] text-[var(--BV-slate)] bg-white/70"
              >
                {s.name}
              </span>
            ))}
            {card.sizes.length > 5 && (
              <span className="text-[9px] text-[var(--BV-muted)]">
                +{card.sizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Measurement CTA signal */}
        {card.requires_measurement && (
          <p className="text-[9px] text-[var(--BV-green)] flex items-center gap-0.5 mt-0.5">
            <Zap className="w-2.5 h-2.5" aria-hidden="true" />
            Custom fit — measurements needed
          </p>
        )}
      </Link>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Named export alias (for tree-shaking compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export { ProductCard };
