"use client";
/**
 * @file ScanQualityReport.tsx
 * @description Step 39 / TASK-028: Post-scan quality report card.
 *
 * Displayed immediately after scan completes, above the MeasurementReveal.
 * Shows:
 *   - Front + side pose quality percentages (color-coded)
 *   - Count of high-confidence measurements (e.g., 12 of 14)
 *   - Per-measurement visibility warnings (low-confidence fields flagged)
 *   - Retake recommendation if overall quality < 70%
 *
 * Brand: Forest Green = pass, Golden Yellow = warning, Red = fail
 * Framer Motion: staggered list reveal
 */

import { motion } from "framer-motion";

// --- Types -------------------------------------------------------------------

export interface QualityReportData {
  front_pose_quality:     number;       // 0–1
  side_pose_quality?:     number | null; // 0–1, null if no side pose
  measurements_captured:  number;       // how many of 14 are non-null
  total_measurements:     number;       // typically 14
  low_confidence_fields?: string[];     // field keys with confidence < 0.6
  scan_confidence:        number;       // 0–1 overall
}

interface ScanQualityReportProps {
  data:       QualityReportData;
  onRetake?:  () => void;
  className?: string;
}

// --- Helpers -----------------------------------------------------------------

function quality_color(q: number): string {
  if (q >= 0.80) return "#01454A";
  if (q >= 0.60) return "#FDA600";
  return "#DC2626";
}

function quality_label(q: number): string {
  if (q >= 0.80) return "Excellent";
  if (q >= 0.60) return "Good";
  if (q >= 0.40) return "Fair";
  return "Poor";
}

const FIELD_LABELS: Record<string, string> = {
  bust:           "Bust",
  waist:          "Waist",
  hips:           "Hips",
  shoulder_width: "Shoulders",
  arm_length:     "Arm Length",
  inseam:         "Inseam",
  thigh:          "Thigh",
  neck:           "Neck",
  torso_length:   "Torso",
  sleeve_length:  "Sleeve",
  knee:           "Knee",
  calf:           "Calf",
  chest:          "Chest",
  rise:           "Rise",
};

// --- Circular quality indicator ----------------------------------------------

function QualityRing({ score, label }: { score: number; label: string }) {
  const pct   = Math.round(score * 100);
  const color = quality_color(score);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <motion.circle
            cx="24" cy="24" r="20" fill="none"
            stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] text-white/50 font-medium text-center">{label}</span>
    </div>
  );
}

// --- Report Row (pass / warn) ------------------------------------------------

function ReportRow({
  icon, text, color, delay,
}: { icon: string; text: string; color: string; delay: number }) {
  return (
    <motion.div
      className="flex items-start gap-2.5"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <span className="text-sm mt-0.5 flex-shrink-0">{icon}</span>
      <p className="text-xs leading-relaxed" style={{ color }}>
        {text}
      </p>
    </motion.div>
  );
}

// --- Main Component ----------------------------------------------------------

export function ScanQualityReport({
  data,
  onRetake,
  className = "",
}: ScanQualityReportProps) {
  const {
    front_pose_quality,
    side_pose_quality,
    measurements_captured,
    total_measurements,
    low_confidence_fields = [],
    scan_confidence,
  } = data;

  const overallPass   = scan_confidence >= 0.7;
  const capturedPct   = Math.round((measurements_captured / total_measurements) * 100);

  return (
    <motion.div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${overallPass ? "rgba(45,106,79,0.3)" : "rgba(244,196,48,0.3)"}`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5 border-b border-white/5">
        <span className="text-lg">{overallPass ? "✅" : "⚠️"}</span>
        <div>
          <p className="text-sm font-bold text-white">Scan Quality Report</p>
          <p className="text-[11px] text-white/40 mt-0.5">
            {overallPass
              ? "All systems go — measurements saved."
              : "Low quality detected — consider retaking."}
          </p>
        </div>
      </div>

      {/* Ring indicators */}
      <div className="px-4 py-4 flex items-center gap-6 justify-center">
        <QualityRing score={front_pose_quality} label="Front Pose" />
        {side_pose_quality !== null && side_pose_quality !== undefined && (
          <QualityRing score={side_pose_quality} label="Side Pose" />
        )}
        <QualityRing score={scan_confidence} label="Overall" />
      </div>

      {/* Text report rows */}
      <div className="px-4 pb-4 flex flex-col gap-2.5">
        {/* Captured count */}
        <ReportRow
          icon={capturedPct >= 85 ? "✅" : "⚠️"}
          text={`${measurements_captured} of ${total_measurements} measurements captured with high confidence (${capturedPct}%)`}
          color={capturedPct >= 85 ? "#1A6B72" : "#FDA600"}
          delay={0.1}
        />

        {/* Front quality */}
        <ReportRow
          icon={front_pose_quality >= 0.75 ? "✅" : "⚠️"}
          text={`Front pose quality: ${Math.round(front_pose_quality * 100)}% — ${quality_label(front_pose_quality)}`}
          color={quality_color(front_pose_quality)}
          delay={0.15}
        />

        {/* Side quality (if present) */}
        {side_pose_quality !== null && side_pose_quality !== undefined && (
          <ReportRow
            icon={side_pose_quality >= 0.65 ? "✅" : "⚠️"}
            text={`Side pose quality: ${Math.round(side_pose_quality * 100)}%${
              side_pose_quality < 0.65 ? " — lower than ideal, some measurements estimated" : ""
            }`}
            color={quality_color(side_pose_quality)}
            delay={0.2}
          />
        )}

        {/* Low confidence fields */}
        {low_confidence_fields.length > 0 && (
          <ReportRow
            icon="⚠️"
            text={`${low_confidence_fields.map(k => FIELD_LABELS[k] ?? k).join(", ")} — visibility too low, may require retake`}
            color="#FDA600"
            delay={0.25}
          />
        )}

        {/* Retake recommendation */}
        {!overallPass && onRetake && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={onRetake}
              className="w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95"
              style={{
                background: "rgba(244,196,48,0.15)",
                border: "1px solid rgba(244,196,48,0.4)",
                color: "#FDA600",
              }}
              id="quality-report-retake-btn"
            >
              Retake for Better Accuracy
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
