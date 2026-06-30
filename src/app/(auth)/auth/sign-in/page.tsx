import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthAwareSignInPage } from "@/features/auth/components/AuthAwareSignInPage";

export const metadata: Metadata = {
  title: "Sign In — FASHIONISTAR",
  description:
    "Sign in to your FASHIONISTAR AI account to access exclusive collections and AI-powered size recommendations.",
  robots: { index: false, follow: false },
};

/**
 * Canonical sign-in page — /auth/sign-in
 *
 * AUTH-AWARENESS: Wrapped in AuthAwareSignInPage which detects already-
 * authenticated users and redirects them immediately with a friendly toast.
 * This prevents re-authentication and handles the case where admin/vendor
 * users manually type /auth/sign-in into the URL bar while logged in.
 *
 * Wrapped in Suspense because AuthAwareSignInPage calls useSearchParams()
 * which requires a Suspense boundary in Next.js App Router.
 *
 * URL naming: Enterprise convention (Stripe / Vercel / Shopify standard).
 * The legacy /auth/login route redirects here permanently.
 */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthAwareSignInPage />
    </Suspense>
  );
}

