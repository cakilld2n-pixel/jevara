import type { SessionContext } from "@/data/types";

export type AutopilotSet = {
  key: string;
  name: string;
  target: string;
  exerciseId: string;
  exIndex: number;
  setIndex: number;
};

export type AutopilotState = {
  ctx: SessionContext;
  sets: AutopilotSet[];
  pos: number;
};

export function flattenSession(ctx: SessionContext): AutopilotSet[] {
  const out: AutopilotSet[] = [];
  ctx.exs.forEach((ex, i) => {
    const n = ex.s || 0;
    for (let s = 0; s < n; s++) {
      out.push({
        key: ctx.key(i, s),
        name: ex.n || ex.name || `Exercise ${i + 1}`,
        target: ex.r || ex.reps || "—",
        exerciseId: ex.id || `e${i}`,
        exIndex: i,
        setIndex: s,
      });
    }
  });
  return out;
}

export function createAutopilot(ctx: SessionContext, log: Record<string, unknown>): AutopilotState {
  const sets = flattenSession(ctx);
  const first = sets.findIndex((s) => !log[`${s.key}_ok`]);
  return { ctx, sets, pos: first < 0 ? 0 : first };
}

export function nextUnloggedPos(sets: AutopilotSet[], log: Record<string, unknown>, fromPos: number): number {
  // find next unlogged after fromPos
  for (let i = fromPos + 1; i < sets.length; i++) {
    if (!log[`${sets[i].key}_ok`]) return i;
  }
  // wrap to first unlogged anywhere
  for (let i = 0; i < sets.length; i++) {
    if (!log[`${sets[i].key}_ok`]) return i;
  }
  return -1;
}

export function isAutopilotComplete(sets: AutopilotSet[], log: Record<string, unknown>): boolean {
  return sets.every((s) => !!log[`${s.key}_ok`]);
}
