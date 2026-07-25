/**
 * @file app/components/VerifyInput.tsx
 * @description Legacy VerifyInput stub — superseded by the auth feature.
 * This stub exists to prevent build errors in legacy (auth) pages.
 */

"use client";

import React from "react";

interface VerificationInputProps {
  length?: number;
  onChange?: (value: string) => void;
}

export default function VerificationInput({
  length = 4,
  onChange,
}: VerificationInputProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          inputMode="numeric"
          pattern="[0-9]"
          className="h-14 w-12 text-center text-xl font-bold border-2 border-[#01454A]/30 rounded-xl focus:border-[#01454A] focus:outline-none transition-colors"
          onChange={(e) => {
            // Move to next input on single character entry
            if (e.target.value.length === 1) {
              const next = e.target.nextElementSibling as HTMLInputElement | null;
              next?.focus();
            }
            // Collect all values and notify
            if (onChange) {
              const inputs = e.target.parentElement?.querySelectorAll("input");
              const value = Array.from(inputs ?? []).map((el) => (el as HTMLInputElement).value).join("");
              onChange(value);
            }
          }}
        />
      ))}
    </div>
  );
}
