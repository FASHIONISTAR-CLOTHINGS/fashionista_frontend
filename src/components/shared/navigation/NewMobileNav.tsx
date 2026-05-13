/**
 * @file NewMobileNav.tsx
 * @description Canonical Fashionistar mobile navigation bar + slide-out drawer.
 *
 * Architectural notes:
 * - Mobile only (md:hidden). Pair with <NewNavbar /> for desktop.
 * - All brand colours reference CSS design tokens — never hardcoded hex.
 * - Drawer implements WCAG 2.1 AA focus-trap: Tab cycles within open panel,
 *   focus returns to trigger on close, Escape key dismisses.
 * - Body scroll is locked while the drawer is open.
 * - Route changes automatically close both the drawer and account panel.
 *
 * Usage:
 *   <NewMobileNav />   // place in (home)/layout.tsx
 */
/* eslint-disable react/no-unknown-property */
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  AlignJustify,
  UserRound,
  ShoppingCart,
  X,
  Headphones,
  Info,
  MapPin,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AccountOptions from "@/components/shared/overlays/AccountOptions";
import CartItems from "@/components/shared/overlays/CartItems";

// ─── Nav link data ─────────────────────────────────────────────────────────────

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 17.99V14.99"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Categories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M10.5 19.9V4.1C10.5 2.6 9.86 2 8.27 2H4.23C2.64 2 2 2.6 2 4.1V19.9C2 21.4 2.64 22 4.23 22H8.27C9.86 22 10.5 21.4 10.5 19.9Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 12.9V4.1C22 2.6 21.36 2 19.77 2H15.73C14.14 2 13.5 2.6 13.5 4.1V12.9C13.5 14.4 14.14 15 15.73 15H19.77C21.36 15 22 14.4 22 12.9Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/vendors",
    label: "Vendors",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3.01 11.22V15.71C3.01 20.2 4.81 22 9.3 22H14.69C19.18 22 20.98 20.2 20.98 15.71V11.22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12C13.83 12 15.18 10.51 15 8.68L14.34 2H9.67L9 8.68C8.82 10.51 10.17 12 12 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Shop",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8.5 14.25C8.5 16.17 10.08 17.75 12 17.75C13.92 17.75 15.5 16.17 15.5 14.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 7.85C2 6 2.99 5.85 4.22 5.85H19.78C21.01 5.85 22 6 22 7.85C22 10 21.01 9.85 19.78 9.85H4.22C2.99 9.85 2 10 2 7.85Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3.5 10L4.91 18.64C5.23 20.58 6 22 8.86 22H14.89C18 22 18.46 20.64 18.82 18.76L20.5 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/collections",
    label: "Collections",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.5 7.67V6.7C7.5 4.45 9.31 2.24 11.56 2.03C14.24 1.77 16.5 3.88 16.5 6.51V7.89"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  { href: "/about-us", label: "About Us", icon: <Info size={22} aria-hidden="true" /> },
  { href: "/blog", label: "Blog", icon: <MessageSquare size={22} aria-hidden="true" /> },
  { href: "/contact-us", label: "Contact Us", icon: <Headphones size={22} aria-hidden="true" /> },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", Icon: Facebook },
  { label: "Twitter / X", href: "#", Icon: Twitter },
  { label: "Instagram", href: "#", Icon: Instagram },
] as const;

// ─── Focus-trap utility ────────────────────────────────────────────────────────

/**
 * Traps keyboard focus within `containerRef` when `active` is true.
 * Selects all standard focusable elements and cycles Tab / Shift+Tab within them.
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const focusable = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((el) => !el.closest("[aria-hidden='true']"));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * NewMobileNav — mobile-only navigation bar with accessible slide-out drawer.
 *
 * Renders a sticky top bar with brand + icon cluster (mobile widths only).
 * Hamburger opens a full-height drawer with nav links, quick links, social icons,
 * and auth CTAs. Includes keyboard focus-trap and Escape dismiss.
 */
const NewMobileNav = () => {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeOptions = useCallback(() => setShowOptions(false), []);

  // TODO: Replace 0 with useCartStore(state => state.items.length) when wired
  const cartCount = 0;

  // Close everything on route change
  useEffect(() => {
    setShowNav(false);
    setShowOptions(false);
  }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = showNav ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showNav]);

  // Escape key dismiss for drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showNav) {
        setShowNav(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showNav]);

  // Focus-trap for the open drawer
  useFocusTrap(drawerRef, showNav);

  const openDrawer = () => setShowNav(true);
  const closeDrawer = () => {
    setShowNav(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      className="flex justify-between items-center bg-background md:hidden p-5 sticky top-0 z-40 border-b border-border shadow-[0_4px_25px_0_hsl(var(--foreground)/0.06)]"
      suppressHydrationWarning
    >
      {/* ── Brand ────────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 w-1/2">
        <Image
          src="/logo.svg"
          alt="Fashionistar"
          width={78}
          height={76}
          className="w-9 h-auto"
          style={{ height: "auto" }}
        />
        <span className="font-bon_foyage text-2xl text-foreground">Fashionistar</span>
      </Link>

      {/* ── Top-bar icon cluster ──────────────────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Hamburger */}
        <button
          ref={triggerRef}
          type="button"
          id="mobile-menu-btn"
          onClick={openDrawer}
          aria-label="Open navigation menu"
          aria-expanded={showNav}
          aria-controls="mobile-nav-drawer"
          className="p-1 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          <AlignJustify size={24} className="text-foreground" />
        </button>

        {/* Search */}
        <button
          type="button"
          aria-label="Search"
          className="p-1 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          <Search size={22} className="text-foreground" />
        </button>

        {/* Account */}
        <div className="relative">
          <button
            type="button"
            id="mobile-account-btn"
            aria-expanded={showOptions}
            aria-controls="account-options-panel"
            aria-label="Open account menu"
            onClick={() => setShowOptions((prev) => !prev)}
            className="p-1 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            <UserRound size={22} className="text-foreground" />
          </button>
          <AccountOptions showOptions={showOptions} onClose={closeOptions} />
        </div>

        {/* Cart */}
        <div className="relative flex">
          <button
            type="button"
            id="mobile-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart — ${cartCount} item${(cartCount as number) !== 1 ? "s" : ""}`}
            className="p-1 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            <ShoppingCart size={22} className="text-foreground" />
          </button>
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] absolute -top-2 -right-2 font-bold flex justify-center items-center w-5 h-5 rounded-full text-[10px]"
            >
              {(cartCount as number) > 99 ? "99+" : cartCount}
            </span>
          )}
          <CartItems isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
      </div>

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      {showNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ── Slide-out Drawer ──────────────────────────────────────── */}
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 w-full max-w-sm h-screen bg-background z-50",
          "flex flex-col overflow-y-auto shadow-2xl border-r border-border",
          "transition-all ease-in-out duration-300",
          showNav ? "left-0" : "-left-full",
        )}
      >
        {/* Drawer header */}
        <div className="bg-[hsl(var(--sidebar-bg,_14_14_14))] py-5 px-6 flex items-center justify-between shrink-0 bg-foreground">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Fashionistar"
              width={40}
              height={40}
              className="w-9 h-auto"
              style={{ height: "auto" }}
            />
            <span className="font-bon_foyage text-2xl text-background">Fashionistar</span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={24} className="text-background" />
          </button>
        </div>

        <div className="px-4 py-5 flex flex-col gap-5 flex-1">
          {/* Nav links */}
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "w-full py-3 px-4 border-b border-border flex items-center gap-3",
                    "font-medium text-base font-raleway transition-colors",
                    isActive
                      ? "bg-[hsl(var(--accent))]/10 text-foreground font-semibold"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span
                    className={isActive ? "text-[hsl(var(--accent))]" : "text-muted-foreground"}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Quick links card */}
          <div className="bg-muted rounded-xl border border-border py-4 px-3 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Link
                href="/contact-us"
                className="font-raleway font-medium text-base text-foreground flex items-center gap-2 border-r border-border w-1/2 pr-3 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Headphones size={20} aria-hidden="true" /> Support
              </Link>
              <Link
                href="/about-us"
                className="flex items-center gap-2 font-raleway font-medium text-base text-foreground pl-3 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Info size={20} aria-hidden="true" /> About Us
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="font-raleway font-medium text-base text-foreground flex items-center gap-2 border-r border-border w-1/2 pr-3 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <MessageSquare size={20} aria-hidden="true" /> Blog
              </Link>
              <Link
                href="/contact-us"
                className="flex items-center gap-2 font-raleway font-medium text-base text-foreground pl-3 hover:text-[hsl(var(--accent))] transition-colors"
              >
                <MapPin size={20} aria-hidden="true" /> Location
              </Link>
            </div>
          </div>

          {/* Social links */}
          <div className="space-y-2">
            <p className="font-raleway font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Follow Us
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[hsl(var(--accent))] flex justify-center items-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  <Icon size={18} className="text-[hsl(var(--accent-foreground))]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Auth CTAs */}
          <div className="mt-auto pt-4 border-t border-border space-y-2">
            <Link
              href="/auth/sign-in"
              className={cn(
                "block w-full text-center py-3 px-4 rounded-xl",
                "bg-foreground text-background",
                "font-raleway font-semibold hover:opacity-90 transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(
                "block w-full text-center py-3 px-4 border-2 border-foreground rounded-xl",
                "text-foreground font-raleway font-semibold",
                "hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              )}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMobileNav;
