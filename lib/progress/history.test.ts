import { describe, it, expect } from "vitest";
import { finalizedSessions, weeklyMuscles } from "./history";

describe("Progress — 08 seam (Canonical only)", () => {
  it("finalizedSessions filters RC4 completed/ended_early only", () => {
    const sessions = [
      { id: "s1", state: "completed", canonicalVersion: "RC4" },
      { id: "s2", state: "ended_early", canonicalVersion: "RC4" },
      { id: "s3", state: "active", canonicalVersion: "RC4" },
      { id: "s4", state: "completed", canonicalVersion: "OLD" },
    ] as never;
    expect(finalizedSessions(sessions)).toHaveLength(2);
  });

  it("weeklyMuscles counts only finalized session events", () => {
    const sessions = [
      { id: "s1", state: "completed", canonicalVersion: "RC4" },
      { id: "s2", state: "active", canonicalVersion: "RC4" },
    ] as never;
    const events = [
      { sessionId: "s1", name: "Barbell Bench Press", type: "N", ts: Date.now() },
      { sessionId: "s1", name: "Barbell Bench Press", type: "N", ts: Date.now() },
      { sessionId: "s2", name: "Barbell Bench Press", type: "N", ts: Date.now() },
      { sessionId: "s1", name: "Plank", type: "W", ts: Date.now() },
    ] as never;
    const m = weeklyMuscles(events, sessions);
    expect(m.Chest).toBe(2);
    expect(m.Other).toBeUndefined();
  });

  it("weeklyMuscles ignores events older than 7 days", () => {
    const sessions = [{ id: "s1", state: "completed", canonicalVersion: "RC4" }] as never;
    const events = [
      { sessionId: "s1", name: "Bench Press", type: "N", ts: Date.now() - 8 * 86400000 },
      { sessionId: "s1", name: "Bench Press", type: "N", ts: Date.now() },
    ] as never;
    const m = weeklyMuscles(events, sessions);
    expect(m.Chest).toBe(1);
  });
});
