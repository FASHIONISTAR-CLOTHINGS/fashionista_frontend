/**
 * features/catalog/store/catalog.store.ts
 *
 * Zustand client-state store for catalog product filters.
 *
 * Usage:
 *   const { selectedSizes, setFilter, resetFilters } = useCatalogFilterStore();
 *
 * URL state (bookmarkable/shareable) is handled separately via Nuqs in
 * the filter components — this store is for immediate UI state only.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CatalogFilterParams, CatalogSortOption } from "../types/catalog.types";

interface CatalogFilterState extends CatalogFilterParams {
  // ── Actions ──────────────────────────────────────────────────────────────
  setFilter: <K extends keyof CatalogFilterParams>(
    key: K,
    value: CatalogFilterParams[K]
  ) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  toggleBrand: (brand: string) => void;
  setSortBy: (sort: CatalogSortOption) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULT_STATE: CatalogFilterParams = {
  priceMin: null,
  priceMax: null,
  selectedSizes: [],
  selectedColors: [],
  selectedBrands: [],
  sortBy: "newest",
};

export const useCatalogFilterStore = create<CatalogFilterState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setFilter: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      toggleSize: (size) =>
        set((state) => ({
          selectedSizes: state.selectedSizes.includes(size)
            ? state.selectedSizes.filter((s) => s !== size)
            : [...state.selectedSizes, size],
        })),

      toggleColor: (color) =>
        set((state) => ({
          selectedColors: state.selectedColors.includes(color)
            ? state.selectedColors.filter((c) => c !== color)
            : [...state.selectedColors, color],
        })),

      toggleBrand: (brand) =>
        set((state) => ({
          selectedBrands: state.selectedBrands.includes(brand)
            ? state.selectedBrands.filter((b) => b !== brand)
            : [...state.selectedBrands, brand],
        })),

      setSortBy: (sort) => set({ sortBy: sort }),

      setPriceRange: (min, max) =>
        set({ priceMin: min, priceMax: max }),

      resetFilters: () => set(DEFAULT_STATE),

      hasActiveFilters: () => {
        const s = get();
        return (
          s.priceMin !== null ||
          s.priceMax !== null ||
          s.selectedSizes.length > 0 ||
          s.selectedColors.length > 0 ||
          s.selectedBrands.length > 0 ||
          s.sortBy !== "newest"
        );
      },
    }),
    {
      name: "fashionistar-catalog-filters",
      // Only persist sort preference — filters reset on reload for UX clarity
      partialize: (state) => ({ sortBy: state.sortBy }),
    }
  )
);
