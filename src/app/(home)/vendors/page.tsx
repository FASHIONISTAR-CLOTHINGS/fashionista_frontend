import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VendorsClient } from "./VendorsClient";

// ── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Our Vendors | Fashionistar — Premium Fashion Designers & Tailors",
  description:
    "Discover professional tailors and fashion designers on Fashionistar. Browse curated vendor stores, bespoke clothing, and exclusive collections.",
  alternates: { canonical: "/vendors" },
  openGraph: {
    title: "Our Vendors | Fashionistar",
    description:
      "Connect with Nigeria's finest fashion designers and tailors on Fashionistar.",
    url: "/vendors",
    type: "website",
  },
};

// ── Skeleton fallback ─────────────────────────────────────────────────────────
function VendorGridSkeleton() {
  return (
    <div className="px-5 py-10 md:px-10 lg:px-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-[#ECE6D6] bg-white overflow-hidden">
            <div className="h-44 bg-[#ECE6D6]" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 rounded bg-[#ECE6D6]" />
              <div className="h-3 w-full rounded bg-[#ECE6D6]" />
              <div className="h-3 w-1/2 rounded bg-[#ECE6D6]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VendorsPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[300px] md:min-h-[380px] bg-[#01454A] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-batik.svg')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#01454A] via-[#01454A]/90 to-[#fda600]/20" />

        <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 space-y-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 font-raleway">
            <Link href="/" className="hover:text-[#fda600] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Vendors</span>
          </nav>

          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
            Our Artisans
          </p>
          <h1 className="font-bon_foyage text-4xl leading-none text-white md:text-6xl lg:text-7xl">
            Meet Our Vendors
          </h1>
          <p className="font-raleway text-base leading-7 text-white/80 max-w-xl">
            Browse Nigeria&apos;s finest tailors and fashion designers. Each vendor is
            carefully vetted for craftsmanship, reliability, and style excellence.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/get-measured"
              className="rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#e09500] transition-colors"
            >
              Get Measured
            </Link>
            <Link
              href="/categories"
              className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-[#F8F9FC]">
        <div className="px-5 py-5 md:px-10 lg:px-20">
          <div className="flex flex-wrap items-center gap-8 text-sm font-raleway text-[#475367]">
            {[
              { value: "200+",  label: "Verified Vendors" },
              { value: "4.8★", label: "Average Rating" },
              { value: "50k+", label: "Orders Fulfilled" },
              { value: "100%", label: "Quality Assured" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-0.5">
                <span className="text-xl font-bold text-[#01454A]">{value}</span>
                <span className="text-xs uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Vendor Grid (Client) ──────────────────────────────────────── */}
      <Suspense fallback={<VendorGridSkeleton />}>
        <VendorsClient />
      </Suspense>

      {/* ── Become a Vendor CTA ────────────────────────────────────────────── */}
      <section className="bg-[#01454A] px-5 py-16 md:px-10 lg:px-20">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
            Grow Your Brand
          </p>
          <h2 className="font-bon_foyage text-3xl text-white md:text-5xl">
            Become a Fashionistar Vendor
          </h2>
          <p className="font-raleway text-base text-white/70 leading-7">
            Join 200+ vetted artisans reaching thousands of fashion-conscious clients
            daily. AI-powered measurements, built-in payments, and zero commissions on
            your first 6 months.
          </p>
          <Link
            href="/auth/sign-up?role=vendor"
            className="inline-block rounded-full bg-[#fda600] px-10 py-3.5 font-raleway text-sm font-bold text-black shadow hover:bg-[#e09500] transition-colors"
          >
            Apply to Sell
          </Link>
        </div>
      </section>
    </div>
  );
}
