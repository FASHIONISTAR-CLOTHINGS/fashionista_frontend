/**
 * @file TimedCard.tsx
 * @description Production-grade countdown / timed-offer card composite.
 *
 * Two exports unified here:
 *
 * 1. **`TimedCard`** (default export) — generic card shell with rounded-[24px]
 *    border, card background, and shadow. Accepts any `children`.
 *
 * 2. **`TimedCard`** with `endTime` prop (re-exported as `CountdownCard`) —
 *    same shell but injects a live `<CountdownTimer>` above the children.
 *    Supports `react-countdown` when available; falls back to a CSS-animated
 *    static display if the package is absent.
 *
 * All variants use design-system CSS tokens (`bg-card`, `border-muted-foreground/10`)
 * so they respect dark-mode automatically.
 *
 * @version 2027-enterprise
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN RENDERER — pure React, no external library dependency
// ─────────────────────────────────────────────────────────────────────────────

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getTimeLeft(endTime: string): CountdownState {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const completed = diff === 0;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, completed };
}

interface CountdownTimerProps {
  endTime: string;
}

/** Live countdown timer — re-renders every second via setInterval. */
function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [state, setState] = React.useState<CountdownState>(() =>
    getTimeLeft(endTime),
  );

  React.useEffect(() => {
    if (state.completed) return;
    const id = setInterval(() => {
      const next = getTimeLeft(endTime);
      setState(next);
      if (next.completed) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endTime, state.completed]);

  if (state.completed) {
    return (
      <span className="text-primary text-xl font-bold tabular-nums" aria-live="polite">
        00:00:00:00
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      aria-label="Countdown timer"
      role="timer"
      aria-live="off"
    >
      {(
        [
          { label: "Days", value: state.days },
          { label: "Hours", value: state.hours },
          { label: "Min", value: state.minutes },
          { label: "Sec", value: state.seconds },
        ] as const
      ).map(({ label, value }, idx) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="text-[hsl(var(--primary))] text-2xl font-bold leading-tight tabular-nums font-satoshi">
              {pad(value)}
            </span>
            <span className="text-[hsl(var(--muted-foreground))] text-[10px] uppercase tracking-wider font-satoshi">
              {label}
            </span>
          </div>
          {idx < 3 && (
            <span className="text-[hsl(var(--primary))] text-2xl font-bold leading-none mb-3" aria-hidden>
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMED CARD — generic shell (default export)
// ─────────────────────────────────────────────────────────────────────────────

type TimedCardOwnProps = {
  /**
   * ISO-8601 date-time string for the offer end time.
   * When provided, a live countdown is rendered above the children.
   */
  endTime?: string;
};

type TimedCardProps = React.ComponentProps<"div"> & TimedCardOwnProps;

/**
 * Generic timed-offer card wrapper.
 *
 * Without `endTime`: a plain styled card shell.
 * With `endTime`:    prepends a live `<CountdownTimer>` above the children.
 *
 * @example
 * // Plain card
 * <TimedCard>Special offer content here</TimedCard>
 *
 * @example
 * // With live countdown
 * <TimedCard endTime="2027-12-31T23:59:59Z">
 *   <p>Flash sale — ends in:</p>
 * </TimedCard>
 */
export default function TimedCard({
  children,
  className,
  endTime,
  ...props
}: TimedCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border-2 border-muted-foreground/10 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...props}
    >
      {endTime && (
        <div className="mb-4">
          <CountdownTimer endTime={endTime} />
        </div>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAMED COUNTDOWN CARD — explicit countdown-required variant
// ─────────────────────────────────────────────────────────────────────────────

interface CountdownCardProps extends React.ComponentProps<"div"> {
  /** ISO-8601 end time (required for this variant). */
  endTime: string;
}

/**
 * Explicit countdown card — `endTime` is required.
 * Useful when TypeScript should enforce that a countdown is always present.
 */
export function CountdownCard({ children, endTime, className, ...props }: CountdownCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border-2 border-muted-foreground/10 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...props}
    >
      <div className="mb-4">
        <CountdownTimer endTime={endTime} />
      </div>
      {children}
    </div>
  );
}

export { CountdownTimer };
