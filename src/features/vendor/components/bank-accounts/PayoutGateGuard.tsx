// features/vendor/components/bank-accounts/PayoutGateGuard.tsx
/**
 * PayoutGateGuard — Wrapper for any "Request Payout" trigger.
 *
 * Behavior:
 *  - If vendor has ≥ 1 bank account → open PayoutRequestModal.
 *  - If vendor has 0 bank accounts → open AddBankAccountModal first
 *    with a friendly prompt explaining why.
 *
 * Usage:
 *   <PayoutGateGuard walletBalance={1234.56}>
 *     {({ openPayout }) => (
 *       <Button onClick={openPayout}>Withdraw Earnings</Button>
 *     )}
 *   </PayoutGateGuard>
 *
 * Or as a standalone button:
 *   <PayoutGateGuard walletBalance={1234.56} renderTrigger />
 */
"use client";

import { ReactNode, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBankAccountModal } from "./AddBankAccountModal";
import { PayoutRequestModal } from "./PayoutRequestModal";
import { useBankAccounts } from "@/features/vendor/hooks/use-bank-accounts";
import { cn } from "@/lib/utils";

interface PayoutGateGuardRenderProps {
  openPayout: () => void;
  isLoading:  boolean;
}

interface PayoutGateGuardProps {
  walletBalance?: number;
  children?:      (props: PayoutGateGuardRenderProps) => ReactNode;
  /** If true, render a default "Request Payout" button. */
  renderTrigger?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
}

export function PayoutGateGuard({
  walletBalance = 0,
  children,
  renderTrigger = false,
  triggerClassName,
  triggerLabel = "Request Payout",
}: PayoutGateGuardProps) {
  const { data: accounts = [], isLoading } = useBankAccounts();
  const [payoutModalOpen,   setPayoutModalOpen]   = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);

  function openPayout() {
    if (accounts.length === 0) {
      // Gate: need at least one bank account
      setAddAccountModalOpen(true);
    } else {
      setPayoutModalOpen(true);
    }
  }

  return (
    <>
      {/* Render children with openPayout injected */}
      {children && children({ openPayout, isLoading })}

      {/* Standalone trigger */}
      {renderTrigger && (
        <Button
          onClick={openPayout}
          disabled={isLoading}
          className={cn(
            "h-10 rounded-xl px-5 font-medium gap-2",
            "bg-gradient-to-r from-emerald-600 to-teal-600",
            "hover:from-emerald-500 hover:to-teal-500 text-white",
            "shadow-md shadow-emerald-500/20",
            triggerClassName,
          )}
          id="payout-gate-trigger-button"
        >
          <ArrowUpRight className="h-4 w-4" />
          {triggerLabel}
        </Button>
      )}

      {/* Gate modal: redirects to add bank account if none saved */}
      <AddBankAccountModal
        open={addAccountModalOpen}
        onOpenChange={(open) => {
          setAddAccountModalOpen(open);
          // After adding an account, if modal closed and we now have accounts, open payout
          if (!open && accounts.length > 0) {
            setPayoutModalOpen(true);
          }
        }}
      />

      {/* Main payout modal */}
      <PayoutRequestModal
        open={payoutModalOpen}
        onOpenChange={setPayoutModalOpen}
        walletBalance={walletBalance}
      />
    </>
  );
}
