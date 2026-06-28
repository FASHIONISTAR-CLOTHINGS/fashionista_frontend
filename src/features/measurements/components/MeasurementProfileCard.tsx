"use client";
/**
 * @file MeasurementProfileCard.tsx
 * @description Premium measurement profile card component with CM ↔ INCH toggle.
 *
 * Features:
 * - One-click CM / Inch unit toggle (persisted per session via Zustand)
 * - Live real-time display switch — all values update instantly
 * - Edit overlay — user can manually adjust any measurement
 * - Confidence badge with AI scan indicator
 * - Nigerian tailor-friendly: shows both formats simultaneously in edit mode
 * - Animated transitions between units
 *
 * Storage: All values in DB are stored in centimetres.
 * Display: Converted on the fly via formatMeasurement() helper.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatMeasurement, cmToInch, inchToCm } from "../utils/landmarkToMeasurement";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeasurementUnit = "cm" | "inch";

interface MeasurementField {
  key:   string;
  label: string;
  icon?: string;       // emoji shorthand
  /** Human-readable display group */
  group: "upper" | "lower" | "full";
}

// Ordered field definitions with labels
const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "height",        label: "Height",         icon: "↕",  group: "full"  },
  { key: "shoulder_width",label: "Shoulder Width",  icon: "↔",  group: "upper" },
  { key: "bust",          label: "Bust / Chest",    icon: "○",  group: "upper" },
  { key: "waist",         label: "Waist",           icon: "○",  group: "full"  },
  { key: "hips",          label: "Hips",            icon: "○",  group: "lower" },
  { key: "inseam",        label: "Inseam",          icon: "↕",  group: "lower" },
  { key: "thigh",         label: "Thigh",           icon: "○",  group: "lower" },
  { key: "arm_length",    label: "Arm Length",      icon: "↕",  group: "upper" },
  { key: "torso_length",  label: "Torso Length",    icon: "↕",  group: "upper" },
  { key: "leg_length",    label: "Leg Length",      icon: "↕",  group: "lower" },
];

interface MeasurementProfile {
  id:                       string | number;
  name:                     string;
  is_default:               boolean;
  scan_confidence?:         number | null;
  scan_provider?:           string;
  [key: string]: unknown;   // Dynamic measurement fields
}

interface MeasurementProfileCardProps {
  profile:       MeasurementProfile;
  /** Allow editing via PATCH request. */
  onSave?:       (profileId: string | number, updates: Record<string, number | null>) => Promise<void>;
  className?:    string;
  defaultUnit?:  MeasurementUnit;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementProfileCard({
  profile,
  onSave,
  className,
  defaultUnit = "cm",
}: MeasurementProfileCardProps) {
  const [unit, setUnit]         = useState<MeasurementUnit>(defaultUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // ── Unit toggle ─────────────────────────────────────────────────────────────
  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === "cm" ? "inch" : "cm"));
  }, []);

  // ── Editing helpers ─────────────────────────────────────────────────────────
  const startEditing = useCallback(() => {
    // Pre-fill edit inputs with current displayed values
    const initial: Record<string, string> = {};
    for (const field of MEASUREMENT_FIELDS) {
      const rawCm = profile[field.key] as number | null | undefined;
      if (rawCm !== null && rawCm !== undefined) {
        const displayVal = unit === "inch" ? cmToInch(rawCm) : rawCm;
        initial[field.key] = displayVal.toFixed(1);
      }
    }
    setEditValues(initial);
    setIsEditing(true);
  }, [profile, unit]);

  const handleFieldChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);

    // Convert back to cm for storage
    const updates: Record<string, number | null> = {};
    for (const [key, strVal] of Object.entries(editValues)) {
      const num = parseFloat(strVal);
      if (!isNaN(num) && num > 0) {
        updates[key] = unit === "inch" ? Math.round(inchToCm(num) * 10) / 10 : Math.round(num * 10) / 10;
      }
    }

    try {
      await onSave(profile.id, updates);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [editValues, onSave, profile.id, unit]);

  const confidence = profile.scan_confidence != null
    ? Math.round((profile.scan_confidence as number) * 100)
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={cn(
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden",
      className,
    )}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 border-b border-white/5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{profile.name}</h3>
            {profile.is_default && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20 uppercase tracking-wide">
                Default
              </span>
            )}
          </div>
          {confidence !== null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              AI Scan · {confidence}% accuracy
            </div>
          )}
        </div>

        {/* ── CM / INCH TOGGLE ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <UnitToggle unit={unit} onToggle={toggleUnit} />
          {onSave && (
            <button
              onClick={isEditing ? () => setIsEditing(false) : startEditing}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg transition",
                isEditing
                  ? "bg-white/10 text-white/50"
                  : "bg-white/10 hover:bg-white/20 text-white/70",
              )}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* ── Measurement grid ────────────────────────────────────────────────── */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map((field) => {
          const rawCm  = profile[field.key] as number | null | undefined;
          const hasVal = rawCm !== null && rawCm !== undefined;

          return (
            <MeasurementRow
              key={field.key}
              field={field}
              valueCm={hasVal ? (rawCm as number) : null}
              unit={unit}
              isEditing={isEditing}
              editValue={editValues[field.key] ?? ""}
              onEditChange={(v) => handleFieldChange(field.key, v)}
            />
          );
        })}
      </div>

      {/* ── Save bar (visible in edit mode) ─────────────────────────────────── */}
      {isEditing && (
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 mb-3 text-xs text-amber-300/80">
            Values entered in <strong>{unit}</strong> — stored in cm automatically.
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white
                       font-semibold py-3 hover:from-violet-700 hover:to-purple-700 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* ── Unit note ────────────────────────────────────────────────────────── */}
      {!isEditing && (
        <div className="px-5 pb-4 text-xs text-white/25 text-center">
          Tap <span className="text-white/40 font-medium">cm / in</span> to switch display unit
        </div>
      )}
    </div>
  );
}

// ─── Unit Toggle Button ───────────────────────────────────────────────────────

function UnitToggle({
  unit,
  onToggle,
}: {
  unit: MeasurementUnit;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle measurement unit"
      title={`Switch to ${unit === "cm" ? "inches" : "centimetres"}`}
      className={cn(
        "relative flex rounded-xl overflow-hidden border transition-all duration-200",
        "border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500",
      )}
    >
      {(["cm", "inch"] as const).map((u) => (
        <span
          key={u}
          className={cn(
            "px-3 py-1.5 text-xs font-bold transition-all duration-200 uppercase tracking-wider",
            unit === u
              ? "bg-violet-600 text-white shadow-sm shadow-violet-500/50"
              : "bg-transparent text-white/40 hover:text-white/60",
          )}
        >
          {u === "inch" ? "in" : "cm"}
        </span>
      ))}
    </button>
  );
}

// ─── Measurement Row ──────────────────────────────────────────────────────────

interface MeasurementRowProps {
  field:        MeasurementField;
  valueCm:      number | null;
  unit:         MeasurementUnit;
  isEditing:    boolean;
  editValue:    string;
  onEditChange: (v: string) => void;
}

function MeasurementRow({
  field,
  valueCm,
  unit,
  isEditing,
  editValue,
  onEditChange,
}: MeasurementRowProps) {
  const displayValue = valueCm !== null ? formatMeasurement(valueCm, unit) : "—";

  return (
    <div className={cn(
      "rounded-xl p-3 border transition-all duration-200",
      valueCm !== null
        ? "bg-white/5 border-white/8 hover:border-white/15"
        : "bg-transparent border-white/5 opacity-50",
    )}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-white/30 text-xs w-3 text-center">{field.icon}</span>
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider truncate">
          {field.label}
        </span>
      </div>

      {isEditing ? (
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            step="0.5"
            min="0"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder="—"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm
                       text-white font-semibold focus:outline-none focus:border-violet-500 transition"
          />
          <span className="text-white/30 text-xs flex-shrink-0">
            {unit === "inch" ? "in" : "cm"}
          </span>
        </div>
      ) : (
        <p className={cn(
          "font-semibold text-sm transition-all duration-300",
          valueCm !== null ? "text-white" : "text-white/20",
        )}>
          {displayValue}
        </p>
      )}

      {/* Both units simultaneously when editing — helpful for tailors */}
      {isEditing && editValue && !isNaN(parseFloat(editValue)) && (
        <p className="text-[10px] text-white/25 mt-0.5">
          ≈{" "}
          {unit === "inch"
            ? `${inchToCm(parseFloat(editValue)).toFixed(1)} cm`
            : `${cmToInch(parseFloat(editValue)).toFixed(1)} in`}
        </p>
      )}
    </div>
  );
}

// ─── Export for convenience ───────────────────────────────────────────────────

export type { MeasurementProfile };
