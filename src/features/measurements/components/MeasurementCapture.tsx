"use client";

/**
 * features/measurements/components/MeasurementCapture.tsx
 * Step-by-step body measurement capture UI.
 * Guides the user through entering 9 measurements with visual aids.
 * Integrates: POST /api/v1/ninja/measurements/ → MeasurementProfile
 */

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { Button, Card } from "@/shared/ui";

// ── Measurement step definitions ───────────────────────────────────────────────

interface MeasurementStep {
  key: string;
  label: string;
  unit: "cm" | "kg";
  icon: string;
  instruction: string;
  diagram?: string;
  min: number;
  max: number;
  required: boolean;
}

const STEPS: MeasurementStep[] = [
  {
    key: "height_cm",
    label: "Height",
    unit: "cm",
    icon: "📏",
    instruction: "Stand straight against a wall. Measure from floor to top of head.",
    min: 100,
    max: 250,
    required: true,
  },
  {
    key: "weight_kg",
    label: "Weight",
    unit: "kg",
    icon: "⚖️",
    instruction: "Use a scale on a flat surface, without shoes.",
    min: 30,
    max: 300,
    required: false,
  },
  {
    key: "chest_circumference_cm",
    label: "Chest",
    unit: "cm",
    icon: "👕",
    instruction: "Measure around the fullest part of your chest, keeping the tape level.",
    min: 50,
    max: 200,
    required: true,
  },
  {
    key: "waist_circumference_cm",
    label: "Waist",
    unit: "cm",
    icon: "📐",
    instruction: "Measure around your natural waist — the narrowest part.",
    min: 40,
    max: 200,
    required: true,
  },
  {
    key: "hip_circumference_cm",
    label: "Hips",
    unit: "cm",
    icon: "👖",
    instruction: "Measure around the fullest part of your hips and buttocks.",
    min: 60,
    max: 200,
    required: true,
  },
  {
    key: "shoulder_width_cm",
    label: "Shoulders",
    unit: "cm",
    icon: "🎽",
    instruction: "Measure from shoulder tip to shoulder tip across your back.",
    min: 25,
    max: 80,
    required: false,
  },
  {
    key: "sleeve_length_cm",
    label: "Sleeve Length",
    unit: "cm",
    icon: "🧥",
    instruction: "From shoulder tip to wrist with arm slightly bent.",
    min: 40,
    max: 100,
    required: false,
  },
  {
    key: "inseam_length_cm",
    label: "Inseam",
    unit: "cm",
    icon: "👟",
    instruction: "From crotch to ankle on the inside of the leg.",
    min: 50,
    max: 120,
    required: false,
  },
  {
    key: "neck_circumference_cm",
    label: "Neck",
    unit: "cm",
    icon: "🔵",
    instruction: "Around the base of the neck where a collar sits.",
    min: 25,
    max: 60,
    required: false,
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface MeasurementCaptureProps {
  profileName?: string;
  onComplete: (profileId: string) => void;
  onCancel?: () => void;
}

type MeasurementValues = Partial<Record<string, string>>;

// ── Component ─────────────────────────────────────────────────────────────────

export function MeasurementCapture({ profileName = "My Measurements", onComplete, onCancel }: MeasurementCaptureProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<MeasurementValues>({});
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = Math.round(((currentStep) / totalSteps) * 100);

  const validateStep = useCallback((): boolean => {
    if (!step.required && !inputValue) return true;
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setError(`Please enter a valid number.`);
      return false;
    }
    if (num < step.min || num > step.max) {
      setError(`Valid range: ${step.min}–${step.max} ${step.unit}`);
      return false;
    }
    return true;
  }, [inputValue, step]);

  const handleNext = () => {
    setError(null);
    if (!validateStep()) return;

    const newValues: MeasurementValues = { ...values };
    if (inputValue) newValues[step.key] = inputValue;

    setValues(newValues);
    setInputValue(newValues[STEPS[currentStep + 1]?.key ?? ""] ?? "");

    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      submitMeasurements(newValues);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) { onCancel?.(); return; }
    setError(null);
    setCurrentStep((s) => s - 1);
    setInputValue(values[STEPS[currentStep - 1].key] ?? "");
  };

  const handleSkip = () => {
    setError(null);
    const newValues = { ...values };
    delete newValues[step.key];
    setValues(newValues);
    setCurrentStep((s) => s + 1);
    setInputValue(values[STEPS[currentStep + 1]?.key ?? ""] ?? "");
  };

  const { mutate: submitMeasurements, isPending } = useMutation({
    mutationFn: async (finalValues: MeasurementValues) => {
      const payload: Record<string, unknown> = {
        profile_name: profileName,
      };
      Object.entries(finalValues).forEach(([k, v]) => {
        if (v) payload[k] = parseFloat(v);
      });

      const data = await ky.post("/api/v1/ninja/measurements/", {
        json: payload,
      }).json<{ id: string }>();
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["measurements"] });
      onComplete(data.id);
    },
    onError: () => {
      setError("Failed to save measurements. Please try again.");
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Saving your measurements…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <Card glass className="p-6 space-y-5">
        {/* Icon + label */}
        <div className="text-center">
          <div className="text-5xl mb-3">{step.icon}</div>
          <h3 className="text-lg font-bold text-white">{step.label}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
            {step.instruction}
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={step.min}
              max={step.max}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder={`${step.min}–${step.max}`}
              className="w-36 h-14 text-center text-2xl font-bold bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:bg-white/12 transition-all tabular-nums"
              id={`measurement-input-${step.key}`}
              autoFocus
            />
            <span className="text-sm font-medium text-slate-400">{step.unit}</span>
          </div>

          {error && (
            <p className="text-xs text-red-400" role="alert">{error}</p>
          )}

          {!step.required && (
            <p className="text-[10px] text-slate-500">Optional — you can skip this</p>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleBack} className="flex-1" id="measurement-back-btn">
          {currentStep === 0 ? "Cancel" : "← Back"}
        </Button>
        {!step.required && (
          <Button variant="ghost" onClick={handleSkip} className="flex-1" id="measurement-skip-btn">
            Skip
          </Button>
        )}
        <Button onClick={handleNext} className="flex-1" id="measurement-next-btn">
          {currentStep === totalSteps - 1 ? "Save Measurements ✓" : "Next →"}
        </Button>
      </div>

      {/* Steps overview */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentStep
                ? "bg-emerald-400"
                : i === currentStep
                ? "bg-amber-400 scale-125"
                : "bg-white/15"
            }`}
            title={s.label}
          />
        ))}
      </div>
    </div>
  );
}
