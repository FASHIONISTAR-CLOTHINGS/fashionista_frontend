/**
 * @file app/components/SignUpForm.tsx
 * @description Legacy SignUpForm stub — superseded by the auth feature.
 * This stub exists to prevent build errors in legacy (auth) pages.
 */

"use client";

import React from "react";
import Link from "next/link";

interface SignUpFormProps {
  role?: "Vendor" | "Client";
}

export default function SignUpForm({ role }: SignUpFormProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6">
      <p className="text-sm text-center text-muted-foreground">
        {role === "Vendor"
          ? "Create your vendor account"
          : "Create your client account"}
      </p>
      <div className="flex justify-center">
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#01454A] px-6 py-3 text-sm font-bold text-white hover:bg-[#01454A]/90 transition-colors"
        >
          Continue to Registration →
        </Link>
      </div>
    </div>
  );
}
