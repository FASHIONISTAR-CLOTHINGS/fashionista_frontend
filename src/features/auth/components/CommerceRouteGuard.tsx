"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { getCanonicalDashboardPath, normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

interface CommerceRouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CommerceRouteGuard({
  children,
  fallback = null,
}: CommerceRouteGuardProps) {
  const hydrated = useIsHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const canonicalRole = normalizeCanonicalRole(user?.role, user?.is_staff === true);
  const isBlockedRole = canonicalRole === "admin" || canonicalRole === "vendor";

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user || !isBlockedRole) {
      return;
    }

    toast.error("Client access is required for this page.", {
      id: "fashionistar-commerce-route-guard",
      description:
        "Cart, checkout, wishlist, and order pages are reserved for client accounts.",
      duration: 4500,
    });
    const destination = getCanonicalDashboardPath(user.role, user.is_staff === true);
    window.setTimeout(() => {
      window.location.replace(destination);
    }, 150);
  }, [hydrated, isAuthenticated, isBlockedRole, user]);

  if (!hydrated) {
    return <>{fallback}</>;
  }

  if (isAuthenticated && isBlockedRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
