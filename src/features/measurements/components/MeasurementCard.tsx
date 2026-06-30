"use client";

/**
 * features/measurement/components/MeasurementCard.tsx
 * Dashboard card showing user's measurement profile completion + values.
 *
 * features/measurement/components/BodyDiagram.tsx
 * SVG body outline with measurement hotspots.
 */


import type { MeasurementProfile, MeasurementCompletionStatus } from "../types/measurements.types";
import { MEASUREMENT_FIELDS } from "../types/measurements.types";

// ── MeasurementCard ──────────────────────────────────────────────────────────

interface MeasurementCardProps {
  profile: MeasurementProfile | null;
  onEdit?: () => void;
  onStartScan?: () => void;
  className?: string;
}

export function MeasurementCard({ profile, onEdit, onStartScan, className = "" }: MeasurementCardProps) {
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
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <span className="text-base">📐</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">My Measurements</h3>
            <p className="text-xs text-slate-400">{completedFields.length}/{fields.length} fields complete</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onStartScan && (
            <button
              onClick={onStartScan}
              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              id="start-body-scan-btn"
            >
              📷 AI Scan
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-slate-300 transition-colors"
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
          <span className="text-xs text-slate-400">Profile Completion</span>
          <span className={`text-xs font-semibold ${completion >= 80 ? "text-emerald-400" : completion >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {completion}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completion >= 80 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {missingRequired.length > 0 && (
          <p className="text-xs text-amber-400/70 mt-1.5">
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
            <div className={`text-base font-bold ${field.value !== null ? "text-white" : "text-slate-600"}`}>
              {field.value !== null ? `${field.value}${unit}` : "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{field.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BodyDiagram ──────────────────────────────────────────────────────────────

interface BodyDiagramProps {
  profile: MeasurementProfile | null;
  highlightField?: string;
  className?: string;
}

export function BodyDiagram({ profile, highlightField, className = "" }: BodyDiagramProps) {
  const hasValue = (field: keyof MeasurementProfile) =>
    profile && profile[field] !== null && profile[field] !== undefined;

  const hotspotClass = (field: keyof MeasurementProfile) =>
    hasValue(field)
      ? "fill-emerald-500/70 stroke-emerald-400"
      : "fill-slate-700/50 stroke-slate-600";

  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-label="Body measurement diagram">
      <svg viewBox="0 0 200 400" className="w-full max-w-[180px] h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body silhouette */}
        <g stroke="white" strokeOpacity="0.15" strokeWidth="1" fill="white" fillOpacity="0.04">
          {/* Head */}
          <circle cx="100" cy="40" r="25" />
          {/* Neck */}
          <rect x="90" y="63" width="20" height="20" rx="4" />
          {/* Torso */}
          <path d="M65 83 Q55 100 58 150 L142 150 Q145 100 135 83 Q120 75 100 75 Q80 75 65 83Z" />
          {/* Hips */}
          <path d="M58 150 Q50 170 55 200 L145 200 Q150 170 142 150Z" />
          {/* Left arm */}
          <path d="M65 83 Q45 100 40 160 Q42 165 50 160 Q55 110 70 95Z" />
          {/* Right arm */}
          <path d="M135 83 Q155 100 160 160 Q158 165 150 160 Q145 110 130 95Z" />
          {/* Left leg */}
          <path d="M60 200 Q55 260 58 330 Q62 340 72 338 Q78 270 80 200Z" />
          {/* Right leg */}
          <path d="M120 200 Q122 270 128 338 Q138 340 142 330 Q145 260 140 200Z" />
        </g>

        {/* Measurement hotspots */}
        {/* Chest */}
        <circle cx="100" cy="108" r="10" className={hotspotClass("chest")} strokeWidth="1.5"
          opacity={highlightField === "chest" ? 1 : 0.8} />
        <text x="100" y="111" textAnchor="middle" fontSize="6" fill="white" fillOpacity="0.8">Chest</text>

        {/* Waist */}
        <circle cx="100" cy="138" r="10" className={hotspotClass("waist")} strokeWidth="1.5"
          opacity={highlightField === "waist" ? 1 : 0.8} />
        <text x="100" y="141" textAnchor="middle" fontSize="6" fill="white" fillOpacity="0.8">Waist</text>

        {/* Hips */}
        <circle cx="100" cy="168" r="10" className={hotspotClass("hips")} strokeWidth="1.5"
          opacity={highlightField === "hips" ? 1 : 0.8} />
        <text x="100" y="171" textAnchor="middle" fontSize="6" fill="white" fillOpacity="0.8">Hips</text>

        {/* Shoulder */}
        <circle cx="70" cy="86" r="7" className={hotspotClass("shoulderWidth")} strokeWidth="1.5"
          opacity={highlightField === "shoulderWidth" ? 1 : 0.8} />
        <circle cx="130" cy="86" r="7" className={hotspotClass("shoulderWidth")} strokeWidth="1.5"
          opacity={highlightField === "shoulderWidth" ? 1 : 0.8} />

        {/* Neck */}
        <circle cx="100" cy="68" r="6" className={hotspotClass("neck")} strokeWidth="1.5" />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />Measured
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-600" />Missing
        </span>
      </div>
    </div>
  );
}
