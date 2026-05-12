/**
 * Product Cache Layer — Next.js 16 Stable API
 *
 * Uses `unstable_cache` from next/cache for pragmatic route-level caching.
 * The repo still relies on this while broader cache-components adoption is phased in.
 *
 * Provides:
 *   - getCachedProducts   — paginated product listing (5min revalidation)
 *   - getCachedProduct    — single product by slug (10min revalidation)
 *   - getCachedCategories — all categories (15min revalidation)
 *   - getCachedCollections — all collections (15min revalidation)
 */
import { unstable_cache } from "next/cache";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
const NINJA_URL =
  process.env.NEXT_PUBLIC_API_NINJA_URL ||
  process.env.NEXT_PUBLIC_API_V1_NINJA_URL ||
  `${BACKEND_URL}/api/v1/ninja`;

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function fetchFromNinja<T>(path: string, fallback: T): Promise<T> {
  try {
    const base = NINJA_URL.endsWith("/") ? NINJA_URL : `${NINJA_URL}/`;
    const res = await fetch(new URL(path.replace(/^\//, ""), base), {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    });

    if (!res.ok) return fallback;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return fallback;
  }
}

// ── Products ─────────────────────────────────────────────────────────────────
export const getCachedProducts = unstable_cache(
  async (category: string = "all", page: number = 1) => {
    const params = new URLSearchParams({ page: String(page) });
    if (category !== "all") params.set("category", category);
    return fetchFromNinja(`products/?${params.toString()}`, {
      results: [],
      count: 0,
    });
  },
  ["products"],
  {
    tags: ["products"],
    revalidate: 300, // 5 minutes
  },
);

// ── Single Product ────────────────────────────────────────────────────────────
export const getCachedProduct = unstable_cache(
  async (slug: string) => {
    return fetchFromNinja<Record<string, unknown> | null>(
      `products/${slug}/`,
      null,
    );
  },
  ["product"],
  {
    tags: ["product"],
    revalidate: 600, // 10 minutes
  },
);

// ── Categories ────────────────────────────────────────────────────────────────
export const getCachedCategories = unstable_cache(
  async () => {
    return fetchFromNinja<unknown[]>("catalog/categories/", []);
  },
  ["categories"],
  {
    tags: ["categories"],
    revalidate: 900, // 15 minutes
  },
);

// ── Collections ───────────────────────────────────────────────────────────────
export const getCachedCollections = unstable_cache(
  async () => {
    return fetchFromNinja<unknown[]>("catalog/collections/", []);
  },
  ["collections"],
  {
    tags: ["collections"],
    revalidate: 900, // 15 minutes
  },
);
