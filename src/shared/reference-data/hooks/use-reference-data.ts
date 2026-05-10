"use client";

import { useQuery } from "@tanstack/react-query";
import { referenceDataApi } from "../api/reference-data.api";
import { BANKS_NG } from "../generated/banks.generated";
import { COUNTRIES } from "../generated/countries.generated";

export function useLocalCountries() {
  return COUNTRIES;
}

export function useLocalBanks(countryCode = "NG") {
  return countryCode.toUpperCase() === "NG" ? BANKS_NG : [];
}

export function useReferenceCountriesQuery(enabled = false) {
  return useQuery({
    queryKey: ["reference-data", "countries"],
    queryFn: referenceDataApi.getCountries,
    initialData: COUNTRIES,
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useReferenceBanksQuery(countryCode = "NG", enabled = false) {
  return useQuery({
    queryKey: ["reference-data", "banks", countryCode],
    queryFn: () => referenceDataApi.getBanks(countryCode),
    initialData: countryCode.toUpperCase() === "NG" ? BANKS_NG : [],
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

