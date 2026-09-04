export type MeasurementType = "weighted_reps" | "assisted_reps" | "bodyweight_reps" | "timed_hold";

export function getMeasurementType(name: string): MeasurementType {
  const n = String(name || "").toLowerCase();
  if (/assisted.*(pull|dip)/i.test(n)) return "assisted_reps";
  if (/plank|wall sit|dead hang|\bhold\b|carry/i.test(n)) return "timed_hold";
  // bodyweight_reps: pull-up, chin-up, push-up, dip, hanging raise without weighted/assisted
  if (
    /hanging (knee|leg) raise|pull.?up|chin.?up|push.?up|\bdip\b/i.test(n) &&
    !/weighted|assisted/i.test(n)
  )
    return "bodyweight_reps";
  return "weighted_reps";
}

export type ValidateSetInput = {
  name: string;
  kg: number | string | null | undefined;
  reps: number | string | null | undefined;
  rir: string | number | null | undefined;
  type: string; // 'N','W','D','F','T','B'
};

export type ValidateResult = { valid: boolean; error?: string };

export function validateSet(input: ValidateSetInput): ValidateResult {
  const mtype = getMeasurementType(input.name);
  const isWarm = String(input.type || "N") === "W";
  const kgN = Number(input.kg);
  const rpN = Number(input.reps);
  const hasRir = !(input.rir === "" || input.rir === null || input.rir === undefined);
  const needsLoad = mtype === "weighted_reps" || mtype === "assisted_reps";

  if (needsLoad && !(kgN > 0)) {
    return { valid: false, error: "Isi beban, repetisi, dan RIR sebelum menandai set selesai." };
  }
  if (!(rpN > 0)) {
    return mtype === "timed_hold"
      ? { valid: false, error: "Isi durasi dan RIR sebelum menandai set selesai." }
      : { valid: false, error: "Isi repetisi dan RIR sebelum menandai set selesai." };
  }
  if (!isWarm && !hasRir) {
    return { valid: false, error: "Isi RIR sebelum menandai set selesai." };
  }
  return { valid: true };
}
