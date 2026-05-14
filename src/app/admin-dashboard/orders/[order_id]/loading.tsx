import { ProductDetailSkeleton } from "@/shared/components/skeletons";

export default function AdminOrderDetailLoading() {
  return (
    <div aria-label="Loading order detail" aria-busy="true">
      <ProductDetailSkeleton />
    </div>
  );
}
