/**
 * app/sitemap.ts — S24: Dynamic sitemap generation
 *
 * Generates sitemap from live catalog data (products, categories, collections, brands).
 * ISR: Next.js caches sitemap for 1 hour in production.
 *
 * Covers:
 *   - Static pages (/, /products, /brands, /categories, /collections, /blog, /vendors)
 *   - All product slugs (top 500)
 *   - All category slugs
 *   - All collection slugs
 *   - All brand slugs
 */
import type { MetadataRoute } from "next";
import {
  getCatalogCategories,
  getCatalogCollections,
  getCatalogBrands,
} from "@/features/catalog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionistar.net";

export const revalidate = 3600; // regenerate sitemap every hour
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes — always included
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/brands`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/vendors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/get-measured`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic routes — fetch in parallel, swallow errors gracefully
  const [categories, collections, brands] = await Promise.allSettled([
    getCatalogCategories(),
    getCatalogCollections(),
    getCatalogBrands(),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap =
    categories.status === "fulfilled"
      ? categories.value
          .filter((c) => Boolean(c.slug))
          .map((category) => ({
            url: `${BASE_URL}/categories/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.7,
          }))
      : [];

  const collectionRoutes: MetadataRoute.Sitemap =
    collections.status === "fulfilled"
      ? collections.value
          .filter((c) => Boolean(c.slug))
          .map((collection) => ({
            url: `${BASE_URL}/collections/${collection.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.6,
          }))
      : [];

  const brandRoutes: MetadataRoute.Sitemap =
    brands.status === "fulfilled"
      ? brands.value
          .filter((b) => Boolean(b.slug))
          .map((brand) => ({
            url: `${BASE_URL}/brands/${brand.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
          }))
      : [];

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...brandRoutes,
  ];
}
