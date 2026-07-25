/**
 * @file CartDrawer.tsx
 * @description Slide-out cart preview drawer (S20).
 *
 * Features real-time items list, quantity increments/decrements,
 * free shipping progress bar, and direct checkout CTA.
 *
 * @version 2026-enterprise
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";
import { useCartStore } from "@/features/cart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, item) => {
      const line = parseFloat(String(item.line_total || item.unit_price || 0));
      return acc + (isNaN(line) ? 0 : line);
    }, 0);
  }, [items]);

  const itemCount = React.useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [items]);

  const freeShippingThreshold = 50000; // ₦50,000 free shipping
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md h-full bg-background shadow-2xl border-l border-border/50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/40 bg-muted/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#01454A]" />
              <h2 className="font-bon_foyage text-xl text-foreground">
                Your Shopping Cart ({itemCount})
              </h2>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close cart drawer"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold font-raleway">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-[#01454A] font-bold">🎉 You unlocked FREE Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#01454A]">{formatCurrency(freeShippingThreshold - subtotal)}</strong> more for FREE Shipping
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FDA600] to-[#01454A] transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-border/40">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <ShoppingBag size={32} />
              </div>
              <div>
                <h3 className="font-bon_foyage text-lg text-foreground mb-1">Your cart is empty</h3>
                <p className="text-xs text-muted-foreground font-raleway max-w-xs">
                  Explore our modern African fashion collections and find items tailored just for you.
                </p>
              </div>
              <Button
                onClick={onClose}
                asChild
                className="rounded-full bg-[#01454A] text-white font-bold font-raleway px-6 hover:bg-[#01454A]/90"
              >
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const itemTitle = item.product?.title || "Fashion Item";
              const itemPrice = parseFloat(String(item.unit_price || 0));
              const itemImage = item.product?.cover_image_url || "/placeholder-fashion.jpg";
              const qty = item.quantity || 1;
              const vendorName = item.product?.vendor_name || "Fashionistar Verified";

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted/40 shrink-0 border border-border/40">
                    <FashionistarImage src={itemImage} alt={itemTitle} fill className="object-cover" sizes="80px" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-raleway font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                        {itemTitle}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-[11px] font-medium text-[#01454A] uppercase tracking-wider">
                      {vendorName}
                    </p>

                    {item.product?.requires_measurement && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#01454A] bg-[#FDA600]/20 px-2 py-0.5 rounded-full">
                        <Ruler size={10} />
                        <span>AI Measurement</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-sm font-raleway text-foreground">
                        {formatCurrency(itemPrice * qty)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border/60 rounded-md bg-background">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, qty - 1))}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold font-raleway">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border/40 bg-muted/10 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-raleway">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-raleway">
                <span>Shipping</span>
                <span>{subtotal >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}</span>
              </div>
              <div className="flex justify-between text-base font-bold font-raleway text-foreground pt-1 border-t border-border/30">
                <span>Estimated Total</span>
                <span className="text-[#01454A] dark:text-[#FDA600]">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                asChild
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[#01454A] text-white font-bold font-raleway hover:bg-[#01454A]/90 transition-all shadow-md gap-2"
              >
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
              </Button>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-raleway px-1">
                <Link href="/cart" onClick={onClose} className="hover:underline text-[#01454A] font-semibold">
                  View Full Cart
                </Link>
                <button type="button" onClick={() => clearCart()} className="hover:underline text-rose-500">
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-raleway pt-1">
              <ShieldCheck size={14} className="text-[#01454A]" />
              <span>Encrypted 256-bit Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
