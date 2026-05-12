import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCatalogCollections,
  getCatalogCategories,
} from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import CollectionProductsClient from "./CollectionProductsClient";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Allow slugs not in generateStaticParams to be rendered at request time
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const collections = await getCatalogCollections();
    return collections.slice(0, 50).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collections = await getCatalogCollections();
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) return { title: "Collection | Fashionistar" };

  return {
    title: `${collection.title} | Fashionistar Collections`,
    description:
      collection.description ||
      `Browse the ${collection.title} collection on Fashionistar — AI-powered fashion commerce.`,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: collection.title,
      description: collection.description || "",
      url: `/collections/${slug}`,
      type: "website",
      images: collection.image_url
        ? [{ url: collection.image_url, alt: collection.title }]
        : undefined,
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const [collections, categories] = await Promise.all([
    getCatalogCollections(),
    getCatalogCategories(),
  ]);

  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const otherCollections = collections
    .filter((c) => c.slug !== slug)
    .slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <section className="relative min-h-[320px] md:min-h-[420px] bg-[#01454A] flex items-end overflow-hidden">
        {collection.background_image_url || collection.image_url ? (
          <Image
            src={
              collection.background_image_url ||
              collection.image_url ||
              "/gown.svg"
            }
            alt={collection.title}
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
        ) : null}

        <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 space-y-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 font-raleway">
            <Link href="/" className="hover:text-[#fda600] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/collections"
              className="hover:text-[#fda600] transition-colors"
            >
              Collections
            </Link>
            <span>/</span>
            <span className="text-white">{collection.title}</span>
          </nav>

          {collection.sub_title ? (
            <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
              {collection.sub_title}
            </p>
          ) : null}
          <h1 className="font-bon_foyage text-4xl leading-none text-white md:text-6xl lg:text-7xl">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="font-raleway text-base leading-7 text-white/80 max-w-xl">
              {collection.description}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/categories"
              className="rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#fda600]/90 transition-colors"
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

      {/* ── Category Filter Chips ─────────────────────────────────── */}
      {categories.length > 0 ? (
        <section className="px-5 py-6 md:px-10 lg:px-20 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/collections/${slug}`}
              className="rounded-full border border-[hsl(var(--accent))] bg-[hsl(var(--accent))] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-foreground))]"
            >
              All
            </Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories?q=${cat.slug}`}
                className="rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Products Grid ─────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            Products in this Collection
          </h2>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <CollectionProductsClient collectionSlug={slug} />
        </Suspense>
      </section>

      {/* ── Other Collections ─────────────────────────────────────── */}
      {otherCollections.length > 0 ? (
        <section className="bg-[#F8F9FC] px-5 py-12 md:px-10 lg:px-20 space-y-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            More Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={col.image_url || "/gown.svg"}
                    alt={col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
                    {col.sub_title || "Collection"}
                  </p>
                  <h3 className="font-raleway font-bold text-lg text-[#141414]">
                    {col.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
