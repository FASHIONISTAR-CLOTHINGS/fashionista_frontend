"use client";

import { useState } from "react";
import { FashionistarImage } from "@/components/media/FashionistarImage";
import { cn } from "@/lib/utils";

// ─── Vector SVG Fallback Badges ────────────────────────────────────────────────

export function FlutterwaveFallbackSVG({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF7E6] text-[#0A0E1A] border border-[#F5A623]/30 select-none shadow-xs min-h-[36px]",
        className,
      )}
      aria-label="Flutterwave"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2.5 7.5L12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5Z"
          fill="#FB923C"
        />
        <path
          d="M7 9L12 6L17 9V15L12 18L7 15V9Z"
          fill="#F5A623"
        />
      </svg>
      <span className="font-bold text-xs tracking-tight text-[#0A0E1A]">
        flutterwave
      </span>
    </div>
  );
}

export function PaystackFallbackSVG({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#092540] text-white border border-[#00C3F7]/30 select-none shadow-xs min-h-[36px]",
        className,
      )}
      aria-label="Paystack"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="4" rx="1" fill="#00C3F7" />
        <rect x="3" y="10" width="12" height="4" rx="1" fill="#00C3F7" />
        <rect x="3" y="16" width="18" height="4" rx="1" fill="#00C3F7" opacity="0.6" />
      </svg>
      <span className="font-bold text-xs tracking-tight text-white">
        paystack
      </span>
    </div>
  );
}

export function MastercardFallbackSVG({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111827] text-white select-none shadow-xs min-h-[36px]",
        className,
      )}
      aria-label="Mastercard"
    >
      <svg width="24" height="16" viewBox="0 0 38 24" fill="none" aria-hidden="true">
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.85" />
      </svg>
      <span className="font-semibold text-[11px] text-white/90">mastercard</span>
    </div>
  );
}

export function VisaFallbackSVG({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1A1F71] text-white select-none shadow-xs min-h-[36px]",
        className,
      )}
      aria-label="VISA"
    >
      <span className="font-black italic text-xs tracking-widest text-[#F7B600]">
        VISA
      </span>
    </div>
  );
}

// ─── Main PaymentGatewayBadge Component ────────────────────────────────────────

export interface PaymentGatewayBadgeProps {
  /** Target gateway provider name */
  provider: "flutterwave" | "paystack" | "mastercard" | "visa" | string;
  /** Cloudinary or external image URL */
  src?: string;
  /** Image width in px */
  width?: number;
  /** Image height in px */
  height?: number;
  /** Custom wrapper CSS classes */
  className?: string;
  /** Accessible label */
  alt?: string;
}

/**
 * PaymentGatewayBadge — Resilient Payment Gateway Logo with Automatic Fallback.
 *
 * Tries loading Cloudinary optimized image URL first. If image is missing (404)
 * or fails to load, gracefully falls back to brand-accurate vector SVG badge.
 */
export function PaymentGatewayBadge({
  provider,
  src,
  width = 120,
  height = 40,
  className,
  alt,
}: PaymentGatewayBadgeProps) {
  const [hasError, setHasError] = useState(false);

  const providerLower = provider.toLowerCase();

  const renderFallback = () => {
    switch (providerLower) {
      case "flutterwave":
        return <FlutterwaveFallbackSVG className={className} />;
      case "paystack":
        return <PaystackFallbackSVG className={className} />;
      case "mastercard":
        return <MastercardFallbackSVG className={className} />;
      case "visa":
        return <VisaFallbackSVG className={className} />;
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold select-none",
              className,
            )}
          >
            {alt ?? provider}
          </span>
        );
    }
  };

  if (!src || hasError) {
    return renderFallback();
  }

  return (
    <div className="relative inline-block">
      <FashionistarImage
        src={src}
        alt={alt ?? `${provider} logo`}
        width={width}
        height={height}
        className={cn("bg-[#F8F5ED] px-2 py-1.5 rounded-lg object-contain", className)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
