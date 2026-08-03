"use client";
/**
 * @file MeasurementReveal.tsx
 * @description TASK-024 / Step 27: Staggered measurement results reveal component.
 *
 * Displayed after a successful body scan completes (phase = "completed").
 * Features:
 *   - Framer Motion staggered card reveal (80ms between cards)
 *   - Golden Yellow border flash on each card as it enters
 *   - Forest Green / Golden Yellow brand-compliant design
 *   - Dual unit display: cm + inches on every card
 *   - Confidence dot: green (high) / golden (medium) per measurement
 *   - Zone grouping: Full Body → Upper Body → Core → Lower Body
 *   - Scan quality report (quality %, plausibility warnings)
 *   - "Find My Size" and "Retake Scan" action pair
 */

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { MEASUREMENT_FIELDS } from "@/lib/brand";
import type { ScanStatusResponse } from "@/features/measurements/api/scan.api";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren:  0.08,
      delayChildren:    0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y:       0,
    scale:   1,
    transition: { duration: 0.4, ease: "circOut" as const },
  },
};

const headerVariants: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeasurementRevealProps {
  /** Full status response from the backend scan endpoint. */
  scanResult:       ScanStatusResponse;
  /** Overall front-pose quality score (0-1). */
  qualityScore?:    number;
  onRetake?:        () => void;
  onViewProfile?:   () => void;
  className?:       string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cmToFtIn(cm: number): string {
  const totalInches = cm / 2.54;
  const feet   = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

function cmToIn(cm: number): string {
  return `${(cm / 2.54).toFixed(1)}"`;
}

type ConfidenceLevel = "high" | "medium" | "low" | "missing";

function getConfidenceLevel(value: number | null | undefined, qualityScore: number): ConfidenceLevel {
  if (value == null) return "missing";
  if (qualityScore >= 0.85) return "high";
  if (qualityScore >= 0.65) return "medium";
  return "low";
}

// ─── Individual Measurement Card ─────────────────────────────────────────────

function MeasurementCard({
  label,
  icon,
  valueCm,
  qualityScore,
  isHeight = false,
}: {
  label:         string;
  icon:          string;
  valueCm:       number | null | undefined;
  qualityScore:  number;
  isHeight?:     boolean;
}) {
  const confidence = getConfidenceLevel(valueCm, qualityScore);
  const confidenceColor =
    confidence === "high"    ? "#1A6B72" :
    confidence === "medium"  ? "#FDA600" :
    confidence === "missing" ? "#6B7280" :
    "#DC2626";

  return (
    <motion.div
      variants={cardVariants}
      className="relative rounded-2xl border bg-white/[0.04] backdrop-blur-sm overflow-hidden"
      style={{ borderColor: `${confidenceColor}30` }}
      whileHover={{ borderColor: confidenceColor, scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      {/* Golden flash bar on entry */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        style={{ background: `linear-gradient(90deg, transparent, ${confidenceColor}, transparent)` }}
      />

      <div className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${confidenceColor}15` }}
        >
          <span className="text-lg">{icon}</span>
        </div>

        {/* Label + values */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-0.5">
            {label}
          </p>
          {valueCm != null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white leading-none">
                {valueCm.toFixed(1)}
              </span>
              <span className="text-xs text-white/40 font-medium">cm</span>
              <span className="text-sm font-semibold" style={{ color: "#FDA600" }}>
                {isHeight ? cmToFtIn(valueCm) : cmToIn(valueCm)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-white/25 italic">Not captured</p>
          )}
        </div>

        {/* Confidence dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: confidenceColor, boxShadow: `0 0 6px ${confidenceColor}60` }}
          title={`Confidence: ${confidence}`}
        />
      </div>
    </motion.div>
  );
}

// ─── Zone Header ─────────────────────────────────────────────────────────────

const ZONE_META: Record<string, { label: string; accent: string; icon: string }> = {
  full:  { label: "Full Body",    accent: "#01454A", icon: "📏" },
  upper: { label: "Upper Body",   accent: "#01454A", icon: "👕" },
  core:  { label: "Core",         accent: "#FDA600", icon: "⬡"  },
  lower: { label: "Lower Body",   accent: "#1A6B72", icon: "👖" },
};

function ZoneHeader({ zone }: { zone: string }) {
  const meta = ZONE_META[zone] ?? { label: zone, accent: "#01454A", icon: "📐" };
  return (
    <motion.div variants={cardVariants} className="flex items-center gap-2 mt-6 mb-3">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.accent }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.accent }}>
        {meta.label}
      </span>
      <div className="flex-1 h-px" style={{ background: `${meta.accent}20` }} />
    </motion.div>
  );
}

// ─── Quality Report Banner ────────────────────────────────────────────────────

function QualityReport({
  quality,
  warnings,
}: {
  quality:  number;
  warnings: string[];
}) {
  const pct          = Math.round(quality * 100);
  const isHighConf   = pct >= 85;
  const accent       = isHighConf ? "#1A6B72" : pct >= 65 ? "#FDA600" : "#DC2626";

  return (
    <motion.div
      variants={headerVariants}
      className="rounded-2xl border p-4 mb-6"
      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isHighConf ? "✅" : "⚠️"}</span>
          <span className="text-sm font-semibold text-white">Scan Quality Report</span>
        </div>
        <div
          className="text-2xl font-black tabular-nums"
          style={{ color: accent }}
        >
          {pct}%
        </div>
      </div>

      {/* Quality bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Plausibility warnings */}
      {warnings.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-[#FDA600]/80 flex items-start gap-1.5">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <span>{w}</span>
            </p>
          ))}
          <p className="text-xs text-white/30 mt-2">
            Lower-confidence measurements are marked with a gold dot. Consider retaking for improved accuracy.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MeasurementReveal({
  scanResult,
  qualityScore = 0.8,
  onRetake,
  onViewProfile,
  className = "",
}: MeasurementRevealProps) {
  const measurements = scanResult.measurements_cm ?? scanResult.extracted_measurements ?? {};
  const warnings     = scanResult.plausibility_warnings ?? [];
  const zones        = ["full", "upper", "core", "lower"] as const;

  // Group MEASUREMENT_FIELDS by zone
  const byZone = Object.fromEntries(
    zones.map(z => [
      z,
      MEASUREMENT_FIELDS.filter(f => f.zone === z),
    ])
  );

  const capturedCount = MEASUREMENT_FIELDS.filter(
    f => measurements[f.key] != null
  ).length;

  return (
    <div className={`w-full max-w-lg mx-auto px-2 ${className}`}>

      {/* ── Success header ─────────────────────────────────────────────────── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-6"
      >
        {/* Animated checkmark */}
        <motion.div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #01454A20, #01454A40)" }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✅
          </motion.span>
        </motion.div>

        <h2 className="text-2xl font-black text-white mb-1">
          Measurements Complete!
        </h2>
        <p className="text-sm text-white/50">
          <span className="font-bold" style={{ color: "#1A6B72" }}>{capturedCount}</span>
          {" "}of {MEASUREMENT_FIELDS.length} measurements captured with AI precision
        </p>
        {scanResult.bmi != null && (
          <p className="text-xs text-white/30 mt-1">
            BMI {scanResult.bmi.toFixed(1)} · BMI correction applied
          </p>
        )}
      </motion.div>

      {/* ── Quality report ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={headerVariants}>
        <QualityReport quality={qualityScore} warnings={warnings} />
      </motion.div>

      {/* ── Measurement cards (staggered reveal) ───────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {zones.map(zone => {
          const fields = byZone[zone];
          if (!fields?.length) return null;

          return (
            <div key={zone}>
              <ZoneHeader zone={zone} />
              <div className="grid grid-cols-2 gap-2">
                {fields.map(field => (
                  <MeasurementCard
                    key={field.key}
                    label={field.label}
                    icon={field.icon}
                    valueCm={measurements[field.key] as number | null}
                    qualityScore={qualityScore}
                    isHeight={field.key === "height"}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Action pair ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex gap-3 mt-8"
      >
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex-1 py-3 rounded-xl border border-[#01454A]/40 text-[#1A6B72] text-sm font-semibold hover:bg-[#01454A]/10 transition-colors"
          >
            🔁 Retake Scan
          </button>
        )}
        <button
          onClick={onViewProfile}
          className="flex-1 py-3 rounded-xl text-[#111111] text-sm font-bold transition-colors"
          style={{ background: "linear-gradient(135deg, #FDA600, #C88500)" }}
          id="find-my-size-btn"
        >
          🛍️ Find My Size
        </button>
      </motion.div>

      {/* ── Privacy note ────────────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center text-xs text-white/25 mt-4 pb-8"
      >
        Measurements saved to your profile · No images stored · GDPR compliant
      </motion.p>
    </div>
  );
}
