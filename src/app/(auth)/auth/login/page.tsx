import { redirect } from "next/navigation";

export default async function LegacyLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const params = await searchParams;

  if (params.returnUrl && params.returnUrl.startsWith("/")) {
    redirect(`/auth/sign-in?returnUrl=${encodeURIComponent(params.returnUrl)}`);
  }

  redirect("/auth/sign-in");
}
