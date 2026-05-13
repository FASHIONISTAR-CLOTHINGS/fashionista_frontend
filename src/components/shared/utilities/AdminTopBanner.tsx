/**
 * @file AdminTopBanner.tsx
 * @description Admin dashboard top banner: welcome row + search + live notification bell.
 *
 * Notification Bell — Architecture:
 *   - TanStack Query polls /api/v1/ninja/notifications/unread-count/ every 30s.
 *   - Badge animates in/out with Framer Motion scale spring.
 *   - Clicking the bell opens an inline popover with the 5 most recent notifications.
 *   - "Mark all read" optimistic mutation clears the badge immediately.
 *   - WebSocket upgrade path: when a WS event arrives, invalidate the query for
 *     instant badge refresh without waiting for the next poll interval.
 *
 * Usage:
 *   <AdminTopBanner title="Admin Name" pathname={pathname} walletBalance="₦45,200" />
 */
"use client";

import { Bell, Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useId, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FashionistarImage } from "@/components/media";
import {
  fetchUnreadBadgeCount,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notification/api/notification.api";
import type { Notification } from "@/features/notification/types/notification.types";

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface AdminTopBannerProps {
  /** Display name shown under the welcome greeting. */
  title?: string;
  /** Current Next.js pathname — used to conditionally render the search bar. */
  pathname?: string;
  /** Live wallet balance string (e.g. "₦45,200"). Defaults to "—" while loading. */
  walletBalance?: string;
}

// ─── Notification Popover ───────────────────────────────────────────────────────

function NotificationPopover({
  onClose,
}: {
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const { data: recent = [] } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => fetchNotifications(1),
    staleTime: 30_000,
    select: (list) => list.slice(0, 6),
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.setQueryData(["notifications", "unread-count"], 0);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn(
        "absolute top-[calc(100%+8px)] right-0 z-50",
        "w-[340px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-satoshi font-semibold text-sm text-foreground">
          Notifications
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            aria-label="Mark all notifications read"
          >
            <Check size={12} />
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
        {recent.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            All caught up! 🎉
          </p>
        ) : (
          recent.map((n: Notification) => (
            <div
              key={n.id}
              className={cn(
                "px-4 py-3 flex gap-3 items-start hover:bg-muted/50 transition-colors",
                !n.is_read && "bg-[hsl(var(--accent)/0.06)]",
              )}
            >
              {/* Unread dot */}
              <span
                className={cn(
                  "mt-1.5 shrink-0 w-2 h-2 rounded-full",
                  n.is_read ? "bg-transparent" : "bg-[hsl(var(--accent))]",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-snug truncate">
                  {n.title}
                </p>
                <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">
                  {n.body}
                </p>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  {new Date(n.created_at).toLocaleString("en-NG", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => markOne.mutate(n.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-1"
                  aria-label="Mark as read"
                >
                  <Check size={13} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Live Notification Bell ─────────────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Poll unread count every 30 s — lightweight Ninja async endpoint (<50 ms) */
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadBadgeCount,
    staleTime: 25_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const badgeCount = Math.min(unreadCount, 99);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${badgeCount > 0 ? ` (${badgeCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative w-9 h-9 flex justify-center items-center rounded-xl",
          "bg-muted hover:bg-muted/80 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
          open && "bg-muted/80",
        )}
      >
        <Bell size={18} className="text-foreground" />

        {/* Animated unread badge */}
        <AnimatePresence>
          {badgeCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 400 }}
              className={cn(
                "absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5",
                "flex items-center justify-center rounded-full",
                "bg-[#EA1705] text-white text-[9px] font-bold leading-none select-none",
              )}
            >
              {badgeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && <NotificationPopover onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  );
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
        <FashionistarImage
          src="/woman3.png"
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
        {/* Live notification bell */}
        <NotificationBell />

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
