import type { AuthUser } from "@/features/auth/store/auth.store";
import { normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return readString(value);
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeAuthUser(payload: unknown): AuthUser {
  const root = isRecord(payload) ? payload : {};
  const nestedUser = isRecord(root.user) ? root.user : root;

  const firstName =
    readString(nestedUser.first_name) ??
    readString(root.identifying_info) ??
    "User";
  const lastName = readString(nestedUser.last_name) ?? "";
  const isStaff = readBoolean(nestedUser.is_staff, readBoolean(root.is_staff));
  const normalizedRole = normalizeCanonicalRole(
    readString(nestedUser.role) ?? readString(root.role),
    isStaff,
  );

  return {
    id:
      readString(nestedUser.user_id) ??
      readString(root.user_id) ??
      readString(nestedUser.id) ??
      readString(root.id) ??
      "",
    email:
      readString(nestedUser.email) ??
      (readString(root.identifying_info)?.includes("@")
        ? readString(root.identifying_info)
        : undefined),
    phone:
      readString(nestedUser.phone) ??
      (readString(root.identifying_info)?.startsWith("+")
        ? readString(root.identifying_info)
        : undefined),
    first_name: firstName,
    last_name: lastName,
    role: normalizedRole,
    is_verified: readBoolean(
      nestedUser.is_verified,
      readBoolean(root.is_verified, true),
    ),
    is_staff: isStaff,
    has_client_profile: readBoolean(
      nestedUser.has_client_profile,
      readBoolean(root.has_client_profile),
    ),
    has_vendor_profile: readBoolean(
      nestedUser.has_vendor_profile,
      readBoolean(root.has_vendor_profile),
    ),
    client_profile: isRecord(nestedUser.client_profile)
      ? nestedUser.client_profile
      : isRecord(root.client_profile)
        ? root.client_profile
        : null,
    vendor_profile: isRecord(nestedUser.vendor_profile)
      ? nestedUser.vendor_profile
      : isRecord(root.vendor_profile)
        ? root.vendor_profile
        : null,
    avatar:
      readNullableString(nestedUser.avatar) ??
      readNullableString(root.avatar) ??
      null,
    date_joined: readString(nestedUser.date_joined) ?? readString(root.date_joined),
  };
}
