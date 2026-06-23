/**
 * Cart Store — Pure Client-Side Zustand Slice with LocalStorage Persistence
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, AppliedCoupon } from "../types/cart.types";

type CartTab = "cart" | "saved";

interface CartState {
  /** Whether the cart drawer is currently visible. */
  isOpen: boolean;
  /** Which tab is active inside the drawer. */
  activeTab: CartTab;
  /** List of cart items. */
  items: CartItem[];
  /** Applied coupon code details. */
  applied_coupon: AppliedCoupon | null;

  /** Toggle drawer open/closed. */
  toggleCart: () => void;
  /** Open the cart drawer. */
  openCart: () => void;
  /** Close the cart drawer. */
  closeCart: () => void;
  /** Switch the active tab. */
  setActiveTab: (tab: CartTab) => void;

  /** Add item client-side. */
  addItem: (
    product: {
      id: string;
      slug: string;
      title: string;
      sku?: string;
      cover_image_url?: string | null;
      requires_measurement?: boolean;
      vendor_name?: string;
    },
    variantId: string | null,
    sizeLabel: string | null,
    colorLabel: string | null,
    quantity: number,
    unitPrice: string
  ) => void;

  /** Remove item client-side. */
  removeItem: (itemId: string) => void;

  /** Update item quantity client-side. */
  updateQuantity: (itemId: string, quantity: number) => void;

  /** Clear entire cart state. */
  clearCart: () => void;

  /** Apply coupon state. */
  applyCoupon: (coupon: AppliedCoupon) => void;

  /** Remove coupon state. */
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isOpen: false,
      activeTab: "cart",
      items: [],
      applied_coupon: null,

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      addItem: (product, variantId, sizeLabel, colorLabel, quantity, unitPrice) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variant_id === variantId
          );
          let nextItems = [...state.items];
          if (existingIndex > -1) {
            const existingItem = nextItems[existingIndex];
            const newQty = existingItem.quantity + quantity;
            nextItems[existingIndex] = {
              ...existingItem,
              quantity: newQty,
              line_total: (parseFloat(unitPrice) * newQty).toFixed(2),
            };
          } else {
            const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            nextItems.push({
              id: itemId,
              product: {
                id: product.id,
                slug: product.slug,
                title: product.title,
                sku: product.sku || "",
                cover_image_url: product.cover_image_url || null,
                requires_measurement: !!product.requires_measurement,
                vendor_name: product.vendor_name || "Fashionistar",
              },
              variant_id: variantId,
              size_label: sizeLabel,
              color_label: colorLabel,
              quantity,
              unit_price: unitPrice,
              line_total: (parseFloat(unitPrice) * quantity).toFixed(2),
              currency: "NGN",
            });
          }
          return { items: nextItems };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  line_total: (parseFloat(item.unit_price) * quantity).toFixed(2),
                }
              : item
          ),
        })),

      clearCart: () => set({ items: [], applied_coupon: null }),

      applyCoupon: (coupon) => set({ applied_coupon: coupon }),

      removeCoupon: () => set({ applied_coupon: null }),
    }),
    {
      name: "fashionistar-cart",
      partialize: (state) => ({
        items: state.items,
        applied_coupon: state.applied_coupon,
      }),
    }
  )
);
