import type { CanonicalRole } from "@/features/auth/lib/auth.types";

export const CLIENT_RAW_ROLES = new Set(["client", "super_client", "customer"]);
export const VENDOR_RAW_ROLES = new Set(["vendor", "super_vendor"]);
export const STAFF_RAW_ROLES = new Set([
  "admin",
  "super_admin",
  "staff",
  "super_staff",
  "support",
  "super_support",
  "editor",
  "super_editor",
  "assistant",
  "super_assistant",
  "moderator",
  "super_moderator",
]);

export function normalizeRawRole(role?: string | null): string {
  return (role ?? "").trim().toLowerCase();
}

export function normalizeCanonicalRole(
  role?: string | null,
  isStaff = false,
): CanonicalRole | undefined {
  const normalizedRole = normalizeRawRole(role);

  if (isStaff || STAFF_RAW_ROLES.has(normalizedRole)) {
    return "admin";
  }

  if (VENDOR_RAW_ROLES.has(normalizedRole)) {
    return "vendor";
  }

  if (CLIENT_RAW_ROLES.has(normalizedRole)) {
    return "client";
  }

  return undefined;
}
