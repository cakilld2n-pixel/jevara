import { bestMetricFor, calcE1RM, e1rmEligible } from "./e1rm";

export type PR = {
  kg: number;
  reps: number;
  e1rm: number;
  bestMetric: number;
  metricType: "estimated_1rm" | "best_set";
  ts: number;
  baseline: boolean;
};

export function updatePR(prs: Record<string, PR>, name: string, kg: number, reps: number): { prs: Record<string, PR>; isPR: boolean; isBaseline: boolean } {
  if (!(kg > 0) || !(reps > 0)) return { prs, isPR: false, isBaseline: false };
  const metric = bestMetricFor(name, kg, reps);
  const e1rm = calcE1RM(kg, reps);
  const eligible = e1rmEligible(name);
  const old = prs[name];
  if (!old) {
    const next: PR = {
      kg,
      reps,
      e1rm: eligible ? e1rm : 0,
      bestMetric: metric,
      metricType: eligible ? "estimated_1rm" : "best_set",
      ts: Date.now(),
      baseline: true,
    };
    return { prs: { ...prs, [name]: next }, isPR: false, isBaseline: true };
  }
  if (metric > (old.bestMetric ?? old.e1rm ?? 0)) {
    const next: PR = {
      kg,
      reps,
      e1rm: eligible ? e1rm : 0,
      bestMetric: metric,
      metricType: eligible ? "estimated_1rm" : "best_set",
      ts: Date.now(),
      baseline: false,
    };
    return { prs: { ...prs, [name]: next }, isPR: true, isBaseline: false };
  }
  return { prs, isPR: false, isBaseline: false };
}
