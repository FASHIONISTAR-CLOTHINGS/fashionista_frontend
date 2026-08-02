"use client";
/**
 * @file BodySilhouetteOverlay.tsx
 * @description Full-body ghost silhouette overlay for the camera scan viewport.
 *
 * Shows a human outline the user must step into — like MirrSize AI.
 * Color changes based on pose readiness:
 * - RED: No body detected / poor conditions
 * - GOLDEN YELLOW: Body detected but not ready (adjusting)
 * - FOREST GREEN: Ready to capture
 *
 * The silhouette is an SVG drawn in A-pose (arms at ~45°) to guide the user
 * to the correct position for measurement capture.
 */

import { motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BodySilhouetteOverlayProps {
  /** Is any body detected by MediaPipe? */
  isBodyDetected: boolean;
  /** Is the full body (head to ankles) visible? */
  isFullBodyVisible: boolean;
  /** Is the user at the optimal distance? */
  isDistanceOptimal: boolean;
  /** Is the user centered in frame? */
  isCentered: boolean;
  /** Additional CSS class */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BodySilhouetteOverlay({
  isBodyDetected,
  isFullBodyVisible,
  isDistanceOptimal,
  isCentered,
}: BodySilhouetteOverlayProps) {
  // Color based on readiness state
  const allGood = isBodyDetected && isFullBodyVisible && isDistanceOptimal && isCentered;
  const partial = isBodyDetected && (!isFullBodyVisible || !isDistanceOptimal || !isCentered);

  const color = allGood
    ? "#52B788"   // Forest Green (brand)
    : partial
    ? "#FDA600"   // Brand Gold
    : "#EF4444";  // Red — no body / not ready

  const opacity = allGood ? 0.5 : partial ? 0.4 : 0.3;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <motion.svg
        viewBox="0 0 120 220"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        animate={{ opacity }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Head ─────────────────────────────────────────────────── */}
        <ellipse
          cx="60" cy="22"
          rx="13" ry="16"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5 3"
        />

        {/* ── Neck ─────────────────────────────────────────────────── */}
        <line x1="60" y1="38" x2="60" y2="46"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Shoulders ────────────────────────────────────────────── */}
        <line x1="40" y1="50" x2="80" y2="50"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Torso ────────────────────────────────────────────────── */}
        <path
          d="M40,50 L36,100 L40,130 L80,130 L84,100 L80,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5 3"
        />

        {/* ── Left arm (45° down-out) ───────────────────────────────── */}
        <line x1="40" y1="55" x2="18" y2="90"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />
        {/* Left forearm */}
        <line x1="18" y1="90" x2="10" y2="115"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Right arm (45° down-out) ──────────────────────────────── */}
        <line x1="80" y1="55" x2="102" y2="90"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />
        {/* Right forearm */}
        <line x1="102" y1="90" x2="110" y2="115"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Hips ─────────────────────────────────────────────────── */}
        <line x1="40" y1="130" x2="80" y2="130"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Left leg ─────────────────────────────────────────────── */}
        <line x1="48" y1="130" x2="44" y2="175"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />
        {/* Left shin */}
        <line x1="44" y1="175" x2="42" y2="210"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Right leg ────────────────────────────────────────────── */}
        <line x1="72" y1="130" x2="76" y2="175"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />
        {/* Right shin */}
        <line x1="76" y1="175" x2="78" y2="210"
          stroke={color} strokeWidth="2" strokeDasharray="4 3" />

        {/* ── Status glow ring at head ──────────────────────────────── */}
        {allGood && (
          <motion.ellipse
            cx="60" cy="22"
            rx="20" ry="22"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={0.3}
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.svg>
    </div>
  );
}
