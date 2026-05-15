"use client";

import { ErrorBoundary } from "@/shared";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
