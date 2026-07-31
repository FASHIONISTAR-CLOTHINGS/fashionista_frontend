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
 *   - Polls GET /api/v1/ninja/catalog/active-shoppers/ every 30s
 *   - Animated count-up when number changes
 *   - Falls back to a static baseline if API unavailable
 */

import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

const POLL_INTERVAL = 30_000;
const BASELINE_COUNT = 847;

export function LiveShopperCounter() {
  const [count, setCount] = useState(BASELINE_COUNT);
  const [animatedCount, setAnimatedCount] = useState(BASELINE_COUNT);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCount = async () => {
      try {
        const res = await apiAsync
          .get("catalog/active-shoppers/")
          .json<{ count: number }>();
        if (active && typeof res.count === "number") {
          setCount(res.count);
        }
      } catch {
        // Silent fail — use baseline
      }
    };

    void fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
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
