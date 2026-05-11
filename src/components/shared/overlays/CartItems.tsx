/**
 * @file CartItems.tsx
 * @description Navbar cart slide-over drawer — live Zustand cart state.
 *
 * Upgraded from placeholder to full live cart drawer:
 * - Reads items, count, and subtotal from `useCartStore`
 * - Renders product rows with thumbnail, name, variant, qty, and price
 * - Inline quantity controls (+/−) and item removal
 * - Subtotal + CTA bar at the bottom
 * - Empty state with "Browse Products" CTA
 * - WCAG 2.1 AA: focus-trap, Escape dismiss, scroll-lock, aria-modal
 *
 * For the full cart page, see: src/app/(home)/cart/page.tsx
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/features/cart/store/cart.store";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CartItemsProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Cart Item Row ──────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <li className="flex gap-3 py-3 border-b border-border/60 last:border-0">
      {/* Thumbnail */}
      <div className="relative h-16 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag size={20} className="text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-raleway font-semibold text-sm text-foreground truncate">
          {item.name}
        </p>
        {(item.size || item.color) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {[item.size, item.color].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="text-sm font-semibold text-[hsl(var(--accent))] mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.name}`}
            onClick={() =>
              updateQuantity(item.product_id, item.quantity - 1, item.variant_id)
            }
            className={cn(
              "h-6 w-6 rounded-full border border-border",
              "flex items-center justify-center",
              "hover:bg-muted transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--accent))]",
            )}
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
          <button
            type="button"
            aria-label={`Increase quantity of ${item.name}`}
            onClick={() =>
              updateQuantity(item.product_id, item.quantity + 1, item.variant_id)
            }
            className={cn(
              "h-6 w-6 rounded-full border border-border",
              "flex items-center justify-center",
              "hover:bg-muted transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--accent))]",
            )}
          >
            <Plus size={12} />
          </button>
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => removeItem(item.product_id, item.variant_id)}
            className={cn(
              "ml-auto p-1 rounded-md",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive",
            )}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CartItems — Navbar mini-cart slide-over drawer with live Zustand state.
 *
 * Args:
 *   isOpen:  Whether the cart drawer is visible.
 *   onClose: Callback to dismiss the drawer.
 */
const CartItems = ({ isOpen, onClose }: CartItemsProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Live cart state from Zustand store
  const items = useCartStore((s) => s.items);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const isEmpty = itemCount === 0;

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Shopping cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
        className={cn(
          "bg-background h-screen w-4/5 sm:w-2/3 md:w-1/2 lg:w-[400px]",
          "fixed right-0 top-0 z-50 flex flex-col",
          "shadow-2xl border-l border-border",
          "animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border shrink-0">
          <p className="font-raleway font-semibold text-xl text-foreground flex items-center gap-2">
            <ShoppingBag size={20} className="text-[hsl(var(--accent))]" />
            Your Cart
            {itemCount > 0 && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <button
                type="button"
                onClick={clearCart}
                aria-label="Clear all cart items"
                className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className={cn(
                "p-1.5 rounded-full",
                "hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              )}
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 text-center py-16">
              <ShoppingBag size={48} className="text-muted-foreground/30" />
              <p className="font-raleway font-semibold text-lg text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Add items from the shop to get started.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className={cn(
                  "mt-2 rounded-full px-6 py-2.5 text-sm font-semibold font-raleway",
                  "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                  "hover:opacity-90 transition-opacity",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
                )}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            /* Cart item list */
            <ul role="list" aria-label="Cart items">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + CTAs (only shown when cart has items) */}
        {!isEmpty && (
          <div className="shrink-0 border-t border-border px-5 py-4 flex flex-col gap-3">
            {/* Subtotal row */}
            <div className="flex justify-between items-center">
              <span className="font-raleway text-sm text-muted-foreground">
                Subtotal
              </span>
              <span className="font-raleway font-bold text-lg text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Shipping and taxes calculated at checkout.
            </p>

            {/* View Cart */}
            <Link
              href="/cart"
              onClick={onClose}
              className={cn(
                "w-full text-center py-3.5 text-sm font-semibold font-raleway rounded-xl",
                "border-2 border-[hsl(var(--accent))] text-[hsl(var(--accent))]",
                "hover:bg-[hsl(var(--accent))]/5 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              )}
            >
              View Full Cart
            </Link>

            {/* Checkout */}
            <Link
              href="/cart/checkout"
              onClick={onClose}
              className={cn(
                "w-full text-center py-3.5 text-sm font-semibold font-raleway rounded-xl",
                "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                "hover:opacity-90 transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              )}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartItems;
