"use client";

/**
 * features/checkout/components/PaymentForm.tsx
 * Paystack-powered payment form for the checkout stepper.
 * Supports: card, bank transfer, USSD, and wallet balance.
 * Integrates: POST /api/v1/ninja/orders/{id}/initiate-payment/
 */

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { Button, Card } from "@/shared/ui";

type PaymentMethod = "card" | "bank_transfer" | "ussd" | "wallet";

interface PaymentInitiateResponse {
  authorization_url?: string;
  access_code?: string;
  reference: string;
  payment_method: PaymentMethod;
  amount_ngn: number;
}

interface WalletBalanceResponse {
  available_balance: number;
  currency: string;
}

interface PaymentFormProps {
  orderId: string;
  totalAmount: number;
  onSuccess: (reference: string) => void;
  onError?: (msg: string) => void;
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  card:          { label: "Debit/Credit Card",  icon: "💳", description: "Visa, Mastercard — secured by Paystack" },
  bank_transfer: { label: "Bank Transfer",      icon: "🏦", description: "Transfer directly to our account" },
  ussd:          { label: "USSD",               icon: "📱", description: "*901#, *966# and all major bank codes" },
  wallet:        { label: "Wallet Balance",     icon: "👛", description: "Instant debit from your FASHIONISTAR wallet" },
};

export function PaymentForm({ orderId, totalAmount, onSuccess, onError }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");

  // Fetch wallet balance when wallet tab is selected
  const fetchWalletBalance = useCallback(async () => {
    if (walletBalance !== null) return;
    try {
      const data = await ky.get("/api/v1/ninja/wallet/balance/").json<WalletBalanceResponse>();
      setWalletBalance(data.available_balance);
    } catch {
      setWalletBalance(0);
    }
  }, [walletBalance]);

  const { mutate: initiatePayment, isPending } = useMutation({
    mutationFn: async () => {
      return ky.post(`/api/v1/ninja/orders/${orderId}/initiate-payment/`, {
        json: {
          payment_method: selectedMethod,
          promo_code: promoCode || undefined,
        },
      }).json<PaymentInitiateResponse>();
    },
    onSuccess: async (data) => {
      if (data.authorization_url) {
        // Paystack hosted page — redirect
        window.location.href = data.authorization_url;
      } else {
        // Wallet / instant payment — done
        onSuccess(data.reference);
      }
    },
    onError: () => {
      onError?.("Payment initiation failed. Please try again or use a different method.");
    },
  });

  const walletInsufficient = selectedMethod === "wallet" && walletBalance !== null && walletBalance < totalAmount;

  return (
    <div className="space-y-5">
      {/* Method selector */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(METHOD_CONFIG) as [PaymentMethod, typeof METHOD_CONFIG[PaymentMethod]][]).map(
            ([method, config]) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setSelectedMethod(method);
                  if (method === "wallet") fetchWalletBalance();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedMethod === method
                    ? "border-amber-500/60 bg-amber-500/10"
                    : "border-white/12 bg-white/4 hover:border-white/25 hover:bg-white/8"
                }`}
                id={`payment-method-${method}`}
                aria-pressed={selectedMethod === method}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">{config.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{config.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{config.description}</p>
                    {method === "wallet" && walletBalance !== null && (
                      <p className={`text-[10px] font-bold mt-1 ${walletBalance >= totalAmount ? "text-emerald-400" : "text-red-400"}`}>
                        Balance: ₦{walletBalance.toLocaleString("en-NG")}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Order summary */}
      <Card glass className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Total</span>
          <span className="text-lg font-bold text-amber-400">
            ₦{totalAmount.toLocaleString("en-NG")}
          </span>
        </div>

        {/* Promo code */}
        <div className="mt-3 pt-3 border-t border-white/8 flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Promo code (optional)"
            maxLength={24}
            className="flex-1 h-9 px-3 rounded-xl bg-white/6 border border-white/12 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
            id="checkout-promo-input"
          />
        </div>
      </Card>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-6 py-2">
        {["🔒 SSL Encrypted", "🛡️ Paystack Secured", "✓ PCI DSS"].map((badge) => (
          <span key={badge} className="text-[10px] text-slate-500">{badge}</span>
        ))}
      </div>

      {/* Submit */}
      {walletInsufficient && (
        <p className="text-xs text-red-400 text-center">
          Insufficient wallet balance. Please top up or choose another method.
        </p>
      )}

      <Button
        onClick={() => initiatePayment()}
        isLoading={isPending}
        disabled={isPending || walletInsufficient}
        className="w-full"
        size="lg"
        id="checkout-pay-btn"
      >
        {isPending
          ? "Processing…"
          : selectedMethod === "wallet"
          ? `Pay ₦${totalAmount.toLocaleString("en-NG")} from Wallet`
          : `Pay ₦${totalAmount.toLocaleString("en-NG")} with ${METHOD_CONFIG[selectedMethod].label}`}
      </Button>

      <p className="text-center text-[10px] text-slate-600">
        By completing this payment you agree to our{" "}
        <a href="/legal/terms" className="text-amber-500/70 hover:text-amber-400 underline">Terms of Service</a>.
      </p>
    </div>
  );
}
