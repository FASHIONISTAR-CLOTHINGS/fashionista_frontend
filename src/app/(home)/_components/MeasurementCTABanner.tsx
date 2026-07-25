/**
 * MeasurementCTABanner.tsx — AI Measurement Conversion Section
 *
 * Full-width forest green section forcing the binary choice:
 *   → Get Measured (FREE) — primary gold CTA
 *   → How It Works — outlined secondary CTA
 *
 * Psychological marketing: creates urgency through stat counters +
 * 3-step visual flow that collapses complexity.
 *
 * Server Component — pure static content, no JS required.
 */

import Link from "next/link";
import { Ruler, Scan, Package } from "lucide-react";

const STATS = [
  { value: "50,000+", label: "Body Profiles Created" },
  { value: "98%", label: "Fit Accuracy Rate" },
  { value: "3 min", label: "Scan Duration" },
] as const;

const STEPS = [
  {
    icon: Scan,
    step: "1",
    title: "Scan",
    description: "Use your phone camera to scan your body shape",
    id: "step-scan",
  },
  {
    icon: Ruler,
    step: "2",
    title: "Measure",
    description: "AI extracts 20+ precise body measurements instantly",
    id: "step-measure",
  },
  {
    icon: Package,
    step: "3",
    title: "Order",
    description: "Every item fits you — tailored to your exact profile",
    id: "step-order",
  },
] as const;

export function MeasurementCTABanner() {
  return (
    <section
      className="w-full bg-[#01454A] relative overflow-hidden"
      aria-labelledby="measurement-cta-heading"
      data-testid="measurement-cta-banner"
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDA600' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-wrapper relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Left: Copy + CTAs ─────────────────────────────────────── */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-raleway font-semibold text-[#FDA600] text-sm tracking-[0.25em] uppercase">
                  AI-Powered Tailoring
                </p>
                <h2
                  id="measurement-cta-heading"
                  className="font-bon_foyage text-[clamp(2.25rem,5vw,3.75rem)] leading-tight text-white"
                >
                  Perfect Fit,<br />
                  <span className="text-[#FDA600]">Guaranteed.</span>
                </h2>
                <p className="font-raleway text-white/75 text-base md:text-lg leading-relaxed max-w-xl">
                  Stop guessing your size. Our AI scans your body and creates a
                  precise measurement profile in under 3 minutes — so every
                  item you order fits perfectly from the tailor.
                </p>
              </div>

              {/* Stat counters */}
              <div className="flex flex-wrap gap-6">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-bon_foyage text-3xl md:text-4xl text-[#FDA600]">
                      {value}
                    </p>
                    <p className="font-raleway text-xs text-white/60 mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/get-measured"
                  id="measurement-cta-primary"
                  className="btn-gold text-center flex-1 sm:flex-none min-w-[180px]"
                  data-testid="measurement-cta-btn-primary"
                >
                  <Ruler className="w-4 h-4" aria-hidden="true" />
                  Get Measured — Free
                </Link>
                <Link
                  href="/get-measured#how-it-works"
                  id="measurement-cta-secondary"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 text-white font-raleway font-semibold text-sm px-8 py-3 min-h-[44px] transition-all duration-200 hover:border-white/80 hover:bg-white/10 flex-1 sm:flex-none min-w-[180px] text-center"
                  data-testid="measurement-cta-btn-secondary"
                >
                  How It Works
                </Link>
              </div>
            </div>

            {/* ── Right: 3-Step Visual ───────────────────────────────────── */}
            <div className="space-y-4" aria-label="How AI measurement works">
              {STEPS.map(({ icon: Icon, step, title, description, id }, i) => (
                <div
                  key={id}
                  id={id}
                  className="flex items-start gap-5 p-5 rounded-2xl bg-white/8 border border-white/10 backdrop-blur-sm hover:bg-white/12 transition-colors duration-200"
                >
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FDA600] flex items-center justify-center shadow-lg shadow-[#FDA600]/30">
                    <Icon className="w-5 h-5 text-[#01454A]" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-raleway text-xs font-bold text-[#FDA600]/70 uppercase tracking-widest">
                        Step {step}
                      </span>
                    </div>
                    <h3 className="font-raleway font-bold text-white text-base mb-0.5">
                      {title}
                    </h3>
                    <p className="font-raleway text-white/60 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
