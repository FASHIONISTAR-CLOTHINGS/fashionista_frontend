/**
 * schemas.ts — Structured JSON-LD schema generators for FASHIONISTAR.
 *
 * Phase 4 — SEO & Performance (FASHIONISTAR Enterprise Blueprint)
 *
 * Provides factory functions for generating Google-compliant JSON-LD structured
 * data payloads. These are consumed by RSC pages and passed to <JsonLdScript />.
 *
 * Schemas implemented:
 *   - WebSite         (SearchAction, sitelinks search box)
 *   - Organization    (brand entity)
 *   - ItemList        (featured products list on homepage)
 *   - Product         (individual product detail pages)
 *   - BreadcrumbList  (category hierarchy on catalog pages)
 *
 * References:
 *   https://schema.org/WebSite
 *   https://schema.org/Product
 *   https://schema.org/BreadcrumbList
 *   https://developers.google.com/search/docs/appearance/structured-data
 */

const SITE_URL = "https://fashionistar.net";
const BRAND_NAME = "Fashionistar";

// ─────────────────────────────────────────────────────────────────────────────
// Input Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaProduct {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  images?: string[];
  base_price?: number | string | null;
  stock_qty?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  vendor_name?: string | null;
  vendor_brand_name?: string | null;
  sku?: string | null;
}

export interface SchemaBreadcrumb {
  name: string;
  slug: string;
}

export interface SchemaListItem {
  title: string;
  slug: string;
  cover_image_url?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a WebSite schema with SearchAction (enables sitelinks search box).
 * Inject once — in the root layout or homepage.
 */
export function generateWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Nigeria's premier AI-powered fashion e-commerce platform connecting clients with verified tailors for bespoke, perfect-fit garments.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate an Organization schema (brand entity knowledge graph card).
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [
      "https://twitter.com/fashionistar",
      "https://www.instagram.com/fashionistar",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
  };
}

/**
 * Generate an ItemList schema for a list of products shown on the homepage
 * or any catalog page (featured, hot deals, etc.).
 *
 * @param products  Array of product summary objects.
 * @param listName  Human-readable list name (e.g. "Featured Products").
 */
export function generateItemListSchema(
  products: SchemaListItem[],
  listName = "Featured Products"
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 12).map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.title,
      url: `${SITE_URL}/products/${p.slug}`,
      image: p.cover_image_url ?? undefined,
    })),
  };
}

/**
 * Generate a full Product schema for individual product detail pages.
 * Includes offers, aggregate rating, and brand entity.
 *
 * @param product  Full product detail object.
 * @param reviews  Optional array of review counts for aggregate rating.
 */
export function generateProductSchema(
  product: SchemaProduct,
  reviewCount?: number
): Record<string, unknown> {
  const price =
    product.base_price != null ? Number(product.base_price) : undefined;
  const inStock =
    product.stock_qty == null || product.stock_qty > 0;
  const images = [
    ...(product.images ?? []),
    ...(product.cover_image_url ? [product.cover_image_url] : []),
  ].filter(Boolean);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: images.length > 0 ? images : undefined,
    sku: product.sku ?? `FS-${product.id}`,
    mpn: `FS-MPN-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.vendor_brand_name ?? BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: product.vendor_name
        ? {
            "@type": "Store",
            name: product.vendor_name,
          }
        : undefined,
    },
  };

  // Aggregate rating — only add when we have meaningful data
  const ratingValue = product.rating_avg;
  const ratingCount = reviewCount ?? product.rating_count;
  if (ratingValue && ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(ratingValue * 10) / 10,
      bestRating: 5,
      worstRating: 1,
      reviewCount: ratingCount,
    };
  }

  return schema;
}

/**
 * Generate a BreadcrumbList schema for category hierarchy navigation.
 * Always prepends the homepage as position 1.
 *
 * @param crumbs  Ordered array of { name, slug } from root → leaf.
 */
export function generateBreadcrumbSchema(
  crumbs: SchemaBreadcrumb[]
): Record<string, unknown> {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ...crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: crumb.name,
      item: `${SITE_URL}/categories/${crumb.slug}`,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
