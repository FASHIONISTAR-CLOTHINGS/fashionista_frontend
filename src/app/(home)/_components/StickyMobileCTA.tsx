/**
 * StickyMobileCTA.tsx — Sticky Mobile Conversion Bar
 *
 * Fixed bottom bar (mobile only — hidden on md+).
 * Two 50/50 CTAs: "Get Measured" (gold) | "Shop Now" (green).
 * Appears after 30s, dismissible with 24h localStorage suppression.
 * Safe area inset for iPhone notch/home bar.
 *
 * Client Component — requires localStorage + timing logic.
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X, Ruler, ShoppingBag } from "lucide-react";

const SUPPRESS_KEY = "fashionistar:mobile-cta-dismissed";
const SUPPRESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DELAY_BEFORE_SHOW_MS = 30_000; // 30 seconds

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed within the suppression window
    try {
      const dismissedAt = localStorage.getItem(SUPPRESS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt);
        if (elapsed < SUPPRESS_DURATION_MS) return; // still suppressed
      }
    } catch {
      // localStorage unavailable — show anyway
    }

    // Show after 30 second delay (not intrusive on first load)
    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_BEFORE_SHOW_MS);

    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
    try {
      localStorage.setItem(SUPPRESS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="complementary"
      aria-label="Quick action bar"
      data-testid="sticky-mobile-cta"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Backdrop blur + shadow */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#01454A]/10 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-stretch">
          {/* Get Measured — Gold */}
          <Link
            href="/get-measured"
            id="sticky-cta-measure"
            className="flex-1 flex items-center justify-center gap-2 bg-[#FDA600] text-[#141414] font-raleway font-bold text-sm py-4 px-3 hover:bg-[#E09600] active:bg-[#C88400] transition-colors duration-150 min-h-[56px]"
            data-testid="sticky-cta-measure"
            onClick={handleDismiss}
          >
            <Ruler className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Get Measured</span>
          </Link>

          {/* Divider */}
          <div className="w-px bg-[#01454A]/20" aria-hidden="true" />

          {/* Shop Now — Green */}
          <Link
            href="/products"
            id="sticky-cta-shop"
            className="flex-1 flex items-center justify-center gap-2 bg-[#01454A] text-white font-raleway font-bold text-sm py-4 px-3 hover:bg-[#016B73] active:bg-[#012E32] transition-colors duration-150 min-h-[56px]"
            data-testid="sticky-cta-shop"
            onClick={handleDismiss}
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Shop Now</span>
          </Link>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            id="sticky-cta-dismiss"
            aria-label="Dismiss this bar"
            className="flex-shrink-0 flex items-center justify-center w-10 bg-white/80 text-[#01454A]/60 hover:text-[#01454A] hover:bg-white active:bg-gray-100 transition-colors duration-150 border-l border-[#01454A]/10"
            data-testid="sticky-cta-dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
