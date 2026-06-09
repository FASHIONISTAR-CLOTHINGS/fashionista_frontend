"use client";

/**
 * features/cart/components/CartDrawer.tsx
 * Slide-in cart drawer with real-time item management.
 * Opens from the right — glassmorphism panel.
 */

import React, { useCallback } from "react";
import Link from "next/link";
import { Button, Badge, LoadingSpinner } from "@/components";
import { FashionistarImage } from "@/components/media";
import type { Cart, CartItem } from "@/features/cart";

interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

// ── CartSummary Component ──────────────────────────────────────────────────────

interface CartSummaryProps {
  cart: Cart;
  onCheckout: () => void;
}

export function CartSummary({ cart, onCheckout }: CartSummaryProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
  
  const subtotal = parseFloat(cart.subtotal ?? "0");
  const hasMeasurementItem = cart.items.some((i) => i.product.requires_measurement);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm font-medium text-slate-300">
        <span>Subtotal</span>
        <span className="text-white font-bold">{fmt(subtotal)}</span>
      </div>
      {hasMeasurementItem && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-300 flex items-start gap-2">
          <span>📐</span>
          <span>One or more items require measurement.</span>
        </div>
      )}
      <Button
        onClick={onCheckout}
        disabled={hasMeasurementItem}
        className="w-full bg-[#FDA600] hover:bg-[#FDA600]/90 text-slate-950 font-bold"
      >
        {hasMeasurementItem ? "Measurement required" : "Proceed to Checkout"}
      </Button>
    </div>
  );
}

// ── CartItem Row ──────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (payload: UpdateCartItemPayload) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

function CartItemRow({ item, onUpdateQty, onRemove, isUpdating }: CartItemRowProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(v);

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border transition-all ${
        isUpdating ? "opacity-60 border-white/5" : "border-white/8 hover:border-white/15"
      } bg-white/3`}
      id={`cart-item-${item.id}`}
    >
      <div className="w-16 h-16 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden">
        {item.product.cover_image_url ? (
          <FashionistarImage src={item.product.cover_image_url} alt={item.product.title} width={64} height={64} imgClassName="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.product.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {item.size_label && <Badge color="default" size="xs">Size: {item.size_label}</Badge>}
          {item.color_label && <Badge color="default" size="xs">{item.color_label}</Badge>}
          {item.product.requires_measurement && (
            <Badge color="warning" size="xs">📐 Needs measurements</Badge>
          )}
        </div>
      </div>

      {/* Qty + Price */}
      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-amber-400">{fmt(parseFloat(item.line_total))}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUpdateQty({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
            disabled={isUpdating || item.quantity <= 1}
            className="w-6 h-6 p-0 min-h-0 min-w-0"
            aria-label="Decrease quantity"
            id={`cart-item-dec-${item.id}`}
          >
            −
          </Button>
          <span className="text-sm font-semibold text-white w-6 text-center">{item.quantity}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUpdateQty({ itemId: item.id, quantity: item.quantity + 1 })}
            disabled={isUpdating}
            className="w-6 h-6 p-0 min-h-0 min-w-0"
            aria-label="Increase quantity"
            id={`cart-item-inc-${item.id}`}
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="w-6 h-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 min-h-0 min-w-0 ml-1"
            aria-label="Remove item"
            id={`cart-item-remove-${item.id}`}
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}


// ── CartDrawer ────────────────────────────────────────────────────────────────

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  isLoading?: boolean;
  updatingItemId?: string | null;
  onUpdateQty: (payload: UpdateCartItemPayload) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  isLoading,
  updatingItemId,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
        id="cart-drawer-backdrop"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col
          bg-slate-900/95 border-l border-white/12 backdrop-blur-2xl shadow-2xl
          transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        id="cart-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <h2 className="font-semibold text-white">
              Cart
              {cart && cart.item_count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {cart.item_count}
                </span>
              )}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white p-0 min-h-0 min-w-0"
            aria-label="Close cart"
            id="cart-drawer-close"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <span className="text-5xl">🛍️</span>
              <p className="text-white font-semibold">Your cart is empty</p>
              <p className="text-sm text-slate-400">Discover styles crafted just for you</p>
              <Button variant="secondary" asChild onClick={onClose} id="cart-drawer-shop-btn">
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQty={onUpdateQty}
                  onRemove={onRemoveItem}
                  isUpdating={updatingItemId === item.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer: Summary */}
        {cart && cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
            <CartSummary cart={cart} onCheckout={onCheckout} />
          </div>
        )}
      </div>
    </>
  );
}
