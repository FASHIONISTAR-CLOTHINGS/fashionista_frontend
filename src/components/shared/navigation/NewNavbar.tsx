/**
 * @file NewNavbar.tsx
 * @description Canonical Fashionistar desktop navigation header with mega-menu.
 *
 * Architectural notes:
 * - Desktop only (hidden on mobile). Pair with <NewMobileNav /> for mobile.
 * - All brand colours reference CSS design tokens — never hardcoded hex.
 * - Cart badge count reads from Zustand cart store (getItemCount selector).
 * - Search input navigates to /products?q=<query> on submit.
 * - Sticky top-0 with brand-aware shadow.
 * - Mega-menu on "Categories" & "Collections" hover: SSR-safe, keyboard-accessible.
 *
 * Usage:
 *   <NewNavbar />   // place in (home)/layout.tsx
 */
"use client";

import { useCallback, useId, useState, useEffect, useRef } from "react";
import { Search, UserRound, ShoppingCart, ChevronDown, Ruler } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AccountOptions from "@/components/shared/overlays/AccountOptions";
import CartItems from "@/components/shared/overlays/CartItems";
import { useCartBadge } from "@/features/cart/hooks/use-cart-badge";

// ─── Static nav link data ──────────────────────────────────────────────────────

const SIMPLE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vendors", label: "Vendors" },
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact" },
] as const;

// Mega-menu data — categories panel
const MEGA_CATEGORIES = [
  { href: "/categories/dresses", label: "Dresses" },
  { href: "/categories/men-native", label: "Men's Native" },
  { href: "/categories/women-native", label: "Women's Native" },
  { href: "/categories/agbada", label: "Agbada & Brocade" },
  { href: "/categories/senator", label: "Senator Styles" },
  { href: "/categories/ankara", label: "Ankara Prints" },
  { href: "/categories/bridal", label: "Bridal & Wedding" },
  { href: "/categories/casual", label: "Casual Wear" },
  { href: "/categories/corporate", label: "Corporate Looks" },
  { href: "/categories/accessories", label: "Accessories" },
];

const MEGA_COLLECTIONS = [
  { href: "/collections/summer-heat", label: "Summer Heat" },
  { href: "/collections/royal-court", label: "Royal Court" },
  { href: "/collections/afro-luxe", label: "Afro Luxe" },
  { href: "/collections/bridal-glory", label: "Bridal Glory" },
  { href: "/collections/street-style", label: "Street Style" },
  { href: "/collections/traditional", label: "Traditional" },
];

// ─── Mega-menu Panel ───────────────────────────────────────────────────────────

interface MegaMenuProps {
  items: readonly { href: string; label: string }[];
  title: string;
  browseHref: string;
  browseLinkLabel: string;
  featured?: { label: string; description: string; href: string; badge?: string }[];
  onClose: () => void;
}

function MegaMenu({ items, title, browseHref, browseLinkLabel, featured = [], onClose }: MegaMenuProps) {
  return (
    <div
      role="dialog"
      aria-label={`${title} mega menu`}
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1",
        "w-[640px] max-w-[95vw]",
        "rounded-2xl border border-border/40 bg-background shadow-2xl",
        "animate-[fadeSlideDown_0.18s_ease-out]",
        "overflow-hidden",
      )}
    >
      <div className="grid grid-cols-[1fr_220px]">
        {/* ── Main links grid ───────────────────────────────────── */}
        <div className="p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#FDA600]">
            {title}
          </p>
          <ul className="grid grid-cols-2 gap-1">
            {items.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-[#01454A]/6 hover:text-[#01454A] transition-colors duration-150"
                >
                  <span className="h-1 w-1 rounded-full bg-[#FDA600]/50 group-hover:bg-[#FDA600] transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-border/30">
            <Link
              href={browseHref}
              onClick={onClose}
              className="text-xs font-bold text-[#01454A] hover:text-[#FDA600] transition-colors"
            >
              {browseLinkLabel} →
            </Link>
          </div>
        </div>

        {/* ── Right featured panel ────────────────────────────── */}
        <div className="bg-[#01454A]/5 border-l border-border/30 p-5 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#01454A]">
            Quick Access
          </p>
          {featured.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              onClick={onClose}
              className="group rounded-xl border border-border/30 bg-background p-3 hover:border-[#FDA600]/40 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-foreground group-hover:text-[#01454A]">
                  {f.label}
                </span>
                {f.badge && (
                  <span className="rounded-full bg-[#FDA600] px-1.5 py-0.5 text-[9px] font-bold text-black">
                    {f.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">{f.description}</p>
            </Link>
          ))}

          {/* Measurement CTA */}
          <Link
            href="/get-measured"
            onClick={onClose}
            className="mt-auto flex items-center gap-2 rounded-xl bg-[#FDA600] px-3 py-2.5 text-xs font-bold text-black hover:bg-[#F0A000] transition-colors duration-150"
          >
            <Ruler size={11} />
            Get Measured Free
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Mega-menu trigger nav item ────────────────────────────────────────────────

interface MegaNavItemProps {
  label: string;
  isActive: boolean;
  items: readonly { href: string; label: string }[];
  title: string;
  browseHref: string;
  browseLinkLabel: string;
  featured?: { label: string; description: string; href: string; badge?: string }[];
}

function MegaNavItem({ label, isActive, items, title, browseHref, browseLinkLabel, featured }: MegaNavItemProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 font-raleway text-[15px] xl:text-base transition-colors",
          isActive
            ? "font-bold text-[hsl(var(--accent))]"
            : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
        )}
      >
        {label}
        <ChevronDown
          size={13}
          className={cn("transition-transform duration-200 mt-px", open && "rotate-180")}
        />
      </button>

      {open && (
        <MegaMenu
          items={items}
          title={title}
          browseHref={browseHref}
          browseLinkLabel={browseLinkLabel}
          featured={featured}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * NewNavbar — Fashionistar desktop navigation with mega-menu.
 *
 * Renders a sticky header with:
 * - Brand logo + wordmark
 * - Horizontal nav links (active state via CSS token `--accent`)
 * - Mega-menu panels for "Categories" and "Collections" on hover/focus
 * - Search bar (navigates to /products?q=<query> on Enter)
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Fashionistar logo"
          width={50}
          height={49}
          className="w-10 md:w-[50px] h-auto"
          style={{ height: "auto" }}
          loading="eager"
        />
        <span className="font-bon_foyage text-2xl md:text-3xl text-foreground">
          Fashionistar
        </span>
      </Link>

      {/* ── Navigation links ────────────────────────────────────────── */}
      <nav className="hidden lg:flex" aria-label="Main navigation">
        <ul className="flex items-center gap-4 xl:gap-6">
          {/* Home */}
          <li>
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={cn(
                "font-raleway text-[15px] xl:text-base transition-colors",
                pathname === "/"
                  ? "font-bold text-[hsl(var(--accent))]"
                  : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
              )}
            >
              Home
            </Link>
          </li>

          {/* Categories — mega menu */}
          <li>
            <MegaNavItem
              label="Categories"
              isActive={pathname.startsWith("/categories")}
              items={MEGA_CATEGORIES}
              title="Shop by Category"
              browseHref="/categories"
              browseLinkLabel="Browse all categories"
              featured={[
                {
                  label: "New Arrivals",
                  description: "Fresh drops this week — be the first to shop.",
                  href: "/products?sort=newest",
                  badge: "New",
                },
                {
                  label: "On Sale",
                  description: "Up to 60% off selected styles.",
                  href: "/products?sort=discount",
                  badge: "Sale",
                },
              ]}
            />
          </li>

          {/* Vendors */}
          <li>
            <Link
              href="/vendors"
              aria-current={pathname.startsWith("/vendors") ? "page" : undefined}
              className={cn(
                "font-raleway text-[15px] xl:text-base transition-colors",
                pathname.startsWith("/vendors")
                  ? "font-bold text-[hsl(var(--accent))]"
                  : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
              )}
            >
              Vendors
            </Link>
          </li>

          {/* Shop */}
          <li>
            <Link
              href="/products"
              aria-current={pathname.startsWith("/products") ? "page" : undefined}
              className={cn(
                "font-raleway text-[15px] xl:text-base transition-colors",
                pathname.startsWith("/products")
                  ? "font-bold text-[hsl(var(--accent))]"
                  : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
              )}
            >
              Shop
            </Link>
          </li>

          {/* Collections — mega menu */}
          <li>
            <MegaNavItem
              label="Collections"
              isActive={pathname.startsWith("/collections")}
              items={MEGA_COLLECTIONS}
              title="Curated Collections"
              browseHref="/collections"
              browseLinkLabel="See all collections"
              featured={[
                {
                  label: "Featured Drop",
                  description: "This season's most coveted looks curated by our stylists.",
                  href: "/collections?featured=1",
                  badge: "Hot",
                },
                {
                  label: "Custom Tailoring",
                  description: "Bespoke outfits made to your exact measurements.",
                  href: "/get-measured",
                },
              ]}
            />
          </li>

          {/* Blog */}
          <li>
            <Link
              href="/blog"
              aria-current={pathname.startsWith("/blog") ? "page" : undefined}
              className={cn(
                "font-raleway text-[15px] xl:text-base transition-colors",
                pathname.startsWith("/blog")
                  ? "font-bold text-[hsl(var(--accent))]"
                  : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
              )}
            >
              Blog
            </Link>
          </li>

          {/* Contact */}
          <li>
            <Link
              href="/contact-us"
              aria-current={pathname.startsWith("/contact-us") ? "page" : undefined}
              className={cn(
                "font-raleway text-[15px] xl:text-base transition-colors",
                pathname.startsWith("/contact-us")
                  ? "font-bold text-[hsl(var(--accent))]"
                  : "font-medium text-foreground/80 hover:text-[hsl(var(--accent))]",
              )}
            >
              Contact
            </Link>
          </li>
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
