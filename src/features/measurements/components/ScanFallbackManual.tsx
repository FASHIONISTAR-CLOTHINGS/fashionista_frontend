"use client";

/**
 * @file ScanFallbackManual.tsx
 * @description Manual measurement entry fallback.
 *
 * Shown when AI scan fails or user prefers manual entry.
 * Simple form with measurement inputs (cm).
 */

import { useState, useCallback } from "react";

export interface ScanFallbackManualProps {
  variant?: "inline" | "full";
  onSubmit?: (measurements: Record<string, number>) => void;
  onCancel?: () => void;
  className?: string;
}

const FIELDS = [
  { key: "height", label: "Height", placeholder: "175" },
  { key: "shoulder_width", label: "Shoulder Width", placeholder: "45" },
  { key: "bust", label: "Bust / Chest", placeholder: "95" },
  { key: "waist", label: "Waist", placeholder: "80" },
  { key: "hips", label: "Hips", placeholder: "100" },
  { key: "arm_length", label: "Arm Length", placeholder: "65" },
  { key: "inseam", label: "Inseam", placeholder: "80" },
  { key: "thigh", label: "Thigh", placeholder: "55" },
  { key: "neck", label: "Neck", placeholder: "38" },
  { key: "wrist", label: "Wrist", placeholder: "17" },
  { key: "knee", label: "Knee", placeholder: "40" },
  { key: "ankle", label: "Ankle", placeholder: "22" },
];

export function ScanFallbackManual({
  variant = "full",
  onSubmit,
  onCancel,
  className = "",
}: ScanFallbackManualProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    const measurements: Record<string, number> = {};
    for (const field of FIELDS) {
      const val = parseFloat(values[field.key] ?? "");
      if (!isNaN(val) && val > 0) {
        measurements[field.key] = val;
      }
    }
    onSubmit?.(measurements);
  }, [values, onSubmit]);

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FDA600]/15 flex items-center justify-center text-[#FDA600]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[#01454A]">Manual Entry</h3>
          <p className="text-xs text-[#7A6B44]">
            Enter your measurements in centimetres
          </p>
        </div>
      </div>

      {/* Measurement grid */}
      <div className={`grid gap-3 ${variant === "inline" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#565960]">{field.label}</label>
            <div className="relative">
              <input
                type="number"
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full rounded-xl bg-[#F4F3EC] border border-[#ECE6D6] text-[#141414]
                           px-3 py-2 text-sm placeholder:text-[#7A6B44]/40
                           focus:outline-none focus:border-[#FDA600] focus:ring-1 focus:ring-[#FDA600]
                           transition pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A6B44]/50">
                cm
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#ECE6D6] bg-white text-[#565960]
                       hover:bg-[#F8F5ED] font-semibold text-sm py-3 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-xl bg-[#01454A] hover:bg-[#016B73] text-white
                     font-semibold text-sm py-3 transition-colors"
        >
          Submit Manual Measurements
        </button>
      </div>
    </div>
  );
}
