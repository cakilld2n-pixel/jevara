import { describe, it, expect } from "vitest";
import { getMeasurementType, validateSet } from "./measurement";

describe("MeasurementType — validasi Set seam (04)", () => {
  it("classifies weighted_reps vs bodyweight vs timed", () => {
    expect(getMeasurementType("Barbell Bench Press")).toBe("weighted_reps");
    expect(getMeasurementType("Assisted Pull-Up")).toBe("assisted_reps");
    expect(getMeasurementType("Pull-Up BW")).toBe("bodyweight_reps");
    expect(getMeasurementType("Plank")).toBe("timed_hold");
    expect(getMeasurementType("Hanging Knee Raise")).toBe("bodyweight_reps");
  });

  it("weighted_reps requires kg>0", () => {
    expect(validateSet({ name: "Bench Press", kg: 0, reps: 10, rir: "2", type: "N" }).valid).toBe(false);
    expect(validateSet({ name: "Bench Press", kg: 80, reps: 10, rir: "2", type: "N" }).valid).toBe(true);
  });

  it("bodyweight allows kg=0", () => {
    expect(validateSet({ name: "Pull-Up BW", kg: 0, reps: 10, rir: "2", type: "N" }).valid).toBe(true);
    expect(validateSet({ name: "Pull-Up BW", kg: 0, reps: 0, rir: "2", type: "N" }).valid).toBe(false);
  });

  it("timed_hold allows kg=0 but requires duration", () => {
    expect(validateSet({ name: "Plank", kg: 0, reps: 45, rir: "2", type: "N" }).valid).toBe(true);
    expect(validateSet({ name: "Plank", kg: 0, reps: 0, rir: "2", type: "N" }).valid).toBe(false);
  });

  it("Warm-up does not require RIR", () => {
    expect(validateSet({ name: "Bench Press", kg: 40, reps: 10, rir: "", type: "W" }).valid).toBe(true);
    expect(validateSet({ name: "Bench Press", kg: 40, reps: 10, rir: "", type: "N" }).valid).toBe(false);
  });

  it("requires RIR for working sets", () => {
    expect(validateSet({ name: "Bench Press", kg: 80, reps: 8, rir: null, type: "N" }).valid).toBe(false);
    expect(validateSet({ name: "Bench Press", kg: 80, reps: 8, rir: "2", type: "N" }).valid).toBe(true);
  });
});
