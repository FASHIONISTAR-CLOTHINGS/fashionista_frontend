import type { CanonicalRole } from "@/features/auth/lib/auth.types";
import { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

export { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

type RedirectAudience = "public" | CanonicalRole;

function isSafeRelativeReturnUrl(path?: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

function getRedirectAudience(path: string): RedirectAudience {
  if (path.startsWith("/admin-dashboard")) {
    return "admin";
  }

  if (path.startsWith("/vendor")) {
    return "vendor";
  }

  if (path.startsWith("/client/dashboard")) {
    return "client";
  }

  return "public";
}

function resolveRoleCompatibleReturnUrl({
  canonicalRole,
  hasVendorProfile,
  returnUrl,
}: {
  canonicalRole: CanonicalRole;
  hasVendorProfile: boolean;
  returnUrl?: string | null;
}): string | null {
  if (!isSafeRelativeReturnUrl(returnUrl)) {
    return null;
  }

  const audience = getRedirectAudience(returnUrl);

  if (audience === "public") {
    return returnUrl;
  }

  if (audience === "admin") {
    return canonicalRole === "admin" ? returnUrl : null;
  }

  if (audience === "client") {
    return canonicalRole === "client" ? returnUrl : null;
  }

  if (canonicalRole !== "vendor") {
    return null;
  }

  if (hasVendorProfile) {
    return returnUrl;
  }

  return returnUrl === "/vendor/setup" ? returnUrl : null;
}

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
  const canonicalRole = normalizeCanonicalRole(role, isStaff) ?? "client";
  const compatibleReturnUrl = resolveRoleCompatibleReturnUrl({
    canonicalRole,
    hasVendorProfile,
    returnUrl,
  });

  if (compatibleReturnUrl) {
    return compatibleReturnUrl;
  }

  if (canonicalRole === "admin") {
    return "/admin-dashboard";
  }

  if (canonicalRole === "vendor") {
    return hasVendorProfile ? "/vendor/dashboard" : "/vendor/setup";
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
