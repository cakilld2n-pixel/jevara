import { describe, it, expect, beforeEach, vi } from "vitest";
import { enqueue, getQueue, clearQueue, flushQueue } from "./queue";

describe("SyncQueue — 05 offline-first seam", () => {
  beforeEach(() => {
    localStorage.clear();
    clearQueue();
  });

  it("enqueue dedupes last-write-wins for same table+key", () => {
    enqueue("workout_logs", "s1::k1", { key: "k1", kg: 80 });
    enqueue("workout_logs", "s1::k1", { key: "k1", kg: 82 });
    const q = getQueue();
    expect(q).toHaveLength(1);
    expect(q[0].payload).toMatchObject({ kg: 82 });
  });

  it("keeps distinct keys separately", () => {
    enqueue("workout_logs", "s1::k1", { key: "k1" });
    enqueue("workout_logs", "s1::k2", { key: "k2" });
    expect(getQueue()).toHaveLength(2);
  });

  it("flush calls upsert once per deduped key", async () => {
    enqueue("workout_logs", "s1::k1", { key: "k1", kg: 80 });
    enqueue("workout_logs", "s1::k1", { key: "k1", kg: 82 }); // supersedes
    enqueue("workout_logs", "s1::k2", { key: "k2", kg: 60 });
    const mockUpsert = vi.fn(async () => ({ error: null }));
    const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));
    const result = await flushQueue({ from: mockFrom } as never);
    expect(result.flushed).toBe(2);
    expect(mockFrom).toHaveBeenCalledWith("workout_logs");
    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(getQueue()).toHaveLength(0);
  });

  it("flush stops on error and keeps remaining", async () => {
    enqueue("workout_logs", "s1::k1", { key: "k1" });
    enqueue("sessions", "s1", { id: "s1" });
    const mockUpsert = vi.fn(async (payload: unknown) => {
      const p = payload as { key?: string; id?: string };
      if ((p as { id?: string }).id === "s1") return { error: { message: "fail" } };
      return { error: null };
    });
    const result = await flushQueue({ from: () => ({ upsert: mockUpsert }) } as never);
    expect(result.error).toMatch(/fail/);
    expect(result.flushed).toBe(1);
    expect(getQueue()).toHaveLength(1);
  });

  it("clearQueue empties", () => {
    enqueue("workout_logs", "k1", {});
    clearQueue();
    expect(getQueue()).toHaveLength(0);
  });
});
