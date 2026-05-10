/* eslint-disable */
import Image from "next/image";
import Link from "next/link";

/**
 * NewFooter — Canonical Fashionistar Footer (FSD)
 * ─────────────────────────────────────────────────
 * Merged from:
 *   • NewFooter.tsx (legacy) → newsletter signup section, simple nav links, payment badges
 *   • Footer.tsx   (legacy)  → dark community section, address/phone/email info,
 *                              account links, install app badges, full payment SVGs,
 *                              social icon row, copyright
 *
 * No duplicate sections or icons. Structure:
 *   1. Newsletter signup band (white — from NewFooter)
 *   2. Dark community footer body (from Footer)
 *   3. Bottom copyright bar (from Footer + NewFooter social icons)
 */

const EMAIL_ADDRESS = "[support@fashionistar.net]";
const PHONE_NUMBER = "+2349137654300";
const LOCATION = "A3, OKIGWE ROAD, UMUAHIA, ABIA  STATE..";

interface NewFooterProps {
  /** Optional override for contact address. */
  address?: string;
  /** Optional override for contact phone. */
  phone?: string;
  /** Optional override for contact email. */
  email?: string;
}

/**
 * Fallback footer with hardcoded Nigerian contact info and links.
 * Only used when an app-level default footer is missing or unset.
 *
 * @param props Optional overrides for address, phone, email.
 */

const NewFooter = ({
  address = LOCATION,
  phone = PHONE_NUMBER,
  email = EMAIL_ADDRESS,
}: NewFooterProps) => {
  const year = new Date().getFullYear();

  console.log(email, phone, address)
  return (
    <footer className="text-[#141414]">
      {/* ─── 1. Newsletter Band (white) ──────────────────────── */}
      <div
        style={{ boxShadow: "0px 4px 20px 0px #00000026" }}
        className="bg-white pt-8 md:pt-16"
      >
        <div className="w-full px-8 md:px-12 lg:px-20 flex flex-col md:flex-row justify-between gap-10 md:gap-0 items-center">
          {/* Brand tagline */}
          <div className="w-full md:w-[46%] border-b border-[#D9D9D9] md:border-none py-8 flex flex-col gap-5 items-center md:items-start">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                width={78}
                height={76}
                alt="Fashionistar Logo"
                className="w-10 md:w-[55px] h-auto"
                style={{ height: "auto" }}
              />
              <h2 className="font-bon_foyage text-4xl text-[#333]">Fashionistar</h2>
            </div>
            <p className="font-raleway text-xl text-[#333] text-center md:text-left max-w-[416px] w-full">
              Step into the world of innovation and style as you embark on a
              captivating fashion experience and a journey to explore our collections.
            </p>
          </div>

          {/* Newsletter form */}
          <div className="border-b border-[#D9D9D9] md:border-none pb-8 w-full md:w-[46%] space-y-5">
            <p className="font-raleway text-center md:text-left font-semibold text-2xl leading-10 text-black">
              SIGN UP FOR EMAILS
            </p>
            <p className="font-raleway text-center md:text-left text-xl text-black">
              Enjoy 15% off* your first order when you sign up to our newsletter
            </p>
            <form className="flex z-30 w-full">
              <div className="h-[60px] lg:h-[85px] w-full lg:w-[85%] bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5 lg:p-3">
                <input
                  type="email"
                  className="w-2/3 h-full outline-none bg-inherit placeholder:font-raleway placeholder:font-medium placeholder:text-[#333] text-[#333]"
                  placeholder="Enter Email Address"
                />
                <button
                  type="submit"
                  className="w-1/3 lg:min-h-[66px] h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm lg:text-xl font-bold font-raleway hover:bg-[#01454a]/90 transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick link row */}
        <div className="w-full px-8 md:px-20 flex items-center gap-y-8 md:gap-4 flex-wrap justify-between py-8">
          <ul className="md:order-2 space-y-1">
            {["Our Story", "Careers", "Influencers", "Join our team"].map((item) => (
              <li key={item} className="text-black hover:text-[#fda600] text-lg md:text-xl font-raleway font-medium">
                <Link href="#">{item}</Link>
              </li>
            ))}
          </ul>
          <ul className="font-raleway text-lg md:w-full lg:max-w-[50%] md:order-1 text-black max-w-[200px] w-full space-y-1">
            <li>Tel:(234)23-45-666</li>
            <li>Mon–Fri: 8am – 8pm</li>
            <li>Sat–Sun: 8am – 7pm</li>
          </ul>
          <ul className="md:order-2 max-w-[50%] w-full md:max-w-fit space-y-1">
            {["Contact Us", "Customer Service", "Find Store", "Shipping and Returns"].map((item) => (
              <li key={item} className="text-black hover:text-[#fda600] md:text-xl font-raleway font-medium">
                <Link href="#">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── 2. Dark Community Body ──────────────────────────── */}
      <div className="bg-[#141414] w-full px-5 md:px-24 pt-16 pb-4 flex flex-col">
        <div className="flex flex-wrap gap-8 justify-between items-start">
          {/* Left — brand + contact */}
          <div className="w-full md:w-[38%] flex flex-col gap-4 md:gap-7">
            <h3 className="font-bon_foyage text-[35px] leading-[35px] md:text-[58px] md:leading-[58px] text-white">
              <span className="text-[#fda600]">Join </span>The Largest{" "}
              <span className="text-[#fda600]">Fashion</span> Community
            </h3>
            <p className="font-satoshi text-[15px] md:text-lg md:leading-6 text-[#A1A1A1]">
              Step into the world of innovation and style as you embark on a
              captivating fashion experience and journey to explore our collections.
            </p>

            {/* Address */}
            <p className="font-satoshi text-[15px] md:text-lg leading-6 text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.41 17.57L7.46 17.61L7.46 17.61C8.3 18.41 9.11 18.96 10.02 18.95C10.94 18.94 11.75 18.38 12.58 17.57C13.73 16.45 15.21 14.96 16.28 13.18C17.36 11.4 18.05 9.27 17.53 6.95C15.77 -0.92 4.24 -0.93 2.47 6.94C1.96 9.2 2.6 11.27 3.63 13.02C4.64 14.77 6.07 16.25 7.21 17.37C7.28 17.44 7.34 17.5 7.41 17.57ZM10 5.21C8.5 5.21 7.29 6.42 7.29 7.92C7.29 9.41 8.5 10.63 10 10.63C11.5 10.63 12.71 9.41 12.71 7.92C12.71 6.42 11.5 5.21 10 5.21Z" fill="white" />
              </svg>
              <strong>Address:</strong> {address}.
            </p>

            {/* Phone */}
            <a href="tel:+2349137654300" className="font-satoshi text-[15px] md:text-lg leading-6 text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 10C12.5 9.08 13.25 8.33 14.17 8.33C16.01 8.33 17.5 9.83 17.5 11.67C17.5 13.51 16.01 15 14.17 15C13.25 15 12.5 14.25 12.5 13.33V10Z" stroke="white" strokeWidth="1.5" />
                <path d="M7.5 10C7.5 9.08 6.75 8.33 5.83 8.33C3.99 8.33 2.5 9.83 2.5 11.67C2.5 13.51 3.99 15 5.83 15C6.75 15 7.5 14.25 7.5 13.33V10Z" stroke="white" strokeWidth="1.5" />
                <path d="M2.5 11.67V9.17C2.5 5.02 5.86 1.67 10 1.67C14.14 1.67 17.5 5.02 17.5 9.17V13.21C17.5 14.88 17.5 15.72 17.21 16.37C16.87 17.11 16.28 17.71 15.53 18.04C14.88 18.33 14.05 18.33 12.37 18.33H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <strong>Call Us On:</strong><a href="tel:+2349137654300">{phone}</a>
            </a>

            {/* Email */}
            <a href="mailto:[EMAIL_ADDRESS]" className="font-satoshi text-[15px] md:text-lg leading-6 text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 6.67L14.53 8.32C12.88 9.23 12.05 9.69 11.18 9.87C10.4 10.03 9.6 10.03 8.82 9.87C7.95 9.69 7.12 9.23 5.47 8.32L2.5 6.67M5.17 15.83H14.83C15.77 15.83 16.23 15.83 16.59 15.65C16.9 15.49 17.16 15.24 17.32 14.92C17.5 14.57 17.5 14.1 17.5 13.17V6.83C17.5 5.9 17.5 5.43 17.32 5.08C17.16 4.76 16.9 4.51 16.59 4.35C16.23 4.17 15.77 4.17 14.83 4.17H5.17C4.23 4.17 3.77 4.17 3.41 4.35C3.1 4.51 2.84 4.76 2.68 5.08C2.5 5.43 2.5 5.9 2.5 6.83V13.17C2.5 14.1 2.5 14.57 2.68 14.92C2.84 15.24 3.1 15.49 3.41 15.65C3.77 15.83 4.23 15.83 5.17 15.83Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <strong>Email:</strong><a href="mailto:[EMAIL_ADDRESS]">{email}</a>
            </a>
          </div>

          {/* Center — Account links */}
          <div className="flex flex-col gap-4 md:gap-8">
            <h3 className="text-white text-lg md:text-[32px] md:leading-[43px] font-medium font-satoshi">
              Account
            </h3>
            <ul className="flex flex-col gap-4 md:gap-6">
              {[
                { label: "Sign In", href: "/auth/sign-in" },
                { label: "View Cart", href: "/cart" },
                { label: "My Wishlist", href: "/wishlist" },
                { label: "Track My Order", href: "/auth/sign-in?returnUrl=%2Fclient%2Fdashboard%2Forders%2Ftrack-order" },
                { label: "Contact Us", href: "/contact-us" },
                { label: "Delivery Information", href: "/contact-us" },
                { label: "About Us", href: "/about-us" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    className="font-satoshi text-[15px] md:font-medium md:text-[20px] text-[#A1A1A1] hover:text-[#fda600] transition-colors"
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Install App */}
          <div className="w-1/2 md:w-[318px] flex flex-col gap-3 md:gap-7">
            <h3 className="text-white text-lg md:text-[32px] md:leading-[43px] font-medium font-satoshi">
              Install App
            </h3>
            <p className="font-satoshi text-[15px] md:text-lg text-[#A1A1A1]">
              From Apple Store or Google Play Store
            </p>
            {/* Apple Store */}
            <div className="flex items-center gap-2 bg-black p-2 rounded cursor-pointer hover:opacity-80 transition-opacity">
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M29.41 7.18C31.05 5.28 32.16 2.63 31.85 0C29.49 0.09 26.63 1.51 24.93 3.41C23.41 5.09 22.08 7.79 22.44 10.37C25.08 10.57 27.77 9.09 29.41 7.18ZM35.32 23.91C35.39 30.72 41.56 32.98 41.63 33.01C41.57 33.17 40.64 36.24 38.38 39.41C36.42 42.15 34.39 44.88 31.18 44.94C28.04 44.99 27.03 43.15 23.43 43.15C19.84 43.15 18.71 44.88 15.74 44.99C12.65 45.11 10.29 42.03 8.32 39.3C4.28 33.71 1.2 23.51 5.34 16.63C7.4 13.21 11.07 11.04 15.06 10.99C18.1 10.93 20.96 12.94 22.81 12.94C24.67 12.94 28.15 10.53 31.81 10.88C33.34 10.94 37.64 11.47 40.4 15.34C40.18 15.48 35.27 18.21 35.32 23.91Z" fill="white"/>
              </svg>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] md:text-lg text-[#d9d9d9] font-satoshi">Download on the</span>
                <span className="text-white md:text-3xl font-medium font-satoshi">AppleStore</span>
              </div>
            </div>
            {/* Google Play */}
            <div className="flex items-center gap-2 bg-black p-2 rounded cursor-pointer hover:opacity-80 transition-opacity">
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path d="M25.21 24.36L5.88 43.57C5.98 43.58 6.08 43.59 6.2 43.59C6.67 43.59 7.11 43.46 7.49 43.25L7.47 43.25L30.89 29.99L25.21 24.36ZM25.21 20.72L30.94 15.03L7.47 1.76C7.11 1.54 6.66 1.41 6.19 1.41C6.06 1.41 5.93 1.42 5.8 1.44L5.81 1.44L25.21 20.72ZM3.76 3.04C3.64 3.33 3.56 3.67 3.56 4.03V40.97C3.56 41.35 3.65 41.71 3.79 42.04L23.39 22.54L3.76 3.04ZM40.1 24.78L33.22 28.68L27.04 22.54L33.27 16.35L40.1 20.22C40.9 20.68 41.43 21.53 41.43 22.5C41.43 23.48 40.9 24.32 40.11 24.78L40.1 24.78Z" fill="white"/>
              </svg>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] md:text-lg text-[#d9d9d9] font-satoshi">Download on the</span>
                <span className="text-white md:text-3xl font-medium font-satoshi">GooglePlay</span>
              </div>
            </div>

            {/* Payment gateways label */}
            <div>
              <p className="font-satoshi font-medium text-[15px] md:text-[20px] text-white mb-2">
                Secured payment gateways
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-raleway font-bold text-sm text-black bg-white px-3 py-2 rounded">
                  Flutterwave
                </span>
                <span className="font-raleway font-bold text-sm text-black bg-white px-3 py-2 rounded">
                  Paystack
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. Bottom Bar ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row border-t border-[#282828] justify-between items-center pt-6 mt-10 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={55} height={54} className="w-[46px] md:w-full h-auto" style={{ height: "auto" }} />
            <span className="font-bon_foyage px-3 text-3xl md:text-4xl text-white">Fashionistar</span>
          </div>

          {/* Copyright */}
          <p className="text-white font-satoshi hidden md:block text-[15px] text-center leading-5">
            © {year} Fashionistar. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { label: "WhatsApp", src: "/socials/whatsapp.svg" },
              { label: "Twitter", src: "/socials/twitter.svg" },
              { label: "Instagram", src: "/socials/instagram.svg" },
              { label: "Facebook", src: "/socials/facebook.svg" },
            ].map(({ label, src }) => (
              <a
                key={label}
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 md:w-[45px] md:h-[45px] bg-[#fda600] flex justify-center items-center rounded-full hover:bg-white transition-colors"
              >
                <Image src={src} alt={label} width={28} height={28} className="w-[70%] h-[70%] object-contain" />
              </a>
            ))}
          </div>

          {/* Copyright (mobile) */}
          <p className="text-white font-satoshi md:hidden text-[13px] text-center leading-5">
            © {year} Fashionistar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
