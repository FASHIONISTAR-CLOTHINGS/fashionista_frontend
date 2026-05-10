import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCatalogCategories,
  getCatalogBrands,
} from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import CategoryProductsClient from "./CategoryProductsClient";

interface CategorySlugPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const categories = await getCatalogCategories();
    return categories.slice(0, 100).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCatalogCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) return { title: "Category | Fashionistar" };

  return {
    title: `${category.title || category.name} | Fashionistar`,
    description: `Shop ${category.title || category.name} on Fashionistar — AI-powered fashion commerce with precise body measurements and professional tailoring.`,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: category.title || category.name,
      url: `/categories/${slug}`,
      type: "website",
      images: category.image_url
        ? [{ url: category.image_url, alt: category.name }]
        : undefined,
    },
  };
}

export default async function CategorySlugPage({
  params,
}: CategorySlugPageProps) {
  const { slug } = await params;

  const [categories, brands] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const otherCategories = categories.filter((c) => c.slug !== slug).slice(0, 6);

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[280px] md:min-h-[360px] bg-[#01454A] flex items-end overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            priority
          />
        ) : null}

        <div className="relative z-10 px-5 py-10 md:px-10 lg:px-20 w-full space-y-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 font-raleway">
            <Link href="/" className="hover:text-[#fda600] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/categories"
              className="hover:text-[#fda600] transition-colors"
            >
              Categories
            </Link>
            <span>/</span>
            <span className="text-white capitalize">
              {category.title || category.name}
            </span>
          </nav>

          <h1 className="font-bon_foyage text-4xl text-white leading-none md:text-6xl lg:text-7xl capitalize">
            {category.title || category.name}
          </h1>

          <div className="flex items-center gap-3 pt-1">
            <Link
              href={`/categories/${slug}`}
              className="rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#e09500] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/get-measured"
              className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Get Measured
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand filter chips ────────────────────────────────────────────── */}
      {brands.length > 0 ? (
        <section className="border-b border-border px-5 py-5 md:px-10 lg:px-20">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categories/${slug}`}
              className="rounded-full border border-[hsl(var(--accent))] bg-[hsl(var(--accent))] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-foreground))]"
            >
              All Brands
            </Link>
            {brands.slice(0, 8).map((brand) => (
              <Link
                key={brand.id}
                href={`/categories/${slug}?brand=${brand.slug}`}
                className="rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Products Grid ────────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl capitalize">
            {category.title || category.name} Products
          </h2>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <CategoryProductsClient categorySlug={slug} />
        </Suspense>
      </section>

      {/* ── Other Categories ─────────────────────────────────────────────── */}
      {otherCategories.length > 0 ? (
        <section className="bg-[#F8F9FC] px-5 py-12 md:px-10 lg:px-20 space-y-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            More Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {otherCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[hsl(var(--primary)/0.08)]">
                  <Image
                    src={cat.image_url || "/gown.svg"}
                    alt={cat.name}
                    fill
                    sizes="64px"
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-raleway text-xs font-semibold text-[#141414] capitalize">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
