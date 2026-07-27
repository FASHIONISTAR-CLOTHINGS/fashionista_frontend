"use client";

/**
 * @file WishlistShareButton.tsx
 * @description Share button for wishlist items with social and copy-link options.
 *
 * Psychological triggers:
 *   - Social Proof: Sharing wishlist amplifies product visibility
 *   - Reciprocity: Friends receive curated recommendations
 *   - Commitment: Sharing reinforces purchase intent
 */

import { useState, useCallback } from "react";
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface WishlistShareButtonProps {
  productSlug: string;
  productTitle: string;
}

export function WishlistShareButton({ productSlug, productTitle }: WishlistShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/products/${productSlug}`
    : `/products/${productSlug}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [shareUrl]);

  const shareLinks = [
    {
      icon: Twitter,
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${productTitle} on Fashionistar!`)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      icon: Facebook,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`Check out ${productTitle} on Fashionistar! ${shareUrl}`)}`,
    },
  ] as const;

  return (
    <div className="relative" data-testid="wishlist-share-button">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--foreground))]"
        aria-label="Share wishlist item"
        aria-expanded={open}
      >
        <Share2 size={12} />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border border-[hsl(var(--border))] bg-card shadow-xl overflow-hidden">
            {shareLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
              >
                <Icon size={14} />
                {label}
              </a>
            ))}
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2 border-t border-[hsl(var(--border))] px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
