"use client";

import { ErrorBoundary } from "@/components";
import { VendorShell } from "@/features/vendor";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <VendorShell>{children}</VendorShell>
    </ErrorBoundary>
  );
}
