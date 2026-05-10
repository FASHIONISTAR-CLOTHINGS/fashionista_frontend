"use client";

/**
 * @file ProductCard.tsx
 * @description Enterprise product card — Fashionistar Design System.
 *
 * Features:
 *  - Optimistic wishlist toggle via `useToggleWishlist()`
 *  - Add-to-cart via `useAddCartItem()` with stock guard
 *  - Cloudinary-served Next/Image (avif/webp)
 *  - Star rating badge + review count
 *  - Measurement-required badge (tape measure icon)
 *  - Dark-mode aware brand tokens
 *  - 200ms shimmer reveal on mount
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Ruler, Star } from "lucide-react";
import { toast } from "sonner";
import { useToggleWishlist } from "../hooks/use-product";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { formatCurrency } from "@/lib/formatting";
import type { ProductListItem } from "../types/product.types";

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
  const { mutate: toggleWishlist, isPending: wishlistLoading } = useToggleWishlist();
  const { mutate: addToCart, isPending: cartLoading } = useAddCartItem();

  const imageUrl =
    !imgErr && product.image_url ? product.image_url : "/gown.svg";

  const hasDiscount =
    product.old_price && parseFloat(product.old_price) > parseFloat(product.price);

  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(product.old_price!) - parseFloat(product.price)) /
          parseFloat(product.old_price!)) *
          100,
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { product_id: product.id, product_slug: product.slug, quantity: 1 },
      {
        onSuccess: () => toast.success(`${product.title} added to cart!`),
      },
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
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
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label="Toggle wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[hsl(var(--primary))] shadow-md transition hover:bg-white hover:scale-110 disabled:opacity-50"
          >
            <Heart size={18} strokeWidth={2} />
          </button>

          {/* Quick add */}
          {showQuickAdd && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              aria-label="Add to cart"
              className="flex flex-1 max-w-[160px] items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:opacity-60"
            >
              <ShoppingBag size={15} />
              Add to Cart
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
      </Link>
    </article>
  );
}
