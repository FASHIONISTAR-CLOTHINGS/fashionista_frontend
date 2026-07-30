"use client";
/**
 * @file ScanFallbackManual.tsx
 * @description Step 38 / TASK-027: "Can't Scan?" fallback panel for the body scan flow.
 *
 * Shown as an optional alternative on the scan page when:
 *   - Camera permission is denied (phase === 'failed' with camera error)
 *   - User explicitly clicks "Enter measurements manually"
 *
 * Routes to the existing MeasurementProfile manual creation form.
 * Ensures zero measurement friction across all user types (accessibility).
 *
 * Brand: Forest Green + Golden Yellow on dark background
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface ScanFallbackManualProps {
  /** Show as inline expandable panel (default) or full-screen modal */
  variant?: "inline" | "modal";
  /** Called when user dismisses (modal variant only) */
  onDismiss?: () => void;
  /** Destination URL for the manual form. Defaults to dashboard measurements. */
  manualEntryUrl?: string;
}

const REASONS = [
  { icon: "📷", text: "Camera permission denied" },
  { icon: "📶", text: "Slow connection / model failed to load" },
  { icon: "♿", text: "Accessibility or device limitations" },
  { icon: "👗", text: "Measurements already known" },
];

export function ScanFallbackManual({
  variant = "inline",
  onDismiss,
  manualEntryUrl = "/client/dashboard/profile",
}: ScanFallbackManualProps) {
  const router = useRouter();

  const content = (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "rgba(244,196,48,0.12)", border: "1px solid rgba(244,196,48,0.25)" }}
        >
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-black text-white">Can&apos;t use the camera?</h3>
        <p className="text-sm text-white/50 mt-1">
          No problem — enter your measurements manually in under 2 minutes.
        </p>
      </div>

      {/* Reason chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {REASONS.map(r => (
          <span
            key={r.text}
            className="flex items-center gap-1.5 text-[11px] text-white/50 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span>{r.icon}</span>
            {r.text}
          </span>
        ))}
      </div>

      {/* What you'll enter */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(45,106,79,0.08)", border: "1px solid rgba(45,106,79,0.2)" }}
      >
        <p className="text-xs font-semibold text-[#52B788] mb-2 uppercase tracking-wider">
          You&apos;ll fill in:
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {["Bust / Chest", "Waist", "Hips", "Shoulder Width",
            "Arm Length", "Inseam", "Height", "Weight (opt.)"].map(field => (
            <div key={field} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#2D6A4F]" />
              <span className="text-xs text-white/60">{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push(manualEntryUrl)}
        className="w-full rounded-2xl py-3.5 font-black text-sm transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #F4C430, #C9A227)",
          color: "#0A0A0A",
          boxShadow: "0 4px 20px rgba(244,196,48,0.3)",
        }}
        id="manual-entry-cta-btn"
      >
        Enter Measurements Manually →
      </button>

      {/* Back / dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs text-white/30 hover:text-white/60 transition-colors text-center"
          id="dismiss-fallback-btn"
        >
          Try camera again
        </button>
      )}
    </div>
  );

  if (variant === "modal") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl p-6"
          style={{
            background: "linear-gradient(145deg, #0D1810, #0A0A0A)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          initial={{ y: 60, scale: 0.95, opacity: 0 }}
          animate={{ y: 0,  scale: 1,    opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl p-5 w-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
}
