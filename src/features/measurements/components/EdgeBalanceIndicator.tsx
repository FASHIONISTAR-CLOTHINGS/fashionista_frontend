"use client";
/**
 * @file EdgeBalanceIndicator.tsx
 * @description Thin colored border around the camera viewport that communicates
 * phone balance in real time. Red = tilted, gold = almost level, green = level.
 *
 * The border is the only visual chrome on the full-screen camera; it does not
 * block the video and is visible in every active phase.
 */

import { cn } from "@/lib/utils";
import type { OrientationStatus } from "../hooks/usePhoneOrientation";

interface EdgeBalanceIndicatorProps {
  status: OrientationStatus;
  className?: string;
}

export function EdgeBalanceIndicator({ status, className }: EdgeBalanceIndicatorProps) {
  const colorClass =
    status === "good"
      ? "border-[var(--BV-green)]"
      : status === "tilted"
      ? "border-[var(--BV-gold)]"
      : status === "bad"
      ? "border-[var(--BV-red-alert)]"
      : "border-white/20";

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 pointer-events-none border-[5px] transition-colors duration-200",
        colorClass,
        className
      )}
      aria-hidden="true"
    />
  );
}
