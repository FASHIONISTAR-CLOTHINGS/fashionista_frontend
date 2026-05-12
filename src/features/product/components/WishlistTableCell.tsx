/**
 * @file WishlistTableCell.tsx
 * @description Wishlist table row component.
 * Uses canonical WishlistItem type, live useToggleWishlist(),
 * optimized Next.js Image, and accessible action buttons.
 */
"use client";
import Image from "next/image";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useToggleWishlist } from "../hooks/use-product";
import type { WishlistItem } from "../types/product.types";

interface WishlistTableCellProps {
  item: WishlistItem;
  /** Called after item is removed so parent can refetch */
  onAddToCart?: (productId: string) => void;
}

const WishlistTableCell = ({ item, onAddToCart }: WishlistTableCellProps) => {
  const { product } = item;
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  const handleRemove = () => {
    toggleWishlist(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const isInStock = product.in_stock && !product.requires_measurement;

  return (
    <tr className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
      {/* Product image + title */}
      <td className="flex items-center gap-3 py-4 md:px-4">
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 56px, 64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </div>
        <span className="text-[#475367] font-medium text-sm md:text-base font-raleway line-clamp-2">
          {product.title}
        </span>
      </td>

      {/* Price */}
      <td className="text-[#475367] font-medium font-raleway text-sm md:text-base whitespace-nowrap px-2">
        {product.currency ?? "₦"}
        {Number(product.price).toLocaleString("en-NG")}
      </td>

      {/* Stock status */}
      <td className="px-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
            isInStock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isInStock ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {isInStock ? "In stock" : "Out of stock"}
        </span>
      </td>

      {/* Add to cart */}
      <td className="px-2">
        <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="flex items-center gap-1.5 px-3 py-2 max-w-[6rem] w-full
                     rounded-full bg-[#02A445] text-white text-xs md:text-sm font-medium
                     font-raleway whitespace-nowrap transition-colors
                     hover:bg-[#028038] disabled:opacity-40 disabled:cursor-not-allowed
                     focus-visible:ring-2 focus-visible:ring-[#02A445]"
          aria-label={`Add ${product.title} to cart`}
        >
          <ShoppingCart size={14} />
          Add to cart
        </button>
      </td>

      {/* Remove from wishlist */}
      <td className="text-center px-3">
        <button
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Remove ${product.title} from wishlist`}
          className="text-[#475367] hover:text-red-500 transition-colors
                     disabled:opacity-40 p-1 rounded
                     focus-visible:ring-2 focus-visible:ring-red-400"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </td>
    </tr>
  );
};

export default WishlistTableCell;
