"use client";

import React, { useEffect, useState } from "react";
import { useJevara, type TabId } from "./store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/jevara/format";

const TABS: { id: TabId; icon: string; key: string }[] = [
  { id: "dash", icon: "⌂", key: "home" },
  { id: "log", icon: "✓", key: "workout" },
  { id: "prog", icon: "↗", key: "progress" },
  { id: "pgm", icon: "▦", key: "programs" },
  { id: "tools", icon: "⚙", key: "tools" },
];

export function Header() {
  const { premium, jevara } = useJevara();
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (!saved) return;
    const tm = setTimeout(() => setSaved(""), 2000);
    return () => clearTimeout(tm);
  }, [saved]);
  const p = premium?.profile;
  const mini = p && p.weight && p.height && p.age ? `${p.weight}kg • ${p.height}cm • ${p.age}` : "";
  return (
    <div className="hdr">
      <div>
        <h1>JEVARA</h1>
        <div className="s">Train with Direction.</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="s" id="svSt" style={{ color: saved ? "#34d399" : undefined }}>
          {saved}
        </div>
        <div className="s" id="profileMini">
          {mini}
        </div>
      </div>
    </div>
  );
}

export function TabBar() {
  const { tab, goTab, lang } = useJevara();
  return (
    <div className="tabs">
      {TABS.map((tb) => (
        <button key={tb.id} data-tab={tb.id} className={tb.id === tab ? "on" : ""} onClick={() => goTab(tb.id)}>
          <span className="ico">{tb.icon}</span>
          {t(lang, tb.key)}
        </button>
      ))}
    </div>
  );
}

export function Overlay() {
  const { overlay, closeOverlay } = useJevara();
  const [tick, setTick] = useState(0);
  // re-render every second while overlay open (rest clock + session clock)
  useEffect(() => {
    if (!overlay) return;
    const iv = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(iv);
  }, [overlay]);
  if (!overlay) return null;
  void tick;
  return (
    <div className="overlay show" id="ov">
      <div className="ovhd">
        <button className="ovback" onClick={closeOverlay}>
          &#8592;
        </button>
        <div style={{ fontSize: 15, fontWeight: 800, flex: 1 }} id="ovTitle">
          {overlay.title}
        </div>
      </div>
      <div className="ovbody" id="ovBody">
        {overlay.body}
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useJevara();
  return (
    <div className={"toast" + (toast ? " show" : "")} id="toast">
      {toast?.msg || ""}
    </div>
  );
}

export function RestFloat() {
  const { rest, adjustRestFloat, toggleRestFloat, stopRestFloat } = useJevara();
  if (!rest) return null;
  return (
    <div className="timer-float show" id="restFloat">
      <div className="timer-ring" id="restRing">
        {rest.left}
      </div>
      <div className="timer-meta">
        <b>Rest Timer</b>
        <small id="restLabel">{rest.label ? `Set ${rest.label} selesai` : "Istirahat antar set"}</small>
      </div>
      <div className="timer-actions">
        <button onClick={() => adjustRestFloat(-15)}>−</button>
        <button onClick={toggleRestFloat} id="restPause">
          {rest.running ? "Ⅱ" : "▶"}
        </button>
        <button onClick={() => adjustRestFloat(15)}>+</button>
        <button onClick={stopRestFloat}>×</button>
      </div>
    </div>
  );
}

export function SessionClock({ startedAt, sets, volume }: { startedAt: number; sets: number; volume: number }) {
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const sec = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return (
    <span id="sessionClock">
      {mm}:{ss} · {sets} set · {fmt(volume)} kg
    </span>
  );
}
