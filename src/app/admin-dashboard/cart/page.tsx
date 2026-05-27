import { CartsDashboard } from "@/features/cart";

export default function AdminCartsPage() {
  return (
    <section className="space-y-8">
      <h1 className="font-satoshi text-3xl font-semibold leading-10 text-black">
        Shopping Cart Sessions
      </h1>
      <CartsDashboard />
    </section>
  );
}
