import {
  calculateBodyMassIndex,
  normalizeHeightToCentimeters,
  normalizeHeightToMeters,
} from "../src/utils/bodyMetrics";

describe("bodyMetrics", () => {
  it("normalizes centimeters and meters consistently", () => {
    expect(normalizeHeightToMeters(172)).toBe(1.72);
    expect(normalizeHeightToMeters(1.72)).toBe(1.72);
    expect(normalizeHeightToCentimeters(172)).toBe(172);
    expect(normalizeHeightToCentimeters(1.72)).toBe(172);
  });

  it("calculates the same BMI for 172 cm and 1.72 m", () => {
    expect(calculateBodyMassIndex(72, 172)).toBe(24.3);
    expect(calculateBodyMassIndex(72, 1.72)).toBe(24.3);
  });

  it("returns null for invalid values", () => {
    expect(calculateBodyMassIndex(null, 172)).toBeNull();
    expect(calculateBodyMassIndex(72, null)).toBeNull();
    expect(calculateBodyMassIndex(72, 0)).toBeNull();
  });
});
