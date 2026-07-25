/**
 * TrustBar.tsx — Fashionistar Trust Signal Strip
 *
 * Thin horizontal strip below hero / top of page.
 * 4 key trust signals with icons.
 * Forest green background, white text.
 * Animates in on scroll with IntersectionObserver.
 *
 * Server Component — no "use client" needed (static content).
 */

import { Ruler, ShieldCheck, Truck, Star } from "lucide-react";

const TRUST_SIGNALS = [
  {
    icon: Ruler,
    title: "Free AI Measurement",
    subtitle: "3-minute body scan for perfect fit",
    id: "trust-measure",
  },
  {
    icon: ShieldCheck,
    title: "Verified Tailors",
    subtitle: "Every vendor is background-checked",
    id: "trust-verified",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    subtitle: "Lagos, Abuja, PH & beyond",
    id: "trust-delivery",
  },
  {
    icon: Star,
    title: "10k+ Happy Clients",
    subtitle: "4.8 ★ average rating across orders",
    id: "trust-rating",
  },
] as const;

export function TrustBar() {
  return (
    <section
      className="w-full bg-[#01454A] py-3 md:py-4"
      aria-label="Why shop with Fashionistar"
      data-testid="trust-bar"
    >
      <div className="container mx-auto px-4">
        <ul
          role="list"
          className="flex flex-wrap items-center justify-center md:justify-between gap-x-6 gap-y-3 md:gap-y-0"
        >
          {TRUST_SIGNALS.map(({ icon: Icon, title, subtitle, id }) => (
            <li
              key={id}
              role="listitem"
              id={id}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FDA600]/20 flex items-center justify-center"
                aria-hidden="true"
              >
                <Icon className="w-4 h-4 text-[#FDA600]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="font-raleway font-semibold text-white text-sm leading-tight whitespace-nowrap">
                  {title}
                </p>
                <p className="font-raleway text-white/60 text-xs leading-tight hidden sm:block whitespace-nowrap">
                  {subtitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
