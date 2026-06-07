"use client";

import { BANKS_NG } from "../generated/banks.generated";
import { ReferenceSelectField } from "./ReferenceSelectField";

interface BankSelectFieldProps {
  value?: string;
  onChange: (bankCode: string) => void;
  countryCode?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function BankSelectField({
  value = "",
  onChange,
  countryCode = "NG",
  label = "Bank",
  disabled,
  error,
}: BankSelectFieldProps) {
  const banks = countryCode.toUpperCase() === "NG" ? BANKS_NG : [];

  return (
    <ReferenceSelectField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled || banks.length === 0}
      error={error}
      placeholder="Select bank"
      searchPlaceholder="Search bank or code..."
      options={banks.map((bank) => ({
        value: bank.code,
        label: bank.name,
        meta: bank.code,
      }))}
    />
  );
}

