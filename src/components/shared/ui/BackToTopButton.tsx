"use client";

/**
 * BackToTopButton.tsx — S17
 *
 * Floating "↑" back-to-top button that appears after 300px scroll.
 * - CSS-only entrance/exit transition (opacity + translateY)
 * - Smooth scroll to top on click
 * - Keyboard accessible (tabIndex, aria-label)
 * - Respects prefers-reduced-motion
 * - data-testid for Playwright E2E
 * - Forest green + gold brand palette
 */

import { useEffect, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 300;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      data-testid="back-to-top-btn"
      aria-label="Scroll back to top"
      tabIndex={visible ? 0 : -1}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      className={[
        // Position
        "fixed bottom-24 right-4 z-40",
        // Size + shape (touch-target 44px minimum)
        "h-11 w-11 rounded-full",
        // Brand styling
        "bg-[#01454A] text-white shadow-lg",
        // Border accent
        "border-2 border-[#FDA600]/30",
        // Transitions
        "transition-all duration-300 ease-out",
        // Hover/focus
        "hover:bg-[#FDA600] hover:text-black hover:border-[#FDA600]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]",
        // Flex center
        "flex items-center justify-center",
        // Motion respect
        "motion-reduce:transition-none",
        // Mobile: move above bottom tab bar (safe-area)
        "mb-safe",
      ].join(" ")}
    >
      <ChevronUp size={20} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
