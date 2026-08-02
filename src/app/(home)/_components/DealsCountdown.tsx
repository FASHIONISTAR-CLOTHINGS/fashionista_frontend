"use client";

/**
 * @file DealsCountdown.tsx
 * @description Live countdown timer for the hot deals section.
 *
 * Features:
 *   - Accepts optional targetDate prop (ISO string or Date) from backend
 *     discount_countdown field. Falls back to midnight tonight.
 *   - No SSR hydration flash: uses the same calculateTimeLeft() for both
 *     server-safe initial render and hydrated client render.
 *   - Stops when countdown reaches zero.
 */

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DealsCountdownProps {
  /**
   * ISO timestamp for countdown target date from backend discount_countdown field.
   * Can also be passed as `endsAt` alias. Defaults to 7 days from now if omitted.
   */
  targetDate?: string | Date;
  /** Alias for targetDate — semantically clearer when passing backend `ends_at`. */
  endsAt?: string | Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getTargetDate(target?: string | Date): Date {
  if (target) {
    return target instanceof Date ? target : new Date(target);
  }
  // Default: 7 days from now (weekly deals cycle)
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

function calculateTimeLeft(target?: string | Date): TimeLeft {
  const now = new Date();
  const targetTime = getTargetDate(target);
  const diff = Math.max(0, targetTime.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TimeBox sub-component
// ─────────────────────────────────────────────────────────────────────────────

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[#01454A] text-white p-2 sm:p-3 rounded-lg text-center min-w-[55px] sm:min-w-[70px]">
      <span
        className="block text-xl sm:text-2xl font-bold tabular-nums leading-tight"
        aria-live="polite"
        aria-atomic="true"
        suppressHydrationWarning
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="text-xl font-bold text-foreground/40 select-none"
      aria-hidden="true"
    >
      :
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DealsCountdown({ targetDate, endsAt }: DealsCountdownProps) {
  const resolvedTarget = targetDate ?? endsAt;
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(resolvedTarget),
  );

  useEffect(() => {
    setMounted(true);
    // Sync immediately after hydration to avoid stale initial value
    setTimeLeft(calculateTimeLeft(resolvedTarget));

    const timer = setInterval(() => {
      const next = calculateTimeLeft(resolvedTarget);
      setTimeLeft(next);
      // Stop the timer when countdown is zero
      if (
        next.days === 0 &&
        next.hours === 0 &&
        next.minutes === 0 &&
        next.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [resolvedTarget]);

  // Use the calculated value for both SSR and hydrated states — eliminates
  // the 00:00:00 flash on first render.
  const display = mounted ? timeLeft : calculateTimeLeft(resolvedTarget);

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 bg-[#01454A]/10 dark:bg-[#01454A]/30 p-2 rounded-xl max-w-fit"
      role="timer"
      aria-label="Time remaining for deals"
    >
      {display.days > 0 && (
        <>
          <TimeBox value={display.days} label="Days" />
          <Separator />
        </>
      )}
      <TimeBox value={display.hours} label="Hours" />
      <Separator />
      <TimeBox value={display.minutes} label="Mins" />
      <Separator />
      <TimeBox value={display.seconds} label="Secs" />
    </div>
  );
}

// Default export for convenience
export default DealsCountdown;
