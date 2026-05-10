import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up — FASHIONISTAR",
  description:
    "Join FASHIONISTAR AI — Africa's premier AI-powered fashion platform. Get personalized size recommendations and exclusive collections.",
  robots: { index: false, follow: false },
};

/**
 * Canonical sign-up page — /auth/sign-up?role=vendor|client
 *
 * Phase 7: Requires `role` searchParam from /auth/choose-role.
 * If role is missing or invalid, redirects the user back to /auth/choose-role.
 * The role is passed to RegisterForm as a prop (not user-editable in the form).
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; returnUrl?: string }>;
}) {
  const params = await searchParams;
  const role = params.role;

  // Guard: missing or invalid role → redirect to role selection
  if (!role || (role !== "vendor" && role !== "client")) {
    redirect("/auth/choose-role");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8 animate-in fade-in-0 duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-bon-foyage text-primary tracking-wide mb-1">
              FASHIONISTAR
            </h1>
            <p className="text-muted-foreground text-sm">
              {role === "vendor"
                ? "Create your Vendor account — start selling"
                : "Create your account — start shopping"}
            </p>
          </div>

          <RegisterForm
            role={role as "vendor" | "client"}
          />

        </div>
      </div>
    </div>
  );
}
