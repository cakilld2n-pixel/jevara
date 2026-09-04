"use client";

import React, { useMemo } from "react";
import { useJevara } from "./store";
import { FOUNDATION, DAYS } from "@/data/foundation";
import type { SessionContext, Exercise } from "@/data/types";
import { fmt } from "@/lib/jevara/format";
import { techniqueMeta } from "@/lib/jevara/meta";
import { readinessScore, readinessAction } from "@/lib/iq/readiness";
import { iqLite, uiForStage } from "@/lib/iq/iqLite";
import { SessionClock } from "./Shell";

function usePrev(name: string) {
  const { premium } = useJevara();
  return useMemo(
    () => (premium?.events || []).find((e) => e.name === name && e.type !== "W" && e.kg > 0 && e.reps > 0) || null,
    [premium, name]
  );
}

function useExerciseIQ(name: string, target: string) {
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

function SpBox({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const c = pct === 100 ? "#34d399" : color || "#f97316";
  return (
    <div className="spbox">
      <div className="sprow">
        <span style={{ fontWeight: 600 }}>
          {done}/{total} set selesai
        </span>
        <span style={{ fontWeight: 700, color: c }}>{pct}% selesai</span>
      </div>
      <div className="btr">
        <div className="bfl" style={{ width: pct + "%", background: c }} />
      </div>
    </div>
  );
}

function ExerciseCard({ ex, i, ctx }: { ex: Exercise; i: number; ctx: SessionContext }) {
  const s = useJevara();
  const { log, lang } = s;
  const name = ex.n || ex.name || `Exercise ${i + 1}`;
  const sets = ex.s || 0;
  const target = ex.r || ex.reps || "—";
  const exId = ex.id || `e${i}`;
  const meta = techniqueMeta(name);
  const prev = usePrev(name);
  const q = useExerciseIQ(name, target);
  const ui = q ? uiForStage(q.stage) : null;

  const rirLabel = (v: string) => {
    if (v === "" || v === undefined) return "RIR";
    return `RIR ${v}`;
  };

  return (
    <div className="v095-ex">
      <div className="v095-ex-head">
        <div className="name">
          <b>{name}</b>
          <small>
            {sets} working sets • {target} reps • {meta.muscle}
          </small>
        </div>
        {prev ? (
          <span className="v095-prev">
            Last {fmt(prev.kg)}×{prev.reps}
          </span>
        ) : (
          <span className="v095-prev">No baseline</span>
        )}
      </div>
      {q && ui && (
        <div className="v095-iq">
          <div className="top">
            <div>
              <span className="state">
                ◆ {ui.title}
              </span>
              <div className="why">{q.why}</div>
            </div>
            <span className="conf">{q.confidence}% conf.</span>
          </div>
          {q.load !== null && <div className="next">Next target load ≈ {fmt(q.load)} kg</div>}
          <div className="why">WHY: {q.why}</div>
        </div>
      )}
      <div className="v095-sets">
        <div className="v095-set-head">
          <span>Set</span>
          <span>Prev</span>
          <span>kg</span>
          <span>reps</span>
          <span>Effort / RIR</span>
          <span>✓</span>
        </div>
        {Array.from({ length: sets }, (_, si) => {
          const key = ctx.key(i, si);
          const kg = String(log[key + "_kg"] ?? "");
          const rp = String(log[key + "_rp"] ?? "");
          const rir = log[key + "_rir"] === undefined ? "" : String(log[key + "_rir"]);
          const type = String(log[key + "_type"] ?? "N");
          const done = !!log[key + "_ok"];
          const prevTxt = prev ? `${fmt(prev.kg)}×${prev.reps}` : "—";
          return (
            <React.Fragment key={key}>
              <div className="v095-set">
                <span className="setnum">{si + 1}</span>
                <div className="prev-mini">{prevTxt}</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder={prev ? String(prev.kg) : "kg"}
                  value={kg}
                  onChange={(e) => s.saveLogState({ ...s.log, [key + "_kg"]: e.target.value })}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={prev ? String(prev.reps) : "reps"}
                  value={rp}
                  onChange={(e) => s.saveLogState({ ...s.log, [key + "_rp"]: e.target.value })}
                />
                <select value={rir} onChange={(e) => s.saveLogState({ ...s.log, [key + "_rir"]: e.target.value })}>
                  <option value="">RIR</option>
                  <option value="4">Easy · RIR4</option>
                  <option value="3">Moderate · RIR3</option>
                  <option value="2">Hard · RIR2</option>
                  <option value="1">Very hard · RIR1</option>
                  <option value="0">Near failure · RIR0</option>
                </select>
                <button
                  className={"donebtn " + (done ? "done" : "")}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    s.toggleSet(i, si, name, exId, kg, rp, rir, type);
                  }}
                >
                  {done ? "✓" : "○"}
                </button>
              </div>
              <div className="v095-advanced">
                <select
                  value={type}
                  onChange={(e) => s.saveLogState({ ...s.log, [key + "_type"]: e.target.value })}
                  style={{ width: 105, background: "var(--bg3)", color: "var(--tx)", border: "1px solid var(--bd)", borderRadius: 7, padding: 5 }}
                >
                  <option value="N">Working</option>
                  <option value="W">Warm-up</option>
                  <option value="D">Drop</option>
                  <option value="F">Failure</option>
                </select>
                <span style={{ fontSize: 9 }}>{rirLabel(rir)}</span>
                <button
                  className="v095-techbtn"
                  onClick={() =>
                    s.openOverlay(
                      `${name} • ${lang === "id" ? "Teknik" : "Technique"}`,
                      <TechniqueBody name={name} />
                    )
                  }
                >
                  Technique / Substitute →
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function TechniqueBody({ name }: { name: string }) {
  const s = useJevara();
  const m = techniqueMeta(name);
  return (
    <div>
      <div className="card">
        <div className="ctitle">{s.lang === "id" ? "Panduan Teknik" : "Technique Guide"}</div>
        <div className="tech-list">
          <div className="tech-line">
            <b>SETUP</b>
            {m.setup}
          </div>
          <div className="tech-line">
            <b>{s.lang === "id" ? "EKSEKUSI" : "EXECUTION"}</b>
            {m.cue}
          </div>
          <div className="tech-line">
            <b>{s.lang === "id" ? "KESALAHAN UMUM" : "COMMON MISTAKE"}</b>
            {m.mistake}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="ctitle">Substitusi Exercise</div>
        <div className="muted" style={{ marginBottom: 10 }}>
          {s.lang === "id"
            ? "Gunakan alternatif bila alat tidak tersedia, gerakan kurang nyaman, atau perlu variasi."
            : "Use an alternative when equipment is unavailable or the movement feels off."}
        </div>
        {m.subs.length ? (
          m.subs.map((x) => (
            <div className="history-row" key={x}>
              <div className="history-dot" />
              <div className="history-body">
                <b>{x}</b>
              </div>
            </div>
          ))
        ) : (
          <div className="muted">Belum ada substitusi terkurasi untuk exercise ini.</div>
        )}
      </div>
      <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => s.openSwapReason(name)}>
        {s.lang === "id" ? "GANTI LATIHAN" : "SWAP EXERCISE"}
      </button>
      {s.ap && (
        <button className="primary" style={{ width: "100%", marginTop: 8 }} onClick={() => s.openAutopilot()}>
          {s.lang === "id" ? "KEMBALI KE SESSION AUTOPILOT" : "BACK TO SESSION AUTOPILOT"}
        </button>
      )}
    </div>
  );
}

function WorkoutBody({ ctx }: { ctx: SessionContext }) {
  const s = useJevara();
  const { log, premium, activeSession, lang } = s;
  const exs = ctx.exs || [];
  const total = exs.reduce((a, x) => a + (x.s || 0), 0);
  const rd = (premium?.readiness || [])[0] || null;
  const score = readinessScore(rd);
  const rda = readinessAction(score);

  return (
    <div>
      <div className="v095-summary">
        <div className="row" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span className="stability-pill">{lang === "id" ? "SESI LATIHAN" : "TRAINING SESSION"}</span>
            <h3>
              {ctx.day} • {ctx.label}
            </h3>
            <p>
              {exs.length} exercises • {total} working sets • Kardio: {ctx.cardio}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <b>
              {s.doneCount}/{total}
            </b>
            <div className="muted">sets</div>
          </div>
        </div>
      </div>

      <div className="v095-action-card">
        <b className={`readiness-${rda.tone}`}>
          Readiness {score === null ? "—" : score + "/100"} • {rda.label}
        </b>
        <br />
        {rda.text}
      </div>

      <div className="v095-actions">
        {activeSession ? (
          <button className="secondary" onClick={() => s.handleFinish()}>
            FINISH WORKOUT
          </button>
        ) : (
          <button
            className="primary"
            onClick={() => {
              s.handleStart();
              setTimeout(() => s.openAutopilot(), 60);
            }}
          >
            START WORKOUT
          </button>
        )}
        <button className="autopilot-btn" onClick={() => s.openAutopilot()}>
          {lang === "id" ? "MODE TERPANDU" : "SESSION AUTOPILOT"}
        </button>
      </div>

      <SpBox done={s.doneCount} total={total} color={ctx.color} />

      {activeSession && (
        <div className="sessionbar">
          <span className="live" />
          <div className="sbbody">
            <b>Workout sedang berjalan</b>
            <small>
              <SessionClock startedAt={activeSession.startedAt} sets={s.doneCount} volume={s.volume} />
            </small>
          </div>
          <button className="finishbtn" onClick={() => s.handleFinish()}>
            FINISH
          </button>
        </div>
      )}
      {!activeSession && (
        <div className="sessionbar">
          <div className="sbbody">
            <b>Siap latihan?</b>
            <small>Mulai sesi untuk merekam durasi, volume, PR dan ringkasan.</small>
          </div>
          <button
            className="startbtn"
            onClick={() => {
              s.handleStart();
              setTimeout(() => s.openAutopilot(), 60);
            }}
          >
            START
          </button>
        </div>
      )}

      {exs.length === 0 && (
        <div className="v095-fatal">Program/session tidak memiliki exercise. Pilih program lain.</div>
      )}
      {exs.map((ex, i) => (
        <ExerciseCard key={`${ctx.key(i, 0)}-${ex.n || ex.name}`} ex={ex} i={i} ctx={ctx} />
      ))}

      <div className="ntbox">
        <div className="lbl">Catatan sesi</div>
        <textarea
          rows={2}
          placeholder="PR, teknik, rasa tidak nyaman, catatan lain..."
          value={String(log[ctx.noteKey] ?? "")}
          onChange={(e) => s.saveNote(e.target.value)}
        />
      </div>
    </div>
  );
}

export function Workout() {
  const s = useJevara();
  const { curPh, ctx } = s;
  const ph = FOUNDATION[curPh];

  if (s.activeCP) {
    const p = s.activeCP;
    const day = s.cpDay ?? p.sc[0];
    return (
      <div id="t-log">
        <div className="apbanner" style={{ background: p.c + "18", border: `1px solid ${p.c}44` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: p.c }}>
              {p.cat} • {p.lv}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{p.title}</div>
          </div>
          <button
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--bd)", background: "var(--bg3)", color: "var(--mu)" }}
            onClick={() => {
              s.setActiveCP(null);
            }}
          >
            Ganti
          </button>
        </div>
        <div className="apweeks">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              className="apwk"
              style={{ background: s.cpWk === w ? p.c : "var(--bg3)", color: s.cpWk === w ? "#fff" : "var(--mu)" }}
              onClick={() => s.setCpWk(w)}
            >
              Minggu {w}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(p.sc.length, 5)},1fr)`, gap: 5, marginBottom: 10 }}>
          {p.sc.map((d) => (
            <button
              key={d}
              className={"pill " + (day === d ? "on" : "")}
              style={day === d ? { background: p.c } : undefined}
              onClick={() => s.setCpDay(d)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
        {ctx ? <WorkoutBody ctx={ctx} /> : <div className="v095-fatal">Program ini gagal dimuat. Silakan pilih program lain.</div>}
      </div>
    );
  }

  return (
    <div id="t-log">
      <div className="program-active">
        <div className="pa-kicker">PROGRAM AKTIF</div>
        <h3>JEVARA 12-Week Foundation</h3>
        <p>3 fase • 12 minggu • 5 hari/minggu. Fondasi → Hipertrofi → Kekuatan + Definisi.</p>
      </div>
      <div className="g3">
        {[1, 2, 3].map((p) => {
          const P = FOUNDATION[p];
          return (
            <button
              key={p}
              className={"pill " + (p === curPh ? "on" : "")}
              style={p === curPh ? { background: P.c } : undefined}
              onClick={() => {
                s.setCurPh(p);
                s.setCurWk(1);
                s.setCurDay("Senin");
              }}
            >
              {P.l}
              <span className="s">{P.t}</span>
            </button>
          );
        })}
      </div>
      {ph && (
        <div className="pinfo" style={{ background: ph.c + "18", border: `1px solid ${ph.c}44` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ph.c }}>
              {ph.l} • {ph.w}
            </div>
            <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 2 }}>{ph.f}</div>
          </div>
          <span className="pbadge" style={{ background: ph.c + "22", color: ph.c }}>
            {ph.t}
          </span>
        </div>
      )}
      <div className="g4">
        {[1, 2, 3, 4].map((w) => (
          <button
            key={w}
            className={"pill " + (w === s.curWk ? "on" : "")}
            style={w === s.curWk && ph ? { background: ph.c } : undefined}
            onClick={() => s.setCurWk(w)}
          >
            Minggu {w}
          </button>
        ))}
      </div>
      <div className="g5">
        {DAYS.map((d) => {
          const dd = ph?.days[d];
          let t = 0,
            dn = 0;
          dd?.ex.forEach((ex, i) => {
            for (let k = 0; k < (ex.s || 0); k++) {
              t++;
              if (s.log[`${curPh}_w${s.curWk}_${d}_${ex.id || "e" + i}_s${k}` + "_ok"]) dn++;
            }
          });
          return (
            <button
              key={d}
              className={"pill " + (d === s.curDay ? "on" : "")}
              style={d === s.curDay && ph ? { background: ph.c } : undefined}
              onClick={() => s.setCurDay(d)}
            >
              {d.slice(0, 3)}
              {t > 0 && dn === t ? <span className="dot" /> : null}
            </button>
          );
        })}
      </div>
      {ctx ? <WorkoutBody ctx={ctx} /> : <div className="v095-fatal"><b>Workout gagal dimuat.</b><br />Silakan pilih ulang fase/hari.</div>}
    </div>
  );
}


