import { OrderDetailView } from "@/features/order";

export default async function ClientOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  return <OrderDetailView orderId={order_id} backHref="/client/dashboard/orders" scope="client" />;
}
