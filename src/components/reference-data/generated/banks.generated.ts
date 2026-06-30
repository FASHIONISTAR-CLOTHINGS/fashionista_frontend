import rawBanks from "./banks.NG.generated.json";
import type { BankOption } from "../types";

type RawPaystackBank = {
  id?: number | string;
  name?: string;
  code?: string;
  currency?: string;
  active?: boolean;
  is_deleted?: boolean;
};

export const BANKS_NG: BankOption[] = (rawBanks as RawPaystackBank[])
  .filter((bank) => bank.code && bank.name && bank.is_deleted !== true)
  .map((bank) => ({
    id: String(bank.code),
    code: String(bank.code),
    name: String(bank.name),
    country_code: "NG",
    currency: bank.currency ?? "NGN",
    provider: "paystack",
    is_active: bank.active ?? true,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function getBankOption(bankCode: string, countryCode = "NG"): BankOption | undefined {
  if (countryCode.toUpperCase() !== "NG") return undefined;
  return BANKS_NG.find((bank) => bank.code.toUpperCase() === bankCode.toUpperCase());
}

