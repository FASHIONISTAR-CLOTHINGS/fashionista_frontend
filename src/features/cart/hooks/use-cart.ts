/**
 * @file use-cart.ts
 * @description Client-side hooks for Cart management — Zustand-backed (2027 Edition).
 */
"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/cart.store";
import { validateCoupon, submitCheckout, mergeAnonymousCommerce } from "../api/cart.api";
import { fetchProductDetail } from "@/features/product/api/product.api";
import type {
  Cart,
  CheckoutSession,
  CheckoutQuote,
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  PrepareCheckoutInput,
  SubmitCheckoutInput,
} from "../types/cart.types";

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  checkout: () => [...cartKeys.all, "checkout"] as const,
} as const;

async function getProductDetails(qc: any, productId: string, productSlug?: string) {
  const queries = qc.getQueryCache().findAll();
  for (const query of queries) {
    const data = query.state.data as any;
    if (data) {
      if (data.id === productId || (productSlug && data.slug === productSlug)) {
        return data;
      }
      if (data.results && Array.isArray(data.results)) {
        const found = data.results.find((p: any) => p.id === productId || (productSlug && p.slug === productSlug));
        if (found) return found;
      }
    }
  }
  if (productSlug) {
    return await fetchProductDetail(productSlug);
  }
  throw new Error("Product slug required to fetch details.");
}

export function useCart() {
  const store = useCartStore();
  const subtotalNum = store.items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0);
  const discountNum = store.applied_coupon ? parseFloat(store.applied_coupon.discount_amount) : 0;

  const cart: Cart = {
    id: "local-cart",
    items: store.items,
    item_count: store.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotalNum.toFixed(2),
    currency: "NGN",
    expires_at: null,
    applied_coupon: store.applied_coupon,
  };

  return {
    data: cart,
    isLoading: false,
    isError: false,
    refetch: async () => {},
  };
}

export function usePrefetchCart() {
  return useCallback(() => {}, []);
}

export function useAddCartItem() {
  const qc = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  return useMutation({
    mutationFn: async (input: AddCartItemInput) => {
      const product = await getProductDetails(qc, input.product_id, input.product_slug);
      let sizeLabel = null;
      let colorLabel = null;
      if (input.variant_id && product.variants) {
        const variant = product.variants.find((v: any) => String(v.id) === input.variant_id);
        if (variant) {
          sizeLabel = variant.size_label || (variant.size ? variant.size.size_label : null);
          colorLabel = variant.color_name || null;
        }
      }
      addItem(product, input.variant_id ?? null, sizeLabel, colorLabel, input.quantity, product.price);
    },
    onSuccess: () => {
      toast.success("Added to cart! 🛍️");
    },
    onError: () => {
      toast.error("Could not add item — please try again.");
    },
  });
}

export function useRemoveCartItem() {
  const removeItem = useCartStore((s) => s.removeItem);
  return useMutation({
    mutationFn: async (itemId: string) => {
      removeItem(itemId);
    },
    onSuccess: () => {
      toast.success("Item removed.");
    },
    onError: () => {
      toast.error("Could not remove item.");
    },
  });
}

export function useUpdateCartItem() {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const mutation = useMutation({
    mutationFn: async ({ itemId, input }: { itemId: string; input: UpdateCartItemInput }) => {
      updateQuantity(itemId, input.quantity);
    },
    onError: () => {
      toast.error("Could not update quantity.");
    },
  });

  const mutateDebounced = useCallback(
    (vars: { itemId: string; input: UpdateCartItemInput }) => {
      updateQuantity(vars.itemId, vars.input.quantity);
    },
    [updateQuantity]
  );

  return { ...mutation, mutateDebounced };
}

export function useClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);
  return useMutation({
    mutationFn: async () => {
      clearCart();
    },
    onSuccess: () => {
      toast.success("Cart cleared.");
    },
    onError: () => {
      toast.error("Could not clear cart.");
    },
  });
}

export function useMergeCart() {
  return useMutation({
    mutationFn: async () => {
      await mergeAnonymousCommerce();
    },
  });
}

export function useIsInCart(productId: string): boolean {
  const items = useCartStore((s) => s.items);
  return items.some((item) => item.product.id === productId || item.product.slug === productId);
}

export function useApplyCoupon() {
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const store = useCartStore();
  return useMutation({
    mutationFn: async (input: ApplyCouponInput) => {
      const subtotalNum = store.items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0);
      return await validateCoupon(input.code, subtotalNum.toFixed(2));
    },
    onSuccess: (coupon) => {
      applyCoupon(coupon);
      toast.success("Coupon applied! 🎉");
    },
    onError: () => {
      toast.error("Invalid or expired coupon code.");
    },
  });
}

export function useRemoveCoupon() {
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  return useMutation({
    mutationFn: async () => {
      removeCoupon();
    },
    onSuccess: () => {
      toast.success("Coupon removed.");
    },
  });
}

export function usePrepareCheckout() {
  const store = useCartStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PrepareCheckoutInput) => {
      const subtotalNum = store.items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0);
      let shippingCostNum = 0;
      for (const item of store.items) {
        let itemShipping = 1500;
        const cachedProduct = await getProductDetails(qc, item.product.id, item.product.slug).catch(() => null);
        if (cachedProduct) {
          const threshold = cachedProduct.shipping_profile?.free_shipping_threshold ?? 50000;
          if (subtotalNum < threshold) {
            itemShipping = parseFloat(cachedProduct.shipping_amount || cachedProduct.shipping_profile?.shipping_amount || "1500");
          } else {
            itemShipping = 0;
          }
        }
        shippingCostNum += itemShipping;
      }

      const requiresMeasurement = store.items.some((i) => i.product.requires_measurement);
      const measurementFeeNum = requiresMeasurement ? 1000 : 0;
      const discountNum = store.applied_coupon ? parseFloat(store.applied_coupon.discount_amount) : 0;
      const finalTotalNum = Math.max(0, subtotalNum + shippingCostNum + measurementFeeNum - discountNum);

      const quote: CheckoutQuote = {
        subtotal: subtotalNum.toFixed(2),
        shipping_cost: shippingCostNum.toFixed(2),
        measurement_fee: measurementFeeNum.toFixed(2),
        discount_amount: discountNum.toFixed(2),
        tax_amount: "0.00",
        final_total: finalTotalNum.toFixed(2),
        currency: "NGN",
        applied_coupon: store.applied_coupon,
        measurement_required: requiresMeasurement,
      };

      const session: CheckoutSession = {
        id: `checkout-${Date.now()}`,
        status: "prepared",
        quote,
        shipping_address: input.shipping_address,
        idempotency_key: uuidv4(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      return session;
    },
    onSuccess: (session) => {
      qc.setQueryData(cartKeys.checkout(), session);
    },
  });
}

export function useSubmitCheckout(
  onSuccess?: (orderId: string, paymentUrl: string | null) => void,
) {
  const store = useCartStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitCheckoutInput) => {
      const orderItems = store.items.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));
      return await submitCheckout({
        ...input,
        items: orderItems,
        coupon_code: store.applied_coupon?.code ?? null,
      });
    },
    onSuccess: (res) => {
      store.clearCart();
      void qc.invalidateQueries({ queryKey: cartKeys.all });
      toast.success(`Order ${res.order_number} placed! 🎊`);
      onSuccess?.(res.order_id, res.payment_url);
    },
    onError: () => {
      toast.error("Order submission failed. Please retry.");
    },
  });
}
