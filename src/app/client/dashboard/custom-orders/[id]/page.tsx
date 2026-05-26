// src/app/client/dashboard/custom-orders/[id]/page.tsx
import { ClientCustomOrderDetailView } from "@/features/client/components/client-custom-order-view";

export const metadata = {
  title: "Custom Order Detail | Fashionistar Client",
  description: "View your bespoke commission details and make milestone payments.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ClientCustomOrderDetailView orderId={id} />;
}
