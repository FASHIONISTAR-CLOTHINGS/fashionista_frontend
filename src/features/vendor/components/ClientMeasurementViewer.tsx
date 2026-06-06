"use client";

/**
 * features/vendor/components/ClientMeasurementViewer.tsx
 * Allows a vendor/tailor to view a shared client measurement profile.
 * The URL contains the share token from MeasurementShareToken.
 * API: GET /api/v1/ninja/measurements/shared/{token}/
 */

import React, { useEffect, useState } from "react";
import ky from "ky";
import { Card, Badge, LoadingSpinner, EmptyState } from "@/shared/ui";

interface SharedMeasurement {
  token: string;
  client_display_name: string;
  consent_granted: boolean;
  expires_at: string;
  profile: {
    id: string;
    profile_name: string;
    height_cm: number;
    weight_kg?: number;
    chest_circumference_cm?: number;
    waist_circumference_cm?: number;
    hip_circumference_cm?: number;
    shoulder_width_cm?: number;
    sleeve_length_cm?: number;
    inseam_length_cm?: number;
    neck_circumference_cm?: number;
    body_type?: string;
    notes?: string;
  };
}

interface MeasurementField {
  label: string;
  key: keyof SharedMeasurement["profile"];
  unit: string;
  icon: string;
}

const MEASUREMENT_FIELDS: MeasurementField[] = [
  { label: "Height",      key: "height_cm",                icon: "📏", unit: "cm" },
  { label: "Weight",      key: "weight_kg",                icon: "⚖️", unit: "kg" },
  { label: "Chest",       key: "chest_circumference_cm",   icon: "👕", unit: "cm" },
  { label: "Waist",       key: "waist_circumference_cm",   icon: "📐", unit: "cm" },
  { label: "Hips",        key: "hip_circumference_cm",     icon: "👖", unit: "cm" },
  { label: "Shoulders",   key: "shoulder_width_cm",        icon: "🎽", unit: "cm" },
  { label: "Sleeve",      key: "sleeve_length_cm",         icon: "🧥", unit: "cm" },
  { label: "Inseam",      key: "inseam_length_cm",         icon: "👟", unit: "cm" },
  { label: "Neck",        key: "neck_circumference_cm",    icon: "🔵", unit: "cm" },
];

interface ClientMeasurementViewerProps {
  shareToken: string;
}

export function ClientMeasurementViewer({ shareToken }: ClientMeasurementViewerProps) {
  const [data, setData] = useState<SharedMeasurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    ky.get(`/api/v1/ninja/measurements/shared/${shareToken}/`)
      .json<SharedMeasurement>()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.status === 410
              ? "This measurement link has expired."
              : err?.response?.status === 404
              ? "Invalid or revoked share link."
              : "Could not load measurements.",
          );
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [shareToken]);

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <EmptyState
      icon="🔒"
      title="Cannot Load Measurements"
      description={error}
    />
  );

  if (!data) return null;

  const { profile } = data;
  const isExpired = new Date(data.expires_at) < new Date();
  const bodyTypeLabels: Record<string, string> = {
    hourglass: "Hourglass", pear: "Pear", apple: "Apple",
    rectangle: "Rectangle", inverted_triangle: "Inverted Triangle",
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <Card glass className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {data.client_display_name}&apos;s Measurements
            </h2>
            <p className="text-xs text-slate-400 mt-1">{profile.profile_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isExpired ? (
              <Badge color="danger" size="sm">Expired</Badge>
            ) : (
              <Badge color="success" size="sm">Active</Badge>
            )}
            <p className="text-[10px] text-slate-500">
              Expires {new Date(data.expires_at).toLocaleDateString("en-NG")}
            </p>
          </div>
        </div>

        {/* Body type */}
        {profile.body_type && (
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2">
            <span className="text-sm">🧍</span>
            <span className="text-xs text-slate-400">Body type:</span>
            <Badge color="info" size="xs">{bodyTypeLabels[profile.body_type] ?? profile.body_type}</Badge>
          </div>
        )}
      </Card>

      {/* Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MEASUREMENT_FIELDS.map(({ label, key, unit, icon }) => {
          const val = profile[key];
          if (val === null || val === undefined) return null;
          return (
            <Card key={key} glass className="p-4">
              <div className="flex items-start justify-between">
                <span className="text-xl">{icon}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">{unit}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{Number(val).toFixed(1)}</span>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Notes */}
      {profile.notes && (
        <Card glass className="p-4">
          <p className="text-xs font-semibold text-slate-300 mb-2">Tailor Notes</p>
          <p className="text-sm text-slate-400 leading-relaxed">{profile.notes}</p>
        </Card>
      )}

      {/* GDPR notice */}
      <p className="text-center text-[10px] text-slate-600">
        🔒 These measurements were shared with your explicit consent (GDPR Art. 6). <br />
        They will be automatically deleted after the expiry date.
      </p>
    </div>
  );
}
