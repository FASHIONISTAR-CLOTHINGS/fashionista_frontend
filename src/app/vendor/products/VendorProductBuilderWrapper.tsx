"use client";

/**
 * @file VendorProductBuilderWrapper.tsx
 * @description Client-side wrapper that injects required context into
 * ProductBuilderProvider. Reads vendorId from the session/auth store.
 * Placed here so the parent layout.tsx stays a Server Component.
 */

import { useVendorProfile } from "@/features/vendor/hooks/use-vendor-setup";
import { ProductBuilderProvider } from "@/features/product";
import { toast } from "sonner";
import type { ProductBuilderFormValues } from "@/features/product/builder/schemas/builder.schemas";

export function VendorProductBuilderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pull the authenticated vendor profile to get the vendorId.
  // While loading (or unauthenticated), fall back to a no-op provider.
  const { data: vendor } = useVendorProfile();
  const vendorId = vendor?.id ?? "unknown";

  const handleSubmit = async (
    _values: ProductBuilderFormValues,
    _productId: string | null,
  ): Promise<void> => {
    // The actual submit logic is handled at the step level (Step8Publish).
    // This top-level handler is called only if Step8 bubbles up a final confirm.
    toast.info("Finalising product draft…");
  };

  return (
    <ProductBuilderProvider vendorId={vendorId} onSubmit={handleSubmit}>
      {children}
    </ProductBuilderProvider>
  );
}
