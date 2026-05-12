"use client";
/**
 * OTPVerifyForm Component — Feature Auth
 *
 * Phase 4a: Rich error display — exact DRF error messages, not generic
 * Phase 4b: Resend OTP — sends { email_or_phone } (fixed from { email, phone })
 * Phase 4c: OTP identifier displayed from pendingOTPEmail | pendingOTPPhone
 * Phase 5:  Smart post-auth redirect (vendor → dashboard/setup, client → returnUrl)
 * Phase 8:  suppressHydrationWarning
 *
 * Used after: register, login (if OTP required), forgot password
 * Uses: 6 individual input boxes, auto-advance, paste support
 */
import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

import { verifyOTP, resendOTP } from "@/features/auth/services/auth.service";
import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";
import { normalizeAuthUser } from "@/features/auth/lib/normalize-auth-user";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { mergeAnonymousCommerce } from "@/features/cart";
import { RichErrorMessage } from "@/components/shared/feedback/RichErrorMessage";
import { parseApiError } from "@/lib/api/parseApiError";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function OTPVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser, pendingOTPEmail, pendingOTPPhone } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [verifyError, setVerifyError] = useState<ReturnType<typeof parseApiError> | null>(null);
  const [resendError, setResendError] = useState<ReturnType<typeof parseApiError> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // returnUrl — carry through from login/register
  const returnUrl = searchParams.get("returnUrl") ?? "";

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: () =>
      verifyOTP({
        otp: otp.join(""),
        email: pendingOTPEmail,
        phone: pendingOTPPhone,
      }),
    onSuccess: async (data) => {
      setVerifyError(null);
      setTokens(data.access ?? "", data.refresh ?? "");
      setUser(normalizeAuthUser(data));

      const displayName = data.user?.first_name ?? data.identifying_info ?? "User";
      toast.success("✅ Verification successful!", {
        description: `Welcome to Fashionistar, ${displayName}! 🎉`,
        duration: 4000,
      });

      try {
        await mergeAnonymousCommerce();
      } catch {
        // Checkout submit repeats the idempotent merge before order creation.
      }

      router.push(
        getPostAuthRedirectPath({
          role: data.role ?? data.user?.role,
          hasVendorProfile: data.has_vendor_profile,
          isStaff: data.user?.is_staff,
          returnUrl,
        }),
      );

    },
    onError: (error) => {
      const parsed = parseApiError(error, "Invalid or expired OTP. Please check the code and try again.");
      setVerifyError(parsed);
      toast.error("Verification Failed", {
        description: parsed.message,
        duration: 6000,
      });
      // Clear OTP inputs and refocus first box
      setOtp(Array(OTP_LENGTH).fill(""));
      requestAnimationFrame(() => {
        inputRefs.current[0]?.focus();
      });
    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () => {
      // Phase 4b fix: Backend ResendOTPRequestSerializer expects { email_or_phone }
      // We derive it from the displayed identifier (pendingOTPEmail or pendingOTPPhone)
      const email_or_phone = pendingOTPEmail ?? pendingOTPPhone ?? "";
      return resendOTP({ email_or_phone });
    },
    onSuccess: () => {
      setResendError(null);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.info("OTP Resent ✉️", {
        description: `A new 6-digit code has been sent to ${pendingOTPEmail ?? pendingOTPPhone}.`,
        duration: 4000,
      });
    },
    onError: (error) => {
      const parsed = parseApiError(error, "Could not resend OTP. Please try again.");
      setResendError(parsed);
      toast.error("Resend Failed", {
        description: parsed.message,
        duration: 6000,
      });
    },
  });

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Clear any previous error on new input
    if (digit) setVerifyError(null);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && index === OTP_LENGTH - 1 && newOtp.every(Boolean)) {
      verify();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);
    setVerifyError(null);
    const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Auto-submit if fully pasted
    if (pasted.length === OTP_LENGTH) {
      setTimeout(() => verify(), 100);
    }
  };

  const isComplete = otp.every(Boolean);
  const identifier = pendingOTPEmail ?? pendingOTPPhone ?? "your email/phone";

  return (
    <div className="space-y-6">
      {/* ── Recipient display ────────────────────────────────────────── */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">{identifier}</span>
        </p>
      </div>

      {/* ── Verify error ────────────────────────────────────────────── */}
      {verifyError && <RichErrorMessage parsed={verifyError} />}

      {/* ── OTP Inputs ──────────────────────────────────────────────── */}
      <div
        className="flex gap-2 justify-center"
        onPaste={handlePaste}
        suppressHydrationWarning
      >
        {Array(OTP_LENGTH)
          .fill(null)
          .map((_, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold
                border-2 rounded-xl bg-background transition-all duration-150
                focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-1
                focus:outline-none
                ${otp[index] ? "border-primary/60 bg-primary/5" : "border-input"}
                ${verifyError ? "border-destructive/60" : ""}
              `}
              aria-label={`OTP digit ${index + 1} of ${OTP_LENGTH}`}
              autoComplete="one-time-code"
              suppressHydrationWarning
            />
          ))}
      </div>

      {/* ── Verify Button ────────────────────────────────────────────── */}
      <button
        id="otp-verify-btn"
        onClick={() => verify()}
        disabled={!isComplete || isVerifying}
        className="
          w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl
          font-semibold text-sm hover:bg-primary/90
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2
          shadow-sm hover:shadow-md active:scale-[0.99]
        "
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify Code"
        )}
      </button>

      {/* ── Resend OTP ───────────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        {resendError && (
          <RichErrorMessage parsed={resendError} className="text-left" />
        )}
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in{" "}
            <span className="font-semibold text-foreground tabular-nums">{countdown}s</span>
          </p>
        ) : (
          <button
            id="otp-resend-btn"
            onClick={() => resend()}
            disabled={isResending}
            className="
              text-sm text-primary font-semibold hover:underline
              flex items-center gap-1.5 mx-auto
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Sending…" : "Resend Code"}
          </button>
        )}
      </div>
    </div>
  );
}
