"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PackageOpen, ChevronDown } from "lucide-react";

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

// ── Generic table view ────────────────────────────────────────────────────────

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <PackageOpen size={40} className="text-[#D9D9D9]" />
        <p className="font-raleway text-base text-[#475367]">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#F0F2F5]">
      <table className="min-w-full divide-y divide-[#F0F2F5]">
        <thead>
          <tr className="bg-[#F8F9FC]">
            {["Order", "Date & Time", "Payment System", "Type", "Status", "Amount"].map((h) => (
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
          {transactions.map((tx) => {
            const amount = parseFloat(tx.amount || "0");
            const statusKey = tx.status;
            return (
              <tr key={tx.id} className="hover:bg-[#F8F9FC] transition-colors">
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
              </tr>
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
          <div
            key={index}
            className="border-b border-[#d9d9d9] py-3"
          >
            <button
              className="flex items-center gap-2 text-left w-full font-satoshi text-[15px] font-medium text-black"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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

// ── Withdrawal form ───────────────────────────────────────────────────────────

function WithdrawalForm() {
  return (
    <div className="shadow-card_shadow rounded-[10px] bg-white p-[30px] space-y-4">
      <h2 className="font-satoshi font-semibold text-xl text-black">Withdrawal</h2>
      <form className="flex flex-wrap gap-6">
        {[
          { label: "Amount", name: "amount", type: "number", full: false },
          { label: "Payment Method", name: "payment_method", type: "text", full: false },
          { label: "Full Name", name: "full_name", type: "text", full: false },
          { label: "Account Name", name: "account_name", type: "text", full: false },
          { label: "Bank Name", name: "bank_name", type: "text", full: true },
          { label: "Account Number", name: "account_number", type: "text", full: false },
        ].map((field) => (
          <div
            key={field.name}
            className={`flex flex-col gap-2 ${field.full ? "w-full" : "w-full md:w-[48%]"}`}
          >
            <label className="font-satoshi text-[15px] leading-5 text-black">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              className="border-[1.5px] border-[#D9D9D9] h-[60px] rounded-[70px] w-full px-5 outline-none text-black focus:border-[#fda600] transition-colors"
            />
          </div>
        ))}
        <div className="flex justify-end items-end w-full md:w-[48%]">
          <button
            type="submit"
            className="rounded-[30px] py-4 px-8 bg-[#fda600] h-[60px] font-semibold text-black hover:bg-[#e09500] transition-colors"
          >
            Confirm Withdrawal
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Transactions — Canonical account feature component.
 *
 * Two modes:
 * - `showWalletDashboard=false` (default): simple transaction table for dashboards.
 * - `showWalletDashboard=true`: full wallet UI with withdrawal form, transaction table, FAQ.
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
  const delta = 1;

  return (
    <div>
      {/* Wallet tab nav */}
      <nav className="flex justify-between items-center py-8 flex-wrap gap-3">
        <div className="flex gap-3">
          <Link
            href="?options="
            className={`px-5 py-2 font-medium rounded-[30px] transition-colors ${
              !options || options === ""
                ? "bg-[#fda600] text-black"
                : "bg-[#d9d9d9] text-[#4E4E4E]"
            }`}
          >
            Withdrawal
          </Link>
          <Link
            href="?options=transactions"
            className={`px-5 py-2 font-medium rounded-[30px] transition-colors ${
              options === "transactions"
                ? "bg-[#fda600] text-black"
                : "bg-[#d9d9d9] text-[#4E4E4E]"
            }`}
          >
            Transactions
          </Link>
        </div>
        <Link
          href="?options=faq"
          className={`px-5 py-2 font-medium rounded-[30px] transition-colors ${
            options === "faq"
              ? "bg-[#fda600] text-black"
              : "bg-[#d9d9d9] text-[#4E4E4E]"
          }`}
        >
          FAQ
        </Link>
      </nav>

      {/* Panel content */}
      <AnimatePresence mode="wait">
        {(!options || options === "") && (
          <motion.div
            key="withdrawal"
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <WithdrawalForm />
          </motion.div>
        )}

        {options === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ x: "50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="shadow-card_shadow rounded-[10px] bg-white p-[30px] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-satoshi font-semibold text-xl text-black">Transactions</h2>
                <p className="font-satoshi font-medium text-black text-sm">All financial history</p>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F0F2F5]" />
                  ))}
                </div>
              ) : (
                <TransactionTable transactions={transactions} />
              )}
            </div>
          </motion.div>
        )}

        {options === "faq" && (
          <motion.div
            key="faq"
            initial={{ x: "50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <FaqAccordion />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
