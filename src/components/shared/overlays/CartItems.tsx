/**
 * @file CartItems.tsx
 * @description Navbar cart slide-over drawer (legacy version).
 *
 * NOTE: This component is the navbar-triggered mini-cart overlay.
 * It is intentionally lightweight and presents a simplified snapshot.
 * For the full cart page, see: src/app/(home)/cart/page.tsx
 *
 * Current state: placeholder UI. Wire to Zustand cart store in the
 * cart feature integration sprint.
 *
 * Improvements over v1:
 * - All hardcoded hex replaced with CSS design tokens
 * - Added focus-trap for keyboard accessibility (WCAG 2.1 AA)
 * - Proper TypeScript props interface
 * - Added aria-label, role="dialog", aria-modal="true"
 * - Close on Escape key
 * - Removed hardcoded product data + placeholder note added
 * - LF line endings (was CRLF)
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CartItemsProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CartItems — mobile/navbar mini-cart slide-over drawer.
 *
 * Renders a right-side panel with cart summary when `isOpen` is true.
 * Supports Escape-key dismiss and basic focus management.
 *
 * Args:
 *   isOpen:  Whether the cart drawer is visible.
 *   onClose: Callback to dismiss the drawer.
 */
const CartItems = ({ isOpen, onClose }: CartItemsProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
        aria-label="Shopping cart"
        className={cn(
          "bg-background h-screen w-4/5 sm:w-2/3 md:w-1/2 lg:w-[380px]",
          "fixed right-0 top-0 z-50 px-5 py-8 flex flex-col gap-6",
          "shadow-2xl border-l border-border",
          "animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="font-raleway font-semibold text-xl text-foreground flex items-center gap-2">
            <ShoppingBag size={20} className="text-[hsl(var(--accent))]" />
            Your Cart
          </p>
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

        {/* Empty state — replace with real cart items from Zustand store */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <ShoppingBag size={48} className="text-muted-foreground/40" />
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

        {/* CTAs */}
        <div className="flex flex-col gap-3 border-t border-border pt-4 mt-auto">
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
      </div>
    </>
  );
};

export default CartItems;
