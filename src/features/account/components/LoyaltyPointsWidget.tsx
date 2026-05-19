/**
 * @file LoyaltyPointsWidget.tsx
 * @description Loyalty points progress widget shown on order success + client dashboard.
 *
 * Revenue strategy: Visible reward progress keeps users coming back.
 * 68% of users are more likely to re-purchase when they see a points balance.
 *
 * Data source: GET /api/v1/wallet/balance/ — reads `loyalty_points` field.
 * Tier thresholds defined below (easily moved to a config or backend constant).
 *
 * Wave 10b: Migrated from raw fetch() → apiAsync (Ky) for standardized error
 * handling, automatic auth headers, and retry logic.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiAsync } from "@/core/api/client.async";

// ─── Tier config ──────────────────────────────────────────────────────────────

interface LoyaltyTier {
  name: string;
  min: number;
  rewardLabel: string;
  color: string;
}

const TIERS: LoyaltyTier[] = [
  { name: "Bronze", min: 0,    rewardLabel: "₦200 off",  color: "from-amber-700 to-amber-500" },
  { name: "Silver", min: 500,  rewardLabel: "₦500 off",  color: "from-slate-400 to-slate-300"  },
  { name: "Gold",   min: 1500, rewardLabel: "₦1,500 off", color: "from-yellow-500 to-amber-400" },
  { name: "Elite",  min: 5000, rewardLabel: "₦5,000 off", color: "from-violet-600 to-purple-500" },
];

/** Returns the current tier and the next one. */
function resolveTier(points: number): {
  current: LoyaltyTier;
  next: LoyaltyTier | null;
  progressPct: number;
} {
  let current = TIERS[0];
  let next: LoyaltyTier | null = TIERS[1];

  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] ?? null;
    }
  }

  const progressPct = next
    ? Math.min(
        100,
        Math.round(
          ((points - current.min) / (next.min - current.min)) * 100,
        ),
      )
    : 100;

  return { current, next, progressPct };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

interface WalletSummary {
  balance: string;
  available_balance?: string;
  loyalty_points?: number;  // optional — derived if not present
}

async function fetchWalletSummary(): Promise<WalletSummary> {
  return apiAsync.get("wallet/balance/").json<WalletSummary>();
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LoyaltyPointsWidgetProps {
  /** Compact mode: used in sidebar; default (false) = full card on dashboard. */
  compact?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoyaltyPointsWidget — animated gold-gradient points progress card.
 *
 * Args:
 *   compact:   When true, renders a slim summary row (for sidebar use).
 *   className: Additional class overrides.
 */
export function LoyaltyPointsWidget({
  compact = false,
  className,
}: LoyaltyPointsWidgetProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["wallet", "summary", "loyalty"],
    queryFn: fetchWalletSummary,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl bg-muted animate-pulse",
          compact ? "h-14 w-full" : "h-36 w-full",
          className,
        )}
        aria-busy="true"
        aria-label="Loading loyalty points"
      />
    );
  }

  if (isError || !data) return null;

  // Derive loyalty points from balance if not explicitly returned:
  // 10 points per ₦100 in wallet balance
  const points = data.loyalty_points ?? Math.floor(parseFloat(data.available_balance ?? data.balance ?? "0") / 100 * 10);
  const { current, next, progressPct } = resolveTier(points);

  if (compact) {
    return (
      <Link
        href="/client/dashboard/wallet"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5",
          "bg-[hsl(var(--accent))]/10 hover:bg-[hsl(var(--accent))]/20 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
          className,
        )}
        aria-label={`${points} loyalty points — ${current.name} tier`}
      >
        <Star className="h-4 w-4 text-[hsl(var(--accent))] flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {points.toLocaleString()} pts · {current.name}
          </p>
          {next && (
            <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", current.color)}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 space-y-4",
        className,
      )}
      aria-label="Loyalty points card"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
              current.color,
            )}
          >
            <Trophy className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Loyalty Points</p>
            <p className="text-xs text-muted-foreground">{current.name} Member</p>
          </div>
        </div>
        <span className="text-2xl font-black text-[hsl(var(--accent))]">
          {points.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      {next ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{current.name} ({current.min.toLocaleString()} pts)</span>
            <span>{next.name} ({next.min.toLocaleString()} pts)</span>
          </div>
          <div
            className="h-2.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPct}% progress to ${next.name}`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={cn(
                "h-full rounded-full bg-gradient-to-r",
                current.color,
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-semibold text-foreground">
              {(next.min - points).toLocaleString()} pts
            </span>{" "}
            away from{" "}
            <span className="font-semibold text-[hsl(var(--accent))]">
              {next.rewardLabel}
            </span>{" "}
            discount
          </p>
        </div>
      ) : (
        <p className="text-center text-sm font-semibold text-[hsl(var(--accent))]">
          🏆 You&apos;ve reached Elite status — enjoy {current.rewardLabel} on every order!
        </p>
      )}

      {/* CTA */}
      <Link
        href="/client/dashboard/wallet"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl",
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
          "py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
        )}
      >
        <Star className="h-4 w-4" aria-hidden="true" />
        View Rewards History
      </Link>
    </motion.div>
  );
}
