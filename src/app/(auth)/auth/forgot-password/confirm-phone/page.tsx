import type { Metadata } from "next";
import { PasswordResetConfirmForm } from "@/features/auth/components/PasswordResetConfirmForm";

export const metadata: Metadata = {
  title: "Confirm Phone Reset — FASHIONISTAR",
  description: "Enter the SMS code sent to your phone to reset your password.",
  robots: { index: false, follow: false },
};

/**
 * Canonical phone OTP confirm page — /auth/forgot-password/confirm-phone
 *
 * Reached after:
 *   /auth/forgot-password (phone tab) → SMS sent → redirect here
 *
 * Renders PasswordResetConfirmForm in phone mode:
 *   - Enter 6-digit SMS OTP
 *   - Enter new password + confirm
 *   - POSTs to /api/v1/auth/password/reset-phone-confirm/
 *   - On success: redirects to /auth/sign-in
 */
export default function ForgotPasswordConfirmPhonePage() {
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
              Enter the code sent to your phone
            </p>
          </div>

          <PasswordResetConfirmForm mode="phone" />
        </div>
      </div>
    </div>
  );
}
