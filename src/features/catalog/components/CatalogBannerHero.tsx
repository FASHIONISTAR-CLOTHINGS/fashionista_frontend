/**
 * features/catalog/components/CatalogBannerHero.tsx — D4
 *
 * CMS-driven hero banner carousel for the homepage.
 *
 * Data flow:
 *   bundle.banners[] (from RSC props) → no extra fetch
 *   Falls back to static <Hero /> if no banners in bundle.
 *
 * Mobile: single image, touch-swipe with Embla Carousel
 * Desktop: full-width image with text overlay + CTA
 *
 * Accessibility:
 *   - role="region" + aria-label
 *   - Auto-advance pauses on focus/hover (respects prefers-reduced-motion)
 *   - Dot navigation with aria-pressed
 *   - Each slide image alt from banner.title
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomepageBannerCard } from "../types/catalog.types";

interface Props {
  banners: HomepageBannerCard[];
  /** Auto-advance interval in ms. 0 = disabled. */
  autoPlayMs?: number;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function CatalogBannerHero({ banners, autoPlayMs = 5_000 }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!autoPlayMs || paused || prefersReducedMotion() || count <= 1) return;
    intervalRef.current = setInterval(next, autoPlayMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlayMs, paused, next, count]);

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
    touchStartX.current = null;
  };

  if (!count) return null;

  const banner = banners[current];

  return (
    <section
      role="region"
      aria-label="Fashionistar hero banner"
      className="relative w-full overflow-hidden"
      data-testid="hero-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner slide */}
      <div className="relative w-full h-[56vw] min-h-[280px] max-h-[720px]">
        {/* Desktop image */}
        {banner.image_url && (
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            priority
            className="object-cover hidden sm:block"
            sizes="100vw"
          />
        )}
        {/* Mobile image */}
        {(banner.mobile_image_url || banner.image_url) && (
          <Image
            src={banner.mobile_image_url ?? banner.image_url ?? ""}
            alt={banner.title}
            fill
            priority
            className="object-cover sm:hidden"
            sizes="100vw"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        {/* Text + CTA */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24 gap-4 md:gap-6">
          <p className="font-bon_foyage text-3xl md:text-5xl lg:text-7xl text-white leading-tight max-w-xl">
            {banner.title}
          </p>
          {banner.subtitle && (
            <p className="font-raleway text-sm md:text-lg text-white/80 max-w-md">
              {banner.subtitle}
            </p>
          )}
          {banner.cta_url && (
            <Link
              href={banner.cta_url}
              className="self-start mt-2 px-6 md:px-10 py-3 md:py-4 rounded-full bg-[#fda600] text-black font-raleway font-bold text-sm md:text-base hover:bg-[#fda600]/90 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-4 focus-visible:outline-[#fda600] min-h-[44px] inline-flex items-center"
            >
              {banner.cta_text || "Shop Now"}
            </Link>
          )}
        </div>
      </div>

      {/* Dot navigation (only if multiple banners) */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-pressed={idx === current}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Prev/Next arrows (desktop only) */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center hover:bg-white/40 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center hover:bg-white/40 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
