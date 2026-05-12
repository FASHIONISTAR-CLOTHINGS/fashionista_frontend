export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  type: "fiat" | "crypto";
  is_active: boolean;
}

export interface CountryOption {
  id: string;
  code: string;
  name: string;
  flag: string;
  phone_code: string;
  is_active: boolean;
}

export interface StateOption {
  code: string;
  name: string;
  country_code: string;
  is_active: boolean;
}

export interface LgaOption {
  code: string;
  name: string;
  state_code: string;
  country_code: string;
  is_active: boolean;
}

export interface CityOption {
  code: string;
  name: string;
  lga_code: string;
  state_code: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

export interface BankOption {
  id: string;
  code: string;
  name: string;
  country_code: string;
  currency: string;
  provider: "paystack" | string;
  is_active: boolean;
}

export interface AddressSelection {
  country_code: string;
  state_code: string;
  lga_code: string;
  city_code?: string;
  custom_city?: string;
  street_address: string;
}

export interface LocationBundle {
  country_code: string;
  states: StateOption[];
  lgas: LgaOption[];
  cities: CityOption[];
}

