"use client";
/**
 * AuthAwareSignInPage — Client wrapper for the Sign-In page.
 *
 * AUTH-AWARENESS: If the user is already authenticated when they navigate
 * to /auth/sign-in, we immediately redirect them back to where they were
 * (or to their role-appropriate dashboard) with a toast notification.
 *
 * This prevents already-authenticated users from re-authenticating, and
 * also covers the case where an admin/vendor manually types /auth/sign-in
 * into the URL bar while already logged in.
 *
 * Security posture: Checks sessionStorage-persisted Zustand auth state
 * which is hydrated synchronously on mount (no flash of the login form).
 */
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";
import { useIsHydrated } from "@/lib/react/useIsHydrated";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function AuthAwareSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useIsHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const returnUrl = searchParams.get("returnUrl") ?? "";

  useEffect(() => {
    // Wait for Zustand sessionStorage rehydration before checking auth state.
    // Without this guard, SSR renders always see isAuthenticated=false (the
    // initial default), causing a flash of the login form before redirect.
    if (!hydrated) return;

    if (isAuthenticated && user) {
      // User is already logged in — redirect to appropriate destination.
      const destination = getPostAuthRedirectPath({
        role: user.role,
        isStaff: user.is_staff,
        hasVendorProfile: user.has_vendor_profile ?? false,
        returnUrl: returnUrl || null,
      });

      // Show a friendly informational toast before redirecting.
      const displayName = user.first_name || user.email || "there";
      toast.info(`Welcome back, ${displayName}! 👋`, {
        description: "You're already signed in. Redirecting you now…",
        duration: 3000,
      });

      // Use replace() so the browser back button doesn't return to the sign-in
      // page after the redirect — otherwise UX would be confusing.
      const timeoutId = setTimeout(() => {
        router.replace(destination);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [hydrated, isAuthenticated, user, router, returnUrl]);

  // While Zustand is rehydrating OR if the user is already authenticated,
  // show a neutral loading spinner instead of the login form.
  // This prevents the login form from flashing before the redirect fires.
  if (!hydrated || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
      </div>
    );
  }

  // User is NOT authenticated — render the login form normally.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8 animate-in fade-in-0 duration-300">
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
