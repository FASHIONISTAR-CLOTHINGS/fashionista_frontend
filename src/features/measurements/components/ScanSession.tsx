"use client";

/**
 * features/measurements/components/ScanSession.tsx
 * MirrorSize AI body scan session flow.
 * Integrates: POST /api/v1/ninja/measurements/scan-session/
 *              → { session_id, scan_url, status, expires_at }
 * Backend model: apps/measurements/models/scan.py → BodyScanSession
 * Steps: Intro → Device Selection → QR/Link → Processing → Results
 */

import { useState, useEffect, useCallback, useRef } from "react";
import ky from "ky";
import { Button, Card, LoadingSpinner } from "@/components";
import { FashionistarImage } from "@/components/media";

type ScanStep = "intro" | "device" | "scanning" | "processing" | "complete" | "error";
type DeviceType = "mobile" | "desktop";

interface ScanSessionData {
  session_id: string;
  scan_url: string;
  qr_code_base64?: string;
  status: "pending" | "scanning" | "processing" | "complete" | "failed";
  expires_at: string;
  measurement_profile_id?: string;
}

interface ScanSessionProps {
  onComplete: (profileId: string) => void;
  onSkip?: () => void;
  onFallbackToManual?: () => void;
}

export function ScanSession({ onComplete, onFallbackToManual }: ScanSessionProps) {
  const [step, setStep] = useState<ScanStep>("intro");
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile");
  const [session, setSession] = useState<ScanSessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup polling on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Initiate scan session ──────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setStep("scanning");
    setError(null);

    try {
      const data = await ky.post("/api/v1/ninja/measurements/scan-session/", {
        json: { device_type: deviceType, provider: "mirrorsize" },
      }).json<ScanSessionData>();

      setSession(data);

      // Start polling for completion
      pollRef.current = setInterval(async () => {
        try {
          const status = await ky.get(
            `/api/v1/ninja/measurements/scan-session/${data.session_id}/`
          ).json<ScanSessionData>();

          if (status.status === "processing") {
            setStep("processing");
          }

          if (status.status === "complete" && status.measurement_profile_id) {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("complete");
            setSession(status);
            // Auto-proceed after 2s
            setTimeout(() => onComplete(status.measurement_profile_id!), 2000);
          }

          if (status.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("error");
            setError("The scan failed. Please try again or enter measurements manually.");
          }

          // Expired?
          if (new Date(status.expires_at) < new Date()) {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("error");
            setError("Scan session expired. Please start a new scan.");
          }
        } catch {
          // Ignore polling errors — will retry
        }
      }, 3000);

    } catch {
      setStep("error");
      setError("Could not start scan session. Please check your connection.");
    }
  }, [deviceType, onComplete]);

  const handleCopyLink = async () => {
    if (!session?.scan_url) return;
    await navigator.clipboard.writeText(session.scan_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Step: Intro ────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl">🤳</div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Body Scan</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            Get perfectly accurate measurements in 60 seconds using your phone camera.
            No tape measure needed.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "📏", title: "±2mm", sub: "accuracy" },
            { icon: "⏱️", title: "60s",  sub: "to complete" },
            { icon: "🔒", title: "GDPR", sub: "compliant" },
          ].map(({ icon, title, sub }) => (
            <Card key={title} glass className="p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-[10px] text-slate-500">{sub}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => setStep("device")} size="lg" className="w-full" id="scan-start-btn">
            Start AI Scan
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onFallbackToManual}
            className="text-sm text-slate-400 hover:text-white transition-colors h-auto w-auto"
          >
            Enter measurements manually instead
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: Device Selection ─────────────────────────────────────────────────
  if (step === "device") {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-white text-center">How will you scan?</h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { type: "mobile" as DeviceType, icon: "📱", label: "This Device", sub: "Use your phone/tablet camera directly" },
            { type: "desktop" as DeviceType, icon: "💻", label: "Another Device", sub: "Scan QR code with your phone" },
          ].map(({ type, icon, label, sub }) => (
            <button
              key={type}
              onClick={() => setDeviceType(type)}
              className={`p-4 rounded-xl border text-left transition-all ${
                deviceType === type
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-white/12 bg-white/4 hover:border-white/25"
              }`}
              aria-pressed={deviceType === type}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep("intro")} className="flex-1">← Back</Button>
          <Button onClick={startSession} className="flex-1" id="scan-device-continue-btn">
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: Scanning (showing QR/link) ──────────────────────────────────────
  if (step === "scanning" && session) {
    return (
      <div className="space-y-5 text-center">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to Scan</h3>
          <p className="text-xs text-slate-400 mt-1">
            {deviceType === "desktop"
              ? "Scan this QR code with your phone to begin"
              : "Tap the button below to open the scanner"}
          </p>
        </div>

        {/* QR Code */}
        {deviceType === "desktop" && session.qr_code_base64 && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl">
              <FashionistarImage
                src={`data:image/png;base64,${session.qr_code_base64}`}
                alt="Scan QR Code"
                width={192}
                height={192}
                imgClassName="w-48 h-48"
              />
            </div>
          </div>
        )}

        {/* Scan link */}
        <div className="flex gap-2">
          <input
            readOnly
            value={session.scan_url}
            className="flex-1 h-9 px-3 rounded-xl bg-white/8 border border-white/15 text-xs text-white font-mono truncate"
          />
          <Button variant="secondary" size="sm" onClick={handleCopyLink} id="scan-copy-btn">
            {copied ? "✓" : "Copy"}
          </Button>
        </div>

        {deviceType === "mobile" && (
          <a href={session.scan_url} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full" size="lg" id="scan-open-btn">
              Open Scanner 📷
            </Button>
          </a>
        )}

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
          <LoadingSpinner size="sm" />
          <span>Waiting for you to complete the scan…</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onFallbackToManual}
          className="text-xs text-slate-500 hover:text-slate-400 h-auto w-auto"
        >
          Switch to manual entry
        </Button>
      </div>
    );
  }

  // ── Step: Processing ──────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Processing</h3>
          <p className="text-sm text-slate-400 mt-1">Analysing your body scan…</p>
        </div>
        <div className="space-y-1.5 text-xs text-slate-500 text-left">
          {["Detecting body landmarks…", "Calculating circumferences…", "Applying fit model…"].map((s) => (
            <p key={s} className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> {s}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // ── Step: Complete ─────────────────────────────────────────────────────────
  if (step === "complete") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-4xl animate-in zoom-in-50 duration-500">
          ✓
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Scan Complete!</h3>
          <p className="text-sm text-slate-400 mt-1">Your measurements have been saved.</p>
        </div>
        <LoadingSpinner size="sm" />
        <p className="text-xs text-slate-500">Redirecting…</p>
      </div>
    );
  }

  // ── Step: Error ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="text-5xl">❌</div>
      <p className="text-sm text-red-400">{error}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => { setStep("intro"); setSession(null); setError(null); }}>
          Try Again
        </Button>
        <Button onClick={onFallbackToManual}>Enter Manually</Button>
      </div>
    </div>
  );
}
