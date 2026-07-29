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

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { EnhancedMeasurementFlow } from "@/features/measurements/components/EnhancedMeasurementFlow";
import { ScanProgressStepper } from "@/features/measurements/components/ScanProgressStepper";
import { ScanFallbackManual } from "@/features/measurements/components/ScanFallbackManual";
import { registerMediaPipeSW } from "@/features/measurements/lib/registerMediaPipeSW";
import { useScanStore } from "@/features/measurements/store/scanStore";
import { useScanWebSocket } from "@/features/measurements/hooks/useScanWebSocket";
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
  const [wsError, setWsError] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const scanStore = useScanStore();

  // ── Load entry data from sessionStorage on mount ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const data: StoredEntryData = JSON.parse(raw);
        scanStore.setEntryData({
          age: data.age,
          sex: data.sex,
          heightCm: data.heightCm,
        });
        scanStore.setSessionId(sessionId);
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
  }, [sessionId, router, scanStore]);

  // ── WebSocket for real-time scan progress ──
  const ws = useScanWebSocket(sessionId);

  // ── Fallback to polling if WS fails ──
  useEffect(() => {
    if (ws.connectionStatus === "error" || ws.connectionStatus === "disconnected") {
      setWsError(true);
    }
  }, [ws.connectionStatus]);

  // ── Polling fallback ──
  useEffect(() => {
    if (!wsError || pollingActive) return;
    if (scanStore.phase === "completed" || scanStore.phase === "failed") return;

    setPollingActive(true);
    const pollInterval = setInterval(async () => {
      try {
        const status = await pollScanStatus(sessionId);
        if (status.status === "completed") {
          scanStore.setPhase("completed");
          clearInterval(pollInterval);
        } else if (status.status === "failed") {
          scanStore.setPhase("failed");
          scanStore.setError(status.error_message ?? "Scan processing failed");
          clearInterval(pollInterval);
        }
      } catch {
        // Polling error — keep trying
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      setPollingActive(false);
    };
  }, [wsError, sessionId, scanStore, pollingActive]);

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

  const handleManualSubmit = useCallback(
    (_measurements: Record<string, number>) => {
      // TODO: Submit manual measurements to backend
      router.push("/client/dashboard/measurements");
    },
    [router],
  );

  // ── Fallback manual entry ──
  if (showFallback) {
    return (
      <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white border border-[#ECE6D6] p-6">
            <ScanFallbackManual
              variant="full"
              onSubmit={handleManualSubmit}
              onCancel={() => setShowFallback(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress stepper */}
        <div className="mb-6 rounded-2xl bg-[#01454A] p-4">
          <ScanProgressStepper currentPhase={scanStore.phase} />
        </div>

        {/* WS fallback indicator */}
        {wsError && pollingActive && (
          <div className="mb-4 rounded-lg bg-[#FDA600]/10 border border-[#FDA600]/20 px-4 py-2 text-center">
            <p className="text-xs text-[#7A6B44]">
              Live updates unavailable — polling every 2s...
            </p>
          </div>
        )}

        {/* Main scan flow */}
        <EnhancedMeasurementFlow
          onComplete={handleScanComplete}
          onCancel={handleScanCancel}
          initialAge={scanStore.age ?? undefined}
          initialSex={scanStore.sex ?? undefined}
          initialHeightCm={scanStore.heightCm ?? undefined}
          sessionId={sessionId}
        />

        {/* Fallback link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowFallback(true)}
            className="text-xs text-[#7A6B44] hover:text-[#01454A] transition underline"
          >
            Enter measurements manually instead
          </button>
        </div>
      </div>
    </div>
  );
}
