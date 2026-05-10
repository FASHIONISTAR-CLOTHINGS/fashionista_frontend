"use client";

import type { LgaOption } from "../types";
import { ReferenceSelectField } from "./ReferenceSelectField";

interface LgaSelectFieldProps {
  value?: string;
  onChange: (lgaCode: string) => void;
  lgas: LgaOption[];
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function LgaSelectField({
  value = "",
  onChange,
  lgas,
  label = "Local government",
  disabled,
  error,
}: LgaSelectFieldProps) {
  return (
    <ReferenceSelectField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled || lgas.length === 0}
      error={error}
      placeholder="Select local government"
      searchPlaceholder="Search LGA..."
      options={lgas.map((lga) => ({
        value: lga.code,
        label: lga.name,
      }))}
    />
  );
}

