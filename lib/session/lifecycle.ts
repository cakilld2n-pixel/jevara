import type { SessionContext } from "@/data/types";
import type { CanonicalSession, PremiumEvent } from "@/lib/storage/port";
import { getMeasurementType, validateSet } from "./measurement";

let FINALIZING: Record<string, boolean> = {};

export function ctxSig(context: SessionContext, week: number): string {
  return [context.programId || "foundation", context.context || "unknown", String(week), context.day || "", context.label || ""].join("|");
}

export function plannedSessionId(context: SessionContext, week: number): string {
  return `planned:${ctxSig(context, week)}`;
}

export function startSession(
  context: SessionContext,
  week: number,
  existingActive: CanonicalSession | null
): { session: CanonicalSession | null; error?: string } {
  if (existingActive && existingActive.contextSig && existingActive.contextSig !== ctxSig(context, week)) {
    return { session: null, error: "Another workout session is still active. Finish or end it before starting this workout." };
  }
  if (existingActive) return { session: existingActive };
  const now = Date.now();
  const session: CanonicalSession = {
    id: `s${now}`,
    canonicalVersion: "RC4",
    state: "active",
    label: `${context.title} • ${context.day} • ${context.label}`,
    plannedSessionId: plannedSessionId(context, week),
    contextSig: ctxSig(context, week),
    expectedSets: context.expectedSets,
    completedSets: 0,
    sets: 0,
    volume: 0,
    duration: 0,
    startedAt: now,
  };
  return { session };
}

export function completeSet(params: {
  name: string;
  exerciseId: string;
  key: string;
  kg: string | number;
  reps: string | number;
  rir: string | number | null;
  type: string;
  session: CanonicalSession | null;
  log: Record<string, unknown>;
  events: PremiumEvent[];
}): { ok: boolean; error?: string; newEvents?: PremiumEvent[]; newLog?: Record<string, unknown> } {
  const { name, exerciseId, key, kg, reps, rir, type, session, log, events } = params;
  const v = validateSet({ name, kg, reps, rir, type });
  if (!v.valid) return { ok: false, error: v.error };

  const kgN = Number(kg) || 0;
  const rpN = Number(reps) || 0;
  const rirN = rir === "" || rir === null || rir === undefined ? null : Number(rir);
  const mtype = getMeasurementType(name);
  const volume = type === "W" ? 0 : kgN * rpN;

  // save to log (simulate je095SaveInput: log[key_kg], etc)
  const newLog = { ...log };
  newLog[`${key}_kg`] = String(kg);
  newLog[`${key}_rp`] = String(reps);
  newLog[`${key}_rir`] = rir === null || rir === undefined ? "" : String(rir);
  newLog[`${key}_type`] = type;
  newLog[`${key}_ok`] = true;

  const event: PremiumEvent = {
    ts: Date.now(),
    exerciseId,
    name,
    kg: kgN,
    reps: rpN,
    rir: rirN,
    type,
    volume,
    key,
    sessionId: session ? session.id : null,
    measurementType: mtype,
  };
  if (mtype === "timed_hold") event.durationSec = rpN;

  // dedupe (sessionId,key) last-write-wins, limit 500
  let newEvents = [...events];
  const idx = newEvents.findIndex((e) => e.key === key && String(e.sessionId || "") === String(event.sessionId || ""));
  if (idx >= 0) newEvents.splice(idx, 1);
  newEvents.unshift(event);
  newEvents = newEvents.slice(0, 500);

  return { ok: true, newEvents, newLog };
}

export function finishSession(params: {
  active: CanonicalSession | null;
  expected: number;
  done: number;
  events: PremiumEvent[];
  sessions: CanonicalSession[];
  forceEarly?: boolean;
}): { session?: CanonicalSession | null; error?: string; needsConfirm?: boolean } {
  const { active, expected, done, events, sessions, forceEarly } = params;
  if (!active) return { error: "No active session" };
  const sid = active.id;
  // check already finalized first — idempotent even during FINALIZING window
  const existing = sessions.find((s) => s.id === sid && (s.state === "completed" || s.state === "ended_early"));
  if (existing) return { session: existing };
  if (FINALIZING[sid]) return {};
  const complete = expected > 0 && done >= expected;
  if (!complete && !forceEarly) {
    return { needsConfirm: true };
  }
  if (active.state === "finishing" || active.state === "completed") return {};

  FINALIZING[sid] = true;
  try {
    const now = Date.now();
    const volume = events.filter((e) => String(e.sessionId) === String(sid) && e.type !== "W").reduce((a, e) => a + (Number(e.volume) || 0), 0);
    const state: CanonicalSession["state"] = complete ? "completed" : "ended_early";
    const canonical: CanonicalSession = {
      ...active,
      state,
      expectedSets: expected,
      completedSets: done,
      sets: done,
      volume: Math.round(volume * 100) / 100,
      endedAt: now,
      duration: Math.max(0, Math.floor((now - active.startedAt) / 1000)),
      completionRate: expected ? Math.round((done / expected) * 100) : 0,
      canonicalVersion: "RC4",
    };
    // exerciseSummary not needed for 04, but keep volume
    return { session: canonical };
  } finally {
    setTimeout(() => delete FINALIZING[sid], 500);
  }
}

export function resetFinalizingForTest() {
  FINALIZING = {};
}
