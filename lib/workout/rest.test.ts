import { describe, it, expect, beforeEach } from "vitest";
import { startRest, adjustRest, finishRest, loadRest, getLeftSec } from "./rest";

describe("Rest persist — 06", () => {
  beforeEach(() => localStorage.clear());

  it("startRest persists and loadRest returns it", () => {
    const s = startRest(90);
    expect(s.base).toBe(90);
    expect(loadRest()!.base).toBe(90);
    expect(getLeftSec(s)).toBeGreaterThan(80);
  });

  it("adjustRest +-15", () => {
    const s = startRest(60);
    const s2 = adjustRest(s, -15);
    expect(getLeftSec(s2)).toBe(getLeftSec(s) - 15);
  });

  it("finishRest clears", () => {
    startRest(60);
    finishRest();
    expect(loadRest()).toBeNull();
  });

  it("expired rest returns null", async () => {
    const s = startRest(1);
    expect(loadRest()).not.toBeNull();
    // wait 1.1s
    await new Promise((r) => setTimeout(r, 1100));
    expect(loadRest()).toBeNull();
    expect(getLeftSec(s)).toBeGreaterThanOrEqual(0);
  });
});
