"use client";

/**
 * @file MeasurementTimeline.tsx
 * @description Scan history timeline with delta badges and confidence indicators.
 *
 * Shows a vertical timeline of past measurement scans with:
 *   - Date + confidence percentage
 *   - Key measurement values (cm)
 *   - Delta arrows (↑↓ vs previous scan)
 *   - "Retake Scan" CTA
 *
 * Brand-compliant Forest Green + Golden Yellow design.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id:              string | number;
  scanned_at:      string;
  scan_confidence: number | null;
  measurements_cm: Record<string, number | null>;
}

interface MeasurementTimelineProps {
  entries:  TimelineEntry[];
  onRetake: () => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

function getDelta(
  current: number | null,
  prev: number | null,
): { value: number; dir: "up" | "down" | "same" } | null {
  if (current == null || prev == null) return null;
  const diff = parseFloat((current - prev).toFixed(1));
  if (diff === 0) return null;
  return { value: Math.abs(diff), dir: diff > 0 ? "up" : "down" };
}

const KEY_LABELS: Record<string, { label: string; icon: string }> = {
  bust:           { label: "Bust",           icon: "👕" },
  waist:          { label: "Waist",          icon: "⬡"  },
  hips:           { label: "Hips",           icon: "⬡"  },
  shoulder_width: { label: "Shoulder",       icon: "📏" },
  arm_length:     { label: "Arm",            icon: "💪" },
  inseam:         { label: "Inseam",         icon: "👖" },
  thigh:          { label: "Thigh",          icon: "⬡"  },
  neck:           { label: "Neck",           icon: "⬡"  },
  torso_length:   { label: "Torso",          icon: "⬡"  },
  sleeve_length:  { label: "Sleeve",         icon: "💪" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementTimeline({
  entries,
  onRetake,
  className,
}: MeasurementTimelineProps) {
  if (!entries || entries.length === 0) return null;

  // Sort by date descending (newest first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime(),
  );

  return (
    <div className={cn("rounded-2xl bg-white/5 border border-white/10 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Scan History</h3>
        <button
          onClick={onRetake}
          className="text-xs font-medium text-[#52B788] hover:text-[#2D6A4F] transition"
        >
          📷 Retake
        </button>
      </div>

      {/* Timeline */}
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />

        <div className="flex flex-col gap-4">
          {sorted.map((entry, idx) => {
            const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
            const confidence = entry.scan_confidence != null
              ? Math.round(entry.scan_confidence * 100)
              : null;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Dot */}
                <div
                  className="absolute -left-4 top-1.5 w-2 h-2 rounded-full"
                  style={{
                    background: idx === 0 ? "#52B788" : "rgba(255,255,255,0.2)",
                  }}
                />

                {/* Date + confidence */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-white/70">
                    {formatDate(entry.scanned_at)}
                  </span>
                  {confidence != null && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: confidence >= 80 ? "#52B788" : confidence >= 60 ? "#F4C430" : "#DC2626",
                        background: confidence >= 80 ? "#52B78815" : confidence >= 60 ? "#F4C43015" : "#DC262615",
                      }}
                    >
                      {confidence}% accuracy
                    </span>
                  )}
                </div>

                {/* Key measurements */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(KEY_LABELS).map(([key, { label, icon }]) => {
                    const current = entry.measurements_cm?.[key] ?? null;
                    const prevVal = prev?.measurements_cm?.[key] ?? null;
                    const delta = getDelta(current, prevVal);

                    if (current == null) return null;

                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-white/50">
                          {icon} {label}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-white/80 font-medium">{current}cm</span>
                          {delta && (
                            <span
                              className="text-[9px] font-bold"
                              style={{ color: delta.dir === "up" ? "#52B788" : "#F4C430" }}
                            >
                              {delta.dir === "up" ? "↑" : "↓"}{delta.value}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
