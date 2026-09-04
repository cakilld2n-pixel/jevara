import { describe, it, expect } from "vitest";
import { updatePR } from "./baseline";

describe("Baseline vs PR — 07", () => {
  it("first event is baseline, not PR", () => {
    const { prs, isPR, isBaseline } = updatePR({}, "Bench Press", 80, 8);
    expect(isBaseline).toBe(true);
    expect(isPR).toBe(false);
    expect(prs["Bench Press"].baseline).toBe(true);
  });

  it("second higher metric is PR", () => {
    let prs = {};
    prs = updatePR(prs, "Bench Press", 80, 8).prs;
    const r2 = updatePR(prs, "Bench Press", 85, 8);
    expect(r2.isPR).toBe(true);
    expect(r2.prs["Bench Press"].baseline).toBe(false);
  });

  it("isolation uses kg*reps", () => {
    let prs = {};
    prs = updatePR(prs, "Lateral Raise", 10, 15).prs;
    const r2 = updatePR(prs, "Lateral Raise", 10, 16);
    expect(r2.isPR).toBe(true);
  });

  it("lower metric not PR", () => {
    let prs = {};
    prs = updatePR(prs, "Bench Press", 100, 5).prs;
    const r2 = updatePR(prs, "Bench Press", 90, 5);
    expect(r2.isPR).toBe(false);
  });
});
