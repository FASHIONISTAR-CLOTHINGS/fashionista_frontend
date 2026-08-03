"use client";

/**
 * @file ActiveScanClient.tsx
 * @description Client component for active camera scan session.
 *
 * Reads entry data from sessionStorage / scanStore (age, height, weight, sex).
 * Initializes useMeasurementCapture hook with sessionId.
 * Registers MediaPipe SW on mount.
 * Renders full scan flow with progress stepper, camera, overlays, and guidance.
 *
 * On completion → redirect to /client/dashboard/measurements
 * On failure → show error + retry button + ScanFallbackManual
 */

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { EnhancedMeasurementFlow } from "@/features/measurements/components/EnhancedMeasurementFlow";
import { ScanFallbackManual } from "@/features/measurements/components/ScanFallbackManual";
import { registerMediaPipeSW } from "@/features/measurements/lib/registerMediaPipeSW";
import { useScanStore } from "@/features/measurements/store/scanStore";
import { pollScanStatus } from "@/features/measurements/api/scan.api";
import { useQueryClient } from "@tanstack/react-query";
import { measurementKeys } from "@/features/measurements/hooks/use-measurements";

const SESSION_STORAGE_KEY = "fashionistar_measurement_entry";

interface StoredEntryData {
  age: number;
  sex: "male" | "female" | "neutral";
  heightCm: number;
  weightKg?: number;
  sessionId: string;
  measurementUrl?: string;
  qrCodeB64?: string;
  qrCodeUrl?: string;
  deviceType?: string;
  timestamp: number;
}

export function ActiveScanClient({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showFallback, setShowFallback] = useState(false);
  const pollingActiveRef = useRef(false);

  // Use individual selectors to avoid object reference changes causing infinite loops
  const scanPhase    = useScanStore((s) => s.phase);
  const scanAge      = useScanStore((s) => s.age);
  const scanSex      = useScanStore((s) => s.sex);
  const scanHeightCm = useScanStore((s) => s.heightCm);
  const scanWeightKg = useScanStore((s) => s.weightKg);
  const setEntryData = useScanStore((s) => s.setEntryData);
  const setSessionId = useScanStore((s) => s.setSessionId);
  const setPhase     = useScanStore((s) => s.setPhase);
  const setError     = useScanStore((s) => s.setError);

  // ── Load entry data from sessionStorage on mount ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const data: StoredEntryData = JSON.parse(raw);
        setEntryData({
          age: data.age,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
        });
        setSessionId(sessionId);
      } else {
        // No entry data — redirect back to scan entry
        router.push("/client/dashboard/measurements/scan");
        return;
      }
    } catch {
      // sessionStorage parse failed — redirect to entry
      router.push("/client/dashboard/measurements/scan");
      return;
    }

    // Register MediaPipe service worker
    void registerMediaPipeSW();
  }, [sessionId, router, setEntryData, setSessionId]);

  // ── Polling fallback for scan status ──
  // The EnhancedMeasurementFlow internally uses useScanSession which has its own
  // WebSocket + polling. This outer polling is a secondary safety net for when
  // the user navigates back or the component re-mounts while a scan is processing.
  useEffect(() => {
    if (!sessionId) return;
    // Only poll when the scan is actively processing on the backend (after submission)
    if (scanPhase !== "processing") return;
    if (pollingActiveRef.current) return;

    pollingActiveRef.current = true;
    const pollInterval = setInterval(async () => {
      try {
        const status = await pollScanStatus(sessionId);
        if (status.status === "completed") {
          setPhase("completed");
          clearInterval(pollInterval);
        } else if (status.status === "failed") {
          setPhase("failed");
          setError(status.error_message ?? "Scan processing failed");
          clearInterval(pollInterval);
        }
      } catch {
        // Polling error — keep trying quietly
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      pollingActiveRef.current = false;
    };
  }, [sessionId, scanPhase, setPhase, setError]);

  // ── Handle scan completion ──
  const handleScanComplete = useCallback(
    (profileId: string | number | null) => {
      // Invalidate measurement queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: measurementKeys.all });
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() });

      // Clear sessionStorage
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }

      // Redirect to measurements dashboard
      if (profileId) {
        router.push(`/client/dashboard/measurements/${profileId}`);
      } else {
        router.push("/client/dashboard/measurements");
      }
    },
    [router, queryClient],
  );

  const handleScanCancel = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    router.push("/client/dashboard/measurements");
  }, [router]);

  // ── Fallback manual entry ──
  if (showFallback) {
    return (
      <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white border border-[#ECE6D6] p-6">
            <ScanFallbackManual
              variant="inline"
              manualEntryUrl="/client/dashboard/measurements"
              onDismiss={() => setShowFallback(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--BV-cream)]">
      {showFallback ? (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white border border-[var(--BV-cream-dark)] p-6">
              <ScanFallbackManual
                variant="inline"
                manualEntryUrl="/client/dashboard/measurements"
                onDismiss={() => setShowFallback(false)}
              />
            </div>
          </div>
        </div>
      ) : (
        <EnhancedMeasurementFlow
          onComplete={handleScanComplete}
          onCancel={handleScanCancel}
          initialAge={scanAge ?? undefined}
          initialSex={scanSex ?? undefined}
          initialHeightCm={scanHeightCm ?? undefined}
          initialWeightKg={scanWeightKg ?? undefined}
          sessionId={sessionId}
        />
      )}

      {!showFallback && (
        <div className="fixed bottom-6 left-0 right-0 z-50 text-center pointer-events-none">
          <button
            onClick={() => setShowFallback(true)}
            className="pointer-events-auto text-xs text-[var(--BV-slate)] hover:text-[var(--BV-green)] transition underline bg-[var(--BV-cream)]/80 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            Enter measurements manually instead
          </button>
        </div>
      )}
    </div>
  );
}
