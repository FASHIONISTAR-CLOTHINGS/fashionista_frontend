"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ShieldCheck, Banknote, AlertOctagon } from "lucide-react";
import { initiateCompanyWithdrawal } from "../api/admin-wallet.api";

export function CompanyWithdrawalPanel() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  
  const accountName = watch("account_name", "");
  const isFashionistarInName = accountName.toUpperCase().includes("FASHIONISTAR");

  const onSubmit = async (data: any) => {
    if (!isFashionistarInName) {
      toast.error("Security Halt: Account name MUST contain 'FASHIONISTAR'");
      return;
    }

    setLoading(true);
    try {
      await initiateCompanyWithdrawal(data);
      toast.success("Commission Payout Initiated Successfully");
    } catch (err: any) {
      toast.error(err.message || "Withdrawal failed security checks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-primary/20 rounded-[32px] p-8 shadow-xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Company Commission Payout</h2>
          <p className="text-muted-foreground text-sm">Strictly for: fashionistarclothings@outlook.com</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase">Payout Amount (NGN)</label>
          <Input {...register("amount")} type="number" placeholder="0.00" className="h-14 text-xl font-bold" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase">Target Account Name</label>
          <Input 
            {...register("account_name")} 
            placeholder="e.g. FASHIONISTAR CLOTHINGS LTD" 
            className={`h-12 ${!isFashionistarInName && accountName ? 'border-red-500' : 'border-green-500'}`}
          />
          {!isFashionistarInName && accountName && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertOctagon size={12} /> 'FASHIONISTAR' keyword missing.
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading || !isFashionistarInName} 
          className="w-full h-14 text-lg font-bold"
        >
          {loading ? "Verifying Security Doors..." : "Request Commission Payout"}
        </Button>
      </form>
    </div>
  );
}