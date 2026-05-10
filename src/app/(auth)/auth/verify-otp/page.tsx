import type { Metadata } from "next";
import { OTPVerifyForm } from "@/features/auth/components/OTPVerifyForm";

export const metadata: Metadata = {
  title: "Verify OTP",
  description: "Enter your verification code to complete authentication.",
  robots: { index: false, follow: false },
};

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-satoshi text-foreground">
              Verify Your Identity
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code to continue
            </p>
          </div>

          <OTPVerifyForm />
        </div>
      </div>
    </div>
  );
}
