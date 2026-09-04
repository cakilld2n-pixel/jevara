import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("PWA manifest — public/manifest.webmanifest seam", () => {
  it("contains required PWA fields and JEVARA identity", () => {
    const raw = readFileSync(join(process.cwd(), "public/manifest.webmanifest"), "utf-8");
    const m = JSON.parse(raw);
    expect(m.name).toBe("JEVARA");
    expect(m.short_name).toBe("JEVARA");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.icons).toHaveLength(2);
    expect(m.icons[0].sizes).toBe("192x192");
    expect(m.theme_color).toBe("#0a0a0f");
  });
});
