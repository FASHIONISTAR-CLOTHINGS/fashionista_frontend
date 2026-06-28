"use client";
/**
 * @file ScanResultCard.tsx
 * @description Displays extracted body measurements after a successful AI scan.
 *
 * Shows:
 * - All extracted measurements in a grid (with CM/Inch toggle inherited from parent)
 * - Per-field confidence indicators
 * - AI scan accuracy badge
 * - Quick-edit inline (for tailors to adjust values)
 * - "Share with tailor" copy button (formats measurements as readable text)
 *
 * Uses MeasurementProfileCard internally for the full measurement grid.
 */

import { useState } from "react";
import { MeasurementProfileCard } from "./MeasurementProfileCard";
import { formatMeasurement } from "../utils/landmarkToMeasurement";
import { cn } from "@/lib/utils";
import type { MeasurementUnit } from "./MeasurementProfileCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanResult {
  session_id:              string;
  measurement_profile_id:  string | number | null;
  scan_confidence:         number | null;
  extracted_measurements:  Record<string, number | null>;
  error_message?:          string;
}

interface ScanResultCardProps {
  result:      ScanResult;
  onSaveEdit?: (profileId: string | number, updates: Record<string, number | null>) => Promise<void>;
  className?:  string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScanResultCard({ result, onSaveEdit, className }: ScanResultCardProps) {
  const [unit, setUnit]       = useState<MeasurementUnit>("cm");
  const [copied, setCopied]   = useState(false);

  const confidence = result.scan_confidence != null
    ? Math.round(result.scan_confidence * 100)
    : null;

  const handleCopyForTailor = async () => {
    const lines: string[] = [
      `FASHIONISTAR Body Measurements`,
      `Scan Accuracy: ${confidence ?? "N/A"}%`,
      `Unit: ${unit}`,
      ``,
    ];

    const fieldLabels: Record<string, string> = {
      height:         "Height",
      shoulder_width: "Shoulder Width",
      bust:           "Bust / Chest",
      waist:          "Waist",
      hips:           "Hips",
      inseam:         "Inseam",
      thigh:          "Thigh",
      arm_length:     "Arm Length",
    };

    for (const [key, label] of Object.entries(fieldLabels)) {
      const rawCm = result.extracted_measurements?.[key];
      if (rawCm !== null && rawCm !== undefined) {
        lines.push(`${label}: ${formatMeasurement(rawCm, unit)}`);
      }
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-HTTPS
      console.log(lines.join("\n"));
    }
  };

  // Build profile-compatible shape for MeasurementProfileCard
  const profileForDisplay = {
    id:              result.measurement_profile_id ?? "scan-preview",
    name:            "AI Scan Results",
    is_default:      false,
    scan_confidence: result.scan_confidence,
    scan_provider:   "ai_camera",
    ...(result.extracted_measurements || {}),
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Accuracy banner ── */}
      {confidence !== null && (
        <div className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border",
          confidence >= 80
            ? "bg-green-500/10 border-green-500/20"
            : confidence >= 60
            ? "bg-amber-500/10 border-amber-500/20"
            : "bg-red-500/10 border-red-500/20",
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              confidence >= 80 ? "bg-green-400" : confidence >= 60 ? "bg-amber-400" : "bg-red-400"
            )} />
            <span className="text-sm font-medium text-white/80">
              Scan Accuracy
            </span>
          </div>
          <div className="text-right">
            <span className={cn(
              "text-lg font-bold",
              confidence >= 80 ? "text-green-400" : confidence >= 60 ? "text-amber-400" : "text-red-400",
            )}>
              {confidence}%
            </span>
            <p className="text-[10px] text-white/30">
              {confidence >= 80
                ? "Excellent"
                : confidence >= 60
                ? "Good — refine manually if needed"
                : "Low — consider re-scanning"}
            </p>
          </div>
        </div>
      )}

      {/* ── Measurement grid (reuses MeasurementProfileCard) ── */}
      <MeasurementProfileCard
        profile={profileForDisplay as any}
        onSave={onSaveEdit && result.measurement_profile_id
          ? (id, updates) => onSaveEdit(id, updates)
          : undefined
        }
        defaultUnit={unit}
      />

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyForTailor}
          className={cn(
            "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2",
            copied
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          {copied ? (
            <>✓ Copied for tailor</>
          ) : (
            <>📋 Share with tailor</>
          )}
        </button>
      </div>

      {/* ── Tailor note ── */}
      <p className="text-[11px] text-white/25 text-center">
        Measurements stored in cm. Use the toggle to share in inches with tailors who use imperial units.
      </p>
    </div>
  );
}
