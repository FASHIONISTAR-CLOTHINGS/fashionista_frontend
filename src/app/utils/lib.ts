import { cookies } from "next/headers";

export const checkUserRole = async () => {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  return role;
};
