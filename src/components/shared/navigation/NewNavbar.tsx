/**
 * @file NewNavbar.tsx
 * @description Canonical Fashionistar desktop navigation header.
 *
 * Architectural notes:
 * - Desktop only (hidden on mobile). Pair with <NewMobileNav /> for mobile.
 * - All brand colours reference CSS design tokens — never hardcoded hex.
 * - Cart badge count reads from Zustand cart store (getItemCount selector).
 * - Search input navigates to /products?q=<query> on submit.
 * - Sticky top-0 with brand-aware shadow.
 *
 * Usage:
 *   <NewNavbar />   // place in (home)/layout.tsx
 */
"use client";

import { useCallback, useId, useState, useEffect } from "react";
import { Search, UserRound, ShoppingCart, Phone } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AccountOptions from "@/components/shared/overlays/AccountOptions";
import CartItems from "@/components/shared/overlays/CartItems";
import { useCartBadge } from "@/features/cart/hooks/use-cart-badge";

// ─── Nav link data ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/vendors", label: "Vendors" },
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about-us", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact" },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * NewNavbar — Fashionistar desktop navigation.
 *
 * Renders a sticky header with:
 * - Brand logo + wordmark
 * - Horizontal nav links (active state via CSS token `--accent`)
 * - Search bar (navigates to /products?q=<query> on Enter)
 * - 24/7 phone widget
 * - Account dropdown (`AccountOptions`)
 * - Cart slide-over (`CartItems`) with live badge count from Zustand store
 */
const NewNavbar = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchId = useId();
  const closeOptions = useCallback(() => setShowOptions(false), []);

  // Live cart count from TanStack Query cache (zero-cost cache read)
  const cartCount = useCartBadge();

  // Delay badge rendering until after hydration — prevents SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        router.push(`/products?q=${encodeURIComponent(q)}`);
        setSearchQuery("");
      }
    },
    [searchQuery, router],
  );

  return (
    <header
      className={cn(
        "hidden md:flex md:flex-wrap lg:flex-nowrap",
        "justify-between bg-background items-center",
        "py-4 px-2 lg:px-14 xl:px-20",
        "sticky top-0 z-40 border-b border-border/60",
        "shadow-[0_4px_25px_0_hsl(var(--foreground)/0.06)]",
      )}
      suppressHydrationWarning
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src="/logo.svg"
          alt="Fashionistar"
          width={78}
          height={76}
          className="w-10 md:w-[50px] h-auto"
          style={{ height: "auto" }}
          priority
        />
        <span className="font-bon_foyage text-2xl md:text-3xl text-foreground">
          Fashionistar
        </span>
      </Link>

      {/* ── Navigation links ────────────────────────────────────────── */}
      <nav className="hidden lg:flex" aria-label="Main navigation">
        <ul className="flex items-center gap-4 xl:gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "font-raleway text-[15px] xl:text-base transition-colors",
                    isActive
                      ? "font-bold text-[hsl(var(--accent))]"
                      : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Right cluster ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar — navigates to /products?q=<query> on submit */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          aria-label="Search products"
        >
          <div
            className={cn(
              "bg-muted rounded-[90px] hidden md:flex items-center",
              "px-3 max-w-[200px] xl:max-w-[270px] w-full gap-2 h-[48px]",
            )}
            suppressHydrationWarning
          >
            <label htmlFor={searchId} className="sr-only">
              Search products
            </label>
            <Search size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              placeholder="Search Products…"
              aria-label="Search products"
              aria-haspopup="listbox"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "placeholder:text-muted-foreground font-satoshi font-medium",
                "text-foreground bg-inherit outline-none border-none text-sm w-full",
              )}
              suppressHydrationWarning
            />
          </div>
        </form>

        {/* Phone widget */}
        <div className="hidden xl:flex flex-col leading-none shrink-0 ml-1">
          <a
            href="tel:+2349000000000"
            className="flex items-center gap-1 font-medium text-sm text-foreground whitespace-nowrap hover:text-[hsl(var(--accent))] transition-colors"
          >
            <Phone size={13} aria-hidden="true" />
            +234 90 0000 000
          </a>
          <span className="text-[10px] text-muted-foreground text-right">24/7 support</span>
        </div>

        {/* Account dropdown */}
        <div className="relative">
          <button
            type="button"
            id="navbar-account-btn"
            aria-expanded={showOptions}
            aria-controls="account-options-panel"
            aria-label="Open account menu"
            onClick={() => setShowOptions((prev) => !prev)}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              "hover:bg-[hsl(var(--accent))]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
            )}
          >
            <UserRound size={22} className="text-foreground" />
          </button>
          <AccountOptions showOptions={showOptions} onClose={closeOptions} />
        </div>

        {/* Cart — live badge count from Zustand store */}
        <div className="relative flex">
          <button
            type="button"
            id="navbar-cart-btn"
            aria-label={`Open cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            suppressHydrationWarning
            className={cn(
              "p-1.5 rounded-full transition-colors",
              "hover:bg-[hsl(var(--accent))]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
            )}
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart size={22} className="text-foreground" />
          </button>
          {mounted && cartCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "bg-[hsl(var(--accent))] absolute -top-2 -right-2",
                "font-bold flex justify-center items-center",
                "w-5 h-5 rounded-full text-[10px] text-[hsl(var(--accent-foreground))]",
                "transition-all duration-200",
              )}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
          <CartItems isOpen={showCart} onClose={() => setShowCart(false)} />
        </div>
      </div>
    </header>
  );
};

export default NewNavbar;
