"use client";
/**
 * @file DesktopQRGateway.tsx
 * @description TASK-060: Premium desktop QR code gateway for measurement handoff.
 *
 * Displayed when a desktop/laptop user initiates a body scan.
 * The scan must be done on a mobile device — this page bridges the gap.
 *
 * UI Sections:
 *  1. Header      — animated phone icon + instructional headline
 *  2. QR Code     — brand-coloured PNG from backend base64, Framer Motion reveal
 *  3. URL field   — copyable scan link with Golden Yellow copy flash
 *  4. Share row   — Copy / Email / WhatsApp / Twitter / WebShare API
 *  5. Timer       — 24h session countdown with auto-refresh on expiry
 *  6. Footer      — privacy note
 *
 * Brand Compliance:
 *  - Forest Green #2D6A4F (primary)
 *  - Golden Yellow #F4C430 (accent / copy flash)
 *  - Near-black #0A0A0A (background)
 *  - White text only
 *
 * Animations (Framer Motion):
 *  - QR card:    scale(0.85→1) + opacity(0→1), spring, delay 0.1s
 *  - Share row:  staggered opacity(0→1), 0.08s each
 *  - Copy flash: background color → #F4C430 for 1.5s on copy success
 *  - Timer:      pulses amber when < 30 min remaining
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DesktopQRGatewayProps {
  /** The scan session UUID */
  sessionId:      string;
  /** Full measurement URL (https://fashionistar.net/scan/{id}) */
  measurementUrl: string;
  /** Base64 PNG QR code (without data: prefix) */
  qrCodeB64:      string;
  /** Called when user clicks "Generate new code" (session expired) */
  onRefresh?: () => void;
  /** Called when user clicks "Cancel" */
  onCancel?: () => void;
  className?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconPhone = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
);

const IconCopy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);

const IconEmail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.013 5.3 5.95-5.3zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Expired";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function DesktopQRGateway({
  sessionId,
  measurementUrl,
  qrCodeB64,
  onRefresh,
  onCancel,
  className,
}: DesktopQRGatewayProps) {
  const [copied, setCopied]           = useState(false);
  const [remaining, setRemaining]     = useState(SESSION_TTL_SECONDS);
  const [isExpired, setIsExpired]     = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Copy link ────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(measurementUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create temp input
      const el = document.createElement("input");
      el.value = measurementUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [measurementUrl]);

  // ── Native share (mobile / supported browsers) ───────────────────────────────
  const handleNativeShare = useCallback(async () => {
    if (!("share" in navigator)) return;
    try {
      await navigator.share({
        title: "FASHIONISTAR — Your Body Scan Link",
        text:  "Complete your AI body measurement on your phone:",
        url:   measurementUrl,
      });
    } catch {
      // User dismissed share sheet — no action needed
    }
  }, [measurementUrl]);

  // ── WhatsApp share ───────────────────────────────────────────────────────────
  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `📏 FASHIONISTAR AI Body Scan\nScan your QR code or open this link on your phone:\n${measurementUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [measurementUrl]);

  // ── Twitter / X share ────────────────────────────────────────────────────────
  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `Getting my perfect fit with @FASHIONISTAR AI body scan! 📏✨`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(measurementUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [measurementUrl]);

  // ── Email share ──────────────────────────────────────────────────────────────
  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent("FASHIONISTAR — Complete your AI body scan");
    const body = encodeURIComponent(
      `Hi,\n\nClick the link below to complete your FASHIONISTAR AI body measurement scan on your phone:\n\n${measurementUrl}\n\nSession expires in 24 hours.\n\n— FASHIONISTAR`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [measurementUrl]);

  // ── Timer colour ─────────────────────────────────────────────────────────────
  const isWarning = remaining < 30 * 60 && !isExpired;   // < 30 min
  const isCritical = remaining < 5 * 60 && !isExpired;   // < 5 min

  const timerColor = isCritical
    ? "#EF4444"
    : isWarning
    ? "#F4C430"
    : "#52B788";

  // ── Share button definition ──────────────────────────────────────────────────
  const shareButtons = [
    {
      id:      "copy-link",
      label:   copied ? "Copied!" : "Copy Link",
      icon:    copied ? <IconCheck /> : <IconCopy />,
      onClick: handleCopy,
      accent:  copied,
    },
    {
      id:      "share-email",
      label:   "Email",
      icon:    <IconEmail />,
      onClick: handleEmail,
      accent:  false,
    },
    {
      id:      "share-whatsapp",
      label:   "WhatsApp",
      icon:    <IconWhatsApp />,
      onClick: handleWhatsApp,
      accent:  false,
    },
    {
      id:      "share-twitter",
      label:   "Twitter / X",
      icon:    <IconX />,
      onClick: handleTwitter,
      accent:  false,
    },
    ...("share" in (typeof navigator !== "undefined" ? navigator : {})
      ? [{
          id:      "native-share",
          label:   "More…",
          icon:    <IconPhone />,
          onClick: handleNativeShare,
          accent:  false,
        }]
      : []),
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D1810] to-[#0A0A0A] flex items-center justify-center px-4 py-12 ${className ?? ""}`}>

      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, #2D6A4F33 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-[#2D6A4F]/40"
            style={{ background: "linear-gradient(135deg, #2D6A4F22, #2D6A4F44)" }}
          >
            <span className="text-3xl">📱</span>
          </motion.div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Scan with Your Phone
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xs mx-auto">
            Your AI body scan requires a mobile camera. Scan the QR code or share
            the link to continue on your phone.
          </p>
        </div>

        {/* ── QR Code Card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
          className="rounded-2xl p-6 mb-6 flex flex-col items-center"
          style={{
            background:   "linear-gradient(135deg, #0F1F17, #162a1c)",
            border:       "1px solid #2D6A4F40",
            boxShadow:    "0 8px 40px rgba(45,106,79,0.15), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {isExpired ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="text-4xl">⏰</div>
              <p className="text-white/60 text-sm text-center">
                This scan session has expired.
              </p>
              <button
                id="qr-gateway-refresh"
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#2D6A4F", color: "#fff" }}
              >
                <IconRefresh /> Generate New Code
              </button>
            </div>
          ) : qrCodeB64 ? (
            <>
              {/* QR Image */}
              <div
                className="rounded-xl overflow-hidden p-2"
                style={{ background: "#0A0A0A", border: "2px solid #2D6A4F50" }}
              >
                <img
                  id="qr-code-image"
                  src={`data:image/png;base64,${qrCodeB64}`}
                  alt="QR Code — scan with your phone to start body measurement"
                  width={200}
                  height={200}
                  className="block"
                />
              </div>

              <p className="mt-4 text-xs text-white/40 text-center">
                Open your phone camera and point it at the QR code
              </p>
            </>
          ) : (
            /* Loading skeleton */
            <div className="w-[200px] h-[200px] rounded-xl bg-[#2D6A4F]/10 animate-pulse flex items-center justify-center">
              <div className="text-white/20 text-sm">Generating…</div>
            </div>
          )}
        </motion.div>

        {/* ── Scan URL field ────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
            Or copy the link
          </label>
          <div className="flex gap-2">
            <div
              className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white/60 font-mono overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ background: "#111B15", border: "1px solid #2D6A4F30" }}
              title={measurementUrl}
            >
              {measurementUrl}
            </div>
            <motion.button
              id="qr-gateway-copy-btn"
              onClick={handleCopy}
              whileTap={{ scale: 0.95 }}
              animate={{ backgroundColor: copied ? "#F4C430" : "#2D6A4F" }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold shrink-0"
              style={{ color: copied ? "#0A0A0A" : "#fff" }}
              aria-label="Copy measurement link to clipboard"
            >
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? "Copied!" : "Copy"}
            </motion.button>
          </div>
        </div>

        {/* ── Share buttons ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">
            Share via
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {shareButtons.map((btn, i) => (
              <motion.button
                key={btn.id}
                id={btn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.25 }}
                onClick={btn.onClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  background: btn.accent ? "#F4C430" : "#111B15",
                  border:     `1px solid ${btn.accent ? "#F4C430" : "#2D6A4F30"}`,
                  color:      btn.accent ? "#0A0A0A" : "#fff",
                }}
                aria-label={btn.label}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Session timer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-6"
          style={{ background: "#111B15", border: "1px solid #2D6A4F20" }}
        >
          <span className="text-xs text-white/40">Session expires in</span>
          <motion.span
            key={isWarning ? "warning" : "ok"}
            animate={isWarning ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-mono font-semibold"
            style={{ color: timerColor }}
          >
            {formatCountdown(remaining)}
          </motion.span>
        </div>

        {/* ── Cancel ────────────────────────────────────────────────────────── */}
        {onCancel && (
          <div className="text-center">
            <button
              id="qr-gateway-cancel"
              onClick={onCancel}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Cancel and go back
            </button>
          </div>
        )}

        {/* ── Privacy footer ────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-white/20 mt-6">
          🔒 No video stored • Only pose coordinates transmitted • Session ID: {sessionId.slice(0, 8)}…
        </p>
      </motion.div>
    </div>
  );
}
