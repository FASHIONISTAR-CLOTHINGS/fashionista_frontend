export type CanonicalRole = "client" | "vendor" | "admin";

export interface AuthSessionMirror {
  authenticated: boolean;
  role?: CanonicalRole;
}

export interface PersistedAuthUserLike {
  role?: string | null;
  is_staff?: boolean;
  has_client_profile?: boolean;
  has_vendor_profile?: boolean;
  client_profile?: Record<string, unknown> | null;
  vendor_profile?: Record<string, unknown> | null;
}

export interface PersistedAuthStateLike {
  accessToken?: string | null;
  refreshToken?: string | null;
  isAuthenticated?: boolean;
  user?: PersistedAuthUserLike | null;
}
