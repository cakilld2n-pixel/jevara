export type SyncOp = {
  id: string;
  table: string;
  key: string; // dedupe key: e.g. "sessionId::key" or "profile::userId"
  payload: Record<string, unknown>;
  ts: number;
};

const QUEUE_KEY = "jevara_sync_queue_v2";

function loadQueue(): SyncOp[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncOp[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(q: SyncOp[]) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {}
}

export function enqueue(table: string, key: string, payload: Record<string, unknown>) {
  const q = loadQueue();
  // dedupe last-write-wins for same table+key
  const existingIdx = q.findIndex((op) => op.table === table && op.key === key);
  const op: SyncOp = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, table, key, payload, ts: Date.now() };
  if (existingIdx >= 0) q.splice(existingIdx, 1);
  q.push(op);
  saveQueue(q);
  return op;
}

export function getQueue(): SyncOp[] {
  return loadQueue();
}

export function clearQueue() {
  saveQueue([]);
}

export function removeOps(ids: string[]) {
  const q = loadQueue().filter((op) => !ids.includes(op.id));
  saveQueue(q);
}

// Flush via Supabase — table must support upsert on key
export async function flushQueue(
  supabase: { from: (table: string) => { upsert: (payload: unknown, opts?: unknown) => Promise<{ error: { message: string } | null }> } },
  opts?: { onProgress?: (op: SyncOp) => void }
): Promise<{ flushed: number; error?: string }> {
  const q = loadQueue();
  if (!q.length) return { flushed: 0 };
  // dedupe in-queue last-write-wins already handled by enqueue, but also group by table+key and keep last
  const byKey = new Map<string, SyncOp>();
  q.forEach((op) => byKey.set(`${op.table}::${op.key}`, op));
  const deduped = Array.from(byKey.values());
  const toRemove: string[] = [];
  for (const op of deduped) {
    const { error } = await supabase.from(op.table).upsert(op.payload, { onConflict: "id" } as never);
    if (error) {
      if (toRemove.length) removeOps(toRemove);
      // also clean superseded that were already deduped
      const supersededEarly = q.filter((orig) => !toRemove.includes(orig.id) && !deduped.some((d) => d.id === orig.id)).map((o) => o.id);
      if (supersededEarly.length) removeOps(supersededEarly);
      return { flushed: toRemove.length, error: error.message };
    }
    toRemove.push(op.id);
    opts?.onProgress?.(op);
  }
  // remove flushed ops (need to map deduped ids to original queue ids)
  const remaining = q.filter((op) => !deduped.some((d) => d.table === op.table && d.key === op.key));
  // also remove any non-deduped duplicates that were superseded
  const dedupedIds = new Set(deduped.map((d) => d.id));
  const finalRemove = q.filter((op) => dedupedIds.has(op.id) || !byKey.has(`${op.table}::${op.key}`) || byKey.get(`${op.table}::${op.key}`)!.id !== op.id).map((o) => o.id);
  // simpler: just clear and keep non-flushed? For 05, just clear flushed deduped
  removeOps(toRemove);
  // also clean superseded (those not in deduped but in original q)
  const superseded = q.filter((op) => !toRemove.includes(op.id) && !deduped.some((d) => d.id === op.id)).map((o) => o.id);
  if (superseded.length) removeOps(superseded);
  return { flushed: toRemove.length };
}

export async function hydrateFromSupabase(
  supabase: {
    from: (table: string) => {
      select: (cols?: string) => {
        eq: (col: string, val: string) => { data: unknown[] | null; error: { message: string } | null } | Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  },
  userId: string,
  onHydrate?: (table: string, rows: unknown[]) => void
) {
  const tables = ["profiles", "premium_events", "sessions", "readiness"];
  for (const table of tables) {
    const { data, error } = (await supabase.from(table).select("*").eq("user_id", userId)) as { data: unknown[] | null; error: { message: string } | null };
    if (!error && data) onHydrate?.(table, data);
  }
}
