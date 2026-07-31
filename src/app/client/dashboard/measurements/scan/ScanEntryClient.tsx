"use client";

/**
 * @file ScanEntryClient.tsx
 * @description Client component orchestrating tutorial → modal → initiate → redirect.
 *
 * Phase 1: Show ScanTutorialOverlay (if not seen before)
 * Phase 2: Show MeasurementEntryModal (age, sex, height, weight)
 * Phase 3: On modal submit → call initiateBodyScan from scan.api.ts
 * Phase 4: Save entry data + session data to sessionStorage + scanStore
 * Phase 5: Redirect:
 *   - Mobile/tablet → /client/dashboard/measurements/scan/{session_id}
 *   - Desktop → /client/dashboard/measurements/scan/qr?session_id=...
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScanTutorialOverlay } from "@/features/measurements/components/ScanTutorialOverlay";
import { MeasurementEntryModal, type MeasurementEntryData } from "@/features/measurements/components/MeasurementEntryModal";
import { initiateBodyScan } from "@/features/measurements/api/scan.api";
import { useScanStore } from "@/features/measurements/store/scanStore";
import { useDeviceType } from "@/features/measurements/hooks/useDeviceType";

const SESSION_STORAGE_KEY = "fashionistar_measurement_entry";

type EntryPhase = "tutorial" | "modal" | "initiating" | "error";

/** Read pre-existing entry data from sessionStorage (from marketing page). */
function readPreExistingEntry(): { age: number; sex: "male" | "female" | "neutral"; heightCm: number; weightKg?: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // If entry data exists but no sessionId yet (from marketing page),
      // skip tutorial + modal and go straight to initiating
      if (data.age && data.heightCm && !data.sessionId) {
        return {
          age: data.age,
          sex: data.sex ?? "neutral",
          heightCm: data.heightCm,
          weightKg: data.weightKg,
        };
      }
    }
  } catch {
    // sessionStorage parse failed — show tutorial + modal
  }
  return null;
}

export function ScanEntryClient() {
  const router = useRouter();
  const device = useDeviceType();
  // Lazy-init phase: if pre-existing entry data from marketing page, skip to "initiating"
  const [phase, setPhase] = useState<EntryPhase>(() => {
    const pre = readPreExistingEntry();
    return pre ? "initiating" : "tutorial";
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEntryData = useScanStore((s) => s.setEntryData);
  const setSessionId = useScanStore((s) => s.setSessionId);
  const setScanPhase = useScanStore((s) => s.setPhase);

  // ── If pre-existing entry data, initiate scan session immediately ──
  useEffect(() => {
    if (phase !== "initiating") return;
    const pre = readPreExistingEntry();
    if (!pre) return;

    // Set entry data in Zustand store (not React setState — safe in effect)
    setEntryData({
      age: pre.age,
      sex: pre.sex,
      heightCm: pre.heightCm,
      weightKg: pre.weightKg,
    });

    let cancelled = false;
    (async () => {
      try {
        const session = await initiateBodyScan({
          device_type: device.apiDeviceType,
        });
        if (cancelled) return;
        const sid = session.session_id;
        const entryData = {
          age: pre.age,
          sex: pre.sex,
          heightCm: pre.heightCm,
          weightKg: pre.weightKg,
          sessionId: sid,
          measurementUrl: session.measurement_url ?? "",
          qrCodeB64: session.qr_code_b64 ?? "",
          qrCodeUrl: session.qr_code_url ?? "",
          deviceType: device.apiDeviceType,
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entryData));
        } catch {
          // ignore
        }
        setSessionId(sid);
        setScanPhase("loading_model");
        if (device.isMobile || device.isTablet) {
          router.push(`/client/dashboard/measurements/scan/${sid}`);
        } else {
          router.push(`/client/dashboard/measurements/scan/qr?session_id=${sid}`);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create scan session. Please try again.",
        );
        setPhase("error");
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleTutorialComplete = useCallback(() => {
    setPhase("modal");
    setShowModal(true);
  }, []);

  const handleEntrySubmit = useCallback(
    async (data: MeasurementEntryData) => {
      setShowModal(false);
      setPhase("initiating");
      setError(null);

      // Save entry data to Zustand store
      setEntryData({
        age: data.age,
        sex: data.sex,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
      });

      try {
        // Initiate scan session via backend
        const session = await initiateBodyScan({
          device_type: device.apiDeviceType,
        });

        const sessionId = session.session_id;

        // Save to sessionStorage for ActiveScanClient to read
        const entryData = {
          age: data.age,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          sessionId,
          measurementUrl: session.measurement_url ?? "",
          qrCodeB64: session.qr_code_b64 ?? "",
          qrCodeUrl: session.qr_code_url ?? "",
          deviceType: device.apiDeviceType,
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entryData));
        } catch {
          // sessionStorage unavailable
        }

        // Save session ID to Zustand
        setSessionId(sessionId);
        setScanPhase("loading_model");

        // Redirect based on device type
        if (device.isMobile || device.isTablet) {
          router.push(`/client/dashboard/measurements/scan/${sessionId}`);
        } else {
          router.push(
            `/client/dashboard/measurements/scan/qr?session_id=${sessionId}`,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create scan session. Please try again.",
        );
        setPhase("error");
      }
    },
    [device, router, setEntryData, setSessionId, setScanPhase],
  );

  // ── ERROR PHASE ──
  if (phase === "error") {
    return (
      <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#01454A] mb-2">Session Failed</h2>
          <p className="text-sm text-[#7A6B44] mb-6">{error}</p>
          <button
            onClick={() => {
              setPhase("modal");
              setShowModal(true);
              setError(null);
            }}
            className="rounded-xl bg-[#01454A] hover:bg-[#016B73] text-white
                       font-semibold text-sm px-6 py-3 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── INITIATING PHASE ──
  if (phase === "initiating") {
    return (
      <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#FDA600]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FDA600] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[#FDA600]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#01454A] mb-2">Creating your scan session...</h2>
          <p className="text-sm text-[#7A6B44]">Preparing AI model and camera permissions</p>
        </div>
      </div>
    );
  }

  // ── TUTORIAL + MODAL PHASE ──
  return (
    <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#01454A]/8 border border-[#01454A]/15 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FDA600] animate-pulse" />
            <span className="text-xs font-medium text-[#01454A] tracking-wider uppercase">
              AI Body Measurement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#01454A] tracking-tight">
            30-Second Body Scan
          </h1>
          <p className="mt-2 text-sm text-[#7A6B44] max-w-sm mx-auto">
            Stand in front of your camera in fitted clothing. Our in-house AI
            captures your 14 key measurements automatically.
          </p>
        </div>

        {/* Tutorial overlay */}
        {phase === "tutorial" && (
          <ScanTutorialOverlay
            onComplete={handleTutorialComplete}
          />
        )}

        {/* Entry modal */}
        <MeasurementEntryModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            router.back();
          }}
          onSubmit={handleEntrySubmit}
        />

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[#7A6B44]/60">
          All measurements are processed on our servers. No video is stored or
          transmitted — only pose landmark coordinates.
        </p>
      </div>
    </div>
  );
}
