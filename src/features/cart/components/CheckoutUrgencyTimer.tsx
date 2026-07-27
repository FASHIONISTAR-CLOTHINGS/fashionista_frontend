"use client";

/**
 * @file CheckoutUrgencyTimer.tsx
 * @description Subtle urgency timer for checkout page.
 *
 * Psychological triggers:
 *   - Urgency: "Complete checkout in X:XX to lock in your price"
 *   - Loss Aversion: Items reserved for limited time
 *   - Commitment: Timer reinforces decision already made
 */

import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";

const RESERVATION_MINUTES = 15;

export function CheckoutUrgencyTimer() {
  const [secondsLeft, setSecondsLeft] = useState(RESERVATION_MINUTES * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLow = mins < 3;

  if (secondsLeft === 0) return null;

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 ${
        isLow
          ? "border-red-200 bg-red-50 animate-pulse"
          : "border-[#01454A]/15 bg-[#01454A]/5"
      }`}
      data-testid="checkout-urgency-timer"
      role="timer"
    >
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        isLow ? "text-red-600" : "text-[#01454A]"
      }`}>
        <Lock size={12} />
        Items reserved for
      </span>
      <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${
        isLow ? "text-red-600" : "text-[#01454A]"
      }`}>
        <Clock size={13} />
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}
