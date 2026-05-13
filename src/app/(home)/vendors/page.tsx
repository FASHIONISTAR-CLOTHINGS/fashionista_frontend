import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function VendorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-[#f0f0f0]" />
      <div className="p-5 space-y-2">
        <div className="h-4 w-3/4 rounded bg-[#e0e0e0]" />
        <div className="h-3 w-1/2 rounded bg-[#e8e8e8]" />
        <div className="h-3 w-5/6 rounded bg-[#e8e8e8]" />
        <div className="pt-2 h-8 w-28 rounded-full bg-[#e0e0e0]" />
      </div>
    </div>
  );
}

function VendorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Static showcase cards (real vendors fetched client-side per store page) ──
const SHOWCASE_VENDORS = [
  {
    slug: "bespoke-lagos",
    name: "Bespoke Lagos",
    specialty: "Luxury Bridal & Corporate",
    location: "Lagos Island",
    badge: "Top Rated",
  },
  {
    slug: "aso-ebi-atelier",
    name: "Aso-Ebi Atelier",
    specialty: "Traditional & Ceremonial",
    location: "Abuja",
    badge: "Verified",
  },
  {
    slug: "urban-stitch",
    name: "Urban Stitch",
    specialty: "Street & Casual Wear",
    location: "Port Harcourt",
    badge: "New",
  },
  {
    slug: "naija-threads",
    name: "Naija Threads",
    specialty: "Agbada & Senator Styles",
    location: "Enugu",
    badge: "Verified",
  },
  {
    slug: "couture-eko",
    name: "Couture Eko",
    specialty: "Evening & Red Carpet",
    location: "Victoria Island",
    badge: "Top Rated",
  },
  {
    slug: "kente-collective",
    name: "Kente Collective",
    specialty: "Pan-African Prints",
    location: "Ikeja",
    badge: "Verified",
  },
  {
    slug: "the-silk-room",
    name: "The Silk Room",
    specialty: "Luxury Ready-to-Wear",
    location: "Lagos",
    badge: "Featured",
  },
  {
    slug: "tailors-republic",
    name: "Tailors Republic",
    specialty: "Men's Bespoke Suiting",
    location: "Lekki",
    badge: "Verified",
  },
];

const BADGE_STYLES: Record<string, string> = {
  "Top Rated":
    "bg-[#fda600] text-black",
  Verified:
    "bg-[#01454A] text-white",
  New:
    "bg-purple-600 text-white",
  Featured:
    "bg-[#141414] text-white",
};

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
            <Link href="/" className="hover:text-[#fda600] transition-colors">
              Home
            </Link>
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
              { value: "200+", label: "Verified Vendors" },
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

      {/* ── Vendor Grid ───────────────────────────────────────────────────── */}
      <section className="px-5 py-12 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
            Featured Vendors
          </h2>
          <span className="font-raleway text-sm text-[#475367]">
            Showing {SHOWCASE_VENDORS.length} of 200+
          </span>
        </div>

        <Suspense fallback={<VendorGridSkeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SHOWCASE_VENDORS.map((vendor) => (
              <Link
                key={vendor.slug}
                href={`/vendors/${vendor.slug}`}
                className="group relative rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card image area */}
                <div className="relative h-44 bg-gradient-to-br from-[#01454A]/10 to-[#fda600]/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/gown.svg"
                    alt={vendor.name}
                    width={100}
                    height={100}
                    className="object-contain opacity-60 group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      BADGE_STYLES[vendor.badge] ?? "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {vendor.badge}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-2">
                  <h3 className="font-raleway font-bold text-base text-[#141414] group-hover:text-[#01454A] transition-colors">
                    {vendor.name}
                  </h3>
                  <p className="font-raleway text-xs text-[#475367]">
                    {vendor.specialty}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#475367]">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.40945 17.5655L7.45512 17.6095L7.4587 17.613C8.29556 18.4149 9.10696 18.9646 10.0247 18.954C10.9383 18.9435 11.7464 18.3795 12.5827 17.5652C13.729 16.4545 15.2121 14.9563 16.2836 13.179C17.3592 11.395 18.0533 9.27425 17.531 6.94654C15.7665 -0.920188 4.24281 -0.929405 2.46901 6.93819C1.96156 9.19992 2.60266 11.2688 3.62503 13.0223C4.64356 14.7692 6.06871 16.2523 7.21166 17.3725C7.27826 17.4378 7.34398 17.5018 7.40866 17.5648L7.40945 17.5655ZM10 5.20835C8.50429 5.20835 7.29171 6.42092 7.29171 7.91669C7.29171 9.41242 8.50429 10.625 10 10.625C11.4958 10.625 12.7084 9.41242 12.7084 7.91669C12.7084 6.42092 11.4958 5.20835 10 5.20835Z"
                        fill="#475367"
                      />
                    </svg>
                    {vendor.location}
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 font-raleway text-xs font-semibold text-[#01454A] group-hover:gap-2 transition-all">
                      Visit Store
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M7.5 5C7.5 5 12.5 8.68242 12.5 10C12.5 11.3177 7.5 15 7.5 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Suspense>

        {/* Load-more CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/categories"
            className="rounded-full border border-[#01454A] px-10 py-3.5 font-raleway text-sm font-semibold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-colors"
          >
            Explore All Products
          </Link>
        </div>
      </section>

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
