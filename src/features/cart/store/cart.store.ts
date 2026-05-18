/**
 * Cart Store — UI-only Zustand slice (2027 Edition)
 *
 * Architecture change:
 *  BEFORE: This store managed its own item array persisted to localStorage,
 *          creating a dual-source-of-truth conflict with the TanStack Query
 *          server cache. Logged-in users would see divergent state.
 *
 *  AFTER:  Item data is owned exclusively by TanStack Query (useCart hook).
 *          This store is responsible ONLY for drawer UI state:
 *            • isOpen    — drawer visibility
 *            • activeTab — "cart" | "saved" tab selection
 *
 *  Anything that previously read items from this store should now call:
 *    const { data: cart } = useCart();   // server-synced, optimistic
 */
import { create } from "zustand";

// ── Types ─────────────────────────────────────────────────────────────────────

type CartTab = "cart" | "saved";

interface CartUIState {
  /** Whether the cart drawer is currently visible. */
  isOpen: boolean;
  /** Which tab is active inside the drawer. */
  activeTab: CartTab;

  /** Toggle drawer open/closed. */
  toggleCart: () => void;
  /** Open the cart drawer (idempotent). */
  openCart: () => void;
  /** Close the cart drawer (idempotent). */
  closeCart: () => void;
  /** Switch the active tab. */
  setActiveTab: (tab: CartTab) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
//
// Intentionally NOT persisted — drawer open/closed state should always reset
// to closed on page refresh, and tab selection is cheap to re-derive.
//
export const useCartStore = create<CartUIState>()((set) => ({
  isOpen: false,
  activeTab: "cart",

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
