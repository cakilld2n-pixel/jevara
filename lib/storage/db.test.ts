import { describe, it, expect, beforeEach } from "vitest";
import { createStorage } from "./db";

describe("StoragePort — IndexedDB fallback + limits (04)", () => {
  beforeEach(() => localStorage.clear());

  it("stores log and premium with limits", () => {
    const s = createStorage();
    const log: Record<string, string | number | boolean | undefined> = {};
    for (let i = 0; i < 10; i++) log[`k${i}_ok`] = true;
    s.saveLog(log);
    expect(Object.keys(s.loadLog())).toHaveLength(10);

    const premium = s.loadPremium();
    premium.events = Array.from({ length: 600 }, (_, i) => ({ ts: i } as never));
    premium.sessions = Array.from({ length: 200 }, (_, i) => ({ id: `s${i}` } as never));
    premium.readiness = Array.from({ length: 80 }, (_, i) => ({ ts: i } as never));
    s.savePremium(premium);
    const loaded = s.loadPremium();
    expect(loaded.events).toHaveLength(500);
    expect(loaded.sessions).toHaveLength(150);
    expect(loaded.readiness).toHaveLength(60);
  });

  it("migrates legacy keys gym_v6 and gym_iqbal_premium_v3", () => {
    localStorage.setItem("gym_v6", JSON.stringify({ "1_w1_Senin_bp_s0_ok": true }));
    localStorage.setItem("gym_iqbal_premium_v3", JSON.stringify({ events: [{ ts: 1 }], sessions: [], readiness: [], weights: [], prs: {}, customPrograms: [], settings: { rest: 90 }, profile: {} }));
    const s = createStorage();
    expect(s.loadLog()["1_w1_Senin_bp_s0_ok"]).toBe(true);
    expect(s.loadPremium().events).toHaveLength(1);
  });

  it("activeSession persist and clear", () => {
    const s = createStorage();
    expect(s.loadActiveSession()).toBeNull();
    s.saveActiveSession({ id: "s1", state: "active" } as never);
    expect(s.loadActiveSession()!.id).toBe("s1");
    s.saveActiveSession(null);
    expect(s.loadActiveSession()).toBeNull();
  });

  it("dedupe not needed here but storage respects upsert", () => {
    const s = createStorage();
    const p = s.loadPremium();
    p.events = [{ key: "k1", sessionId: "s1", ts: 1 } as never, { key: "k1", sessionId: "s1", ts: 2 } as never];
    // storage itself does not dedupe, lifecycle does — just check save/load roundtrip
    s.savePremium(p);
    expect(s.loadPremium().events).toHaveLength(2);
  });
});
