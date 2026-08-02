"use client";
/**
 * @file PhoneOrientationIndicator.tsx
 * @description TASK-007: Visual 90-degree phone orientation indicator.
 *
 * Shows a phone SVG that rotates in real-time to match actual device tilt.
 * A colored pulsing ring conveys the status at a glance:
 *
 *   🟢 GREEN  — Phone level, camera at 90°, ready to scan
 *   🟡 YELLOW — Minor tilt, almost there
 *   🔴 RED    — Significant tilt, needs correction
 *   📱 STATIC — Desktop / unsupported device
 *
 * Voice coaching triggered on status changes via onStatusChange callback.
 *
 * Design Principles:
 * - Framer Motion spring physics for smooth phone rotation
 * - Pulsing ring animation for GREEN (positive reinforcement)
 * - Status badge with instruction text
 * - Compact enough to sit inside the device_setup phase overlay
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type OrientationStatus } from "../hooks/usePhoneOrientation";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhoneOrientationIndicatorProps {
  status:        OrientationStatus;
  gamma:         number | null;
  tiltDegrees:   number;
  tiltDirection: "left" | "right" | null;
  /** Called when status changes — parent can trigger voice coaching */
  onStatusChange?: (status: OrientationStatus) => void;
  /** Called when user taps the indicator to request permission on iOS */
  onRequestPermission?: () => void;
  /** Optional positioning/style hook for camera-overlay mode. */
  className?: string;
}

// ─── Status configuration ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  good: {
    ringColor:  "#2D6A4F",
    textColor:  "#52B788",
    bgColor:    "bg-[#2D6A4F]/15",
    borderColor:"border-[#2D6A4F]/30",
    label:      "✓ Camera level and ready!",
    pulse:      true,
  },
  tilted: {
    ringColor:  "#F4C430",
    textColor:  "#F4C430",
    bgColor:    "bg-[#F4C430]/15",
    borderColor:"border-[#F4C430]/30",
    label:      "Almost there — adjust slightly",
    pulse:      false,
  },
  bad: {
    ringColor:  "#DC2626",
    textColor:  "#DC2626",
    bgColor:    "bg-[#DC2626]/15",
    borderColor:"border-[#DC2626]/30",
    label:      "Phone tilted — please level it",
    pulse:      false,
  },
  unknown: {
    ringColor:  "#6B7280",
    textColor:  "#D1D5DB",
    bgColor:    "bg-white/10",
    borderColor:"border-white/20",
    label:      "Waiting for orientation data...",
    pulse:      false,
  },
  unsupported: {
    ringColor:  "#6B7280",
    textColor:  "#9CA3AF",
    bgColor:    "bg-white/10",
    borderColor:"border-white/20",
    label:      "Place phone on a stable surface facing you",
    pulse:      false,
  },
  requesting: {
    ringColor:  "#F4C430",
    textColor:  "#F4C430",
    bgColor:    "bg-[#F4C430]/10",
    borderColor:"border-[#F4C430]/20",
    label:      "Tap to allow orientation access...",
    pulse:      false,
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function PhoneOrientationIndicator({
  status,
  gamma,
  tiltDegrees,
  tiltDirection,
  onStatusChange,
  onRequestPermission,
  className,
}: PhoneOrientationIndicatorProps) {
  const prevStatusRef = useRef<OrientationStatus>(status);

  // Notify parent of status changes
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;
      onStatusChange?.(status);
    }
  }, [status, onStatusChange]);

  const config = STATUS_CONFIG[status];
  const rotationAngle = gamma ?? 0;

  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>

      {/* Phone SVG with live rotation */}
      <div className="relative flex items-center justify-center w-28 h-28">

        {/* Outer status ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `3px solid ${config.ringColor}` }}
          animate={
            config.pulse
              ? {
                  scale:   [1, 1.08, 1],
                  opacity: [0.6, 1, 0.6],
                }
              : { scale: 1, opacity: 0.8 }
          }
          transition={
            config.pulse
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        />

        {/* Phone SVG rotates with gamma */}
        <motion.div
          animate={{ rotate: rotationAngle }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="relative z-10"
        >
          <PhoneSVG color={config.ringColor} />
        </motion.div>

        {/* Center dot — tilt direction arrow */}
        <AnimatePresence>
          {status !== "good" && status !== "unsupported" && tiltDirection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              className="absolute -bottom-1 flex items-center justify-center"
            >
              <span
                className="text-lg font-bold"
                style={{ color: config.ringColor }}
                aria-label={`Tilt ${tiltDirection}`}
              >
                {tiltDirection === "left" ? "←" : "→"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status badge */}
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          px-4 py-2 rounded-xl text-xs font-medium text-center
          ${config.bgColor} border ${config.borderColor}
          cursor-pointer select-none
        `}
        style={{ color: config.textColor }}
        onClick={
          status === "unsupported" || status === "requesting"
            ? onRequestPermission
            : undefined
        }
        role={status === "unsupported" ? "button" : undefined}
        aria-label={status === "unsupported" ? "Tap to enable orientation detection" : undefined}
      >
        {status === "bad" && tiltDegrees > 0
          ? `Phone tilted ${tiltDegrees.toFixed(0)}° — please level it`
          : status === "tilted" && tiltDirection
          ? `Rotate slightly ${tiltDirection === "left" ? "↻" : "↺"}`
          : config.label
        }
      </motion.div>

      {/* Degree reading (dev-friendly, only when tilted) */}
      {(status === "tilted" || status === "bad") && (
        <p className="text-[10px] text-white/30 font-mono">
          {tiltDegrees.toFixed(1)}° off vertical
        </p>
      )}
    </div>
  );
}

// ─── Phone SVG ────────────────────────────────────────────────────────────────

function PhoneSVG({ color }: { color: string }) {
  return (
    <svg
      width="36"
      height="60"
      viewBox="0 0 36 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Phone body */}
      <rect
        x="2"
        y="2"
        width="32"
        height="56"
        rx="6"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Camera dot */}
      <circle cx="18" cy="8" r="2" fill={color} opacity="0.6" />
      {/* Screen area */}
      <rect x="6" y="14" width="24" height="34" rx="2" fill={color} opacity="0.08" />
      {/* Home button / notch indicator */}
      <rect x="14" y="52" width="8" height="2" rx="1" fill={color} opacity="0.4" />
    </svg>
  );
}
