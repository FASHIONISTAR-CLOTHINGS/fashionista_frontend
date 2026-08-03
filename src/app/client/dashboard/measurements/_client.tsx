"use client";
/**
 * @file _client.tsx
 * @description TASK-023: Full measurements dashboard client component.
 *
 * Features:
 *   - Measurement profile list with "Default" badge
 *   - Per-profile measurement cards (cm + inches dual display)
 *   - Delta comparison arrows (↑↓ vs previous scan)
 *   - Body zone grouping (Upper / Core / Lower / Full)
 *   - "Start AI Scan" CTA that opens EnhancedMeasurementFlow inline or redirects
 *   - Scan history timeline with confidence indicators
 *   - Brand-compliant Forest Green + Golden Yellow design
 *
 * Data: Pulls from TanStack Query hooks wrapping the DRF sync API.
 * Fallback: Shows skeleton loading states, never empty — shows CTA.
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMeasurements } from "@/features/measurements/hooks/use-measurements";
import { MEASUREMENT_FIELDS } from "@/lib/brand";
import { MeasurementTimeline } from "@/features/measurements/components/MeasurementTimeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeasurementValue {
  key:         string;
  label:       string;
  icon:        string;
  zone:        string;
  valueCm:     number | null;
  valuePrevCm: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cmToInch(cm: number): string {
  const totalIn = cm / 2.54;
  return `${totalIn.toFixed(1)}"`;
}

function getDelta(current: number | null, prev: number | null): { value: number; dir: "up" | "down" | "same" } | null {
  if (current == null || prev == null) return null;
  const diff = parseFloat((current - prev).toFixed(1));
  return { value: Math.abs(diff), dir: diff > 0 ? "up" : diff < 0 ? "down" : "same" };
}

function DeltaBadge({ delta }: { delta: ReturnType<typeof getDelta> }) {
  if (!delta || delta.dir === "same") return null;
  const isUp   = delta.dir === "up";
  const color  = isUp ? "#1A6B72" : "#FDA600";
  const arrow  = isUp ? "↑" : "↓";
  return (
    <span
      className="text-[10px] font-bold px-1 py-0.5 rounded ml-1"
      style={{ color, background: `${color}20` }}
    >
      {arrow} {delta.value}
    </span>
  );
}

function MeasurementValueRow({ item }: { item: MeasurementValue }) {
  const delta = getDelta(item.valueCm, item.valuePrevCm);

  if (item.valueCm == null) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">{item.icon}</span>
          <span className="text-sm text-white/60">{item.label}</span>
        </div>
        <span className="text-xs text-white/20 italic">—</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2 border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{item.icon}</span>
        <span className="text-sm text-white/80">{item.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-white">
          {item.valueCm} <span className="text-white/40 font-normal text-xs">cm</span>
        </span>
        <span className="text-xs text-white/30 ml-2">{cmToInch(item.valueCm)}</span>
        <DeltaBadge delta={delta} />
      </div>
    </motion.div>
  );
}

// ─── Zone Section ─────────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, { label: string; accent: string }> = {
  upper: { label: "Upper Body",    accent: "#01454A" },
  core:  { label: "Core",          accent: "#FDA600" },
  lower: { label: "Lower Body",    accent: "#1A6B72" },
  full:  { label: "Full Body",     accent: "#01454A" },
};

function ZoneSection({ zone, items }: { zone: string; items: MeasurementValue[] }) {
  const cfg     = ZONE_LABELS[zone] ?? { label: zone, accent: "#01454A" };
  const hasData = items.some(i => i.valueCm != null);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.accent }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.accent }}>
          {cfg.label}
        </span>
        {!hasData && (
          <span className="text-[10px] text-white/20 italic ml-auto">No data yet</span>
        )}
      </div>
      <div className="space-y-0">
        {items.map(item => (
          <MeasurementValueRow key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({ profile, isSelected, onClick }: {
  profile: Record<string, unknown>;
  isSelected: boolean;
  onClick: () => void;
}) {
  const createdAt = profile.created_at
    ? new Date(profile.created_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Unknown date";

  const confidence = typeof profile.scan_confidence === "number"
    ? Math.round((profile.scan_confidence as number) * 100)
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-[#01454A] bg-[#01454A]/10 ring-1 ring-[#01454A]/30"
          : "border-white/10 bg-white/5 hover:border-[#01454A]/40 hover:bg-[#01454A]/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">
              {(profile.name as string) || "Body Scan"}
            </span>
            {Boolean(profile.is_default) && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FDA600]/15 text-[#FDA600] border border-[#FDA600]/20 uppercase tracking-wide flex-shrink-0">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">{createdAt}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {confidence != null && (
            <div className="text-xs font-bold" style={{ color: confidence >= 80 ? "#1A6B72" : confidence >= 60 ? "#FDA600" : "#DC2626" }}>
              {confidence}%
            </div>
          )}
          <div className="text-[10px] text-white/30">accuracy</div>
        </div>
      </div>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      {/* Animated body icon */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-[#01454A]/20 animate-pulse" />
        <div className="absolute inset-3 rounded-full bg-[#01454A]/10 flex items-center justify-center">
          <span className="text-3xl">📐</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">No measurements yet</h2>
      <p className="text-sm text-white/50 max-w-xs mb-8">
        Your first AI body scan takes just 30 seconds. Stand in front of your
        camera in fitted clothing and let our AI capture 14 precise measurements.
      </p>

      {/* What you get — psychological buildup */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8 text-left">
        {[
          { icon: "📏", label: "14 measurements" },
          { icon: "⚡", label: "30-second scan" },
          { icon: "🎯", label: "±2.5cm accuracy" },
          { icon: "🔒", label: "Privacy first" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 bg-[#01454A]/10 rounded-xl px-3 py-2.5 border border-[#01454A]/20">
            <span>{item.icon}</span>
            <span className="text-xs font-medium text-white/80">{item.label}</span>
          </div>
        ))}
      </div>

      <Link
        href="/client/dashboard/measurements/scan"
        className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] text-[#111111] font-bold text-sm px-6 py-3 hover:bg-[#C88500] transition-colors shadow-lg shadow-[#FDA600]/20"
        id="start-first-scan-btn"
      >
        <span>📷</span>
        Start My Free Body Scan
      </Link>

      <p className="text-xs text-white/30 mt-4">
        No images stored — only pose coordinates are processed
      </p>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function MeasurementsDashboard() {
  const router = useRouter();
  const { data, isLoading } = useMeasurements();

  const [selectedProfileId, setSelectedProfileId] = useState<number | string | null>(null);

  // Find selected or default profile
  const profiles: Record<string, unknown>[] = Array.isArray(data) ? data : (data as { results?: Record<string, unknown>[] })?.results ?? [];
  const selectedProfile = profiles.find(
    p => (selectedProfileId != null ? p.id === selectedProfileId : p.is_default)
  ) ?? profiles[0] ?? null;

  // Build measurement items for the selected profile
  const buildMeasurementItems = useCallback((): MeasurementValue[] => {
    if (!selectedProfile) return MEASUREMENT_FIELDS.map(f => ({ key: f.key, label: f.label, icon: f.icon, zone: f.zone, valueCm: null, valuePrevCm: null }));

    return MEASUREMENT_FIELDS.map(f => ({
      key:         f.key,
      label:       f.label,
      icon:        f.icon,
      zone:        f.zone,
      valueCm:     typeof selectedProfile[f.key] === "number" ? (selectedProfile[f.key] as number) : null,
      valuePrevCm: null, // TODO: Phase 11 — compare vs previous scan
    }));
  }, [selectedProfile]);

  // Group by zone
  const zones = ["full", "upper", "core", "lower"] as const;
  const groupedByZone = Object.fromEntries(
    zones.map(z => [z, buildMeasurementItems().filter(i => i.zone === z)])
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#0D1810] to-[#111111] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-white/10 rounded-xl animate-pulse mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="md:col-span-2 h-96 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#0D1810] to-[#111111] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Measurements</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {profiles.length > 0
                ? `${profiles.length} profile${profiles.length !== 1 ? "s" : ""} — AI-powered body data`
                : "Start your first body scan"}
            </p>
          </div>

          <Link
            href="/client/dashboard/measurements/scan"
            id="new-scan-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-[#01454A] hover:bg-[#013337] text-white font-semibold text-sm px-5 py-2.5 transition-colors border border-[#01454A]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {profiles.length > 0 ? "Retake Scan" : "Start Scan"}
          </Link>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {profiles.length === 0 && <EmptyState />}

        {/* ── Profile list + detail (2-column on md+) ─────────────────────── */}
        {profiles.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">

            {/* Left: profile selector */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Profiles
              </p>
              {profiles.map(p => (
                <ProfileCard
                  key={String(p.id)}
                  profile={p}
                  isSelected={
                    selectedProfileId != null
                      ? p.id === selectedProfileId
                      : !!(p.is_default) || p === profiles[0]
                  }
                  onClick={() => setSelectedProfileId(p.id as number)}
                />
              ))}

              {/* Retake CTA below profile list */}
              <div className="pt-2">
                <Link
                  href="/client/dashboard/measurements/scan"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#01454A]/40 text-[#1A6B72] text-sm font-medium py-2.5 hover:bg-[#01454A]/10 transition-colors"
                >
                  📷 Retake Body Scan
                </Link>
              </div>
            </div>

            {/* Right: measurements detail */}
            <div className="md:col-span-2">
              <AnimatePresence mode="wait">
                {selectedProfile && (
                  <motion.div
                    key={String(selectedProfile.id ?? "profile")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-6"
                  >
                    {/* Profile header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {(selectedProfile.name as string) || "Body Scan"}
                        </h2>
                        <p className="text-xs text-white/40 mt-0.5">
                          {selectedProfile.created_at
                            ? `Scanned ${new Date(selectedProfile.created_at as string).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}`
                            : ""}
                        </p>
                      </div>

                      {/* Confidence pill */}
                      {typeof selectedProfile.scan_confidence === "number" && (
                        <div className="text-center bg-[#01454A]/10 border border-[#01454A]/20 rounded-xl px-4 py-2">
                          <div className="text-xl font-bold" style={{ color: "#1A6B72" }}>
                            {Math.round((selectedProfile.scan_confidence as number) * 100)}%
                          </div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wide">Accuracy</div>
                        </div>
                      )}
                    </div>

                    {/* Measurement zones */}
                    <div className="space-y-2">
                      {zones.map(zone => (
                        groupedByZone[zone]?.length > 0 && (
                          <ZoneSection
                            key={zone}
                            zone={zone}
                            items={groupedByZone[zone]}
                          />
                        )
                      ))}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                      <Link
                        href={`/client/dashboard/measurements/scan`}
                        className="flex-1 text-center text-sm font-medium rounded-xl bg-[#01454A]/15 border border-[#01454A]/30 text-[#1A6B72] py-2.5 hover:bg-[#01454A]/25 transition-colors"
                      >
                        🔁 Retake Scan
                      </Link>
                      <button
                        className="flex-1 text-sm font-semibold rounded-xl bg-[#FDA600] text-[#111111] py-2.5 hover:bg-[#C88500] transition-colors"
                        onClick={() => router.push("/client/dashboard/size-guides")}
                      >
                        🛍️ Find My Size
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan History Timeline */}
              {profiles.length > 1 && (
                <div className="mt-4">
                  <MeasurementTimeline
                    entries={profiles.map((p: Record<string, unknown>) => ({
                      id:                p.id as string | number,
                      scanned_at:        (p.created_at ?? p.updated_at ?? new Date().toISOString()) as string,
                      scan_confidence:   typeof p.scan_confidence === "number" ? p.scan_confidence : null,
                      measurements_cm: {
                        bust:           (p.bust           as number | null) ?? null,
                        waist:          (p.waist          as number | null) ?? null,
                        hips:           (p.hips           as number | null) ?? null,
                        shoulder_width: (p.shoulder_width as number | null) ?? null,
                        arm_length:     (p.arm_length     as number | null) ?? null,
                        inseam:         (p.inseam         as number | null) ?? null,
                        thigh:          (p.thigh          as number | null) ?? null,
                        neck:           (p.neck           as number | null) ?? null,
                        torso_length:   (p.torso_length   as number | null) ?? null,
                        sleeve_length:  (p.sleeve_length  as number | null) ?? null,
                      },
                    }))}
                    onRetake={() => router.push("/client/dashboard/measurements/scan")}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
