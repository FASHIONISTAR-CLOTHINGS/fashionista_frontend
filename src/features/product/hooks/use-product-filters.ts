/**
 * @file use-product-filters.ts
 * @description Product filter URL state hook using Nuqs v2.
 *
 * Canonical product slice hook.
 * URL state owns: search, category, brand, price range, sort, page.
 * These are bookmarkable and survive page refresh.
 *
 * Usage:
 *   const { search, category, page, setSearch, resetFilters } = useProductFilters();
 */
"use client";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useProductFilters() {
  // Search query
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));

  // Taxonomy filters
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault(""),
  );
  const [brand, setBrand] = useQueryState(
    "brand",
    parseAsString.withDefault(""),
  );

  // Price range
  const [minPrice, setMinPrice] = useQueryState(
    "min_price",
    parseAsInteger.withDefault(0),
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    "max_price",
    parseAsInteger.withDefault(500_000),
  );

  // Sorting — values match backend ?ordering= param
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsString.withDefault("newest"),
  );

  // Pagination
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  /** Reset all filters to defaults without pushing navigation. */
  const resetFilters = () => {
    void setSearch(null);
    void setCategory(null);
    void setBrand(null);
    void setMinPrice(null);
    void setMaxPrice(null);
    void setSortBy(null);
    void setPage(null);
  };

  return {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy,
    page,
    setSearch,
    setCategory,
    setBrand,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    setPage,
    resetFilters,
    /** Derived: true when any non-default filter is active. */
    hasActiveFilters:
      !!search || !!category || !!brand || minPrice > 0 || sortBy !== "newest",
  };
}
