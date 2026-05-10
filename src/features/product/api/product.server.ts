/**
 * @file product.server.ts
 * @description Server-only helpers for product metadata, ISR generation, and PPR shells.
 *
 * These functions use the native `fetch()` with Next.js cache tags and ISR
 * revalidation. They are server-only — never imported in client components.
 *
 * Client interactivity (add to cart, wishlist) is always handled by TanStack
 * Query hooks with `apiAsync` / `apiSync`.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Endpoints:
 *   fetchProductDetailServer  → /api/v1/ninja/products/<slug>/        (ISR 300s)
 *   fetchProductBundleServer  → /api/v1/ninja/products/<slug>/bundle/ (ISR 60s)
 *   fetchFeaturedProductsServer → /api/v1/ninja/products/featured/    (ISR 600s)
 *   fetchProductSlugsServer   → /api/v1/ninja/products/slugs/         (ISR 3600s)
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ProductDetailSchema, ProductDetailBundleSchema } from "../schemas/product.schemas";
import type { ProductDetail, ProductDetailBundle, ProductListItem } from "../types/product.types";
import { unwrapApiData } from "@/core/api/response";

const METADATA_TIMEOUT_MS = 2_500;
const DEFAULT_BACKEND = "http://127.0.0.1:8000";

/** Returns the internal backend base URL (server-to-server, skips CDN). */
function backendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    DEFAULT_BACKEND
  );
}

/** Shared headers for internal server-to-server requests. */
function serverHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL FETCH HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function serverFetch<T>(
  path: string,
  revalidate: number,
  tags?: string[],
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), METADATA_TIMEOUT_MS);

  try {
    const response = await fetch(`${backendBaseUrl()}${path}`, {
      headers: serverHeaders(),
      next: {
        revalidate,
        tags,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[server fetch] ${response.status} for ${path}`);
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[server fetch] Error for ${path}:`, error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL  (used for generateMetadata + PPR shell)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch product detail server-side for SEO metadata generation.
 * Revalidates every 5 minutes (ISR). Fails gracefully.
 *
 * @example
 *   // In app/shop/[slug]/page.tsx
 *   export async function generateMetadata({ params }) {
 *     const product = await getProductDetailForMetadata(params.slug);
 *     if (!product) return { title: "Product Not Found" };
 *     return { title: product.title, description: product.short_description };
 *   }
 */
export async function getProductDetailForMetadata(
  slug: string,
): Promise<ProductDetail | null> {
  const raw = await serverFetch<unknown>(
    `/api/v1/ninja/products/${encodeURIComponent(slug)}/`,
    300,
    [`product-${slug}`, "products"],
  );
  if (!raw) return null;
  const parsed = ProductDetailSchema.safeParse(unwrapApiData(raw));
  return parsed.success ? (parsed.data as ProductDetail) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT BUNDLE  (used for full SSR pass on PDP)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the full product bundle (product + reviews + wishlist) server-side.
 * Used to prefill TanStack Query cache for RSC-rendered PDPs.
 * Revalidates every 60 seconds.
 *
 * @example
 *   // In app/shop/[slug]/page.tsx
 *   export default async function ProductPage({ params }) {
 *     const bundle = await getProductBundleServer(params.slug);
 *     // Pass as dehydratedState to HydrationBoundary
 *   }
 */
export async function getProductBundleServer(
  slug: string,
): Promise<ProductDetailBundle | null> {
  const raw = await serverFetch<unknown>(
    `/api/v1/ninja/products/${encodeURIComponent(slug)}/bundle/`,
    60,
    [`product-bundle-${slug}`, "products"],
  );
  if (!raw) return null;
  const parsed = ProductDetailBundleSchema.safeParse(unwrapApiData(raw));
  return parsed.success ? (parsed.data as ProductDetailBundle) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED PRODUCTS  (for landing page RSC)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch featured products server-side.
 * Revalidates every 10 minutes — featured rarely changes.
 */
export async function getFeaturedProductsServer(): Promise<ProductListItem[]> {
  const raw = await serverFetch<{ data?: ProductListItem[] }>(
    `/api/v1/ninja/products/featured/`,
    600,
    ["products-featured", "products"],
  );
  return raw?.data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SLUGS  (for generateStaticParams)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all published product slugs for `generateStaticParams`.
 * Used in ISR + static generation to pre-render the PDP shell.
 * Revalidates every hour.
 *
 * @example
 *   export async function generateStaticParams() {
 *     const slugs = await getProductSlugsServer();
 *     return slugs.map((slug) => ({ slug }));
 *   }
 */
export async function getProductSlugsServer(): Promise<string[]> {
  const raw = await serverFetch<{ data?: Array<{ slug: string }> }>(
    `/api/v1/ninja/products/slugs/`,
    3600,
    ["product-slugs"],
  );
  return raw?.data?.map((p) => p.slug) ?? [];
}
