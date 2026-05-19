import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getProductDetailForMetadata,
  getProductSlugsServer,
} from "@/features/product/api/product.server";
import type { ProductDetail } from "@/features/product";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductDetailSkeleton } from "./ProductDetailSkeleton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const PRODUCT_VALIDATION_SLUG = "__product_validation__";

export async function generateStaticParams() {
  try {
    const slugs = await getProductSlugsServer();
    const params = slugs
      .slice(0, 48)
      .filter(Boolean)
      .map((slug) => ({ slug }));

    return params.length > 0 ? params : [{ slug: PRODUCT_VALIDATION_SLUG }];
  } catch {
    return [{ slug: PRODUCT_VALIDATION_SLUG }];
  }
}

/**
 * Dynamic metadata for SEO — resolves product title from slug if possible.
 * Falls back to a generic title while client hydrates.
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PRODUCT_VALIDATION_SLUG) {
    return {
      title: "Product | FASHIONISTAR AI",
    };
  }
  const product = await getProductDetailForMetadata(slug);
  const cleanSlug =
    product?.title ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const description =
    product?.description?.slice(0, 155) ||
    `Shop ${cleanSlug} on FASHIONISTAR AI with AI-powered measurements, secure checkout, and direct tailor-client collaboration.`;
  const image = product?.cover_image_url ?? "/og-image.png";

  return {
    title: cleanSlug,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: `${cleanSlug} | FASHIONISTAR AI`,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: cleanSlug }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanSlug} | FASHIONISTAR AI`,
      description,
      images: [image],
    },
  };
}

/**
 * Product detail page — PPR pattern.
 * Static shell + Suspense boundary; detail hydrated via TanStack Query.
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  if (slug === PRODUCT_VALIDATION_SLUG) {
    notFound();
  }
  const initialProduct: ProductDetail | null = await getProductDetailForMetadata(slug);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient slug={slug} initialProduct={initialProduct} />
      </Suspense>
    </div>
  );
}
