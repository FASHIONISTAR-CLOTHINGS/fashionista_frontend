"use client";

import { ErrorBoundary } from "@/shared";
import { ClientShell } from "@/features/client";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ClientShell>{children}</ClientShell>
    </ErrorBoundary>
  );
}
