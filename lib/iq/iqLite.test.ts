import { describe, it, expect } from "vitest";
import { iqLite } from "./iqLite";

describe("iqLite 5 states — 07", () => {
  const baseEvents = (n: number, kg = 80, reps = 8, rir = 2) =>
    Array.from({ length: n }, (_, i) => ({
      sessionId: `s${i + 1}`,
      kg,
      reps,
      rir,
      ts: Date.now() - i * 86400000,
      type: "N" as const,
    }));
  const sessions = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `s${i + 1}`, state: "completed" }));

  it("CALIBRATE when exposures <3", () => {
    const r = iqLite({ name: "Bench Press", target: "8-12", events: baseEvents(2), sessions: sessions(2), readiness: null });
    expect(r.stage).toBe("CALIBRATE");
    expect(r.exposures).toBe(2);
  });

  it("BUILD_LOAD when reps>=max and RIR>=2 and exposures>=3 and readiness>=60", () => {
    const r = iqLite({
      name: "Bench Press",
      target: "8-12",
      events: baseEvents(3, 80, 12, 2),
      sessions: sessions(3),
      readiness: { energy: 4, sleep: 4, soreness: 2, dateKey: "2026-01-01", ts: Date.now() },
    });
    expect(r.stage).toBe("BUILD_LOAD");
    expect(r.load).toBeGreaterThan(80);
  });

  it("BUILD_REPS when reps>=min but not max", () => {
    const r = iqLite({
      name: "Bench Press",
      target: "8-12",
      events: baseEvents(3, 80, 9, 2),
      sessions: sessions(3),
      readiness: null,
    });
    expect(r.stage).toBe("BUILD_REPS");
    expect(r.load).toBe(80);
  });

  it("RECOVER when readiness <50 even if reps max", () => {
    const r = iqLite({
      name: "Bench Press",
      target: "8-12",
      events: baseEvents(3, 80, 12, 2),
      sessions: sessions(3),
      readiness: { energy: 1, sleep: 2, soreness: 5, dateKey: "2026-01-01", ts: Date.now() },
    });
    expect(r.stage).toBe("RECOVER");
  });

  it("HOLD when not enough RIR", () => {
    const r = iqLite({
      name: "Bench Press",
      target: "8-12",
      events: baseEvents(3, 80, 9, 0),
      sessions: sessions(3),
      readiness: null,
    });
    expect(r.stage).toBe("HOLD");
  });
});
