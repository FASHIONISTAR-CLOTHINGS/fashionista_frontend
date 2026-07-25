/**
 * @file MobileBottomTabBar.tsx
 * @description Fashionistar mobile bottom tab bar — MC10 (R16).
 *
 * App-like bottom navigation for mobile (md:hidden).
 * 5 tabs: Home · Shop · Measure · Cart · Account
 *
 * - Measure tab is gold-highlighted — always draws the eye to the funnel CTA
 * - Cart shows live badge count from Zustand store (same as navbar)
 * - Active tab uses forest green with gold dot indicator
 * - Safe-area-inset-bottom respected for iPhone notch/home indicator
 * - Pairs with <NewMobileNav> (hamburger drawer) for the full mobile nav experience
 *
 * Placement: (home)/layout.tsx — renders below all page content on mobile only.
 */
"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Store, Ruler, ShoppingCart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartBadge } from "@/features/cart/hooks/use-cart-badge";

// ─── Tab definitions ──────────────────────────────────────────────────────────

interface TabDefinition {
  href: "/" | "/products" | "/get-measured" | "/cart" | "/account";
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  exact?: boolean;
  highlight?: boolean;
  showBadge?: boolean;
}

const TABS: TabDefinition[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    exact: true,
  },
  {
    href: "/products",
    label: "Shop",
    icon: Store,
    exact: false,
  },
  {
    href: "/get-measured",
    label: "Measure",
    icon: Ruler,
    exact: false,
    highlight: true, // Gold CTA tab — always draws the eye to the measurement funnel
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingCart,
    exact: false,
    showBadge: true,
  },
  {
    href: "/account",
    label: "Account",
    icon: UserRound,
    exact: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileBottomTabBar() {
  const pathname = usePathname();
  const cartCount = useCartBadge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={cn(
        // Mobile only — hidden on md+
        "md:hidden",
        // Fixed bottom, full width
        "fixed bottom-0 left-0 right-0 z-50",
        // Background + border
        "bg-background/95 backdrop-blur-md border-t border-border/50",
        // Safe area for iPhone home indicator
        "pb-[env(safe-area-inset-bottom)]",
        // Shadow
        "shadow-[0_-4px_20px_0_hsl(var(--foreground)/0.08)]",
      )}
    >
      <ul className="flex items-stretch justify-around" role="list">
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href) && tab.href !== "/";
          const isHome = tab.href === "/" && pathname === "/";
          const active = isActive || isHome;

          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1" role="listitem">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={tab.label}
                data-testid={`mobile-tab-${tab.label.toLowerCase()}`}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "pt-2 pb-1.5 px-1 min-h-[52px] w-full",
                  "transition-colors duration-150",
                  // Highlight tab (Measure) — gold
                  tab.highlight && !active && "text-[#FDA600]",
                  // Active state
                  active && !tab.highlight && "text-[#01454A]",
                  // Inactive state
                  !active && !tab.highlight && "text-muted-foreground",
                  // Active highlight tab
                  active && tab.highlight && "text-[#B87800]",
                )}
              >
                {/* Active indicator dot */}
                {active && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2",
                      "h-0.5 w-6 rounded-full",
                      tab.highlight ? "bg-[#FDA600]" : "bg-[#01454A]",
                    )}
                  />
                )}

                {/* Icon wrapper — Measure tab gets gold circle */}
                <span
                  className={cn(
                    "relative flex items-center justify-center",
                    tab.highlight && "rounded-full bg-[#FDA600]/12 p-1.5 -mt-0.5",
                  )}
                >
                  <Icon
                    size={tab.highlight ? 20 : 21}
                    strokeWidth={active ? 2.2 : 1.8}
                    aria-hidden="true"
                  />

                  {/* Cart badge */}
                  {tab.showBadge && mounted && cartCount > 0 && (
                    <span
                      aria-label={`${cartCount} items in cart`}
                      className={cn(
                        "absolute -top-1.5 -right-1.5",
                        "flex items-center justify-center",
                        "h-4 w-4 rounded-full",
                        "bg-[#FDA600] text-black text-[9px] font-bold",
                        "transition-transform duration-200",
                        "scale-100",
                      )}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] font-semibold leading-none tracking-wide",
                    tab.highlight && "font-bold",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileBottomTabBar;
