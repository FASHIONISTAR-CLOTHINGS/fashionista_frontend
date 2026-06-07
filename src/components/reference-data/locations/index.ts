import type { CityOption, LgaOption, LocationBundle, StateOption } from "../types";
import { codeSlug, stateCode } from "../lib/normalizers";

type RawWard = {
  name: string;
  latitude?: number;
  longitude?: number;
};

type RawLga = {
  name: string;
  wards?: RawWard[];
};

type RawState = {
  state: string;
  lgas?: RawLga[];
};

type LocationModule = {
  default: RawState[];
};

const locationLoaders: Record<string, () => Promise<LocationModule>> = {
  NG: () => import("./NG.generated.json") as Promise<LocationModule>,
};

function normalizeNigeriaLocations(rawStates: RawState[]): LocationBundle {
  const states: StateOption[] = [];
  const lgas: LgaOption[] = [];
  const cities: CityOption[] = [];

  for (const rawState of rawStates) {
    const currentStateCode = stateCode(rawState.state);
    states.push({
      code: currentStateCode,
      name: rawState.state,
      country_code: "NG",
      is_active: true,
    });

    for (const rawLga of rawState.lgas ?? []) {
      const lgaCode = codeSlug(rawLga.name);
      lgas.push({
        code: lgaCode,
        name: rawLga.name,
        state_code: currentStateCode,
        country_code: "NG",
        is_active: true,
      });

      for (const ward of rawLga.wards ?? []) {
        cities.push({
          code: codeSlug(ward.name),
          name: ward.name,
          lga_code: lgaCode,
          state_code: currentStateCode,
          country_code: "NG",
          latitude: ward.latitude ?? null,
          longitude: ward.longitude ?? null,
          is_active: true,
        });
      }
    }
  }

  return { country_code: "NG", states, lgas, cities };
}

const bundleCache = new Map<string, Promise<LocationBundle>>();

export function loadCountryLocations(countryCode: string): Promise<LocationBundle> {
  const code = countryCode.toUpperCase();
  const loader = locationLoaders[code];
  if (!loader) {
    return Promise.resolve({ country_code: code, states: [], lgas: [], cities: [] });
  }
  if (!bundleCache.has(code)) {
    bundleCache.set(
      code,
      loader().then((module) => {
        if (code === "NG") return normalizeNigeriaLocations(module.default);
        return { country_code: code, states: [], lgas: [], cities: [] };
      }),
    );
  }
  return bundleCache.get(code) as Promise<LocationBundle>;
}

export function filterLgasByState(bundle: LocationBundle | null, state_code?: string): LgaOption[] {
  if (!bundle || !state_code) return [];
  const code = state_code.toUpperCase();
  return bundle.lgas.filter((lga) => lga.state_code === code);
}

export function filterCities(bundle: LocationBundle | null, state_code?: string, lga_code?: string): CityOption[] {
  if (!bundle) return [];
  const stateCodeValue = state_code?.toUpperCase();
  const lgaCodeValue = lga_code?.toUpperCase();
  return bundle.cities.filter((city) => {
    if (stateCodeValue && city.state_code !== stateCodeValue) return false;
    if (lgaCodeValue && city.lga_code !== lgaCodeValue) return false;
    return true;
  });
}

