"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useJevara } from "./store";
import { fmt } from "@/lib/jevara/format";
import { iqLite, uiForStage } from "@/lib/iq/iqLite";
import { swapCandidates } from "@/lib/workout/swap";
import { swapReasonText } from "@/lib/jevara/meta";
import { TechniqueBody } from "./Workout";
import type { AutopilotSet } from "@/lib/workout/autopilot";

const SWAP_REASONS = [
  { k: "EQUIPMENT_BUSY", id: "Alat sedang dipakai", en: "Equipment busy" },
  { k: "NO_EQUIPMENT", id: "Alat tidak tersedia", en: "Equipment unavailable" },
  { k: "TOO_DIFFICULT", id: "Terlalu sulit hari ini", en: "Too difficult today" },
  { k: "FATIGUED", id: "Sedang lelah", en: "Feeling fatigued" },
  { k: "DISCOMFORT", id: "Gerakan kurang nyaman", en: "Movement feels uncomfortable" },
  { k: "PREFERENCE", id: "Ingin variasi", en: "Prefer another exercise" },
];

function useItemIQ(name: string, target: string) {
  const { premium } = useJevara();
  return useMemo(() => {
    if (!premium) return null;
    const events = (premium.events || [])
      .filter((e) => e.name === name)
      .map((e) => ({ sessionId: e.sessionId, kg: e.kg, reps: e.reps, rir: e.rir, ts: e.ts, type: e.type }));
    return iqLite({
      name,
      target,
      events,
      sessions: (premium.sessions || []).map((s) => ({ id: s.id, state: s.state })),
      readiness: (premium.readiness || [])[0] || null,
    });
  }, [premium, name, target]);
}

export function AutopilotBody() {
  const s = useJevara();
  const { ap, lang, log } = s;
  const [kg, setKg] = useState("");
  const [reps, setReps] = useState("");
  if (!ap) return <div className="muted">Tidak ada sesi terpandu aktif.</div>;
  const item = ap.sets[ap.pos];
  if (!item) return <div className="muted">Semua set selesai.</div>;
  return <AutopilotForm key={item.key} item={item} pos={ap.pos} total={ap.sets.length} kg={kg} setKg={setKg} reps={reps} setReps={setReps} />;
}

function AutopilotForm({
  item, pos, total, kg, setKg, reps, setReps,
}: {
  item: AutopilotSet;
  pos: number;
  total: number;
  kg: string;
  setKg: (v: string) => void;
  reps: string;
  setReps: (v: string) => void;
}) {
  const s = useJevara();
  const { lang, log, effort, setEffort } = s;
  const q = useItemIQ(item.name, item.target);
  const ui = q ? uiForStage(q.stage) : null;
  const prev = (s.premium?.events || []).find((e) => e.name === item.name && e.type !== "W" && e.kg > 0 && e.reps > 0) || null;

  const pickEffort = (v: string) => setEffort(v);

  return (
    <div className="ap95">
      <div className="ey">
        {pos + 1} / {total} {lang === "id" ? "SET" : "SETS"}
      </div>
      <h2>{item.name}</h2>
      <div className="sub">
        Set {item.setIndex + 1} • {lang === "id" ? "target " : "target "} {item.target} reps
      </div>
      <div className="target">
        <div className="muted">◆ JEVARA IQ</div>
        <b>{ui ? ui.title : "…"}</b>
        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
          {q && q.load !== null ? (
            <>
              {lang === "id" ? "Saran beban: " : "Suggested load: "}
              {fmt(q.load)} kg
            </>
          ) : lang === "id" ? (
            "Bangun baseline"
          ) : (
            "Establish baseline"
          )}
        </div>
        <div className="muted" style={{ marginTop: 5 }}>
          {ui?.desc}
        </div>
        <div className="muted" style={{ marginTop: 4 }}>
          {q ? (q.exposures < 3 ? `Baseline ${q.exposures}/3` : lang === "id" ? "Data cukup" : "Sufficient data") : ""}
        </div>
        <button
          className="focus-link"
          type="button"
          onClick={() =>
            s.openOverlay("JEVARA IQ", <WhyBody name={item.name} target={item.target} />)
          }
        >
          {lang === "id" ? "Mengapa?" : "Why?"}
        </button>
      </div>
      <div className="ap95-inputs">
        <div>
          <div className="muted">KG</div>
          <input
            id="apKg"
            type="number"
            inputMode="decimal"
            step="0.5"
            value={kg || String((log[item.key + "_kg"] as string) ?? "")}
            placeholder={prev ? String(prev.kg) : "kg"}
            onChange={(e) => setKg(e.target.value)}
          />
        </div>
        <div>
          <div className="muted">REPS</div>
          <input
            id="apRp"
            type="number"
            inputMode="numeric"
            value={reps || String((log[item.key + "_rp"] as string) ?? "")}
            placeholder={prev ? String(prev.reps) : "reps"}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>
      </div>
      <div className="muted" style={{ marginTop: 11 }}>
        {lang === "id" ? "Seberapa berat set ini?" : "How hard was that set?"}
      </div>
      <div className="effort-grid">
        {[
          ["4", lang === "id" ? "RINGAN" : "EASY", "RIR 4"],
          ["3", lang === "id" ? "SEDANG" : "MODERATE", "RIR 3"],
          ["2", lang === "id" ? "BERAT" : "HARD", "RIR 2"],
          ["0", lang === "id" ? "HAMPIR GAGAL" : "NEAR FAIL", "RIR 0"],
        ].map(([v, label, sub]) => (
          <button key={v} className={effort === v ? "on" : ""} onClick={() => pickEffort(v)}>
            {label}
            <br />
            <small>{sub}</small>
          </button>
        ))}
      </div>
      <button className="primary" style={{ width: "100%" }} onClick={() => s.autopilotDone(kg || String((log[item.key + "_kg"] as string) ?? ""), reps || String((log[item.key + "_rp"] as string) ?? ""))}>
        {lang === "id" ? "CATAT SET & LANJUT" : "LOG SET & CONTINUE"}
      </button>
      <button
        className="secondary"
        style={{ width: "100%", marginTop: 7 }}
        onClick={() => s.openOverlay(`${item.name} • ${lang === "id" ? "Teknik" : "Technique"}`, <TechniqueBody name={item.name} />)}
      >
        {lang === "id" ? "TEKNIK & GANTI LATIHAN" : "TECHNIQUE & SWAP"}
      </button>
    </div>
  );
}

export function WhyBody({ name, target }: { name: string; target: string }) {
  const s = useJevara();
  const q = useItemIQ(name, target);
  const ui = q ? uiForStage(q.stage) : null;
  if (!q || !ui) return <div className="muted">—</div>;
  const rd = q as unknown as { readiness?: { score?: number | null } };
  const rscore = (s.premium?.readiness?.[0] as unknown as { score?: number } | undefined)?.score;
  void rd;
  return (
    <div className="card">
      <div className="ctitle">{ui.title}</div>
      <div style={{ fontSize: 20, fontWeight: 900 }}>
        {q.load !== null ? fmt(q.load) + " kg" : s.lang === "id" ? "Baseline belum cukup" : "Baseline not ready"}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        {ui.desc}
      </div>
      <div className="iq-why" style={{ marginTop: 12 }}>
        <b>{s.lang === "id" ? "DASAR REKOMENDASI" : "RECOMMENDATION BASIS"}</b>
        <br />
        {s.lang === "id" ? "Exposure sebanding: " : "Comparable exposures: "}
        {q.exposures}
        <br />
        {s.lang === "id" ? "Kesiapan hari ini: " : "Today's readiness: "}
        {rscore === null || rscore === undefined ? "—" : rscore + "/100"}
        <br />
        {s.lang === "id" ? "Alasan: " : "Reason: "}
        {q.why}
      </div>
      <button className="primary" style={{ width: "100%", marginTop: 12 }} onClick={() => s.openAutopilot()}>
        {s.lang === "id" ? "KEMBALI KE LATIHAN" : "BACK TO WORKOUT"}
      </button>
    </div>
  );
}

export function AutopilotComplete() {
  const s = useJevara();
  return (
    <div className="session-summary">
      <h3>{s.lang === "id" ? "Semua set selesai ✓" : "All sets complete ✓"}</h3>
      <div className="muted">
        {s.lang === "id"
          ? "set valid tercatat. Selesaikan latihan untuk menyimpan sesi penuh."
          : "valid sets logged. Finish the workout to save the complete session."}
      </div>
      <button className="primary" style={{ width: "100%", marginTop: 12 }} onClick={() => s.handleFinish()}>
        {s.lang === "id" ? "SELESAIKAN LATIHAN" : "FINISH WORKOUT"}
      </button>
      <button
        className="secondary"
        style={{ width: "100%", marginTop: 8 }}
        onClick={() => {
          s.closeOverlay();
          s.goTab("log");
        }}
      >
        {s.lang === "id" ? "TINJAU SET" : "REVIEW SETS"}
      </button>
    </div>
  );
}

export function SwapReasonBody({ original }: { original: string }) {
  const s = useJevara();
  const [reason, setReason] = useState<string | null>(null);
  const id = s.lang === "id";
  if (!reason) {
    return (
      <div>
        <div className="card">
          <div className="ctitle">{id ? "Kenapa ingin mengganti?" : "Why do you want to swap?"}</div>
          <div className="muted">
            {id ? "Pilih alasan agar JEVARA memprioritaskan alternatif yang lebih relevan." : "Choose a reason so JEVARA can rank more relevant alternatives."}
          </div>
        </div>
        {SWAP_REASONS.map((r) => (
          <button key={r.k} className="secondary" style={{ width: "100%", margin: "0 0 8px" }} onClick={() => setReason(r.k)}>
            {id ? r.id : r.en}
          </button>
        ))}
        <button
          className="secondary"
          style={{ width: "100%", marginTop: 4 }}
          onClick={() => s.openOverlay(`${original} • ${id ? "Teknik" : "Technique"}`, <TechniqueBody name={original} />)}
        >
          {id ? "KEMBALI KE TEKNIK" : "BACK TO TECHNIQUE"}
        </button>
      </div>
    );
  }
  const cands = swapCandidates(original);
  return (
    <div>
      <div className="card">
        <div className="ctitle">{id ? "REKOMENDASI TERBAIK" : "BEST MATCHES"}</div>
        <div className="muted">
          {id
            ? "Beban latihan sebelumnya tidak akan disalin. Latihan pengganti akan memulai kalibrasi bila belum memiliki baseline."
            : "The previous exercise load will not be copied. A replacement starts calibration if no baseline exists."}
        </div>
      </div>
      {cands.length === 0 && (
        <div className="card">
          <div className="muted">{id ? "Belum ada alternatif otomatis yang sesuai." : "No suitable automatic replacement is available yet."}</div>
        </div>
      )}
      {cands.map((c, i) => (
        <div className="card" key={c}>
          <div className="ey">{i === 0 ? (id ? "PALING SESUAI" : "CLOSEST MATCH") : id ? "ALTERNATIF SESUAI" : "GOOD ALTERNATIVE"}</div>
          <div className="ctitle">{c}</div>
          <div className="muted">{swapReasonText(original, c, i, s.lang)}</div>
          <button className="primary" style={{ width: "100%", marginTop: 10 }} onClick={() => s.confirmSwap(original, c)}>
            {id ? "GUNAKAN LATIHAN INI" : "USE THIS EXERCISE"}
          </button>
        </div>
      ))}
      <button className="secondary" style={{ width: "100%" }} onClick={() => setReason(null)}>
        {id ? "ALASAN MENGGANTI LATIHAN" : "CHANGE REASON"}
      </button>
    </div>
  );
}

export function RestFullscreen() {
  const s = useJevara();
  const { restFull } = s;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!restFull) return;
    const iv = setInterval(() => {
      setNow(Date.now());
      const left = Math.max(0, Math.ceil((restFull.end - Date.now()) / 1000));
      if (left <= 0) {
        clearInterval(iv);
        setTimeout(() => s.finishRestFull(), 300);
      }
    }, 250);
    return () => clearInterval(iv);
  }, [restFull, s]);
  if (!restFull) return null;
  const left = Math.max(0, Math.ceil((restFull.end - now) / 1000));
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const id = s.lang === "id";
  const next = s.ap && s.ap.sets[s.ap.pos] ? `${s.ap.sets[s.ap.pos].name} • Set ${s.ap.sets[s.ap.pos].setIndex + 1} • target ${s.ap.sets[s.ap.pos].target} reps` : id ? "Set berikutnya siap." : "Next set ready.";
  return (
    <div className="autopilot-rest" id="je096RestOverlay" style={{ display: "flex", visibility: "visible" }}>
      <div className="rest-top">
        <b>{id ? "ISTIRAHAT" : "REST"}</b>
      </div>
      <div className="rest-body">
        <div className="focus-kicker">{id ? "SIAPKAN SET BERIKUTNYA" : "REST BEFORE NEXT SET"}</div>
        <div id="je096RestClock" className="rest-clock">
          {mm}:{ss}
        </div>
        <div className="rest-next">
          {id ? "Berikutnya" : "Next"}
          <br />
          <b style={{ color: "var(--tx)" }}>{next}</b>
        </div>
        <div className="rest-actions">
          <button onClick={() => s.adjustRestFull(-15)}>−15 {id ? "dtk" : "s"}</button>
          <button onClick={() => s.adjustRestFull(15)}>+15 {id ? "dtk" : "s"}</button>
          <button onClick={() => s.adjustRestFull(30)}>+30 {id ? "dtk" : "s"}</button>
        </div>
        <button className="primary skip" onClick={() => s.finishRestFull()}>
          {id ? "LEWATI ISTIRAHAT" : "SKIP REST"}
        </button>
      </div>
    </div>
  );
}
