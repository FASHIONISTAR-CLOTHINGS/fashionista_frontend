"use client";

/**
 * @file ExitIntentModal.tsx
 * @description Exit-intent recovery modal for checkout page.
 *
 * Psychological triggers:
 *   - Loss Aversion: "Don't lose your cart items"
 *   - Urgency: Limited-time discount code
 *   - Reciprocity: Offer a coupon in exchange for completing checkout
 *
 * Detection:
 *   - Desktop: mouseleave through top of viewport
 *   - Mobile: fast scroll-up gesture
 *   - Fires once per session (sessionStorage guard)
 */

import { useEffect, useState, useCallback } from "react";
import { X, Gift, Clock, AlertCircle } from "lucide-react";

interface ExitIntentModalProps {
  cartTotal?: number;
  currency?: string;
}

const SESSION_KEY = "fashionistar_exit_intent_shown";

export function ExitIntentModal({ cartTotal, currency = "NGN" }: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode] = useState("STAY10");

  const handleShow = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        handleShow();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const startY = e.touches[0]?.clientY ?? 0;
      let lastY = startY;

      const handleTouchMove = (ev: TouchEvent) => {
        const currentY = ev.touches[0]?.clientY ?? 0;
        if (lastY - currentY > 150 && window.scrollY < 100) {
          handleShow();
          document.removeEventListener("touchmove", handleTouchMove);
        }
        lastY = currentY;
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      timeoutId = setTimeout(() => {
        document.removeEventListener("touchmove", handleTouchMove);
      }, 3000);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchstart", handleTouchStart);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleShow]);

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
      data-testid="exit-intent-modal"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:bg-muted transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-[#01454A] to-[#0a6b72] px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/15 flex items-center justify-center mb-3">
            <Gift size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Wait! Don&apos;t leave yet</h2>
          <p className="mt-1 text-sm text-white/80">
            {cartTotal ? `Your ${currency} ${cartTotal.toFixed(0)} cart is waiting for you` : "Your cart is waiting for you"}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Items in your cart may sell out. Complete your order now to secure them.
            </p>
          </div>

          {/* Coupon offer */}
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-2">
              Here&apos;s <span className="text-[#FDA600]">10% off</span> to help you decide:
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[#01454A]/30 bg-[#01454A]/5 px-6 py-3">
              <span className="text-lg font-bold tracking-wider text-[#01454A]">{couponCode}</span>
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              Valid for 15 minutes only
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-[#01454A] text-white py-3.5 text-sm font-bold hover:bg-[#0a6b72] transition"
            >
              Continue Checkout with 10% Off
            </button>
            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition"
            >
              No thanks, I&apos;ll risk losing my items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
