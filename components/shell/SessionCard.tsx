import type { SessionContext } from "@/data/types";

export function SessionCard({ ctx }: { ctx: SessionContext | null }) {
  if (!ctx) {
    return (
      <div className="rounded-2xl border border-jevara-bd bg-jevara-bg2 p-4">
        <p className="text-sm text-jevara-mu">Sesi Terencana tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-jevara-bd bg-jevara-bg2 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black tracking-widest text-jevara-blue">
            {ctx.day} • {ctx.label}
          </div>
          <div className="text-sm font-bold">{ctx.title}</div>
          <div className="text-xs text-jevara-mu">
            {ctx.exs.length} exercises • {ctx.expectedSets} sets • Kardio: {ctx.cardio}
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-black text-white"
          style={{ background: ctx.color }}
        >
          {ctx.programId === "foundation" ? "FOUNDATION" : ctx.programId.toUpperCase()}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {ctx.exs.map((ex, i) => (
          <div
            key={`${ex.n}-${i}`}
            className="flex items-center justify-between rounded-xl border border-jevara-bd bg-jevara-bg3 px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold">{ex.n}</div>
              <div className="text-xs text-jevara-mu">
                {ex.s} sets • {ex.r} reps {ex.nt ? `• ${ex.nt}` : ""}
              </div>
            </div>
            <span className="text-xs font-bold text-jevara-blue">
              {ex.s}×{ex.r}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-jevara-bd bg-jevara-bg3 p-2 text-center text-xs text-jevara-mu">
        Read-only — logging diaktifkan di tiket 04 (StoragePort)
      </div>
    </div>
  );
}
