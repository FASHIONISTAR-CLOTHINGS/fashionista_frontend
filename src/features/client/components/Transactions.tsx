"use client";

/**
 * @file Transactions.tsx
 * @description Modernized Client Wallet feature — canonical transaction ledger, live withdrawal UI, and FAQ.
 *
 * Design Aesthetics:
 *  - Premium 2026/2027 FinTech interface.
 *  - Glassmorphic panels with subtle borders, blur effects, and premium transitions.
 *  - Color palette: Corporate Forest Green (#01454A) and Warm Gold (#FDA600).
 *  - Micro-animations and staggered staggered entries using Framer Motion.
 *  - Full React Hook Form + Zod schema validation.
 *  - Automatic NUBAN name resolution via Paystack.
 *  - Transfer recipient registration prior to executing withdrawals.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { apiSync } from "@/core/api/client.sync";
import {
  PackageOpen,
  ChevronDown,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Loader2,
  LockKeyhole,
  CheckCircle2,
  Building2,
  Coins,
  History,
  HelpCircle,
  Clock,
  Check,
  AlertTriangle,
} from "lucide-react";
import { BankSelectField, getBankOption } from "@/shared/reference-data";
import { vendorApi } from "@/features/vendor";

// ── Transaction Types ─────────────────────────────────────────────────────────

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

// ── Withdrawal Form Schema ────────────────────────────────────────────────────

const withdrawalSchema = z.object({
  /** Amount in NGN — minimum ₦1,000 enforced here. */
  amount: z.string().min(1, "Amount is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 1000,
    { message: "Minimum withdrawal is ₦1,000" }
  ),
  /** Nigerian bank code e.g. "057" for Zenith Bank. */
  bank_code: z.string().min(2, "Bank selection is required"),
  /** 10-digit NUBAN account number. */
  account_number: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  /** Beneficiary name as registered with the bank. */
  account_name: z.string().min(2, "Account name must be resolved"),
  /** 4-digit wallet transaction PIN — bcrypt-verified server-side. */
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d+$/, "PIN must be numeric"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

// ── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    title: "How do I withdraw funds from my wallet?",
    text: "Navigate to the Withdrawal tab, choose your bank, enter your 10-digit account number, and verify your account holder name. Enter the amount and your secure 4-digit PIN, then click confirm. Funds will be deposited in your bank account shortly.",
  },
  {
    title: "How long does it take for withdrawals to settle?",
    text: "Standard withdrawals are processed immediately via our secure Paystack infrastructure. Most transfers arrive in your linked bank account within minutes, though some banks may take up to 24 hours.",
  },
  {
    title: "What is the minimum withdrawal limit?",
    text: "The minimum withdrawable amount is ₦1,000. This ensures efficient transactional processing and complies with banking clearing house thresholds.",
  },
  {
    title: "Are there any fees associated with wallet withdrawals?",
    text: "Fashionistar offers free withdrawals for all transactions above ₦5,000. A standard processing fee of ₦50 is applied to withdrawals below ₦5,000 to cover inter-bank networking charges.",
  },
  {
    title: "Is my financial transaction secure?",
    text: "Yes, completely. All financial operations are fully tokenized and encrypted with 256-bit SSL technology. Escrow-protected trades ensure your payments are held safely until product handoff, and withdrawals are locked behind your secure, hashed 4-digit transaction PIN.",
  },
];

// ── Format helpers ────────────────────────────────────────────────────────────

const fmtNGN = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const parseAmount = (amtStr: string): number => {
  const clean = amtStr.replace(/[^0-9.-]+/g, "");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
};

// ── Main Transactions Component ────────────────────────────────────────────────

const Transactions = ({
  transactions = [],
  isLoading = false,
  showWalletDashboard = true,
}: TransactionsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const options = searchParams.get("options") || "withdrawal"; // default to withdrawal
  const queryClient = useQueryClient();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [resolvingName, setResolvingName] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      bank_code: "",
      account_number: "",
      account_name: "",
      pin: "",
    },
  });

  const watchBankCode = watch("bank_code");
  const watchAccountNumber = watch("account_number");

  // Live account name resolution effect
  useEffect(() => {
    if (watchBankCode && watchAccountNumber && watchAccountNumber.length === 10) {
      const resolveAccount = async () => {
        setResolvingName(true);
        setValue("account_name", ""); // Clear previous value while resolving
        try {
          const res = await vendorApi.resolveAccountName({
            account_number: watchAccountNumber,
            bank_code: watchBankCode,
          });
          if (res && res.account_name) {
            setValue("account_name", res.account_name, { shouldValidate: true });
            toast.success(`Account verified: ${res.account_name}`);
          } else {
            toast.error("Could not verify account name. Check details.");
          }
        } catch (err) {
          console.error("Failed to resolve bank details:", err);
          toast.error("Account verification failed. Please double check.");
        } finally {
          setResolvingName(false);
        }
      };
      resolveAccount();
    } else {
      setValue("account_name", "");
    }
  }, [watchBankCode, watchAccountNumber, setValue]);

  // Handle Form Submission
  const onSubmit = async (data: WithdrawalFormValues) => {
    try {
      const bankOpt = getBankOption(data.bank_code);
      const bankName = bankOpt?.name ?? "Unknown Bank";

      // Step 1: Register Transfer Recipient
      toast.info("Registering transfer secure gateway recipient...");
      await apiSync.post("v1/payment/transfer-recipient/", {
        account_number: data.account_number,
        account_name: data.account_name,
        bank_name: bankName,
        bank_code: data.bank_code,
      });

      // Step 2: Trigger Wallet Withdrawal
      toast.info("Processing secure withdrawal...");
      await apiSync.post(
        "v1/client/wallet/withdraw/",
        {
          amount: data.amount,
          pin: data.pin,
          bank_code: data.bank_code,
          account_number: data.account_number,
          account_name: data.account_name,
        },
        {
          headers: {
            "Idempotency-Key": `withdrawal-${Date.now()}-${data.account_number}`,
          },
        }
      );

      toast.success("Withdrawal of " + fmtNGN(Number(data.amount)) + " submitted successfully!");
      reset();

      // Refresh layout balance / transaction queries
      queryClient.invalidateQueries({ queryKey: ["client", "wallet"] });
    } catch (err: unknown) {
      console.error("Withdrawal error:", err);
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(apiMsg ?? "Withdrawal failed. Check PIN or ledger balance.");
    }
  };

  // Nav helpers
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("options", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Compute stats based on actual transactions
  const received = transactions
    .filter((tx) => tx.transaction_type === "deposit" && (tx.status === "completed" || tx.status === "paid"))
    .reduce((sum, tx) => sum + parseAmount(tx.amount), 0);

  const spent = transactions
    .filter((tx) => tx.transaction_type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + parseAmount(tx.amount), 0);

  const netBalance = received - spent;

  return (
    <div className="w-full space-y-6">
      {/* Premium FinTech Stat Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative overflow-hidden rounded-[2rem] border border-[#01454A]/20 bg-gradient-to-br from-[#01454A]/5 to-white p-6 shadow-sm backdrop-blur-xl"
        >
          <div className="absolute right-3 top-3 h-14 w-14 rounded-full bg-[#01454A]/5 flex items-center justify-center">
            <ArrowDownLeft className="h-6 w-6 text-[#01454A]" />
          </div>
          <p className="text-xs font-bold tracking-widest text-[#5A6465] uppercase">Total Received</p>
          <h3 className="mt-2 text-2xl font-black text-[#01454A] font-satoshi">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmtNGN(received)}
          </h3>
          <p className="mt-1 text-[11px] text-[#5A6465]/80">Cumulative deposited funds</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-50/10 to-white p-6 shadow-sm backdrop-blur-xl"
        >
          <div className="absolute right-3 top-3 h-14 w-14 rounded-full bg-red-500/5 flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-xs font-bold tracking-widest text-[#5A6465] uppercase">Total Withdrawn</p>
          <h3 className="mt-2 text-2xl font-black text-red-600 font-satoshi">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmtNGN(spent)}
          </h3>
          <p className="mt-1 text-[11px] text-[#5A6465]/80">Withdrawn or transfer debits</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative overflow-hidden rounded-[2rem] border border-[#FDA600]/30 bg-gradient-to-br from-[#FDA600]/5 to-white p-6 shadow-sm backdrop-blur-xl"
        >
          <div className="absolute right-3 top-3 h-14 w-14 rounded-full bg-[#FDA600]/5 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-[#FDA600]" />
          </div>
          <p className="text-xs font-bold tracking-widest text-[#5A6465] uppercase">Net Cash Flow</p>
          <h3 className={`mt-2 text-2xl font-black font-satoshi ${netBalance >= 0 ? "text-[#01454A]" : "text-red-500"}`}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmtNGN(netBalance)}
          </h3>
          <p className="mt-1 text-[11px] text-[#5A6465]/80">Net account volume delta</p>
        </motion.div>
      </div>

      {/* Styled Glassmorphic Menu Tabs */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white/40 border border-slate-100 p-2 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange("withdrawal")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-300 ${
              options === "withdrawal"
                ? "bg-[#01454A] text-white shadow-lg shadow-[#01454A]/20 scale-102"
                : "text-[#5A6465] hover:bg-slate-100/50 hover:text-black"
            }`}
          >
            <Coins className="h-4 w-4" />
            Withdrawal
          </button>

          <button
            onClick={() => handleTabChange("transactions")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-300 ${
              options === "transactions"
                ? "bg-[#01454A] text-white shadow-lg shadow-[#01454A]/20 scale-102"
                : "text-[#5A6465] hover:bg-slate-100/50 hover:text-black"
            }`}
          >
            <History className="h-4 w-4" />
            Ledger Logs
          </button>
        </div>

        <button
          onClick={() => handleTabChange("faq")}
          className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-300 ${
            options === "faq"
              ? "bg-[#01454A] text-white shadow-lg shadow-[#01454A]/20 scale-102"
              : "text-[#5A6465] hover:bg-slate-100/50 hover:text-black"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Faq Help
        </button>
      </div>

      {/* Content Panels */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* TAB 1: Withdrawal Form */}
          {options === "withdrawal" && (
            <motion.div
              key="withdrawal"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-[#01454A]/10 bg-white p-8 shadow-card_shadow relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-[#01454A]/5 pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-6">
                <Coins className="h-5 w-5 text-[#01454A]" />
                <h2 className="text-xl font-bold text-black font-satoshi">Submit Withdrawal</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5A6465] uppercase tracking-wider">
                      Select Destination Bank
                    </label>
                    <BankSelectField
                      {...register("bank_code")}
                      className="border border-[#D9D9D9] hover:border-[#01454A]/40 focus:border-[#01454A] h-[55px] rounded-xl w-full px-4 outline-none text-black bg-white transition-all duration-200"
                    />
                    {errors.bank_code && (
                      <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.bank_code.message}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5A6465] uppercase tracking-wider">
                      Nuban Account Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 0123456789"
                        {...register("account_number")}
                        className="border border-[#D9D9D9] hover:border-[#01454A]/40 focus:border-[#01454A] h-[55px] rounded-xl w-full px-4 outline-none text-black bg-white transition-all duration-200"
                      />
                      {resolvingName && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[#01454A] bg-[#01454A]/5 px-2.5 py-1 rounded-lg font-medium">
                          <Loader2 className="h-3 w-3 animate-spin" /> Verifying…
                        </div>
                      )}
                    </div>
                    {errors.account_number && (
                      <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.account_number.message}
                      </p>
                    )}
                  </div>

                  {/* Account Holder Name (Resolved) */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#5A6465] uppercase tracking-wider">
                      Verified Account Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        placeholder="Enter Bank Code and Account Number above to auto-resolve"
                        {...register("account_name")}
                        className="border border-[#D9D9D9] bg-slate-50/50 h-[55px] rounded-xl w-full px-4 outline-none text-black font-semibold text-sm transition-all duration-200"
                      />
                      {watch("account_name") && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    {errors.account_name && (
                      <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.account_name.message}
                      </p>
                    )}
                  </div>

                  {/* Amount to Withdraw */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5A6465] uppercase tracking-wider">
                      Amount (₦ NGN)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5A6465]">
                        ₦
                      </div>
                      <input
                        type="number"
                        placeholder="Minimum 1,000"
                        {...register("amount")}
                        className="border border-[#D9D9D9] hover:border-[#01454A]/40 focus:border-[#01454A] h-[55px] rounded-xl w-full pl-8 pr-4 outline-none text-black transition-all duration-200"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.amount.message}
                      </p>
                    )}
                  </div>

                  {/* Transaction Secure PIN */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5A6465] uppercase tracking-wider">
                      4-Digit Transaction Pin
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      {...register("pin")}
                      className="border border-[#D9D9D9] hover:border-[#01454A]/40 focus:border-[#01454A] h-[55px] rounded-xl w-full px-4 text-center tracking-[1em] font-black outline-none text-black transition-all duration-200"
                    />
                    {errors.pin && (
                      <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.pin.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Secure Notice & Submit button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-[#5A6465]">
                    <LockKeyhole className="h-4 w-4 text-[#01454A]" />
                    <span>Secure 256-Bit SSL Encrypted Protocol</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || resolvingName}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#FDA600] hover:bg-[#FDA600]/95 active:scale-98 text-black h-[55px] px-8 font-bold text-sm shadow-md shadow-[#FDA600]/20 min-w-[160px] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Confirm Cashout
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: Ledger Logs (Transactions Table) */}
          {options === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-[#01454A]/10 bg-white p-8 shadow-card_shadow overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 text-[#01454A]" />
                  <div>
                    <h2 className="text-xl font-bold text-black font-satoshi">Financial Ledger Logs</h2>
                    <p className="text-xs text-[#5A6465]/80 mt-0.5">Real-time audited transaction events on this account.</p>
                  </div>
                </div>
                <div className="text-xs text-[#01454A] font-semibold bg-[#01454A]/5 px-3 py-1.5 rounded-lg border border-[#01454A]/10">
                  Total Events: {transactions.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-[#5A6465] bg-slate-50/50">
                      <th className="py-4 px-4 rounded-l-xl">Reference/Order</th>
                      <th className="py-4 px-4">Date & Time</th>
                      <th className="py-4 px-4">Description</th>
                      <th className="py-4 px-4">Payment Node</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right rounded-r-xl">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-5 px-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                          <td className="py-5 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                          <td className="py-5 px-4"><div className="h-4 bg-slate-100 rounded w-44" /></td>
                          <td className="py-5 px-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                          <td className="py-5 px-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                          <td className="py-5 px-4"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                          <td className="py-5 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                        </tr>
                      ))
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#5A6465]">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <PackageOpen className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="font-semibold text-black">No transaction events recorded</p>
                            <p className="text-xs max-w-[280px]">Fund your wallet or place custom order customizations to generate audited logs.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, idx) => {
                        const isDeposit = tx.transaction_type === "deposit";
                        const statusColors: Record<string, string> = {
                          pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
                          paid: "bg-green-50 text-green-700 border-green-200",
                          completed: "bg-[#EDFAF3] text-[#25784A] border-[#25784A]/10",
                          failed: "bg-red-50 text-red-700 border-red-200",
                          refunded: "bg-slate-50 text-slate-600 border-slate-200",
                        };

                        return (
                          <motion.tr
                            key={tx.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.04 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-5 px-4 font-bold text-black font-satoshi">
                              {tx.order ? (
                                <Link
                                  href={`/client/dashboard/orders/${tx.order}`}
                                  className="text-[#01454A] hover:underline"
                                >
                                  #{tx.order.substring(0, 8)}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-5 px-4 text-xs text-[#5A6465]/80 whitespace-nowrap">
                              {tx.created_at ? new Date(tx.created_at).toLocaleString("en-NG", {
                                year: "2-digit",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : "—"}
                            </td>
                            <td className="py-5 px-4 text-xs max-w-[200px] truncate text-[#5A6465] font-medium" title={tx.description}>
                              {tx.description || "Wallet Transaction"}
                            </td>
                            <td className="py-5 px-4 text-xs font-bold text-black whitespace-nowrap flex items-center gap-1.5 mt-0.5">
                              <Building2 className="h-3.5 w-3.5 text-[#5A6465]/60" />
                              {tx.payment_system || "Fashionistar Net"}
                            </td>
                            <td className="py-5 px-4">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                isDeposit ? "bg-emerald-50 text-green-700 border-emerald-100" : "bg-orange-50 text-amber-700 border-orange-100"
                              }`}>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center justify-center gap-1.5 w-fit ${
                                statusColors[tx.status] || "bg-slate-50 text-slate-500 border-slate-200"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  tx.status === "completed" || tx.status === "paid" ? "bg-green-600" : tx.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                                }`} />
                                {tx.status}
                              </span>
                            </td>
                            <td className={`py-5 px-4 text-right font-black text-sm font-satoshi ${
                              isDeposit ? "text-[#01454A]" : "text-red-600"
                            }`}>
                              {isDeposit ? "+" : "-"}{fmtNGN(Math.abs(parseFloat(tx.amount || "0")))}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FAQ Panel */}
          {options === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-[#01454A]/10 bg-white p-8 shadow-card_shadow"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <HelpCircle className="h-5 w-5 text-[#01454A]" />
                <h2 className="text-xl font-bold text-black font-satoshi">Frequently Asked Questions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpened = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-2xl bg-slate-50/20 hover:bg-slate-50/50 p-4 transition-all duration-300"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpened ? null : idx)}
                        className="flex items-start justify-between gap-3 text-left w-full font-bold text-black font-satoshi text-base py-1 group"
                      >
                        <span>{item.title}</span>
                        <ChevronDown className={`h-5 w-5 text-[#5A6465] shrink-0 transition-transform duration-300 mt-0.5 group-hover:text-black ${
                          isOpened ? "rotate-180 text-black" : "rotate-0"
                        }`} />
                      </button>

                      <AnimatePresence>
                        {isOpened && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-[#5A6465] leading-relaxed mt-2 pt-2 border-t border-slate-100/60 font-medium">
                              {item.text}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Transactions;
