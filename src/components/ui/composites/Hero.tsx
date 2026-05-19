/**
 * @file Hero.tsx
 * @description Production-grade Hero composite components for Fashionistar.
 *
 * Two variants unified in one file:
 *
 * 1. **`HeroSection`** (default export) — Full branded homepage hero.
 *    - Amber/gold `#fda600` background with rounded corner
 *    - "Get Measured" CTA button
 *    - Waitlist email form (desktop only)
 *    - "Shop Now" link
 *    - Decorative carousel indicator dots
 *    - Hero product image (right-aligned)
 *
 * 2. **`Hero`** (named export) — Generic layout wrapper.
 *    - Accepts `children`
 *    - Applies brand-cream background with SVG diamond pattern overlay
 *    - Used by feature sections, landing sub-sections, etc.
 *
 * @version 2027-enterprise
 */

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC HERO WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override max-width of the inner content container (default: max-w-[1200px]) */
  maxWidth?: string;
}

/**
 * Generic branded hero wrapper.
 * Adds a decorative diamond-pattern SVG background (5% opacity) and a
 * centred max-width content container.
 *
 * @example
 * <Hero>
 *   <h1>Our Story</h1>
 *   <p>…</p>
 * </Hero>
 */
export function Hero({
  children,
  className,
  maxWidth = "max-w-[1200px]",
  ...props
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-brand-cream dark:bg-slate-900",
        className,
      )}
      {...props}
    >
      {/* Background diamond pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 0 20 L 20 0 L 40 20 L 20 40 Z"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className={cn("relative z-10 mx-auto px-4 py-16 md:px-8 md:py-24", maxWidth)}>
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  /** Override for the hero image src. Default: /heroimg.png */
  heroImageSrc?: string;
  /** Called when the waitlist form is submitted */
  onWaitlistSubmit?: (email: string) => void;
}

/**
 * Full homepage hero section with amber background, headline, email waitlist
 * form, CTA links and a product image.
 *
 * Designed as a Server Component — no client hooks. If you need form state,
 * wrap the email input in a `"use client"` island.
 */
function HeroSection({
  heroImageSrc = "/heroimg.png",
  onWaitlistSubmit,
}: HeroSectionProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
    onWaitlistSubmit?.(email);
  }

  return (
    <div className="flex flex-col lg:flex-row items-center relative">
      {/* ── Main amber panel ─────────────────────────────────── */}
      <div className="h-full min-h-[430px] md:h-[686px] w-full lg:min-w-[90%] bg-[#fda600] lg:rounded-br-[80px] flex flex-col justify-center items-center relative overflow-hidden">

        {/* "Get Measured" top-right button */}
        <Link
          href="/get-measured"
          className="w-[144px] flex justify-center items-center absolute top-6 right-6 h-[43px] font-semibold font-raleway rounded-[100px] bg-[#01454a] text-white shrink-0 hover:bg-[#01454a]/90 transition-colors"
        >
          Get Measured
        </Link>

        {/* Headline + form area */}
        <div className="w-full pl-5 md:pl-10 lg:pl-24 flex flex-col gap-5 justify-center">
          <h1 className="font-bon-foyage lg:whitespace-nowrap text-[35px] leading-[44px] md:text-[75px] md:leading-[86px] text-black inline-block">
            {" "}Unlock Your Fashion <br /> Essence With{" "}
            <span className="text-white bg-[#01454a] w-full px-2 pr-10 inline-block">
              Fashionistar
            </span>
          </h1>

          <p className="font-raleway font-semibold md:text-2xl text-black">
            Early adaptors get free trials
          </p>

          {/* Email waitlist form — hidden on mobile */}
          <form className="hidden md:flex z-30" onSubmit={handleSubmit} noValidate>
            <div className="h-[60px] lg:h-[85px] w-full md:w-1/2 bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5 lg:p-3">
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                className="w-2/3 h-full outline-none bg-inherit placeholder:not-italic placeholder:font-raleway placeholder:font-medium placeholder:text-xl placeholder:text-[#333] text-[#333] focus-visible:outline-none"
                placeholder="Enter Email Address"
                aria-label="Email address for waitlist"
              />
              <button
                type="submit"
                className="w-1/3 lg:min-h-[66px] h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm lg:text-xl font-bold font-raleway hover:bg-[#01454a]/90 transition-colors"
              >
                Join Waitlist
              </button>
            </div>
          </form>

          <Link
            href="/products"
            className="w-[144px] h-[43px] font-semibold font-raleway rounded-[100px] bg-[#01454a] text-white shrink-0 inline-flex items-center justify-center hover:bg-[#01454a]/90 transition-colors"
          >
            Shop now
          </Link>
        </div>

        {/* Hero product image */}
        <div className="absolute -right-3 -bottom-5 lg:right-0 lg:bottom-0">
          <Image
            src={heroImageSrc}
            alt="Fashionistar model showcasing latest styles"
            priority
            className="w-[275px] h-[300px] md:w-[505px] md:h-[550px] max-w-full object-contain"
            width={505}
            height={550}
          />
        </div>
      </div>

      {/* ── Carousel indicators ──────────────────────────────── */}
      <div
        className="gap-2 md:gap-4 z-30 w-full -mt-20 md:mt-0 p-5 flex justify-center lg:justify-normal lg:flex-col"
        role="tablist"
        aria-label="Hero carousel"
      >
        <div role="tab" aria-selected="true" className="w-2.5 h-2.5 md:w-6 md:h-6 rounded-full bg-white md:bg-[#01454A] border-2 border-[#d9d9d9] shadow cursor-pointer" />
        <div role="tab" aria-selected="false" className="w-2.5 h-2.5 md:w-6 md:h-6 rounded-full bg-transparent md:bg-[#f5f5f5] border-2 border-[#d9d9d9] shadow cursor-pointer" />
        <div role="tab" aria-selected="false" className="w-2.5 h-2.5 md:w-6 md:h-6 rounded-full bg-transparent md:bg-[#f5f5f5] border-2 border-[#d9d9d9] shadow cursor-pointer" />
      </div>
    </div>
  );
}

HeroSection.displayName = "HeroSection";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default HeroSection;
