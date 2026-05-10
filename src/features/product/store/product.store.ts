/**
 * @file product.store.ts
 * @description Zustand v5 store for product UI-only state.
 *
 * Owns ONLY client-side ephemeral UI state:
 *  - wishlist drawer open/close
 *  - recently viewed product IDs (local cache)
 *  - active filter panel state (distinct from URL — controls animation)
 *
 * Server state (product data, wishlist items) lives in TanStack Query.
 * URL state (search, category, page, sort) lives in Nuqs.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ProductUIState {
  /** IDs of recently viewed products (local, max 20). */
  recentlyViewed: string[];
  /** Whether the wishlist panel/drawer is open. */
  isWishlistOpen: boolean;
  /** Whether the filter panel is open (mobile overlay). */
  isFilterPanelOpen: boolean;

  // Actions
  addRecentlyViewed: (productId: string) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistPanel: () => void;
  openFilterPanel: () => void;
  closeFilterPanel: () => void;
  toggleFilterPanel: () => void;
}

export const useProductStore = create<ProductUIState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      isWishlistOpen: false,
      isFilterPanelOpen: false,

      addRecentlyViewed: (id) => {
        const filtered = get().recentlyViewed.filter((i) => i !== id);
        set({ recentlyViewed: [id, ...filtered].slice(0, 20) });
      },

      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlistPanel: () =>
        set((s) => ({ isWishlistOpen: !s.isWishlistOpen })),

      openFilterPanel: () => set({ isFilterPanelOpen: true }),
      closeFilterPanel: () => set({ isFilterPanelOpen: false }),
      toggleFilterPanel: () =>
        set((s) => ({ isFilterPanelOpen: !s.isFilterPanelOpen })),
    }),
    {
      name: "fashionistar-product-ui",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      // Persist only recently viewed — UI panel state resets on page load
      partialize: (s) => ({ recentlyViewed: s.recentlyViewed }),
    },
  ),
);
