"use client";
/**
 * @file MeasurementEntryModal.tsx
 * @description T-015: Unified entry modal for age/sex/height collection before scan.
 *
 * Collects:
 *   - Age (required) — used for height prediction + backend age correction
 *   - Biological sex (optional) — improves prediction accuracy
 *   - Height (auto-predicted, user can override) — calibration for landmark scaling
 *   - Weight (optional) — enables BMI correction for waist/hip circumference
 *
 * On submit, calls onSubmit with the collected data.
 * The parent component is responsible for routing + scanStore persistence.
 *
 * Design:
 *   - Dark theme (#0F1A14) with Forest Green + Golden Yellow accents
 *   - Framer Motion entrance/exit animations
 *   - Accessible: role="dialog", aria-modal, keyboard accessible
 *   - Height prediction pill with WHO reference range
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHeightPrediction } from "../hooks/useHeightPrediction";
import type { UserSex } from "../store/scanStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeasurementEntryData {
  age: number;
  heightCm: number;
  weightKg?: number;
  sex: UserSex;
}

interface MeasurementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MeasurementEntryData) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementEntryModal({
  isOpen,
  onClose,
  onSubmit,
  className = "",
}: MeasurementEntryModalProps) {
  // Form state
  const [age, setAge]                   = useState("");
  const [sex, setSex]                   = useState<UserSex>("neutral");
  const [heightInput, setHeightInput]   = useState("");
  const [heightUnit, setHeightUnit]     = useState<"cm" | "inch">("cm");
  const [weight, setWeight]             = useState("");
  const [errors, setErrors]             = useState<Record<string, string>>({});

  // Height prediction (debounced)
  const { prediction } = useHeightPrediction(age, sex);

  // Auto-fill height when prediction arrives and user hasn't typed
  useEffect(() => {
    if (prediction && !heightInput) {
      setHeightInput(
        heightUnit === "cm"
          ? String(prediction.predictedCm)
          : String(Math.round(prediction.predictedCm / 2.54)),
      );
    }
  }, [prediction, heightInput, heightUnit]);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const ageNum = parseInt(age, 10);

    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      newErrors.age = "Please enter a valid age (10-100)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const heightNum = parseFloat(heightInput) || prediction?.predictedCm || 170;
    const heightCm  = heightUnit === "inch"
      ? Math.round(heightNum * 2.54 * 10) / 10
      : heightNum;
    const weightKg  = weight ? parseFloat(weight) : undefined;

    onSubmit({ age: ageNum, heightCm, sex, weightKg });
  }, [age, heightInput, heightUnit, weight, sex, prediction, onSubmit]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="entry-modal-backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="entry-modal-panel"
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 ${className}`}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 flex flex-col gap-5"
          style={{
            backgroundColor: "#0F1A14",
            border: "1px solid rgba(45,106,79,0.3)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Body measurement entry"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Header */}
          <div>
            <h2 className="text-white font-bold text-xl">Before Your Scan</h2>
            <p className="text-white/50 text-sm mt-1">
              A few details help our AI give you the most accurate results
            </p>
          </div>

          {/* Age (required) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Your Age <span className="text-[#F4C430]">*</span>
            </label>
            <input
              type="number"
              min={10}
              max={100}
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition outline-none focus:ring-1 focus:ring-[#F4C430]"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-required="true"
            />
            {errors.age && (
              <p className="text-[#DC2626] text-xs">{errors.age}</p>
            )}

            {/* Height prediction pill */}
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(244,196,48,0.08)",
                  border: "1px solid rgba(244,196,48,0.2)",
                  color: "#F4C430",
                }}
              >
                <span>✨</span>
                <span>
                  Estimated height: ~{prediction.predictedCm}cm ({prediction.predictedInch})
                  — range {prediction.rangeLow}-{prediction.rangeHigh}cm
                </span>
              </motion.div>
            )}
          </div>

          {/* Sex (for prediction accuracy) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">Biological Sex</label>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {([
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "neutral", label: "Other" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSex(value)}
                  className="flex-1 py-2 text-xs font-semibold transition"
                  style={{
                    backgroundColor: sex === value ? "#2D6A4F" : "rgba(255,255,255,0.04)",
                    color: sex === value ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Height (auto-filled, optional override) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Your Height{" "}
              <span className="text-white/30 text-xs">(auto-predicted - update if known)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition outline-none focus:ring-1 focus:ring-[#F4C430]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {(["cm", "inch"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setHeightUnit(unit)}
                    className="px-3 py-2 text-xs font-semibold transition"
                    style={{
                      backgroundColor: heightUnit === unit ? "#2D6A4F" : "rgba(255,255,255,0.04)",
                      color: heightUnit === unit ? "#fff" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weight (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Weight (kg){" "}
              <span className="text-white/30 text-xs">(optional - improves waist/hip accuracy)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition outline-none focus:ring-1 focus:ring-[#F4C430]"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!age}
            className="w-full rounded-xl font-semibold py-3.5 text-sm transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: !age ? "rgba(255,255,255,0.08)" : "#F4C430",
              color: !age ? "rgba(255,255,255,0.3)" : "#0A0A0A",
              cursor: !age ? "not-allowed" : "pointer",
            }}
          >
            Continue to Scan →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
