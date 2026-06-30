"use client";

/**
 * features/checkout/components/CheckoutStepper.tsx
 * Multi-step checkout wizard:
 *   Step 1: Review Cart + Measurement Gate
 *   Step 2: Delivery Address + Options
 *   Step 3: Payment (Paystack / Wallet)
 *   Step 4: Order Confirmation
 */

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@/components";

// ── Types ─────────────────────────────────────────────────────────────────────

type CheckoutStep = "cart_review" | "delivery" | "payment" | "confirmation";

interface CheckoutAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CheckoutFormState {
  address: CheckoutAddress;
  deliveryMode: "standard" | "express" | "pickup";
  paymentMethod: "paystack" | "wallet";
  isGift: boolean;
  giftMessage: string;
  carbonOffset: boolean;
  promoCode: string;
}

// ── Step Indicators ────────────────────────────────────────────────────────────

const STEPS: { key: CheckoutStep; label: string; icon: string }[] = [
  { key: "cart_review", label: "Cart", icon: "🛒" },
  { key: "delivery", label: "Delivery", icon: "🚚" },
  { key: "payment", label: "Payment", icon: "💳" },
  { key: "confirmation", label: "Confirm", icon: "✅" },
];

interface StepperHeaderProps {
  currentStep: CheckoutStep;
}

function StepperHeader({ currentStep }: StepperHeaderProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : isCurrent
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40 ring-offset-2 ring-offset-transparent"
                      : "bg-white/10 text-slate-500 border border-white/15"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span
                className={`text-xs font-medium ${isCurrent ? "text-amber-300" : isDone ? "text-emerald-400" : "text-slate-500"}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${idx < currentIdx ? "bg-emerald-500/50" : "bg-white/10"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step: Cart Review ─────────────────────────────────────────────────────────

interface CartReviewStepProps {
  onNext: () => void;
  hasMeasurementGate: boolean;
  hasMeasurements: boolean;
}

function CartReviewStep({ onNext, hasMeasurementGate, hasMeasurements }: CartReviewStepProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Review Your Order</h2>

      {hasMeasurementGate && !hasMeasurements && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-xl flex-shrink-0">📐</span>
          <div>
            <p className="text-sm font-medium text-amber-300">Measurements Required</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              One or more items require your measurements for a perfect fit.
            </p>
            <a
              href="/measurements"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium transition-colors"
              id="go-to-measurements-link"
            >
              Add measurements →
            </a>
          </div>
        </div>
      )}

      {/* Placeholder cart items */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-16 h-16 rounded-lg bg-slate-800 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-slate-700 rounded-full w-3/4 mb-2" />
              <div className="h-3 bg-slate-800 rounded-full w-1/2" />
            </div>
            <div className="text-sm font-semibold text-white">₦12,500</div>
          </div>
        ))}
      </div>

      {/* Promo code */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Promo code"
          id="promo-code-input"
          className="flex-1 h-10 bg-white/8 border border-white/15 rounded-xl px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
        />
        <Button variant="secondary" size="sm" id="apply-promo-btn">Apply</Button>
      </div>

      <Button
        onClick={onNext}
        disabled={hasMeasurementGate && !hasMeasurements}
        className="w-full"
        size="lg"
        id="proceed-to-delivery-btn"
      >
        Proceed to Delivery →
      </Button>
    </div>
  );
}

// ── Step: Delivery ─────────────────────────────────────────────────────────────

interface DeliveryStepProps {
  form: CheckoutFormState;
  onChange: (patch: Partial<CheckoutFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function DeliveryStep({ form, onChange, onNext, onBack }: DeliveryStepProps) {
  const handleAddressChange = (field: keyof CheckoutAddress, value: string) => {
    onChange({ address: { ...form.address, [field]: value } });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Delivery Details</h2>

      {/* Address form */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { field: "fullName", label: "Full Name", placeholder: "Jane Doe", span: true },
          { field: "phone", label: "Phone", placeholder: "+234 xxx xxx xxxx", span: false },
          { field: "street", label: "Street Address", placeholder: "123 Fashion Street", span: true },
          { field: "city", label: "City", placeholder: "Lagos", span: false },
          { field: "state", label: "State", placeholder: "Lagos State", span: false },
        ].map(({ field, label, placeholder, span }) => (
          <div key={field} className={span ? "col-span-2" : ""}>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input
              type="text"
              value={form.address[field as keyof CheckoutAddress]}
              onChange={(e) => handleAddressChange(field as keyof CheckoutAddress, e.target.value)}
              placeholder={placeholder}
              id={`delivery-${field}`}
              className="w-full h-10 bg-white/8 border border-white/15 rounded-xl px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        ))}
      </div>

      {/* Delivery options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-300">Delivery Method</p>
        {[
          { value: "standard", label: "Standard Delivery", sub: "3-7 business days", price: "₦1,500" },
          { value: "express", label: "Express Delivery", sub: "1-2 business days", price: "₦3,500" },
          { value: "pickup", label: "Store Pickup", sub: "Ready in 2 hours", price: "Free" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ deliveryMode: opt.value as CheckoutFormState["deliveryMode"] })}
            id={`delivery-${opt.value}-btn`}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
              form.deliveryMode === opt.value
                ? "bg-amber-500/15 border-amber-500/50"
                : "bg-white/5 border-white/10 hover:bg-white/8"
            }`}
          >
            <div>
              <p className={`text-sm font-medium ${form.deliveryMode === opt.value ? "text-amber-300" : "text-white"}`}>
                {opt.label}
              </p>
              <p className="text-xs text-slate-400">{opt.sub}</p>
            </div>
            <Badge color={form.deliveryMode === opt.value ? "primary" : "default"}>{opt.price}</Badge>
          </button>
        ))}
      </div>

      {/* Gift & Carbon offset */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="flex items-center gap-3 cursor-pointer" htmlFor="is-gift-checkbox">
          <input
            type="checkbox"
            id="is-gift-checkbox"
            checked={form.isGift}
            onChange={(e) => onChange({ isGift: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm text-slate-300">🎁 This is a gift (no price on packing slip)</span>
        </label>
        {form.isGift && (
          <textarea
            placeholder="Gift message (optional)"
            value={form.giftMessage}
            onChange={(e) => onChange({ giftMessage: e.target.value })}
            rows={2}
            maxLength={500}
            id="gift-message-input"
            className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none transition-all"
          />
        )}
        <label className="flex items-center gap-3 cursor-pointer" htmlFor="carbon-offset-checkbox">
          <input
            type="checkbox"
            id="carbon-offset-checkbox"
            checked={form.carbonOffset}
            onChange={(e) => onChange({ carbonOffset: e.target.checked })}
            className="w-4 h-4 accent-emerald-500"
          />
          <span className="text-sm text-slate-300">🌱 Add carbon offset (₦200 to sustainability fund)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1" id="back-to-cart-btn">← Back</Button>
        <Button onClick={onNext} className="flex-2" id="proceed-to-payment-btn">Continue to Payment →</Button>
      </div>
    </div>
  );
}

// ── Step: Order Confirmation ───────────────────────────────────────────────────

interface ConfirmationStepProps {
  orderNumber: string;
  onViewOrder: () => void;
}

export function OrderConfirmation({ orderNumber, onViewOrder }: ConfirmationStepProps) {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
        <span className="text-4xl">🎉</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
        <p className="text-slate-400 text-sm">
          Your order <span className="font-mono font-bold text-amber-400">{orderNumber}</span> is confirmed.
          <br />You&apos;ll receive an email and SMS notification shortly.
        </p>
      </div>
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Button onClick={onViewOrder} className="w-full" id="view-order-btn">View Order Status</Button>
        <Button variant="ghost" asChild className="w-full" id="continue-shopping-btn">
          <Link href="/catalog">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

// ── CheckoutStepper (main) ────────────────────────────────────────────────────

interface CheckoutStepperProps {
  hasMeasurementGate?: boolean;
  hasMeasurements?: boolean;
}

const DEFAULT_FORM: CheckoutFormState = {
  address: { fullName: "", phone: "", street: "", city: "", state: "", country: "Nigeria", postalCode: "" },
  deliveryMode: "standard",
  paymentMethod: "paystack",
  isGift: false,
  giftMessage: "",
  carbonOffset: false,
  promoCode: "",
};

export function CheckoutStepper({ hasMeasurementGate = false, hasMeasurements = true }: CheckoutStepperProps) {
  const [step, setStep] = useState<CheckoutStep>("cart_review");
  const [form, setForm] = useState<CheckoutFormState>(DEFAULT_FORM);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

  const updateForm = (patch: Partial<CheckoutFormState>) => setForm((prev) => ({ ...prev, ...patch }));

  if (step === "confirmation" && confirmedOrderNumber) {
    return (
      <Card className="p-8 max-w-lg mx-auto">
        <OrderConfirmation orderNumber={confirmedOrderNumber} onViewOrder={() => window.location.href = `/orders/${confirmedOrderNumber}`} />
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto" id="checkout-stepper">
      <StepperHeader currentStep={step} />

      {step === "cart_review" && (
        <CartReviewStep
          onNext={() => setStep("delivery")}
          hasMeasurementGate={hasMeasurementGate}
          hasMeasurements={hasMeasurements}
        />
      )}
      {step === "delivery" && (
        <DeliveryStep
          form={form}
          onChange={updateForm}
          onNext={() => setStep("payment")}
          onBack={() => setStep("cart_review")}
        />
      )}
      {step === "payment" && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Payment</h2>
          <p className="text-slate-400 text-sm">Select your payment method to complete the order.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep("delivery")} className="flex-1" id="back-to-delivery-btn">← Back</Button>
            <Button
              onClick={() => { setConfirmedOrderNumber("FSN-ORD-0001"); setStep("confirmation"); }}
              className="flex-2"
              id="place-order-btn"
            >
              Place Order 🚀
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
