import { redirect } from "next/navigation";

export default async function LegacyRegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; returnUrl?: string }>;
}) {
  const params = await searchParams;
  const role = params.role;
  const returnUrl =
    params.returnUrl && params.returnUrl.startsWith("/") ? params.returnUrl : undefined;

  if (role === "vendor" || role === "client") {
    const suffix = returnUrl
      ? `?role=${role}&returnUrl=${encodeURIComponent(returnUrl)}`
      : `?role=${role}`;
    redirect(`/auth/sign-up${suffix}`);
  }

  if (returnUrl) {
    redirect(`/auth/choose-role?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  redirect("/auth/choose-role");
}
