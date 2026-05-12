import type { Metadata } from "next";
import { PasswordResetForm } from "@/features/auth/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Forgot Password — FASHIONISTAR",
  description: "Reset your FASHIONISTAR AI account password via email or phone.",
  robots: { index: false, follow: false },
};

/**
 * Canonical forgot-password page — /auth/forgot-password
 *
 * Renders the PasswordResetForm which supports:
 *   - Email mode: sends reset link → shows "check your email" state
 *   - Phone mode: sends SMS OTP → redirects to /auth/forgot-password/confirm-phone
 *
 * Legacy /forgot-password permanently redirects here.
 * Pattern mirrors /auth/sign-in and /auth/sign-up.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8 animate-in fade-in-0 duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bon-foyage text-primary tracking-wide mb-1">
              FASHIONISTAR
            </h1>
            <p className="text-muted-foreground text-sm">
              Reset your password — choose a method below
            </p>
          </div>

          <PasswordResetForm />
        </div>
      </div>
    </div>
  );
}
