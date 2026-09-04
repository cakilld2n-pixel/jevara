import { describe, it, expect } from "vitest";
import { getFoundationContext, getProgramContext, getSessionContext } from "./context";
import { PROGRAMS } from "@/data/programs";

describe("Sesi Terencana — SessionContext seam (02)", () => {
  it("Foundation Fase 1 Senin Push has expectedSets 19 and 6 exercises", () => {
    const ctx = getFoundationContext(1, 1, "Senin");
    expect(ctx).not.toBeNull();
    expect(ctx!.title).toBe("JEVARA 12-Week Foundation");
    expect(ctx!.label).toBe("Push");
    expect(ctx!.exs).toHaveLength(6);
    // 4+3+3+3+3+3 = 19
    expect(ctx!.expectedSets).toBe(19);
    expect(ctx!.color).toBe("#3b82f6");
    expect(ctx!.key(0, 0)).toBe("1_w1_Senin_bp_s0");
  });

  it("Foundation unknown day returns null", () => {
    expect(getFoundationContext(1, 1, "Sabtu")).toBeNull();
    expect(getFoundationContext(99, 1, "Senin")).toBeNull();
  });

  it("Program rc1 Senin has 3+3+3+3+3 =15 sets", () => {
    const rc1 = PROGRAMS.find((p) => p.id === "rc1")!;
    const ctx = getProgramContext(rc1, 1, "Senin");
    expect(ctx!.expectedSets).toBe(15);
    expect(ctx!.label).toBe("Full Body A");
    expect(ctx!.key(0, 1)).toBe("cp_rc1_w1_Senin_e0_s1");
  });

  it("getSessionContext prefers activeCP over Foundation", () => {
    const rc1 = PROGRAMS.find((p) => p.id === "rc1")!;
    const ctx = getSessionContext({
      curPh: 1,
      curWk: 1,
      curDay: "Senin",
      activeCP: rc1,
      cpWk: 1,
      cpDay: "Kamis",
    });
    expect(ctx!.programId).toBe("rc1");
    expect(ctx!.day).toBe("Kamis");
  });

  it("getSessionContext falls back to Foundation when no activeCP", () => {
    const ctx = getSessionContext({
      curPh: 2,
      curWk: 3,
      curDay: "Rabu",
      activeCP: null,
      cpWk: 1,
      cpDay: null,
    });
    expect(ctx!.programId).toBe("foundation");
    expect(ctx!.label).toBe("Legs+");
  });

  it("key generation is stable for Sesi Terencana (Canonical)", () => {
    const ctx = getFoundationContext(1, 1, "Rabu")!;
    // Goblet/BB Squat is index 0 with id sq
    expect(ctx.key(0, 0)).toBe("1_w1_Rabu_sq_s0");
    expect(ctx.key(0, 1)).toBe("1_w1_Rabu_sq_s1");
    // Plank is index 5 with id plk
    expect(ctx.key(5, 0)).toBe("1_w1_Rabu_plk_s0");
  });
});
