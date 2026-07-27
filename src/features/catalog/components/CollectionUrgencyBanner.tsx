"use client";

/**
 * @file CollectionUrgencyBanner.tsx
 * @description Urgency and exclusive access banner for collection pages.
 *
 * Psychological triggers:
 *   - Scarcity: "Limited time only" / "Ending soon"
 *   - Exclusivity: "Exclusive access" / "Members only"
 *   - Urgency: Countdown to collection end date
 *   - Social Proof: "X people viewing this collection"
 */

import { useEffect, useState } from "react";
import { Clock, Users, Lock, Flame } from "lucide-react";

interface CollectionUrgencyBannerProps {
  endDate?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  productCount?: number | null;
}

export function CollectionUrgencyBanner({
  endDate,
  isActive = true,
  isFeatured = false,
  productCount = null,
}: CollectionUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [viewingCount, setViewingCount] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return 20 + Math.floor(Math.random() * 80);
  });

  useEffect(() => {
    if (!endDate) return;

    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft(`${mins}m`);
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [endDate]);

  useEffect(() => {
    if (!isActive || viewingCount === null) return;
    const base = viewingCount;
    const interval = setInterval(() => {
      setViewingCount((prev) => {
        if (!prev) return base;
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(5, prev + delta);
      });
    }, 15_000);
    return () => clearInterval(interval);
  }, [isActive, viewingCount]);

  const isEndingSoon = timeLeft && timeLeft !== "Ended" && !timeLeft.includes("d");
  const showBanner = isActive && (timeLeft || viewingCount || isFeatured);

  if (!showBanner) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
        isEndingSoon
          ? "border-red-200 bg-red-50"
          : "border-[#01454A]/15 bg-[#01454A]/5"
      }`}
      data-testid="collection-urgency-banner"
    >
      {/* Urgency: Countdown */}
      {timeLeft && timeLeft !== "Ended" && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
          isEndingSoon ? "text-red-600" : "text-[#01454A]"
        }`}>
          <Clock size={13} />
          {isEndingSoon ? "Ending in " : "Available for "}
          {timeLeft}
        </span>
      )}

      {/* Exclusivity: Featured badge */}
      {isFeatured && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA600]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#FDA600]">
          <Lock size={10} />
          Exclusive Access
        </span>
      )}

      {/* Social Proof: Live viewers */}
      {viewingCount && viewingCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#01454A]/70">
          <Users size={12} />
          {viewingCount} browsing now
        </span>
      )}

      {/* Scarcity: Product count */}
      {productCount !== null && productCount > 0 && productCount < 20 && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Flame size={12} />
          Only {productCount} pieces left
        </span>
      )}
    </div>
  );
}
