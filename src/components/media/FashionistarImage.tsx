/**
 * @file FashionistarImage.tsx
 * @description Enterprise Cloudinary image wrapper for the Fashionistar platform.
 *
 * Features:
 *  - Automatic Cloudinary transformation URL generation
 *  - LQIP (Low Quality Image Placeholder) blur-up animation
 *  - WebP / AVIF format negotiation via `f_auto`
 *  - Responsive srcSet generation with configurable widths
 *  - Graceful fallback to a branded placeholder on error
 *  - Lazy loading with IntersectionObserver
 *  - Accessibility: requires alt text; warns in dev if missing
 *
 * Usage:
 *   <FashionistarImage
 *     publicId="vendors/abc/product-hero.jpg"
 *     alt="Premium Agbada set in royal blue"
 *     width={800}
 *     height={600}
 *     transformation="product"
 *   />
 */
"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Named transformation presets — maps to Cloudinary named transformations. */
const TRANSFORMATION_PRESETS: Record<string, string> = {
  product:    "c_fill,g_auto,q_auto:good,f_auto",
  thumbnail:  "c_fill,g_auto,w_300,h_300,q_auto:eco,f_auto",
  hero:       "c_fill,g_auto,w_1200,q_auto:best,f_auto",
  card:       "c_fill,g_auto,w_600,h_600,q_auto:good,f_auto",
  avatar:     "c_fill,g_face,w_150,h_150,r_max,q_auto,f_auto",
  og:         "c_fill,w_1200,h_630,q_auto:good,f_auto",
};

/** Standard responsive break-widths for srcSet generation. */
const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];

// ─────────────────────────────────────────────────────────────────────────────
// URL BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

function buildCloudinaryUrl(
  publicId: string,
  transformation: string,
  width?: number,
): string {
  if (!CLOUD_NAME || !publicId) return "";
  const w = width ? `,w_${width}` : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}${w}/${publicId}`;
}

function buildLqipUrl(publicId: string): string {
  return buildCloudinaryUrl(publicId, "c_fill,w_20,q_10,f_auto,e_blur:800");
}

function buildSrcSet(publicId: string, transformation: string, widths: number[]): string {
  return widths
    .map((w) => `${buildCloudinaryUrl(publicId, transformation, w)} ${w}w`)
    .join(", ");
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANDED PLACEHOLDER (shown on error)
// ─────────────────────────────────────────────────────────────────────────────

function Placeholder({ className, aspectRatio }: { className?: string; aspectRatio?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900",
        className,
      )}
      style={{ aspectRatio: aspectRatio ?? "1" }}
      role="img"
      aria-label="Image unavailable"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="8" fill="rgba(139,92,246,0.12)" />
        <path
          d="M8 28L16 16L22 24L27 19L32 28H8Z"
          fill="rgba(139,92,246,0.4)"
        />
        <circle cx="14" cy="14" r="3" fill="rgba(139,92,246,0.4)" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

export interface FashionistarImageProps {
  /** Cloudinary public_id. */
  publicId?: string | null;
  /** Fully qualified fallback URL (for legacy / non-Cloudinary assets). */
  src?: string | null;
  /** Accessible alt text. Required for production; warned in dev. */
  alt: string;
  /** Display width in px — used for srcSet and size hints. */
  width?: number;
  /** Display height in px. */
  height?: number;
  /** Named transformation preset (default: "product"). */
  transformation?: keyof typeof TRANSFORMATION_PRESETS | string;
  /** Custom Cloudinary transformation string (overrides preset). */
  customTransformation?: string;
  /** CSS aspect ratio e.g. "1/1" or "4/3". */
  aspectRatio?: string;
  /** Additional class names. */
  className?: string;
  /** Image class names. */
  imgClassName?: string;
  /** Priority load (disables lazy loading). */
  priority?: boolean;
  /** Callback when image fully loads. */
  onLoad?: () => void;
  /** Callback on error (after fallback is shown). */
  onError?: () => void;
  /** Whether to show the LQIP blur-up effect. Default: true. */
  showBlurUp?: boolean;
  /** Custom srcSet widths. */
  srcSetWidths?: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function FashionistarImage({
  publicId,
  src,
  alt,
  width,
  height,
  transformation = "product",
  customTransformation,
  aspectRatio,
  className,
  imgClassName,
  priority = false,
  onLoad,
  onError,
  showBlurUp = true,
  srcSetWidths = DEFAULT_WIDTHS,
}: FashionistarImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Dev warning ────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development" && !alt) {
    console.warn("[FashionistarImage] Missing `alt` prop — required for accessibility");
  }

  // ── IntersectionObserver lazy load ─────────────────────────────────────────
  useEffect(() => {
    if (priority || inView) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, inView]);

  // ── URL resolution ─────────────────────────────────────────────────────────
  const transformStr =
    customTransformation ??
    TRANSFORMATION_PRESETS[transformation] ??
    TRANSFORMATION_PRESETS.product;

  const resolvedSrc = publicId
    ? buildCloudinaryUrl(publicId, transformStr, width)
    : src ?? "";

  const resolvedSrcSet =
    publicId && inView
      ? buildSrcSet(publicId, transformStr, srcSetWidths)
      : undefined;

  const lqipSrc = publicId && showBlurUp ? buildLqipUrl(publicId) : undefined;

  const sizesAttr = width
    ? `(max-width: ${width}px) 100vw, ${width}px`
    : "(max-width: 768px) 100vw, 50vw";

  // ── Error → show placeholder ───────────────────────────────────────────────
  if (errored || (!publicId && !src)) {
    return (
      <Placeholder
        className={cn("w-full rounded-xl", className)}
        aspectRatio={aspectRatio}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      {/* LQIP blur placeholder */}
      {lqipSrc && showBlurUp && !loaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lqipSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-xl"
        />
      )}

      {/* Main image — only rendered when in view */}
      {inView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={resolvedSrc}
          srcSet={resolvedSrcSet}
          sizes={sizesAttr}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setErrored(true);
            onError?.();
          }}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Square product card thumbnail — 600×600 fill */
export function ProductThumbnail(props: Omit<FashionistarImageProps, "transformation" | "aspectRatio">) {
  return <FashionistarImage {...props} transformation="card" aspectRatio="1/1" />;
}

/** Full-width hero — 1200px wide */
export function ProductHero(props: Omit<FashionistarImageProps, "transformation" | "aspectRatio">) {
  return <FashionistarImage {...props} transformation="hero" priority aspectRatio="16/9" />;
}

/** Circular vendor/user avatar — 150×150 face-crop */
export function AvatarImage(props: Omit<FashionistarImageProps, "transformation" | "aspectRatio">) {
  return <FashionistarImage {...props} transformation="avatar" aspectRatio="1/1" className={cn("rounded-full", props.className)} />;
}
