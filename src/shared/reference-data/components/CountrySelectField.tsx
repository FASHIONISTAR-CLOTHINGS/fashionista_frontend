"use client";

import { COUNTRIES } from "../generated/countries.generated";
import { ReferenceSelectField } from "./ReferenceSelectField";

interface CountrySelectFieldProps {
  value?: string;
  onChange: (countryCode: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function CountrySelectField({
  value = "NG",
  onChange,
  label = "Country",
  disabled,
  error,
}: CountrySelectFieldProps) {
  return (
    <ReferenceSelectField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      placeholder="Select country"
      searchPlaceholder="Search country..."
      options={COUNTRIES.map((country) => ({
        value: country.code,
        label: country.name,
        meta: country.phone_code,
        icon: country.flag,
      }))}
    />
  );
}

