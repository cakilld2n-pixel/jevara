"use client";

import React, { useState } from "react";
import { useJevara } from "./store";
import { fmt, fmtDur, localDate } from "@/lib/jevara/format";
import { calcE1RM } from "@/lib/iq/e1rm";
import { readinessScore } from "@/lib/iq/readiness";
import { finalizedSessions, weeklyMuscles } from "@/lib/progress/history";
import { FOUNDATION, DAYS } from "@/data/foundation";
import type { PremiumEvent, Premium } from "@/lib/storage/port";

const LIFTS = [
  { id: "dl", n: "Deadlift", c: "#f97316", m: { 1: { d: "Jumat", e: "dl" }, 2: { d: "Jumat", e: "dl2" }, 3: { d: "Jumat", e: "dl3" } } },
  { id: "sq", n: "Squat", c: "#3b82f6", m: { 1: { d: "Rabu", e: "sq" }, 2: { d: "Rabu", e: "bbs2" }, 3: { d: "Rabu", e: "bbs3" } } },
  { id: "bp", n: "Bench", c: "#10b981", m: { 1: { d: "Senin", e: "bp" }, 2: { d: "Senin", e: "bbp2" }, 3: { d: "Senin", e: "bbp3" } } },
];

const MUSCLE_LABEL: Record<string, [string, string]> = {
  Chest: ["Dada", "Chest"], Back: ["Punggung", "Back"], Shoulders: ["Bahu", "Shoulders"],
  Biceps: ["Bisep", "Biceps"], Triceps: ["Trisep", "Triceps"], Quads: ["Paha Depan", "Quads"],
  Hamstrings: ["Hamstring", "Hamstrings"], Glutes: ["Glute", "Glutes"], Calves: ["Betis", "Calves"],
  Core: ["Core", "Core"], Other: ["Lainnya", "Other"],
};

function persistentDecline(events: PremiumEvent[], name: string): boolean {
  const p = events
    .filter((x) => x.name === name && x.type !== "W" && x.kg > 0 && x.reps > 0)
    .slice(0, 12)
    .map((x) => calcE1RM(x.kg, x.reps));
  if (p.length < 6) return false;
  const recent = (p[0] + p[1] + p[2]) / 3;
  const older = (p[3] + p[4] + p[5]) / 3;
  return older > 0 && recent < older * 0.96;
}

function ReadinessSpark() {
  const { premium, lang } = useJevara();
  const id = lang === "id";
  const vals = (premium?.readiness || []).slice(0, 7).map((r) => readinessScore(r)).filter((x): x is number => x !== null);
  return (
    <div className="card">
      <div className="ctitle">{id ? "Tren Kesiapan" : "Readiness Trend"}</div>
      {vals.length < 3 ? (
        <div className="muted">
          {id ? "Belum cukup data. Catat kesiapan sebelum latihan minimal 3 kali untuk melihat tren." : "Not enough data yet. Log readiness before at least 3 workouts to see a trend."}
        </div>
      ) : (
        <div className="readiness-history">
          {vals.map((v, i) => (
            <div key={i} className="readiness-bar" style={{ height: Math.max(8, v * 0.65) + "px" }} title={v + "/100"} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecoveryCard() {
  const { premium, lang } = useJevara();
  const id = lang === "id";
  const names: Record<string, boolean> = {};
  (premium?.events || []).filter((e) => e && e.type !== "W" && e.name).forEach((e) => { names[e.name] = true; });
  const declining = Object.keys(names).filter((n) => persistentDecline(premium?.events || [], n)).length;
  const rd = readinessScore((premium?.readiness || [])[0] || null);
  const watch = declining >= 1 && rd !== null && rd < 50;
  return (
    <div className="card">
      <div className="ctitle">{id ? "Status Pemulihan" : "Recovery Status"}</div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>
        {watch ? (id ? "Perlu Evaluasi Pemulihan" : "Recovery Check Needed") : id ? "Pemulihan Stabil" : "Recovery Stable"}
      </div>
      <div className="muted" style={{ marginTop: 6 }}>
        {watch
          ? id
            ? "Ada kombinasi penurunan performa dan kesiapan rendah. Pertimbangkan sesi lebih ringan; deload tidak ditentukan dari readiness saja."
            : "Performance decline and low readiness are both present. Consider a lighter session; readiness alone does not determine a deload."
          : id
            ? "Data performa belum cukup untuk merekomendasikan deload."
            : "There is not enough performance evidence to suggest a deload."}
      </div>
    </div>
  );
}

function SessionHistory() {
  const { premium, lang } = useJevara();
  const id = lang === "id";
  const ss = finalizedSessions(premium?.sessions || []).slice(0, 8);
  return (
    <div className="card">
      <div className="ctitle">{id ? "RIWAYAT LATIHAN" : "WORKOUT HISTORY"}</div>
      {ss.length === 0 && <div className="muted">{id ? "Belum ada sesi final." : "No finalized sessions yet."}</div>}
      {ss.map((x) => (
        <div className="history-row" key={x.id}>
          <div className="history-dot" />
          <div className="history-body">
            <b>{x.label}</b>
            <small>
              {localDate(x.startedAt)} • {fmtDur(x.duration || 0)}
              {x.state === "ended_early" ? ` • ${id ? "diakhiri lebih awal" : "ended early"}` : ""}
            </small>
          </div>
          <div className="history-val">
            {x.sets} {id ? "set" : "sets"} · {fmt(x.volume || 0)} kg
          </div>
        </div>
      ))}
    </div>
  );
}

function MuscleCard() {
  const { premium, lang } = useJevara();
  const id = lang === "id";
  const mm = weeklyMuscles((premium?.events || []) as never, (premium?.sessions || []) as never) as Record<string, number>;
  const keys = Object.keys(mm);
  let maxm = 1;
  keys.forEach((k) => { if (mm[k] > maxm) maxm = mm[k]; });
  return (
    <div className="card">
      <div className="ctitle">{id ? "VOLUME OTOT MINGGUAN" : "WEEKLY MUSCLE VOLUME"}</div>
      <div className="muted">{id ? "Set kerja minggu ini berdasarkan sesi yang sudah difinalisasi." : "Working sets this week from finalized sessions."}</div>
      {keys.length === 0 && (
        <div className="muted" style={{ marginTop: 10 }}>
          {id ? "Belum ada set kerja dari sesi yang sudah selesai minggu ini." : "No working sets from finalized sessions this week."}
        </div>
      )}
      {keys.sort((a, b) => mm[b] - mm[a]).map((k) => (
        <div className="muscle-row" key={k}>
          <b>{(MUSCLE_LABEL[k] || [k, k])[id ? 0 : 1]}</b>
          <div className="muscle-bar">
            <div className="muscle-fill" style={{ width: Math.round((mm[k] / maxm) * 100) + "%" }} />
          </div>
          <span>
            {mm[k]} {id ? "set" : "sets"}
          </span>
        </div>
      ))}
    </div>
  );
}

function WeightCard() {
  const s = useJevara();
  const { premium, lang } = s;
  const id = lang === "id";
  const [w, setW] = useState("");
  const [bf, setBf] = useState("");
  const d = (premium?.weights || []).slice(-12);
  let chart: React.ReactNode;
  if (d.length < 2) {
    chart = (
      <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }} className="muted">
        {id ? "Simpan minimal 2 pengukuran untuk melihat tren." : "Save at least 2 measurements to view a trend."}
      </div>
    );
  } else {
    const W = 340, H = 150, p = 28;
    const ws = d.map((x) => x.w);
    const min = Math.min(...ws), max = Math.max(...ws);
    const rng = max - min || 1;
    const pts = d.map((x, i) => {
      const xx = p + (i * ((W - 2 * p) / (d.length - 1)));
      const yy = 15 + (H - 40) - ((x.w - min) / rng) * (H - 55);
      return `${xx},${yy}`;
    }).join(" ");
    const dots = d.map((x, i) => {
      const xx = p + (i * ((W - 2 * p) / (d.length - 1)));
      const yy = 15 + (H - 40) - ((x.w - min) / rng) * (H - 55);
      const dt = new Date(x.ts);
      return `<circle cx="${xx}" cy="${yy}" r="3.5" fill="#22d3ee"/><text x="${xx}" y="${H - 6}" text-anchor="middle" font-size="9" fill="#6b6b80">${dt.getDate()}/${dt.getMonth() + 1}</text>`;
    }).join("");
    chart = <div className="weight-chart" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:150px"><polyline fill="none" stroke="#22d3ee" stroke-width="2.5" points="${pts}"/>${dots}</svg>` }} />;
  }
  return (
    <div className="card">
      <div className="ctitle">{id ? "BERAT & KOMPOSISI TUBUH" : "BODY WEIGHT & COMPOSITION"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div className="field">
          <label>{id ? "Berat hari ini (kg)" : "Weight today (kg)"}</label>
          <input id="bwInput" type="number" inputMode="decimal" step="0.1" placeholder="93.0" value={w} onChange={(e) => setW(e.target.value)} />
        </div>
        <div className="field">
          <label>{id ? "Lemak tubuh % (opsional)" : "Body fat % (optional)"}</label>
          <input id="bfInput" type="number" inputMode="decimal" step="0.1" placeholder="25" value={bf} onChange={(e) => setBf(e.target.value)} />
        </div>
      </div>
      <button
        className="primary"
        style={{ width: "100%", marginBottom: 12 }}
        onClick={() => {
          s.addWeight(parseFloat(w), isNaN(parseFloat(bf)) ? null : parseFloat(bf));
          setW("");
          setBf("");
        }}
      >
        {id ? "SIMPAN PENGUKURAN" : "SAVE MEASUREMENT"}
      </button>
      {chart}
    </div>
  );
}

function PRCard() {
  const { premium, lang } = useJevara();
  const id = lang === "id";
  const arr = Object.keys(premium?.prs || {})
    .map((k) => ({ name: k, v: (premium as Premium).prs[k] }))
    .filter((x) => x.v && !x.v.baseline)
    .sort((a, b) => b.v.e1rm - a.v.e1rm)
    .slice(0, 8);
  return (
    <div className="card">
      <div className="ctitle">{id ? "REKOR PERFORMA · ESTIMASI 1RM" : "PERFORMANCE RECORDS · ESTIMATED 1RM"}</div>
      {arr.length === 0 && (
        <div className="muted">
          {id ? "Baseline sedang dibangun. Rekor akan muncul setelah ada performa pembanding yang valid." : "Baselines are being built. Records appear after valid comparable performance exists."}
        </div>
      )}
      {arr.map((x) => (
        <div className="pr-row" key={x.name}>
          <div>
            <b>{x.name}</b>
            <small>
              {x.v.kg} kg × {x.v.reps} reps
            </small>
          </div>
          <div className="prv">{x.v.metricType === "estimated_1rm" ? fmt(x.v.e1rm) + " kg" : id ? "Set terbaik" : "Best set"}</div>
        </div>
      ))}
    </div>
  );
}

function LiftCard() {
  const { log, curLift, setCurLift, lang } = useJevara();
  const id = lang === "id";
  const lift = LIFTS.find((l) => l.id === curLift) || LIFTS[0];
  const data: { w: number; v: number }[] = [];
  for (let w = 1; w <= 12; w++) {
    const ph2 = w <= 4 ? 1 : w <= 8 ? 2 : 3;
    const lw = w <= 4 ? w : w <= 8 ? w - 4 : w - 8;
    const m = (lift.m as Record<number, { d: string; e: string }>)[ph2];
    let best: number | null = null;
    for (let k = 0; k < 7; k++) {
      const v = parseFloat(String(log[`${ph2}_w${lw}_${m.d}_${m.e}_s${k}` + "_kg"] ?? ""));
      if (!isNaN(v) && v > 0) best = Math.max(best === null ? 0 : best, v);
    }
    if (best !== null) data.push({ w, v: best });
  }
  let chart: React.ReactNode;
  if (data.length >= 2) {
    const maxV = Math.max(...data.map((d) => d.v));
    const minV = Math.min(...data.map((d) => d.v));
    const rng = maxV - minV || 1;
    const W = 340, H = 160, pL = 40, pR = 10, pT = 10, pB = 26;
    const cW = W - pL - pR, cH = H - pT - pB;
    const pts = data.map((d) => `${pL + ((d.w - 1) / 11) * cW},${pT + cH - ((d.v - minV) / rng) * cH}`).join(" ");
    let grid = "";
    for (let ti = 0; ti <= 4; ti++) {
      const gy = pT + (cH / 4) * ti;
      const gv = Math.round(maxV - ((maxV - minV) / 4) * ti);
      grid += `<line x1='${pL}' y1='${gy}' x2='${W - pR}' y2='${gy}' stroke='#2a2a38' stroke-width='1'/><text x='${pL - 4}' y='${gy + 4}' text-anchor='end' font-size='10' fill='#6b6b80'>${gv}</text>`;
    }
    const dots = data.map((d) => {
      const x = pL + ((d.w - 1) / 11) * cW;
      const y = pT + cH - ((d.v - minV) / rng) * cH;
      return `<circle cx='${x}' cy='${y}' r='4' fill='${lift.c}'/><text x='${x}' y='${H - 4}' text-anchor='middle' font-size='10' fill='#6b6b80'>W${d.w}</text>`;
    }).join("");
    chart = (
      <div style={{ width: "100%", height: 160 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox='0 0 ${W} ${H}' style='width:100%;height:160px;overflow:visible'>${grid}<polyline fill='none' stroke='${lift.c}' stroke-width='2.5' stroke-linejoin='round' points='${pts}'/>${dots}</svg>` }} />
    );
  } else {
    chart = (
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--mu)", textAlign: "center" }}>
        {id ? (
          <>Isi beban minimal 2 minggu<br />untuk lihat grafik</>
        ) : (
          <>Log load for at least 2 weeks<br />to see the chart</>
        )}
      </div>
    );
  }
  return (
    <div className="card">
      <div className="ctitle">Progres Beban Utama</div>
      <div className="lftpills">
        {LIFTS.map((l) => (
          <button
            key={l.id}
            className="lftpill"
            style={{ background: curLift === l.id ? l.c : "var(--bg3)", color: curLift === l.id ? "#fff" : "var(--mu)" }}
            onClick={() => setCurLift(l.id)}
          >
            {l.n}
          </button>
        ))}
      </div>
      {chart}
    </div>
  );
}

function PhaseCard() {
  const { log } = useJevara();
  return (
    <div className="card">
      <div className="ctitle">Progres per Fase</div>
      {[1, 2, 3].map((ph) => {
        const pd = FOUNDATION[ph];
        let phT = 0,
          phD = 0;
        for (let ww = 1; ww <= 4; ww++) {
          DAYS.forEach((d) => {
            const dd = pd.days[d];
            if (!dd) return;
            dd.ex.forEach((ex, i) => {
              for (let k = 0; k < (ex.s || 0); k++) {
                phT++;
                if (log[`${ph}_w${ww}_${d}_${ex.id || "e" + i}_s${k}` + "_ok"]) phD++;
              }
            });
          });
        }
        const pp = phT > 0 ? Math.round((phD / phT) * 100) : 0;
        return (
          <div key={ph} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>
                {pd.l} — {pd.t}
              </span>
              <span style={{ fontWeight: 700, color: pd.c }}>{pp}%</span>
            </div>
            <div style={{ height: 7, background: "var(--bd)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pp + "%", background: pd.c, borderRadius: 99, transition: "width .6s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Progress() {
  return (
    <div id="t-prog">
      <ReadinessSpark />
      <RecoveryCard />
      <SessionHistory />
      <MuscleCard />
      <WeightCard />
      <PRCard />
      <LiftCard />
      <PhaseCard />
    </div>
  );
}
