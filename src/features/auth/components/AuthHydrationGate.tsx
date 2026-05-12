"use client";

import { useIsHydrated } from "@/lib/react/useIsHydrated";

interface AuthHydrationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthHydrationGate({
  children,
  fallback = null,
}: AuthHydrationGateProps) {
  const hydrated = useIsHydrated();

  if (!hydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
