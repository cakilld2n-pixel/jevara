import { describe, it, expect, beforeEach } from "vitest";
import { getFoundationContext } from "./context";
import { startSession, completeSet, finishSession, resetFinalizingForTest } from "./lifecycle";

describe("Session lifecycle — 04 seam (START → Set → FINISH RC4)", () => {
  beforeEach(() => resetFinalizingForTest());

  it("START creates activeSession with plannedSessionId + contextSig", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session, error } = startSession(ctx, 1, null);
    expect(error).toBeUndefined();
    expect(session!.state).toBe("active");
    expect(session!.plannedSessionId).toContain("planned:");
    expect(session!.contextSig).toContain("foundation");
    expect(session!.expectedSets).toBe(19);
  });

  it("START returns existing if already active same context", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session: s1 } = startSession(ctx, 1, null);
    const { session: s2 } = startSession(ctx, 1, s1);
    expect(s2!.id).toBe(s1!.id);
  });

  it("START errors if different context while active", () => {
    const ctx1 = getFoundationContext(1, 1, "Senin")!;
    const ctx2 = getFoundationContext(1, 1, "Selasa")!;
    const { session: s1 } = startSession(ctx1, 1, null);
    const { error } = startSession(ctx2, 1, s1);
    expect(error).toMatch(/still active/);
  });

  it("completeSet validates and dedupes (sessionId,key) last-write-wins", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const key = ctx.key(0, 0);
    const log: Record<string, unknown> = {};
    const events: never[] = [];
    const r1 = completeSet({ name: "Barbell Bench Press", exerciseId: "bp", key, kg: 80, reps: 10, rir: "2", type: "N", session: session!, log, events });
    expect(r1.ok).toBe(true);
    expect(r1.newLog![`${key}_ok`]).toBe(true);
    expect(r1.newEvents!).toHaveLength(1);
    // second complete same key should dedupe to 1, not 2
    const r2 = completeSet({ name: "Barbell Bench Press", exerciseId: "bp", key, kg: 82, reps: 10, rir: "2", type: "N", session: session!, log: r1.newLog!, events: r1.newEvents! });
    expect(r2.newEvents!).toHaveLength(1);
    expect(r2.newEvents![0].kg).toBe(82);
  });

  it("completeSet rejects invalid (weighted requires kg)", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const key = ctx.key(0, 0);
    const r = completeSet({ name: "Barbell Bench Press", exerciseId: "bp", key, kg: 0, reps: 10, rir: "2", type: "N", session: session!, log: {}, events: [] });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Isi beban/);
  });

  it("FINISH needsConfirm when not complete", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const res = finishSession({ active: session, expected: 19, done: 5, events: [], sessions: [] });
    expect(res.needsConfirm).toBe(true);
    expect(res.session).toBeUndefined();
  });

  it("FINISH completed when done==expected", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const res = finishSession({ active: session, expected: 2, done: 2, events: [], sessions: [] });
    expect(res.session!.state).toBe("completed");
    expect(res.session!.completedSets).toBe(2);
  });

  it("FINISH ended_early when forceEarly", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const res = finishSession({ active: session, expected: 19, done: 5, events: [], sessions: [], forceEarly: true });
    expect(res.session!.state).toBe("ended_early");
  });

  it("FINISH idempotent second call returns existing", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    const { session } = startSession(ctx, 1, null);
    const first = finishSession({ active: session, expected: 2, done: 2, events: [], sessions: [] })!;
    const sessions = [first.session!];
    const second = finishSession({ active: session, expected: 2, done: 2, events: [], sessions });
    expect(second.session!.id).toBe(first.session!.id);
  });
});
