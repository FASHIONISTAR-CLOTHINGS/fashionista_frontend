"use client";

/**
 * @file PaymentOverviewView.tsx
 * @description Payment operations landing surface.
 */
import { CreditCard } from "lucide-react";
import { useBanks } from "../hooks/use-payment";

export function PaymentOverviewView({ title = "Payments" }: { title?: string }) {
  const { data: banks, isLoading } = useBanks();

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Initialize payments, verify Paystack references, and prepare transfer recipients for withdrawals.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <PaymentCard label="Provider" value="Paystack" />
        <PaymentCard label="Banks loaded" value={isLoading ? "-" : String(banks?.length ?? 0)} />
        <PaymentCard label="Mode" value="DRF Sync Writes" />
      </section>

      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#FDA600]/10 text-[#FDA600]">
            <CreditCard />
          </div>
          <div>
            <p className="text-lg font-semibold text-black">Payment Safety Boundary</p>
            <p className="text-sm text-[#5A6465]">
              Provider mutations stay in DRF sync services with idempotency keys and webhook reconciliation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#858585]">
        {label}
      </p>
      <p className="mt-4 font-bon_foyage text-4xl leading-none text-black">
        {value}
      </p>
    </div>
  );
}
