import { ProductDetailSkeleton } from "@/components";

export default function AdminOrderDetailLoading() {
  return (
    <div aria-label="Loading order detail" aria-busy="true">
      <ProductDetailSkeleton />
    </div>
  );
}
