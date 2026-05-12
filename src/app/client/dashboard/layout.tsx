"use client";

import { ErrorBoundary } from "@/shared";
import { ClientShell } from "@/features/client";

export default function ClientDashboardLayout({
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
