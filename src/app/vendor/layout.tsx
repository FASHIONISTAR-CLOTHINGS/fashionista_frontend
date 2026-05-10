import { VendorShell } from "@/features/vendor";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorShell>{children}</VendorShell>;
}
