"use client";

/**
 * @file GallerySection.tsx
 * @description Extracted PDP gallery section with:
 *   - Main image with CSS 2× zoom on hover (mouse-position-tracked transformOrigin)
 *   - Thumbnail strip for gallery navigation
 *   - Video support via FashionistarVideo
 *   - Wishlist float button
 *   - Social proof badge overlay
 *   - AI measurement badge
 *   - "Hover to zoom" UX hint
 *
 * Extracted from ProductDetailClient.tsx (Phase 5.1)
 * Reduces the monolith by ~120 lines.
 */

import { useState } from "react";
import { Heart, Ruler } from "lucide-react";
import { FashionistarImage, FashionistarVideo } from "@/components/media";
import { Button } from "@/components/ui/button";
import { SocialProofBadge } from "@/features/product/components/SocialProofBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaItem {
  url: string;
  type: string; // "image" | "video"
}

interface GallerySectionProps {
  mediaItems: MediaItem[];
  productTitle: string;
  requiresMeasurement: boolean;
  viewCount?: number;
  lastOrderedAt?: string | null;
  onWishlistToggle: () => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function GallerySection({
  mediaItems,
  productTitle,
  requiresMeasurement,
  viewCount,
  lastOrderedAt,
  onWishlistToggle,
  activeIndex,
  onActiveIndexChange,
}: GallerySectionProps) {
  const [internalActiveImg, setInternalActiveImg] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);

  const activeImg = activeIndex !== undefined ? activeIndex : internalActiveImg;

  const setActiveImg = (idx: number) => {
    if (onActiveIndexChange) {
      onActiveIndexChange(idx);
    } else {
      setInternalActiveImg(idx);
    }
  };

  const activeItem = mediaItems[activeImg] ?? { url: "/gown.svg", type: "image" };


  return (
    <div className="flex-1">
      {/* ── Main Image / Video ──────────────────────────────────────────── */}
      <div
        className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-[hsl(var(--brand-cream))] md:h-[520px] cursor-zoom-in"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setZoomPos({ x, y });
        }}
        onMouseLeave={() => setZoomPos(null)}
      >
        {activeItem.type === "video" ? (
          <FashionistarVideo
            src={activeItem.url}
            autoPlay={false}
            muted={true}
            showControls={true}
            className="w-full h-full object-cover"
          />
        ) : (
          <FashionistarImage
            src={activeItem.url}
            alt={productTitle}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="h-full w-full"
            imgClassName="object-contain p-4 transition-transform duration-150"
            imgStyle={
              zoomPos
                ? {
                    transform: "scale(2)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : {}
            }
            priority
          />
        )}

        {/* AI measurement badge */}
        {requiresMeasurement && (
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-primary-foreground z-10">
            <Ruler size={12} /> Custom Fit Required
          </span>
        )}

        {/* Social proof urgency overlay */}
        <SocialProofBadge
          viewersCount={viewCount}
          lastPurchasedAt={lastOrderedAt}
          className="absolute bottom-4 left-4 z-10"
        />

        {/* Zoom hint (desktop only, hides on hover) */}
        <span
          className={`absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[10px] text-white/80 pointer-events-none transition-opacity duration-200 ${
            zoomPos ? "opacity-0" : "opacity-100"
          } hidden md:flex`}
        >
          🔍 Hover to zoom
        </span>

        {/* Wishlist float button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onWishlistToggle}
          aria-label="Toggle wishlist"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md text-[hsl(var(--primary))] transition hover:scale-110 p-0 min-w-0 min-h-0 z-10"
        >
          <Heart size={18} strokeWidth={2} />
        </Button>
      </div>

      {/* ── Thumbnail Strip ─────────────────────────────────────────────── */}
      {mediaItems.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {mediaItems.map((item, idx) => (
            <Button
              key={idx}
              variant="ghost"
              onClick={() => setActiveImg(idx)}
              className={`relative h-20 overflow-hidden rounded-xl border-2 transition p-0 min-w-0 min-h-0 w-full block ${
                activeImg === idx
                  ? "border-[hsl(var(--accent))]"
                  : "border-transparent hover:border-border"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <FashionistarImage
                src={item.url}
                alt={`${productTitle} gallery thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="h-full w-full"
                imgClassName="object-cover"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
