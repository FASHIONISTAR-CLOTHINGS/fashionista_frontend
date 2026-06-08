/**
 * @file Hero.tsx
 * @description Production-grade animated 3-slide carousel Hero for Fashionistar.
 *
 * SLIDE 1 — Fashion Hero (Golden Yellow #FDA600)
 *   "Unlock Your Fashion Essence With Fashionistar" + model image + waitlist form
 *
 * SLIDE 2 — AI Measurement Simulation (Forest Green #01454A)
 *   Animated body scan with laser lines + measurement data points
 *   "AI Precision Measurements — Perfect Fit Every Time" + Get Measured CTA
 *
 * SLIDE 3 — New Collection (Cream/Warm gradient)
 *   "The New Fashion Collection" + fashion couple image + Explore CTA
 *
 * Carousel mechanics:
 *  - Auto-advances every 6 seconds (pauses on hover)
 *  - Animated slide transitions (transform translateX, 500ms ease-in-out)
 *  - Keyboard navigation (ArrowLeft / ArrowRight)
 *  - ARIA: role="tablist" for dot indicators, role="tabpanel" for slides
 *
 * @version 2027-enterprise
 */

"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override max-width of the inner content container (default: max-w-[1200px]) */
  maxWidth?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC HERO WRAPPER (kept for backwards compatibility)
// ─────────────────────────────────────────────────────────────────────────────

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
              <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
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
// SLIDE 1 — FASHION HERO (Golden #FDA600)
// ─────────────────────────────────────────────────────────────────────────────

function SlideOne() {
  return (
    <div className="h-full min-h-[430px] md:h-[686px] w-full bg-[#fda600] lg:rounded-br-[80px] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Get Measured button */}
      <Link
        href="/get-measured"
        className="w-[144px] flex justify-center items-center absolute top-6 right-6 h-[43px] font-semibold font-raleway rounded-[100px] bg-[#01454a] text-white shrink-0 hover:bg-[#01454a]/90 transition-colors z-10"
      >
        Get Measured
      </Link>

      {/* Decorative shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Headline + form */}
      <div className="w-full pl-5 md:pl-10 lg:pl-24 flex flex-col gap-5 justify-center relative z-10">
        <h1 className="font-bon-foyage lg:whitespace-nowrap text-[35px] leading-[44px] md:text-[75px] md:leading-[86px] text-black inline-block">
          {" "}Unlock Your Fashion <br /> Essence With{" "}
          <span className="text-white bg-[#01454a] w-full px-2 pr-10 inline-block">
            Fashionistar
          </span>
        </h1>

        <p className="font-raleway font-semibold md:text-2xl text-black">
          Early adaptors get free trials
        </p>

        {/* Email waitlist form */}
        <form className="hidden md:flex z-30" onSubmit={(e) => e.preventDefault()} noValidate>
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
            <Button
              type="submit"
              className="w-1/3 lg:min-h-[66px] h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm lg:text-xl font-bold font-raleway hover:bg-[#01454a]/90 transition-colors h-auto border-0"
            >
              Join Waitlist
            </Button>
          </div>
        </form>

        <Link
          href="/products"
          className="w-[144px] h-[43px] font-semibold font-raleway rounded-[100px] bg-[#01454a] text-white shrink-0 inline-flex items-center justify-center hover:bg-[#01454a]/90 transition-colors"
        >
          Shop now
        </Link>
      </div>

      {/* Hero model image */}
      <div className="absolute -right-3 -bottom-5 lg:right-0 lg:bottom-0">
        <FashionistarImage
          src="/heroimg.png"
          alt="Fashionistar model showcasing latest styles"
          priority
          className="w-[275px] h-[300px] md:w-[505px] md:h-[550px] max-w-full object-contain"
          width={505}
          height={550}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — AI MEASUREMENT SIMULATION (Forest Green #01454A)
// ─────────────────────────────────────────────────────────────────────────────

function MeasurementPoint({ label, value, delay, x, y }: { label: string; value: string; delay: string; x: string; y: string }) {
  return (
    <div
      className="absolute flex items-center gap-2 opacity-0 animate-[fadeInScale_0.5s_ease-out_forwards]"
      style={{ left: x, top: y, animationDelay: delay }}
    >
      <div className="w-2 h-2 rounded-full bg-[#FDA600] shadow-[0_0_8px_#FDA600] shrink-0" />
      <div className="bg-[#FDA600]/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-bold text-black whitespace-nowrap">
        {label}: <span className="text-[#01454A]">{value}</span>
      </div>
    </div>
  );
}

function SlideTwo() {
  return (
    <div className="h-full min-h-[430px] md:h-[686px] w-full bg-[#01454A] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FDA600" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Glowing accent circles */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-[#FDA600]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#FDA600]/5 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }} />

      <div className="w-full flex flex-col lg:flex-row items-center justify-between px-5 md:px-10 lg:px-20 gap-8 relative z-10">
        {/* Left: headline + CTA */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FDA600]/20 border border-[#FDA600]/40 rounded-full px-4 py-2 w-fit">
            <div className="w-2 h-2 rounded-full bg-[#FDA600] animate-pulse" />
            <span className="text-[#FDA600] text-xs font-bold font-raleway uppercase tracking-widest">
              AI-Powered Technology
            </span>
          </div>

          <h2 className="font-bon-foyage text-[32px] leading-[38px] md:text-[56px] md:leading-[64px] text-white">
            AI Precision <br />
            <span className="text-[#FDA600]">Measurements</span> <br />
            Perfect Fit Every Time
          </h2>

          <p className="font-raleway text-[#ECE6D6]/80 text-base md:text-lg leading-relaxed max-w-md">
            Our AI scans your body in seconds, capturing 50+ precise measurements. Share them securely with your tailor for garments that fit like they were made just for you — because they were.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-measured"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[100px] bg-[#FDA600] text-black font-bold font-raleway hover:bg-[#FDA600]/90 transition-all duration-300 shadow-lg shadow-[#FDA600]/30 hover:shadow-[#FDA600]/50 hover:scale-105"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Get Measured Free
            </Link>
            <Link
              href="/about-us"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[100px] border border-[#ECE6D6]/40 text-[#ECE6D6] font-semibold font-raleway hover:border-[#FDA600] hover:text-[#FDA600] transition-all duration-300"
            >
              Learn How It Works →
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 pt-2">
            {[
              { num: "50+", label: "Measurements" },
              { num: "99.8%", label: "Accuracy" },
              { num: "30s", label: "Scan Time" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-[#FDA600] font-bold text-2xl md:text-3xl font-raleway">{stat.num}</span>
                <span className="text-[#ECE6D6]/60 text-xs font-raleway uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Body scan animation */}
        <div className="relative w-[220px] h-[320px] md:w-[280px] md:h-[420px] lg:w-[320px] lg:h-[480px] shrink-0">
          {/* Body silhouette SVG */}
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 120 280" className="w-full h-full fill-white/10 stroke-[#FDA600]/60" strokeWidth="1">
              {/* Head */}
              <ellipse cx="60" cy="25" rx="18" ry="20" />
              {/* Neck */}
              <rect x="53" y="43" width="14" height="12" rx="3" />
              {/* Body */}
              <path d="M 28 55 Q 20 90 22 130 L 28 200 L 40 200 L 44 150 L 60 145 L 76 150 L 80 200 L 92 200 L 98 130 Q 100 90 92 55 Q 80 48 60 48 Q 40 48 28 55 Z" />
              {/* Left arm */}
              <path d="M 28 60 Q 10 80 8 130 L 18 132 Q 20 90 32 72 Z" />
              {/* Right arm */}
              <path d="M 92 60 Q 110 80 112 130 L 102 132 Q 100 90 88 72 Z" />
              {/* Left leg */}
              <path d="M 40 200 L 36 270 L 50 270 L 56 210 Z" />
              {/* Right leg */}
              <path d="M 80 200 L 84 270 L 70 270 L 64 210 Z" />
            </svg>

            {/* Scanning laser lines */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FDA600] to-transparent opacity-80"
                style={{
                  animation: "scanLine 3s ease-in-out infinite",
                  top: "20%",
                }}
              />
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FDA600]/40 to-transparent"
                style={{
                  animation: "scanLine 3s ease-in-out infinite",
                  top: "20%",
                  animationDelay: "0.2s",
                }}
              />
            </div>

            {/* Measurement data points */}
            <MeasurementPoint label="Chest" value='42"' delay="0.5s" x="75%" y="30%" />
            <MeasurementPoint label="Waist" value='32"' delay="1s" x="75%" y="50%" />
            <MeasurementPoint label="Hips" value='40"' delay="1.5s" x="75%" y="65%" />
            <MeasurementPoint label="Inseam" value='30"' delay="2s" x="-10%" y="72%" />
            <MeasurementPoint label="Shoulder" value='18"' delay="2.5s" x="-20%" y="28%" />
          </div>

          {/* Pulsing ring around body */}
          <div className="absolute inset-0 border-2 border-[#FDA600]/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      {/* Inline scan animation keyframes */}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8) translateX(-10px); }
          to { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — NEW COLLECTION (Cream / Warm Gradient)
// ─────────────────────────────────────────────────────────────────────────────

function SlideThree() {
  return (
    <div className="h-full min-h-[430px] md:h-[686px] w-full bg-gradient-to-br from-[#F8F5ED] via-[#ECE6D6] to-[#E8DCC8] lg:rounded-br-[80px] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Decorative geometric background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FDA600]/8 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#01454A]/8 rounded-full translate-y-1/2 -translate-x-1/4" />
        {/* Diagonal lines pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#01454A" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center justify-between px-5 md:px-10 lg:px-20 gap-8 relative z-10">
        {/* Left: text */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          {/* Season badge */}
          <div className="inline-flex items-center gap-2 bg-[#01454A] rounded-full px-4 py-2 w-fit">
            <span className="text-[#FDA600] text-xs font-bold font-raleway uppercase tracking-widest">
              ✦ New Season 2026
            </span>
          </div>

          <div>
            <p className="font-raleway font-semibold text-base text-[#01454A] uppercase tracking-widest mb-2">
              Senator Outfits
            </p>
            <h2 className="font-bon-foyage text-[36px] leading-[42px] md:text-[68px] md:leading-[76px] text-[#1A2E2F]">
              The New Fashion <br />
              <span className="text-[#01454A]">Collection</span>
            </h2>
          </div>

          <p className="font-raleway text-[#5A6465] text-base md:text-lg leading-relaxed max-w-md">
            Discover our curated 2026 fashion collection — where African heritage meets contemporary elegance. Premium fabrics, bespoke tailoring, timeless style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[100px] bg-[#01454A] text-white font-bold font-raleway hover:bg-[#01454A]/90 transition-all duration-300 hover:scale-105 shadow-md"
            >
              Explore Collection
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[100px] border-2 border-[#01454A] text-[#01454A] font-semibold font-raleway hover:bg-[#01454A] hover:text-white transition-all duration-300"
            >
              Browse Categories →
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Premium Fabrics", "Made-to-Measure", "Free Returns", "AI-Fitted"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-[#01454A]/10 text-[#01454A] text-xs font-semibold font-raleway border border-[#01454A]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: fashion imagery collage */}
        <div className="relative w-[240px] h-[360px] md:w-[340px] md:h-[500px] shrink-0">
          {/* Background card */}
          <div className="absolute inset-4 bg-[#01454A]/5 rounded-3xl" />
          {/* Main image */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
            <FashionistarImage
              src="/adunni.png"
              alt="New Fashion Collection 2026"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 240px, 340px"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8F5ED] to-transparent" />
          </div>
          {/* Price tag decoration */}
          <div className="absolute -right-4 top-12 bg-[#FDA600] rounded-2xl px-3 py-2 shadow-lg rotate-3">
            <p className="text-black text-xs font-bold font-raleway">New Season</p>
            <p className="text-black text-xs font-raleway">From ₦25,000</p>
          </div>
          {/* Rating decoration */}
          <div className="absolute -left-4 bottom-16 bg-white rounded-2xl px-3 py-2 shadow-lg -rotate-2">
            <div className="flex items-center gap-1">
              <span className="text-[#FDA600] text-sm">★★★★★</span>
            </div>
            <p className="text-[#333] text-xs font-raleway font-semibold">4.9 Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO CAROUSEL (3-Slide Animated)
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  { id: 0, label: "Fashion Hero", component: SlideOne },
  { id: 1, label: "AI Measurements", component: SlideTwo },
  { id: 2, label: "New Collection", component: SlideThree },
];

const SLIDE_INTERVAL_MS = 6000;

function HeroSection() {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
  }, []);

  React.useEffect(() => {
    if (!isHovered && !isPaused) {
      startInterval();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, isPaused, startInterval]);

  const goToSlide = React.useCallback((idx: number) => {
    setActiveSlide(idx);
    setIsPaused(false);
    startInterval();
  }, [startInterval]);

  const prevSlide = () => goToSlide((activeSlide - 1 + SLIDES.length) % SLIDES.length);
  const nextSlide = () => goToSlide((activeSlide + 1) % SLIDES.length);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlide]);

  return (
    <div
      className="flex flex-col lg:flex-row items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Homepage hero carousel"
    >
      {/* ── Slide viewport ─────────────────────────────────────── */}
      <div className="relative w-full lg:min-w-[90%] overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          aria-live="polite"
        >
          {SLIDES.map(({ id, label, component: Slide }) => (
            <div
              key={id}
              role="tabpanel"
              aria-label={label}
              aria-hidden={activeSlide !== id}
              className="w-full shrink-0"
            >
              <Slide />
            </div>
          ))}
        </div>

        {/* ── Prev/Next arrow buttons (desktop) ──────────────── */}
        <Button
          variant="ghost"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition h-auto border-0 p-0"
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition h-auto border-0 p-0"
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>

        {/* ── Progress bar ─────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex gap-1 px-4 pb-3 md:hidden">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                activeSlide === idx ? "bg-white flex-1" : "bg-white/40 w-8"
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Carousel dot indicators (vertical on desktop) ─────── */}
      <div
        className="gap-2 md:gap-4 z-30 w-full -mt-8 md:mt-0 p-5 flex justify-center lg:justify-normal lg:flex-col"
        role="tablist"
        aria-label="Hero carousel navigation"
      >
        {SLIDES.map((slide, idx) => (
          <Button
            key={slide.id}
            role="tab"
            aria-selected={activeSlide === idx}
            aria-label={`Go to slide ${idx + 1}: ${slide.label}`}
            onClick={() => goToSlide(idx)}
            className={cn(
              "rounded-full border-2 shadow cursor-pointer transition-all duration-300 h-auto min-h-0 p-0",
              activeSlide === idx
                ? "w-4 h-4 md:w-7 md:h-7 bg-[#01454A] border-[#01454A] md:scale-110"
                : "w-2.5 h-2.5 md:w-6 md:h-6 bg-transparent border-[#d9d9d9] hover:border-[#FDA600]"
            )}
          />
        ))}
      </div>
    </div>
  );
}

HeroSection.displayName = "HeroSection";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default HeroSection;
