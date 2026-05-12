"use client";

/**
 * @file NewFooter.tsx
 * @description Canonical Fashionistar footer.
 *
 * Sections:
 *   1. Newsletter Band (white/light background)
 *   2. Dark Community Body — brand community CTA + address + account links + app stores
 *   3. Bottom copyright bar — brand + social icons + copyright
 *
 * Improvements over v1:
 * - console.log() removed (was leaking PII in production)
 * - All hardcoded hex colors replaced with CSS design tokens
 * - ESLint disable comment removed
 * - LF line endings (was CRLF)
 * - Social links use Lucide icons (no inline SVG maintenance burden)
 * - Newsletter form has accessible label, name, and aria-describedby
 * - Email/phone links use proper mailto/tel protocols with correct values
 * - Type-safe interface for all overridable props
 *
 * Usage:
 *   <NewFooter />
 *   <NewFooter address="Custom address" phone="+2349000000000" email="hello@fashionistar.net" />
 */

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useId } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_EMAIL = "support@fashionistar.net";
const DEFAULT_PHONE = "+2349137654300";
const DEFAULT_ADDRESS = "A3, Okigwe Road, Umuahia, Abia State";

// Computed once at module load — avoids Next.js 16 prerender `new Date()` error.
const CURRENT_YEAR = new Date().getFullYear();

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NewFooterProps {
  /** Optional override for contact address. */
  address?: string;
  /** Optional override for contact phone number. */
  phone?: string;
  /** Optional override for contact email. */
  email?: string;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * NewsletterForm — newsletter signup form with accessible inputs.
 */
function NewsletterForm() {
  const emailId = useId();
  const descId = useId();

  return (
    <form
      className="flex z-30 w-full"
      onSubmit={(e) => e.preventDefault()}
      aria-labelledby={descId}
    >
      <div
        className={cn(
          "h-[60px] lg:h-[85px] w-full lg:w-[85%]",
          "bg-muted rounded-r-[100px] flex items-center p-1.5 lg:p-3",
        )}
      >
        <label htmlFor={emailId} className="sr-only">
          Email address for newsletter
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={descId}
          className={cn(
            "w-2/3 h-full outline-none bg-inherit",
            "placeholder:font-raleway placeholder:font-medium placeholder:text-muted-foreground",
            "text-foreground font-raleway text-sm",
          )}
          placeholder="Enter Email Address"
        />
        <button
          type="submit"
          className={cn(
            "w-1/3 lg:min-h-[66px] h-full rounded-r-[100px] shrink-0",
            "bg-[hsl(218_47%_20%)] text-white",
            "text-sm lg:text-xl font-bold font-raleway",
            "hover:opacity-90 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
          )}
        >
          Join Waitlist
        </button>
      </div>
    </form>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * NewFooter — Fashionistar canonical footer.
 *
 * Args:
 *   address:  Physical address override.
 *   phone:    Contact phone override.
 *   email:    Contact email override.
 */
const NewFooter = ({
  address = DEFAULT_ADDRESS,
  phone = DEFAULT_PHONE,
  email = DEFAULT_EMAIL,
}: NewFooterProps) => {
  const year = CURRENT_YEAR;

  const socialLinks = [
    { label: "WhatsApp", href: "/", Icon: Phone },
    { label: "Twitter / X", href: "/", Icon: Twitter },
    { label: "Instagram", href: "/", Icon: Instagram },
    { label: "Facebook", href: "/", Icon: Facebook },
    { label: "YouTube", href: "/", Icon: Youtube },
  ] as const;

  const quickCompanyLinks = ["Our Story", "Careers", "Influencers", "Join our team"];
  const customerLinks = ["Contact Us", "Customer Service", "Find Store", "Shipping and Returns"];
  const accountLinks = [
    { label: "Sign In", href: "/auth/sign-in" },
    { label: "View Cart", href: "/cart" },
    { label: "My Wishlist", href: "/wishlist" },
    {
      label: "Track My Order",
      href: "/auth/sign-in?returnUrl=%2Fclient%2Fdashboard%2Forders%2Ftrack-order",
    },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Delivery Information", href: "/contact-us" },
    { label: "About Us", href: "/about-us" },
  ];

  return (
    <footer className="text-foreground">
      {/* ─── 1. Newsletter Band ──────────────────────────────────── */}
      <div
        className="bg-background pt-8 md:pt-16 border-t border-border"
        style={{ boxShadow: "0px 4px 20px 0px hsl(var(--foreground) / 0.06)" }}
      >
        <div className="w-full px-8 md:px-12 lg:px-20 flex flex-col md:flex-row justify-between gap-10 md:gap-0 items-center">
          {/* Brand tagline */}
          <div className="w-full md:w-[46%] border-b border-border md:border-none py-8 flex flex-col gap-5 items-center md:items-start">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                width={78}
                height={76}
                alt="Fashionistar Logo"
                className="w-10 md:w-[55px] h-auto"
                style={{ height: "auto" }}
              />
              <h2 className="font-bon_foyage text-4xl text-foreground">Fashionistar</h2>
            </div>
            <p className="font-raleway text-xl text-muted-foreground text-center md:text-left max-w-[416px] w-full">
              Step into the world of innovation and style as you embark on a captivating fashion
              experience and a journey to explore our collections.
            </p>
          </div>

          {/* Newsletter form */}
          <div className="border-b border-border md:border-none pb-8 w-full md:w-[46%] space-y-5">
            <p className="font-raleway text-center md:text-left font-semibold text-2xl leading-10 text-foreground">
              SIGN UP FOR EMAILS
            </p>
            <p id="newsletter-desc" className="font-raleway text-center md:text-left text-xl text-muted-foreground">
              Enjoy 15% off* your first order when you sign up to our newsletter
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Quick link row */}
        <div className="w-full px-8 md:px-20 flex items-center gap-y-8 md:gap-4 flex-wrap justify-between py-8">
          <ul className="md:order-2 space-y-1">
            {quickCompanyLinks.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="text-foreground/80 hover:text-[hsl(var(--accent))] text-lg md:text-xl font-raleway font-medium transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="font-raleway text-lg md:w-full lg:max-w-[50%] md:order-1 text-muted-foreground max-w-[200px] w-full space-y-1">
            <li>Tel: (234) 23-45-666</li>
            <li>Mon–Fri: 8am – 8pm</li>
            <li>Sat–Sun: 8am – 7pm</li>
          </ul>
          <ul className="md:order-2 max-w-[50%] w-full md:max-w-fit space-y-1">
            {customerLinks.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="text-foreground/80 hover:text-[hsl(var(--accent))] md:text-xl font-raleway font-medium transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── 2. Dark Community Body ──────────────────────────────── */}
      <div className="bg-foreground w-full px-5 md:px-24 pt-16 pb-4 flex flex-col">
        <div className="flex flex-wrap gap-8 justify-between items-start">
          {/* Left — brand + contact */}
          <div className="w-full md:w-[38%] flex flex-col gap-4 md:gap-7">
            <h3 className="font-bon_foyage text-[35px] leading-[35px] md:text-[58px] md:leading-[58px] text-background">
              <span className="text-[hsl(var(--accent))]">Join </span>The Largest{" "}
              <span className="text-[hsl(var(--accent))]">Fashion</span> Community
            </h3>
            <p className="font-satoshi text-[15px] md:text-lg md:leading-6 text-background/60">
              Step into the world of innovation and style as you embark on a captivating fashion
              experience and journey to explore our collections.
            </p>

            {/* Address */}
            <address className="not-italic flex flex-col gap-3">
              <p className="font-satoshi text-[15px] md:text-lg leading-6 text-background flex items-center gap-2">
                <MapPin size={20} className="text-background/60 shrink-0" aria-hidden="true" />
                <strong>Address:</strong>&nbsp;{address}
              </p>

              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-satoshi text-[15px] md:text-lg leading-6 text-background flex items-center gap-2 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Phone size={20} className="text-background/60 shrink-0" aria-hidden="true" />
                <strong>Call Us:</strong>&nbsp;{phone}
              </a>

              <a
                href={`mailto:${email}`}
                className="font-satoshi text-[15px] md:text-lg leading-6 text-background flex items-center gap-2 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Mail size={20} className="text-background/60 shrink-0" aria-hidden="true" />
                <strong>Email:</strong>&nbsp;{email}
              </a>
            </address>
          </div>

          {/* Center — Account links */}
          <div className="flex flex-col gap-4 md:gap-8">
            <h3 className="text-background text-lg md:text-[32px] md:leading-[43px] font-medium font-satoshi">
              Account
            </h3>
            <ul className="flex flex-col gap-4 md:gap-6">
              {accountLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-satoshi text-[15px] md:font-medium md:text-[20px] text-background/60 hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Install App */}
          <div className="w-1/2 md:w-[318px] flex flex-col gap-3 md:gap-7">
            <h3 className="text-background text-lg md:text-[32px] md:leading-[43px] font-medium font-satoshi">
              Install App
            </h3>
            <p className="font-satoshi text-[15px] md:text-lg text-background/60">
              From Apple Store or Google Play Store
            </p>

            {/* Apple Store */}
            <a
              href="#"
              aria-label="Download on the Apple Store"
              className="flex items-center gap-2 bg-black/80 border border-background/10 p-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M29.41 7.18C31.05 5.28 32.16 2.63 31.85 0C29.49 0.09 26.63 1.51 24.93 3.41C23.41 5.09 22.08 7.79 22.44 10.37C25.08 10.57 27.77 9.09 29.41 7.18ZM35.32 23.91C35.39 30.72 41.56 32.98 41.63 33.01C41.57 33.17 40.64 36.24 38.38 39.41C36.42 42.15 34.39 44.88 31.18 44.94C28.04 44.99 27.03 43.15 23.43 43.15C19.84 43.15 18.71 44.88 15.74 44.99C12.65 45.11 10.29 42.03 8.32 39.3C4.28 33.71 1.2 23.51 5.34 16.63C7.4 13.21 11.07 11.04 15.06 10.99C18.1 10.93 20.96 12.94 22.81 12.94C24.67 12.94 28.15 10.53 31.81 10.88C33.34 10.94 37.64 11.47 40.4 15.34C40.18 15.48 35.27 18.21 35.32 23.91Z"
                  fill="white"
                />
              </svg>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] md:text-sm text-background/60 font-satoshi">Download on the</span>
                <span className="text-white md:text-xl font-semibold font-satoshi">App Store</span>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="#"
              aria-label="Download on Google Play"
              className="flex items-center gap-2 bg-black/80 border border-background/10 p-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none" aria-hidden="true">
                <path
                  d="M25.21 24.36L5.88 43.57C5.98 43.58 6.08 43.59 6.2 43.59C6.67 43.59 7.11 43.46 7.49 43.25L7.47 43.25L30.89 29.99L25.21 24.36ZM25.21 20.72L30.94 15.03L7.47 1.76C7.11 1.54 6.66 1.41 6.19 1.41C6.06 1.41 5.93 1.42 5.8 1.44L5.81 1.44L25.21 20.72ZM3.76 3.04C3.64 3.33 3.56 3.67 3.56 4.03V40.97C3.56 41.35 3.65 41.71 3.79 42.04L23.39 22.54L3.76 3.04ZM40.1 24.78L33.22 28.68L27.04 22.54L33.27 16.35L40.1 20.22C40.9 20.68 41.43 21.53 41.43 22.5C41.43 23.48 40.9 24.32 40.11 24.78L40.1 24.78Z"
                  fill="white"
                />
              </svg>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] md:text-sm text-background/60 font-satoshi">Get it on</span>
                <span className="text-white md:text-xl font-semibold font-satoshi">Google Play</span>
              </div>
            </a>

            {/* Payment gateways */}
            <div>
              <p className="font-satoshi font-medium text-[15px] md:text-[20px] text-background mb-2">
                Secured payment gateways
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-raleway font-bold text-sm text-foreground bg-background px-3 py-2 rounded-lg">
                  Flutterwave
                </span>
                <span className="font-raleway font-bold text-sm text-foreground bg-background px-3 py-2 rounded-lg">
                  Paystack
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. Bottom Bar ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row border-t border-background/10 justify-between items-center pt-6 mt-10 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Fashionistar logo"
              width={55}
              height={54}
              className="w-[46px] md:w-full h-auto"
              style={{ height: "auto" }}
            />
            <span className="font-bon_foyage px-3 text-3xl md:text-4xl text-background">
              Fashionistar
            </span>
          </div>

          {/* Copyright (desktop) */}
          <p className="text-background/60 font-satoshi hidden md:block text-[15px] text-center leading-5">
            © {year} Fashionistar. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "w-8 h-8 md:w-[45px] md:h-[45px]",
                  "bg-[hsl(var(--accent))] flex justify-center items-center rounded-full",
                  "hover:opacity-80 transition-opacity",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
                )}
              >
                <Icon
                  size={18}
                  className="text-[hsl(var(--accent-foreground))]"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>

          {/* Copyright (mobile) */}
          <p className="text-background/60 font-satoshi md:hidden text-[13px] text-center leading-5">
            © {year} Fashionistar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
