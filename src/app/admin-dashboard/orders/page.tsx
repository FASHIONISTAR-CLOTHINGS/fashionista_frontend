import { OrderList } from "@/features/order";

export default function AdminOrdersPage() {
  return (
    <section className="space-y-8">
      <h1 className="font-satoshi text-3xl font-semibold leading-10 text-black">
        Orders
      </h1>
      <OrderList />
    </section>
  );
}
