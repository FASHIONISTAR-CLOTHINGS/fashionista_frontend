/**
 * @file /app/(home)/products/page.tsx
 * @description Fashionistar main product catalog listing page — RSC wrapper.
 *
 * Architecture:
 *   - RSC: generateMetadata for SEO (dynamic title/description based on search params)
 *   - Client interactivity delegated to ProductsClient.tsx
 *   - Suspense boundary wraps the client component for streaming
 *
 * SEO:
 *   - Dynamic title based on search query or category filter
 *   - Canonical URL with query params preserved
 *   - OpenGraph metadata for social sharing
 *   - JSON-LD ItemList structured data
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProductsClient from "./ProductsClient";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata — dynamic SEO from URL search params
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;

  const title = search
    ? `"${search}" — Search Results | Fashionistar`
    : category
    ? `${category} — Shop by Category | Fashionistar`
    : "All Products — Shop Fashion Online | Fashionistar";

  const description = search
    ? `Search results for "${search}" on Fashionistar — AI-powered fashion marketplace in Nigeria. Find clothing, accessories, and more.`
    : category
    ? `Shop ${category} on Fashionistar — premium fashion from verified vendors across Nigeria. AI-powered recommendations.`
    : "Browse all products on Fashionistar — Nigeria's AI-powered fashion marketplace. Clothing, accessories, and custom tailoring from verified vendors.";

  const canonical = search
    ? `/products?q=${encodeURIComponent(search)}`
    : category
    ? `/products?category=${encodeURIComponent(category)}`
    : "/products";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `https://fashionistar.net${canonical}`,
      type: "website",
      siteName: "Fashionistar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD structured data
// ─────────────────────────────────────────────────────────────────────────────

function ProductListJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fashionistar Product Catalog",
    description: "Browse all products on Fashionistar — Nigeria's AI-powered fashion marketplace.",
    url: "https://fashionistar.net/products",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page (RSC)
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <>
      <ProductListJsonLd />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#01454A]" />
          </div>
        }
      >
        <ProductsClient />
      </Suspense>
    </>
  );
}
