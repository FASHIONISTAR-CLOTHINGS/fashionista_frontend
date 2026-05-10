import { describe, expect, it } from "vitest";
import { BANKS_NG, COUNTRIES, filterCities, filterLgasByState, loadCountryLocations } from "@/shared/reference-data";

describe("shared reference data", () => {
  it("keeps Nigeria first in the country selector", () => {
    expect(COUNTRIES[0]?.code).toBe("NG");
    expect(COUNTRIES[0]?.phone_code).toBe("+234");
  });

  it("loads Paystack-backed Nigerian banks from static bundle", () => {
    expect(BANKS_NG.length).toBeGreaterThan(100);
    expect(BANKS_NG.some((bank) => bank.code === "044" && bank.name.includes("Access"))).toBe(true);
  });

  it("loads Nigeria state, LGA, and city chunks dynamically", async () => {
    const bundle = await loadCountryLocations("NG");
    const lgas = filterLgasByState(bundle, "LAGOS");
    const cities = filterCities(bundle, "LAGOS", "IKEJA");

    expect(bundle.states).toHaveLength(37);
    expect(lgas.some((lga) => lga.code === "IKEJA")).toBe(true);
    expect(cities.some((city) => city.name === "Wasimi/Opebi/Allen")).toBe(true);
  });
});
