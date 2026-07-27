"use client";

/**
 * @file CartTrustBadges.tsx
 * @description Trust badges below checkout CTA in cart.
 *
 * Psychological triggers:
 *   - Trust: SSL, Paystack PCI-DSS, buyer protection
 *   - Authority: Verified payment processor
 *   - Reciprocity: Return policy reduces purchase anxiety
 */

import { Lock, Shield, RotateCcw, BadgeCheck } from "lucide-react";

export function CartTrustBadges() {
  const badges = [
    { icon: Lock, label: "SSL Encrypted", sub: "256-bit security" },
    { icon: Shield, label: "Paystack", sub: "PCI-DSS compliant" },
    { icon: BadgeCheck, label: "Buyer Protection", sub: "100% guaranteed" },
    { icon: RotateCcw, label: "14-Day Returns", sub: "No questions asked" },
  ] as const;

  return (
    <div
      className="mt-4 grid grid-cols-2 gap-2"
      data-testid="cart-trust-badges"
    >
      {badges.map(({ icon: Icon, label, sub }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-lg border border-[#01454A]/10 bg-[#01454A]/3 px-2.5 py-1.5"
        >
          <Icon size={13} className="text-[#01454A] shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-foreground leading-tight truncate">{label}</p>
            <p className="text-[8px] text-muted-foreground truncate">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
