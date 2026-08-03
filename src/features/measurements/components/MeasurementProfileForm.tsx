"use client";

/**
 * @file MeasurementProfileForm.tsx
 * @description Unified measurement profile form for both creation and editing.
 *
 * Mode "create": POSTs to DRF sync surface via useCreateMeasurementProfile.
 * Mode "edit":   PATCHes to DRF sync surface via useUpdateMeasurementProfile.
 *
 * Features:
 *   - All 14 measurement fields grouped by body zone
 *   - Unit toggle (cm / inch) with auto-conversion on submit
 *   - Required field validation (height, waist, bust)
 *   - Profile name + set-as-default (create mode only)
 *   - Pre-fills existing values when editing
 *   - Brand: Unified ClientShell palette — #01454A, #FDA600, #F4F3EC, #111111
 *
 * Architecture:
 *   - Reads:  Ninja async  GET /api/v1/ninja/measurements/{id}/
 *   - Creates: DRF sync    POST /api/v1/measurements/
 *   - Updates: DRF sync    PATCH /api/v1/measurements/{id}/
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  useCreateMeasurementProfile,
  useUpdateMeasurementProfile,
  useDeleteMeasurementProfile,
} from "../hooks/use-measurements";
import type {
  MeasurementProfile,
  CreateMeasurementProfileInput,
  UpdateMeasurementProfileInput,
  MeasurementUnit,
} from "../types/measurements.types";

// ─── Field Groups ─────────────────────────────────────────────────────────────

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

const ALL_FIELD_KEYS = FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeasurementProfileFormProps {
  mode: "create" | "edit";
  profileId?: string | number;
  initialData?: MeasurementProfile | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementProfileForm({
  mode,
  profileId,
  initialData,
}: MeasurementProfileFormProps) {
  const router = useRouter();
  const createProfile = useCreateMeasurementProfile();
  const updateProfile = useUpdateMeasurementProfile(profileId ?? "");
  const deleteProfile = useDeleteMeasurementProfile();

  const [values, setValues] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [profileName, setProfileName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [touched, setTouched] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setProfileName(initialData.name || "");
      setUnit(initialData.unit || "cm");
      const filled: Record<string, string> = {};
      for (const key of ALL_FIELD_KEYS) {
        const val = (initialData as unknown as Record<string, unknown>)[key];
        if (val != null && val !== "") {
          filled[key] = String(val);
        }
      }
      setValues(filled);
    }
  }, [mode, initialData]);

  const handleChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const missingRequired = REQUIRED_KEYS.filter(
    (k) => !values[k] || parseFloat(values[k]) <= 0,
  );
  const showErrors = touched && missingRequired.length > 0;
  const isPending = mode === "create" ? createProfile.isPending : updateProfile.isPending;

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (missingRequired.length > 0) return;

    const buildPayload = (): Record<string, string | undefined> => {
      const payload: Record<string, string | undefined> = {};
      for (const group of FIELD_GROUPS) {
        for (const field of group.fields) {
          const raw = values[field.key];
          if (raw && parseFloat(raw) > 0) {
            const num = parseFloat(raw);
            payload[field.key] =
              unit === "inch" ? String(Math.round(num * 2.54 * 10) / 10) : String(num);
          }
        }
      }
      return payload;
    };

    if (mode === "create") {
      const payload: CreateMeasurementProfileInput = {
        name: profileName.trim() || "Manual Entry",
        unit,
        set_as_default: setAsDefault,
        ...buildPayload(),
      };
      createProfile.mutate(payload, {
        onSuccess: () => router.push("/client/dashboard/measurements"),
      });
    } else {
      const payload: UpdateMeasurementProfileInput = {
        name: profileName.trim() || undefined,
        unit,
        ...buildPayload(),
      };
      updateProfile.mutate(payload, {
        onSuccess: () => router.push("/client/dashboard/measurements"),
      });
    }
  }, [values, unit, profileName, setAsDefault, mode, createProfile, updateProfile, router, missingRequired]);

  const handleDelete = useCallback(() => {
    if (!profileId) return;
    if (confirm(`Delete "${profileName || "this profile"}"? This action cannot be undone.`)) {
      deleteProfile.mutate(profileId, {
        onSuccess: () => router.push("/client/dashboard/measurements"),
      });
    }
  }, [profileId, profileName, deleteProfile, router]);

  const title = mode === "create" ? "Create Measurement Profile" : "Edit Measurement Profile";
  const subtitle =
    mode === "create"
      ? "Fill in your body measurements — it takes under 2 minutes."
      : "Update your measurements below. Changes are saved instantly.";
  const submitLabel = mode === "create" ? "Create Profile →" : "Save Changes →";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/client/dashboard/measurements")}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Measurements
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(145deg, #012226, #111111)",
            border: "1px solid rgba(253,166,0,0.15)",
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(253,166,0,0.12)", border: "1px solid rgba(253,166,0,0.25)" }}
            >
              <span className="text-2xl">{mode === "create" ? "📋" : "✏️"}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-sm text-white/50 mt-1">{subtitle}</p>
          </div>

          {/* Profile name + unit toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-6">
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
          <div className="space-y-5 mb-6">
            {FIELD_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDA600] mb-2">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.fields.map((field) => {
                    const isRequired = REQUIRED_KEYS.includes(field.key);
                    const hasError =
                      showErrors &&
                      isRequired &&
                      (!values[field.key] || parseFloat(values[field.key]) <= 0);
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
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20 mb-4">
              Please fill in the required fields: {missingRequired.join(", ")}
            </div>
          )}

          {/* Set as default — create mode only */}
          {mode === "create" && (
            <label className="flex cursor-pointer items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="size-4 accent-[#FDA600]"
              />
              <span className="text-sm text-white/60">
                Set as default profile for checkout
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 rounded-xl font-bold py-3.5 text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #FDA600, #C88500)",
                color: "#111111",
                boxShadow: "0 4px 20px rgba(253,166,0,0.3)",
              }}
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#111111]/30 border-t-[#111111] animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {submitLabel}
                </>
              )}
            </button>

            {mode === "edit" && (
              <button
                onClick={handleDelete}
                disabled={deleteProfile.isPending}
                className="rounded-xl border border-red-500/30 text-red-400 px-5 py-3.5 text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>

          <p className="text-[11px] text-white/30 text-center mt-4">
            Your measurements are private and used only for size recommendations
          </p>
        </motion.div>
      </div>
    </div>
  );
}
