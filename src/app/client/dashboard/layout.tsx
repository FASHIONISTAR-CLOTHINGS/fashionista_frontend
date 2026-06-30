"use client";

import { ErrorBoundary } from "@/components";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
