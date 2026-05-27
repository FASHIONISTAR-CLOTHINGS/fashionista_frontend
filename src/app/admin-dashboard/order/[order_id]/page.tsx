import { AdminOrderDetailView } from "@/features/admin-dashboard";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  return <AdminOrderDetailView orderId={order_id} backHref="/admin-dashboard/order" />;
}
