"use client";
/**
 * @file PhoneLevelGuard.tsx
 * @description Full-screen overlay shown when the phone tilts away from 90°
 * during an active camera phase. Pauses the scan and asks the user to re-level.
 *
 * Used in: device_setup, positioning, front_aligning, front_countdown,
 * side_positioning, side_aligning, side_countdown.
 */

import { cn } from "@/lib/utils";
import type { OrientationStatus } from "../hooks/usePhoneOrientation";

interface PhoneLevelGuardProps {
  status: OrientationStatus;
  /** How long (ms) the phone has been bad — used to avoid flicker. */
  badForMs?: number;
  className?: string;
}

export function PhoneLevelGuard({ status, badForMs = 0, className }: PhoneLevelGuardProps) {
  if (status !== "bad") return null;

  // Avoid a one-frame flash; only show after 300ms of continuous bad state.
  if (badForMs < 300) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-[60] flex flex-col items-center justify-center",
        "bg-[var(--BV-cream)]/85 backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center px-6 max-w-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[var(--BV-red-alert)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--BV-red-alert)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-[var(--BV-ink)] font-bold text-lg mb-2">Phone not level</h3>
        <p className="text-[var(--BV-slate)] text-sm">
          Please prop your phone upright at 90° to continue the measurement.
        </p>
      </div>
    </div>
  );
}
