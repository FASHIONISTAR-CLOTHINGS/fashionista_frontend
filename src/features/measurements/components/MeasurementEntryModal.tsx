"use client";

/**
 * @file MeasurementEntryModal.tsx
 * @description Unified modal for collecting age, sex, and height before a scan.
 *
 * T-015: Replaces the fragmented age-only and height-only prompts with a single
 * cohesive modal. The user provides:
 *   - Age (integer, 5–120)
 *   - Sex (male | female | neutral)
 *   - Height (cm, auto-predicted from age via predictHeightCm, editable)
 *
 * On submit, calls onSubmit({ age, sex, heightCm }) and closes.
 */

import { useState, useCallback, useEffect } from "react";
import { Modal } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import { predictHeightCm } from "../utils/predictHeight";

export interface MeasurementEntryData {
  age: number;
  sex: "male" | "female" | "neutral";
  heightCm: number;
}

interface MeasurementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MeasurementEntryData) => void;
  defaultAge?: number;
  defaultSex?: "male" | "female" | "neutral";
  defaultHeightCm?: number;
}

const SEX_OPTIONS: Array<{ value: "male" | "female" | "neutral"; label: string }> = [
  { value: "male",    label: "Male" },
  { value: "female",  label: "Female" },
  { value: "neutral", label: "Prefer not to say" },
];

export function MeasurementEntryModal({
  isOpen,
  onClose,
  onSubmit,
  defaultAge = 25,
  defaultSex = "neutral",
  defaultHeightCm,
}: MeasurementEntryModalProps) {
  const [age, setAge] = useState<string>(String(defaultAge));
  const [sex, setSex] = useState<"male" | "female" | "neutral">(defaultSex);
  const [heightCm, setHeightCm] = useState<string>(
    defaultHeightCm ? String(defaultHeightCm) : String(predictHeightCm(defaultAge)),
  );
  const [error, setError] = useState<string | null>(null);

  // Auto-predict height when age changes (only if user hasn't manually overridden)
  useEffect(() => {
    const predicted = predictHeightCm(parseInt(age, 10) || 25);
    setHeightCm(String(predicted));
  }, [age]);

  const handleSubmit = useCallback(() => {
    const ageNum = parseInt(age, 10);
    const heightNum = parseFloat(heightCm);

    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      setError("Please enter a valid age (5–120).");
      return;
    }
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      setError("Please enter a valid height (100–250 cm).");
      return;
    }

    setError(null);
    onSubmit({ age: ageNum, sex, heightCm: heightNum });
  }, [age, sex, heightCm, onSubmit]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Before We Begin" size="md">
      <div className="flex flex-col gap-5 p-2">
        <p className="text-sm text-[#565960]">
          We need a few details to calibrate your AI body scan accurately.
          Your data is private and never shared.
        </p>

        {/* Age */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entry-age" className="text-xs font-semibold text-[#7A6B44] uppercase tracking-wider">
            Age
          </label>
          <input
            id="entry-age"
            type="number"
            inputMode="numeric"
            min={5}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-12 px-4 text-lg font-semibold bg-white border border-[#ECE6D6] rounded-xl text-[#01454A] focus:outline-none focus:border-[#01454A]/40 transition-colors"
            autoFocus
          />
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#7A6B44] uppercase tracking-wider">
            Biological Sex
          </label>
          <div className="flex gap-2">
            {SEX_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSex(opt.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  sex === opt.value
                    ? "bg-[#01454A] text-white"
                    : "bg-white border border-[#ECE6D6] text-[#565960] hover:bg-[#F8F5ED]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#7A6B44]/70">
            Used for anthropometric ratio selection. Improves measurement accuracy by ~5%.
          </p>
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entry-height" className="text-xs font-semibold text-[#7A6B44] uppercase tracking-wider">
            Height (cm)
          </label>
          <input
            id="entry-height"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={100}
            max={250}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full h-12 px-4 text-lg font-semibold bg-white border border-[#ECE6D6] rounded-xl text-[#01454A] focus:outline-none focus:border-[#01454A]/40 transition-colors"
          />
          <p className="text-[11px] text-[#7A6B44]/70">
            AI-predicted from age. Edit if you know your exact height.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500" role="alert">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Start Scan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
