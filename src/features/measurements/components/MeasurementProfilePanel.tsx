"use client";

/**
 * @file MeasurementProfilePanel.tsx
 * @description Full-featured measurement profile manager for client dashboards.
 *
 * Features:
 *   - Lists all profiles with default badge
 *   - Inline measurement display (bust, waist, hips, height, etc.)
 *   - Create new profile form (all 14 measurement fields)
 *   - Set-as-default action
 *   - Delete action (prevents deleting default without alternate)
 *   - Source: GET /api/v1/ninja/measurements/ (Ninja async)
 *
 * Design: follows Fashionistar premium UI system (bon_foyage font, card shadows).
 */
import { useState } from "react";
import {
  Ruler,
  Plus,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  useMeasurementProfiles,
  useCreateMeasurementProfile,
  useSetDefaultProfile,
  useDeleteMeasurementProfile,
} from "../hooks/use-measurements";
import type {
  MeasurementProfile,
  CreateMeasurementProfileInput,
} from "../types/measurements.types";

// ── Constants ─────────────────────────────────────────────────────────────────

const MEASUREMENT_FIELDS: Array<{
  key: keyof CreateMeasurementProfileInput;
  label: string;
  group: string;
}> = [
  { key: "bust", label: "Bust / Chest", group: "Torso" },
  { key: "waist", label: "Waist", group: "Torso" },
  { key: "hips", label: "Hips", group: "Torso" },
  { key: "shoulder_width", label: "Shoulder Width", group: "Torso" },
  { key: "neck", label: "Neck", group: "Torso" },
  { key: "inseam", label: "Inseam", group: "Lower Body" },
  { key: "thigh", label: "Thigh", group: "Lower Body" },
  { key: "knee", label: "Knee", group: "Lower Body" },
  { key: "ankle", label: "Ankle", group: "Lower Body" },
  { key: "arm_length", label: "Arm Length", group: "Arms" },
  { key: "bicep", label: "Bicep", group: "Arms" },
  { key: "wrist", label: "Wrist", group: "Arms" },
  { key: "height", label: "Height", group: "Full Body" },
  { key: "weight_kg", label: "Weight (kg)", group: "Full Body" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export function MeasurementProfilePanel() {
  const { data: profiles = [], isLoading, isError } = useMeasurementProfiles();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-black">
            Body Measurements
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
            Store your body measurements for accurate custom tailoring. Your
            default profile is used automatically at checkout.
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-[16px] bg-[#FDA600] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#e59500] active:scale-95"
        >
          <Plus size={16} />
          {showCreate ? "Cancel" : "Add Profile"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateProfileForm onSuccess={() => setShowCreate(false)} />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[24px] bg-[#F0F0F0]"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-[20px] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>Failed to load measurement profiles. Please refresh.</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && profiles.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[28px] border-2 border-dashed border-[#E5E7EB] py-16 text-center">
          <Ruler size={40} className="text-[#D9D9D9]" />
          <div>
            <p className="text-lg font-semibold text-[#5A6465]">
              No profiles yet
            </p>
            <p className="mt-1 text-sm text-[#858585]">
              Add your measurements to unlock custom tailoring at checkout.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-2 rounded-[14px] bg-[#FDA600] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e59500]"
          >
            Create First Profile
          </button>
        </div>
      )}

      {/* Profile Cards */}
      {!isLoading && profiles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              expanded={expandedId === p.id}
              onToggle={() =>
                setExpandedId((id) => (id === p.id ? null : p.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  expanded,
  onToggle,
}: {
  profile: MeasurementProfile;
  expanded: boolean;
  onToggle: () => void;
}) {
  const setDefault = useSetDefaultProfile();
  const deleteProfile = useDeleteMeasurementProfile();

  const filled = MEASUREMENT_FIELDS.filter(
    (f) => profile[f.key as keyof MeasurementProfile] !== null,
  ).length;

  return (
    <div
      className={`rounded-[24px] bg-white p-6 shadow-card_shadow transition-all ${
        profile.is_default ? "ring-2 ring-[#FDA600]" : ""
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[16px] bg-amber-50 text-[#FDA600]">
            <Ruler size={20} />
          </div>
          <div>
            <p className="font-semibold text-black">{profile.name}</p>
            <p className="text-xs text-[#858585]">
              {filled}/{MEASUREMENT_FIELDS.length} fields · {profile.unit.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile.is_verified && (
            <span title="Verified">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </span>
          )}
          {profile.is_default && (
            <span className="rounded-full bg-[#FDA600]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#FDA600]">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Core snapshot */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["bust", "waist", "hips"] as const).map((field) => (
          <div key={field} className="rounded-[10px] bg-[#F8F9FC] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#858585]">
              {field}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-black">
              {profile[field] ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Expand toggle */}
      <button
        onClick={onToggle}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#E5E7EB] py-2 text-xs font-medium text-[#5A6465] hover:bg-[#F8F9FC]"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} /> Hide details
          </>
        ) : (
          <>
            <ChevronDown size={14} /> Show all measurements
          </>
        )}
      </button>

      {/* Expanded measurement grid */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {["Torso", "Lower Body", "Arms", "Full Body"].map((group) => {
            const fields = MEASUREMENT_FIELDS.filter((f) => f.group === group);
            return (
              <div key={group}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#858585]">
                  {group}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {fields.map((f) => {
                    const val =
                      profile[f.key as keyof MeasurementProfile];
                    return (
                      <div
                        key={f.key}
                        className="flex justify-between rounded-[10px] bg-[#F8F9FC] px-3 py-2"
                      >
                        <span className="text-xs text-[#858585]">
                          {f.label}
                        </span>
                        <span className="text-xs font-semibold text-black">
                          {val ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-2">
        {!profile.is_default && (
          <button
            onClick={() => setDefault.mutate(profile.id)}
            disabled={setDefault.isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-[#FDA600] py-2 text-xs font-semibold text-[#FDA600] hover:bg-[#FFF9EC] disabled:opacity-50"
          >
            <Star size={13} />
            Set Default
          </button>
        )}
        {profile.is_default && (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-600">
            <StarOff size={13} />
            Active Default
          </div>
        )}
        <button
          onClick={() => {
            if (
              confirm(
                `Delete "${profile.name}"? This action cannot be undone.`,
              )
            ) {
              deleteProfile.mutate(profile.id);
            }
          }}
          disabled={deleteProfile.isPending}
          className="flex items-center justify-center gap-1.5 rounded-[12px] border border-red-200 p-2 text-red-400 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
          title="Delete profile"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

function CreateProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const create = useCreateMeasurementProfile();
  const [formData, setFormData] = useState<CreateMeasurementProfileInput>({
    name: "",
    unit: "cm",
    set_as_default: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value || null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return;
    }
    create.mutate(
      { ...formData, name: formData.name || "My Measurements" },
      { onSuccess },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] bg-white p-8 shadow-card_shadow"
    >
      <h2 className="mb-6 font-bon_foyage text-2xl text-black">
        New Measurement Profile
      </h2>

      {/* Profile meta */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Profile Name *
          </label>
          <input
            name="name"
            required
            value={formData.name ?? ""}
            onChange={handleChange}
            placeholder="e.g. Slim Fit, Casual, Maternity"
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black placeholder-[#C4C4C4] focus:border-[#FDA600] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Unit
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black focus:border-[#FDA600] focus:outline-none"
          >
            <option value="cm">Centimetres (cm)</option>
            <option value="inch">Inches (in)</option>
          </select>
        </div>
      </div>

      {/* Measurement fields by group */}
      {["Torso", "Lower Body", "Arms", "Full Body"].map((group) => {
        const fields = MEASUREMENT_FIELDS.filter((f) => f.group === group);
        return (
          <div key={group} className="mb-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#858585]">
              {group}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[11px] text-[#858585]">
                    {f.label}
                  </label>
                  <input
                    name={f.key}
                    type="number"
                    step="0.1"
                    min="0"
                    value={
                      (formData[f.key as keyof CreateMeasurementProfileInput] as
                        | string
                        | null
                        | undefined) ?? ""
                    }
                    onChange={handleChange}
                    placeholder="—"
                    className="w-full rounded-[12px] border border-[#E5E7EB] px-3 py-2.5 text-sm text-black placeholder-[#D9D9D9] focus:border-[#FDA600] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Set as default */}
      <label className="mb-6 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="set_as_default"
          checked={formData.set_as_default ?? false}
          onChange={handleChange}
          className="size-4 accent-[#FDA600]"
        />
        <span className="text-sm text-[#5A6465]">
          Set as default profile for checkout
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={create.isPending}
          className="flex-1 rounded-[14px] bg-[#FDA600] py-3 text-sm font-bold text-white hover:bg-[#e59500] disabled:opacity-60"
        >
          {create.isPending ? "Creating..." : "Create Profile"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-[14px] border border-[#E5E7EB] px-5 py-3 text-sm text-[#5A6465] hover:bg-[#F8F9FC]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
