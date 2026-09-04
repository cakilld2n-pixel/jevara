import { FOUNDATION, DAYS } from "@/data/foundation";
import { PROGRAMS } from "@/data/programs";
import type { SessionContext, Program } from "@/data/types";

function lk(ph: number, w: number, d: string, id: string, s: number) {
  return `${ph}_w${w}_${d}_${id}_s${s}`;
}

function cpk(pid: string, w: number, d: string, i: number, s: number) {
  return `cp_${pid}_w${w}_${d}_e${i}_s${s}`;
}

function slug(v: string) {
  return String(v || "exercise")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "exercise";
}

export type SessionState = {
  curPh: number;
  curWk: number;
  curDay: string;
  activeCP: Program | null;
  cpWk: number;
  cpDay: string | null;
};

export function getFoundationContext(
  ph: number,
  wk: number,
  day: string
): SessionContext | null {
  const phase = FOUNDATION[ph];
  const planned = phase?.days[day];
  if (!phase || !planned) return null;
  const exs = planned.ex || [];
  const expectedSets = exs.reduce((a, x) => a + (x.s || 0), 0);
  return {
    programId: "foundation",
    title: "JEVARA 12-Week Foundation",
    day,
    label: planned.l,
    color: phase.c,
    cardio: planned.cd || "—",
    exs,
    noteKey: `note_${ph}_w${wk}_${day}`,
    expectedSets,
    context: `f${ph}`,
    key: (i, s) => lk(ph, wk, day, (exs[i]?.id || `e${i}`), s),
  };
}

export function getProgramContext(
  program: Program,
  wk: number,
  day: string
): SessionContext | null {
  const planned = program.ss[day];
  if (!planned) return null;
  const exs = planned.ex || [];
  const expectedSets = exs.reduce((a, x) => a + (x.s || 0), 0);
  return {
    programId: program.id,
    title: program.title,
    day,
    label: planned.l,
    color: program.c,
    cardio: planned.cd || "—",
    exs,
    noteKey: `cpn_${program.id}_w${wk}_${day}`,
    expectedSets,
    context: `cp_${program.id}`,
    key: (i, s) => cpk(program.id, wk, day, i, s),
  };
}

export function getSessionContext(state: SessionState): SessionContext | null {
  if (state.activeCP) {
    const day = state.cpDay ?? state.activeCP.sc[0];
    return getProgramContext(state.activeCP, state.cpWk, day);
  }
  return getFoundationContext(state.curPh, state.curWk, state.curDay);
}

export function programById(id: string): Program | null {
  if (id === "foundation") return null;
  return PROGRAMS.find((p) => p.id === id) ?? null;
}

export function exerciseIdForName(name: string) {
  return `ex_${slug(name)}`;
}
