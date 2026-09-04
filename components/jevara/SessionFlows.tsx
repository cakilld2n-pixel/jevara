"use client";

import React from "react";
import { useJevara } from "./store";
import { fmt, fmtDur } from "@/lib/jevara/format";
import type { CanonicalSession } from "@/lib/storage/port";

export function FinishConfirm({ expected, done }: { expected: number; done: number }) {
  const s = useJevara();
  const id = s.lang === "id";
  return (
    <div className="session-summary">
      <h3>{id ? "Masih ada set yang belum dicatat" : "There are sets left to log"}</h3>
      <div className="muted">
        {done} / {expected} {id ? "set valid tercatat." : "valid sets logged."}
      </div>
      <button className="primary" style={{ width: "100%", marginTop: 14 }} onClick={() => { s.closeOverlay(); s.goTab("log"); }}>
        {id ? "LANJUTKAN LATIHAN" : "CONTINUE WORKOUT"}
      </button>
      <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => s.handleFinish(true)}>
        {id ? "AKHIRI LEBIH AWAL" : "END EARLY"}
      </button>
    </div>
  );
}

export function SessionSummaryView({ session }: { session: CanonicalSession }) {
  const s = useJevara();
  const id = s.lang === "id";
  const full = session.state === "completed";
  const expected = session.expectedSets || session.sets || 0;
  return (
    <div>
      <div className="session-summary">
        <div className="premium-badge">◆ {full ? (id ? "LATIHAN SELESAI" : "SESSION COMPLETE") : id ? "SESI DIAKHIRI" : "SESSION ENDED"}</div>
        <h3>{session.label}</h3>
        <div className="big">{fmtDur(session.duration || 0)}</div>
        <div className="kpirow">
          <div className="kpi">
            <b>
              {session.sets}/{expected}
            </b>
            <small>{id ? "SET" : "SETS"}</small>
          </div>
          <div className="kpi">
            <b>{fmt(session.volume || 0)} kg</b>
            <small>{id ? "VOLUME" : "VOLUME"}</small>
          </div>
          <div className="kpi">
            <b>{(session.prs || 0) > 0 ? session.prs : "—"}</b>
            <small>{id ? "REKOR" : "RECORDS"}</small>
          </div>
        </div>
        <div className="insight">
          {id
            ? "Sesi telah difinalisasi. Ringkasan, Riwayat, Progres, dan JEVARA IQ sekarang membaca record sesi yang sama."
            : "The session is finalized. Summary, History, Progress, and JEVARA IQ now read the same session record."}
        </div>
        <button className="primary" style={{ width: "100%" }} onClick={() => { s.closeOverlay(); s.goTab("prog"); }}>
          {id ? "LIHAT PROGRES" : "VIEW PROGRESS"}
        </button>
        <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => { s.closeOverlay(); s.goTab("dash"); }}>
          {id ? "SELESAI" : "DONE"}
        </button>
      </div>
    </div>
  );
}
