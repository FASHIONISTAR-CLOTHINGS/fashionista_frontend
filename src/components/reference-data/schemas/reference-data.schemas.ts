import { z } from "zod";

export const CountryOptionSchema = z.object({
  id: z.string(),
  code: z.string().length(2),
  name: z.string(),
  flag: z.string(),
  phone_code: z.string(),
  is_active: z.boolean(),
});

export const StateOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
  country_code: z.string().length(2),
  is_active: z.boolean(),
});

export const LgaOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
  state_code: z.string(),
  country_code: z.string().length(2),
  is_active: z.boolean(),
});

export const CityOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
  lga_code: z.string(),
  state_code: z.string(),
  country_code: z.string().length(2),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  is_active: z.boolean(),
});

export const BankOptionSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  country_code: z.string().length(2),
  currency: z.string(),
  provider: z.string(),
  is_active: z.boolean(),
});

export const CountryOptionListSchema = z.array(CountryOptionSchema);
export const StateOptionListSchema = z.array(StateOptionSchema);
export const LgaOptionListSchema = z.array(LgaOptionSchema);
export const CityOptionListSchema = z.array(CityOptionSchema);
export const BankOptionListSchema = z.array(BankOptionSchema);

