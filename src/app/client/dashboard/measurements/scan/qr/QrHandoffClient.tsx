"use client";

/**
 * @file QrHandoffClient.tsx
 * @description Client component for desktop QR code handoff.
 *
 * Reads session_id from search params. Retrieves QR code data from sessionStorage
 * (saved by ScanEntryClient). Shows QR image + scan URL + status polling.
 *
 * When the mobile scan completes (detected via WebSocket/polling), redirects to
 * /client/dashboard/measurements.
 */

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useScanWebSocket } from "@/features/measurements/hooks/useScanWebSocket";
import { pollScanStatus } from "@/features/measurements/api/scan.api";
import { useQueryClient } from "@tanstack/react-query";
import { measurementKeys } from "@/features/measurements/hooks/use-measurements";

const SESSION_STORAGE_KEY = "fashionistar_measurement_entry";

interface StoredEntryData {
  sessionId: string;
  measurementUrl?: string;
  qrCodeB64?: string;
  qrCodeUrl?: string;
  timestamp: number;
}

export function QrHandoffClient({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = use(searchParams);
  const sessionId = sp.session_id ?? null;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [qrB64, setQrB64] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [measurementUrl, setMeasurementUrl] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>("waiting");
  const [pollingActive, setPollingActive] = useState(false);

  // ── Load QR data from sessionStorage ──
  useEffect(() => {
    if (!sessionId) {
      router.push("/client/dashboard/measurements/scan");
      return;
    }

    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const data: StoredEntryData = JSON.parse(raw);
        if (data.qrCodeB64) setQrB64(data.qrCodeB64);
        if (data.qrCodeUrl) setQrUrl(data.qrCodeUrl);
        if (data.measurementUrl) setMeasurementUrl(data.measurementUrl);
      }
    } catch {
      // sessionStorage unavailable — will rely on polling
    }
  }, [sessionId, router]);

  // ── WebSocket for real-time status ──
  const ws = useScanWebSocket(sessionId);

  // ── Polling fallback ──
  useEffect(() => {
    if (!sessionId) return;

    // Start polling immediately as backup to WS
    setPollingActive(true);
    const pollInterval = setInterval(async () => {
      try {
        const status = await pollScanStatus(sessionId);
        setScanStatus(status.status);

        if (status.status === "completed") {
          clearInterval(pollInterval);
          queryClient.invalidateQueries({ queryKey: measurementKeys.all });
          queryClient.invalidateQueries({ queryKey: measurementKeys.lists() });
          try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {
            // ignore
          }
          router.push("/client/dashboard/measurements");
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
        }
      } catch {
        // keep polling
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [sessionId, router, queryClient]);

  // ── WS event handler ──
  useEffect(() => {
    if (ws.lastEvent?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: measurementKeys.all });
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() });
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      router.push("/client/dashboard/measurements");
    } else if (ws.lastEvent?.status) {
      setScanStatus(ws.lastEvent.status);
    }
  }, [ws.lastEvent, router, queryClient]);

  const handleCopyUrl = useCallback(async () => {
    if (measurementUrl) {
      try {
        await navigator.clipboard.writeText(measurementUrl);
      } catch {
        // ignore
      }
    }
  }, [measurementUrl]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#F4F3EC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#7A6B44] mb-4">No session ID provided.</p>
          <button
            onClick={() => router.push("/client/dashboard/measurements/scan")}
            className="rounded-xl bg-[#01454A] text-white px-6 py-3 text-sm font-semibold"
          >
            Start New Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#01454A]/8 border border-[#01454A]/15 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FDA600] animate-pulse" />
            <span className="text-xs font-medium text-[#01454A] tracking-wider uppercase">
              Mobile Handoff
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#01454A] tracking-tight">
            Scan with Your Phone
          </h1>
          <p className="mt-2 text-sm text-[#7A6B44]">
            Scan the QR code below with your phone camera to continue your AI body scan.
          </p>
        </div>

        {/* QR Code */}
        <div className="rounded-2xl bg-white border border-[#ECE6D6] p-8 flex flex-col items-center gap-4">
          {qrB64 ? (
            <img
              src={`data:image/png;base64,${qrB64}`}
              alt="Scan QR Code"
              className="w-64 h-64 rounded-xl"
            />
          ) : qrUrl ? (
            <img
              src={qrUrl}
              alt="Scan QR Code"
              className="w-64 h-64 rounded-xl"
            />
          ) : (
            <div className="w-64 h-64 rounded-xl bg-[#F4F3EC] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#FDA600]/20 border-t-[#FDA600] animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#7A6B44]">Loading QR code...</p>
              </div>
            </div>
          )}

          {/* Copy URL */}
          {measurementUrl && (
            <button
              onClick={handleCopyUrl}
              className="text-xs text-[#7A6B44] hover:text-[#01454A] transition underline"
            >
              Copy scan URL instead
            </button>
          )}
        </div>

        {/* Status indicator */}
        <div className="mt-6 rounded-xl bg-white border border-[#ECE6D6] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  scanStatus === "completed"
                    ? "bg-[#52B788]"
                    : scanStatus === "processing"
                      ? "bg-[#FDA600] animate-pulse"
                      : scanStatus === "failed"
                        ? "bg-red-500"
                        : "bg-[#7A6B44]/40"
                }`}
              />
              <span className="text-sm font-medium text-[#01454A]">
                {scanStatus === "waiting" && "Waiting for phone..."}
                {scanStatus === "pending" && "Waiting for phone..."}
                {scanStatus === "processing" && "Scan in progress..."}
                {scanStatus === "completed" && "Scan complete!"}
                {scanStatus === "failed" && "Scan failed"}
              </span>
            </div>
            {pollingActive && (
              <span className="text-[10px] text-[#7A6B44]/50">
                {ws.isConnected ? "Live" : "Polling every 3s"}
              </span>
            )}
          </div>

          {/* Progress steps */}
          <div className="mt-3 flex gap-1.5">
            <div className={`flex-1 h-1 rounded-full ${scanStatus !== "waiting" ? "bg-[#FDA600]" : "bg-[#ECE6D6]"}`} />
            <div className={`flex-1 h-1 rounded-full ${["processing", "completed"].includes(scanStatus) ? "bg-[#FDA600]" : "bg-[#ECE6D6]"}`} />
            <div className={`flex-1 h-1 rounded-full ${scanStatus === "completed" ? "bg-[#52B788]" : "bg-[#ECE6D6]"}`} />
          </div>
        </div>

        {/* Cancel */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
              } catch {
                // ignore
              }
              router.push("/client/dashboard/measurements");
            }}
            className="text-xs text-[#7A6B44] hover:text-[#01454A] transition underline"
          >
            Cancel scan
          </button>
        </div>
      </div>
    </div>
  );
}
