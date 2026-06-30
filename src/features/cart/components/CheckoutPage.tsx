"use client";

/**
 * @file CheckoutPage.tsx
 * @description Enterprise checkout page — 2027 Edition.
 *
 * Flow:
 *  1. Cart data loaded from TanStack Query cache (already warm from /cart visit).
 *  2. User fills delivery address form.
 *  3. User selects payment method (Paystack gateway, Wallet, or Bank transfer).
 *  4. Submit fires useSubmitCheckout() with a stable idempotency key.
 *     - On success → redirect to payment URL (Paystack) or order confirmation.
 *     - On failure → toast error, form remains intact for retry.
 *
 * Revenue features:
 *  - Free shipping progress bar (incentivises cart upsell).
 *  - Trust signals: SSL badge, Paystack PCI badge.
 *  - Measurement gate warning block.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  CreditCard,
  LockKeyhole,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useCart, useSubmitCheckout } from "@/features/cart/hooks/use-cart";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { formatCurrency } from "@/lib/formatting";
import {
  AddressReferenceField,
  useReferenceLocation,
  type AddressSelection,
} from "@/components/reference-data";
import { CheckoutPageSkeleton } from "./CheckoutPageSkeleton";

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentMethod = "paystack" | "wallet" | "bank_transfer";

interface DeliveryForm {
  full_name: string;
  phone: string;
  email: string;
  postal_code: string;
  delivery_note: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 50_000; // NGN

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "paystack",
    label: "Card / Paystack",
    description: "Pay securely with debit/credit card via Paystack.",
    icon: CreditCard,
  },
  {
    id: "wallet",
    label: "Fashionistar Wallet",
    description: "Debit your Fashionistar wallet balance instantly.",
    icon: Wallet,
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    description: "Transfer to our account and attach proof of payment.",
    icon: Building2,
  },
];

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
      >
        {label}
        {required && <span className="ml-0.5 text-[hsl(var(--destructive))]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]";

// ── Free shipping bar ─────────────────────────────────────────────────────────

function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (remaining === 0) {
    return (
      <div className="rounded-xl bg-[hsl(var(--success)/0.12)] px-4 py-3 text-sm font-semibold text-[hsl(var(--success))]">
        🎉 You qualify for FREE shipping!
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Add{" "}
        <span className="font-bold text-[hsl(var(--foreground))]">
          {formatCurrency(remaining, "NGN")}
        </span>{" "}
        more for FREE delivery
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--border))]">
        <div
          className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CheckoutPage() {
  const router = useRouter();
  const idempotencyKey = useRef(uuidv4());
  const [mounted, setMounted] = useState(false);

  const { data: cart, isLoading } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { mutate: submit, isPending: submitting } = useSubmitCheckout(
    (orderId, paymentUrl) => {
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        router.push(`/client/dashboard/orders/${orderId}/confirmation`);
      }
    },
  );

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      toast.error("Please sign in to complete your checkout.");
      router.push("/auth/sign-in?returnUrl=/cart/checkout");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [form, setForm] = useState<DeliveryForm>({
    full_name: "",
    phone: "",
    email: "",
    postal_code: "",
    delivery_note: "",
  });
  const [errors, setErrors] = useState<Partial<DeliveryForm>>({});
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof AddressSelection, string>>
  >({});
  const [addressSelection, setAddressSelection] = useState<AddressSelection>({
    country_code: "NG",
    state_code: "",
    lga_code: "",
    city_code: "",
    custom_city: "",
    street_address: "",
  });
  const { states, getLgas, getCities } = useReferenceLocation(
    addressSelection.country_code || "NG",
  );
  const lgas = useMemo(
    () => getLgas(addressSelection.state_code),
    [addressSelection.state_code, getLgas],
  );
  const cities = useMemo(
    () => getCities(addressSelection.state_code, addressSelection.lga_code),
    [addressSelection.lga_code, addressSelection.state_code, getCities],
  );
  const resolvedStateName =
    states.find((state) => state.code === addressSelection.state_code)?.name ?? "";
  const resolvedCityName =
    addressSelection.custom_city?.trim() ||
    cities.find((city) => city.code === addressSelection.city_code)?.name ||
    lgas.find((lga) => lga.code === addressSelection.lga_code)?.name ||
    "";
  const resolvedCountryName =
    addressSelection.country_code === "NG"
      ? "Nigeria"
      : addressSelection.country_code;

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || isLoading) return <CheckoutPageSkeleton />;

  // Redirect to cart if empty
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32 text-center px-4">
        <ShoppingBag size={64} className="text-[hsl(var(--muted-foreground)/0.3)]" />
        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Your cart is empty
        </p>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110"
        >
          <ChevronLeft size={16} /> Back to cart
        </Link>
      </div>
    );
  }

  const subtotal = parseFloat(cart.subtotal ?? "0");
  const currency = cart.currency ?? "NGN";
  const discount = parseFloat(
    String(cart.applied_coupon?.discount_amount ?? "0"),
  );
  const total = Math.max(0, subtotal - discount);
  const hasMeasurementItem = cart.items.some(
    (i) => i.product.requires_measurement,
  );

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Partial<DeliveryForm> = {};
    const newAddressErrors: Partial<Record<keyof AddressSelection, string>> = {};
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!addressSelection.street_address.trim()) {
      newAddressErrors.street_address = "Street address is required.";
    }
    if (!addressSelection.state_code) {
      newAddressErrors.state_code = "State is required.";
    }
    if (!resolvedCityName.trim()) {
      newAddressErrors.city_code = "City is required.";
    }
    setErrors(newErrors);
    setAddressErrors(newAddressErrors);
    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(newAddressErrors).length === 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }
    submit({
      idempotency_key: idempotencyKey.current,
      payment_method: paymentMethod,
      fulfillment_type: "delivery",
      notes: form.delivery_note.trim(),
      delivery_address: {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address_line_1: addressSelection.street_address.trim(),
        city: resolvedCityName.trim(),
        state: resolvedStateName.trim(),
        country: resolvedCountryName,
        postal_code: form.postal_code.trim() || undefined,
      },
    });
  };

  const field = (
    key: keyof DeliveryForm,
    label: string,
    opts?: Partial<React.InputHTMLAttributes<HTMLInputElement>> & {
      required?: boolean;
    },
  ) => (
    <Field key={key} label={label} id={key} required={opts?.required}>
      <input
        id={key}
        {...opts}
        value={form[key]}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [key]: e.target.value }))
        }
        className={`${inputCls} ${errors[key] ? "border-[hsl(var(--destructive))]" : ""}`}
      />
      {errors[key] && (
        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
          {errors[key]}
        </p>
      )}
    </Field>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] px-4 py-8 md:px-8 lg:px-20">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 border-b border-[hsl(var(--border))] pb-6">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80 transition"
        >
          <ChevronLeft size={16} /> Back to cart
        </Link>
        <h1 className="font-bon-foyage text-[40px] leading-[1.1] text-[hsl(var(--foreground))] md:text-[64px]">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {cart.item_count} item{cart.item_count !== 1 ? "s" : ""} ·{" "}
          {formatCurrency(total, currency)}
        </p>
      </div>

      {/* Measurement gate */}
      {hasMeasurementItem && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning-bg))] px-4 py-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-[hsl(var(--warning))]"
          />
          <p className="text-sm">
            One or more items require a{" "}
            <strong>custom measurement profile</strong>.{" "}
            <Link href="/get-measured" className="font-semibold underline">
              Get measured →
            </Link>
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 lg:flex-row lg:items-start"
        noValidate
      >
        {/* ── Left: forms ──────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-6">
          {/* Delivery address */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
            <h2 className="mb-5 text-lg font-bold text-[hsl(var(--foreground))]">
              Delivery Address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("full_name", "Full name", {
                required: true,
                placeholder: "Adaeze Okonkwo",
                autoComplete: "name",
              })}
              {field("phone", "Phone number", {
                required: true,
                type: "tel",
                placeholder: "+234 801 234 5678",
                autoComplete: "tel",
              })}
              {field("email", "Email address", {
                required: true,
                type: "email",
                placeholder: "adaeze@example.com",
                autoComplete: "email",
              })}
              {field("postal_code", "Postal code", {
                placeholder: "100001",
                autoComplete: "postal-code",
              })}
              <div className="sm:col-span-2">
                <AddressReferenceField
                  value={addressSelection}
                  onChange={setAddressSelection}
                  errors={addressErrors}
                  disabled={submitting}
                />
              </div>
              <div className="sm:col-span-2">
                <Field label="Delivery note (optional)" id="delivery_note">
                  <textarea
                    id="delivery_note"
                    value={form.delivery_note}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        delivery_note: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Leave with gate man. Call before delivery."
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
            <h2 className="mb-5 text-lg font-bold text-[hsl(var(--foreground))]">
              Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map(({ id, label, description, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                    paymentMethod === id
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] ring-2 ring-[hsl(var(--primary)/0.2)]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={id}
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="mt-1 accent-[hsl(var(--primary))]"
                  />
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                      <Icon className="h-5 w-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: order summary ─────────────────────────────────────────── */}
        <div className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)] lg:sticky lg:top-24 lg:w-[420px]">
          <h2 className="mb-5 text-xl font-bold text-[hsl(var(--foreground))]">
            Order Summary
          </h2>

          {/* Free shipping progress */}
          <div className="mb-5">
            <FreeShippingBar subtotal={subtotal} />
          </div>

          {/* Items */}
          <div className="space-y-3 border-b border-[hsl(var(--border))] pb-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="max-w-[200px] truncate text-[hsl(var(--muted-foreground))]">
                  {item.product.title} × {item.quantity}
                </span>
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {formatCurrency(parseFloat(item.line_total), currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">
                Subtotal
              </span>
              <span className="font-semibold">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  Coupon ({cart.applied_coupon?.code})
                </span>
                <span className="font-semibold text-[hsl(var(--success))]">
                  -{formatCurrency(discount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">
                Delivery
              </span>
              <span className="font-semibold text-[hsl(var(--success))]">
                {subtotal >= FREE_SHIPPING_THRESHOLD
                  ? "FREE"
                  : "Calculated on next step"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[hsl(var(--border))] pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-[hsl(var(--accent))]">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={submitting || hasMeasurementItem}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] py-4 text-base font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            ) : (
              <>
                <LockKeyhole size={18} />
                {hasMeasurementItem
                  ? "Measurement required"
                  : "Place Order Securely"}
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

          {/* Trust badges */}
          <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
            <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <LockKeyhole size={12} aria-hidden />
              256-bit SSL encryption · Paystack PCI-DSS Level 1
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              By placing your order you agree to our{" "}
              <Link href="/terms" className="underline hover:text-[hsl(var(--foreground))]">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
