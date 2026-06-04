// src/app/client/dashboard/custom-orders/new/page.tsx
import { ClientCustomOrderView } from "@/features/client/components/client-custom-order-view";

export const metadata = {
  title: "New Custom Order | Fashionistar Client",
  description: "Commission a bespoke garment from any Fashionistar vendor.",
};

export default function NewCustomOrderPage() {
  return <ClientCustomOrderView defaultShowCreate={true} />;
}
