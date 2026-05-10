/**
 * Structured chat offer bubble.
 */

"use client";

import type { OfferData } from "../types/chat.types";

export interface OfferCardProps {
  offer: OfferData;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-[#01454A]/15 bg-[#F4F3EC] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#01454A]">
        Vendor offer
      </p>
      <p className="mt-2 text-sm font-semibold text-[#141414]">
        {offer.product_title_snapshot}
      </p>
      <div className="mt-2 flex items-center justify-between text-sm text-black/75">
        <span>Qty {offer.quantity}</span>
        <span className="font-semibold text-[#141414]">
          {offer.currency} {offer.offered_price}
        </span>
      </div>
      <p className="mt-2 text-xs text-black/55">Status: {offer.status}</p>
    </div>
  );
}
