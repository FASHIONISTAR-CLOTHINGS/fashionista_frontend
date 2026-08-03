"use client";
/**
 * @file MeasurementTimeline.tsx
 * @description Step 28 / TASK-025: Chronological scan history with delta badges.
 *
 * Shows all past body scans in reverse-chronological order.
 * Each entry:
 *   - Date + time-ago label
 *   - Scan confidence badge (color-coded)
 *   - Delta badges vs. previous scan (up / down / equal per measurement)
 *   - Expandable measurement grid (click to open)
 *   - "Retake Scan" CTA per entry
 *
 * Brand: Forest Green (#01454A) | Golden Yellow (#FDA600) | on #111111 bg
 * Framer Motion: AnimatePresence + height-based collapse animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types -------------------------------------------------------------------

export interface MeasurementEntry {
  id:                 string | number;
  scanned_at:         string;
  scan_confidence:    number | null;
  measurements_cm:    Record<string, number | null>;
  measurements_inches?: Record<string, number | null>;
}

interface Props {
  entries:    MeasurementEntry[];
  onRetake?:  () => void;
  className?: string;
}

// --- Helpers -----------------------------------------------------------------

function timeAgo(isoDate: string): string {
  const diffMs  = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffH   = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;
  const diffD   = Math.floor(diffH / 24);
  if (diffD < 30)   return `${diffD}d ago`;
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function confidenceColor(score: number | null): string {
  if (score === null) return "rgba(255,255,255,0.3)";
  if (score >= 0.8)  return "#01454A";
  if (score >= 0.6)  return "#FDA600";
  return "#DC2626";
}

function delta(curr: number | null, prev: number | null): number | null {
  if (curr === null || prev === null) return null;
  return Math.round((curr - prev) * 10) / 10;
}

// --- Sub-components ----------------------------------------------------------

function DeltaBadge({ diff }: { diff: number | null }) {
  if (diff === null || Math.abs(diff) < 0.1) {
    return <span className="text-[10px] text-white/30 font-medium">=</span>;
  }
  const isUp = diff > 0;
  return (
    <span className="text-[10px] font-bold"
      style={{ color: isUp ? "#FDA600" : "#1A6B72" }}>
      {isUp ? "+" : ""}{diff}cm
    </span>
  );
}

function ConfidenceBadge({ score }: { score: number | null }) {
  const color = confidenceColor(score);
  const label = score !== null ? `${Math.round(score * 100)}%` : "N/A";
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

const DISPLAY_FIELDS: Array<{ key: string; label: string }> = [
  { key: "bust",           label: "Bust"      },
  { key: "waist",          label: "Waist"     },
  { key: "hips",           label: "Hips"      },
  { key: "shoulder_width", label: "Shoulders" },
  { key: "arm_length",     label: "Arm"       },
  { key: "inseam",         label: "Inseam"    },
  { key: "thigh",          label: "Thigh"     },
  { key: "neck",           label: "Neck"      },
  { key: "torso_length",   label: "Torso"     },
  { key: "sleeve_length",  label: "Sleeve"    },
];

function MeasurementGrid({
  current,
  previous,
}: {
  current:  Record<string, number | null>;
  previous: Record<string, number | null> | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 pt-3">
      {DISPLAY_FIELDS.map(({ key, label }) => {
        const val  = current[key] ?? null;
        const prev = previous?.[key] ?? null;
        const diff = previous ? delta(val, prev) : null;
        return (
          <div
            key={key}
            className="rounded-xl p-3 flex flex-col gap-0.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">
                {val !== null ? val.toFixed(1) : "—"}
              </span>
              {val !== null && (
                <span className="text-[10px]" style={{ color: "#1A6B72" }}>cm</span>
              )}
            </div>
            {diff !== null && <DeltaBadge diff={diff} />}
          </div>
        );
      })}
    </div>
  );
}

function TimelineEntry({
  entry,
  previous,
  isFirst,
  onRetake,
}: {
  entry:     MeasurementEntry;
  previous:  MeasurementEntry | null;
  isFirst:   boolean;
  onRetake?: () => void;
}) {
  const [expanded, setExpanded] = useState(isFirst);

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isFirst
          ? "1px solid rgba(244,196,48,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(p => !p)}
        id={`timeline-entry-${entry.id}-toggle`}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            background: isFirst ? "#FDA600" : "#01454A",
            boxShadow: isFirst ? "0 0 8px rgba(244,196,48,0.5)" : "none",
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{formatDate(entry.scanned_at)}</span>
            {isFirst && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(244,196,48,0.15)", color: "#FDA600", border: "1px solid rgba(244,196,48,0.3)" }}>
                LATEST
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/30 mt-0.5">{timeAgo(entry.scanned_at)}</p>
        </div>
        <ConfidenceBadge score={entry.scan_confidence} />
        <span className="text-white/30 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <MeasurementGrid
                current={entry.measurements_cm}
                previous={previous?.measurements_cm ?? null}
              />
              <div className="flex gap-2 mt-4">
                {onRetake && (
                  <button
                    onClick={onRetake}
                    className="flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition-colors"
                    style={{
                      background: "rgba(45,106,79,0.25)",
                      border: "1px solid rgba(45,106,79,0.4)",
                    }}
                    id={`retake-scan-from-timeline-${entry.id}`}
                  >
                    Retake Scan
                  </button>
                )}
                <button
                  onClick={() => {
                    const text = Object.entries(entry.measurements_cm)
                      .filter(([, v]) => v !== null)
                      .map(([k, v]) => `${k}: ${v}cm`)
                      .join("\n");
                    navigator.clipboard?.writeText(text);
                  }}
                  className="px-3 rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  id={`copy-measurements-${entry.id}`}
                >
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Main Component ----------------------------------------------------------

export function MeasurementTimeline({ entries, onRetake, className = "" }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <div className={`flex flex-col items-center gap-3 py-8 text-center ${className}`}>
        <span className="text-4xl">📏</span>
        <p className="text-sm text-white/50">No scan history yet.</p>
        <p className="text-xs text-white/30">Complete your first body scan to see results here.</p>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime(),
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white/80">Scan History</h3>
        <span className="text-xs text-white/30">
          {sorted.length} scan{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>
      {sorted.map((entry, idx) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          previous={sorted[idx + 1] ?? null}
          isFirst={idx === 0}
          onRetake={idx === 0 ? onRetake : undefined}
        />
      ))}
    </div>
  );
}
