/**
 * Cart Store — Zustand v5 with localStorage persistence
 *
 * Persisted to localStorage (cart survives browser close).
 * Implements: add, remove, update quantity, clear, total calculation.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  variant_id?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Computed
  getItemCount: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const key = `${newItem.product_id}-${newItem.variant_id ?? "default"}`;
          const existing = state.items.find(
            (i) => `${i.product_id}-${i.variant_id ?? "default"}` === key,
          );

          if (existing) {
            // Increment quantity if item already in cart
            return {
              items: state.items.map((i) =>
                `${i.product_id}-${i.variant_id ?? "default"}` === key
                  ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
                  : i,
              ),
            };
          }

          return {
            items: [...state.items, { ...newItem, id: `${key}-${Date.now()}` }],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.product_id === productId &&
                (variantId ? i.variant_id === variantId : true)
              ),
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId &&
            (variantId ? i.variant_id === variantId : true)
              ? { ...i, quantity }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "fashionistar-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      // Don't persist UI state (isOpen)
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
