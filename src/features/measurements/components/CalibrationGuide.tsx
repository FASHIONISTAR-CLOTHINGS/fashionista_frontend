"use client";
/**
 * @file CalibrationGuide.tsx
 * @description PHASE 6: Full intelligence HUD overlay for the camera scan viewport.
 *
 * REDESIGN (2026-08-02):
 * - Now accepts PoseIntelligenceResult from poseIntelligence.ts
 * - Shows: Distance 3-zone bar, centering arrows, arms angle guide
 * - Readiness ring (0-100% progress arc) replaces simple quality bar
 * - Primary message banner with animated pulsing indicator
 * - Phase-specific corner brackets (RED → GOLD → GREEN)
 * - Scanning animation when overallReady
 *
 * Props:
 *   phase        — Current capture phase (for phase-specific messaging)
 *   intelligence — PoseIntelligenceResult from analyzePose()
 *   qualityScore — Raw 0-1 quality score (fallback when no intelligence)
 *   estimatedHeight — From world-landmark height estimation
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PoseIntelligenceResult } from "../lib/poseIntelligence";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CalibrationGuideProps {
  phase:            string;
  /** Intelligence result from poseIntelligence.ts — full AI guidance data */
  intelligence?:    PoseIntelligenceResult | null;
  /** Fallback: raw quality score 0-1 (used when intelligence is null) */
  qualityScore:     number;
  estimatedHeight:  number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalibrationGuide({
  phase,
  intelligence,
  qualityScore,
  estimatedHeight,
}: CalibrationGuideProps) {

  // Use intelligence data when available, otherwise fall back to quality score
  const score      = intelligence?.readinessScore ?? Math.round(qualityScore * 100);
  const isReady    = intelligence?.overallReady ?? (qualityScore >= 0.80);
  const isGood     = isReady || (qualityScore >= 0.72);
  const isMedium   = !isReady && (intelligence?.readinessScore ?? 0) >= 40 || (!intelligence && qualityScore >= 0.5);

  const primaryMsg = intelligence?.primaryMessage
    ?? (isGood ? "Great pose! Ready to capture." : isMedium ? "Adjust your position slightly." : "Stand straight, arms at 45°.");

  const secondaryMsg = intelligence?.secondaryMessage ?? "";

  // Color theme
  const color = isReady ? "#52B788" : isMedium ? "#F4C430" : "#DC2626";
  const colorClass = isReady ? "text-[#52B788]" : isMedium ? "text-[#F4C430]" : "text-[#DC2626]/80";
  const bgClass = isReady
    ? "bg-[#2D6A4F]/20 border-[#2D6A4F]/40"
    : isMedium
    ? "bg-[#F4C430]/15 border-[#F4C430]/30"
    : "bg-[#DC2626]/15 border-[#DC2626]/20";

  return (
    <div className="absolute inset-0 pointer-events-none select-none">

      {/* ── Corner scan-line brackets ── */}
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <CornerBracket key={corner} corner={corner} color={color} />
      ))}

      {/* ── Distance indicator (top-center) ── */}
      {intelligence && intelligence.distanceStatus !== "unknown" && (
        <DistanceIndicator
          status={intelligence.distanceStatus}
          distancePercent={intelligence.distancePercent}
        />
      )}

      {/* ── Centering arrows (side edges) ── */}
      {intelligence && intelligence.centeringStatus !== "unknown" && intelligence.centeringStatus !== "centered" && (
        <CenteringArrows status={intelligence.centeringStatus} />
      )}

      {/* ── Arms angle guide (center of torso area) ── */}
      {intelligence && intelligence.armsStatus === "at_sides" && (
        <ArmsGuide />
      )}

      {/* ── Readiness ring (top-right, replaces quality dot) ── */}
      <ReadinessRing score={score} color={color} />

      {/* ── Primary message banner (bottom overlay) ── */}
      <div className={cn(
        "absolute bottom-4 left-3 right-3 rounded-xl px-4 py-2.5 backdrop-blur-md",
        "transition-colors duration-500 border",
        bgClass,
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold leading-tight", colorClass)}>
              {primaryMsg}
            </p>
            {secondaryMsg && (
              <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{secondaryMsg}</p>
            )}
          </div>
          {/* Pulsing dot */}
          <div className={cn(
            "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5",
            isReady ? "bg-[#52B788] animate-pulse" : isMedium ? "bg-[#F4C430]" : "bg-[#DC2626]/60",
          )} />
        </div>
      </div>

      {/* ── Estimated height chip (top-left) ── */}
      {estimatedHeight && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm
                        border border-white/10 text-xs text-white/60 font-mono">
          ~{estimatedHeight.toFixed(1)} cm
        </div>
      )}

      {/* ── Scanning animation (only when ready) ── */}
      <AnimatePresence>
        {isReady && <ScanLine />}
      </AnimatePresence>
    </div>
  );
}

// ─── Corner Bracket ───────────────────────────────────────────────────────────

type Corner = "tl" | "tr" | "bl" | "br";

function CornerBracket({ corner, color }: { corner: Corner; color: string }) {
  const size  = 20;
  const thick = 2.5;

  const style: React.CSSProperties = {
    position:    "absolute",
    width:       size,
    height:      size,
    top:         corner.startsWith("t") ? 12 : undefined,
    bottom:      corner.startsWith("b") ? 12 : undefined,
    left:        corner.endsWith("l")   ? 12 : undefined,
    right:       corner.endsWith("r")   ? 12 : undefined,
    borderTop:    corner.startsWith("t") ? `${thick}px solid ${color}` : undefined,
    borderBottom: corner.startsWith("b") ? `${thick}px solid ${color}` : undefined,
    borderLeft:   corner.endsWith("l")   ? `${thick}px solid ${color}` : undefined,
    borderRight:  corner.endsWith("r")   ? `${thick}px solid ${color}` : undefined,
    transition:   "border-color 0.4s ease",
    borderRadius:
      corner === "tl" ? "3px 0 0 0" :
      corner === "tr" ? "0 3px 0 0" :
      corner === "bl" ? "0 0 0 3px" :
      "0 0 3px 0",
  };

  return <div style={style} />;
}

// ─── Distance Indicator ───────────────────────────────────────────────────────

function DistanceIndicator({
  status,
  distancePercent,
}: {
  status: "too_close" | "optimal" | "too_far" | "unknown";
  distancePercent: number;
}) {
  if (status === "unknown") return null;

  const label = status === "too_close"
    ? "⬆ Step back"
    : status === "too_far"
    ? "⬇ Step closer"
    : null;

  if (!label) return null;

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
        <p className="text-[#F4C430] font-bold text-xs whitespace-nowrap">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Centering Arrows ─────────────────────────────────────────────────────────

function CenteringArrows({ status }: { status: "too_left" | "centered" | "too_right" | "unknown" }) {
  if (status === "centered" || status === "unknown") return null;

  return (
    <motion.div
      className={cn(
        "absolute top-1/2 -translate-y-1/2",
        status === "too_left" ? "left-3" : "right-3",
      )}
      initial={{ opacity: 0, x: status === "too_left" ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-2 border border-[#F4C430]/30">
        <p className="text-[#F4C430] font-bold text-xl">
          {status === "too_left" ? "→" : "←"}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Arms Guide ───────────────────────────────────────────────────────────────

function ArmsGuide() {
  return (
    <motion.div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.85, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#F4C430]/40 flex flex-col items-center gap-1">
        {/* Mini arms-at-45° SVG guide */}
        <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
          {/* Left arm at 45° */}
          <line x1="24" y1="10" x2="4" y2="26" stroke="#F4C430" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right arm at 45° */}
          <line x1="24" y1="10" x2="44" y2="26" stroke="#F4C430" strokeWidth="2.5" strokeLinecap="round" />
          {/* Shoulders */}
          <line x1="12" y1="10" x2="36" y2="10" stroke="#F4C430" strokeWidth="2" strokeLinecap="round" />
          {/* Head hint */}
          <circle cx="24" cy="4" r="3" stroke="#F4C430" strokeWidth="1.5" fill="none" />
        </svg>
        <p className="text-[#F4C430] text-[10px] font-semibold">Open arms to 45°</p>
      </div>
    </motion.div>
  );
}

// ─── Readiness Ring ───────────────────────────────────────────────────────────

function ReadinessRing({ score, color }: { score: number; color: string }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center gap-0.5">
      <svg width="36" height="36" viewBox="0 0 36 36">
        {/* Background ring */}
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        {/* Progress arc */}
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.4s ease" }}
        />
        {/* Score number */}
        <text
          x="18" y="21"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill={color}
          style={{ fontFamily: "monospace" }}
        >
          {progress}
        </text>
      </svg>
    </div>
  );
}

// ─── Scan Line Animation ──────────────────────────────────────────────────────

function ScanLine() {
  return (
    <motion.div
      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#52B788] to-transparent"
      initial={{ top: "5%", opacity: 0.7 }}
      animate={{ top: ["5%", "90%", "5%"] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      style={{ position: "absolute" }}
    />
  );
}
