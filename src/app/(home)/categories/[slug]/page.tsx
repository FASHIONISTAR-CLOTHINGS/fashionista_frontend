/**
 * app/(home)/categories/[slug]/page.tsx  — Phase C1 (Upgraded)
 *
 * Category detail page — full enterprise implementation.
 *
 * Architecture:
 *   - RSC: getCategoryDetail() (new endpoint — returns meta_title,
 *     meta_description, children sub-categories, cached_product_count)
 *     + getCatalogBrands() for brand filter chips — parallel fetch
 *   - ISR: revalidate 300s, tagged ["categories", "category-{slug}"]
 *   - Sub-category grid from response.children (zero extra DB queries)
 *   - Product grid: Suspense-wrapped client component (infinite scroll)
 *   - SEO: dynamic metadata using category meta_title / meta_description
 *   - JSON-LD: CollectionPage structured data
 *   - data-testid on key regions for Playwright E2E
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCategoryDetail,
  getCatalogBrands,
  getCatalogCategories,
} from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import CategoryProductsClient from "./CategoryProductsClient";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CategorySlugPageProps {
  params: Promise<{ slug: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata — dynamic SEO from model fields
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: CategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDetail(slug);

  if (!category) return { title: "Category | Fashionistar" };

  const title =
    category.meta_title ||
    `${category.title || category.name} | Fashionistar`;
  const description =
    category.meta_description ||
    `Shop ${category.name} on Fashionistar — AI-powered fashion with expert tailors across Nigeria.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: category.title || category.name,
      description,
      url: `https://fashionistar.net/categories/${slug}`,
      type: "website",
      images:
        category.banner_image || category.image_url
          ? [
              {
                url: (category.banner_image || category.image_url) as string,
                alt: category.name,
              },
            ]
          : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-category card
// ─────────────────────────────────────────────────────────────────────────────

interface SubCategoryChild {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  icon_class?: string;
  color_hex?: string;
}

function SubCategoryCard({ child }: { child: SubCategoryChild }) {
  const bgColor = child.color_hex
    ? `${child.color_hex}18`
    : "rgba(1, 69, 74, 0.08)";
  const borderColor = child.color_hex
    ? `${child.color_hex}40`
    : "rgba(1, 69, 74, 0.15)";

  return (
    <Link
      href={`/categories/${child.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div
        className="relative h-14 w-14 overflow-hidden rounded-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {child.image ? (
          <Image
            src={child.image}
            alt={child.name}
            fill
            sizes="56px"
            className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-300"
          />
        ) : child.icon_class ? (
          <span className="text-2xl">{child.icon_class}</span>
        ) : (
          <span
            className="text-xl font-bold"
            style={{ color: child.color_hex || "#01454A" }}
          >
            {child.name[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-foreground capitalize leading-snug">
        {child.name}
      </p>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function CategorySlugPage({
  params,
}: CategorySlugPageProps) {
  const { slug } = await params;

  // Parallel fetch: detail (with children) + brands for filter chips
  const [category, brands] = await Promise.all([
    getCategoryDetail(slug),
    getCatalogBrands(),
  ]);

  if (!category) notFound();

  const children = (category as { children?: SubCategoryChild[] }).children ?? [];
  const productCount =
    (category as { cached_product_count?: number }).cached_product_count ?? null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title || category.name,
    description:
      category.meta_description ||
      `Shop ${category.name} fashion on Fashionistar`,
    url: `https://fashionistar.net/categories/${slug}`,
    image: category.banner_image || category.image_url || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background text-foreground" data-testid="category-detail-page">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[280px] md:min-h-[380px] bg-[#01454A] flex items-end overflow-hidden"
          data-testid="category-hero"
        >
          {/* Banner or category image */}
          {(category.banner_image || category.image_url) && (
            <Image
              src={(category.banner_image || category.image_url) as string}
              alt={category.name}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
              priority
            />
          )}
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#01454A] via-[#01454A]/50 to-transparent" />

          <div className="relative z-10 px-5 py-10 md:px-10 lg:px-20 w-full max-w-4xl space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 font-raleway" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FDA600] transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/categories" className="hover:text-[#FDA600] transition-colors">Categories</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/90 capitalize">{category.title || category.name}</span>
            </nav>

            <h1 className="font-bon_foyage text-4xl text-white leading-tight md:text-6xl capitalize">
              {category.title || category.name}
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 font-raleway">
              {productCount !== null && productCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {productCount.toLocaleString()} Products
                </span>
              )}
              {children.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  {children.length} Sub-categories
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={`/categories/${slug}`}
                className="rounded-full bg-[#FDA600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#FDA600]/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Shop Now
              </Link>
              <Link
                href="/get-measured"
                className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                Get Measured
              </Link>
            </div>
          </div>
        </section>

        {/* ── Sub-categories grid ──────────────────────────────────────────── */}
        {children.length > 0 && (
          <section
            className="px-5 py-10 md:px-10 lg:px-20 border-b border-border"
            data-testid="sub-category-grid"
          >
            <h2 className="font-bon_foyage text-2xl text-foreground mb-6 md:text-3xl">
              Shop by Type
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {children.map((child) => (
                <SubCategoryCard key={child.id} child={child} />
              ))}
            </div>
          </section>
        )}

        {/* ── Brand filter chips ───────────────────────────────────────────── */}
        {brands.length > 0 && (
          <section
            className="border-b border-border px-5 py-4 md:px-10 lg:px-20"
            data-testid="brand-filter-chips"
          >
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/categories/${slug}`}
                className="rounded-full border border-[#01454A] bg-[#01454A] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white"
              >
                All Brands
              </Link>
              {brands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/categories/${slug}?brand=${brand.slug}`}
                  className="rounded-full border border-[#01454A]/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#01454A] hover:bg-[#01454A] hover:text-white hover:border-[#01454A] transition-all duration-200"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Products Grid ─────────────────────────────────────────────────── */}
        <section
          className="px-5 py-10 md:px-10 lg:px-20"
          data-testid="category-products-section"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl capitalize">
              {category.title || category.name}
            </h2>
            {productCount !== null && productCount > 0 && (
              <span className="text-sm text-muted-foreground font-raleway">
                {productCount.toLocaleString()} items
              </span>
            )}
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CategoryProductsClient categorySlug={slug} />
          </Suspense>
        </section>

        {/* ── Other categories carousel ────────────────────────────────────── */}
        <OtherCategoriesSection currentSlug={slug} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Other Categories (async RSC sub-component — separate fetch)
// ─────────────────────────────────────────────────────────────────────────────

async function OtherCategoriesSection({ currentSlug }: { currentSlug: string }) {
  const all = await getCatalogCategories();
  const others = all.filter((c) => c.slug !== currentSlug).slice(0, 8);
  if (!others.length) return null;

  return (
    <section
      className="bg-[#F8F9FC] px-5 py-14 md:px-10 lg:px-20 space-y-8"
      data-testid="other-categories-section"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
          More Categories
        </h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-[#01454A] hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {others.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#01454A]/08">
              <Image
                src={cat.image_url || "/gown.svg"}
                alt={cat.name}
                fill
                sizes="64px"
                className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <p className="text-xs font-semibold text-foreground capitalize leading-snug">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
