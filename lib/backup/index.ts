export type BackupPayload = {
  version: string;
  exportedAt: string;
  log: Record<string, unknown>;
  premium: unknown;
  jevara?: unknown;
};

export function createBackup(log: Record<string, unknown>, premium: unknown, jevara?: unknown): BackupPayload {
  return {
    version: "JEVARA-0.9.9",
    exportedAt: new Date().toISOString(),
    log,
    premium,
    jevara,
  };
}

export function validateBackup(data: unknown): { ok: boolean; error?: string; payload?: BackupPayload } {
  if (!data || typeof data !== "object") return { ok: false, error: "Invalid JSON" };
  const d = data as Record<string, unknown>;
  if (!d.log || typeof d.log !== "object") return { ok: false, error: "Missing log" };
  if (!d.premium || typeof d.premium !== "object") return { ok: false, error: "Missing premium" };
  return { ok: true, payload: d as BackupPayload };
}

export function backupToJson(log: Record<string, unknown>, premium: unknown): string {
  return JSON.stringify(createBackup(log, premium), null, 2);
}

export function parseBackupJson(json: string): { ok: boolean; error?: string; payload?: BackupPayload } {
  try {
    const data = JSON.parse(json);
    return validateBackup(data);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
