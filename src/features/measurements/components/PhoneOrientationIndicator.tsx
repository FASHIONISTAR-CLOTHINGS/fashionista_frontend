"use client";

/**
 * @file PhoneOrientationIndicator.tsx
 * @description Visual indicator showing phone tilt angle.
 *
 * GREEN (✓) when vertical (|angle| < 15°)
 * YELLOW (⚠) when slightly off (15–30°)
 * RED (✗) when too tilted (>30°)
 */

import { motion } from "framer-motion";

export interface PhoneOrientationIndicatorProps {
  angle: number;
  isVertical: boolean;
  className?: string;
}

export function PhoneOrientationIndicator({
  angle,
  isVertical,
  className = "",
}: PhoneOrientationIndicatorProps) {
  const status =
    angle < 15 ? "good" : angle < 30 ? "warning" : "bad";

  const colors = {
    good: { bg: "rgba(82,183,136,0.15)", border: "rgba(82,183,136,0.3)", text: "#52B788", icon: "✓" },
    warning: { bg: "rgba(244,196,48,0.15)", border: "rgba(244,196,48,0.3)", text: "#F4C430", icon: "⚠" },
    bad: { bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.3)", text: "#DC2626", icon: "✗" },
  };

  const c = colors[status];

  return (
    <motion.div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${className}`}
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
      animate={{ opacity: isVertical ? 0.6 : 1 }}
    >
      {/* Phone icon with rotation */}
      <motion.div
        animate={{ rotate: Math.min(angle, 45) }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-lg"
        style={{ color: c.text }}
      >
        📱
      </motion.div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold" style={{ color: c.text }}>
          {c.icon} {status === "good" ? "Phone is level" : status === "warning" ? "Slightly tilted" : "Too tilted"}
        </span>
        <span className="text-[10px]" style={{ color: c.text, opacity: 0.7 }}>
          {angle}° from vertical
        </span>
      </div>
    </motion.div>
  );
}
