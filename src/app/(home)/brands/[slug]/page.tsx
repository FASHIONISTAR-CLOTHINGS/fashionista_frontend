import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCatalogBrands } from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import BrandProductsClient from "./BrandProductsClient";

interface BrandDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const brands = await getCatalogBrands();
    return brands.slice(0, 50).map((b) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getCatalogBrands();
  const brand = brands.find((b) => b.slug === slug);

  if (!brand) return { title: "Brand | Fashionistar" };

  return {
    title: `${brand.title} | Fashionistar Brands`,
    description:
      brand.description ||
      `Explore ${brand.title} — curated Nigerian fashion on Fashionistar.`,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: brand.title,
      description: brand.description || "",
      url: `/brands/${slug}`,
      type: "website",
      images: brand.image_url
        ? [{ url: brand.image_url, alt: brand.title }]
        : undefined,
    },
  };
}

export default async function BrandDetailPage({
  params,
}: BrandDetailPageProps) {
  const { slug } = await params;
  const brands = await getCatalogBrands();
  const brand = brands.find((b) => b.slug === slug);

  if (!brand) notFound();

  const otherBrands = brands.filter((b) => b.slug !== slug).slice(0, 4);

  return (
    <div className="bg-background text-foreground">
      {/* ── Brand Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-[300px] md:min-h-[380px] bg-[#0D0D0D] flex items-end overflow-hidden">
        {brand.image_url ? (
          <Image
            src={brand.image_url}
            alt={brand.title}
            fill
            sizes="100vw"
            className="object-contain p-16 opacity-20"
            priority
          />
        ) : null}

        <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 space-y-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 font-raleway">
            <Link href="/" className="hover:text-[#fda600] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-[#fda600] transition-colors">
              Brands
            </Link>
            <span>/</span>
            <span className="text-white">{brand.title}</span>
          </nav>

          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600]">
            Brand
          </p>
          <h1 className="font-bon_foyage text-5xl leading-none text-white md:text-7xl">
            {brand.title}
          </h1>
          {brand.description ? (
            <p className="font-raleway text-base leading-7 text-white/75 max-w-xl">
              {brand.description}
            </p>
          ) : null}

          <Link
            href="/products"
            className="inline-block rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#fda600]/90 transition-colors"
          >
            Shop Products
          </Link>
        </div>
      </section>

      {/* ── Brand Products ───────────────────────────────────────────── */}
      <section className="px-5 py-12 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            {brand.title} Products
          </h2>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <BrandProductsClient brandSlug={slug} />
        </Suspense>
      </section>

      {/* ── Other Brands ─────────────────────────────────────────────── */}
      {otherBrands.length > 0 ? (
        <section className="bg-[#F8F9FC] px-5 py-12 md:px-10 lg:px-20 space-y-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            More Brands
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherBrands.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {b.image_url ? (
                  <div className="relative h-20 w-full mb-4">
                    <Image
                      src={b.image_url}
                      alt={b.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-full mb-4 rounded-xl bg-[#F0F2F5] flex items-center justify-center">
                    <span className="text-3xl font-bon_foyage text-[#D9D9D9]">
                      {b.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-raleway font-bold text-sm text-[#141414] text-center">
                  {b.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
