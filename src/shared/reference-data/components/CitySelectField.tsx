"use client";

import type { CityOption } from "../types";
import { ReferenceSelectField } from "./ReferenceSelectField";

interface CitySelectFieldProps {
  value?: string;
  customCity?: string;
  onChange: (cityCode: string) => void;
  onCustomCityChange: (customCity: string) => void;
  cities: CityOption[];
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function CitySelectField({
  value = "",
  customCity = "",
  onChange,
  onCustomCityChange,
  cities,
  label = "City or area",
  disabled,
  error,
}: CitySelectFieldProps) {
  const isCustom = value === "__custom__";

  return (
    <div className="space-y-2">
      <ReferenceSelectField
        label={label}
        value={isCustom ? "__custom__" : value}
        onChange={(nextValue) => {
          onChange(nextValue);
          if (nextValue !== "__custom__") onCustomCityChange("");
        }}
        disabled={disabled}
        error={error}
        placeholder="Select city or enter custom"
        searchPlaceholder="Search city or area..."
        options={[
          ...cities.map((city) => ({
            value: city.code,
            label: city.name,
          })),
          {
            value: "__custom__",
            label: "My city is not listed",
            meta: "Enter manually",
          },
        ]}
      />
      {isCustom && (
        <input
          value={customCity}
          onChange={(event) => onCustomCityChange(event.target.value)}
          placeholder="Enter city name"
          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--brand-gold)]"
        />
      )}
    </div>
  );
}

