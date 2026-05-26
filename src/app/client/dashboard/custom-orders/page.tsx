// src/app/client/dashboard/custom-orders/page.tsx
import { ClientCustomOrderView } from "@/features/client/components/client-custom-order-view";

export const metadata = {
  title: "Custom Orders | Fashionistar Client",
  description: "Commission bespoke garments with milestone payment plans — 30/50/70/100%.",
};

export default function CustomOrdersPage() {
  return <ClientCustomOrderView />;
}
