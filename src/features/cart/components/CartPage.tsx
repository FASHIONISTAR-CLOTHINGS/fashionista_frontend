"use client";

/**
 * @file CartPage.tsx
 * @description Enterprise live cart page — Fashionistar frontend.
 *
 * Data flow:
 *  - Read:  useCart() → apiAsync (Ky → Ninja cart/) → Zod parsed Cart
 *  - Write: useAddCartItem / useUpdateCartItem / useRemoveCartItem → Axios DRF
 *  - Checkout flow: usePrepareCheckout + useSubmitCheckout (idempotent)
 *
 * Features:
 *  - Optimistic quantity update
 *  - Coupon apply/remove
 *  - Measurement gate warning
 *  - Full skeleton loading state
 *  - Empty state CTA
 */

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyCoupon,
  useRemoveCoupon,
  useSubmitCheckout,
} from "@/features/cart/hooks/use-cart";
import { CartPageSkeleton } from "./CartPageSkeleton";
import { formatCurrency } from "@/lib/formatting";

export default function CartPage() {
  const router = useRouter();
  const idempotencyKey = useRef(uuidv4());

  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  const { data: cart, isLoading, isError } = useCart();
  const { mutate: updateItem, isPending: updatingItem } = useUpdateCartItem();
  const { mutate: removeItem, isPending: removingItem } = useRemoveCartItem();
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon } = useRemoveCoupon();
  const { mutate: submit, isPending: submitting } = useSubmitCheckout((orderId, paymentUrl) => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      router.push(`/client/dashboard/orders/${orderId}`);
    }
  });

  if (isLoading) return <CartPageSkeleton />;

  if (isError || !cart) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-4">
        <AlertTriangle size={48} className="text-destructive" />
        <p className="text-xl font-bold text-foreground">Unable to load your cart</p>
        <p className="text-sm text-muted-foreground">Please check your connection or sign in again.</p>
        <Link
          href="/auth/sign-in"
          className="mt-2 rounded-full bg-[hsl(var(--primary))] px-8 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const isEmpty = cart.items.length === 0;
  const subtotal = parseFloat(cart.subtotal ?? "0");
  const currency = cart.currency ?? "NGN";
  const hasMeasurementItem = cart.items.some((i) => i.product.requires_measurement);

  const handleQuantityChange = (itemId: string, delta: number, current: number) => {
    const next = current + delta;
    if (next < 1) {
      removeItem(itemId);
    } else {
      updateItem({ itemId, input: { quantity: next } });
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    applyCoupon(
      { code: couponInput.trim().toUpperCase() },
      { onSuccess: () => setCouponInput("") },
    );
  };

  const handlePlaceOrder = () => {
    submit(idempotencyKey.current);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 lg:px-20">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="font-bon_foyage text-[40px] leading-[1.1] text-foreground md:text-[72px]">
          Your Cart
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEmpty ? "No items yet." : `${cart.item_count} item${cart.item_count !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Measurement gate warning */}
      {hasMeasurementItem && !isEmpty && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[hsl(var(--warning))/30] bg-[hsl(var(--warning-bg))] px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[hsl(var(--warning))]" />
          <p className="text-sm text-[hsl(var(--foreground))]">
            One or more items require a <strong>custom measurement profile</strong> to proceed to checkout.{" "}
            <Link href="/get-measured" className="font-semibold underline">
              Get measured →
            </Link>
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <ShoppingBag size={72} className="text-muted-foreground/30" />
          <p className="text-2xl font-bold text-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">Explore our premium collections and add something beautiful.</p>
          <Link
            href="/collections"
            className="rounded-full bg-[hsl(var(--accent))] px-10 py-4 text-base font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── Cart items ──────────────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--card-shadow)] transition-shadow hover:shadow-[var(--card-hover-shadow)]"
              >
                {/* Product image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--brand-cream))] md:h-36 md:w-32"
                >
                  <Image
                    src={item.product.cover_image_url ?? "/gown.svg"}
                    alt={item.product.title}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                        {item.product.vendor_name}
                      </span>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="mt-0.5 block line-clamp-2 text-sm font-semibold text-foreground hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      {/* Variant labels */}
                      {(item.size_label || item.color_label) && (
                        <div className="mt-1 flex gap-2">
                          {item.size_label && (
                            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                              Size: {item.size_label}
                            </span>
                          )}
                          {item.color_label && (
                            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                              {item.color_label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingItem}
                      aria-label="Remove item"
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Price + qty row */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">
                      {formatCurrency(parseFloat(item.line_total), currency)}
                    </span>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                        disabled={updatingItem || removingItem}
                        aria-label="Decrease quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-muted disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                        disabled={updatingItem}
                        aria-label="Increase quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-muted disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping link */}
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80 transition"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* ── Order summary panel ─────────────────────────────────────── */}
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)] lg:sticky lg:top-24 lg:w-[420px]">
            <h2 className="mb-5 text-xl font-bold text-foreground">Order Summary</h2>

            {/* Items breakdown */}
            <div className="space-y-3 border-b border-border pb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 max-w-[200px]">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(parseFloat(item.line_total), currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="py-4 border-b border-border space-y-2">
              {cart.applied_coupon ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[hsl(var(--success))]" />
                    <span className="text-sm font-bold text-[hsl(var(--success))]">
                      {cart.applied_coupon.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (-{formatCurrency(parseFloat(cart.applied_coupon.discount_amount ?? "0"), currency)})
                    </span>
                  </div>
                  <button
                    onClick={() => removeCoupon()}
                    aria-label="Remove coupon"
                    className="rounded-lg p-1 text-muted-foreground transition hover:text-destructive"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : !showCouponInput ? (
                <button
                  onClick={() => setShowCouponInput(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80 transition"
                >
                  <Tag size={15} />
                  Have a coupon code?
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="dash-input flex-1 text-sm tracking-wider placeholder:text-sm placeholder:tracking-normal"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput}
                    className="rounded-xl bg-[hsl(var(--accent))] px-4 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:brightness-110 disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => { setShowCouponInput(false); setCouponInput(""); }}
                    className="rounded-xl p-2 text-muted-foreground hover:text-foreground transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-[hsl(var(--success))] font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span>
                <span className="text-[hsl(var(--accent))]">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || hasMeasurementItem}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] py-4 text-base font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="animate-spin rounded-full border-2 border-black/20 border-t-black h-5 w-5" />
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {hasMeasurementItem ? "Measurement required" : "Proceed to Checkout"}
                </>
              )}
            </button>

            {hasMeasurementItem && (
              <Link
                href="/get-measured"
                className="mt-3 block text-center text-xs font-semibold text-[hsl(var(--primary))] hover:opacity-80"
              >
                Complete your measurement profile →
              </Link>
            )}

            {/* Security badge */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <LockKeyhole size={13} aria-hidden="true" />
              Secured by SSL - Paystack PCI-DSS compliant
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
