"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Package, Sparkles, Wallet } from "lucide-react";

import { Transactions } from "@/features/account/components";
import {
  useClientDashboard,
  useClientProfile,
  useUpdateClientProfile,
} from "@/features/client/hooks/use-client-profile";
import { useClientWalletBalance } from "@/features/client/hooks/use-client-wallet";
import type {
  ClientAddress,
  ClientProfileUpdatePayload,
} from "@/features/client/types/client.types";


type ClientCardProps = {
  title: string;
  value: string;
  hint: string;
};

function ClientCard({ title, value, hint }: ClientCardProps) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
        {title}
      </p>
      <p className="mt-4 font-bon_foyage text-4xl leading-none text-black">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#5A6465]">{hint}</p>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-black">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-14 w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 text-black outline-none transition focus:border-[#FDA600] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[160px] w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 py-4 text-black outline-none transition focus:border-[#FDA600] ${props.className ?? ""}`}
    />
  );
}

export function ClientDashboardView() {
  const { data: dashboard, isLoading } = useClientDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="h-[180px] animate-pulse rounded-[24px] bg-white shadow-card_shadow"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-[32px] bg-[#EDE7D9] p-8 shadow-card_shadow md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
              Client Dashboard
            </p>
            <h1 className="mt-3 font-bon_foyage text-5xl leading-none text-black">
              Your fashion profile
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5A6465]">
              This migrated dashboard now sits inside the new client feature
              slice and reads from the new client domain contract.
            </p>
          </div>
          <Link
            href="/client/dashboard/account-details"
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705]"
          >
            Update profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ClientCard
          title="Total orders"
          value={String(dashboard?.analytics.total_orders ?? 0)}
          hint="Orders connected to your client account."
        />
        <ClientCard
          title="Total spent"
          value={`NGN ${(dashboard?.analytics.total_spent_ngn ?? 0).toLocaleString()}`}
          hint="Client spend tracked in the new backend contract."
        />
        <ClientCard
          title="Saved addresses"
          value={String(dashboard?.analytics.saved_addresses ?? 0)}
          hint="Addresses available for quick checkout reuse."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#FDA600]" />
            <h2 className="text-xl font-semibold text-black">Profile snapshot</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-[#ECE6D6] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
                Preferred size
              </p>
              <p className="mt-3 text-base text-black">
                {dashboard?.profile.preferred_size || "Not set yet"}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#ECE6D6] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
                Profile complete
              </p>
              <p className="mt-3 text-base text-black">
                {dashboard?.profile.is_profile_complete ? "Yes" : "Not yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
          <h2 className="text-xl font-semibold text-black">Quick links</h2>
          <div className="mt-6 space-y-3">
            <Link
              href="/client/dashboard/orders"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <Package className="h-4 w-4 text-[#FDA600]" />
                View orders
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/client/dashboard/address"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#FDA600]" />
                Manage addresses
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/client/dashboard/wallet"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-[#FDA600]" />
                Open wallet
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ClientAccountDetailsView() {
  const { data: profile } = useClientProfile();
  const updateProfile = useUpdateClientProfile();
  const [form, setForm] = useState<ClientProfileUpdatePayload>({
    bio: "",
    default_shipping_address: "",
    state: "",
    country: "",
    preferred_size: "",
    style_preferences: [],
    favourite_colours: [],
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
  });

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate editable form after async profile read.
    setForm({
      bio: profile.bio || "",
      default_shipping_address: profile.default_shipping_address || "",
      state: profile.state || "",
      country: profile.country || "",
      preferred_size: profile.preferred_size || "",
      style_preferences: profile.style_preferences || [],
      favourite_colours: profile.favourite_colours || [],
      email_notifications_enabled: profile.email_notifications_enabled,
      sms_notifications_enabled: profile.sms_notifications_enabled,
    });
  }, [profile]);

  const stylePreferencesText = useMemo(
    () => (form.style_preferences ?? []).join(", "),
    [form.style_preferences],
  );
  const colourText = useMemo(
    () => (form.favourite_colours ?? []).join(", "),
    [form.favourite_colours],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateProfile.mutateAsync(form);
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">
          Account details
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          This page now edits the new client profile contract instead of the
          old scattered route logic.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-6 rounded-[32px] bg-white p-8 shadow-card_shadow md:grid-cols-2 md:p-10"
      >
        <div className="space-y-3 md:col-span-2">
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <TextArea
            id="bio"
            value={form.bio ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, bio: event.target.value }))
            }
            placeholder="Tell Fashionistar what styles you love."
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <FieldLabel htmlFor="default_shipping_address">
            Default shipping address
          </FieldLabel>
          <TextInput
            id="default_shipping_address"
            value={form.default_shipping_address ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                default_shipping_address: event.target.value,
              }))
            }
            placeholder="Interstate 3322, Onitsha main market..."
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="state">State</FieldLabel>
          <TextInput
            id="state"
            value={form.state ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, state: event.target.value }))
            }
            placeholder="Lagos State"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <TextInput
            id="country"
            value={form.country ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, country: event.target.value }))
            }
            placeholder="Nigeria"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="preferred_size">Preferred size</FieldLabel>
          <TextInput
            id="preferred_size"
            value={form.preferred_size ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferred_size: event.target.value,
              }))
            }
            placeholder="L"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="style_preferences">Style preferences</FieldLabel>
          <TextInput
            id="style_preferences"
            value={stylePreferencesText}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                style_preferences: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Agbada, minimal, occasion wear"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <FieldLabel htmlFor="favourite_colours">Favourite colours</FieldLabel>
          <TextInput
            id="favourite_colours"
            value={colourText}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                favourite_colours: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Black, gold, emerald"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-[24px] border border-[#ECE6D6] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
            Notifications
          </p>
          <label className="flex items-center justify-between gap-4 text-sm font-medium text-black">
            <span>Email updates</span>
            <input
              type="checkbox"
              checked={Boolean(form.email_notifications_enabled)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email_notifications_enabled: event.target.checked,
                }))
              }
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm font-medium text-black">
            <span>SMS updates</span>
            <input
              type="checkbox"
              checked={Boolean(form.sms_notifications_enabled)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sms_notifications_enabled: event.target.checked,
                }))
              }
            />
          </label>
        </div>

        <div className="flex items-end justify-end md:col-span-1">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressCard({ address }: { address: ClientAddress }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
        {address.label}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-black">{address.full_name}</h2>
      <p className="mt-3 text-base leading-7 text-[#5A6465]">
        {address.street_address}, {address.city}, {address.state},{" "}
        {address.country} {address.postal_code}
      </p>
      <p className="mt-3 text-sm text-[#5A6465]">{address.phone}</p>
    </div>
  );
}

export function ClientAddressView() {
  const { data: profile } = useClientProfile();
  const addresses = profile?.addresses ?? [];

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">My address</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Address management is now grouped under the new client feature slice.
        </p>
      </div>

      {addresses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
          <p className="text-base leading-7 text-[#5A6465]">
            No saved addresses yet. Add your first address from the client
            dashboard flow when checkout and address creation are fully wired.
          </p>
        </div>
      )}
    </div>
  );
}

const clientOrders = [
  {
    date: "12.05.26",
    order: "Agbada",
    status: "processing",
    total: "NGN 10,059",
    items: "5 items",
  },
  {
    date: "15.05.26",
    order: "Isi Agu native wear",
    status: "completed",
    total: "NGN 12,059",
    items: "2 items",
  },
];

export function ClientOrdersView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Orders</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          The old order history page has been migrated into the new client
          feature slice.
        </p>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow-card_shadow">
        <table className="min-w-full">
          <thead className="bg-[#F8F5ED]">
            <tr className="text-left text-sm font-semibold uppercase tracking-[0.12em] text-[#7A6B44]">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Items</th>
            </tr>
          </thead>
          <tbody>
            {clientOrders.map((order) => (
              <tr
                key={`${order.date}-${order.order}`}
                className="border-t border-[#ECE6D6] text-black"
              >
                <td className="px-6 py-5">{order.date}</td>
                <td className="px-6 py-5 font-semibold">{order.order}</td>
                <td className="px-6 py-5">{order.status}</td>
                <td className="px-6 py-5">{order.total}</td>
                <td className="px-6 py-5">{order.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ClientWalletView() {
  const { data: walletData, isLoading: walletLoading } = useClientWalletBalance();

  const totalAmount   = walletData?.total_amount_ngn ?? 0;
  const balance       = walletData?.balance_ngn ?? 0;
  const txCount       = walletData?.transaction_count ?? 0;
  const transactions  = walletData?.transactions ?? [];

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Wallet</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Manage your balance, request withdrawals, and review your full
          financial history — all from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ClientCard
          title="Total amount"
          value={walletLoading ? "—" : `NGN ${totalAmount.toLocaleString("en-NG")}`}
          hint="Historical wallet movement across all transactions."
        />
        <ClientCard
          title="Available balance"
          value={walletLoading ? "—" : `NGN ${balance.toLocaleString("en-NG")}`}
          hint="Spendable wallet balance ready for withdrawal."
        />
        <ClientCard
          title="Transactions"
          value={walletLoading ? "—" : String(txCount)}
          hint="All financial events on this account."
        />
      </div>

      {/* Full wallet dashboard: withdrawal form + transaction table + FAQ */}
      <Transactions
        transactions={transactions}
        isLoading={walletLoading}
        showWalletDashboard
      />
    </div>
  );
}


export function ClientTrackOrderView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Track your order</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Enter the order ID and billing email from your receipt to start the
          tracking flow.
        </p>
      </div>

      <form className="grid gap-6 rounded-[32px] bg-white p-8 shadow-card_shadow md:grid-cols-2 md:p-10">
        <div className="space-y-3">
          <FieldLabel htmlFor="order_id">Order ID</FieldLabel>
          <TextInput id="order_id" placeholder="FASH-ORD-1007" />
        </div>
        <div className="space-y-3">
          <FieldLabel htmlFor="billing_email">Billing email</FieldLabel>
          <TextInput
            id="billing_email"
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex justify-end md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705]"
          >
            Track order
          </button>
        </div>
      </form>
    </div>
  );
}
