"use client";
/**
 * @file ManualMeasurementModal.tsx
 * @description Modal for manual body measurement input.
 *
 * Lets users type in their measurements (cm or inch) instead of doing an AI scan.
 * On submit, creates a measurement profile via the Ninja API.
 *
 * Brand: Unified ClientShell palette — #01454A, #FDA600, #F4F3EC, #111111
 */

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateMeasurementProfile } from "../hooks/use-measurements";
import type { CreateMeasurementProfileInput } from "../types/measurements.types";

interface ManualMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_GROUPS: { label: string; fields: { key: string; label: string }[] }[] = [
  {
    label: "Full Body",
    fields: [
      { key: "height", label: "Height" },
      { key: "weight_kg", label: "Weight (kg)" },
    ],
  },
  {
    label: "Torso",
    fields: [
      { key: "bust", label: "Bust / Chest" },
      { key: "waist", label: "Waist" },
      { key: "hips", label: "Hips" },
      { key: "shoulder_width", label: "Shoulder Width" },
      { key: "neck", label: "Neck" },
    ],
  },
  {
    label: "Lower Body",
    fields: [
      { key: "inseam", label: "Inseam" },
      { key: "thigh", label: "Thigh" },
      { key: "knee", label: "Knee" },
      { key: "ankle", label: "Ankle" },
    ],
  },
  {
    label: "Arms",
    fields: [
      { key: "arm_length", label: "Arm Length" },
      { key: "bicep", label: "Bicep" },
      { key: "wrist", label: "Wrist" },
    ],
  },
];

const REQUIRED_KEYS = ["height", "waist", "bust"];

export function ManualMeasurementModal({ isOpen, onClose }: ManualMeasurementModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [profileName, setProfileName] = useState("");
  const [touched, setTouched] = useState(false);
  const createProfile = useCreateMeasurementProfile();

  const handleChange = useCallback((key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleClose = useCallback(() => {
    setTouched(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setTouched(true);

    const missingRequired = REQUIRED_KEYS.filter(k =>
      !values[k] || parseFloat(values[k]) <= 0,
    );
    if (missingRequired.length > 0) return;

    const payload: CreateMeasurementProfileInput = {
      name: profileName.trim() || "Manual Entry",
      unit,
      set_as_default: true,
    };

    for (const group of FIELD_GROUPS) {
      for (const field of group.fields) {
        const raw = values[field.key];
        if (raw && parseFloat(raw) > 0) {
          const num = parseFloat(raw);
          (payload as Record<string, string | undefined>)[field.key] =
            unit === "inch" ? String(Math.round(num * 2.54 * 10) / 10) : String(num);
        }
      }
    }

    createProfile.mutate(payload, {
      onSuccess: () => {
        setValues({});
        setProfileName("");
        setTouched(false);
        onClose();
      },
    });
  }, [values, unit, profileName, createProfile, onClose]);

  const missingRequired = REQUIRED_KEYS.filter(k =>
    !values[k] || parseFloat(values[k]) <= 0,
  );
  const showErrors = touched && missingRequired.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#111111]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5"
              style={{
                background: "linear-gradient(145deg, #012226, #111111)",
                border: "1px solid rgba(253,166,0,0.15)",
              }}
              initial={{ y: 60, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 60, scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Manual measurement input"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* Header */}
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(253,166,0,0.12)", border: "1px solid rgba(253,166,0,0.25)" }}
                >
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-xl font-bold text-white">Enter Measurements Manually</h2>
                <p className="text-sm text-white/50 mt-1">
                  Fill in your body measurements — it takes under 2 minutes.
                </p>
              </div>

              {/* Profile name + unit toggle */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. My Measurements"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#FDA600] bg-white/5 border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">
                    Unit
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-white/10">
                    {(["cm", "inch"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className="px-4 py-2.5 text-xs font-semibold transition"
                        style={{
                          backgroundColor: unit === u ? "#01454A" : "transparent",
                          color: unit === u ? "#F4F3EC" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Measurement fields by group */}
              <div className="space-y-4">
                {FIELD_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDA600] mb-2">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.fields.map((field) => {
                        const isRequired = REQUIRED_KEYS.includes(field.key);
                        const hasError = showErrors && isRequired && (!values[field.key] || parseFloat(values[field.key]) <= 0);
                        return (
                          <div key={field.key}>
                            <label className="text-[11px] text-white/60 mb-1 block">
                              {field.label}
                              {isRequired && <span className="text-[#FDA600]"> *</span>}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={values[field.key] ?? ""}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder={unit === "cm" ? "cm" : "in"}
                              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#FDA600] bg-white/5 border transition"
                              style={{
                                borderColor: hasError ? "#DC2626" : "rgba(255,255,255,0.1)",
                              }}
                            />
                            {hasError && (
                              <p className="text-[10px] text-red-400 mt-0.5">Required</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Error summary */}
              {showErrors && (
                <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                  Please fill in the required fields: {missingRequired.join(", ")}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={createProfile.isPending}
                className="w-full rounded-xl font-bold py-3.5 text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FDA600, #C88500)",
                  color: "#111111",
                  boxShadow: "0 4px 20px rgba(253,166,0,0.3)",
                }}
                id="manual-submit-btn"
              >
                {createProfile.isPending ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#111111]/30 border-t-[#111111] animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Measurements →"
                )}
              </button>

              <p className="text-[11px] text-white/30 text-center">
                Your measurements are private and used only for size recommendations
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
