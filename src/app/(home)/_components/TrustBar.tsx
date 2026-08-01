/**
 * TrustBar.tsx — Fashionistar Trust Signal Strip (Phase E Enhanced)
 *
 * Two-row layout:
 *  Row 1: 4 key trust signal pills (icon + title + subtitle)
 *  Row 2: Payment trust marquee strip (Paystack, Flutterwave, Mastercard, Visa, Verve, Remita)
 *
 * Server Component — no "use client" (static content + CSS marquee).
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

/** Inline SVG text badge for payment logos — no external image dependencies */
function PaymentBadge({
  label,
  bg,
  color,
  ariaHidden,
}: {
  label: string;
  bg: string;
  color: string;
  ariaHidden?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md px-3 py-1 text-[11px] font-bold tracking-wide select-none whitespace-nowrap flex-shrink-0"
      style={{ background: bg, color }}
      aria-label={ariaHidden ? undefined : `Secured by ${label}`}
      aria-hidden={ariaHidden ? true : undefined}
    >
      {label}
    </span>
  );
}

const PAYMENT_LOGOS: { label: string; bg: string; color: string }[] = [
  { label: "Paystack",    bg: "#00C3F7", color: "#fff" },
  { label: "Flutterwave", bg: "#F5A623", color: "#fff" },
  { label: "Mastercard",  bg: "#EB001B", color: "#fff" },
  { label: "VISA",        bg: "#1A1F71", color: "#fff" },
  { label: "Verve",       bg: "#00843D", color: "#fff" },
  { label: "Remita",      bg: "#0078C8", color: "#fff" },
  { label: "GTBank",      bg: "#FF6600", color: "#fff" },
  { label: "Access Bank", bg: "#E30613", color: "#fff" },
];

export function TrustBar() {
  return (
    <section
      className="w-full bg-[#01454A]"
      aria-label="Why shop with Fashionistar"
      data-testid="trust-bar"
    >
      {/* Row 1: Trust signal pills */}
      <div className="container mx-auto px-4 py-3 md:py-4">
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

      {/* Row 2: Payment trust marquee strip */}
      <div
        className="border-t border-white/10 py-2 bg-[#01454A]/80"
        aria-label="Accepted payment methods"
        data-testid="payment-trust-strip"
      >
        {/* CSS-only infinite marquee — duplicated content creates seamless loop */}
        <div className="marquee-track overflow-hidden">
          <div className="marquee-content flex items-center gap-3 px-3">
            {/* First copy (visible + accessible) */}
            {PAYMENT_LOGOS.map((p) => (
              <PaymentBadge key={p.label} label={p.label} bg={p.bg} color={p.color} />
            ))}
            {/* Second copy — aria-hidden because it is purely decorative duplicate */}
            {PAYMENT_LOGOS.map((p) => (
              <PaymentBadge
                key={`${p.label}-dup`}
                label={p.label}
                bg={p.bg}
                color={p.color}
                ariaHidden
              />
            ))}
          </div>
        </div>
        <p className="text-center text-[10px] text-white/40 font-raleway mt-1 pb-1">
          🔒 256-bit SSL encrypted · PCI DSS compliant
        </p>
      </div>
    </section>
  );
}
