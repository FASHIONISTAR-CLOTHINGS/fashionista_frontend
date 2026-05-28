import { AdminOrderList } from "@/features/admin-dashboard/order";

export default function AdminOrdersPage() {
  return (
    <section className="space-y-8">
      <h1 className="font-satoshi text-3xl font-semibold leading-10 text-black">
        Orders
      </h1>
      <AdminOrderList />
    </section>
  );
}
