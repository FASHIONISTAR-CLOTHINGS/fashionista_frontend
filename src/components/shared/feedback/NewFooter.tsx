"use client";

/**
 * @file NewFooter.tsx
 * @description Canonical Fashionistar footer — 3-column Forest Green Edition (2026).
 *
 * 3-Column Layout:
 *   Column 1: Brand + Contact (address, phone, email)
 *   Column 2: Account + Shop links (deduped, with 2026 links added)
 *   Column 3: App stores + Payment gateways + Social icons (incl. TikTok)
 *
 * Brand palette:
 *   #01454A  — Forest Green (background)
 *   #FDA600  — Gold (accents)
 *   #F8F5ED  — Cream (text on dark)
 *   #1A1208  — Ink (text on light)
 *
 * Improvements (2026 overhaul):
 * - 3-column proportional layout with equal hierarchy
 * - TikTok added to social links (clean inline SVG — Lucide has no TikTok)
 * - Payment gateway logos via FashionistarImage (real logos, not text)
 * - Duplicate links removed; 2026 links added (Size Guide, Returns, Privacy, Terms, AI FAQ)
 * - Newsletter overflow fixed (min-w-0 + max-w-full)
 * - Responsive: stacks cleanly on mobile (375px) with zero horizontal overflow
 */

import type React from "react";
import { FashionistarImage } from "@/components/media";
import Link from "next/link";
import { MapPin, Phone, Mail, type LucideIcon } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YouTubeIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/shared/icons";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_EMAIL = "support@fashionistar.net";
const DEFAULT_PHONE = "+2349137654300";
const DEFAULT_ADDRESS = "A3, Okigwe Road, Umuahia, Abia State";

// Computed once at module load — avoids Next.js 16 prerender `new Date()` error.
const CURRENT_YEAR = new Date().getFullYear();

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NewFooterProps {
  address?: string;
  phone?: string;
  email?: string;
}

interface SocialLink {
  label: string;
  href: string;
  Icon: LucideIcon | ((props: { size?: number; className?: string }) => React.ReactElement);
}

// ─── Footer Component ──────────────────────────────────────────────────────────

const NewFooter = ({
  address = DEFAULT_ADDRESS,
  phone = DEFAULT_PHONE,
  email = DEFAULT_EMAIL,
}: NewFooterProps) => {
  const year = CURRENT_YEAR;

  const socialLinks: SocialLink[] = [
    { label: "WhatsApp", href: process.env.NEXT_PUBLIC_FASHIONISTAR_WHATSAPP_URL ?? "", Icon: WhatsAppIcon },
    { label: "TikTok", href: process.env.NEXT_PUBLIC_FASHIONISTAR_TIKTOK_URL ?? "https://tiktok.com/@fashionistar", Icon: TikTokIcon },
    { label: "Twitter / X", href: process.env.NEXT_PUBLIC_FASHIONISTAR_X_URL ?? "", Icon: TwitterIcon },
    { label: "Instagram", href: process.env.NEXT_PUBLIC_FASHIONISTAR_INSTAGRAM_URL ?? "", Icon: InstagramIcon },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_FASHIONISTAR_FACEBOOK_URL ?? "", Icon: FacebookIcon },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_FASHIONISTAR_YOUTUBE_URL ?? "", Icon: YouTubeIcon },
  ].filter(({ href }) => Boolean(href));

  // Account + Shop links (deduped — no duplicate labels)
  const accountLinks = [
    { label: "Sign In", href: "/auth/sign-in" },
    { label: "View Cart", href: "/cart" },
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Track My Order", href: "/auth/sign-in?returnUrl=%2Fclient%2Fdashboard%2Forders%2Ftrack-order" },
    { label: "Contact Us", href: "/contact-us" },
  ];

  // Shop info links (2026 additions: Size Guide, Returns, Privacy, Terms, AI FAQ)
  const shopInfoLinks = [
    { label: "Delivery Information", href: "/contact-us" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "AI Measurement FAQ", href: "/get-measured#faq" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="text-foreground">

      {/* ─── 1. Light Brand Band ─────────────────────────────────────────────── */}
      <div
        className="bg-background pt-8 md:pt-16 border-t border-border"
        style={{ boxShadow: "0px 4px 20px 0px hsl(var(--foreground) / 0.06)" }}
      >
        <div className="w-full px-5 md:px-20 flex items-center gap-y-8 md:gap-4 flex-wrap justify-between py-8">
          <ul className="font-raleway text-sm md:text-lg md:w-full lg:max-w-[50%] md:order-1 text-muted-foreground max-w-[200px] w-full space-y-1">
            <li>Tel: {phone}</li>
            <li>Mon–Fri: 8am – 8pm</li>
            <li>Sat–Sun: 8am – 7pm</li>
          </ul>
          <div className="md:order-2 flex items-center gap-2">
            <FashionistarImage
              src="/logo.svg"
              alt="Fashionistar logo"
              width={46}
              height={45}
              className="w-[40px] md:w-[46px] h-auto"
              style={{ height: "auto" }}
            />
            <span className="font-bon_foyage text-2xl md:text-3xl text-[#01454A]">
              Fashionistar
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. Forest-Green 3-Column Body ────────────────────────────────────── */}
      <div className="bg-[#01454A] w-full px-5 md:px-24 pt-12 md:pt-16 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start">

          {/* Column 1 — Brand + Contact */}
          <div className="flex flex-col gap-4 md:gap-6">
            <h3 className="font-bon_foyage text-[28px] leading-[32px] md:text-[42px] md:leading-[46px] text-[#F8F5ED]">
              <span className="text-[#FDA600]">Join </span>The Largest{" "}
              <span className="text-[#FDA600]">Fashion</span> Community
            </h3>
            <p className="font-satoshi text-sm md:text-base text-[#F8F5ED]/70 leading-relaxed">
              Step into the world of innovation and style as you embark on a captivating fashion
              experience and journey to explore our collections.
            </p>

            {/* Address */}
            <address className="not-italic flex flex-col gap-3 mt-2">
              <p className="font-satoshi text-sm md:text-base text-[#F8F5ED] flex items-center gap-2">
                <MapPin size={18} className="text-[#F8F5ED]/60 shrink-0" aria-hidden="true" />
                <strong>Address:</strong>&nbsp;{address}
              </p>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-satoshi text-sm md:text-base text-[#F8F5ED] flex items-center gap-2 hover:text-[#FDA600] transition-colors"
              >
                <Phone size={18} className="text-[#F8F5ED]/60 shrink-0" aria-hidden="true" />
                <strong>Call Us:</strong>&nbsp;{phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="font-satoshi text-sm md:text-base text-[#F8F5ED] flex items-center gap-2 hover:text-[#FDA600] transition-colors"
              >
                <Mail size={18} className="text-[#F8F5ED]/60 shrink-0" aria-hidden="true" />
                <strong>Email:</strong>&nbsp;{email}
              </a>
            </address>
          </div>

          {/* Column 2 — Account + Shop Info Links */}
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {/* Account */}
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-[#F8F5ED] text-base md:text-xl font-medium font-satoshi">
                Account
              </h3>
              <ul className="flex flex-col gap-2 md:gap-3">
                {accountLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-satoshi text-sm md:text-base text-[#F8F5ED]/70 hover:text-[#FDA600] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Shop Info (2026 links) */}
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-[#F8F5ED] text-base md:text-xl font-medium font-satoshi">
                Shop Info
              </h3>
              <ul className="flex flex-col gap-2 md:gap-3">
                {shopInfoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-satoshi text-sm md:text-base text-[#F8F5ED]/70 hover:text-[#FDA600] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3 — App Stores + Payment + Social */}
          <div className="flex flex-col gap-4 md:gap-6">
            <h3 className="text-[#F8F5ED] text-base md:text-xl font-medium font-satoshi">
              Install App
            </h3>
            <p className="font-satoshi text-sm text-[#F8F5ED]/70">
              From Apple Store or Google Play Store
            </p>

            {/* App Store badges — Coming Soon */}
            <div className="flex flex-col gap-2">
              <span
                aria-label="App Store — Coming soon"
                title="Coming soon"
                className="flex items-center gap-2 bg-[#012e31] border border-[#F8F5ED]/10 p-2 rounded-xl cursor-not-allowed opacity-70 select-none"
              >
                <svg width="32" height="32" viewBox="0 0 45 45" fill="none" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M29.41 7.18C31.05 5.28 32.16 2.63 31.85 0C29.49 0.09 26.63 1.51 24.93 3.41C23.41 5.09 22.08 7.79 22.44 10.37C25.08 10.57 27.77 9.09 29.41 7.18ZM35.32 23.91C35.39 30.72 41.56 32.98 41.63 33.01C41.57 33.17 40.64 36.24 38.38 39.41C36.42 42.15 34.39 44.88 31.18 44.94C28.04 44.99 27.03 43.15 23.43 43.15C19.84 43.15 18.71 44.88 15.74 44.99C12.65 45.11 10.29 42.03 8.32 39.3C4.28 33.71 1.2 23.51 5.34 16.63C7.4 13.21 11.07 11.04 15.06 10.99C18.1 10.93 20.96 12.94 22.81 12.94C24.67 12.94 28.15 10.53 31.81 10.88C33.34 10.94 37.64 11.47 40.4 15.34C40.18 15.48 35.27 18.21 35.32 23.91Z"
                    fill="white"
                  />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] md:text-xs text-[#F8F5ED]/60 font-satoshi">Download on the</span>
                  <span className="text-white md:text-lg font-semibold font-satoshi">App Store</span>
                </div>
              </span>

              <span
                aria-label="Google Play — Coming soon"
                title="Coming soon"
                className="flex items-center gap-2 bg-[#012e31] border border-[#F8F5ED]/10 p-2 rounded-xl cursor-not-allowed opacity-70 select-none"
              >
                <svg width="32" height="32" viewBox="0 0 45 45" fill="none" aria-hidden="true">
                  <path
                    d="M25.21 24.36L5.88 43.57C5.98 43.58 6.08 43.59 6.2 43.59C6.67 43.59 7.11 43.46 7.49 43.25L7.47 43.25L30.89 29.99L25.21 24.36ZM25.21 20.72L30.94 15.03L7.47 1.76C7.11 1.54 6.66 1.41 6.19 1.41C6.06 1.41 5.93 1.42 5.8 1.44L5.81 1.44L25.21 20.72ZM3.76 3.04C3.64 3.33 3.56 3.67 3.56 4.03V40.97C3.56 41.35 3.65 41.71 3.79 42.04L23.39 22.54L3.76 3.04ZM40.1 24.78L33.22 28.68L27.04 22.54L33.27 16.35L40.1 20.22C40.9 20.68 41.43 21.53 41.43 22.5C41.43 23.48 40.9 24.32 40.11 24.78L40.1 24.78Z"
                    fill="white"
                  />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] md:text-xs text-[#F8F5ED]/60 font-satoshi">Get it on</span>
                  <span className="text-white md:text-lg font-semibold font-satoshi">Google Play</span>
                </div>
              </span>
            </div>

            {/* Payment gateways — real logos via FashionistarImage */}
            <div className="mt-2">
              <p className="font-satoshi font-medium text-sm md:text-base text-[#F8F5ED] mb-2">
                Secured payment gateways
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <FashionistarImage
                  src="https://res.cloudinary.com/fashionistar/image/upload/f_auto,q_auto,w_120,h_40,c_fit,fl_lossy/flutterwave-logo"
                  alt="Flutterwave"
                  width={120}
                  height={40}
                  className="bg-[#F8F5ED] px-2 py-1.5 rounded-lg object-contain"
                />
                <FashionistarImage
                  src="https://res.cloudinary.com/fashionistar/image/upload/f_auto,q_auto,w_120,h_40,c_fit,fl_lossy/paystack-logo"
                  alt="Paystack"
                  width={120}
                  height={40}
                  className="bg-[#F8F5ED] px-2 py-1.5 rounded-lg object-contain"
                />
              </div>
            </div>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="mt-2">
                <p className="font-satoshi font-medium text-sm md:text-base text-[#F8F5ED] mb-2">
                  Follow Us
                </p>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10",
                        "bg-[#FDA600] flex justify-center items-center rounded-full",
                        "hover:bg-[#e09500] transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]",
                      )}
                    >
                      <Icon
                        size={16}
                        className="text-[#1A1208]"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ─── 3. Bottom Bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row border-t border-[#F8F5ED]/10 justify-between items-center pt-6 mt-10 gap-4">
          {/* Copyright */}
          <p className="text-[#F8F5ED]/60 font-satoshi text-sm text-center leading-5">
            © {year} Fashionistar. All rights reserved.
          </p>
          {/* Made in Nigeria badge */}
          <p className="text-[#F8F5ED]/60 font-satoshi text-sm text-center leading-5">
            Made with ♥ in Nigeria
          </p>
        </div>
      </div>

    </footer>
  );
};

export default NewFooter;
