/**
 * @file predictHeight.ts
 * @description Static heuristic height-for-age percentile midpoint lookup.
 *
 * Pure function — zero network calls, zero backend involvement.
 * Uses WHO growth reference data plateau for adults (18+) and a gentle
 * adolescent curve below that. Returns the 50th percentile midpoint in cm.
 *
 * This is an engagement hook ("AI Predicted Height"), not a medical claim.
 * The user is explicitly prompted to edit if they know their exact height.
 */

const HEIGHT_FOR_AGE: Record<number, number> = {
  5:  112, 6:  119, 7:  125, 8:  131, 9:  137,
  10: 143, 11: 149, 12: 155, 13: 162, 14: 169,
  15: 173, 16: 175, 17: 176, 18: 177,
};

const ADULT_PLATEAU_CM = 172;

/**
 * Predict an estimated height in cm from age.
 * @param age Age in years (5–120)
 * @returns Estimated height in cm, rounded to nearest integer
 */
export function predictHeightCm(age: number): number {
  if (age < 5) return ADULT_PLATEAU_CM;
  if (age >= 18) return ADULT_PLATEAU_CM;
  return HEIGHT_FOR_AGE[Math.floor(age)] ?? ADULT_PLATEAU_CM;
}
