/**
 * @file FashionistarImage.tsx
 * @description Canonical Fashionistar platform image component — v3 (2026/2027).
 *
 * SINGLE SOURCE OF TRUTH for all image rendering on the platform.
 * Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript strict-mode.
 *
 * KEY FIXES (v3):
 *   ● CRITICAL: `fill` container bug — when fill=true the wrapper now applies
 *     `position: absolute; inset: 0` so images correctly fill their positioned parent.
 *   ● CRITICAL: SSR/hydration `inView` race — `priority` images are immediately
 *     visible; lazy images use a `useLayoutEffect`-safe guard to prevent the
 *     IntersectionObserver from registering before the DOM is ready.
 *   ● CRITICAL: `/media/None` backend bug — empty string or `/media/None` src
 *     values are treated as "no image" and show the branded placeholder.
 *   ● Auto-detects Cloudinary URLs from `src` prop and applies optimization.
 *   ● React 19 compatible (no deprecated lifecycle methods).
 *
 * Architecture:
 *   - "use client" — event handlers (onLoad, onError, IntersectionObserver)
 *     require client-side JS. Wrap in RSC with `<Suspense>` for streaming.
 *   - Uses native `<img>` (not next/image) to avoid Next.js domain restrictions
 *     for Cloudinary CDN URLs and backend /media/ paths.
 *   - For true Next.js `fill` image semantics inside measured containers,
 *     use the `NextFillImage` convenience export below.
 *
 * Usage:
 *   // Cloudinary public_id:
 *   <FashionistarImage publicId="vendors/abc/hero.jpg" alt="Product" width={800} height={600} />
 *
 *   // Full URL (non-Cloudinary, e.g. backend /media/):
 *   <FashionistarImage src="https://api.fashionistar.net/media/cat.png" alt="Category" width={96} height={96} />
 *
 *   // Fill mode (parent must have position:relative and explicit height):
 *   <div className="relative h-56">
 *     <FashionistarImage publicId="collection.jpg" alt="Collection" fill transformation="card" />
 *   </div>
 */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
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
  banner:     "c_fill,g_auto,w_1600,q_auto:best,f_auto",
};

/** Standard responsive break-widths for srcSet generation. */
const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];

/** Max retry attempts before showing branded placeholder. */
const MAX_IMAGE_RETRIES = 2;

/** URLs that should be treated as "no image" — renders placeholder instead. */
function isInvalidSrc(value: string | null | undefined): boolean {
  if (!value) return true;
  const s = value.trim();
  if (!s) return true;
  if (s === "null" || s === "undefined" || s === "None") return true;
  if (s.endsWith("/media/None") || s.endsWith("/media/null") || s.endsWith("/media/undefined")) return true;
  return false;
}

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

/**
 * If the `src` value is already a Cloudinary URL, attempt to inject the
 * transformation to enable optimized delivery. Returns the original src
 * if it cannot be enhanced.
 */
function enhanceCloudinarySrc(src: string, transformation: string): string {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    // Only inject if no transformation is already present
    if (src.match(/\/upload\/[a-z_,0-9:/]+\//)) return src; // already transformed
    return src.replace("/upload/", `/upload/${transformation}/`);
  }
  return src;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANDED PLACEHOLDER (shown on error or missing src)
// ─────────────────────────────────────────────────────────────────────────────

export function FashionistarPlaceholder({
  className,
  aspectRatio,
  style,
}: {
  className?: string;
  aspectRatio?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
        className,
      )}
      style={{ aspectRatio: aspectRatio ?? "1", ...style }}
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
        <rect width="40" height="40" rx="8" fill="rgba(1,69,74,0.08)" />
        <path
          d="M8 28L16 16L22 24L27 19L32 28H8Z"
          fill="rgba(1,69,74,0.25)"
        />
        <circle cx="14" cy="14" r="3" fill="rgba(253,166,0,0.5)" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

export interface FashionistarImageProps {
  /** Cloudinary public_id. Takes priority over `src`. */
  publicId?: string | null;
  /**
   * Fully qualified fallback URL (non-Cloudinary assets, backend /media/ paths).
   * Empty string, "None", "null" are treated as missing and show placeholder.
   */
  src?: string | null;
  /** Accessible alt text. Required for production; warns in dev if missing. */
  alt: string;
  /** Display width in px — used for srcSet and size hints. */
  width?: number;
  /** Display height in px. */
  height?: number;
  /**
   * Stretch to fill the bounds of a `position: relative` parent container.
   * When true, the parent MUST have an explicit height (e.g. `h-56`, `h-[280px]`).
   * The component will render with `position: absolute; inset: 0`.
   */
  fill?: boolean;
  /** Explicit responsive sizes attribute override. */
  sizes?: string;
  /** Named transformation preset (default: "product"). */
  transformation?: keyof typeof TRANSFORMATION_PRESETS | string;
  /** Custom Cloudinary transformation string (overrides preset). */
  customTransformation?: string;
  /** CSS aspect ratio e.g. "1/1" or "4/3". Only used when fill=false. */
  aspectRatio?: string;
  /** Additional class names on the wrapper container. */
  className?: string;
  /** Class names applied directly to the `<img>` element. */
  imgClassName?: string;
  /** Priority load (disables lazy loading — use for LCP images). */
  priority?: boolean;
  /** Callback when image fully loads. */
  onLoad?: () => void;
  /** Callback on error (after all retries exhausted + placeholder shown). */
  onError?: () => void;
  /** Whether to show the LQIP blur-up effect. Default: true. */
  showBlurUp?: boolean;
  /** Custom srcSet widths. */
  srcSetWidths?: number[];
  /**
   * Product / entity ID for analytics and heatmap tools.
   * Emitted on the `fashionistar:image-loaded` window event.
   */
  dataProductId?: string;
  /** Enable drag affordance (product galleries, KYC upload panels). */
  draggable?: boolean;
  /** Called when the user starts dragging the image. */
  onDragStart?: React.DragEventHandler<HTMLImageElement>;
  /** Inline style applied to the wrapping container div. */
  style?: React.CSSProperties;
  /** Object-fit applied to the image. Default: "cover". */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
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
  fill = false,
  sizes,
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
  dataProductId,
  draggable = false,
  onDragStart,
  style,
  objectFit = "cover",
}: FashionistarImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  // SSR-safe: priority images are immediately in-view; lazy images wait for observer
  const [inView, setInView] = useState<boolean>(priority);
  const [retries, setRetries] = useState(0);
  const [retrySuffix, setRetrySuffix] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Dev warnings ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    if (!alt) {
      console.warn("[FashionistarImage] Missing `alt` prop — required for accessibility.");
    }
    if (!CLOUD_NAME && publicId) {
      console.warn(
        "[FashionistarImage] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. " +
        "publicId-based images will fail. Set this in .env.local."
      );
    }
  }

  // ── IntersectionObserver lazy load ─────────────────────────────────────────
  useEffect(() => {
    if (priority || inView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: if no IntersectionObserver (SSR/old browsers), immediately show
      setInView(true);
      return;
    }

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

  // ── Reset state when src/publicId changes ─────────────────────────────────
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setRetries(0);
    setRetrySuffix("");
  }, [publicId, src]);

  // ── Resolve transformation ─────────────────────────────────────────────────
  const transformStr =
    customTransformation ??
    TRANSFORMATION_PRESETS[transformation as keyof typeof TRANSFORMATION_PRESETS] ??
    TRANSFORMATION_PRESETS.product;

  // ── Resolve source URL ─────────────────────────────────────────────────────
  let resolvedSrc = "";
  let resolvedSrcSet: string | undefined;
  let lqipSrc: string | undefined;

  const cleanPublicId = publicId?.trim();
  const cleanSrc = src?.trim();

  if (cleanPublicId && CLOUD_NAME) {
    // Cloudinary publicId mode — full optimization pipeline
    resolvedSrc = buildCloudinaryUrl(cleanPublicId, transformStr, width) + retrySuffix;
    if (inView) {
      resolvedSrcSet = buildSrcSet(cleanPublicId, transformStr, srcSetWidths);
    }
    if (showBlurUp) {
      lqipSrc = buildLqipUrl(cleanPublicId);
    }
  } else if (cleanSrc && !isInvalidSrc(cleanSrc)) {
    // Plain URL mode — try to optimize Cloudinary URLs, passthrough otherwise
    resolvedSrc = enhanceCloudinarySrc(cleanSrc, transformStr) + retrySuffix;
  }

  const sizesAttr = sizes ?? (width
    ? `(max-width: ${width}px) 100vw, ${width}px`
    : "(max-width: 768px) 100vw, 50vw");

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fashionistar:image-loaded", {
          detail: { src: resolvedSrc, productId: dataProductId },
        }),
      );
    }
  }, [resolvedSrc, dataProductId, onLoad]);

  const handleError = useCallback(() => {
    if (retries < MAX_IMAGE_RETRIES) {
      const next = retries + 1;
      setRetries(next);
      setRetrySuffix(`?retry=${next}&ts=${Date.now()}`);
      return;
    }
    setErrored(true);
    onError?.();
  }, [retries, onError]);

  // ── Placeholder conditions ─────────────────────────────────────────────────
  const showPlaceholder =
    errored ||
    (!cleanPublicId && isInvalidSrc(cleanSrc)) ||
    (!cleanPublicId && !CLOUD_NAME && !cleanSrc) ||
    (!cleanPublicId && !cleanSrc);

  if (showPlaceholder) {
    if (fill) {
      return (
        <FashionistarPlaceholder
          className={cn("absolute inset-0 w-full h-full rounded-xl", className)}
        />
      );
    }
    return (
      <FashionistarPlaceholder
        className={cn("w-full rounded-xl", className)}
        aspectRatio={aspectRatio ?? (width && height ? `${width}/${height}` : "1")}
        style={style}
      />
    );
  }

  // ── Container classes ──────────────────────────────────────────────────────
  const containerClasses = cn(
    "overflow-hidden",
    fill
      ? "absolute inset-0 w-full h-full"   // ← CRITICAL FIX: fill containers sit at inset-0
      : "relative",
    className,
  );

  const containerStyle: React.CSSProperties = fill
    ? style ?? {}
    : { aspectRatio: aspectRatio, ...style };

  // ── Object fit class ───────────────────────────────────────────────────────
  const fitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={containerStyle}
    >
      {/* LQIP blur placeholder — shown until main image loads */}
      {lqipSrc && showBlurUp && !loaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lqipSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-xl"
        />
      )}

      {/* Main image — rendered when IntersectionObserver fires (or immediately if priority) */}
      {inView && resolvedSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={resolvedSrc}
          srcSet={resolvedSrcSet}
          sizes={sizesAttr}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          data-product-id={dataProductId}
          draggable={draggable}
          onDragStart={onDragStart}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-500",
            fill
              ? `absolute inset-0 h-full w-full ${fitClass}`
              : `h-full w-full ${fitClass}`,
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

/** Full-width hero — 1200px wide, 16:9 */
export function ProductHero(props: Omit<FashionistarImageProps, "transformation" | "aspectRatio">) {
  return <FashionistarImage {...props} transformation="hero" priority aspectRatio="16/9" />;
}

/** Circular vendor/user avatar — 150×150 face-crop */
export function AvatarImage(props: Omit<FashionistarImageProps, "transformation" | "aspectRatio">) {
  return (
    <FashionistarImage
      {...props}
      transformation="avatar"
      aspectRatio="1/1"
      className={cn("rounded-full", props.className)}
    />
  );
}

/**
 * NextFillImage — uses Next.js built-in `<Image fill>` for cases where
 * you need exact Next.js image optimization (domain whitelisting, automatic
 * WebP, etc.) inside a measured container. Parent MUST have position:relative
 * and an explicit height.
 */
export function NextFillImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (isInvalidSrc(src)) {
    return (
      <FashionistarPlaceholder className={cn("absolute inset-0 w-full h-full", className)} />
    );
  }
  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "100vw"}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
