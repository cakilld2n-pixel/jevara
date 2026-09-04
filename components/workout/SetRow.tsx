"use client";

import { useState } from "react";
import { validateSet, getMeasurementType } from "@/lib/session/measurement";

export function SetRow({
  index,
  name,
  exerciseId,
  setKey,
  defaultKg,
  defaultReps,
  defaultRir,
  defaultType,
  isDone,
  onDone,
}: {
  index: number;
  name: string;
  exerciseId: string;
  setKey: string;
  defaultKg: string;
  defaultReps: string;
  defaultRir: string;
  defaultType: string;
  isDone: boolean;
  onDone: (kg: string, reps: string, rir: string, type: string) => { ok: boolean; error?: string };
}) {
  const [kg, setKg] = useState(defaultKg);
  const [reps, setReps] = useState(defaultReps);
  const [rir, setRir] = useState(defaultRir);
  const [type, setType] = useState(defaultType);
  const mtype = getMeasurementType(name);
  const needsLoad = mtype === "weighted_reps" || mtype === "assisted_reps";

  return (
    <div className={`grid grid-cols-[28px_1fr_1fr_90px_36px] items-center gap-1.5 rounded-xl border px-2 py-1.5 ${isDone ? "border-[#34D399]/30 bg-[rgba(52,211,153,.08)]" : "border-jevara-bd bg-jevara-bg3"}`}>
      <span className="text-center text-xs text-jevara-mu">{index + 1}</span>
      <input
        value={kg}
        onChange={(e) => setKg(e.target.value)}
        placeholder={needsLoad ? "kg" : "—"}
        disabled={!needsLoad && mtype === "bodyweight_reps"}
        className="w-full rounded-lg border border-jevara-bd bg-jevara-bg2 px-2 py-1.5 text-center text-sm outline-none focus:border-jevara-blue"
        inputMode="decimal"
      />
      <input
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        placeholder="reps"
        className="w-full rounded-lg border border-jevara-bd bg-jevara-bg2 px-2 py-1.5 text-center text-sm outline-none focus:border-jevara-blue"
        inputMode="numeric"
      />
      <select value={rir} onChange={(e) => setRir(e.target.value)} className="w-full rounded-lg border border-jevara-bd bg-jevara-bg2 px-1 py-1.5 text-center text-xs">
        <option value="">RIR</option>
        <option value="4">RIR 4</option>
        <option value="3">RIR 3</option>
        <option value="2">RIR 2</option>
        <option value="1">RIR 1</option>
        <option value="0">RIR 0</option>
      </select>
      <button
        onClick={() => {
          const res = onDone(kg, reps, rir, type);
          if (!res.ok) {
            // parent will toast
          }
        }}
        className={`h-8 w-8 rounded-full border text-xs font-black ${isDone ? "border-transparent bg-[#34D399] text-white" : "border-jevara-bd bg-jevara-bg2 text-jevara-mu"}`}
      >
        {isDone ? "✓" : "○"}
      </button>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="col-span-5 mt-1 w-full rounded-lg border border-jevara-bd bg-jevara-bg2 px-2 py-1 text-xs"
      >
        <option value="N">Working</option>
        <option value="W">Warm-up</option>
        <option value="D">Drop</option>
        <option value="F">Failure</option>
      </select>
    </div>
  );
}
