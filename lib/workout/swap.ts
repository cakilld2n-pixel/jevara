import type { SessionContext } from "@/data/types";

// curated substitutes (subset from JE095_META)
const SUBS: Record<string, string[]> = {
  "Barbell Bench Press": ["DB Bench Press", "Machine Chest Press", "Push-Up weighted"],
  "DB Bench Press": ["Machine Chest Press", "Barbell Bench Press"],
  "Lat Pulldown": ["Assisted Pull-Up", "Pull-Up BW"],
  "Seated Cable Row": ["DB Row 1 lengan", "Barbell Row"],
  "DB Overhead Press": ["Barbell OHP", "Machine Shoulder Press"],
  "Lateral Raise": ["Cable Lateral Raise", "Machine Lateral Raise"],
  "Tricep Pushdown": ["Rope Triceps Pushdown", "Triceps Extension Machine"],
  "Goblet/BB Squat": ["Goblet Squat", "Leg Press", "Hack Squat"],
  "Romanian Deadlift DB": ["Romanian Deadlift", "Leg Curl"],
};

export function swapCandidates(original: string): string[] {
  const list = SUBS[original] || [];
  if (list.length) return list.slice(0, 3).filter((x) => x.toLowerCase() !== original.toLowerCase());
  // fallback by pattern
  const low = original.toLowerCase();
  if (/bench|chest|press/.test(low) && !/shoulder|overhead/.test(low)) return ["DB Bench Press", "Machine Chest Press", "Push-Up"];
  if (/pulldown|pull.?up/.test(low)) return ["Lat Pulldown", "Assisted Pull-Up", "Pull-Up BW"];
  if (/row/.test(low)) return ["Seated Cable Row", "DB Row 1 lengan", "Machine Row"];
  return ["Machine Chest Press", "DB Bench Press", "Cable Chest Press"];
}

/**
 * Swap does not copy load. It replaces future unlogged sets for the same exerciseId/name,
 * clears their log entries (kg/reps/rir/ok), and returns new context.
 * Callers must persist log and autopilot state.
 */
export function applySwap(
  ctx: SessionContext,
  log: Record<string, unknown>,
  originalName: string,
  replacement: string
): { newCtx: SessionContext; changed: number; newLog: Record<string, unknown> } {
  const newLog = { ...log };
  let changed = 0;
  const newExs = ctx.exs.map((ex) => {
    const nm = ex.n || ex.name || "";
    if (nm === originalName) {
      // clear future unlogged sets for this exercise
      const idx = ctx.exs.indexOf(ex);
      for (let s = 0; s < (ex.s || 0); s++) {
        const key = ctx.key(idx, s);
        if (!newLog[`${key}_ok`]) {
          delete newLog[`${key}_kg`];
          delete newLog[`${key}_rp`];
          delete newLog[`${key}_rir`];
          delete newLog[`${key}_ok`];
          changed++;
        }
      }
      return { ...ex, n: replacement, name: replacement, id: `swap_${replacement.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32)}` };
    }
    return ex;
  });
  // rebuild context with new exs — need to keep same key fn shape but with new ids?
  // For 06, we keep original keys but with new name; caller will use newCtx for rendering
  const newCtx: SessionContext = { ...ctx, exs: newExs };
  return { newCtx, changed, newLog };
}
