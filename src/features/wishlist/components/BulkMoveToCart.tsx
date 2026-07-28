"use client";

/**
 * @file BulkMoveToCart.tsx
 * @description One-click "Add All to Cart" button for wishlist.
 *
 * Psychological triggers:
 *   - Friction Reduction: One click vs N clicks
 *   - Commitment: Moving items to cart advances purchase intent
 *   - Reciprocity: Helpful bulk action rewards user engagement
 */

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { toast } from "sonner";

interface BulkMoveToCartProps {
  items: Array<{
    productId: string;
    slug: string;
    title: string;
    inStock: boolean;
  }>;
}

export function BulkMoveToCart({ items }: BulkMoveToCartProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { mutateAsync: addToCart } = useAddCartItem();

  const inStockItems = items.filter((i) => i.inStock);
  const outOfStockCount = items.length - inStockItems.length;

  const handleBulkAdd = async () => {
    if (inStockItems.length === 0) {
      toast.error("No in-stock items to add to cart.");
      return;
    }

    setProcessing(true);
    setProgress(0);
    let added = 0;
    let failed = 0;

    for (const item of inStockItems) {
      try {
        await addToCart({
          product_id: item.productId,
          product_slug: item.slug,
          quantity: 1,
        });
        added++;
      } catch {
        failed++;
      }
      setProgress((prev) => prev + 1);
    }

    setProcessing(false);

    if (added > 0) {
      toast.success(
        `Added ${added} item${added !== 1 ? "s" : ""} to cart! 🛍️` +
          (failed > 0 ? ` (${failed} failed)` : "")
      );
    } else {
      toast.error("Could not add items to cart. Please try again.");
    }

    if (outOfStockCount > 0 && added > 0) {
      toast.info(
        `${outOfStockCount} out-of-stock item${outOfStockCount !== 1 ? "s" : ""} skipped.`
      );
    }
  };

  if (items.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleBulkAdd}
      disabled={processing || inStockItems.length === 0}
      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="bulk-move-to-cart"
    >
      {processing ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Adding {progress}/{inStockItems.length}...
        </>
      ) : (
        <>
          <ShoppingCart size={15} />
          Add All to Cart ({inStockItems.length})
        </>
      )}
    </button>
  );
}
