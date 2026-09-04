"use client";

import React, { useState } from "react";
import { useJevara } from "./store";
import { t } from "@/lib/i18n";
import { fmt, greeting, firstNameOf } from "@/lib/jevara/format";
import { readinessScore, readinessAction } from "@/lib/iq/readiness";
import { iqLite, uiForStage } from "@/lib/iq/iqLite";
import { programById } from "@/lib/session/context";
import { PROGRAMS } from "@/data/programs";

function useHomeIQ() {
  const { ctx, premium, jevara } = useJevara();
  const first = ctx?.exs?.[0];
  if (!first || !premium) return { first: null as null | { n: string; r: string }, q: null as null | ReturnType<typeof iqLite> };
  const name = first.n || first.name || "";
  const target = first.r || first.reps || "8-12";
  const events = (premium.events || [])
    .filter((e) => e.name === name)
    .map((e) => ({ sessionId: e.sessionId, kg: e.kg, reps: e.reps, rir: e.rir, ts: e.ts, type: e.type }));
  const q = iqLite({
    name,
    target,
    events,
    sessions: (premium.sessions || []).map((s) => ({ id: s.id, state: s.state })),
    readiness: (premium.readiness || [])[0] || null,
  });
  return { first: { n: name, r: target }, q };
}

export function Home() {
  const s = useJevara();
  const { lang, ctx, premium, jevara, account, hydrated } = s;
  const rd = (premium?.readiness || [])[0] || null;
  const rs = readinessScore(rd);
  const rda = readinessAction(rs);
  const [editing, setEditing] = useState(false);
  const [eEnergy, setEEnergy] = useState(3);
  const [eSleep, setESleep] = useState(3);
  const [eSore, setESore] = useState(3);

  const desc = ctx
    ? `${ctx.label} • ${(ctx.exs || []).length} ${lang === "id" ? "latihan" : "exercises"} • ${(ctx.exs || []).reduce((a, x) => a + (x.s || 0), 0)} sets`
    : lang === "id"
      ? "Hari pemulihan"
      : "Recovery day";

  const { first, q } = useHomeIQ();
  const ui = q ? uiForStage(q.stage) : null;

  const openEditor = () => {
    if (editing) {
      setEditing(false);
      return;
    }
    setEEnergy(rd?.energy ?? 3);
    setESleep(rd?.sleep ?? 3);
    setESore(rd?.soreness ?? 3);
    setEditing(true);
  };

  const recId = jevara.profile?.recommendedProgram;
  const recProg = recId === "foundation" ? null : PROGRAMS.find((p) => p.id === recId) || programById(recId || "");

  return (
    <div id="t-dash">
      <div className="hero">
        <h2 suppressHydrationWarning>{hydrated ? `${greeting(lang, firstNameOf(account?.name))}.` : lang === "en" ? "Good afternoon." : "Selamat sore."}</h2>
        <p>
          {t(lang, "today")} • {desc}
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={() => s.goTab("log")}>
            {t(lang, "startWorkout")}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: 0 }}>
          <b>{t(lang, "readiness")}</b>
          <span>{rs === null ? "—" : rs + "/100"}</span>
        </div>
        <div className="compact-readiness">
          <div>
            <strong>
              ● {rs === null ? (lang === "id" ? "Belum dinilai" : "Not rated") : `${rs} · ${rda.label}`}
            </strong>
            <small>{rda.text}</small>
          </div>
          <button onClick={openEditor}>{lang === "id" ? "UBAH" : "EDIT"}</button>
        </div>
        {editing && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
              <div className="field">
                <label>
                  {t(lang, "energy")} 1–5
                </label>
                <input id="rdEnergy" type="number" min={1} max={5} value={eEnergy} onChange={(e) => setEEnergy(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>
                  {t(lang, "sleep")} 1–5
                </label>
                <input id="rdSleep" type="number" min={1} max={5} value={eSleep} onChange={(e) => setESleep(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>
                  {t(lang, "soreness")} 1–5
                </label>
                <input id="rdSore" type="number" min={1} max={5} value={eSore} onChange={(e) => setESore(Number(e.target.value))} />
              </div>
            </div>
            <button
              className="secondary"
              style={{ width: "100%" }}
              onClick={() => {
                s.saveReadiness(Math.max(1, Math.min(5, eEnergy || 3)), Math.max(1, Math.min(5, eSleep || 3)), Math.max(1, Math.min(5, eSore || 3)));
                setEditing(false);
              }}
            >
              {t(lang, "saveReadiness")}
            </button>
          </div>
        )}
      </div>

      <div className="card focus-iq">
        {q && first && ui ? (
          <>
            <div className="focus-kicker">◆ JEVARA IQ</div>
            <h3 style={{ fontSize: 23, margin: "8px 0 4px" }}>{ui.title}</h3>
            <div className="muted">{q.why}</div>
            {q.load !== null && (
              <div style={{ marginTop: 12 }}>
                <small className="muted">{t(lang, "nextDirection")}</small>
                <div style={{ fontSize: 20, fontWeight: 900 }}>
                  {fmt(q.load)} kg · {first.r} reps
                </div>
              </div>
            )}
            <button className="focus-link" onClick={() => s.goTab("tools")}>
              {t(lang, "why")} →
            </button>
          </>
        ) : (
          <>
            <div className="focus-kicker">◆ JEVARA IQ</div>
            <h3>{lang === "id" ? "Mulai membangun profil latihan" : "Build your training profile"}</h3>
            <div className="muted">
              {recProg ? (lang === "id" ? "Program awal: " : "Initial program: ") + recProg.title : ""}
              {recProg ? <br /> : null}
              {lang === "id"
                ? "Setelah beberapa sesi, rekomendasi beban dan repetisi akan semakin personal."
                : "After several sessions, load and rep recommendations will become more personal."}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
