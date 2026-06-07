"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AuthHydrationGate } from "@/features/auth/components/AuthHydrationGate";
import { getCanonicalDashboardPath, isRoleAllowed, normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";
import type { CanonicalRole } from "@/features/auth/lib/auth.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

interface RoleGuardProps {
  requiredRole: CanonicalRole | CanonicalRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireClientProfile?: boolean;
  requireVendorProfile?: boolean;
}

export function RoleGuard({
  requiredRole,
  children,
  fallback = null,
  requireClientProfile = false,
  requireVendorProfile = false,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useIsHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const role = useMemo(
    () => normalizeCanonicalRole(user?.role, user?.is_staff === true),
    [user?.is_staff, user?.role],
  );
  const profileGateFailed =
    (requireVendorProfile && user?.has_vendor_profile !== true) ||
    (requireClientProfile && user?.has_client_profile !== true);
  const queryString = searchParams.toString();
  const returnUrl = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      const timer = setTimeout(() => {
        router.replace(`/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (!isRoleAllowed(requiredRole, role)) {
      const timer = setTimeout(() => {
        router.replace(getCanonicalDashboardPath(user?.role, user?.is_staff === true));
      }, 0);
      return () => clearTimeout(timer);
    }

    if (profileGateFailed) {
      const timer = setTimeout(() => {
        router.replace(role === "vendor" ? "/vendor/setup" : "/client/dashboard");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    accessToken,
    hydrated,
    isAuthenticated,
    pathname,
    returnUrl,
    profileGateFailed,
    requiredRole,
    role,
    router,
    searchParams,
    user?.is_staff,
    user?.role,
  ]);

  if (
    !hydrated ||
    !isAuthenticated ||
    !accessToken ||
    !isRoleAllowed(requiredRole, role) ||
    profileGateFailed
  ) {
    return <>{fallback}</>;
  }

  return <AuthHydrationGate fallback={fallback}>{children}</AuthHydrationGate>;
}
