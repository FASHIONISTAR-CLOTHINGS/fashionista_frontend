// features/vendor/components/bank-accounts/PinEntryModal.tsx
/**
 * PinEntryModal — OPay/Palmpay-style 4-digit PIN pad.
 *
 * UX Design:
 *  - 4 circular dot indicators (filled ● vs empty ○) for each entered digit
 *  - 12-key numeric grid (1-9, delete, 0, confirm)
 *  - Haptic-like shake animation on wrong PIN
 *  - Loading spinner while verifying via backend
 *  - No text input — purely tap/click-driven for security UX
 *
 * Usage:
 *  <PinEntryModal
 *    open={step === "pin"}
 *    title="Confirm Payout"
 *    subtitle="Enter your 4-digit wallet PIN to proceed"
 *    onCancel={() => setStep("form")}
 *    onVerified={() => submitPayout()}
 *    isSubmitting={payoutMutation.isPending}
 *  />
 */
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Delete, Loader2, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVerifyVendorPin } from "@/features/vendor/hooks/use-vendor-orders";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PinEntryModalProps {
  open:         boolean;
  title?:       string;
  subtitle?:    string;
  /** Called when modal is dismissed without completing PIN */
  onCancel:     () => void;
  /** Called AFTER PIN is verified on the backend */
  onVerified:   () => void;
  /** True while the parent mutation (e.g. payout) is processing */
  isSubmitting?: boolean;
}

// ── Keypad Layout ─────────────────────────────────────────────────────────────

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["DEL", "0", "OK"],
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PinEntryModal({
  open,
  title = "Confirm Wallet PIN",
  subtitle = "Enter your 4-digit transaction PIN to authorize",
  onCancel,
  onVerified,
  isSubmitting = false,
}: PinEntryModalProps) {
  const verifyPin = useVerifyVendorPin();

  const [digits, setDigits]   = useState<string[]>([]);
  const [shake,  setShake]    = useState(false);
  const [error,  setError]    = useState("");

  // ── Reset on open/close
  useEffect(() => {
    if (open) {
      setDigits([]);
      setError("");
      setShake(false);
      verifyPin.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-submit when 4 digits entered
  useEffect(() => {
    if (digits.length === 4) {
      void handleVerify();
    }
  }, [digits]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard support
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") pressKey(e.key);
      if (e.key === "Backspace") pressKey("DEL");
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, digits]); // eslint-disable-line react-hooks/exhaustive-deps

  function pressKey(key: string) {
    if (verifyPin.isPending || isSubmitting) return;
    setError("");
    if (key === "DEL") {
      setDigits((prev) => prev.slice(0, -1));
    } else if (key === "OK") {
      if (digits.length === 4) void handleVerify();
    } else if (digits.length < 4) {
      setDigits((prev) => [...prev, key]);
    }
  }

  async function handleVerify() {
    if (digits.length < 4) return;
    const pin = digits.join("");
    try {
      const result = await verifyPin.mutateAsync({ pin });
      if (result.valid) {
        setError("");
        // Brief success flash before calling onVerified
        await new Promise((r) => setTimeout(r, 200));
        onVerified();
      } else {
        triggerShake("Invalid PIN. Please try again.");
      }
    } catch {
      triggerShake("PIN verification failed. Please try again.");
    }
  }

  function triggerShake(message: string) {
    setError(message);
    setShake(true);
    setDigits([]);
    setTimeout(() => setShake(false), 600);
  }

  if (!open) return null;

  const isLoading = verifyPin.isPending || isSubmitting;
  const filled    = digits.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={cn(
          "relative w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden",
          "bg-gradient-to-b from-[#1A1208] to-[#120D05]",
          "border border-[#FDA600]/20",
        )}
        id="pin-entry-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FDA600]/15">
              <ShieldCheck className="h-4 w-4 text-[#FDA600]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-[11px] text-[#7A6B44]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7A6B44] hover:text-white hover:bg-white/5 transition-all"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* PIN Dots */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={shake ? "shake" : "normal"}
              animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className="flex justify-center gap-4"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all duration-200",
                    i < filled
                      ? "bg-[#FDA600] border-[#FDA600] scale-110"
                      : "bg-transparent border-[#4A3F2A]",
                    error && "border-red-500",
                  )}
                  animate={i < filled ? { scale: [1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.12 }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[11px] text-red-400 font-medium mt-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Numeric Keypad */}
        <div className="px-5 pb-6 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#FDA600]" />
            </div>
          ) : (
            KEYPAD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2">
                {row.map((key) => (
                  <KeypadButton
                    key={key}
                    label={key}
                    disabled={isLoading}
                    onClick={() => pressKey(key)}
                    isDestructive={key === "DEL"}
                    isConfirm={key === "OK"}
                    isEnabled={key === "OK" ? filled === 4 : true}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Security note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-[#4A3F2A]">
            🔒 PIN is never stored in plaintext. Secured end-to-end.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Keypad Button Sub-component ───────────────────────────────────────────────

interface KeypadButtonProps {
  label:         string;
  onClick:       () => void;
  disabled?:     boolean;
  isDestructive?: boolean;
  isConfirm?:    boolean;
  isEnabled?:    boolean;
}

function KeypadButton({
  label,
  onClick,
  disabled = false,
  isDestructive = false,
  isConfirm = false,
  isEnabled = true,
}: KeypadButtonProps) {
  const isDisabled = disabled || (isConfirm && !isEnabled);

  return (
    <motion.button
      type="button"
      whileHover={isDisabled ? {} : { scale: 1.04 }}
      whileTap={isDisabled ? {} : { scale: 0.94 }}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "flex items-center justify-center rounded-2xl py-4 text-sm font-bold",
        "transition-all duration-100 select-none",
        isConfirm && isEnabled
          ? "bg-[#FDA600] text-black hover:bg-[#f28705] shadow-lg shadow-[#FDA600]/20"
          : isDestructive
          ? "bg-[#2A1F0A] text-[#7A6B44] hover:bg-[#3A2F1A] hover:text-white"
          : "bg-[#2A1F0A] text-white hover:bg-[#3A2F1A]",
        isDisabled && "opacity-40 cursor-not-allowed",
      )}
      aria-label={
        label === "DEL" ? "Delete last digit"
          : label === "OK" ? "Confirm PIN"
          : `Digit ${label}`
      }
      id={`pin-key-${label.toLowerCase()}`}
    >
      {label === "DEL" ? (
        <Delete className="h-4 w-4" />
      ) : label === "OK" ? (
        "OK"
      ) : (
        label
      )}
    </motion.button>
  );
}
