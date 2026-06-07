"use client";

/**
 * entities/product/components/ProductCard.tsx
 * Premium glassmorphism product card with hover animation.
 * Used in catalog grid, featured sliders, and search results.
 */

import { FashionistarImage } from "@/components/media";
import Link from "next/link";
import type { ProductListItem } from "../types";

interface ProductCardProps {
  product: ProductListItem;
  onWishlistToggle?: (id: string) => void;
  isWishlisted?: boolean;
  priority?: boolean;
}

function formatPrice(ngn: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(parseFloat(ngn));
}

const STOCK_BADGE: Record<string, string> = {
  in_stock: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  low_stock: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  out_of_stock: "bg-red-500/20 text-red-400 border-red-500/30",
  made_to_order: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

const STOCK_LABEL: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Sold Out",
  made_to_order: "Made to Order",
};

export function ProductCard({ product, onWishlistToggle, isWishlisted = false, priority = false }: ProductCardProps) {
  const discount = product.compareAtPriceNgn
    ? Math.round(
        ((parseFloat(product.compareAtPriceNgn) - parseFloat(product.basePriceNgn)) /
          parseFloat(product.compareAtPriceNgn)) *
          100
      )
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/25 hover:bg-white/8 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1"
      id={`product-card-${product.id}`}
      aria-label={`View ${product.title}`}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-900/50">
        <FashionistarImage
          src={product.primaryImageUrl}
          alt={product.title}
          fill
          imgClassName="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              ✦ Featured
            </span>
          )}
          {product.requiresMeasurement && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/90 text-white">
              📐 Custom Fit
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle(product.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all hover:bg-black/60 hover:scale-110"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            id={`wishlist-btn-${product.id}`}
          >
            <svg
              className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-400 fill-red-400" : "text-white"}`}
              fill={isWishlisted ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Stock overlay for out-of-stock */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        {/* Vendor + Verified */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 truncate">{product.vendor.storeName}</span>
          {product.vendor.isVerified && (
            <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
          {product.title}
        </h3>

        {/* Style tags */}
        {product.styleTags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.styleTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white">{formatPrice(product.basePriceNgn)}</span>
            {product.compareAtPriceNgn && (
              <span className="text-xs text-slate-500 line-through">{formatPrice(product.compareAtPriceNgn)}</span>
            )}
          </div>

          {/* Rating */}
          {parseFloat(product.averageRating) > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-slate-400">{product.averageRating}</span>
              <span className="text-xs text-slate-600">({product.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Stock status badge */}
        <span className={`self-start text-[10px] px-2 py-0.5 rounded-full border ${STOCK_BADGE[product.stockStatus]}`}>
          {STOCK_LABEL[product.stockStatus]}
        </span>
      </div>
    </Link>
  );
}

/**
 * ProductSkeleton — animated loading placeholder.
 */
export function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
      <div className="aspect-[4/5] bg-slate-800/60" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-24 bg-slate-700 rounded-full" />
        <div className="h-4 w-full bg-slate-700 rounded-full" />
        <div className="h-4 w-3/4 bg-slate-700 rounded-full" />
        <div className="h-5 w-20 bg-slate-600 rounded-full mt-1" />
      </div>
    </div>
  );
}

/**
 * SizeBadge — inline size indicator chip.
 */
export function SizeBadge({ size }: { size: string }) {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/20 bg-white/5 text-xs font-semibold text-slate-300 hover:border-amber-400/60 hover:text-amber-300 transition-all cursor-pointer">
      {size}
    </span>
  );
}
