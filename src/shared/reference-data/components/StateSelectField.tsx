"use client";

import type { StateOption } from "../types";
import { ReferenceSelectField } from "./ReferenceSelectField";

interface StateSelectFieldProps {
  value?: string;
  onChange: (stateCode: string) => void;
  states: StateOption[];
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function StateSelectField({
  value = "",
  onChange,
  states,
  label = "State",
  disabled,
  error,
}: StateSelectFieldProps) {
  return (
    <ReferenceSelectField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled || states.length === 0}
      error={error}
      placeholder="Select state"
      searchPlaceholder="Search state..."
      options={states.map((state) => ({
        value: state.code,
        label: state.name,
      }))}
    />
  );
}

