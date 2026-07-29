"use client";

/**
 * @file MeasurementReveal.tsx
 * @description Staggered card animation showing measurement results after scan.
 *
 * Groups measurements by zone (Upper / Core / Lower / Full).
 * Shows quality score badge and action buttons.
 */

import { motion } from "framer-motion";
import { formatMeasurement, cmToInch } from "../utils/landmarkToMeasurement";

export interface MeasurementRevealProps {
  scanResult: Record<string, number | null>;
  qualityScore?: number | null;
  onRetake?: () => void;
  onViewProfile?: (profileId?: string | number) => void;
  profileId?: string | number;
  className?: string;
}

const ZONES = [
  {
    label: "Upper Body",
    icon: "🎽",
    fields: [
      { key: "shoulder_width", label: "Shoulder Width" },
      { key: "bust", label: "Bust / Chest" },
      { key: "arm_length", label: "Arm Length" },
      { key: "neck", label: "Neck" },
    ],
  },
  {
    label: "Core",
    icon: "🎯",
    fields: [
      { key: "waist", label: "Waist" },
      { key: "hips", label: "Hips" },
      { key: "wrist", label: "Wrist" },
    ],
  },
  {
    label: "Lower Body",
    icon: "🦵",
    fields: [
      { key: "inseam", label: "Inseam" },
      { key: "thigh", label: "Thigh" },
      { key: "knee", label: "Knee" },
      { key: "ankle", label: "Ankle" },
    ],
  },
  {
    label: "Full Body",
    icon: "📏",
    fields: [{ key: "height", label: "Height" }],
  },
];

export function MeasurementReveal({
  scanResult,
  qualityScore,
  onRetake,
  onViewProfile,
  profileId,
  className = "",
}: MeasurementRevealProps) {
  const confidence = qualityScore != null ? Math.round(qualityScore * 100) : null;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Header + quality badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#01454A]">Your Measurements</h3>
          <p className="text-sm text-[#7A6B44]">14 body measurements extracted</p>
        </div>
        {confidence !== null && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              backgroundColor:
                confidence >= 80 ? "rgba(253,166,0,0.1)" : "rgba(253,166,0,0.05)",
              border: `1px solid rgba(253,166,0,${confidence >= 80 ? 0.2 : 0.1})`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: confidence >= 80 ? "#FDA600" : "#7A6B44" }}
            />
            <span className="text-sm font-bold text-[#FDA600]">{confidence}%</span>
            <span className="text-[10px] text-[#7A6B44]">accuracy</span>
          </div>
        )}
      </div>

      {/* Measurement zones */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ZONES.map((zone, zi) => (
          <motion.div
            key={zone.label}
            className="rounded-2xl border border-[#ECE6D6] bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: zi * 0.15, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{zone.icon}</span>
              <h4 className="text-xs font-semibold text-[#7A6B44] uppercase tracking-wider">
                {zone.label}
              </h4>
            </div>
            <div className="space-y-2">
              {zone.fields.map((field, fi) => {
                const rawCm = scanResult?.[field.key];
                return (
                  <motion.div
                    key={field.key}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: zi * 0.15 + fi * 0.05 + 0.2, duration: 0.3 }}
                  >
                    <span className="text-sm text-[#565960]">{field.label}</span>
                    {rawCm != null ? (
                      <span className="text-sm font-semibold text-[#01454A]">
                        {formatMeasurement(rawCm, "cm")}
                        <span className="text-[#7A6B44] text-xs ml-1">
                          ({cmToInch(rawCm).toFixed(1)}")
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-[#7A6B44]/40">—</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(profileId)}
            className="flex-1 rounded-xl bg-[#01454A] hover:bg-[#016B73] text-white
                       font-semibold text-sm py-3 transition-colors"
          >
            View Full Profile
          </button>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex-1 rounded-xl border border-[#ECE6D6] bg-white text-[#565960]
                       hover:bg-[#F8F5ED] font-semibold text-sm py-3 transition-colors"
          >
            Retake Scan
          </button>
        )}
      </div>
    </div>
  );
}
