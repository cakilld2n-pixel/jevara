import { describe, it, expect } from "vitest";
import { createBackup, validateBackup, backupToJson, parseBackupJson } from "./index";

describe("Backup — 09", () => {
  it("createBackup includes version and exportedAt", () => {
    const b = createBackup({ k: "v" }, { events: [] });
    expect(b.version).toBe("JEVARA-0.9.9");
    expect(b.log).toEqual({ k: "v" });
    expect(new Date(b.exportedAt).toISOString()).toBe(b.exportedAt);
  });

  it("validateBackup rejects missing log/premium", () => {
    expect(validateBackup({}).ok).toBe(false);
    expect(validateBackup({ log: {}, premium: {} }).ok).toBe(true);
  });

  it("backupToJson and parse roundtrip", () => {
    const json = backupToJson({ a: 1 }, { events: [] });
    const parsed = parseBackupJson(json);
    expect(parsed.ok).toBe(true);
    expect(parsed.payload!.log).toEqual({ a: 1 });
  });

  it("parse invalid JSON fails", () => {
    expect(parseBackupJson("not json").ok).toBe(false);
  });
});
