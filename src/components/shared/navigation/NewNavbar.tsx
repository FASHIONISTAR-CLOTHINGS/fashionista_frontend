/* eslint-disable */
"use client";
import { useCallback, useState } from "react";
import { Search, UserRound, ShoppingCart, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AccountOptions from "@/components/shared/overlays/AccountOptions";
import CartItems from "@/components/shared/overlays/CartItems";

/**
 * NewNavbar — Canonical Fashionistar Desktop Navigation (FSD)
 * ─────────────────────────────────────────────────────────────
 * Merged from:
 *   • NewNavbar.tsx (legacy) → nav links: Home, Categories, Vendors, Shop, Collections
 *   • Navbar.tsx (legacy)    → extra links: About, Testimonials, Blog, Contact Us
 *                              + phone number widget / 24-7 support
 *
 * Desktop only (hidden on mobile). Pair with <NewMobileNav /> for mobile.
 */
const NewNavbar = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const pathname = usePathname();
  const closeOptions = useCallback(() => setShowOptions(false), []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/vendors", label: "Vendors" },
    { href: "/shops", label: "Shop" },
    { href: "/collections", label: "Collections" },
    { href: "/about-us", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact-us", label: "Contact" },
  ];

  return (
    <header
      className="hidden md:flex md:flex-wrap lg:flex-nowrap justify-between bg-white items-center py-4 px-2 lg:px-14 xl:px-20 sticky top-0 z-40"
      style={{ boxShadow: "0px 4px 25px 0px #0000001A" }}
      suppressHydrationWarning
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src="/logo.svg"
          alt="Fashionistar Logo"
          width={78}
          height={76}
          className="w-10 md:w-[50px] h-auto"
          style={{ height: "auto" }}
          priority
        />
        <span className="font-bon_foyage text-2xl md:text-3xl text-[#333]">
          Fashionistar
        </span>
      </Link>

      {/* ── Navigation links ────────────────────────────────────────── */}
      <nav className="hidden lg:flex">
        <ul className="flex items-center gap-4 xl:gap-6">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-raleway text-[15px] xl:text-base transition-colors hover:text-[#fda600] ${
                  pathname === href
                    ? "font-bold text-[#fda600]"
                    : "font-medium text-[#333]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Right cluster — Search · Phone · Account · Cart ───────── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar */}
        <div
          className="bg-[#F4F5FB] rounded-[90px] hidden md:flex items-center px-3 max-w-[200px] xl:max-w-[270px] w-full gap-2 h-[48px]"
          suppressHydrationWarning
        >
          <Search color="#333333" size={16} />
          <input
            type="search"
            placeholder="Search Products…"
            className="placeholder:text-[#333333] font-satoshi font-medium text-[#333333] bg-inherit outline-none border-none text-sm w-full"
            suppressHydrationWarning
          />
        </div>

        {/* Phone widget — from legacy Navbar */}
        <div className="hidden xl:flex flex-col leading-none shrink-0 ml-1">
          <span className="flex items-center gap-1 font-medium text-sm text-black whitespace-nowrap">
            <Phone size={13} />
            +234 90 0000 000
          </span>
          <span className="text-[10px] text-[#666] text-right">24/7 support</span>
        </div>

        {/* Account */}
        <div className="relative">
          <button
            type="button"
            id="navbar-account-btn"
            aria-expanded={showOptions}
            aria-controls="account-options-panel"
            onClick={() => setShowOptions((prev) => !prev)}
            className="p-1.5 rounded-full hover:bg-[#F4F5FB] transition-colors"
          >
            <UserRound size={22} color="#333" />
          </button>
          <AccountOptions showOptions={showOptions} onClose={closeOptions} />
        </div>

        {/* Cart */}
        <div className="relative flex">
          <button
            type="button"
            id="navbar-cart-btn"
            className="p-1.5 rounded-full hover:bg-[#F4F5FB] transition-colors"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart size={22} color="#333" />
          </button>
          <sub className="bg-[#fda600] absolute -top-2 -right-2 font-bold flex justify-center items-center w-5 h-5 rounded-full text-[10px] text-white">
            0
          </sub>
          <CartItems isOpen={showCart} onClose={() => setShowCart(false)} />
        </div>
      </div>
    </header>
  );
};

export default NewNavbar;
