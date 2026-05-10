import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCatalogBrands } from "@/features/catalog";

export const metadata: Metadata = {
  title: "Fashion Brands | Fashionistar",
  description:
    "Explore curated Nigerian and African fashion brands on Fashionistar — the AI-powered platform for bespoke fashion commerce.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  let brands: Awaited<ReturnType<typeof getCatalogBrands>> = [];
  try {
    brands = await getCatalogBrands();
  } catch {
    brands = [];
  }

  return (
    <main className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-10 lg:px-20 bg-[#0D0D0D] text-white">
        <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-4">
          Discover
        </p>
        <h1 className="font-bon_foyage text-5xl leading-none md:text-7xl">
          Fashion Brands
        </h1>
        <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
          Browse our curated network of Nigerian and African fashion brands.
          Every brand on Fashionistar is vetted for quality, authenticity, and
          craftsmanship.
        </p>
      </section>

      {/* ── Brand Grid ───────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-10 lg:px-20">
        {brands.length === 0 ? (
          <p className="text-center text-[#475367] font-raleway py-20">
            No brands available yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                {brand.image_url ? (
                  <div className="relative h-24 w-full mb-4">
                    <Image
                      src={brand.image_url}
                      alt={brand.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-full mb-4 rounded-xl bg-[#F0F2F5] flex items-center justify-center">
                    <span className="text-4xl font-bon_foyage text-[#D9D9D9]">
                      {brand.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h2 className="font-raleway font-bold text-sm text-[#141414] text-center">
                  {brand.title}
                </h2>
                {brand.description ? (
                  <p className="mt-1 font-raleway text-xs text-[#6E7C8C] text-center line-clamp-2">
                    {brand.description}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
