/**
 * @file FashionImage.tsx
 * @description Enterprise-grade, offline-first Next.js 16 / React 19 image component.
 *
 * ── Core features ────────────────────────────────────────────────────────────
 *  • Cloudinary auto-format + auto-quality URL transformation (f_auto,q_auto)
 *  • Progressive LQIP blur placeholder (inline base64 + Cloudinary LQIP URL)
 *  • Skeleton shimmer loading state for perceived performance
 *  • Graceful fallback to brand placeholder on network / CDN failure
 *  • Priority / LCP hints for above-the-fold images
 *  • Drag-and-drop upload affordance via `uploadable` prop
 *  • Service Worker cache-aware: emits `fashionistar:image-loaded` custom event
 *    so the SW can pre-cache product images during idle time
 *
 * ── 5 Enterprise Best-Practice Additions ─────────────────────────────────────
 *  1. LQIP via Cloudinary (e_blur:400,q_10,f_auto) → near-instant first paint
 *  2. `decoding="async"` always set → never blocks main thread
 *  3. Network-aware quality: navigator.connection throttles quality on slow 2G/3G
 *  4. Error retry (max 2 attempts) with exponential back-off before fallback
 *  5. `data-product-id` attribute injection for analytics / heat-map tools
 *
 * ── Low-latency / offline strategy ───────────────────────────────────────────
 *  On error the component immediately swaps to the local /public fallback
 *  (zero network round-trip) so vendors with poor connectivity never see
 *  a broken image, even when offline.
 */
"use client";
import Image, { type ImageProps } from "next/image";
import { useState, useEffect, useCallback } from "react";

// ── Inline 1×1 base64 blur placeholder (zero network cost) ───────────────────
const LQIP_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// ── Brand placeholder from /public (SW-cached, works offline) ─────────────────
const FALLBACK_SRC = "/images/placeholder-fashion.webp";

// ── Max retries before giving up and showing fallback ─────────────────────────
const MAX_RETRIES = 2;

// ── Network-aware quality helper ──────────────────────────────────────────────
function getQuality(isHero: boolean): number {
  if (typeof navigator === "undefined") return isHero ? 90 : 80;
  // @ts-expect-error — connection is not yet in TS lib
  const conn = navigator.connection;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return 40;
  if (conn?.effectiveType === "3g") return 60;
  return isHero ? 90 : 80;
}

/**
 * Build a Cloudinary-optimised URL.
 *
 * Inserts f_auto,q_auto (and optional width transform) before /upload/.
 * Safe to call on non-Cloudinary URLs — returns the original unchanged.
 *
 * @param url    - Raw Cloudinary secure_url or any CDN URL
 * @param width  - Optional pixel width for w_ transform
 * @returns Optimised URL string
 */
function cloudinaryOptimize(url: string, width?: number): string {
  if (!url.includes("res.cloudinary.com")) return url;
  // Already transformed → skip to avoid double-inserting transforms
  if (url.includes("f_auto")) return url;
  const transforms = width
    ? `f_auto,q_auto,w_${width}`
    : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transforms}/`);
}

/**
 * Derive a Cloudinary LQIP URL (heavily blurred, tiny) for the blur placeholder.
 * Falls back to the inline base64 if the URL is not a Cloudinary asset.
 */
function buildLqipUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return LQIP_BASE64;
  return url.replace("/upload/", "/upload/e_blur:400,q_10,f_auto,w_20/");
}

// ── Component prop types ──────────────────────────────────────────────────────

export interface FashionImageProps extends Omit<ImageProps, "src" | "alt"> {
  /** Cloudinary secure_url, any HTTPS URL, or null/undefined */
  src: string | null | undefined;
  /** Descriptive alt text — required for accessibility (WCAG 2.1 AA) */
  alt: string;
  /** True for LCP / hero images — enables priority fetch + eager loading */
  isHero?: boolean;
  /** Fallback image served from /public (zero network, works offline) */
  fallbackSrc?: string;
  /** className for the optional wrapping div when using fill layout */
  wrapperClassName?: string;
  /** Optional product / resource ID injected as data-product-id for analytics */
  dataProductId?: string;
  /** Render upload overlay (drag-and-drop affordance) — used in builder wizard */
  uploadable?: boolean;
  /** Called when user drops a file over this image (uploadable mode) */
  onFileDrop?: (file: File) => void;
}

/**
 * FashionImage — Fashionistar platform standard image component.
 *
 * @example Fixed dimensions (product card):
 * ```tsx
 * <FashionImage src={product.cover_image_url} alt={product.title} width={400} height={400} />
 * ```
 *
 * @example Fill layout (hero banner):
 * ```tsx
 * <div className="relative h-64">
 *   <FashionImage src={heroUrl} alt="Hero" fill sizes="100vw" isHero />
 * </div>
 * ```
 *
 * @example Vendor product builder (drag-and-drop upload):
 * ```tsx
 * <FashionImage src={draft.coverUrl} alt="Cover" width={600} height={600}
 *   uploadable onFileDrop={handleCoverDrop} />
 * ```
 */
export function FashionImage({
  src,
  alt,
  isHero = false,
  fallbackSrc = FALLBACK_SRC,
  wrapperClassName: _wrap,
  className,
  dataProductId,
  uploadable = false,
  onFileDrop,
  width,
  ...props
}: FashionImageProps) {
  // Optimise the CDN URL before first render
  const optimisedSrc = src
    ? cloudinaryOptimize(src, typeof width === "number" ? width : undefined)
    : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(optimisedSrc);
  const [retries, setRetries] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync src prop changes (e.g. after draft upload)
  useEffect(() => {
    setImgSrc(
      src
        ? cloudinaryOptimize(src, typeof width === "number" ? width : undefined)
        : fallbackSrc,
    );
    setLoaded(false);
    setRetries(0);
  }, [src, fallbackSrc, width]);

  /**
   * On network error: retry up to MAX_RETRIES with exponential back-off,
   * then fall back to the local /public placeholder (works fully offline).
   */
  const handleError = useCallback(() => {
    if (retries < MAX_RETRIES) {
      const delay = 500 * Math.pow(2, retries); // 500ms, 1s
      setTimeout(() => {
        setRetries((r) => r + 1);
        setImgSrc((prev) => `${prev}?retry=${retries + 1}`);
      }, delay);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [retries, fallbackSrc]);

  /**
   * After successful load: emit custom event for Service Worker pre-caching.
   * The SW intercepts this to add the image to the product-images cache.
   */
  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (typeof window !== "undefined" && src) {
      window.dispatchEvent(
        new CustomEvent("fashionistar:image-loaded", { detail: { src } }),
      );
    }
  }, [src]);

  // ── Drag-and-drop handlers (uploadable mode) ────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    if (!uploadable) return;
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    if (!uploadable) return;
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && onFileDrop) onFileDrop(file);
  };

  const quality = getQuality(isHero);

  return (
    <span
      className={`relative block overflow-hidden ${loaded ? "" : "animate-pulse bg-gray-800"} ${_wrap ?? ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-product-id={dataProductId}
    >
      {/* Drag-and-drop overlay */}
      {uploadable && isDragOver && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white text-sm font-semibold pointer-events-none">
          Drop to upload
        </span>
      )}

      <Image
        src={imgSrc}
        alt={alt}
        priority={isHero}
        loading={isHero ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL={src ? buildLqipUrl(src) : LQIP_BASE64}
        quality={quality}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={className}
        width={width}
        {...props}
      />
    </span>
  );
}

export default FashionImage;
