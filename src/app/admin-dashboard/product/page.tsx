import { ProductsDashboard } from "@/features/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — Fashionistar Admin",
  description: "Browse, manage, and verify Ankara, Agbada, and bespoke garments on displayed.",
};

export default function AdminProductsPage() {
  return <ProductsDashboard />;
}
