// features/vendor/components/bank-accounts/BankAccountsList.tsx
/**
 * BankAccountsList — List of the vendor's saved bank accounts with
 * an "Add Account" button and max-5 enforcement.
 *
 * Shows:
 *  - Loading skeleton (3 ghost cards)
 *  - Empty state with CTA to add first account
 *  - Grid of BankAccountCards (max 5)
 *  - "Add Bank Account" button (disabled when at limit)
 */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BankAccountCard } from "./BankAccountCard";
import { AddBankAccountModal } from "./AddBankAccountModal";
import { useBankAccounts } from "@/features/vendor/hooks/use-bank-accounts";

const MAX_ACCOUNTS = 5;

interface BankAccountsListProps {
  className?: string;
}

export function BankAccountsList({ className }: BankAccountsListProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { data: accounts = [], isLoading, isError } = useBankAccounts();

  const atLimit   = accounts.length >= MAX_ACCOUNTS;
  const remaining = Math.max(0, MAX_ACCOUNTS - accounts.length);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Saved Bank Accounts
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isLoading
              ? "Loading accounts..."
              : `${accounts.length} of ${MAX_ACCOUNTS} accounts saved`}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddModalOpen(true)}
          disabled={atLimit || isLoading}
          className={cn(
            "h-9 rounded-xl px-4 text-xs font-medium gap-1.5 transition-all",
            atLimit
              ? "opacity-50 cursor-not-allowed bg-slate-700 text-slate-400"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20",
          )}
          id="add-bank-account-button"
          title={atLimit ? `Maximum of ${MAX_ACCOUNTS} accounts reached` : "Add a new bank account"}
        >
          <Plus className="h-3.5 w-3.5" />
          {atLimit ? "Limit Reached" : "Add Account"}
        </Button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-40 rounded-2xl bg-slate-800/60"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">Failed to load bank accounts.</p>
          <p className="text-xs text-slate-500 mt-1">Please refresh the page.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && accounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/15 to-indigo-600/15 border border-violet-500/20 mb-4">
            <Building2 className="h-7 w-7 text-violet-400/70" />
          </div>
          <p className="text-sm font-medium text-slate-300">No bank accounts yet</p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
            Add a bank account to start receiving payouts from your Fashionistar wallet.
          </p>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="mt-5 h-9 rounded-xl px-5 text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
            id="add-first-bank-account-button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Your First Account
          </Button>
        </motion.div>
      )}

      {/* Account cards grid */}
      {!isLoading && !isError && accounts.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {accounts.map((account) => (
                <BankAccountCard key={account.id} account={account} />
              ))}
            </AnimatePresence>
          </div>

          {/* Remaining slots indicator */}
          {!atLimit && (
            <p className="text-[11px] text-slate-500 text-center">
              You can add {remaining} more account{remaining !== 1 ? "s" : ""}
            </p>
          )}
          {atLimit && (
            <p className="text-[11px] text-amber-400/70 text-center">
              Maximum of {MAX_ACCOUNTS} bank accounts reached. Delete one to add another.
            </p>
          )}
        </>
      )}

      {/* Add Modal */}
      <AddBankAccountModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        maxReached={atLimit}
      />
    </div>
  );
}
