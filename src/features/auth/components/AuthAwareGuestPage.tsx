"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

interface AuthAwareGuestPageProps {
  children: React.ReactNode;
}

export function AuthAwareGuestPage({ children }: AuthAwareGuestPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useIsHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const returnUrl = searchParams.get("returnUrl") ?? searchParams.get("next") ?? "";

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) {
      return;
    }

    const destination = getPostAuthRedirectPath({
      role: user.role,
      isStaff: user.is_staff,
      hasVendorProfile: user.has_vendor_profile ?? false,
      returnUrl: returnUrl || null,
    });
    const displayName = user.first_name || user.email || "there";

    toast.info(`Welcome back, ${displayName}! 👋`, {
      description: "You're already signed in. Redirecting you now…",
      duration: 3000,
    });

    const timeoutId = setTimeout(() => {
      router.replace(destination);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [hydrated, isAuthenticated, returnUrl, router, user]);

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

  return <>{children}</>;
}
