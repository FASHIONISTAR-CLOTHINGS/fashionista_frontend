"use client";

/**
 * @file ProductCard.tsx
 * @description Enterprise product card — Fashionistar Design System.
 *
 * Features:
 *  - Dynamic wishlist toggle: filled heart ↔ outline heart (real-time TanStack Query state)
 *  - Dynamic cart toggle: "Add to Cart" ↔ "Remove" (derived from cart cache via useIsInCart)
 *  - Optimistic mutations — zero-latency UI response before server round-trip
 *  - Cloudinary-served Next/Image (avif/webp)
 *  - Star rating badge + review count
 *  - Measurement-required badge (tape measure icon)
 *  - Dark-mode aware brand tokens
 *  - 200ms shimmer reveal on mount
 */

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Ruler, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { useToggleWishlist } from "../hooks/use-product";
import { useWishlistItemIds } from "@/features/client/hooks/use-client-wishlist";
import { useAddCartItem, useRemoveCartItem, useIsInCart } from "@/features/cart/hooks/use-cart";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatCurrency } from "@/lib/formatting";
import type { ProductListItem } from "../types/product.types";
import { FashionistarImage } from "@/components/media";

interface ProductCardProps {
  product: ProductListItem;
  /** Optional index for staggered entrance animation (0-based). */
  index?: number;
  /** Show quick-add button — hidden on mobile by default. */
  showQuickAdd?: boolean;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1" aria-label={`Rating ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < full ? "hsl(var(--accent))" : i === full && half ? "url(#half)" : "none"}
          stroke="hsl(var(--accent))"
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({count})</span>
    </span>
  );
}

export default function ProductCard({
  product,
  index = 0,
  showQuickAdd = true,
}: ProductCardProps) {
  const [imgErr, setImgErr] = useState(false);

  // ── Wishlist state ──────────────────────────────────────────────────────────
  const { mutate: toggleWishlist, isPending: wishlistLoading } = useToggleWishlist();
  const wishlistIds = useWishlistItemIds();
  const isWishlisted = wishlistIds.has(product.id) || wishlistIds.has(product.slug);

  // ── Cart state ──────────────────────────────────────────────────────────────
  const { mutate: addToCart, isPending: cartAddLoading } = useAddCartItem();
  const { mutate: removeFromCart, isPending: cartRemoveLoading } = useRemoveCartItem();
  const cartLoading = cartAddLoading || cartRemoveLoading;
  const inCart = useIsInCart(product.id);

  // Find the cart item ID for removal (needed by removeCartItem API)
  const { data: cart } = useCart();
  const cartItemId = cart?.items.find(
    (item) => item.product.id === product.id || item.product.slug === product.slug,
  )?.id;

  const imageUrl = !imgErr && product.image_url ? product.image_url : "/gown.svg";

  const hasDiscount =
    product.old_price && parseFloat(product.old_price) > parseFloat(product.price);

  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(product.old_price!) - parseFloat(product.price)) /
          parseFloat(product.old_price!)) *
          100,
      )
    : 0;

  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart && cartItemId) {
      removeFromCart(cartItemId, {
        onSuccess: () => toast.success(`${product.title} removed from cart.`),
      });
    } else {
      addToCart(
        { product_id: product.id, product_slug: product.slug, quantity: 1 },
        {
          onSuccess: () => toast.success(`${product.title} added to cart! 🛍️`),
        },
      );
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug, {
      onSuccess: () =>
        isWishlisted
          ? toast.success("Removed from wishlist.")
          : toast.success("Added to wishlist! ❤️"),
    });
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[var(--card-shadow)] transition-all duration-300 hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={product.title}
    >
      {/* ── Image container ─────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 overflow-hidden bg-[hsl(var(--brand-cream))] dark:bg-[hsl(var(--muted))]"
        tabIndex={-1}
      >
        <FashionistarImage
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="h-full w-full"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgErr(true)}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-xs font-bold text-[hsl(var(--accent-foreground))]">
            -{discountPct}%
          </span>
        )}

        {/* Measurement badge */}
        {product.requires_measurement && (
          <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            <Ruler size={10} />
            Custom fit
          </span>
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 flex items-end justify-center gap-3 bg-gradient-to-t from-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* Wishlist — filled when wishlisted */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110 disabled:opacity-50 ${
              isWishlisted
                ? "bg-[hsl(var(--accent))] text-white"
                : "bg-white/90 text-[hsl(var(--primary))] hover:bg-white"
            }`}
          >
            <Heart
              size={18}
              strokeWidth={2}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          {/* Cart — toggles between Add and Remove */}
          {showQuickAdd && (
            <button
              onClick={handleCartToggle}
              disabled={cartLoading}
              aria-label={inCart ? "Remove from cart" : "Add to cart"}
              className={`flex flex-1 max-w-[160px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition hover:brightness-110 disabled:opacity-60 ${
                inCart
                  ? "bg-red-500 text-white"
                  : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
              }`}
            >
              {inCart ? (
                <>
                  <Check size={15} />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </Link>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <Link href={`/products/${product.slug}`} className="flex flex-col gap-2 p-4 flex-1">
        {/* Vendor name */}
        <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
          {product.vendor_name ?? "FASHIONISTAR"}
        </span>

        {/* Product title */}
        <h3 className="line-clamp-2 font-semibold text-sm leading-5 text-foreground">
          {product.title}
        </h3>

        {/* Star rating */}
        <StarRating rating={product.computed_avg_rating} count={product.review_count} />

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-base font-bold text-foreground">
            {formatCurrency(parseFloat(product.price), product.currency ?? "NGN")}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(parseFloat(product.old_price!), product.currency ?? "NGN")}
            </span>
          )}
        </div>

        {/* Wishlist / Cart quick-status pill (below price) */}
        {(isWishlisted || inCart) && (
          <div className="flex items-center gap-2 pt-1">
            {isWishlisted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <Heart size={9} fill="currentColor" />
                Wishlisted
              </span>
            )}
            {inCart && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Check size={9} />
                In Cart
              </span>
            )}
          </div>
        )}
      </Link>
    </article>
  );
}
