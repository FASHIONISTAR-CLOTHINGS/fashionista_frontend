"use client";

/**
 * features/measurement/components/MeasurementCard.tsx
 * Dashboard card showing user's measurement profile completion + values.
 *
 * features/measurement/components/BodyDiagram.tsx
 * SVG body outline with measurement hotspots.
 */


import { memo } from "react";
import type { MeasurementProfile, MeasurementCompletionStatus } from "../types/measurements.types";
import { MEASUREMENT_FIELDS } from "../types/measurements.types";

// ── MeasurementCard (T-014: memoized) ──────────────────────────────────────────

interface MeasurementCardProps {
  profile: MeasurementProfile | null;
  onEdit?: () => void;
  onStartScan?: () => void;
  className?: string;
}

function MeasurementCardInner({ profile, onEdit, onStartScan, className = "" }: MeasurementCardProps) {
  const completion = profile?.completionPercent ?? 0;
  const unit = profile?.unit ?? "cm";

  const fields: MeasurementCompletionStatus[] = MEASUREMENT_FIELDS.map((f) => ({
    ...f,
    value: profile ? (profile[f.field] as number | null) : null,
  }));

  const completedFields = fields.filter((f) => f.value !== null);
  const missingRequired = fields.filter((f) => f.isRequired && f.value === null);

  return (
    <div className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
            <span className="text-base">📐</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">My Measurements</h3>
            <p className="text-xs text-brand-gray">{completedFields.length}/{fields.length} fields complete</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onStartScan && (
            <button
              onClick={onStartScan}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green/90 text-white transition-colors"
              id="start-body-scan-btn"
            >
              📷 AI Scan
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white/70 transition-colors"
              id="edit-measurements-btn"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Completion progress */}
      <div className="px-5 py-3 bg-white/3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-brand-gray">Profile Completion</span>
          <span className={`text-xs font-semibold ${completion >= 80 ? "text-brand-gold" : completion >= 50 ? "text-brand-gold/70" : "text-red-400"}`}>
            {completion}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completion >= 80 ? "bg-brand-gold" : completion >= 50 ? "bg-brand-gold/70" : "bg-red-500"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {missingRequired.length > 0 && (
          <p className="text-xs text-brand-gold/70 mt-1.5">
            Missing required: {missingRequired.map((f) => f.label).join(", ")}
          </p>
        )}
      </div>

      {/* Measurements grid */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div
            key={field.field as string}
            className={`rounded-xl p-3 text-center ${
              field.value !== null
                ? "bg-white/6 border border-white/12"
                : field.isRequired
                  ? "bg-red-500/5 border border-red-500/20"
                  : "bg-white/3 border border-white/8"
            }`}
          >
            <div className={`text-base font-bold ${field.value !== null ? "text-white" : "text-brand-gray"}`}>
              {field.value !== null ? `${field.value}${unit}` : "—"}
            </div>
            <div className="text-[10px] text-brand-gray mt-0.5">{field.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// T-014: Memoized export — prevents re-render when parent updates but props are unchanged.
export const MeasurementCard = memo(MeasurementCardInner);
