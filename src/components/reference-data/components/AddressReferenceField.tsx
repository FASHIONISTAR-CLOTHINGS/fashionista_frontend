"use client";

import { useMemo } from "react";
import { useReferenceLocation } from "../hooks/use-reference-location";
import type { AddressSelection } from "../types";
import { CitySelectField } from "./CitySelectField";
import { CountrySelectField } from "./CountrySelectField";
import { LgaSelectField } from "./LgaSelectField";
import { StateSelectField } from "./StateSelectField";

interface AddressReferenceFieldProps {
  value: AddressSelection;
  onChange: (value: AddressSelection) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof AddressSelection, string>>;
}

export function AddressReferenceField({
  value,
  onChange,
  disabled,
  errors,
}: AddressReferenceFieldProps) {
  const countryCode = value.country_code || "NG";
  const { states, getLgas, getCities, isLoading } = useReferenceLocation(countryCode);
  const lgas = useMemo(() => getLgas(value.state_code), [getLgas, value.state_code]);
  const cities = useMemo(() => getCities(value.state_code, value.lga_code), [getCities, value.state_code, value.lga_code]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CountrySelectField
        value={countryCode}
        disabled={disabled}
        error={errors?.country_code}
        onChange={(country_code) =>
          onChange({
            country_code,
            state_code: "",
            lga_code: "",
            city_code: "",
            custom_city: "",
            street_address: value.street_address,
          })
        }
      />
      <StateSelectField
        states={states}
        value={value.state_code}
        disabled={disabled || isLoading}
        error={errors?.state_code}
        onChange={(state_code) =>
          onChange({
            ...value,
            country_code: countryCode,
            state_code,
            lga_code: "",
            city_code: "",
            custom_city: "",
          })
        }
      />
      <LgaSelectField
        lgas={lgas}
        value={value.lga_code}
        disabled={disabled || !value.state_code}
        error={errors?.lga_code}
        onChange={(lga_code) =>
          onChange({
            ...value,
            country_code: countryCode,
            lga_code,
            city_code: "",
            custom_city: "",
          })
        }
      />
      <CitySelectField
        cities={cities}
        value={value.custom_city ? "__custom__" : value.city_code}
        customCity={value.custom_city}
        disabled={disabled || !value.lga_code}
        error={errors?.city_code || errors?.custom_city}
        onChange={(city_code) =>
          onChange({
            ...value,
            country_code: countryCode,
            city_code: city_code === "__custom__" ? "" : city_code,
            custom_city: city_code === "__custom__" ? value.custom_city : "",
          })
        }
        onCustomCityChange={(custom_city) =>
          onChange({
            ...value,
            country_code: countryCode,
            city_code: "",
            custom_city,
          })
        }
      />
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor="street_address" className="text-sm font-medium text-foreground">
          Street address
        </label>
        <input
          id="street_address"
          value={value.street_address}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              country_code: countryCode,
              street_address: event.target.value,
            })
          }
          placeholder="House number, street name, estate, landmark"
          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--brand-gold)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors?.street_address && (
          <p className="text-xs text-destructive" role="alert">
            {errors.street_address}
          </p>
        )}
      </div>
    </div>
  );
}

