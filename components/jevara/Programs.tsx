"use client";

import React from "react";
import { useJevara } from "./store";
import { PROGRAMS } from "@/data/programs";
import { CATS } from "@/data/foundation";
import type { Program } from "@/data/types";

export function ProgramDetail({ p }: { p: Program }) {
  const s = useJevara();
  return (
    <div>
      <div
        style={{
          background: p.c + "15",
          border: `1px solid ${p.c}40`,
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 14,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {p.goal}
      </div>
      {Object.keys(p.ss).map((d) => {
        const sess = p.ss[d];
        const exs = sess.ex || [];
        return (
          <div className="sessblock" key={d}>
            <div className="sesshd">
              <span style={{ fontSize: 13, fontWeight: 800 }}>{d}</span>
              <span style={{ fontSize: 11, color: "var(--mu)" }}>{sess.l}</span>
            </div>
            <div className="sexlist">
              {exs.map((ex, i) => (
                <div className="sexrow" key={i}>
                  <span style={{ flex: 1 }}>{ex.n}</span>
                  <span style={{ color: p.c, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {ex.s}x{ex.r}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: "8px 14px 12px", fontSize: 12, color: "var(--mu)" }}>
              <b style={{ color: "var(--rd)" }}>Kardio:</b> {sess.cd}
            </div>
          </div>
        );
      })}
      <button
        className="ovusebtn"
        style={{ background: p.c }}
        onClick={() => {
          s.setActiveCP(p);
          s.closeOverlay();
          s.goTab("log");
          s.toastMsg(p.title + (s.lang === "id" ? " dimuat!" : " loaded!"));
        }}
      >
        Gunakan Program Ini
      </button>
    </div>
  );
}

export function Programs() {
  const s = useJevara();
  const { activeCat } = s;
  const filtered = activeCat === "Semua" ? PROGRAMS : PROGRAMS.filter((p) => p.cat === activeCat);
  return (
    <div id="t-pgm">
      <div className="catscroll">
        {CATS.map((cat) => (
          <button key={cat} className={"cpill " + (activeCat === cat ? "on" : "")} onClick={() => s.setActiveCat(cat)}>
            {cat}
          </button>
        ))}
      </div>
      {activeCat === "Semua" && (
        <div className="progcard prog-feature">
          <div style={{ height: 4, background: "#3b82f6" }} />
          <div className="pgbody">
            <div className="pgtitle">JEVARA 12-Week Foundation</div>
            <div className="pgtags">
              <span className="ptag" style={{ background: "#3b82f622", color: "#60a5fa" }}>
                Rekomposisi
              </span>
              <span className="ptag">Menengah</span>
              <span className="ptag">12 Minggu</span>
              <span className="ptag">5 hari/minggu</span>
            </div>
            <div className="pggoal">Program utama 3 fase: Fondasi → Hipertrofi → Kekuatan + Definisi. Semua sesi dan exercise dapat dicatat.</div>
            <button
              className="usebtn"
              style={{ background: "#3b82f6" }}
              onClick={() => {
                s.setActiveCP(null);
                s.setCurPh(1);
                s.setCurWk(1);
                s.setCurDay("Senin");
                s.goTab("log");
                s.toastMsg("JEVARA 12-Week Foundation dimuat");
              }}
            >
              Gunakan Program Utama
            </button>
          </div>
        </div>
      )}
      {filtered.map((p) => (
        <div className="progcard" key={p.id}>
          <div style={{ height: 4, background: p.c }} />
          <div className="pgbody">
            <div className="pgtitle">{p.title}</div>
            <div className="pgtags">
              {[p.cat, p.lv, p.dur, `${p.nd} hari/minggu`].map((tg, i) => (
                <span key={i} className="ptag" style={i === 0 ? { background: p.c + "22", color: p.c } : undefined}>
                  {tg}
                </span>
              ))}
            </div>
            <div className="pggoal">{p.goal}</div>
            <button className="usebtn" style={{ background: p.c }} onClick={() => s.openOverlay(p.title, <ProgramDetail p={p} />)}>
              Lihat Detail &amp; Mulai
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
