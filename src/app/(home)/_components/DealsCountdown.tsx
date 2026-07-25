"use client";
/**
 * @file DealsCountdown.tsx
 * @description Live countdown timer + deals section for Fashionistar homepage.
 * Replaces the static mock `data2` deals with a live countdown to midnight.
 */

import { useEffect, useState } from "react";
"use client";
/**
 * @file DealsCountdown.tsx
 * @description Live countdown timer for hot deals section with target date support & no SSR flash.
 */

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DealsCountdownProps {
  /** Optional ISO timestamp for countdown target date (e.g. backend discount_countdown). Defaults to midnight tonight. */
  targetDate?: string | Date;
}

function calculateTimeLeft(target?: string | Date): TimeLeft {
  const now = new Date();
  let targetTime: Date;

  if (target) {
    targetTime = target instanceof Date ? target : new Date(target);
  } else {
    targetTime = new Date();
    targetTime.setHours(24, 0, 0, 0);
  }

  const diff = Math.max(0, targetTime.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[#01454A] text-white p-2 sm:p-3 rounded-lg text-center min-w-[55px] sm:min-w-[70px]">
      <span className="block text-xl sm:text-2xl font-bold tabular-nums leading-tight">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">
        {label}
      </span>
    </div>
  );
}

export function DealsCountdown({ targetDate }: DealsCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    const initial = calculateTimeLeft(targetDate);
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#01454A]/10 dark:bg-[#01454A]/30 p-2 rounded-xl max-w-fit">
        {initial.days > 0 && (
          <>
            <TimeBox value={initial.days} label="Days" />
            <span className="text-xl font-bold text-foreground/40 select-none">:</span>
          </>
        )}
        <TimeBox value={initial.hours} label="Hours" />
        <span className="text-xl font-bold text-foreground/40 select-none">:</span>
        <TimeBox value={initial.minutes} label="Mins" />
        <span className="text-xl font-bold text-foreground/40 select-none">:</span>
        <TimeBox value={initial.seconds} label="Secs" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-[#01454A]/10 dark:bg-[#01454A]/30 p-2 rounded-xl max-w-fit">
      {timeLeft.days > 0 && (
        <>
          <TimeBox value={timeLeft.days} label="Days" />
          <span className="text-xl font-bold text-foreground/40 select-none">:</span>
        </>
      )}
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="text-xl font-bold text-foreground/40 select-none">:</span>
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <span className="text-xl font-bold text-foreground/40 select-none">:</span>
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeUntilMidnight(): TimeLeft {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-primary text-white p-3 md:p-4 rounded-lg text-center min-w-[60px] md:min-w-[80px]">
      <span className="block text-[28px] md:text-[32px] leading-tight font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs md:text-sm font-medium font-raleway opacity-80 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function DealsCountdown() {
  // Start from a stable SSR-safe value, then hydrate to the live countdown.
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTimeLeft(getTimeUntilMidnight());
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-[#01454A] rounded-[8px] max-w-[429px] h-[111px] w-full text-white px-4">
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="text-2xl font-bold text-white/60 select-none">:</span>
      <TimeBox value={timeLeft.minutes} label="Minutes" />
      <span className="text-2xl font-bold text-white/60 select-none">:</span>
      <TimeBox value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
