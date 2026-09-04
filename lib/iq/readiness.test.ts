import { describe, it, expect } from "vitest";
import { readinessScore, readinessZone, readinessAction } from "./readiness";

describe("Readiness — 07", () => {
  it("score 3,3,3 => 60", () => {
    expect(readinessScore({ energy: 3, sleep: 3, soreness: 3 })).toBe(60);
  });
  it("score 5,5,1 => 100 (all max)", () => {
    expect(readinessScore({ energy: 5, sleep: 5, soreness: 1 })).toBe(100);
  });
  it("score 5,5,2 => 93", () => {
    expect(readinessScore({ energy: 5, sleep: 5, soreness: 2 })).toBe(93);
  });
  it("zone LOW when <50", () => {
    expect(readinessZone(40).zone).toBe("LOW");
    expect(readinessZone(null).zone).toBe("NONE");
  });
  it("action RECOVER tone low when <45", () => {
    expect(readinessAction(30).tone).toBe("low");
    expect(readinessAction(70).tone).toBe("good");
  });
});
