import type { CanonicalSession } from "@/lib/storage/port";

export function finalizedSessions(sessions: CanonicalSession[]): CanonicalSession[] {
  return sessions.filter((s) => s && (s.state === "completed" || s.state === "ended_early") && s.canonicalVersion === "RC4");
}

export function phaseProgress(
  sessions: CanonicalSession[],
  phase: { c: string; l: string },
  expectedPerPhase: number // total expected sets for phase (for demo, we compute from FOUNDATION)
): { percent: number } {
  const finalized = finalizedSessions(sessions).filter((s) => s.label.includes(phase.l) || s.plannedSessionId.includes(phase.l));
  // simplified: percent = finalized.length / 20 *100 (20 sessions per phase approx)
  const count = finalized.length;
  return { percent: Math.min(100, Math.round((count / 20) * 100)) };
}

export function weeklyMuscles(
  events: { sessionId: string | null; name: string; type: string; ts: number }[],
  sessions: CanonicalSession[]
): Record<string, number> {
  const ids = new Set(finalizedSessions(sessions).map((s) => String(s.id)));
  const start = Date.now() - 7 * 86400000;
  const out: Record<string, number> = {};
  events
    .filter((e) => e.ts >= start && e.type !== "W" && e.sessionId && ids.has(String(e.sessionId)))
    .forEach((e) => {
      // muscleFor simplified
      const n = String(e.name || "").toLowerCase();
      let m = "Other";
      if (n.includes("bench") || n.includes("pec") || n.includes("push")) m = "Chest";
      else if (n.includes("pull") || n.includes("row") || n.includes("deadlift")) m = "Back";
      else if (n.includes("squat") || n.includes("leg press")) m = "Quads";
      else if (n.includes("curl")) m = "Biceps";
      else if (n.includes("tricep") || n.includes("pushdown")) m = "Triceps";
      out[m] = (out[m] || 0) + 1;
    });
  return out;
}
