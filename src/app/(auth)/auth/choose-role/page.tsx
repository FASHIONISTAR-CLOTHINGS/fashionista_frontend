import type { Metadata } from "next";
import { Suspense } from "react";
import { ChooseRoleOptions } from "@/features/auth/components/ChooseRoleOptions";

export const metadata: Metadata = {
  title: "Create Account — FASHIONISTAR",
  description:
    "Join FASHIONISTAR AI — choose whether you're a Client shopper or a Vendor selling fashion.",
  robots: { index: false, follow: false },
};

/**
 * /auth/choose-role — Role selection page (Phase 7)
 *
 * Users MUST choose Client or Vendor before reaching the registration form.
 * This is the canonical entry point for all "Register" / "Sign Up" links.
 *
 * Design: Two prominent cards — Vendor and Client — matching the Figma design.
 * Mobile-first, responsive.
 *
 * Wrapped in Suspense because ChooseRoleOptions calls useSearchParams()
 * which requires a Suspense boundary in Next.js App Router.
 */
export default function ChooseRolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ChooseRoleOptions />
    </Suspense>
  );
}
