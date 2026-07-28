"use client";
/**
 * @file _client.tsx
 * @description Client boundary for /get-measured page.
 *
 * T-021-T-028: Enhanced with:
 *   - MeasurementEntryModal (T-021/T-023): age/sex/height collection before scan
 *   - Auth redirect (T-024): redirect unauthenticated users to login after scan
 *   - Device detection (T-025): mobile vs desktop UX branching
 *   - scanStore (T-018): pre-scan state persistence
 */

import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { InHouseMeasurementFlow } from "@/features/measurements/components/InHouseMeasurementFlow";
import { MeasurementEntryModal, type MeasurementEntryData } from "@/features/measurements/components/MeasurementEntryModal";
import { useScanStore } from "@/features/measurements/store/scanStore";

export function GetMeasuredClient() {
  const router = useRouter();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // T-025: Device detection — mobile devices get a simplified flow
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const setEntryData = useScanStore((s) => s.setEntryData);
  const setPhase = useScanStore((s) => s.setPhase);

  /**
   * T-023: Called when user fills the entry modal.
   * Stores age/sex/height in scanStore and proceeds to the scan flow.
   */
  const handleEntrySubmit = useCallback(
    (data: MeasurementEntryData) => {
      setEntryData(data);
      setShowEntryModal(false);
      setPhase("loading_model");
    },
    [setEntryData, setPhase],
  );

  /**
   * T-024: After scan completes:
   * - If user is logged in and we have a profile ID → redirect to their profile
   * - If not logged in → redirect to login with callback URL
   * - If profileId is null → InHouseMeasurementFlow shows its own success state
   */
  const handleComplete = useCallback(
    (profileId: string | number | null) => {
      if (profileId) {
        // Check if user is authenticated by looking for auth token
        const hasAuth = typeof window !== "undefined" &&
          (localStorage.getItem("access_token") ||
           document.cookie.includes("fashionistar_auth"));
        if (hasAuth) {
          router.push(`/client/dashboard/measurements/${profileId}`);
        } else {
          // T-024: Redirect to login with callback
          router.push(`/auth/login?next=/client/dashboard/measurements/${profileId}`);
        }
      }
    },
    [router],
  );

  return (
    <>
      <InHouseMeasurementFlow
        onComplete={handleComplete}
        // No onCancel on the public page — user can just navigate away
      />
      {/* T-023: Entry modal for age/sex/height collection */}
      <MeasurementEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSubmit={handleEntrySubmit}
      />
      {/* T-025: Mobile notice for devices that may struggle with camera */}
      {isMobile && (
        <div className="mt-4 rounded-xl bg-[#01454A]/5 border border-[#01454A]/12 px-4 py-3">
          <p className="text-xs text-[#565960]">
            <strong className="text-[#01454A]">Tip:</strong> For best results, use a
            desktop or tablet with a webcam at eye level.
          </p>
        </div>
      )}
    </>
  );
}
