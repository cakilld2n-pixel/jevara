import { describe, it, expect } from "vitest";
import { getFoundationContext } from "@/lib/session/context";
import { flattenSession, createAutopilot, nextUnloggedPos, isAutopilotComplete } from "./autopilot";

describe("Autopilot — 06 seam", () => {
  it("flattens session into sets", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const sets = flattenSession(ctx);
    expect(sets).toHaveLength(19);
    expect(sets[0].name).toBe("Barbell Bench Press");
    expect(sets[0].target).toBe("10-12");
  });

  it("createAutopilot starts at first unlogged", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const log: Record<string, unknown> = {};
    log[ctx.key(0, 0) + "_ok"] = true;
    const ap = createAutopilot(ctx, log);
    expect(ap.pos).toBe(1);
  });

  it("nextUnloggedPos finds next after pos", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const sets = flattenSession(ctx);
    const log: Record<string, unknown> = {};
    log[sets[0].key + "_ok"] = true;
    log[sets[1].key + "_ok"] = true;
    expect(nextUnloggedPos(sets, log, 0)).toBe(2);
  });

  it("isAutopilotComplete detects all done", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const sets = flattenSession(ctx);
    const log: Record<string, unknown> = {};
    sets.forEach((s) => (log[s.key + "_ok"] = true));
    expect(isAutopilotComplete(sets, log)).toBe(true);
  });
});
