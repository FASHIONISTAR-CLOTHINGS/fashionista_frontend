import { apiAsync } from "@/core/api/client.async";
import {
  BankOptionListSchema,
  CityOptionListSchema,
  CountryOptionListSchema,
  LgaOptionListSchema,
  StateOptionListSchema,
} from "../schemas/reference-data.schemas";
import type { BankOption, CityOption, CountryOption, LgaOption, StateOption } from "../types";

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const referenceDataApi = {
  async getCountries(): Promise<CountryOption[]> {
    const data = await apiAsync.get("common/reference/countries/").json();
    return CountryOptionListSchema.parse(unwrapData(data));
  },

  async getStates(countryCode: string): Promise<StateOption[]> {
    const data = await apiAsync.get(`common/reference/countries/${countryCode}/states/`).json();
    return StateOptionListSchema.parse(unwrapData(data));
  },

  async getLgas(countryCode: string, stateCode: string): Promise<LgaOption[]> {
    const data = await apiAsync.get(
      `common/reference/countries/${countryCode}/states/${stateCode}/lgas/`,
    ).json();
    return LgaOptionListSchema.parse(unwrapData(data));
  },

  async getCities(countryCode: string, stateCode?: string, lgaCode?: string): Promise<CityOption[]> {
    const searchParams: Record<string, string> = {};
    if (stateCode) {
      searchParams.state = stateCode;
    }
    if (lgaCode) {
      searchParams.lga = lgaCode;
    }
    const data = await apiAsync.get(`common/reference/countries/${countryCode}/cities/`, {
      searchParams,
    }).json();
    return CityOptionListSchema.parse(unwrapData(data));
  },

  async getBanks(countryCode = "NG"): Promise<BankOption[]> {
    const data = await apiAsync.get("common/reference/banks/", {
      searchParams: { country: countryCode },
    }).json();
    return BankOptionListSchema.parse(unwrapData(data));
  },
};
