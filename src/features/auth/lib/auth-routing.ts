import type { CanonicalRole } from "@/features/auth/lib/auth.types";
import { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

export { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

export function getCanonicalDashboardPath(
  role?: string | null,
  isStaff = false,
): string {
  const canonicalRole = normalizeCanonicalRole(role, isStaff);

  if (canonicalRole === "admin") {
    return "/admin-dashboard";
  }

  if (canonicalRole === "vendor") {
    return "/vendor/dashboard";
  }

  return "/client/dashboard";
}

export function getPostAuthRedirectPath({
  role,
  isStaff = false,
  hasVendorProfile = true,
  returnUrl,
}: {
  role?: string | null;
  isStaff?: boolean;
  hasVendorProfile?: boolean;
  returnUrl?: string | null;
}): string {
  const canonicalRole = normalizeCanonicalRole(role, isStaff);

  if (canonicalRole === "admin") {
    return "/admin-dashboard";
  }

  if (canonicalRole === "vendor") {
    return hasVendorProfile ? "/vendor/dashboard" : "/vendor/setup";
  }

  if (returnUrl && returnUrl.startsWith("/")) {
    return returnUrl;
  }

  return "/client/dashboard";
}

export function isRoleAllowed(
  requiredRole: CanonicalRole | CanonicalRole[],
  actualRole?: CanonicalRole,
): boolean {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return Boolean(actualRole && allowedRoles.includes(actualRole));
}
