import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/features/product";
import VendorStoreClient from "./VendorStoreClient";

interface VendorNamePageProps {
  params: Promise<{ name: string }>;
}

// Allow any vendor slug not pre-generated to render at request time
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: VendorNamePageProps): Promise<Metadata> {
  const { name } = await params;
  const displayName = decodeURIComponent(name).replace(/-/g, " ");

  return {
    title: `${displayName} | Fashionistar Vendors`,
    description: `Browse products from ${displayName} on Fashionistar — AI-powered fashion commerce connecting you with professional tailors and designers.`,
    alternates: { canonical: `/vendors/${name}` },
    openGraph: {
      title: `${displayName} | Fashionistar`,
      description: `Shop ${displayName}'s curated collection on Fashionistar.`,
      url: `/vendors/${name}`,
      type: "profile",
    },
  };
}

export default async function VendorNamePage({ params }: VendorNamePageProps) {
  const { name } = await params;

  if (!name) notFound();

  const displayName = decodeURIComponent(name).replace(/-/g, " ");

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[320px] md:min-h-[400px] bg-[#01454A] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01454A] via-[#01454A]/80 to-[#fda600]/20" />

        <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 font-raleway mb-6">
            <Link href="/" className="hover:text-[#fda600] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/vendors" className="hover:text-[#fda600] transition-colors">Vendors</Link>
            <span>/</span>
            <span className="text-white capitalize">{displayName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            {/* Avatar placeholder */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-[#fda600] bg-[#D9D9D9] overflow-hidden shrink-0">
              <Image
                src="/gown.svg"
                alt={displayName}
                fill
                sizes="128px"
                className="object-contain p-2"
              />
            </div>

            <div className="space-y-2 flex-1">
              <h1 className="font-bon_foyage text-3xl md:text-5xl lg:text-6xl text-white capitalize leading-none">
                {displayName}
                <span className="text-[#fda600] block text-2xl md:text-3xl">Store</span>
              </h1>

              <p className="font-raleway text-sm text-white/70 max-w-xl">
                Artisan fashion craftsmanship — precise measurements, bespoke tailoring, and curated collections designed to fit you perfectly.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { href: "#", icon: "/socials/twitter.svg", label: "Twitter" },
                  { href: "#", icon: "/socials/instagram.svg", label: "Instagram" },
                  { href: "#", icon: "/socials/facebook.svg", label: "Facebook" },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="h-8 w-8 bg-[#fda600] rounded-full flex items-center justify-center hover:bg-[#e09500] transition-colors"
                  >
                    <Image src={icon} alt={label} width={14} height={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/get-measured"
                className="rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#e09500] transition-colors text-center"
              >
                Get Measured
              </Link>
              <Link
                href={`/contact-us?vendor=${name}`}
                className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-colors text-center"
              >
                Contact Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Info strip ────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-[#F8F9FC] px-5 py-4 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-6 text-sm font-raleway text-[#475367]">
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.40945 17.5655L7.45512 17.6095L7.4587 17.613C8.29556 18.4149 9.10696 18.9646 10.0247 18.954C10.9383 18.9435 11.7464 18.3795 12.5827 17.5652C13.729 16.4545 15.2121 14.9563 16.2836 13.179C17.3592 11.395 18.0533 9.27425 17.531 6.94654C15.7665 -0.920188 4.24281 -0.929405 2.46901 6.93819C1.96156 9.19992 2.60266 11.2688 3.62503 13.0223C4.64356 14.7692 6.06871 16.2523 7.21166 17.3725C7.27826 17.4378 7.34398 17.5018 7.40866 17.5648L7.40945 17.5655ZM10 5.20835C8.50429 5.20835 7.29171 6.42092 7.29171 7.91669C7.29171 9.41242 8.50429 10.625 10 10.625C11.4958 10.625 12.7084 9.41242 12.7084 7.91669C12.7084 6.42092 11.4958 5.20835 10 5.20835Z" fill="#475367" />
            </svg>
            Lagos, Nigeria
          </span>
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 10.0002C12.5 9.07966 13.2462 8.3335 14.1667 8.3335C16.0076 8.3335 17.5 9.82591 17.5 11.6668C17.5 13.5077 16.0076 15.0002 14.1667 15.0002C13.2462 15.0002 12.5 14.254 12.5 13.3335V10.0002Z" stroke="#475367" strokeWidth="1.5" />
              <path d="M7.5 10.0002C7.5 9.07966 6.75381 8.3335 5.83333 8.3335C3.99238 8.3335 2.5 9.82591 2.5 11.6668C2.5 13.5077 3.99238 15.0002 5.83333 15.0002C6.75381 15.0002 7.5 14.254 7.5 13.3335V10.0002Z" stroke="#475367" strokeWidth="1.5" />
              <path d="M2.5 11.6665V9.1665C2.5 5.02437 5.85787 1.6665 10 1.6665C14.1422 1.6665 17.5 5.02437 17.5 9.1665V13.205C17.5 14.8786 17.5 15.7153 17.2063 16.3679C16.8721 17.1106 16.2774 17.7053 15.5348 18.0395C14.8822 18.3332 14.0454 18.3332 12.3718 18.3332H10" stroke="#475367" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            +234 90 0000 000
          </span>
          <span className="ml-auto text-xs text-[#01454A] font-semibold uppercase tracking-wide">
            ✓ Verified Vendor
          </span>
        </div>
      </section>

      {/* ── Products section ──────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl capitalize">
            {displayName}&apos;s Products
          </h2>
          <Link
            href="/categories"
            className="font-raleway text-sm text-[#475367] hover:text-[#01454A] transition-colors flex items-center gap-1"
          >
            Browse all
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.50004 5C7.50004 5 12.5 8.68242 12.5 10C12.5 11.3177 7.5 15 7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <VendorStoreClient vendorSlug={name} />
        </Suspense>
      </section>
    </div>
  );
}
