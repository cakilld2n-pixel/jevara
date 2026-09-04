import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (shadcn helper) — StoragePort seam helper", () => {
  it("merges conditional classes and deduplicates tailwind conflicts", () => {
    // external behavior: last class wins for same property
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps jevara tokens", () => {
    expect(cn("bg-jevara-bg", "text-jevara-tx")).toContain("bg-jevara-bg");
  });

  it("handles falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });
});
