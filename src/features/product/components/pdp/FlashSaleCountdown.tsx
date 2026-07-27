"use client";

/**
 * @file FlashSaleCountdown.tsx
 * @description Sticky flash sale countdown banner for PDP.
 *
 * Psychological triggers:
 *   - Urgency: Live countdown timer
 *   - Scarcity: "Sale ends in HH:MM:SS"
 *   - Loss Aversion: "Save X% today — don't miss out"
 *
 * Shows a sticky banner above the add-to-cart button when
 * the product has an active discount_countdown date.
 */

import { useEffect, useState } from "react";
import { Zap, Clock } from "lucide-react";

interface FlashSaleCountdownProps {
  targetDate?: string | Date | null;
  discountPercentage?: number;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target?: string | Date | null): TimeLeft | null {
  if (!target) return null;
  const targetTime = target instanceof Date ? target : new Date(target);
  if (isNaN(targetTime.getTime())) return null;

  const diff = Math.max(0, targetTime.getTime() - Date.now());
  if (diff === 0) return null;

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function FlashSaleCountdown({ targetDate, discountPercentage }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    const update = () => {
      const next = calculateTimeLeft(targetDate);
      setTimeLeft(next);
      if (!next) return;
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const isEndingSoon = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${
        isEndingSoon
          ? "border-red-300 bg-red-50 animate-pulse"
          : "border-[#FDA600]/30 bg-gradient-to-r from-[#FDA600]/10 to-[#FDA600]/5"
      }`}
      data-testid="pdp-flash-sale-countdown"
      role="timer"
      aria-label="Flash sale countdown"
    >
      <div className="flex items-center gap-2">
        <Zap
          size={16}
          className={isEndingSoon ? "text-red-500" : "text-[#FDA600]"}
        />
        <span className={`text-xs font-bold ${isEndingSoon ? "text-red-600" : "text-[#B87800]"}`}>
          {discountPercentage ? `Save ${discountPercentage}% — ` : ""}Sale ends soon!
        </span>
      </div>
      <div className="flex items-center gap-1 font-bold tabular-nums">
        <Clock size={12} className={isEndingSoon ? "text-red-500" : "text-[#FDA600]"} />
        <span className={`text-sm ${isEndingSoon ? "text-red-600" : "text-[#01454A]"}`}>
          {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
