"use client";
/**
 * @file _client.tsx
 * @description Client boundary for /get-measured marketing page.
 *
 * Renders a CTA button that opens MeasurementEntryModal.
 * On submit, stores data in scanStore and redirects to
 * /client/dashboard/measurements/scan for the actual scan.
 */

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { MeasurementEntryModal, type MeasurementEntryData } from "@/features/measurements/components/MeasurementEntryModal";
import { useScanStore } from "@/features/measurements/store/scanStore";

export function GetMeasuredClient() {
  const router = useRouter();
  const [showEntryModal, setShowEntryModal] = useState(false);

  const setEntryData = useScanStore((s) => s.setEntryData);
  const setPhase = useScanStore((s) => s.setPhase);

  const handleEntrySubmit = useCallback(
    (data: MeasurementEntryData) => {
      setEntryData(data);
      setShowEntryModal(false);
      setPhase("loading_model");
      router.push("/client/dashboard/measurements/scan");
    },
    [setEntryData, setPhase, router],
  );

  return (
    <>
      {/* CTA button — opens the entry modal */}
      <button
        onClick={() => setShowEntryModal(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#01454A] hover:bg-[#016B73]
                   text-white font-semibold text-sm px-6 py-3 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
        Start AI Body Scan
      </button>

      {/* Entry modal for collecting age/sex/height/weight */}
      <MeasurementEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSubmit={handleEntrySubmit}
      />
    </>
  );
}
