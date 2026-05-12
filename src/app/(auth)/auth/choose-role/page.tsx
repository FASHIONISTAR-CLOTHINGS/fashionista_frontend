import type { Metadata } from "next";
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
 */
export default function ChooseRolePage() {
  return (
    <ChooseRoleOptions />
  );
}
