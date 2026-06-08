import { cookies } from "next/headers";

import {
  getCanonicalDashboardPath,
  normalizeCanonicalRole,
} from "@/features/auth/lib/auth-routing";

export const checkUserRole = async () => {
  const cookieStore = await cookies();
  console.log("Fashionista: ", cookieStore.get("role")?.value);
  return cookieStore.get("role")?.value;
};

export const getCanonicalRoleFromCookie = async () => {
  const role = await checkUserRole();
  return normalizeCanonicalRole(role);
};

export const getDashboardPathFromCookie = async () => {
  const role = await checkUserRole();
  return getCanonicalDashboardPath(role);
};
