"use client";

/**
 * @file CatalogPageClient.tsx
 * @description Client-side product grid for the catalog/categories page.
 * Manages URL-driven filters and renders ProductGrid.
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "@/features/product/components/ProductGrid";
import { useCatalogBrands, useCatalogCategories } from "@/features/catalog";

const ORDERINGS = [
  { value: "-created_at", label: "Newest" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-average_rating", label: "Top Rated" },
] as const;

interface CatalogPageClientProps {
  category?: string;
  brand?: string;
  search?: string;
  ordering?: string;
}

export default function CatalogPageClient({
  category,
  brand,
  search,
  ordering = "-created_at",
}: CatalogPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
  );

  const { data: categories = [], isLoading: categoriesLoading } =
    useCatalogCategories();
  const { data: brands = [] } = useCatalogBrands();
  const activeCategory = categories.find(
    (item) => item.id === category || item.slug === category,
  );
  const activeBrand = brands.find((item) => item.id === brand || item.slug === brand);

  return (
    <div className="space-y-6">
      {/* Filter / search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            defaultValue={search}
            placeholder="Search products…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/20] transition"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("q", (e.target as HTMLInputElement).value || null);
              }
            }}
          />
        </div>

        {/* Ordering */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            value={ordering}
            onChange={(e) => updateParam("ordering", e.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:border-[hsl(var(--accent))] focus:outline-none transition"
          >
            {ORDERINGS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live catalog facets from /api/v1/ninja/catalog/* */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide">
          {categoriesLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <span
                  key={index}
                  className="h-10 w-28 shrink-0 rounded-full shimmer"
                  aria-hidden="true"
                />
              ))
            : categories.slice(0, 14).map((item) => {
                const selected = item.id === category || item.slug === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateParam("category", selected ? null : item.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-[hsl(var(--accent))]"
                    }`}
                  >
                    {item.title || item.name}
                  </button>
                );
              })}
        </div>

        {brands.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide">
            {brands.slice(0, 12).map((item) => {
              const selected = item.id === brand || item.slug === brand;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateParam("brand", selected ? null : item.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.title || item.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active filter chip */}
      {(category || brand || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          {category && (
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-bold text-[hsl(var(--accent-foreground))] transition hover:brightness-110"
            >
              {activeCategory?.title || activeCategory?.name || category}
              <X size={12} />
            </button>
          )}
          {brand && (
            <button
              type="button"
              onClick={() => updateParam("brand", null)}
              className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-bold text-primary-foreground transition hover:brightness-110"
            >
              {activeBrand?.title || activeBrand?.name || brand}
              <X size={12} />
            </button>
          )}
          {search && (
            <button
              type="button"
              onClick={() => updateParam("q", null)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground transition hover:border-[hsl(var(--accent))]"
            >
              {search}
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Live product grid — data from TanStack Query → Ninja API */}
      <ProductGrid
        params={{
          category,
          brand,
          q: search,
          ordering,
        }}
        skeletonCount={12}
      />
    </div>
  );
}
