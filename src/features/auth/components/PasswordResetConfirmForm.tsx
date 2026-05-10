/**
 * PasswordResetConfirmForm — Shared form for email + phone reset confirm.
 * Unified FSD implementation.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, KeyRound } from "lucide-react";
import {
  PasswordResetConfirmEmailSchema,
  PasswordResetConfirmPhoneSchema,
  type PasswordResetConfirmEmailPayload,
  type PasswordResetConfirmPhonePayload,
} from "@/features/auth/schemas/auth.schemas";
import {
  confirmPasswordResetEmail,
  confirmPasswordResetPhone,
} from "@/features/auth/services/auth.service";
import { AuthAlert, FieldError } from "@/components/shared/feedback/AuthAlert";
import { parseApiError } from "@/lib/api/parseApiError";

// ── Unified Props ─────────────────────────────────────────────────────────────

interface EmailModeProps {
  mode: "email";
  uidb64: string;
  token: string;
}

interface PhoneModeProps {
  mode: "phone";
}

type PasswordResetConfirmFormProps = EmailModeProps | PhoneModeProps;
type PasswordResetConfirmValues = {
  uidb64?: string;
  token?: string;
  otp?: string;
  new_password: string;
  new_password_confirm: string;
};

// ── Unified Form ──────────────────────────────────────────────────────────────

export function PasswordResetConfirmForm(props: PasswordResetConfirmFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  const isEmailMode = props.mode === "email";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const scheduleSignInRedirect = () => {
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
    }

    // Use a hard navigation so the auth shell fully refreshes after reset success.
    redirectTimeoutRef.current = window.setTimeout(() => {
      window.location.assign("/auth/sign-in");
    }, 1400);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetConfirmValues>({
    resolver: zodResolver(
      isEmailMode ? PasswordResetConfirmEmailSchema : PasswordResetConfirmPhoneSchema
    ),
    defaultValues: isEmailMode
      ? { uidb64: (props as EmailModeProps).uidb64, token: (props as EmailModeProps).token, new_password: "", new_password_confirm: "" }
      : { otp: "", new_password: "", new_password_confirm: "" },
  });

  const emailMutation = useMutation({
    mutationFn: confirmPasswordResetEmail,
    onSuccess: (data) => {
      setErrorMsg(null);
      setSuccessMsg(data.message ?? "Password reset successful! You can now sign in.");
      scheduleSignInRedirect();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    },
  });

  const phoneMutation = useMutation({
    mutationFn: confirmPasswordResetPhone,
    onSuccess: (data) => {
      setErrorMsg(null);
      setSuccessMsg(data.message ?? "Password reset successful!");
      scheduleSignInRedirect();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    },
  });

  const isPending = isEmailMode ? emailMutation.isPending : phoneMutation.isPending;

  const onSubmit = (data: PasswordResetConfirmValues) => {
    setErrorMsg(null);

    if (isEmailMode) {
      emailMutation.mutate(data as PasswordResetConfirmEmailPayload);
      return;
    }

    phoneMutation.mutate(data as PasswordResetConfirmPhonePayload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Hidden URL fields for Email Mode */}
      {isEmailMode && (
        <>
          <input type="hidden" {...register("uidb64")} />
          <input type="hidden" {...register("token")} />
        </>
      )}

      {successMsg && (
        <AuthAlert variant="success" message={successMsg} autoDismissMs={3000} />
      )}
      {errorMsg && (
        <AuthAlert
          variant="error"
          message={errorMsg}
          autoDismissMs={8000}
          onDismiss={() => setErrorMsg(null)}
        />
      )}

      {/* OTP Code (Only for phone mode) */}
      {!isEmailMode && (
        <div className="space-y-1.5">
          <label htmlFor="phone-otp" className="text-sm font-medium text-foreground">
            SMS Verification Code
          </label>
          <input
            id="phone-otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            {...register("otp")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
            placeholder="6-digit code"
          />
          <FieldError message={errors.otp?.message as string} />
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the SMS?{" "}
            <a href="/auth/forgot-password" className="text-primary hover:underline font-medium">
              Request a new code
            </a>
          </p>
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="text-sm font-medium text-foreground">
          New Password
        </label>
        <div className="relative" suppressHydrationWarning>
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="new-password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            {...register("new_password")}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            placeholder="Use a strong password or passphrase"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError message={errors.new_password?.message as string} />
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
          Confirm New Password
        </label>
        <div className="relative" suppressHydrationWarning>
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            {...register("new_password_confirm")}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            placeholder="Repeat your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? "Hide" : "Show"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError message={errors.new_password_confirm?.message as string} />
      </div>

      {/* Submit Button */}
      <button
        id="pw-reset-submit"
        type="submit"
        disabled={isPending || !!successMsg}
        className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting Password…
          </>
        ) : successMsg ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            Redirecting to Sign In…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Set New Password
          </>
        )}
      </button>

      {/* Helper text for Email Mode */}
      {isEmailMode && (
        <p className="text-center text-xs text-muted-foreground">
          Remembered your password?{" "}
          <a href="/auth/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      )}
    </form>
  );
}
