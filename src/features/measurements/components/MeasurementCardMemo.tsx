"use client";
/**
 * @file MeasurementCardMemo.tsx
 * @description Phase 13 / TASK-043: Memoized wrapper for per-measurement card.
 *
 * Problem:
 *   - MeasurementReveal renders 14 measurement cards simultaneously
 *   - Each rAF tick re-renders the parent, triggering all 14 card renders
 *   - Cards are pure displays — their props change at most once (on completion)
 *
 * Solution:
 *   - React.memo() wraps each card with deep-equality check
 *   - Custom equality: only re-render if valueCm, confidence, or unit changes
 *   - This reduces render cost from O(14) per frame → O(1) per frame during scan
 *
 * Usage:
 *   Replace <MeasurementCard .../> with <MeasurementCardMemo .../> in
 *   MeasurementReveal.tsx for zero-cost re-renders after initial reveal.
 */

import { memo } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeasurementCardMemoProps {
  label:        string;
  valueCm:      number | null;
  valueInches?: number | null;
  confidence?:  number | null;
  unit:         "cm" | "inches";
  delay?:       number;
  fieldKey:     string;
}

// ─── Confidence coloring ──────────────────────────────────────────────────────

function getConfidenceColor(score: number | null): string {
  if (score === null) return "rgba(255,255,255,0.2)";
  if (score >= 0.80)  return "#01454A";
  if (score >= 0.60)  return "#FDA600";
  return "#DC2626";
}

// ─── Card implementation ──────────────────────────────────────────────────────

function MeasurementCardImpl({
  label,
  valueCm,
  valueInches,
  confidence,
  unit,
  delay = 0,
  fieldKey,
}: MeasurementCardMemoProps) {
  const displayValue = unit === "inches"
    ? (valueInches ?? null)
    : valueCm;

  const unitLabel = unit === "inches" ? "in" : "cm";
  const confColor = getConfidenceColor(confidence ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border:     "1px solid rgba(255,255,255,0.08)",
      }}
      id={`measurement-card-${fieldKey}`}
    >
      {/* Label */}
      <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
        {label}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-black text-white">
          {displayValue !== null ? displayValue.toFixed(1) : "—"}
        </span>
        {displayValue !== null && (
          <span className="text-xs font-semibold" style={{ color: "#1A6B72" }}>
            {unitLabel}
          </span>
        )}
      </div>

      {/* Secondary unit */}
      {valueCm !== null && unit === "cm" && valueInches !== null && valueInches !== undefined && (
        <p className="text-[10px] text-white/30">{valueInches.toFixed(1)}&quot;</p>
      )}
      {valueCm !== null && unit === "inches" && valueCm !== null && (
        <p className="text-[10px] text-white/30">{valueCm.toFixed(1)} cm</p>
      )}

      {/* Confidence dot */}
      {confidence !== null && confidence !== undefined && (
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: confColor }}
          />
          <span className="text-[10px]" style={{ color: confColor }}>
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Custom equality check ────────────────────────────────────────────────────

function areEqual(
  prev: MeasurementCardMemoProps,
  next: MeasurementCardMemoProps,
): boolean {
  return (
    prev.valueCm     === next.valueCm     &&
    prev.valueInches === next.valueInches &&
    prev.confidence  === next.confidence  &&
    prev.unit        === next.unit        &&
    prev.label       === next.label       &&
    prev.fieldKey    === next.fieldKey
  );
}

/**
 * Memoized measurement card — only re-renders when measurement values change.
 * Replaces <MeasurementCard /> in MeasurementReveal for zero re-render cost
 * once all 14 measurements are revealed.
 */
export const MeasurementCardMemo = memo(MeasurementCardImpl, areEqual);
