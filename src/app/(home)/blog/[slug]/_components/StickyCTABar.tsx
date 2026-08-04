"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StickyCTABar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = maxScroll > 0 ? scrolled / maxScroll : 0;
      setVisible(scrollPercent > 0.35);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      data-testid="sticky-cta-bar"
    >
      <div className="mx-auto max-w-5xl px-4 pb-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[hsl(var(--brand-green))] bg-[hsl(var(--brand-green))] px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-white">Get Your Perfect Fit</p>
              <p className="text-xs text-white/70">Free AI Measurements — Takes 2 Minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/get-measured"
              className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--accent))] px-5 py-2 text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
              data-testid="sticky-cta-button"
            >
              Start Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
              data-testid="sticky-cta-dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
