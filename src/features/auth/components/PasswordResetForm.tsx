"use client";
/**
 * PasswordResetForm Component — Feature Auth
 *
 * Two modes (toggled by tab, like LoginForm):
 *   1. EMAIL mode → POST /api/v1/auth/password/reset/ with { email }
 *      → On success: shows "check your email" confirmation.
 *   2. PHONE mode → POST /api/v1/auth/password/reset/ with { phone }
 *      → On success: redirects to /auth/forgot-password/confirm-phone
 *
 * Lives at canonical route: /auth/forgot-password
 * Legacy /forgot-password redirects here.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";

import { requestPasswordReset } from "@/features/auth/services/auth.service";
import { PhoneInputField } from "@/components/shared/forms/PhoneInputField";
import { RichErrorMessage } from "@/components/shared/feedback/RichErrorMessage";
import { parseApiError } from "@/lib/api/parseApiError";

type ResetMode = "email" | "phone";

// ── Schemas ──────────────────────────────────────────────────────────────────

const EmailResetSchema = z.object({
  identifier: z.string().email("Enter a valid email address"),
});

const PhoneResetSchema = z.object({
  identifier: z
    .string()
    .min(10, "Enter a valid phone number")
    .startsWith("+", "Phone must be in E.164 format (e.g. +2348012345678)"),
});

type ResetPayload = { identifier: string };

// ── Component ─────────────────────────────────────────────────────────────────

export function PasswordResetForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ResetMode>("email");
  const [phoneValue, setPhoneValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedIdentifier, setSubmittedIdentifier] = useState("");
  const [apiError, setApiError] = useState<ReturnType<typeof parseApiError> | null>(null);

  const emailForm = useForm<ResetPayload>({
    resolver: zodResolver(EmailResetSchema),
    defaultValues: { identifier: "" },
  });

  const phoneForm = useForm<ResetPayload>({
    resolver: zodResolver(PhoneResetSchema),
    defaultValues: { identifier: "" },
  });

  const currentForm = mode === "email" ? emailForm : phoneForm;

  const { mutate, isPending } = useMutation({
    // ✅ KEY FIX: Backend PasswordResetRequestSerializer expects `email_or_phone` (single field).
    // Sending `{ email: identifier }` or `{ phone: identifier }` → 400 Bad Request.
    // The serializer validates the value and routes to email or phone reset automatically.
    mutationFn: (data: ResetPayload) =>
      requestPasswordReset({
        email_or_phone: data.identifier,
      } as Parameters<typeof requestPasswordReset>[0]),
    onSuccess: () => {
      setApiError(null);
      const id =
        mode === "email"
          ? emailForm.getValues("identifier")
          : phoneValue;
      setSubmittedIdentifier(id);

      if (mode === "phone") {
        // Phone reset: backend sends OTP via SMS → go to OTP confirm page
        router.push("/auth/forgot-password/confirm-phone");
        return;
      }
      // Email reset: show success state
      setSubmitted(true);
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      setApiError(parsed);
    },
  });

  function toggleMode(newMode: ResetMode) {
    setMode(newMode);
    setApiError(null);
    setSubmitted(false);
    setPhoneValue("");
    emailForm.reset();
    phoneForm.reset();
  }

  function handlePhoneChange(e164: string) {
    setPhoneValue(e164);
    phoneForm.setValue("identifier", e164, { shouldValidate: false });
  }

  // ── Email submitted state ──────────────────────────────────────────────────
  if (submitted && mode === "email") {
    return (
      <div className="text-center space-y-4 py-6 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-foreground">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a password reset link to{" "}
            <span className="font-semibold text-foreground">
              {submittedIdentifier}
            </span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-primary hover:underline font-semibold"
          >
            Try again
          </button>
        </p>
        <a
          id="back-to-login-btn"
          href="/auth/sign-in"
          className="text-sm text-primary font-semibold hover:underline"
        >
          ← Back to login
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={currentForm.handleSubmit((data) => {
        setApiError(null);
        mutate(data);
      })}
      className="space-y-5"
      noValidate
    >
      {/* ── Mode toggle: Email / Phone ──────────────────────────────── */}
      <div
        className="flex rounded-xl border border-border overflow-hidden shadow-sm"
        role="tablist"
        aria-label="Reset method"
      >
        <button
          type="button"
          role="tab"
          id="reset-tab-email"
          aria-selected={mode === "email"}
          onClick={() => toggleMode("email")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === "email"
              ? "bg-primary text-primary-foreground shadow-inner"
              : "bg-background text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <Mail className="h-4 w-4" />
          Via Email
        </button>
        <button
          type="button"
          role="tab"
          id="reset-tab-phone"
          aria-selected={mode === "phone"}
          onClick={() => toggleMode("phone")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === "phone"
              ? "bg-primary text-primary-foreground shadow-inner"
              : "bg-background text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <span className="text-xs">📱</span>
          Via Phone
        </button>
      </div>

      {/* ── API Error ─────────────────────────────────────────────────── */}
      {apiError && <RichErrorMessage parsed={apiError} />}

      {/* ── Email Input ───────────────────────────────────────────────── */}
      {mode === "email" ? (
        <div className="space-y-1.5">
          <label
            htmlFor="reset-email"
            className="text-sm font-medium text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              {...emailForm.register("identifier")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              placeholder="you@fashionistar.com"
            />
          </div>
          {emailForm.formState.errors.identifier && (
            <p className="text-xs text-destructive">
              {emailForm.formState.errors.identifier.message}
            </p>
          )}
        </div>
      ) : (
        /* ── Phone Input ─────────────────────────────────────────────── */
        <div className="space-y-1.5">
          <label
            htmlFor="reset-phone"
            className="text-sm font-medium text-foreground"
          >
            Phone Number
          </label>
          <PhoneInputField
            id="reset-phone"
            onChange={handlePhoneChange}
            value={phoneValue}
            defaultCountry="NG"
            placeholder="8012345678"
            error={phoneForm.formState.errors.identifier?.message}
          />
          {/* Hidden field to satisfy React Hook Form */}
          <input
            type="hidden"
            {...phoneForm.register("identifier")}
            value={phoneValue}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll send a 6-digit code to your phone via SMS.
          </p>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <button
        id="reset-submit-btn"
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === "email" ? "Sending reset link…" : "Sending SMS code…"}
          </>
        ) : mode === "email" ? (
          "Send Reset Link"
        ) : (
          "Send SMS Code"
        )}
      </button>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <a href="/auth/sign-in" className="text-primary font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
