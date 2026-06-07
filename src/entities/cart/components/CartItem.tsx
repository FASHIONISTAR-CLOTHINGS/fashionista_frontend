"use client";

/**
 * entities/cart/components/CartItem.tsx
 * Individual cart line item with quantity controls, size badge,
 * measurement gate indicator, and optimistic remove.
 * Integrates with CartContext or parent state via callbacks.
 */

import { useState } from "react";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/shared/ui";
import { SizeBadge } from "@/entities/product/components/SizeBadge";

interface CartItemData {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  vendor_name?: string;
  size?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  requires_measurement?: boolean;
  has_measurement?: boolean;
  is_gift?: boolean;
  sustainability_score?: number;
  carbon_footprint_kg?: number;
  max_quantity?: number;
  is_in_stock?: boolean;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange?: (itemId: string, qty: number) => Promise<void>;
  onRemove?: (itemId: string) => Promise<void>;
  showSustainability?: boolean;
  className?: string;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  showSustainability = false,
  className = "",
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQtyChange = async (newQty: number) => {
    if (!onQuantityChange || isUpdating) return;
    if (newQty < 1 || newQty > (item.max_quantity ?? 99)) return;
    setIsUpdating(true);
    try {
      await onQuantityChange(item.id, newQty);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove || isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={`flex gap-4 py-4 border-b border-white/8 transition-opacity duration-200 ${
        isRemoving ? "opacity-30" : "opacity-100"
      } ${className}`}
    >
      {/* Product image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/6 relative">
        {item.product_image ? (
          <FashionistarImage
            src={item.product_image}
            alt={item.product_name}
            fill
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
        )}

        {/* Sustainability indicator */}
        {showSustainability && item.sustainability_score && item.sustainability_score >= 70 && (
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-[8px]">🌱</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Vendor */}
        {item.vendor_name && (
          <p className="text-[10px] text-amber-400/80 font-medium uppercase tracking-wide truncate mb-0.5">
            {item.vendor_name}
          </p>
        )}
        {/* Name */}
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {item.product_name}
        </p>

        {/* Attributes row */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {item.size && (
            <SizeBadge
              size={item.size}
              availability={item.is_in_stock ? "in_stock" : "out_of_stock"}
              className="w-8 h-6 text-[10px]"
            />
          )}
          {item.color && (
            <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-white/6 rounded-md">
              {item.color}
            </span>
          )}
          {item.requires_measurement && !item.has_measurement && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <span>📏</span> Needs measurements
            </span>
          )}
          {item.requires_measurement && item.has_measurement && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span>✓</span> Custom fit
            </span>
          )}
        </div>

        {/* Sustainability details */}
        {showSustainability && item.carbon_footprint_kg !== undefined && (
          <p className="text-[10px] text-slate-500 mt-1">
            🌍 {item.carbon_footprint_kg.toFixed(2)} kg CO₂
          </p>
        )}
      </div>

      {/* Right column: price + quantity */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        {/* Price */}
        <p className="text-sm font-bold text-white">
          ₦{item.total_price.toLocaleString("en-NG")}
        </p>
        {item.quantity > 1 && (
          <p className="text-[10px] text-slate-500">
            ₦{item.unit_price.toLocaleString("en-NG")} each
          </p>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-1 mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQtyChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="w-7 h-7 p-0 rounded-lg text-sm"
            aria-label="Decrease quantity"
          >
            −
          </Button>
          <span className="w-7 text-center text-sm font-semibold text-white tabular-nums">
            {isUpdating ? "…" : item.quantity}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQtyChange(item.quantity + 1)}
            disabled={item.quantity >= (item.max_quantity ?? 99) || isUpdating}
            className="w-7 h-7 p-0 rounded-lg text-sm"
            aria-label="Increase quantity"
          >
            +
          </Button>
        </div>

        {/* Remove */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="mt-2 text-[10px] text-slate-500 hover:text-red-400 p-0 h-auto font-medium hover:bg-transparent"
          aria-label={`Remove ${item.product_name}`}
        >
          {isRemoving ? "Removing…" : "Remove"}
        </Button>
      </div>
    </div>
  );
}
