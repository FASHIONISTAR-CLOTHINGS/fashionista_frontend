// features/vendor/components/bank-accounts/AddBankAccountModal.tsx
/**
 * AddBankAccountModal — Premium modal for adding a new bank account.
 *
 * UX Flow:
 *  1. Vendor selects bank from BankSelectField.
 *  2. Vendor enters 10-digit account number.
 *  3. Vendor clicks "Verify Account" → backend calls Paystack /bank/resolve.
 *  4. Account holder name auto-fills (read-only after resolution).
 *  5. KYC name match indicator appears (green ✅ / amber ⚠).
 *  6. Vendor clicks "Save Account" → POST /api/v1/vendor/bank-accounts/.
 *  7. Modal closes, list refreshes, toast confirms.
 */
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { BankSelectField } from "@/components/reference-data/components/BankSelectField";
import { getBankOption } from "@/components/reference-data/generated/banks.generated";
import { cn } from "@/lib/utils";
import {
  useCreateBankAccount,
  useResolveAccount,
} from "@/features/vendor/hooks/use-bank-accounts";

interface AddBankAccountModalProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  maxReached?:  boolean;
}

export function AddBankAccountModal({
  open,
  onOpenChange,
  maxReached: _maxReached = false,
}: AddBankAccountModalProps) {
  // Form state
  const [bankCode,     setBankCode]     = useState("");
  const [bankName,     setBankName]     = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName,  setAccountName]  = useState("");
  const [isResolved,   setIsResolved]   = useState(false);

  // Mutations
  const resolveMutation = useResolveAccount();
  const createMutation  = useCreateBankAccount();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setBankCode("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setIsResolved(false);
      resolveMutation.reset();
      createMutation.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBankChange(code: string) {
    setBankCode(code);
    const opt = getBankOption(code);
    setBankName(opt?.name ?? "");
    // Reset resolution if bank changes
    setIsResolved(false);
    setAccountName("");
    resolveMutation.reset();
  }

  function handleAccountNumberChange(val: string) {
    // Only digits, max 10
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(digits);
    // Reset resolution if number changes
    if (isResolved) {
      setIsResolved(false);
      setAccountName("");
      resolveMutation.reset();
    }
  }

  function handleResolve() {
    if (!bankCode || accountNumber.length !== 10) return;
    resolveMutation.mutate(
      { account_number: accountNumber, bank_code: bankCode },
      {
        onSuccess: (result) => {
          setAccountName(result.account_name);
          setIsResolved(true);
        },
      }
    );
  }

  function handleSave() {
    if (!isResolved || !bankCode || !bankName || !accountName) return;
    createMutation.mutate(
      {
        account_number: accountNumber,
        bank_code:      bankCode,
        bank_name:      bankName,
        account_name:   accountName,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  const canResolve = bankCode.length > 0 && accountNumber.length === 10;
  const canSave    = isResolved && !createMutation.isPending;
  const isResolving = resolveMutation.isPending;
  const isSaving    = createMutation.isPending;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className={cn(
          "max-w-md w-full rounded-2xl border border-[#ECE6D6] p-6 relative",
          "bg-white text-[#1A1208]",
          "shadow-2xl shadow-black/15",
        )}
        id="add-bank-account-modal"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-[#7A6B44] hover:text-[#01454A] transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#01454A]/10 border border-[#01454A]/15">
              <Building2 className="h-5 w-5 text-[#01454A]" />
            </div>
            <div>
              <h2 className="text-[#1A1208] text-lg font-semibold">
                Add Bank Account
              </h2>
              <p className="text-[#7A6B44] text-xs mt-0.5">
                Verify your account details to receive payouts
              </p>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-2.5 rounded-xl bg-[#FFF6E3] border border-[#FDA600]/25 p-3 mb-4">
          <Lock className="h-4 w-4 text-[#01454A] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#7A6B44] leading-relaxed">
            Your account number is <strong className="text-[#01454A]">encrypted</strong> and stored securely.
            Only the last 4 digits are displayed in your dashboard.
          </p>
        </div>

        <div className="space-y-4">
          {/* Bank Selection */}
          <div>
            <Label className="text-xs text-[#7A6B44] mb-1.5 block">Bank Name</Label>
            <BankSelectField
              value={bankCode}
              onChange={handleBankChange}
              label=""
              disabled={isSaving}
            />
          </div>

          {/* Account Number */}
          <div>
            <Label htmlFor="bank-account-number" className="text-xs text-[#7A6B44] mb-1.5 block">
              Account Number
            </Label>
            <div className="relative">
              <Input
                id="bank-account-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Enter 10-digit NUBAN"
                value={accountNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAccountNumberChange(e.target.value)}
                disabled={isSaving}
                className={cn(
                  "h-10 rounded-xl font-mono tracking-widest text-sm",
                  "bg-white border-[#D9D9D9] text-[#1A1208]",
                  "placeholder:text-[#7A6B44]/45 placeholder:tracking-normal placeholder:font-sans",
                  "focus-visible:ring-[#FDA600]/40 focus-visible:border-[#FDA600]",
                )}
              />
              {accountNumber.length === 10 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#7A6B44] mt-1">
              {accountNumber.length}/10 digits
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleResolve}
            disabled={!canResolve || isResolving || isResolved || isSaving}
            className={cn(
              "w-full h-10 rounded-xl text-sm font-medium transition-all",
              isResolved
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                : "bg-[#01454A] hover:bg-[#01454A]/90 text-white",
            )}
            id="verify-account-button"
          >
            {isResolving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying account...
              </>
            ) : isResolved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Account Verified
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Verify Account
              </>
            )}
          </Button>

          {/* Resolution Error */}
          <AnimatePresence>
            {resolveMutation.isError && !isResolved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
              >
                {(resolveMutation.error as { response?: { data?: { error?: string } } })
                  ?.response?.data?.error ??
                  "Could not verify account. Please check the details and try again."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resolved Account Name */}
          <AnimatePresence>
            {isResolved && accountName && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Account Name (read-only) */}
                <div>
                  <Label className="text-xs text-[#7A6B44] mb-1.5 block">
                    Account Holder Name
                  </Label>
                  <div
                    className={cn(
                      "flex items-center gap-2 h-10 px-3 rounded-xl text-sm",
                      "bg-emerald-500/5 border border-emerald-500/20 text-emerald-300",
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-medium">{accountName}</span>
                  </div>
                </div>

                {/* KYC Name Match indicator — derived from backend response field */}
                {/* The actual kyc_name_matched comes back from createBankAccount.
                    Here we show a pre-save advisory note. */}
                <div className="flex items-start gap-2 rounded-lg bg-[#E6F4F5] p-3 border border-[#01454A]/15">
                  <ShieldCheck className="h-4 w-4 text-[#01454A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-[#01454A] font-medium">KYC Verification</p>
                    <p className="text-[11px] text-[#7A6B44] mt-0.5">
                      The account name will be cross-checked against your KYC identity after saving.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Error */}
          <AnimatePresence>
            {createMutation.isError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
              >
                {(createMutation.error as { response?: { data?: { error?: string } } })
                  ?.response?.data?.error ??
                  "Failed to save account. Please try again."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1 h-10 rounded-xl border border-[#D9D9D9] text-[#7A6B44] hover:text-[#01454A] hover:bg-[#F8F5ED]"
            id="add-bank-account-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              "flex-1 h-10 rounded-xl font-medium",
              "bg-[#FDA600]",
              "hover:bg-[#E8960A] text-black",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            id="save-bank-account-button"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Account"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
