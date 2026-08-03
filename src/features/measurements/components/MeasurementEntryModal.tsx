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
 * AI Height Prediction:
 *   - Client-side: instant prediction via predictHeightCm (WHO table)
 *   - Backend API: richer prediction via /api/v1/ninja/ai/height-predict/
 *   - "Let our AI predict your height" button triggers backend call
 *   - Modal stays open; predicted height auto-fills the height field
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
import { predictHeightCm } from "../utils/predictHeight";
import { predictHeight as predictHeightApi } from "../api/scan.api";
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

// ─── Prediction result shape (unified from client + backend) ──────────────────

interface PredictionResult {
  predictedCm:   number;
  predictedInch: string;
  rangeLow:      number;
  rangeHigh:     number;
  confidence:    string;
  source:        "client" | "backend";
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

  // Prediction state
  const [prediction, setPrediction]         = useState<PredictionResult | null>(null);
  const [isAiPredicting, setIsAiPredicting] = useState(false);
  const [aiPredictError, setAiPredictError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Client-side height prediction (instant, debounced) ─────────────────────
  useEffect(() => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrediction(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const base = predictHeightCm(ageNum);
      const adjusted = sex === "male" ? base + 5 : sex === "female" ? base - 5 : base;
      const predictedCm = Math.round(adjusted);
      setPrediction({
        predictedCm,
        predictedInch: `${(predictedCm / 2.54).toFixed(1)}"`,
        rangeLow:  predictedCm - 8,
        rangeHigh: predictedCm + 8,
        confidence: "moderate",
        source: "client",
      });
      // Auto-fill height if user hasn't entered it yet
      if (!heightInput) {
        setHeightInput(
          heightUnit === "cm"
            ? String(predictedCm)
            : String(Math.round(predictedCm / 2.54)),
        );
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, sex, heightUnit]);

  // ── AI (backend) height prediction ──────────────────────────────────────────
  const handleAiPredictHeight = useCallback(async () => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setErrors({ age: "Please enter a valid age first (10-100)" });
      return;
    }

    setIsAiPredicting(true);
    setAiPredictError(null);

    try {
      const result = await predictHeightApi(ageNum, sex);
      const pred: PredictionResult = {
        predictedCm:   result.predicted_cm,
        predictedInch: result.predicted_inch,
        rangeLow:      result.range_low_cm,
        rangeHigh:     result.range_high_cm,
        confidence:    result.confidence,
        source: "backend",
      };
      setPrediction(pred);
      // Auto-fill height field with AI prediction
      setHeightInput(
        heightUnit === "cm"
          ? String(result.predicted_cm)
          : String(Math.round(result.predicted_cm / 2.54)),
      );
    } catch {
      // Fallback: use client-side prediction
      const base = predictHeightCm(ageNum);
      const adjusted = sex === "male" ? base + 5 : sex === "female" ? base - 5 : base;
      const predictedCm = Math.round(adjusted);
      setPrediction({
        predictedCm,
        predictedInch: `${(predictedCm / 2.54).toFixed(1)}"`,
        rangeLow:  predictedCm - 8,
        rangeHigh: predictedCm + 8,
        confidence: "low",
        source: "client",
      });
      setAiPredictError("AI prediction unavailable — using local estimate.");
      setHeightInput(
        heightUnit === "cm"
          ? String(predictedCm)
          : String(Math.round(predictedCm / 2.54)),
      );
    } finally {
      setIsAiPredicting(false);
    }
  }, [age, sex, heightUnit]);

  // ── Validate + submit ───────────────────────────────────────────────────────
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
        className="fixed inset-0 z-40 bg-[var(--BV-ink)]/40 backdrop-blur-sm"
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
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 flex flex-col gap-5 bg-[var(--BV-cream)] border border-[var(--BV-cream-dark)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Body measurement entry"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--BV-muted)] hover:text-[var(--BV-ink)] transition text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Header */}
          <div>
            <h2 className="text-[var(--BV-ink)] font-bold text-xl">Before Your Scan</h2>
            <p className="text-[var(--BV-slate)] text-sm mt-1">
              A few details help our AI give you the most accurate results
            </p>
          </div>

          {/* Age (required) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--BV-ink)]">
              Your Age <span className="text-[var(--BV-gold)]">*</span>
            </label>
            <input
              type="number"
              min={10}
              max={100}
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[var(--BV-ink)] placeholder:text-[var(--BV-muted)] outline-none focus:ring-1 focus:ring-[var(--BV-gold)] bg-[var(--BV-surface)] border border-[var(--BV-cream-dark)]"
              aria-required="true"
            />
            {errors.age && (
              <p className="text-[var(--BV-red-alert)] text-xs">{errors.age}</p>
            )}

            {/* Height prediction pill */}
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-2 rounded-lg text-xs flex items-center gap-2 bg-[var(--BV-gold)]/8 border border-[var(--BV-gold)]/20 text-[var(--BV-gold-dark)]"
              >
                <span>{prediction.source === "backend" ? "🤖" : "✨"}</span>
                <span>
                  Estimated height: ~{prediction.predictedCm}cm ({prediction.predictedInch})
                  — range {prediction.rangeLow}–{prediction.rangeHigh}cm
                  {prediction.source === "backend" && ` (${prediction.confidence} confidence)`}
                </span>
              </motion.div>
            )}
          </div>

          {/* Sex (for prediction accuracy) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--BV-ink)]">Biological Sex</label>
            <div className="flex rounded-xl overflow-hidden border border-[var(--BV-cream-dark)]">
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
                    backgroundColor: sex === value ? "var(--BV-green)" : "var(--BV-surface)",
                    color: sex === value ? "var(--BV-cream)" : "var(--BV-slate)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Height (auto-filled, optional override) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--BV-ink)]">
              Your Height{" "}
              <span className="text-[var(--BV-muted)] text-xs">(auto-predicted — update if known)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-[var(--BV-ink)] placeholder:text-[var(--BV-muted)] outline-none focus:ring-1 focus:ring-[var(--BV-gold)] bg-[var(--BV-surface)] border border-[var(--BV-cream-dark)]"
              />
              <div className="flex rounded-xl overflow-hidden border border-[var(--BV-cream-dark)]">
                {(["cm", "inch"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setHeightUnit(unit)}
                    className="px-3 py-2 text-xs font-semibold transition"
                    style={{
                      backgroundColor: heightUnit === unit ? "var(--BV-green)" : "var(--BV-surface)",
                      color: heightUnit === unit ? "var(--BV-cream)" : "var(--BV-slate)",
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Predict Height CTA */}
            <div className="mt-1">
              <p className="text-xs text-[var(--BV-muted)] mb-2">
                Not sure of your height? Let our AI predict it using your age inputted above.
              </p>
              <button
                onClick={handleAiPredictHeight}
                disabled={isAiPredicting || !age}
                className="w-full rounded-xl border border-[var(--BV-green)]/40 bg-[var(--BV-green)]/10 text-[var(--BV-green)] text-xs font-semibold py-2.5 transition-all hover:bg-[var(--BV-green)]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAiPredicting ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-[var(--BV-green)]/30 border-t-[var(--BV-green)] animate-spin" />
                    AI is estimating your height...
                  </>
                ) : (
                  <>
                    🤖 Let AI predict my height
                  </>
                )}
              </button>
              {aiPredictError && (
                <p className="text-[var(--BV-gold)] text-[10px] mt-1">{aiPredictError}</p>
              )}
            </div>
          </div>

          {/* Weight (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--BV-ink)]">
              Weight (kg){" "}
              <span className="text-[var(--BV-muted)] text-xs">(optional — improves waist/hip accuracy)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[var(--BV-ink)] placeholder:text-[var(--BV-muted)] outline-none focus:ring-1 focus:ring-[var(--BV-gold)] bg-[var(--BV-surface)] border border-[var(--BV-cream-dark)]"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!age}
            className="w-full rounded-xl font-semibold py-3.5 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !age ? "var(--BV-surface)" : "var(--BV-gold)",
              color: !age ? "var(--BV-muted)" : "var(--BV-ink)",
            }}
          >
            Continue to Scan →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
