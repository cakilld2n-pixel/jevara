import { describe, it, expect } from "vitest";
import { getFoundationContext } from "@/lib/session/context";
import { swapCandidates, applySwap } from "./swap";

describe("Swap — no load copy (06)", () => {
  it("returns candidates for known exercise", () => {
    const c = swapCandidates("Barbell Bench Press");
    expect(c).toContain("DB Bench Press");
    expect(c.length).toBeLessThanOrEqual(3);
  });

  it("applySwap clears future unlogged sets and does not copy kg", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const log: Record<string, unknown> = {};
    const key0 = ctx.key(0, 0);
    log[`${key0}_kg`] = "80";
    log[`${key0}_rp`] = "10";
    log[`${key0}_ok`] = true; // first set done, should not be cleared
    const key1 = ctx.key(0, 1);
    log[`${key1}_kg`] = "70";
    log[`${key1}_rp`] = "8";
    // second set not done, should be cleared
    const { newLog, changed } = applySwap(ctx, log, "Barbell Bench Press", "DB Bench Press");
    expect(changed).toBeGreaterThan(0);
    expect(newLog[`${key0}_ok`]).toBe(true); // done stays
    expect(newLog[`${key1}_kg`]).toBeUndefined();
    expect(newLog[`${key1}_ok`]).toBeUndefined();
  });

  it("replacement starts CALIBRATE (no prior events, tested via id swap)", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { newCtx } = applySwap(ctx, {}, "Barbell Bench Press", "DB Bench Press");
    expect(newCtx.exs[0].n).toBe("DB Bench Press");
    expect(newCtx.exs[0].id).toMatch(/^swap_/);
  });
});
