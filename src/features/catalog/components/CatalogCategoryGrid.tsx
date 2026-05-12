import Image from "next/image";
import Link from "next/link";

import { getCatalogCategories } from "../api/catalog.server";
import { fallbackCatalogCategories } from "../lib/catalog-fallbacks";

interface CatalogCategoryGridProps {
  limit?: number;
  showCta?: boolean;
}

export default async function CatalogCategoryGrid({
  limit,
  showCta = true,
}: CatalogCategoryGridProps) {
  const categories = await getCatalogCategories();
  const items = (categories.length ? categories : fallbackCatalogCategories).slice(0, limit);

  return (
    <section className="space-y-6 bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-bon_foyage text-[30px] text-[hsl(var(--foreground))] md:text-5xl">
          Shop by Category
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Explore fashion domains powered by Fashionistar catalog metadata.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/categories/${item.slug}`}
            className="card-shadow card-shadow-hover group flex min-h-[165px] flex-col justify-between rounded-lg border border-border bg-card p-4 text-card-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:min-h-[245px] md:p-6"
          >
            <div className="relative flex h-20 items-center justify-center rounded-lg bg-[hsl(var(--brand-cream))] md:h-32">
              <Image
                src={item.image_url || item.image || "/minimalist.svg"}
                alt={item.title}
                width={96}
                height={96}
                sizes="(max-width: 768px) 56px, 96px"
                className="h-14 w-14 object-contain md:h-24 md:w-24"
              />
            </div>
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-[hsl(var(--accent)/0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent))]">
                Catalog
              </span>
              <p className="text-base font-semibold leading-6 md:text-xl">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {showCta ? (
        <div className="flex justify-center">
          <Link
            href="/categories"
            className="rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-[hsl(var(--brand-green-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:text-lg"
          >
            More Categories
          </Link>
        </div>
      ) : null}
    </section>
  );
}
