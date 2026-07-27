import { describe, it, expect } from "vitest";
import { predictHeightCm } from "./predictHeight";

describe("predictHeightCm", () => {
  it("returns adult plateau (172cm) for age >= 18", () => {
    expect(predictHeightCm(18)).toBe(177);
    expect(predictHeightCm(25)).toBe(172);
    expect(predictHeightCm(50)).toBe(172);
    expect(predictHeightCm(120)).toBe(172);
  });

  it("returns WHO growth reference for ages 5-17", () => {
    expect(predictHeightCm(5)).toBe(112);
    expect(predictHeightCm(10)).toBe(143);
    expect(predictHeightCm(13)).toBe(162);
    expect(predictHeightCm(17)).toBe(176);
  });

  it("returns adult plateau for age < 5", () => {
    expect(predictHeightCm(3)).toBe(172);
    expect(predictHeightCm(0)).toBe(172);
  });

  it("handles fractional ages by flooring", () => {
    expect(predictHeightCm(10.9)).toBe(143);
    expect(predictHeightCm(13.5)).toBe(162);
  });

  it("always returns a positive integer", () => {
    for (let age = 0; age <= 120; age += 5) {
      const h = predictHeightCm(age);
      expect(h).toBeGreaterThan(0);
      expect(Number.isInteger(h)).toBe(true);
    }
  });
});
