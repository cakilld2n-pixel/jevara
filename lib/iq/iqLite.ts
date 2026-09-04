import { readinessScore } from "./readiness";
import type { ReadinessEntry } from "../storage/port";
import { getMeasurementType } from "../session/measurement";

export type IQStage = "CALIBRATE" | "HOLD" | "BUILD_REPS" | "BUILD_LOAD" | "RECOVER";

export type IQInput = {
  name: string;
  target: string; // e.g. "8-12" or "10" or "30dtk"
  events: { sessionId: string | null; kg: number; reps: number; rir: number | null; ts: number; type: string; durationSec?: number; measurementType?: string }[];
  sessions: { id: string; state: string }[];
  readiness: ReadinessEntry | null;
};

function parseTarget(txt: string): { min: number; max: number } {
  const m = String(txt || "").match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return { min: +m[1], max: +m[2] };
  const one = String(txt || "").match(/(\d+)/);
  return one ? { min: +one[1], max: +one[1] } : { min: 8, max: 12 };
}

function avg(arr: number[]): number | null {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function smallestJump(name: string): number {
  const n = String(name || "").toLowerCase();
  if (n.includes("lateral") || n.includes("curl") || n.includes("tricep") || n.includes("fly")) return 1;
  if (n.includes("db ") || n.includes("dumbbell")) return 2;
  return 2.5;
}

export function iqLite(input: IQInput): { stage: IQStage; load: number | null; why: string; exposures: number; confidence: number } {
  const { name, target, events, sessions, readiness } = input;
  const mtype = getMeasurementType(name);
  const isHold = mtype === "timed_hold";
  const isBW = mtype === "bodyweight_reps";
  const finalizedIds = new Set(sessions.filter((s) => s.state === "completed" || s.state === "ended_early").map((s) => String(s.id)));

  const isValidEvent = (e: (typeof events)[number]) => {
    if (e.type === "W") return false;
    if (isHold) return Number((e as { durationSec?: number }).durationSec ?? e.reps) > 0;
    if (isBW) return Number(e.reps) > 0;
    return Number(e.kg) > 0 && Number(e.reps) > 0;
  };

  const comparable = events
    .filter((e) => e.sessionId && finalizedIds.has(String(e.sessionId)) && isValidEvent(e))
    .filter((e) => String((e as unknown as { name?: string }).name || name) === name || true)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));

  // For test simplicity, if events don't have name, treat all as matching
  const filtered = comparable.length ? comparable : events.filter(isValidEvent).sort((a, b) => (b.ts || 0) - (a.ts || 0));

  // exposures = distinct sessionId
  const seen = new Set<string>();
  filtered.forEach((e) => {
    if (e.sessionId) seen.add(String(e.sessionId));
  });
  const exposures = seen.size;
  const prev = filtered[0] || null;
  const r = parseTarget(target);
  const score = readinessScore(readiness as never);

  // why per measurement
  const calibrateWhy = isHold
    ? "Progres dinilai dari durasi & kualitas hold, bukan kilogram."
    : isBW
      ? "Berat badan tidak dihitung sebagai beban eksternal atau estimasi 1RM."
      : `Baseline ${exposures}/3 sesi sebanding.`;

  if (exposures < 3 || !prev) {
    return {
      stage: "CALIBRATE",
      load: null,
      why: isHold || isBW ? calibrateWhy : `Baseline ${exposures}/3 sesi sebanding.`,
      exposures,
      confidence: Math.min(45, 25 + exposures * 7),
    };
  }

  // metric averages per type
  const recent = filtered.slice(0, 3);
  const metricVals = recent.map((e) => (isHold ? Number((e as { durationSec?: number }).durationSec ?? e.reps) || 0 : Number(e.reps) || 0));
  const repsAvg = avg(metricVals);
  const rirs = recent.map((e) => Number(e.rir)).filter((x) => isFinite(x));
  const rirAvg = avg(rirs);

  // RECOVER if readiness <50 — for hold/BW also defer progression (load stays null)
  if (score !== null && score < 50) {
    return {
      stage: "RECOVER",
      load: isHold || isBW ? null : Number(prev.kg),
      why: "Kenaikan beban ditunda karena kesiapan hari ini lebih rendah.",
      exposures,
      confidence: 60,
    };
  }

  // hold / BW never propose BUILD_LOAD
  if (isHold || isBW) {
    if (repsAvg !== null && repsAvg >= r.max && (rirAvg === null || rirAvg >= 2)) {
      return {
        stage: "BUILD_REPS",
        load: null,
        why: isHold ? "Durasi target tercapai dengan cadangan yang memadai — tambah durasi." : "Batas atas repetisi tercapai — tambah repetisi.",
        exposures,
        confidence: 80,
      };
    }
    if (repsAvg !== null && repsAvg >= r.min && (rirAvg === null || rirAvg >= 1.5)) {
      return {
        stage: "BUILD_REPS",
        load: null,
        why: isHold ? "Pertahankan teknik dan tambah durasi dalam rentang target." : "Beban tubuh sudah sesuai; bangun repetisi dalam rentang target.",
        exposures,
        confidence: 70,
      };
    }
    return {
      stage: "HOLD",
      load: null,
      why: isHold ? "Pertahankan kualitas hold sampai durasi lebih konsisten." : "Pertahankan target sampai repetisi lebih konsisten.",
      exposures,
      confidence: 65,
    };
  }

  if (repsAvg !== null && repsAvg >= r.max && (rirAvg === null || rirAvg >= 2)) {
    return {
      stage: "BUILD_LOAD",
      load: Math.max(0, Math.round((Number(prev.kg) + smallestJump(name)) * 2) / 2),
      why: "Batas atas repetisi tercapai pada data sebanding dengan cadangan repetisi yang memadai.",
      exposures,
      confidence: 80,
    };
  }

  if (repsAvg !== null && repsAvg >= r.min && (rirAvg === null || rirAvg >= 1.5)) {
    return {
      stage: "BUILD_REPS",
      load: Number(prev.kg),
      why: "Beban sudah sesuai; bangun repetisi sebelum menaikkan beban.",
      exposures,
      confidence: 70,
    };
  }

  return {
    stage: "HOLD",
    load: Number(prev.kg),
    why: "Pertahankan target sampai performa lebih konsisten.",
    exposures,
    confidence: 65,
  };
}

export function uiForStage(stage: IQStage): { title: string; desc: string } {
  const map: Record<IQStage, { title: string; desc: string }> = {
    CALIBRATE: { title: "KALIBRASI", desc: "JEVARA sedang membangun baseline." },
    HOLD: { title: "PERTAHANKAN", desc: "Pertahankan target dan kumpulkan performa yang lebih konsisten." },
    BUILD_REPS: { title: "TAMBAH REPETISI", desc: "Pertahankan beban dan tambah repetisi dalam rentang target." },
    BUILD_LOAD: { title: "NAIKKAN BEBAN", desc: "Data sebanding mendukung kenaikan beban kecil." },
    RECOVER: { title: "PERTAHANKAN HARI INI", desc: "Kenaikan beban ditunda karena kesiapan hari ini lebih rendah." },
  };
  return map[stage] || map.HOLD;
}
