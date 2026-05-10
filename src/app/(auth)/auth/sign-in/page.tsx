import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";


export const metadata: Metadata = {
  title: "Sign In — FASHIONISTAR",
  description:
    "Sign in to your FASHIONISTAR AI account to access exclusive collections and AI-powered size recommendations.",
  robots: { index: false, follow: false },
};

/**
 * Canonical sign-in page — /auth/sign-in
 * Enterprise URL naming convention (Stripe / Vercel / Shopify standard).
 * The legacy /login route redirects here permanently.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 animate-in fade-in-0 duration-300">
          {/* Logo + Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bon-foyage text-primary tracking-wide mb-1">
              FASHIONISTAR
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back — sign in to continue
            </p>
          </div>

          {/* Login Form — includes email/phone toggle, Google button, redirect logic */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
