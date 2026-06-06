"use client";

/**
 * features/cart/components/PromoCodeInput.tsx
 * Promo/coupon code entry with validation, success state, and error feedback.
 * Integrates with Django cart API: POST /api/v1/ninja/cart/apply-promo/
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/shared/ui";

interface PromoCodeInputProps {
  appliedCode?: string | null;
  onApply: (code: string) => Promise<{ success: boolean; message?: string; discount?: number }>;
  onRemove?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function PromoCodeInput({
  appliedCode,
  onApply,
  onRemove,
  isLoading,
  className = "",
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);

  const handleApply = useCallback(async () => {
    if (!code.trim()) return;
    setStatus("loading");
    setMessage(null);

    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result.success) {
        setStatus("success");
        setDiscount(result.discount ?? null);
        setMessage(result.message ?? "Promo code applied!");
        setCode("");
      } else {
        setStatus("error");
        setMessage(result.message ?? "Invalid promo code.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to apply code. Please try again.");
    }
  }, [code, onApply]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;
    setStatus("loading");
    await onRemove();
    setStatus("idle");
    setDiscount(null);
    setMessage(null);
  }, [onRemove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleApply();
  };

  // ── Applied state ─────────────────────────────────────────────────────────
  if (appliedCode) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎉</span>
            <div>
              <span className="text-xs font-bold text-emerald-300 font-mono">{appliedCode}</span>
              {discount && (
                <p className="text-[10px] text-emerald-400/80 mt-0.5">
                  −₦{discount.toLocaleString()} saved
                </p>
              )}
            </div>
          </div>
          {onRemove && (
            <button
              onClick={handleRemove}
              disabled={status === "loading"}
              className="text-xs text-emerald-400/70 hover:text-red-400 transition-colors"
              id="promo-remove-btn"
              aria-label="Remove promo code"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Input state ───────────────────────────────────────────────────────────
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (status !== "idle") { setStatus("idle"); setMessage(null); }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Promo code"
            maxLength={24}
            className={`w-full h-10 px-3 rounded-xl text-sm font-mono bg-white/8 border transition-all text-white placeholder-slate-500
              focus:outline-none focus:bg-white/12
              ${status === "error"
                ? "border-red-500/50 focus:border-red-400"
                : status === "success"
                ? "border-emerald-500/50"
                : "border-white/15 focus:border-amber-500/60"
              }`}
            id="promo-code-input"
            aria-label="Enter promo code"
            aria-describedby={message ? "promo-feedback" : undefined}
            autoComplete="off"
            autoCapitalize="characters"
          />
          {code && (
            <button
              onClick={() => { setCode(""); setStatus("idle"); setMessage(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              aria-label="Clear code"
            >
              ✕
            </button>
          )}
        </div>
        <Button
          onClick={handleApply}
          isLoading={status === "loading" || isLoading}
          disabled={!code.trim() || status === "loading"}
          variant="secondary"
          size="md"
          id="promo-apply-btn"
        >
          Apply
        </Button>
      </div>

      {/* Feedback */}
      {message && (
        <p
          id="promo-feedback"
          className={`text-xs px-2 ${status === "error" ? "text-red-400" : "text-emerald-400"}`}
          role="status"
          aria-live="polite"
        >
          {status === "error" ? "⚠️" : "✓"} {message}
        </p>
      )}
    </div>
  );
}
