"use client";

import type { CanonicalSession, PremiumEvent } from "@/lib/storage/port";
import { finalizedSessions, weeklyMuscles } from "@/lib/progress/history";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ProgressView({ sessions, events }: { sessions: CanonicalSession[]; events: PremiumEvent[] }) {
  const finalized = finalizedSessions(sessions as never[]);
  const muscles = weeklyMuscles(events as never[], sessions as never[]);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>History — Canonical ({finalized.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {finalized.length === 0 ? (
            <p className="text-xs text-jevara-mu">Belum ada sesi final. Selesaikan sesi di Workout.</p>
          ) : (
            <div className="space-y-2">
              {finalized.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-jevara-bd bg-jevara-bg3 px-3 py-2">
                  <div>
                    <div className="text-sm font-bold">{s.label}</div>
                    <div className="text-xs text-jevara-mu">
                      {new Date(s.startedAt).toLocaleDateString("id-ID")} • {s.state}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-jevara-blue">
                    {s.sets} sets • {s.volume.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Muscles (finalized only)</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(muscles).length === 0 ? (
            <p className="text-xs text-jevara-mu">Belum ada volume minggu ini.</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(muscles).map(([m, v]) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="w-20 text-xs font-bold">{m}</span>
                  <div className="h-2 flex-1 rounded-full bg-jevara-bg3">
                    <div className="h-2 rounded-full bg-jevara-blue" style={{ width: `${Math.min(100, (v as number) * 20)}%` }} />
                  </div>
                  <span className="text-xs text-jevara-mu">{v} sets</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
