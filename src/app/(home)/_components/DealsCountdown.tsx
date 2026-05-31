"use client";
/**
 * @file DealsCountdown.tsx
 * @description Live countdown timer + deals section for Fashionistar homepage.
 * Replaces the static mock `data2` deals with a live countdown to midnight.
 */

import { useEffect, useState } from "react";

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
