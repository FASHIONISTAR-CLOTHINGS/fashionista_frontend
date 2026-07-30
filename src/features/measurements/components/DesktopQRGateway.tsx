"use client";

/**
 * @file DesktopQRGateway.tsx
 * @description QR code display component for desktop → mobile scan handoff.
 *
 * When a desktop user initiates a scan, they can't use their webcam for
 * body measurement capture. Instead, we display a QR code that links to
 * the scan URL. The user scans it with their phone and completes the scan
 * on mobile.
 *
 * Features:
 *   - Large QR code display (from base64 or generated from URL)
 *   - "Scan with your phone" instruction
 *   - Session ID + expiry timer
 *   - Refresh + Cancel buttons
 *   - Brand-compliant Forest Green design
 */

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FashionistarImage } from "@/components/media";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DesktopQRGatewayProps {
  sessionId:       string;
  measurementUrl:  string;
  qrCodeB64:       string;
  onRefresh:       () => void;
  onCancel:        () => void;
  className?:      string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SESSION_TTL_SECONDS = 600; // 10 minutes

// ─── Component ────────────────────────────────────────────────────────────────

export function DesktopQRGateway({
  sessionId,
  measurementUrl,
  qrCodeB64,
  onRefresh,
  onCancel,
  className,
}: DesktopQRGatewayProps) {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_TTL_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsLeft(SESSION_TTL_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = secondsLeft <= 0;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D1810] to-[#0A0A0A] flex items-center justify-center px-4 py-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
            <span className="text-xs font-semibold text-[#52B788] tracking-wider uppercase">
              Scan Ready
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Scan with Your Phone
          </h1>
          <p className="text-sm text-white/50 max-w-xs mx-auto">
            Point your phone camera at the QR code below to open the AI body scan on your mobile device.
          </p>
        </div>

        {/* QR Code Display */}
        <div className="relative rounded-2xl bg-white p-6 mx-auto w-fit shadow-2xl">
          {qrCodeB64 ? (
            <FashionistarImage
              src={`data:image/png;base64,${qrCodeB64}`}
              alt="Scan QR code to start body measurement"
              width={240}
              height={240}
              className="rounded-lg"
              showBlurUp={false}
              objectFit="contain"
            />
          ) : measurementUrl ? (
            <div className="w-[240px] h-[240px] flex items-center justify-center text-center text-xs text-gray-500 p-4">
              QR code unavailable. Visit the URL directly.
            </div>
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin" />
            </div>
          )}

          {/* Expiry badge */}
          {!isExpired && (
            <div className="absolute -top-3 -right-3 rounded-full bg-[#F4C430] text-[#0A0A0A] text-xs font-bold px-3 py-1 shadow-lg">
              ⏱ {timeDisplay}
            </div>
          )}
        </div>

        {/* Expired warning */}
        {isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 px-4 py-3 text-center"
          >
            <p className="text-sm text-[#DC2626] font-medium">
              ⚠ QR code expired. Generate a new one to continue.
            </p>
          </motion.div>
        )}

        {/* Session ID (small, for debugging) */}
        <p className="mt-4 text-center text-[10px] text-white/20 font-mono">
          Session: {sessionId.slice(0, 8)}...
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10
                       font-semibold text-sm py-3 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onRefresh}
            disabled={isExpired === false && secondsLeft > 300}
            className="flex-1 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white
                       font-semibold text-sm py-3 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isExpired ? "Generate New QR" : "Refresh QR"}
          </button>
        </div>

        {/* Privacy footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          🔒 No video stored — only pose coordinates are processed
        </p>
      </motion.div>
    </div>
  );
}
