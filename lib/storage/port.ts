export type Premium = {
  events: PremiumEvent[];
  sessions: CanonicalSession[];
  readiness: ReadinessEntry[];
  weights: WeightEntry[];
  prs: Record<string, PR>;
  customPrograms: unknown[];
  settings: { rest: number; sound: boolean; vibrate: boolean; autoRest: boolean; showCoach: boolean; autoProgression: boolean; deloadSensitivity: string };
  profile: { weight: number; height: number; age: number };
};

export type PremiumEvent = {
  ts: number;
  exerciseId: string;
  name: string;
  kg: number;
  reps: number;
  rir: number | null;
  type: string;
  volume: number;
  key: string;
  sessionId: string | null;
  measurementType?: string;
  durationSec?: number;
};

export type CanonicalSession = {
  id: string;
  canonicalVersion: string;
  state: "active" | "finishing" | "completed" | "ended_early";
  label: string;
  plannedSessionId: string;
  contextSig: string;
  expectedSets: number;
  completedSets: number;
  sets: number;
  volume: number;
  duration: number;
  startedAt: number;
  endedAt?: number;
  completionRate?: number;
  prs?: number;
};

export type ReadinessEntry = {
  ts: number;
  energy: number;
  sleep: number;
  soreness: number;
  dateKey: string;
  score?: number;
};

export type WeightEntry = { ts: number; w: number; bf: number | null };
export type PR = { kg: number; reps: number; e1rm: number; bestMetric: number; metricType: string; ts: number; baseline: boolean };

export type Log = Record<string, string | number | boolean | undefined>;

export interface StoragePort {
  loadLog(): Log;
  saveLog(log: Log): void;
  loadPremium(): Premium;
  savePremium(p: Premium): void;
  loadActiveSession(): CanonicalSession | null;
  saveActiveSession(s: CanonicalSession | null): void;
  clearAll(): void;
}
