import { describe, it, expect, vi } from "vitest";
import { recommendProgram } from "./recommend";

describe("Profile recommend — 03 seam", () => {
  it("recommends rc1 for recomp beginner 4 days fullgym", () => {
    const r = recommendProgram({ goal: "recomp", experience: "beginner", days: 4, equipment: "fullgym" });
    expect(r.id).toBe("rc1");
    expect(r.why.length).toBeGreaterThan(0);
  });

  it("recommends fl1 for fatloss", () => {
    const r = recommendProgram({ goal: "fatloss", experience: "intermediate", days: 5, equipment: "fullgym" });
    expect(r.id).toBe("fl1");
  });

  it("recommends bu1 for muscle + 6 days", () => {
    const r = recommendProgram({ goal: "muscle", experience: "advanced", days: 6, equipment: "fullgym" });
    expect(r.id).toBe("bu1");
  });

  it("limits why to 4 entries", () => {
    const r = recommendProgram({ goal: "strength", experience: "beginner", days: 3, equipment: "homegym" });
    expect(r.why.length).toBeLessThanOrEqual(4);
  });
});

describe("Profile upsert — mocked supabase", () => {
  it("completeOnboarding returns valid recommended id", async () => {
    // pure recommend already tested; this checks completeOnboarding delegates correctly via mocked client
    vi.mock("@supabase/supabase-js", () => ({
      createClient: () => ({
        from: () => ({
          upsert: async () => ({ error: null }),
          select: () => ({ eq: () => ({ single: async () => ({ data: { id: "uid1" }, error: null }) }) }),
        }),
        auth: {},
      }),
    }));
    const { completeOnboarding } = await import("./index");
    const { recommended } = await completeOnboarding("uid1", {
      goal: "recomp",
      experience: "beginner",
      days: 4,
      equipment: "fullgym",
    });
    expect(["rc1", "foundation", "fl1", "bu1", "st1", "hp1"]).toContain(recommended);
  });
});
