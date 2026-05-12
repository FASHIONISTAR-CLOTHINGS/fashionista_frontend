"use client";

/**
 * @file Transactions.tsx
 * @description Account feature — canonical transaction display & withdrawal UI.
 *
 * Wave 10a Upgrade:
 *  - Added animated stat summary bar (total received / spent / balance) above the table.
 *  - WithdrawalForm upgraded to React Hook Form + Zod validation.
 *  - Table rows now use motion.tr for staggered reveal animation.
 *  - Tab nav upgraded with animated active indicator using motion.span.
 *  - All API forms use Sonner toast for user feedback.
 *  - Code preserved for backward-compat: showWalletDashboard prop retained.
 */

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiSync } from "@/core/api/client.sync";
import {
  PackageOpen,
  ChevronDown,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Loader2,
} from "lucide-react";

// ── Transaction types ─────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  order?: string;
  amount: string;
  currency?: string;
  description: string;
  payment_system?: string;
  transaction_type?: "withdrawal" | "deposit";
  status: "pending" | "paid" | "completed" | "failed" | "refunded";
  created_at: string;
  date_and_time?: string;
}

export interface TransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  /** If true, renders the full wallet dashboard (withdrawal form + FAQ). Default: false */
  showWalletDashboard?: boolean;
}

// ── Withdrawal form schema ────────────────────────────────────────────────────

const withdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 1000,
    { message: "Minimum withdrawal is ₦1,000" },
  ),
  payment_method: z.string().min(1, "Payment method is required"),
  full_name: z.string().min(2, "Full name is required"),
  account_name: z.string().min(2, "Account name is required"),
  bank_name: z.string().min(2, "Bank name is required"),
  account_number: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  /** 4-digit wallet transaction PIN — verified server-side */
  transaction_password: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d+$/, "PIN must be numeric"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    title: "How to withdraw money from the account?",
    text: "Navigate to the Withdrawal tab, enter your bank details and amount. Funds are typically sent within 1–3 business days.",
  },
  {
    title: "How long does it take to withdraw money from the wallet?",
    text: "Standard bank transfers take 1–3 business days. Instant transfers to linked accounts are available for premium subscribers.",
  },
  {
    title: "What is the minimum withdrawable amount?",
    text: "The minimum withdrawal amount is ₦1,000. Requests below this threshold will be rejected automatically.",
  },
  {
    title: "Are there fees for withdrawing to my bank account?",
    text: "Withdrawals are free for amounts above ₦5,000. A flat ₦50 processing fee applies for amounts below ₦5,000.",
  },
  {
    title: "Do I need documents to make a withdrawal?",
    text: "Your identity is verified during onboarding. No additional documents are required for standard withdrawals.",
  },
];

// ── Status styles ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-[#EDFAF3] text-[#25784A]",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const statusDotStyles: Record<string, string> = {
  pending: "bg-yellow-500",
  paid: "bg-[#25784A]",
  completed: "bg-green-600",
  failed: "bg-[#EA1705]",
  refunded: "bg-gray-400",
};

// ── Summary helper ────────────────────────────────────────────────────────────

function computeSummary(transactions: Transaction[]) {
  let received = 0;
  let spent = 0;

  transactions.forEach((tx) => {
    const amt = Math.abs(parseFloat(tx.amount || "0"));
    const isIn =
      tx.transaction_type === "deposit" ||
      tx.status === "paid" ||
      tx.status === "completed";
    const isOut = tx.transaction_type === "withdrawal";
    if (isIn) received += amt;
    if (isOut) spent += amt;
  });

  const balance = received - spent;
  return { received, spent, balance };
}

const fmtNGN = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

// ── Stat summary row ──────────────────────────────────────────────────────────

function StatRow({ transactions }: { transactions: Transaction[] }) {
  const { received, spent, balance } = computeSummary(transactions);

  const stats = [
    {
      label: "Total Received",
      value: fmtNGN(received),
      icon: ArrowDownLeft,
      color: "#25784A",
    },
    {
      label: "Total Spent",
      value: fmtNGN(spent),
      icon: ArrowUpRight,
      color: "#EA1705",
    },
    {
      label: "Net Balance",
      value: fmtNGN(balance),
      icon: Wallet,
      color: balance >= 0 ? "#25784A" : "#EA1705",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
          className="flex items-center gap-4 rounded-2xl bg-white shadow-card_shadow p-5"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${stat.color}18` }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#858585]">
              {stat.label}
            </p>
            <p
              className="mt-1 font-bon_foyage text-2xl text-black leading-none"
              style={{ color: stat.value.startsWith("-") ? "#EA1705" : "inherit" }}
            >
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Generic table view ────────────────────────────────────────────────────────

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <PackageOpen size={40} className="text-[#D9D9D9]" />
        <p className="font-raleway text-base text-[#475367]">
          No transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#F0F2F5]">
      <table className="min-w-full divide-y divide-[#F0F2F5]">
        <thead>
          <tr className="bg-[#F8F9FC]">
            {[
              "Order",
              "Date & Time",
              "Payment System",
              "Type",
              "Status",
              "Amount",
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475367]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F2F5] bg-white">
          {transactions.map((tx, index) => {
            const amount = parseFloat(tx.amount || "0");
            const statusKey = tx.status;
            return (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="hover:bg-[#F8F9FC] transition-colors"
              >
                <td className="px-5 py-4 text-sm font-raleway text-[#141414]">
                  {tx.order || tx.id}
                </td>
                <td className="px-5 py-4 text-sm font-raleway text-[#475367]">
                  {tx.date_and_time ||
                    new Date(tx.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                </td>
                <td className="px-5 py-4 text-sm font-raleway text-[#475367]">
                  {tx.payment_system || "—"}
                </td>
                <td className="px-5 py-4 text-sm font-raleway text-[#475367] capitalize">
                  {tx.transaction_type || tx.description || "—"}
                </td>
                <td className="px-5 py-4">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[statusKey] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${statusDotStyles[statusKey] ?? "bg-gray-400"}`}
                    />
                    {statusKey}
                  </div>
                </td>
                <td
                  className={`px-5 py-4 text-sm font-raleway font-bold ${
                    statusKey === "paid" || statusKey === "completed"
                      ? "text-[#25784A]"
                      : statusKey === "failed"
                        ? "text-[#EA1705]"
                        : "text-[#475367]"
                  }`}
                >
                  {tx.currency ?? "₦"}
                  {amount.toLocaleString("en-NG")}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="shadow-card_shadow rounded-[10px] bg-white p-[30px] space-y-4">
      <h2 className="font-satoshi font-semibold text-xl text-black mb-4">
        Frequently Asked Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="border-b border-[#d9d9d9] py-3">
            <button
              className="flex items-center gap-2 text-left w-full font-satoshi text-[15px] font-medium text-black"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
              {item.title}
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="pt-2 text-[13px] text-[#555] leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Withdrawal form — React Hook Form + Zod ───────────────────────────────────

function WithdrawalForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
  });

  const onSubmit = async (data: WithdrawalFormValues) => {
    try {
      /**
       * POST /api/v1/client/wallet/transfer/
       * DRF sync — WalletBalanceService.transfer() is atomic (DB transaction).
       *
       * The backend resolves the withdrawal destination from `receiver_id`.
       * Here we send a self-annotated withdrawal request; the platform admin
       * receiver_id is expected to be resolved on the server from the
       * payment_method + account metadata provided.
       *
       * Idempotency-Key prevents duplicate submissions on retry.
       */
      await apiSync.post("/api/v1/client/wallet/transfer/", {
        amount: data.amount,
        transaction_password: data.transaction_password,
        // Bank metadata for withdrawal processing reference
        metadata: {
          payment_method: data.payment_method,
          full_name: data.full_name,
          account_name: data.account_name,
          bank_name: data.bank_name,
          account_number: data.account_number,
        },
      }, {
        headers: {
          "Idempotency-Key": `withdrawal-${Date.now()}-${data.account_number}`,
        },
      });
      toast.success("Withdrawal request submitted! Funds arrive in 1–3 business days.");
      reset();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Withdrawal failed. Please check your PIN and try again.";
      toast.error(msg);
    }
  };

  const fields = [
    { label: "Amount (₦)", name: "amount" as const, type: "number", full: false, placeholder: "Minimum ₦1,000" },
    { label: "Payment Method", name: "payment_method" as const, type: "text", full: false, placeholder: "e.g. Bank Transfer" },
    { label: "Full Name", name: "full_name" as const, type: "text", full: false, placeholder: "As on your ID" },
    { label: "Account Name", name: "account_name" as const, type: "text", full: false, placeholder: "As on your bank account" },
    { label: "Bank Name", name: "bank_name" as const, type: "text", full: true, placeholder: "e.g. Zenith Bank" },
    { label: "Account Number", name: "account_number" as const, type: "text", full: false, placeholder: "10-digit NUBAN" },
    { label: "Transaction PIN", name: "transaction_password" as const, type: "password", full: false, placeholder: "4-digit security PIN" },
  ];

  return (
    <div className="shadow-card_shadow rounded-[10px] bg-white p-[30px] space-y-6">
      <div>
        <h2 className="font-satoshi font-semibold text-xl text-black">
          Withdrawal
        </h2>
        <p className="text-sm text-[#858585] mt-1">
          Funds arrive within 1–3 business days. Min ₦1,000 · Free above ₦5,000.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap gap-6"
        noValidate
      >
        {fields.map((field) => (
          <div
            key={field.name}
            className={`flex flex-col gap-1.5 ${field.full ? "w-full" : "w-full md:w-[48%]"}`}
          >
            <label
              htmlFor={field.name}
              className="font-satoshi text-[15px] leading-5 text-black"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={`border-[1.5px] h-[56px] rounded-[70px] w-full px-5 outline-none text-black transition-colors ${
                errors[field.name]
                  ? "border-[#EA1705] focus:border-[#EA1705]"
                  : "border-[#D9D9D9] focus:border-[#fda600]"
              }`}
            />
            {errors[field.name] && (
              <p className="text-xs text-[#EA1705] px-2">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <div className="flex justify-end items-end w-full md:w-[48%]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-[30px] py-4 px-8 bg-[#fda600] h-[56px] font-semibold text-black hover:bg-[#e09500] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Confirm Withdrawal
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "withdrawal", label: "Withdrawal", query: "" },
  { id: "transactions", label: "Transactions", query: "transactions" },
  { id: "faq", label: "FAQ", query: "faq" },
] as const;

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Transactions — Canonical account feature component.
 *
 * Two modes:
 * - `showWalletDashboard=false` (default): simple transaction table for dashboards.
 * - `showWalletDashboard=true`: full wallet UI with stat summary, withdrawal form, table, FAQ.
 */
export default function Transactions({
  transactions = [],
  isLoading = false,
  showWalletDashboard = false,
}: TransactionsProps) {
  const searchParams = useSearchParams();
  const options = searchParams.get("options");

  // ── Simple mode (dashboard embed) ──────────────────────────────────────────
  if (!showWalletDashboard) {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F0F2F5]" />
          ))}
        </div>
      );
    }
    return <TransactionTable transactions={transactions} />;
  }

  // ── Wallet dashboard mode ───────────────────────────────────────────────────
  const activeTab = options === "transactions" ? "transactions" : options === "faq" ? "faq" : "withdrawal";

  return (
    <div>
      {/* Animated stat summary */}
      {transactions.length > 0 && <StatRow transactions={transactions} />}

      {/* Premium tab nav */}
      <nav className="flex justify-between items-center py-6 flex-wrap gap-3">
        <div className="flex gap-2 bg-[#F5F5F5] rounded-full p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`?options=${tab.query}`}
                className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "#141414" : "#858585",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    style={{ zIndex: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Panel content */}
      <AnimatePresence mode="wait">
        {activeTab === "withdrawal" && (
          <motion.div
            key="withdrawal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <WithdrawalForm />
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="shadow-card_shadow rounded-[10px] bg-white p-[30px] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-satoshi font-semibold text-xl text-black">
                  Transactions
                </h2>
                <p className="font-satoshi font-medium text-[#858585] text-sm">
                  All financial history
                </p>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl bg-[#F0F2F5]"
                    />
                  ))}
                </div>
              ) : (
                <TransactionTable transactions={transactions} />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <FaqAccordion />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
