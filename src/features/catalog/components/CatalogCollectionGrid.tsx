import Image from "next/image";
import Link from "next/link";

import { getCatalogCollections } from "../api/catalog.server";
import { fallbackCatalogCollections } from "../lib/catalog-fallbacks";

interface CatalogCollectionGridProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
  limit?: number;
  showCta?: boolean;
}

export default async function CatalogCollectionGrid({
  searchParams,
  limit,
  showCta = true,
}: CatalogCollectionGridProps) {
  const resolvedParams = await Promise.resolve(searchParams ?? {});
  const selectedCollection = typeof resolvedParams.collection === "string" ? resolvedParams.collection : "";
  const collections = await getCatalogCollections();
  const baseItems = collections.length ? collections : fallbackCatalogCollections;
  const filteredItems = selectedCollection
    ? baseItems.filter((item) => item.slug === selectedCollection)
    : baseItems;
  const items = (filteredItems.length ? filteredItems : baseItems).slice(0, limit);
  const navItems = baseItems.slice(0, 4);

  return (
    <section className="space-y-6 bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-bon_foyage text-[30px] text-[hsl(var(--foreground))] md:text-5xl">
          Latest Collections
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Curated drops for ready-to-wear, custom tailoring, and premium vendor showcases.
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Collection filters">
        <Link
          href="/"
          scroll={false}
          className={`rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold transition md:px-6 md:py-3 ${
            !selectedCollection
              ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
              : "text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
          }`}
        >
          All
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={`/?collection=${item.slug}`}
            scroll={false}
            className={`rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold transition md:px-6 md:py-3 ${
              selectedCollection === item.slug
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/collections/${item.slug}`}
            className="card-shadow card-shadow-hover group overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
          >
            <div className="relative h-56 bg-[hsl(var(--brand-cream))]">
              <Image
                src={item.image_url || item.image || "/gown.svg"}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-full w-full object-contain p-6"
              />
              <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent-foreground))]">
                Featured
              </span>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                {item.sub_title || "Fashionistar edit"}
              </p>
              <h3 className="text-xl font-semibold leading-7">{item.title}</h3>
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {item.description || "A curated collection for precise fit and modern fashion commerce."}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {showCta ? (
        <div className="flex justify-center">
          <Link
            href="/collections"
            className="rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-[hsl(var(--brand-green-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] md:text-lg"
          >
            See All
          </Link>
        </div>
      ) : null}
    </section>
  );
}
