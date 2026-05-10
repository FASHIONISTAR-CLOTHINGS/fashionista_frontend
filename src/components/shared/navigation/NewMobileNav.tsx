/* eslint-disable */
"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import AccountOptions from "@/components/shared/overlays/AccountOptions";
import CartItems from "@/components/shared/overlays/CartItems";
import Link from "next/link";
import {
  Search,
  AlignJustify,
  UserRound,
  ShoppingCart,
  X,
  Headphones,
  AlertCircle,
  MapPin,
  MessageSquare,
} from "lucide-react";

/**
 * NewMobileNav — Canonical Fashionistar Mobile Navigation (FSD)
 * ──────────────────────────────────────────────────────────────
 * Merged from:
 *   • NewMobileNav.tsx (legacy) → slide-out drawer, account, cart, social icons
 *   • MobileNavBar.tsx (legacy) → slide-out nav drawer with full links
 *
 * No duplicate icons or sections. Mobile only (md:hidden).
 */
const NewMobileNav = () => {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const closeOptions = useCallback(() => setShowOptions(false), []);

  // Close drawer & account panel on route change
  useEffect(() => {
    setShowNav(false);
    setShowOptions(false);
  }, [pathname]);

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M12 17.99V14.99" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/categories",
      label: "Categories",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 19.9V4.1C10.5 2.6 9.86 2 8.27 2H4.23C2.64 2 2 2.6 2 4.1V19.9C2 21.4 2.64 22 4.23 22H8.27C9.86 22 10.5 21.4 10.5 19.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12.9V4.1C22 2.6 21.36 2 19.77 2H15.73C14.14 2 13.5 2.6 13.5 4.1V12.9C13.5 14.4 14.14 15 15.73 15H19.77C21.36 15 22 14.4 22 12.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/vendors",
      label: "Vendors",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3.01 11.22V15.71C3.01 20.2 4.81 22 9.3 22H14.69C19.18 22 20.98 20.2 20.98 15.71V11.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12C13.83 12 15.18 10.51 15 8.68L14.34 2H9.67L9 8.68C8.82 10.51 10.17 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/shops",
      label: "Shop",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M8.5 14.25C8.5 16.17 10.08 17.75 12 17.75C13.92 17.75 15.5 16.17 15.5 14.25" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 7.85C2 6 2.99 5.85 4.22 5.85H19.78C21.01 5.85 22 6 22 7.85C22 10 21.01 9.85 19.78 9.85H4.22C2.99 9.85 2 10 2 7.85Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 10L4.91 18.64C5.23 20.58 6 22 8.86 22H14.89C18 22 18.46 20.64 18.82 18.76L20.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/collections",
      label: "Collections",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M7.5 7.67V6.7C7.5 4.45 9.31 2.24 11.56 2.03C14.24 1.77 16.5 3.88 16.5 6.51V7.89" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    { href: "/about-us", label: "About Us", icon: <AlertCircle size={22} /> },
    { href: "/blog", label: "Blog", icon: <MessageSquare size={22} /> },
    { href: "/contact-us", label: "Contact Us", icon: <Headphones size={22} /> },
  ];

  // Social icon data (unique, no duplicates)
  const socialLinks = [
    {
      label: "Facebook",
      href: "/",
      svg: (
        <path d="M17.7 2.5H14.6C13.2 2.5 11.9 3.13 10.9 4.11C9.92 5.09 9.38 6.41 9.38 7.79V10.92H6.25V15.08H9.38V23.42H13.54V15.08H16.67L17.71 10.92H13.54V7.79C13.54 7.52 13.65 7.25 13.85 7.06C14.04 6.86 14.31 6.75 14.58 6.75H17.71V2.5Z"
          stroke="black" strokeWidth="1.5625" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      label: "X / Twitter",
      href: "/",
      svg: (
        <path d="M24 1.15h-3.68L12.28 10.34 3.24 1.15H-.48L8.55 11.1-.48 22.85H3.24l9.04-9.33 9.04 9.33H24.96L15.96 12.82 24 1.15Z"
          fill="black" />
      ),
    },
    {
      label: "Instagram",
      href: "/",
      svg: (
        <>
          <circle cx="12.5" cy="13" r="4.17" stroke="black" strokeWidth="1.5625" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.13 17.17V8.83C3.13 7.45 3.67 6.13 4.65 5.15C5.63 4.17 6.95 3.63 8.33 3.63H16.67C18.05 3.63 19.37 4.17 20.35 5.15C21.33 6.13 21.88 7.45 21.88 8.83V17.17C21.88 18.55 21.33 19.87 20.35 20.85C19.37 21.83 18.05 22.38 16.67 22.38H8.33C6.95 22.38 5.63 21.83 4.65 20.85C3.67 19.87 3.13 18.55 3.13 17.17Z" stroke="black" strokeWidth="1.5625" />
          <path d="M18.23 7.28L18.24 7.27" stroke="black" strokeWidth="1.5625" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
    {
      label: "Pinterest",
      href: "/",
      svg: (
        <>
          <path d="M8.33 15.6C5.21 10.92 9.86 7.27 13.02 7.27C16.19 7.27 18.75 8.99 18.75 13C18.75 16.16 16.67 18.21 14.58 18.21C12.5 18.21 11.46 16.13 11.98 13L12.5 10.92L9.37 22.9" stroke="black" strokeWidth="1.5625" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 23.42C18.25 23.42 22.92 18.75 22.92 13C22.92 7.25 18.25 2.58 12.5 2.58C6.75 2.58 2.08 7.25 2.08 13C2.08 18.75 6.75 23.42 12.5 23.42Z" stroke="black" strokeWidth="1.5625" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
  ];

  return (
    <div
      style={{ boxShadow: "0px 4px 25px 0px #0000001A" }}
      className="flex justify-between items-center bg-white md:hidden p-5"
    >
      {/* ── Brand ────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 w-1/2">
        <Image
          src="/logo.svg"
          alt="Fashionistar Logo"
          width={78}
          height={76}
          className="w-9 h-auto"
          style={{ height: "auto" }}
        />
        <span className="font-bon_foyage text-2xl text-[#333]">Fashionistar</span>
      </Link>

      {/* ── Top-bar action icons ──────────────────────── */}
      <div className="flex items-center space-x-3">
        <button
          id="mobile-menu-btn"
          onClick={() => setShowNav(true)}
          aria-label="Open navigation menu"
        >
          <AlignJustify size={24} color="#333" />
        </button>
        <button aria-label="Search">
          <Search size={22} color="#333" />
        </button>
        <div className="relative">
          <button
            type="button"
            id="mobile-account-btn"
            aria-expanded={showOptions}
            aria-controls="account-options-panel"
            onClick={() => setShowOptions((prev) => !prev)}
          >
            <UserRound size={22} color="#333" />
          </button>
          <AccountOptions showOptions={showOptions} onClose={closeOptions} />
        </div>
        <div className="relative flex">
          <button
            id="mobile-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart size={22} color="#333" />
          </button>
          <sub className="bg-[#fda600] absolute -top-2 -right-2 font-bold flex justify-center items-center w-5 h-5 rounded-full text-[10px] text-white">
            0
          </sub>
          <CartItems isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
      </div>

      {/* ── Slide-out Drawer ──────────────────────────── */}
      <div
        tabIndex={100}
        className={`fixed top-0 w-full max-w-sm transition-all ease-in-out duration-300 flex flex-col h-screen bg-white z-50 overflow-y-auto shadow-2xl ${
          showNav ? "left-0" : "-left-full"
        }`}
      >
        {/* Drawer header */}
        <div className="bg-[#01454A] py-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Fashionistar Logo"
              width={40}
              height={40}
              className="w-9 h-auto"
              style={{ height: "auto" }}
            />
            <span className="font-bon_foyage text-2xl text-white">Fashionistar</span>
          </div>
          <button onClick={() => setShowNav(false)} aria-label="Close menu">
            <X color="#fff" size={24} />
          </button>
        </div>

        <div className="px-4 py-5 flex flex-col gap-5 flex-1">
          {/* Nav links */}
          <nav>
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`w-full py-3 px-4 border-b border-[#EBEBEB] flex items-center gap-3 font-medium text-base font-raleway transition-colors ${
                  pathname === href
                    ? "bg-[#fda600]/10 text-[#01454A] font-semibold"
                    : "text-[#141414] hover:bg-gray-50"
                }`}
              >
                <span
                  className={pathname === href ? "text-[#fda600]" : "text-[#555]"}
                >
                  {icon}
                </span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Quick links card */}
          <div className="bg-[#F8F9FC] rounded-xl border border-[#EBEBEB] py-4 px-3 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <Link
                href="/contact-us"
                className="font-raleway font-medium text-base text-[#141414] flex items-center gap-2 border-r border-[#BBB] w-1/2 pr-3"
              >
                <Headphones size={20} /> Support
              </Link>
              <Link
                href="/about-us"
                className="flex items-center gap-2 font-raleway font-medium text-base text-[#141414] pl-3"
              >
                <AlertCircle size={20} /> About Us
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="font-raleway font-medium text-base text-[#141414] flex items-center gap-2 border-r border-[#BBB] w-1/2 pr-3"
              >
                <MessageSquare size={20} /> Blog
              </Link>
              <Link
                href="/contact-us"
                className="flex items-center gap-2 font-raleway font-medium text-base text-[#141414] pl-3"
              >
                <MapPin size={20} /> Location
              </Link>
            </div>
          </div>

          {/* Follow us */}
          <div className="space-y-2">
            <p className="font-raleway font-semibold text-sm text-[#333] uppercase tracking-wider">
              Follow Us
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-[#fda600] flex justify-center items-center hover:bg-[#01454A] transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 25 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {svg}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Auth CTAs */}
          <div className="mt-auto pt-4 border-t border-[#EBEBEB] space-y-2">
            <Link
              href="/auth/sign-in"
              className="block w-full text-center py-3 px-4 bg-[#01454A] text-white font-raleway font-semibold rounded-xl hover:bg-[#01454A]/90 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="block w-full text-center py-3 px-4 border-2 border-[#01454A] text-[#01454A] font-raleway font-semibold rounded-xl hover:bg-[#01454A]/5 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {showNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowNav(false)}
        />
      )}
    </div>
  );
};

export default NewMobileNav;
