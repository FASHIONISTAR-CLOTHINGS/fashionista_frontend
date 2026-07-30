"use client";
/**
 * @file /client/dashboard/measurements/scan/qr/page.tsx
 * @description TASK-062: Auth-protected QR gateway page for desktop users.
 *
 * Rendered when device detection routes a desktop user to the QR handoff flow.
 * Reads session data from URL search params (passed by _client.tsx after initiate).
 *
 * URL params:
 *   ?session_id={uuid}         — the scan session ID
 *   ?height_cm={number}        — user's height for pre-filling on mobile
 *   ?age={number}              — user's age
 *   ?weight_kg={number}        — user's weight (optional)
 *
 * Behaviour:
 *   - Displays DesktopQRGateway with QR code from sessionStorage
 *   - On "Refresh" (session expired): calls initiateBodyScan again, updates QR
 *   - On "Cancel": navigates back
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { DesktopQRGateway } from "@/features/measurements/components/DesktopQRGateway";
import { initiateBodyScan } from "@/features/measurements/api/scan.api";

export const dynamic = "force-dynamic";

// ─── Inner component (reads search params) ────────────────────────────────────

function QRGatewayInner() {
  const router  = useRouter();
  const params  = useSearchParams();

  const sessionId      = params.get("session_id")  ?? "";
  const measurementUrl = params.get("murl")        ?? "";
  const heightCm       = params.get("height_cm")   ?? "";
  const age            = params.get("age")          ?? "";
  const weightKg       = params.get("weight_kg")   ?? "";

  // QR b64 comes from sessionStorage (too large for URL params)
  const [qrCodeB64, setQrCodeB64] = useState<string>("");
  const [activeSid, setActiveSid] = useState<string>(sessionId);
  const [activeMurl, setActiveMurl] = useState<string>(measurementUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load QR b64 from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("fashionistar_measurement_entry");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.qr_code_b64) {
          setQrCodeB64(parsed.qr_code_b64);
        }
        if (parsed.measurement_url && !measurementUrl) {
          setActiveMurl(parsed.measurement_url);
        }
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [measurementUrl]);

  // ── Refresh handler (called on session expiry) ────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const session = await initiateBodyScan({ device_type: "web" });
      setActiveSid(session.session_id);
      setActiveMurl(session.measurement_url);
      setQrCodeB64(session.qr_code_b64);

      // Update sessionStorage
      try {
        const stored = sessionStorage.getItem("fashionistar_measurement_entry");
        const existing = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify({
          ...existing,
          session_id:      session.session_id,
          measurement_url: session.measurement_url,
          qr_code_b64:     session.qr_code_b64,
          timestamp:       Date.now(),
        }));
      } catch {
        // sessionStorage not available
      }

      // Update URL without full page reload
      const newParams = new URLSearchParams({
        session_id: session.session_id,
        murl:       session.measurement_url,
        ...(heightCm  && { height_cm:  heightCm }),
        ...(age       && { age }),
        ...(weightKg  && { weight_kg:  weightKg }),
      });
      router.replace(`/client/dashboard/measurements/scan/qr?${newParams.toString()}`);
    } catch (err) {
      console.error("[QRGateway] Failed to refresh session:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [router, heightCm, age, weightKg]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Generating new QR code…</p>
        </div>
      </div>
    );
  }

  return (
    <DesktopQRGateway
      sessionId={activeSid}
      measurementUrl={activeMurl}
      qrCodeB64={qrCodeB64}
      onRefresh={handleRefresh}
      onCancel={handleCancel}
    />
  );
}

// ─── Exported page (wrapped in Suspense for useSearchParams) ──────────────────

export default function QRGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin" />
      </div>
    }>
      <QRGatewayInner />
    </Suspense>
  );
}
