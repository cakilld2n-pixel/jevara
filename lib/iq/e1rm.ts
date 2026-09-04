export function calcE1RM(kg: number, reps: number): number {
  if (!kg || !reps) return 0;
  return kg * (1 + reps / 30);
}

export function e1rmEligible(name: string): boolean {
  const n = String(name || "").toLowerCase();
  // compound eligible, but exclude isolation
  const isCompound = /bench press|squat|deadlift|overhead press|barbell row/i.test(n);
  const isIsolation = /lateral|face pull|curl|pushdown|extension|fly|raise/i.test(n);
  return isCompound && !isIsolation;
}

export function bestMetricFor(name: string, kg: number, reps: number): number {
  return e1rmEligible(name) ? calcE1RM(kg, reps) : kg * reps;
}
