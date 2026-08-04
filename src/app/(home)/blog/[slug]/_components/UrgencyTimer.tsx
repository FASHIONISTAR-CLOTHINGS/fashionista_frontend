"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function getRemainingSeconds(): number {
  const STORAGE_KEY = "fashionistar_urgency_deadline";
  const now = Date.now();
  let deadline = 0;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      deadline = parseInt(stored, 10);
    }
  } catch {
    // localStorage not available
  }

  if (!deadline || deadline <= now) {
    deadline = now + 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem(STORAGE_KEY, String(deadline));
    } catch {
      // ignore
    }
  }

  return Math.max(0, Math.floor((deadline - now) / 1000));
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function UrgencyTimer() {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-[hsl(var(--accent))/0.3] bg-[hsl(var(--accent))/0.08] px-5 py-3"
      data-testid="urgency-timer"
    >
      <svg className="h-5 w-5 flex-shrink-0 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="text-sm font-semibold text-foreground">Free Measurement Session Ends In:</span>
        <span className="font-bon_foyage text-lg font-bold tabular-nums text-[hsl(var(--accent))]" data-testid="urgency-timer-display">
          {formatTime(remaining)}
        </span>
      </div>
      <Link
        href="/get-measured"
        className="ml-auto inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] px-4 py-1.5 text-xs font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
        data-testid="urgency-timer-cta"
      >
        Claim Now
      </Link>
    </div>
  );
}
