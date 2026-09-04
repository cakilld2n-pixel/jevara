import type { CanonicalSession, PremiumEvent } from "@/lib/storage/port";

export function SessionBar({
  active,
  done,
  expected,
  volume,
  onStart,
  onFinish,
}: {
  active: CanonicalSession | null;
  done: number;
  expected: number;
  volume: number;
  onStart: () => void;
  onFinish: (forceEarly?: boolean) => void;
}) {
  if (active) {
    const elapsed = Math.floor((Date.now() - active.startedAt) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-jevara-bd bg-jevara-bg2 p-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#34D399]" />
        <div className="flex-1">
          <div className="text-sm font-bold">Workout berjalan</div>
          <div className="text-xs text-jevara-mu">
            {mm}:{ss} • {done}/{expected} sets • {volume.toFixed(1)} kg
          </div>
        </div>
        <button onClick={() => onFinish(false)} className="rounded-xl bg-[#34D399] px-3 py-2 text-xs font-black text-[#07130f]">
          FINISH
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-jevara-bd bg-jevara-bg2 p-3">
      <div className="flex-1">
        <div className="text-sm font-bold">Siap latihan?</div>
        <div className="text-xs text-jevara-mu">Mulai sesi untuk merekam durasi & volume</div>
      </div>
      <button onClick={onStart} className="rounded-xl bg-jevara-blue px-3 py-2 text-xs font-black text-[#07111d]">
        START
      </button>
    </div>
  );
}
