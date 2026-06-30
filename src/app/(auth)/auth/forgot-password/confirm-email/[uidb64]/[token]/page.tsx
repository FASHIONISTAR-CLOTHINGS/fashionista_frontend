import type { Metadata } from "next";
import { PasswordResetConfirmForm } from "@/features/auth/components/PasswordResetConfirmForm";

export const metadata: Metadata = {
  title: "Reset Password — FASHIONISTAR",
  description: "Set a new password for your FASHIONISTAR AI account.",
  robots: { index: false, follow: false },
};

/**
 * Canonical email reset confirm page — /auth/forgot-password/confirm-email/[uidb64]/[token]
 *
 * Reached when user clicks the reset link in their email:
 *   /api/v1/auth/password/reset-email-confirm/<uidb64>/<token>/ (Django)
 *   → Frontend receives uidb64 + token as URL params
 *
 * Renders PasswordResetConfirmForm in email mode.
 * On success: redirects to /auth/sign-in
 *
 * Legacy /password-recovery/[uidb64]/[token] redirects here.
 */
export default async function ForgotPasswordConfirmEmailPage({
  params,
}: {
  params: Promise<{ uidb64: string; token: string }>;
}) {
  const { uidb64, token } = await params;

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
              Choose a new password for your account
            </p>
          </div>

          <PasswordResetConfirmForm mode="email" uidb64={uidb64} token={token} />
        </div>
      </div>
    </div>
  );
}
