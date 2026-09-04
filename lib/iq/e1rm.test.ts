import { describe, it, expect } from "vitest";
import { calcE1RM, e1rmEligible, bestMetricFor } from "./e1rm";

describe("e1RM — 07", () => {
  it("calcE1RM Epley", () => {
    expect(calcE1RM(100, 5)).toBeCloseTo(116.666, 1);
    expect(calcE1RM(0, 5)).toBe(0);
  });

  it("e1rmEligible true for compound, false for isolation", () => {
    expect(e1rmEligible("Barbell Bench Press")).toBe(true);
    expect(e1rmEligible("Squat")).toBe(true);
    expect(e1rmEligible("Deadlift")).toBe(true);
    expect(e1rmEligible("Lateral Raise")).toBe(false);
    expect(e1rmEligible("Barbell Curl")).toBe(false);
    expect(e1rmEligible("Tricep Pushdown")).toBe(false);
  });

  it("bestMetric uses e1RM for eligible else kg*reps", () => {
    expect(bestMetricFor("Bench Press", 100, 5)).toBeCloseTo(116.666, 1);
    expect(bestMetricFor("Lateral Raise", 10, 15)).toBe(150);
  });
});
