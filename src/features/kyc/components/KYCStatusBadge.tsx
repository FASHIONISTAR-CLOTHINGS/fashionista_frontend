"use client";

/**
 * @file KYCStatusBadge.tsx
 * @description Compact inline KYC status badge for headers, profile cards, and tables.
 *
 * Variants:
 *   "approved"    → Emerald shield chip
 *   "submitted"   → Amber clock chip
 *   "under_review"→ Amber clock chip
 *   "pending"     → Slate clock chip (not yet submitted)
 *   "rejected"    → Rose X chip
 *   default       → Slate "Unverified" chip
 *
 * Usage:
 *   <KYCStatusBadge />                  — auto-fetches status via hook
 *   <KYCStatusBadge status="approved" />— explicit static status (no fetch)
 *   <KYCStatusBadge size="sm" />        — compact variant
 */

import React from "react";
import { ShieldCheck, ShieldAlert, Clock, Shield, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNinjaKycStatus } from "../hooks/use-kyc";

// ─── Types ────────────────────────────────────────────────────────────────────

type KycStatus =
  | "approved"
  | "submitted"
  | "under_review"
  | "pending"
  | "rejected"
  | "resubmit_required";

type BadgeSize = "xs" | "sm" | "md";

interface KYCStatusBadgeProps {
  /** Explicit status override — skips TanStack Query fetch */
  status?: KycStatus;
  size?: BadgeSize;
  className?: string;
  /** Show label text. Default true. */
  showLabel?: boolean;
}

// ─── Config Map ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  KycStatus,
  {
    label: string;
    icon: React.ElementType;
    classes: string;
    iconClasses: string;
  }
> = {
  approved: {
    label: "Verified",
    icon: ShieldCheck,
    classes:
      "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 dark:bg-emerald-500/10",
    iconClasses: "text-emerald-400",
  },
  submitted: {
    label: "In Review",
    icon: Clock,
    classes:
      "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 dark:bg-amber-500/10",
    iconClasses: "text-amber-400",
  },
  under_review: {
    label: "In Review",
    icon: Clock,
    classes:
      "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 dark:bg-amber-500/10",
    iconClasses: "text-amber-400",
  },
  pending: {
    label: "Not Started",
    icon: Shield,
    classes:
      "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30 dark:bg-slate-500/10",
    iconClasses: "text-slate-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes:
      "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 dark:bg-rose-500/10",
    iconClasses: "text-rose-400",
  },
  resubmit_required: {
    label: "Resubmit",
    icon: ShieldAlert,
    classes:
      "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30 dark:bg-orange-500/10",
    iconClasses: "text-orange-400",
  },
};

const SIZE_MAP: Record<BadgeSize, { badge: string; icon: string; text: string }> = {
  xs: { badge: "px-1.5 py-0.5 text-[10px] gap-1", icon: "h-3 w-3", text: "" },
  sm: { badge: "px-2 py-0.5 text-xs gap-1", icon: "h-3.5 w-3.5", text: "" },
  md: { badge: "px-2.5 py-1 text-sm gap-1.5", icon: "h-4 w-4", text: "" },
};

const DEFAULT_STATUS: KycStatus = "pending";

// ─── Component ────────────────────────────────────────────────────────────────

export function KYCStatusBadge({
  status: explicitStatus,
  size = "sm",
  className,
  showLabel = true,
}: KYCStatusBadgeProps) {
  // If status is supplied directly, skip the query
  const { data, isLoading } = useNinjaKycStatus();

  const derivedStatus: KycStatus = explicitStatus
    ? explicitStatus
    : isLoading
      ? "pending"
      : ((data as { status: KycStatus } | undefined)?.status ?? DEFAULT_STATUS);

  const config = STATUS_CONFIG[derivedStatus] ?? STATUS_CONFIG.pending;
  const sizes = SIZE_MAP[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizes.badge,
        config.classes,
        className,
      )}
      aria-label={`KYC status: ${config.label}`}
    >
      <Icon className={cn(sizes.icon, config.iconClasses)} aria-hidden />
      {showLabel && config.label}
    </span>
  );
}

export default KYCStatusBadge;
