"use client";

import { useEffect, useMemo, useState } from "react";
import type { CityOption, LgaOption, LocationBundle, StateOption } from "../types";
import { filterCities, filterLgasByState, loadCountryLocations } from "../locations";

export function useReferenceLocation(countryCode = "NG") {
  const [bundle, setBundle] = useState<LocationBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadCountryLocations(countryCode)
      .then((nextBundle) => {
        if (isMounted) setBundle(nextBundle);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  return useMemo(
    () => ({
      bundle,
      isLoading,
      states: (bundle?.states ?? []) as StateOption[],
      getLgas: (stateCode?: string): LgaOption[] => filterLgasByState(bundle, stateCode),
      getCities: (stateCode?: string, lgaCode?: string): CityOption[] =>
        filterCities(bundle, stateCode, lgaCode),
    }),
    [bundle, isLoading],
  );
}
