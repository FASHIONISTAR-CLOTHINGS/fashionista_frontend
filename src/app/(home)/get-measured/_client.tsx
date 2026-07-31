"use client";
/**
 * @file _client.tsx
 * @description Client boundary with MeasurementEntryModal for /get-measured page.
 *
 * Updated (Measurement Workflow Refactor):
 *  - Uses MeasurementEntryModal component (no inline modal)
 *  - On submit: redirects to /client/dashboard/measurements/scan (no API call from marketing page)
 *  - No quick-scan option on marketing page (scan happens in dashboard)
 *  - ctaOnly mode for marketing page CTAs
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MeasurementEntryModal, type MeasurementEntryData } from "@/features/measurements/components/MeasurementEntryModal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GetMeasuredClientProps {
  /** Show only a CTA button (used across multiple sections of marketing page) */
  ctaOnly?: boolean;
  /** Custom CTA label */
  cta?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GetMeasuredClient({
  ctaOnly = false,
  cta = "Get My Free Measurements →",
}: GetMeasuredClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEntrySubmit = useCallback(
    (data: MeasurementEntryData) => {
      // Save entry data to sessionStorage for ScanEntryClient to pick up
      try {
        sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify({
          age: data.age,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          timestamp: Date.now(),
        }));
      } catch {
        // sessionStorage unavailable
      }
      // Redirect to dashboard scan entry — no API call from marketing page
      router.push("/client/dashboard/measurements/scan");
    },
    [router],
  );

  // ── CTA-only mode (used across marketing page sections) ──────────────────
  if (ctaOnly) {
    return (
      <>
        <button
          id="get-measured-cta"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base
                     transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "#F4C430",
            color:           "#0A0A0A",
            boxShadow:       "0 4px 20px rgba(244,196,48,0.35)",
          }}
          aria-label="Open measurement entry modal"
        >
          {cta}
        </button>
        <MeasurementEntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleEntrySubmit}
        />
      </>
    );
  }

  // ── Full scan view (when not ctaOnly — kept for backward compatibility) ───
  return (
    <>
      <div className="space-y-4">
        <div
          className="rounded-[8px] px-4 py-3 font-satoshi text-base md:text-lg"
          style={{ backgroundColor: "#F4F8F6", color: "#475367" }}
        >
          Save your measurements once and reuse them across custom fashion orders
          for a smoother, more accurate fitting experience.
        </div>

        <button
          id="get-measured-inline-cta"
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-xl font-semibold py-3.5 transition-all duration-200
                     flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: "#F4C430",
            color:           "#0A0A0A",
            boxShadow:       "0 4px 20px rgba(244,196,48,0.30)",
          }}
        >
          Start AI Body Scan →
        </button>

        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          🔒 No video stored • Only pose coordinates transmitted
        </p>
      </div>

      <MeasurementEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEntrySubmit}
      />
    </>
  );
}

