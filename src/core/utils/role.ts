import { cookies } from "next/headers";

import {
  getCanonicalDashboardPath,
  normalizeCanonicalRole,
} from "@/features/auth/lib/auth-routing";

export const checkUserRole = async () => {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  return role;
};

export const getCanonicalRoleFromCookie = async () => {
  const role = await checkUserRole();
  return normalizeCanonicalRole(role);
};

export const getDashboardPathFromCookie = async () => {
  const role = await checkUserRole();
  return getCanonicalDashboardPath(role);
};
