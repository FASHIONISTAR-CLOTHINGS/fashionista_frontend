/**
 * @file AdminTopBanner.tsx
 * @description Admin dashboard top banner: welcome row + search + notification bell.
 *
 * Improvements over v1:
 * - All hex colors replaced with CSS design tokens
 * - Inline SVGs replaced with Lucide icons (no maintenance burden)
 * - Wallet balance is now a prop (dynamic) — remove hardcoded "$12"
 * - CRLF → LF line endings (Unix standard)
 * - Search input uses accessible label + id
 * - Added type="button" to all buttons
 * - Proper TypeScript interface (no implicit any)
 *
 * Usage:
 *   <AdminTopBanner title="Admin Name" pathname={pathname} walletBalance="₦45,200" />
 */
"use client";

import Image from "next/image";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useId } from "react";

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface AdminTopBannerProps {
  /** Display name shown under the welcome greeting. */
  title?: string;
  /** Current Next.js pathname — used to conditionally render the search bar. */
  pathname?: string;
  /** Live wallet balance string (e.g. "₦45,200"). Defaults to "—" while loading. */
  walletBalance?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * AdminTopBanner — fixed admin dashboard header bar.
 *
 * Renders on desktop (hidden on mobile via `hidden lg:flex`).
 * Consumes the right 75% width beside the fixed sidebar.
 *
 * Args:
 *   title:         Admin user's display name.
 *   pathname:      Current route — hides search bar on /admin-dashboard root.
 *   walletBalance: Dynamic balance string from wallet API.
 */
const AdminTopBanner = ({
  title = "",
  pathname = "",
  walletBalance,
}: AdminTopBannerProps) => {
  const searchId = useId();

  return (
    <div
      className={cn(
        "hidden lg:flex items-center justify-between",
        "h-[122px] px-10 bg-background border-b border-border",
        "fixed top-0 right-0 w-[75%] z-50",
      )}
    >
      {/* ── Welcome row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Image
          src="/woman3.svg"
          alt=""
          aria-hidden="true"
          height={50}
          width={50}
          className="rounded-full h-[45px] w-[45px] object-cover"
        />
        <div>
          <h2 className="font-satoshi font-medium text-2xl text-foreground">
            Welcome Back!
          </h2>
          {title && (
            <span className="text-xl text-muted-foreground">{title}</span>
          )}
        </div>
      </div>

      {/* ── Search bar (hidden on dashboard root) ───────────────── */}
      <div
        className={cn(
          "items-center md:w-[55%] lg:w-[574px] h-[60px]",
          "bg-muted rounded-xl px-4 gap-3",
          pathname === "/admin-dashboard" ? "hidden" : "flex",
        )}
        suppressHydrationWarning
      >
        <Search size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
        <label htmlFor={searchId} className="sr-only">
          Search admin dashboard
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Search…"
          className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
          suppressHydrationWarning
        />
      </div>

      {/* ── Right action cluster ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "w-9 h-9 flex justify-center items-center rounded-xl",
            "bg-muted hover:bg-muted/80 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
          )}
        >
          <Bell size={18} className="text-foreground" />
        </button>

        {/* Wallet balance / search icon on root */}
        {pathname === "/admin-dashboard" ? (
          <button
            type="button"
            aria-label="Search"
            className={cn(
              "w-9 h-9 flex justify-center items-center rounded-xl",
              "bg-muted hover:bg-muted/80 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
            )}
          >
            <Search size={18} className="text-foreground" />
          </button>
        ) : (
          <div className="flex flex-col items-end">
            <span className="font-medium text-[13px] leading-[18px] text-muted-foreground">
              Wallet balance
            </span>
            <span className="text-foreground text-2xl font-medium font-satoshi">
              {walletBalance ?? "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTopBanner;
