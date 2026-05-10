import type { ReactNode } from "react";
import { VendorProductBuilderWrapper } from "./VendorProductBuilderWrapper";

export default function VendorProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VendorProductBuilderWrapper>{children}</VendorProductBuilderWrapper>;
}
