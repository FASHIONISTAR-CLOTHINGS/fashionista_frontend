// features/vendor/components/bank-accounts/BankAccountCard.tsx
/**
 * BankAccountCard — Premium card displaying a single saved bank account.
 *
 * Features:
 *  - Masked account number (****1234)
 *  - Bank name + account name
 *  - KYC name match badge (green ✅ / amber ⚠)
 *  - Default badge + "Set as Default" button
 *  - Delete with confirmation dialog
 *  - Verification status indicator
 *  - Animated hover / active states
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VendorBankAccount } from "@/features/vendor/types/vendor.types";
import {
  useDeleteBankAccount,
  useSetDefaultAccount,
} from "@/features/vendor/hooks/use-bank-accounts";

interface BankAccountCardProps {
  account:      VendorBankAccount;
  showActions?: boolean;
  className?:   string;
}

export function BankAccountCard({
  account,
  showActions = true,
  className,
}: BankAccountCardProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const deleteMutation     = useDeleteBankAccount();
  const setDefaultMutation = useSetDefaultAccount();

  const isDeleting    = deleteMutation.isPending;
  const isSettingDefault = setDefaultMutation.isPending;

  function handleDelete() {
    deleteMutation.mutate(account.id, {
      onSuccess: () => setConfirmDeleteOpen(false),
    });
  }

  function handleSetDefault() {
    if (!account.is_default) {
      setDefaultMutation.mutate(account.id);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group relative rounded-2xl border p-5 transition-all duration-200",
        "bg-gradient-to-br from-slate-900/80 to-slate-800/80",
        "border-slate-700/50 hover:border-violet-500/40",
        "backdrop-blur-sm shadow-lg hover:shadow-violet-500/10",
        account.is_default && "border-violet-500/60 shadow-violet-500/10",
        className
      )}
    >
      {/* Default ribbon */}
      {account.is_default && (
        <div className="absolute top-3 right-3">
          <Badge
            className="flex items-center gap-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs px-2 py-0.5"
          >
            <Star className="h-3 w-3 fill-current" />
            Default
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Bank icon */}
        <div
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-violet-600/20 to-indigo-600/20",
            "border border-violet-500/20"
          )}
        >
          <Building2 className="h-5 w-5 text-violet-400" />
        </div>

        {/* Account info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">
              {account.bank_name}
            </p>
            {/* Verification badge */}
            {account.is_verified ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                <Check className="h-2.5 w-2.5" />
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                Pending
              </span>
            )}
          </div>

          {/* Masked account number */}
          <p className="text-base font-mono font-bold text-slate-100 tracking-widest">
            {account.masked_account}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {account.account_name}
          </p>

          {/* KYC name match */}
          <div className="mt-2 flex items-center gap-1.5">
            {account.kyc_name_matched ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-emerald-400">KYC name verified</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400/70 flex-shrink-0" />
                <span className="text-[11px] text-amber-400/70">KYC name not matched (advisory)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 flex items-center gap-2">
          {/* Set as Default */}
          {!account.is_default && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
              className={cn(
                "flex-1 h-8 text-xs rounded-lg",
                "text-slate-400 hover:text-violet-300 hover:bg-violet-500/10",
                "border border-slate-700/50 hover:border-violet-500/30",
              )}
              id={`bank-account-set-default-${account.id}`}
            >
              {isSettingDefault ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Star className="h-3 w-3 mr-1" />
                  Set Default
                </>
              )}
            </Button>
          )}

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDeleteOpen(true)}
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              "text-slate-500 hover:text-red-400 hover:bg-red-500/10",
              "border border-slate-700/50 hover:border-red-500/30",
            )}
            id={`bank-account-delete-${account.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {confirmDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-left">
                <h3 className="text-lg font-bold text-white font-semibold">
                  Remove Bank Account?
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  This will remove{" "}
                  <strong className="text-white">
                    {account.bank_name} ****{account.account_last4}
                  </strong>{" "}
                  from your saved accounts. You can always add it back later.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm text-white transition flex items-center gap-1.5"
                    id="bank-account-delete-confirm"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
