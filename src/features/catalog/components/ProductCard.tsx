"use client";

/**
 * ProductCard.tsx — Premium Fashionistar Product Card Component
 *
 * 2026 Design: Glassmorphism + brand gold/green palette + @starting-style
 * compatible entrance animations + glimmer sweep on image mount.
 *
 * Used by:
 *   - HomepageFeaturedProducts (featured_products section)
 *   - HotDealsSection          (hot_deals section)
 *   - CategoryProducts         (category slug pages)
 *   - CollectionProducts       (collection slug pages)
 *   - Search results
 *
 * Props: HomepageProductCard (single source of truth from backend)
 *
 * Image priority:
 *   1. cloudinary_url  — CDN-optimised WebP/AVIF at w_480
 *   2. image_url       — raw backend URL
 *   3. blank           — never renders a broken image
 */

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart, Zap, Eye } from "lucide-react";

import { FashionistarImage } from "@/components/media/FashionistarImage";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

function formatPrice(value: string | null | undefined, currency = "NGN"): string {
  if (!value) return "";
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return `${sym}${num.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function resolveImageSrc(card: HomepageProductCard): string {
  const src = card.cloudinary_url || card.image_url || "";
  // Guard Django serializer bug — never pass /media/None as src
  if (!src || src.endsWith("/media/None") || src.endsWith("/media/null") || src === "null") {
    return "";
  }
  return src;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
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

type BadgeVariant = "sale" | "hot" | "new" | "used" | "preorder" | "men" | "women" | "unisex" | "kids";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  sale:    "bg-[var(--BV-gold)] text-[var(--BV-ink)] font-bold",
  hot:     "bg-red-500 text-white font-bold",
  new:     "bg-[var(--BV-green)] text-white",
  used:    "bg-[var(--BV-slate)] text-white",
  preorder:"bg-purple-600 text-white",
  men:     "bg-sky-700 text-white",
  women:   "bg-pink-600 text-white",
  unisex:  "bg-violet-600 text-white",
  kids:    "bg-orange-400 text-[var(--BV-ink)]",
};

function Badge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase
        animate-card-pop ${BADGE_STYLES[variant]}
      `}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductCard
// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  /** The product data card from the backend bundle. */
  card: HomepageProductCard;
  /** Grid position index — used for staggered entrance animation (1-based). */
  index?: number;
  /** Show the wishlisted heart icon (client-side only). */
  showWishlist?: boolean;
  /**
   * Priority: set true for above-the-fold cards (first 2-3 in the grid)
   * so Next.js preloads the image as LCP candidate.
   */
  priority?: boolean;
}

export default function ProductCard({
  card,
  index = 1,
  showWishlist = true,
  priority = false,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const src = resolveImageSrc(card);
  const price = formatPrice(card.price, card.currency);
  const oldPrice = card.old_price ? formatPrice(card.old_price, card.currency) : null;
  const hasDiscount = !!card.discount_percentage && card.discount_percentage > 0;
  const staggerClass = `stagger-${Math.min(index, 12)}`;

  // Demographic badge
  let genderBadge: { variant: BadgeVariant; label: string } | null = null;
  if (card.gender_target === "men")   genderBadge = { variant: "men",   label: "Men" };
  if (card.gender_target === "women") genderBadge = { variant: "women", label: "Women" };
  if (card.gender_target === "unisex") genderBadge = { variant: "unisex", label: "Unisex" };
  if (["kids","boys","girls"].includes(card.gender_target))
    genderBadge = { variant: "kids", label: "Kids" };

  const conditionBadge: { variant: BadgeVariant; label: string } | null =
    card.condition === "used"
      ? { variant: "used", label: "Pre-owned" }
      : card.condition === "refurbished"
      ? { variant: "used", label: "Refurbished" }
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }

  return (
    <article
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
        product-card-glass animate-card-enter ${staggerClass}
      `}
      aria-label={`Product: ${card.title}`}
    >
      {/* ── Image Container ─────────────────────────────────────────────── */}
      <Link
        href={`/products/${card.slug}`}
        className="block relative overflow-hidden"
        aria-label={`View ${card.title}`}
        prefetch={false}
      >
        {/* Aspect-ratio wrapper 4:5 — fashion industry standard */}
        <div className="relative w-full aspect-[4/5] bg-[var(--BV-surface)]">
          {src ? (
            <FashionistarImage
              src={src}
              alt={card.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
              priority={priority}
            />
          ) : (
            /* Elegant no-image placeholder with brand pattern */
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--BV-cream)] to-[var(--BV-cream-dark)]">
              <ShoppingBag className="w-12 h-12 text-[var(--BV-green)]/20" />
            </div>
          )}

          {/* Glimmer sweep on mount — runs once */}
          <div className="glimmer-overlay" aria-hidden="true" />

          {/* Dark gradient overlay on hover for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--BV-ink)]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* ── Badges (top-left) ─────────────────────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {card.hot_deal && <Badge variant="hot" label="🔥 Hot" />}
          {hasDiscount && <Badge variant="sale" label={`-${card.discount_percentage}%`} />}
          {card.is_pre_order && <Badge variant="preorder" label="Pre-order" />}
          {genderBadge && <Badge variant={genderBadge.variant} label={genderBadge.label} />}
          {conditionBadge && <Badge variant={conditionBadge.variant} label={conditionBadge.label} />}
        </div>

        {/* ── Out-of-stock overlay ──────────────────────────────────────── */}
        {!card.in_stock && (
          <div className="absolute inset-0 bg-[var(--BV-ink)]/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-white/90 text-[var(--BV-ink)] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* ── Wishlist button (top-right) ───────────────────────────────── */}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setWishlisted((w) => !w);
            }}
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
          >
            <Heart
              className={`w-4 h-4 ${wishlisted ? "fill-[var(--BV-ink)]" : "fill-transparent"}`}
            />
          </button>
        )}

        {/* ── Quick-add (appears on hover) ──────────────────────────────── */}
        {card.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`
                w-full flex items-center justify-center gap-2
                py-2.5 rounded-xl text-sm font-semibold tracking-wide
                transition-all duration-200 active:scale-95
                ${addedToCart
                  ? "bg-[var(--BV-green)] text-white"
                  : "bg-[var(--BV-gold)] text-[var(--BV-ink)] hover:bg-[var(--BV-gold-dark)]"
                }
              `}
              aria-label={addedToCart ? "Added!" : "Quick add to cart"}
            >
              {addedToCart ? (
                <>✓ Added!</>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Quick Add
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* ── Card Body ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${card.slug}`}
        className="flex flex-col gap-1.5 p-3 flex-1"
        aria-label={`View details for ${card.title}`}
        prefetch={false}
      >
        {/* Vendor name */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--BV-green)] truncate">
          {card.store_name || card.vendor_name}
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
          <div className="flex items-center gap-1 flex-wrap">
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

        {/* Social proof signals */}
        {(card.orders_count > 0 || card.views > 0) && (
          <div className="flex items-center gap-2 text-[10px] text-[var(--BV-muted)]">
            {card.orders_count > 0 && (
              <span className="flex items-center gap-0.5">
                <ShoppingBag className="w-2.5 h-2.5" />
                {card.orders_count.toLocaleString()} sold
              </span>
            )}
            {card.views > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                {card.views > 999
                  ? `${Math.round(card.views / 1000)}k`
                  : card.views}{" "}
                views
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-[var(--BV-gold)]">{price}</span>
          {oldPrice && (
            <span className="text-xs text-[var(--BV-muted)] line-through">{oldPrice}</span>
          )}
        </div>

        {/* Sizes (small chips) */}
        {card.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
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

        {/* Requires measurement indicator */}
        {card.requires_measurement && (
          <p className="text-[9px] text-[var(--BV-green)] flex items-center gap-0.5 mt-0.5">
            <Zap className="w-2.5 h-2.5" />
            Custom fit — measurements needed
          </p>
        )}
      </Link>
    </article>
  );
}
