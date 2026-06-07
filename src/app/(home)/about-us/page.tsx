/**
 * @file about-us/page.tsx
 * @description Fashionistar About Us page — Wave 8 production modernization.
 *
 * Replaces legacy SVG-based next/image calls with FashionistarImage,
 * adds proper metadata, accessibility, real copy, and modern layout.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import { NewsletterForm } from "../_components/NewsletterForm";

export const metadata: Metadata = {
  title: "About Us | Fashionistar",
  description:
    "Learn about Fashionistar — Nigeria's AI-powered fashion commerce platform connecting clients to vetted artisans, custom clothing, and digital body measurements.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Fashionistar — Nigeria's AI Fashion Platform",
    description:
      "Our story, mission, and the technology powering the future of African fashion commerce.",
    url: "/about-us",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.036 15.0835H16.0579M16.0414 23.8335H16.0633" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.2083 19.4585H21.8749" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M25.5212 7.79199C26.7294 7.79199 27.7087 8.77137 27.7087 9.97949C27.7087 11.1876 26.7294 12.167 25.5212 12.167C24.3131 12.167 23.3337 11.1876 23.3337 9.97949C23.3337 8.77137 24.3131 7.79199 25.5212 7.79199Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.04559 16.7516C2.58267 18.3855 2.5512 20.8505 3.89383 22.5846C6.55813 26.0257 9.47425 28.9418 12.9153 31.606C14.6494 32.9487 17.1144 32.9172 18.7483 31.4544C23.1843 27.4825 27.2466 23.3316 31.1672 18.7699C31.5548 18.319 31.7972 17.7663 31.8516 17.1741C32.0922 14.5555 32.5866 7.01106 30.5378 4.9622C28.4888 2.91335 20.9444 3.40766 18.3258 3.64827C17.7336 3.7027 17.1809 3.94515 16.7298 4.33274C12.1684 8.25325 8.01748 12.3157 4.04559 16.7516Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Best Prices & Offers",
    description:
      "Competitive pricing across 5,000+ products from vetted Nigerian and African artisans, with seasonal discounts, bundle deals, and loyalty rewards.",
  },
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.1373 6.36597C23.7893 6.36597 26.7495 9.30038 26.7495 12.9202C26.7495 16.5399 23.7893 19.4744 20.1373 19.4744C16.8969 19.4744 14.201 17.1641 13.6345 14.1146" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M32.5794 21.4312H29.0896C28.6609 21.4312 28.2381 21.5277 27.8547 21.713L24.8793 23.1521C24.4959 23.3375 24.0731 23.4339 23.6443 23.4339H22.1251C20.6556 23.4339 19.4643 24.5861 19.4643 26.0074C19.4643 26.0647 19.5037 26.1153 19.5607 26.1311L23.2634 27.1544C23.9277 27.3378 24.6389 27.274 25.2568 26.975L28.4377 25.4369M19.4643 25.0723L12.7716 23.0171C11.5851 22.6475 10.3026 23.0856 9.55934 24.1143C9.02197 24.8581 9.24077 25.9233 10.0237 26.3748L20.9756 32.6905C21.6721 33.0921 22.494 33.1901 23.2601 32.9629L32.5794 30.1989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "AI Body Measurements",
    description:
      "Take precise digital body measurements in under 60 seconds using just your smartphone. Our AI ensures every garment fits you perfectly, every time.",
  },
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.159 26.1224C29.159 28.1308 27.5308 29.759 25.5224 29.759C23.514 29.759 21.8859 28.1308 21.8859 26.1224C21.8859 24.114 23.514 22.4858 25.5224 22.4858C27.5308 22.4858 29.159 24.114 29.159 26.1224Z" stroke="currentColor" strokeWidth="1.49618"/>
        <path d="M14.6131 26.1224C14.6131 28.1308 12.9849 29.759 10.9765 29.759C8.96811 29.759 7.33997 28.1308 7.33997 26.1224C7.33997 24.114 8.96811 22.4858 10.9765 22.4858C12.9849 22.4858 14.6131 24.114 14.6131 26.1224Z" stroke="currentColor" strokeWidth="1.49618"/>
        <path d="M21.886 26.1223H14.6129M22.6133 23.213V10.8487C22.6133 8.79159 22.6133 7.76301 21.9743 7.12394C21.3352 6.48486 20.3066 6.48486 18.2495 6.48486H8.06711C6.00997 6.48486 4.98139 6.48486 4.34232 7.12394C3.70325 7.76301 3.70325 8.79159 3.70325 10.8487V22.4857C3.70325 23.8452 3.70325 24.5249 3.99557 25.0313C4.18707 25.363 4.46252 25.6385 4.79421 25.8299C5.30054 26.1223 5.98028 26.1223 7.3398 26.1223" stroke="currentColor" strokeWidth="1.49618" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Fast & Reliable Delivery",
    description:
      "Nationwide delivery across Nigeria with real-time tracking. Orders are packaged and shipped within 24–48 hours from our verified artisan network.",
  },
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.3796 23.9073H28.0915C29.9523 23.8759 32.7949 24.8553 32.7949 28.3874C32.7949 32.0523 29.2871 32.6668 28.0915 32.6668C26.896 32.6668 15.6055 32.6668 12.3512 32.6668C8.70588 32.6668 3.70444 31.9284 3.70447 25.6396V12.3076H32.7949V18.8781M23.3796 23.9073C23.3874 23.5962 23.5198 23.2876 23.777 23.0635L26.2525 20.9975M23.3796 23.9073C23.3713 24.2393 23.5048 24.5743 23.7802 24.8127L26.2525 26.8253" stroke="currentColor" strokeWidth="1.49618" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Easy Returns",
    description:
      "Hassle-free 14-day returns policy. If your order doesn't meet our quality standards, we will sort it — no questions asked.",
  },
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.6043 19.4583C27.8395 19.4583 32.0835 18.1525 32.0835 16.5417C32.0835 14.9308 27.8395 13.625 22.6043 13.625C17.3691 13.625 13.1251 14.9308 13.1251 16.5417C13.1251 18.1525 17.3691 19.4583 22.6043 19.4583Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M32.0835 23.104C32.0835 24.7149 27.8396 26.0207 22.6043 26.0207C17.369 26.0207 13.1251 24.7149 13.1251 23.104" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M32.0835 16.5415V29.3748C32.0835 31.1467 27.8396 32.5832 22.6043 32.5832C17.369 32.5832 13.1251 31.1467 13.1251 29.3748V16.5415" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "100% Satisfaction",
    description:
      "We stand behind every transaction on Fashionistar. Our escrow payment system ensures your money is protected until you're happy with your order.",
  },
  {
    icon: (
      <svg className="w-9 h-9 md:w-16 md:h-16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.33374 16.5415V22.3748C6.33374 27.187 6.33374 29.5932 7.82872 31.0882C9.32369 32.5832 11.7298 32.5832 16.5421 32.5832H19.4587C24.271 32.5832 26.6771 32.5832 28.1721 31.0882C29.6671 29.5932 29.6671 27.187 29.6671 22.3748V16.5415" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.87476 13.6252C4.87476 12.5348 4.87476 11.9896 5.16782 11.5835C5.35981 11.3175 5.63596 11.0965 5.96851 10.943C6.47612 10.7085 7.1576 10.7085 8.52059 10.7085H27.4789C28.8419 10.7085 29.5234 10.7085 30.031 10.943C30.3635 11.0965 30.6397 11.3175 30.8316 11.5835C31.1248 11.9896 31.1248 12.5348 31.1248 13.6252C31.1248 14.7155 31.1248 15.2607 30.8316 15.6668C30.6397 15.9328 30.3635 16.1538 30.031 16.3073C29.5234 16.5418 28.8419 16.5418 27.4789 16.5418H8.52059C7.1576 16.5418 6.47612 16.5418 5.96851 16.3073C5.63596 16.1538 5.35981 15.9328 5.16782 15.6668C4.87476 15.2607 4.87476 14.7155 4.87476 13.6252Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Great Daily Deals",
    description:
      "Fresh daily deals, flash sales, and exclusive discounts across categories — from aso-oke to agbada, senator suits to bespoke gowns.",
  },
];

const STATS = [
  { value: "AI", label: "Measurement Guided" },
  { value: "Live", label: "Vendor Marketplace" },
  { value: "Secure", label: "Escrow Payments" },
  { value: "Custom", label: "Tailoring Friendly" },
  { value: "Mobile", label: "Shopper Ready" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutUsPage() {
  return (
    <main className="bg-[#F4F3EC] text-foreground">
      {/* ── Hero / Welcome ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8 md:flex-row py-12 px-4 md:px-10 lg:px-20 md:min-h-[560px] md:items-center">
        {/* Left image */}
        <div className="relative min-h-[280px] w-full md:h-[520px] md:w-1/2 rounded-2xl overflow-hidden shadow-xl">
          <FashionistarImage
            src="/senator.svg"
            alt="Fashionistar — Nigeria's premier fashion commerce platform"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Right content */}
        <div className="flex flex-col justify-center gap-6 w-full md:w-1/2">
          <div>
            <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-3">
              Our Story
            </p>
            <h1 className="font-bon_foyage text-4xl leading-tight text-black md:text-5xl lg:text-6xl">
              Welcome to Fashionistar
            </h1>
          </div>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            Fashionistar is Nigeria&rsquo;s first AI-powered fashion commerce platform,
            connecting fashion-conscious clients with vetted artisans, tailors, and
            designers across Africa. We combine cutting-edge AI body measurement
            technology with a curated marketplace to deliver perfectly fitting,
            bespoke fashion — from your living room.
          </p>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            Founded with a mission to formalize and digitize the African fashion
            industry, Fashionistar equips artisans with tools, payments,
            and a global storefront while helping clients expect the fit, quality,
            and trust they deserve.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[#fda600] px-8 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5"
            >
              Shop Now
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-full border border-[#01454A] px-8 py-3 font-raleway text-sm font-medium text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── What We Offer ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-10 lg:px-20">
        <div className="text-center mb-12">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-3">
            Our Services
          </p>
          <h2 className="font-bon_foyage text-3xl text-black md:text-5xl">
            What We Offer Our Clients
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {SERVICES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="group hover:bg-[#fda600] transition-all duration-300 flex flex-col gap-3 justify-center items-center border border-[#fda600]/40 rounded-2xl py-8 px-4 md:py-12 md:px-6 cursor-default"
            >
              <span className="text-[#fda600] group-hover:text-black transition-colors duration-300">
                {icon}
              </span>
              <h3 className="font-bon_foyage text-black text-center text-xl md:text-2xl leading-tight">
                {title}
              </h3>
              <p className="text-center text-[#282828] text-xs md:text-sm leading-5 group-hover:text-black/80 transition-colors duration-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Performance Stats ─────────────────────────────────────────── */}
      <section className="relative min-h-[200px] bg-[#01454A] px-4 py-12">
        <div className="flex flex-wrap items-center justify-around gap-6 max-w-screen-xl mx-auto">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <p className="font-bon_foyage text-3xl font-bold text-[#fda600] md:text-4xl">
                {value}
              </p>
              <span className="font-raleway text-xs text-white/80 text-center uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Performance / Partners ────────────────────────────────── */}
      <section className="flex flex-col gap-8 md:flex-row-reverse px-4 md:px-10 lg:px-20 py-16 items-center">
        <div className="flex flex-col gap-5 w-full md:w-1/2">
          <p className="font-raleway text-base font-semibold text-[#fda600]">
            Our Performance
          </p>
          <h2 className="font-bon_foyage text-3xl leading-tight text-black md:text-4xl">
            Your Partner for E-Commerce Fashion Solutions
          </h2>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            Fashionistar is more than a marketplace — we are an ecosystem.
            From AI measurements to escrow-protected payments, real-time order tracking,
            and vendor analytics dashboards, we equip Nigerian fashion entrepreneurs
            with enterprise-grade tools to build, sell, and grow.
          </p>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            We are focused on a trustworthy shopper experience: verified storefronts,
            clearer communication, secure transactions, and better measurement capture
            for custom fashion across Nigeria and beyond.
          </p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 rounded-full bg-[#01454A] px-8 py-3 font-raleway text-sm font-bold text-white shadow-md hover:bg-[#012e31] transition-all duration-200 hover:-translate-y-0.5 self-start"
          >
            Become a Vendor
          </Link>
        </div>

        <div className="flex items-stretch gap-3 w-full md:w-1/2">
          <div className="relative h-[280px] md:h-[380px] w-1/2 rounded-2xl overflow-hidden shadow-lg">
            <FashionistarImage
              src="/woman3.svg"
              alt="Fashionistar fashion model"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative h-[280px] md:h-[380px] w-1/2 rounded-2xl overflow-hidden shadow-lg">
            <FashionistarImage
              src="/woman4.svg"
              alt="Fashionistar fashion model"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Meet the CEO ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8 md:flex-row px-4 md:px-10 lg:px-20 py-16 items-center bg-white/50">
        <div className="flex flex-col gap-5 w-full md:w-1/2">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600]">
            Leadership
          </p>
          <h2 className="font-bon_foyage text-3xl leading-tight text-black md:text-4xl">
            Meet the CEO
          </h2>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            A passionate entrepreneur at the intersection of technology and African
            culture, our founder built Fashionistar to solve a fundamental challenge:
            the gap between skilled Nigerian artisans and the global market that would
            love their work.
          </p>
          <p className="font-raleway text-base leading-7 text-[#282828]">
            With a background in fashion retail and software engineering, the vision
            is clear — use technology to make African fashion as accessible, reliable,
            and trustworthy as any global fashion brand.
          </p>
        </div>
        <div className="relative w-full md:w-1/2 min-h-[360px] rounded-2xl overflow-hidden shadow-xl">
          <FashionistarImage
            src="/ceo.png"
            alt="Fashionistar CEO"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      </section>

      {/* ── Newsletter CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#01454A] px-4 py-16 md:px-10 lg:px-20">
        <div className="relative z-10 max-w-lg">
          <h2 className="font-bon_foyage text-3xl text-white mb-3 md:text-4xl">
            Stay in the Loop
          </h2>
          <p className="font-raleway text-sm text-white/70 leading-6 mb-6">
            Get the latest drops, exclusive deals, and style guides from Fashionistar
            delivered directly to your inbox.
          </p>
          <NewsletterForm />
          <p className="mt-3 font-raleway text-xs text-white/40">
            No spam. Unsubscribe anytime.
          </p>
        </div>

        {/* Decorative image */}
        <div
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-48 h-full md:w-64 opacity-60 pointer-events-none"
        >
          <FashionistarImage
            src="/girl.png"
            alt="Fashionistar community member showcasing elegant attire"
            fill
            sizes="256px"
            className="object-contain object-bottom"
          />
        </div>
      </section>
    </main>
  );
}
