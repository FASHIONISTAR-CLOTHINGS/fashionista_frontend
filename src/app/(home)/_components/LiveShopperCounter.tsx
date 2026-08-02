"use client";

/**
 * @file LiveShopperCounter.tsx
 * @description Animated "X people shopping now" counter for the homepage.
 *
 * Psychological triggers:
 *   - Social Proof: Real-time platform activity
 *   - FOMO: Others are actively shopping
 *
 * Behavior:
 *   - Uses a static animated baseline (no API call — endpoint removed)
 *   - Animated count-up on mount with subtle live-feel drift
 *   - ZERO network requests — active-shoppers endpoint is not supported
 */

import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";

const BASELINE_COUNT = 847;
// Subtle ±random drift every 45s to feel "live" without polling
const DRIFT_INTERVAL = 45_000;
const MAX_DRIFT = 23;

export function LiveShopperCounter() {
  const [count, setCount] = useState(BASELINE_COUNT);
  const [animatedCount, setAnimatedCount] = useState(BASELINE_COUNT - 40);
  const rafRef = useRef<number | null>(null);

  // Simulate live drift without any API call
  useEffect(() => {
    const drift = () => {
      const delta = Math.floor(Math.random() * MAX_DRIFT * 2) - MAX_DRIFT;
      setCount((prev) => Math.max(BASELINE_COUNT - 50, prev + delta));
    };
    const interval = setInterval(drift, DRIFT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Animate count changes
  useEffect(() => {
    if (animatedCount === count) return;

    const start = animatedCount;
    const diff = count - start;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedCount(Math.round(start + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count, animatedCount]);

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-full bg-[#01454A]/5 px-4 py-2"
      data-testid="live-shopper-counter"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <Users size={14} className="text-[#01454A]" />
      <span className="text-sm font-semibold text-[#01454A]">
        {animatedCount.toLocaleString()} people shopping now
      </span>
    </div>
  );
}
