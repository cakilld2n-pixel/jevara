"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Log, Premium, PremiumEvent, CanonicalSession, ReadinessEntry, PR } from "@/lib/storage/port";
import { getStorage } from "@/lib/storage/db";
import type { Program, SessionContext } from "@/data/types";
import { getSessionContext } from "@/lib/session/context";
import { startSession, completeSet, finishSession } from "@/lib/session/lifecycle";
import { createAutopilot, flattenSession, nextUnloggedPos, type AutopilotState } from "@/lib/workout/autopilot";
import { loadRest, saveRest, type RestState } from "@/lib/workout/rest";
import { applySwap } from "@/lib/workout/swap";
import { FinishConfirm, SessionSummaryView } from "./SessionFlows";
import { AutopilotBody, AutopilotComplete, SwapReasonBody } from "./Autopilot";
import { readinessScore } from "@/lib/iq/readiness";
import { updatePR, type PR as BaselinePR } from "@/lib/iq/baseline";
import { getLang as readLang, setLang as writeLang, type Lang } from "@/lib/i18n";

export type TabId = "dash" | "log" | "prog" | "pgm" | "tools";

export type OverlayData = { title: string; body: React.ReactNode } | null;

export type JevaraProfile = {
  goal: string;
  experience: string;
  days: number;
  duration: number;
  equipment: string;
  preference: string;
  focus: string;
  avoid: string;
  setup: string;
  recommendedProgram: string;
  weight?: number;
  height?: number;
  age?: number;
  bodyWeight?: number;
};

export type JevaraState = {
  version: string;
  onboarded: boolean;
  profile: JevaraProfile;
  entitlement: string;
  activation: string;
  events: { name: string; ts: number; meta?: Record<string, unknown> }[];
  feedback: { ts: number; iq: number; pay: string; note: string }[];
  errors?: { ts: number; scope: string; message: string }[];
};

export type Account = { name: string; id: string; type: string; guest: boolean; createdAt: number } | null;

export type CustomProgram = { id: string; title: string; createdAt: number; ex: { n: string; s: number; r: string }[] };

export type RestFloat = { left: number; running: boolean; label: string } | null;

const AUTH_KEY = "jevara_beta_account_v1";
const JKEY = "jevara_commercial_beta_091";
const SWAP_KEY = "jevara_rc32_swaps";
const AP_KEY = "jevara_autopilot_v099";
const REST_KEY = "jevara_rest_v099";

function readJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function defaultJevara(): JevaraState {
  return {
    version: "0.9.9",
    onboarded: false,
    profile: { goal: "", experience: "", days: 4, duration: 60, equipment: "fullgym", preference: "balanced", focus: "balanced", avoid: "", setup: "", recommendedProgram: "" },
    entitlement: "BETA PRO",
    activation: "",
    events: [],
    feedback: [],
  };
}

interface Store {
  lang: Lang;
  setLangFull: (l: Lang) => void;
  tab: TabId;
  goTab: (t: TabId) => void;
  curPh: number; setCurPh: (n: number) => void;
  curWk: number; setCurWk: (n: number) => void;
  curDay: string; setCurDay: (d: string) => void;
  activeCat: string; setActiveCat: (c: string) => void;
  curLift: string; setCurLift: (s: string) => void;
  activeCP: Program | null; setActiveCP: (p: Program | null) => void;
  cpWk: number; setCpWk: (n: number) => void;
  cpDay: string | null; setCpDay: (d: string | null) => void;
  log: Log; premium: Premium; jevara: JevaraState; account: Account;
  activeSession: CanonicalSession | null;
  ctx: SessionContext | null;
  saveLogState: (l: Log) => void;
  savePremiumState: (p: Premium) => void;
  saveJevaraState: (j: JevaraState) => void;
  track: (name: string, meta?: Record<string, unknown>) => void;
  toastMsg: (m: string) => void;
  toast: { msg: string; key: number } | null;
  overlay: OverlayData;
  openOverlay: (title: string, body: React.ReactNode) => void;
  closeOverlay: () => void;
  // session
  handleStart: () => void;
  handleFinish: (forceEarly?: boolean) => void;
  toggleSet: (exIndex: number, setIndex: number, name: string, exId: string, kg: string, reps: string, rir: string, type: string) => void;
  saveNote: (v: string) => void;
  doneCount: number;
  volume: number;
  // rest float
  rest: RestFloat;
  startRestFloat: (sec: number, label: string) => void;
  adjustRestFloat: (d: number) => void;
  toggleRestFloat: () => void;
  stopRestFloat: () => void;
  // readiness
  saveReadiness: (e: number, s: number, so: number) => void;
  // autopilot
  ap: AutopilotState | null;
  effort: string | null;
  setEffort: (v: string | null) => void;
  openAutopilot: () => void;
  autopilotDone: (kg: string, reps: string) => void;
  closeAutopilot: () => void;
  // rest fullscreen
  restFull: RestState | null;
  startRestFull: (sec?: number) => void;
  adjustRestFull: (d: number) => void;
  finishRestFull: () => void;
  // swap
  openSwapReason: (name: string) => void;
  confirmSwap: (original: string, replacement: string) => void;
  // misc
  addWeight: (w: number, bf: number | null) => void;
  setAccountState: (a: Account) => void;
  logout: () => void;
  hydrated: boolean;
  refresh: () => void;
  bump: number;
}

const Ctx = createContext<Store | null>(null);

export function useJevara(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useJevara outside provider");
  return s;
}

function initJevara(): JevaraState {
  try {
    const j = readJSON<Partial<JevaraState>>(JKEY, {});
    return { ...defaultJevara(), ...j, profile: { ...defaultJevara().profile, ...((j.profile as Partial<JevaraProfile>) || {}) } };
  } catch {
    return defaultJevara();
  }
}

export function JevaraProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => readLang());
  const [tab, setTab] = useState<TabId>("dash");
  const [curPh, setCurPh] = useState(1);
  const [curWk, setCurWk] = useState(1);
  const [curDay, setCurDay] = useState("Senin");
  const [activeCat, setActiveCat] = useState("Semua");
  const [curLift, setCurLift] = useState("dl");
  const [activeCP, setActiveCPState] = useState<Program | null>(null);
  const [cpWk, setCpWk] = useState(1);
  const [cpDay, setCpDay] = useState<string | null>(null);
  const [log, setLog] = useState<Log>(() => getStorage().loadLog());
  const [premium, setPremium] = useState<Premium>(() => getStorage().loadPremium());
  const [jevara, setJevara] = useState<JevaraState>(() => initJevara());
  const [account, setAccount] = useState<Account>(() => readJSON<Account>(AUTH_KEY, null));
  const [activeSession, setActiveSession] = useState<CanonicalSession | null>(() => getStorage().loadActiveSession());
  const [hydrated, setHydrated] = useState(false);
  const [overlay, setOverlay] = useState<OverlayData>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [rest, setRest] = useState<RestFloat>(null);
  const [ap, setAp] = useState<AutopilotState | null>(null);
  const [effort, setEffort] = useState<string | null>(null);
  const [restFull, setRestFull] = useState<RestState | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => setBump((b) => b + 1), []);

  const toastMsg = useCallback((m: string) => {
    setToast({ msg: m, key: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const openOverlay = useCallback((title: string, body: React.ReactNode) => {
    setOverlay({ title, body });
  }, []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  // init
  useEffect(() => {
    const rr = loadRest();
    if (rr) setRestFull(rr);
    setHydrated(true);
    // SW registration (prod only)
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister().catch(() => {}))).catch(() => {});
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
  }, []);

  const saveLogState = useCallback((l: Log) => {
    setLog(l);
    getStorage().saveLog(l);
  }, []);

  const savePremiumState = useCallback((p: Premium) => {
    setPremium(p);
    getStorage().savePremium(p);
  }, []);

  const saveJevaraState = useCallback((j: JevaraState) => {
    setJevara(j);
    writeJSON(JKEY, j);
  }, []);

  const track = useCallback((name: string, meta?: Record<string, unknown>) => {
    setJevara((prev) => {
      const next: JevaraState = { ...prev, events: [{ name, ts: Date.now(), meta }, ...prev.events].slice(0, 1000) };
      writeJSON(JKEY, next);
      return next;
    });
  }, []);

  const setLangFull = useCallback((l: Lang) => {
    setLang(l);
    writeLang(l);
  }, []);

  const goTab = useCallback((t: TabId) => {
    setTab(t);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const setActiveCP = useCallback((p: Program | null) => {
    setActiveCPState(p);
    if (p) setCpDay(p.sc[0]);
    else setCpDay(null);
    setCpWk(1);
  }, []);

  const ctx = useMemo(
    () => getSessionContext({ curPh, curWk, curDay, activeCP, cpWk, cpDay }),
    [curPh, curWk, curDay, activeCP, cpWk, cpDay]
  );

  const week = activeCP ? cpWk : curWk;

  const doneCount = useMemo(() => {
    if (!ctx) return 0;
    let n = 0;
    ctx.exs.forEach((ex, i) => {
      for (let s = 0; s < (ex.s || 0); s++) if (log[ctx.key(i, s) + "_ok"]) n++;
    });
    return n;
  }, [ctx, log]);

  const volume = useMemo(() => {
    if (!activeSession) return 0;
    return (premium?.events || [])
      .filter((e) => String(e.sessionId) === String(activeSession.id) && e.type !== "W")
      .reduce((a, e) => a + (Number(e.volume) || 0), 0);
  }, [premium, activeSession]);

  // ---- session actions ----
  const handleStart = useCallback(() => {
    if (!ctx) {
      toastMsg(lang === "id" ? "Workout belum tersedia" : "Workout is not available");
      return;
    }
    const { session, error } = startSession(ctx, week, activeSession);
    if (error) {
      toastMsg(error);
      return;
    }
    if (session) {
      setActiveSession(session);
      getStorage().saveActiveSession(session);
      track("workout_started", {});
      toastMsg(lang === "id" ? "Workout dimulai" : "Workout started");
    }
    refresh();
  }, [ctx, week, activeSession, lang, toastMsg, track, refresh]);

  const persistSessionList = useCallback(
    (s: CanonicalSession) => {
      setPremium((prev) => {
        if (!prev) return prev;
        const list = [s, ...prev.sessions.filter((x) => x.id !== s.id)].slice(0, 150);
        const next = { ...prev, sessions: list };
        getStorage().savePremium(next);
        return next;
      });
    },
    []
  );

  const handleFinish = useCallback(
    (forceEarly?: boolean) => {
      if (!activeSession) return;
      const expected = ctx?.expectedSets ?? activeSession.expectedSets ?? 0;
      const res = finishSession({
        active: activeSession,
        expected,
        done: doneCount,
        events: premium?.events || [],
        sessions: premium?.sessions || [],
        forceEarly,
      });
      if (res.needsConfirm) {
        openOverlay(
          lang === "id" ? "Sesi belum selesai" : "Session Incomplete",
          <FinishConfirm expected={expected} done={doneCount} />
        );
        return;
      }
      if (res.error) {
        toastMsg(res.error);
        return;
      }
      if (res.session) {
        persistSessionList(res.session);
        setActiveSession(null);
        getStorage().saveActiveSession(null);
        try {
          localStorage.removeItem(AP_KEY);
          localStorage.removeItem(REST_KEY);
        } catch {}
        setAp(null);
        setRestFull(null);
        track(res.session.state === "completed" ? "workout_completed" : "workout_ended_early", { sets: res.session.sets });
        openOverlay(
          lang === "id" ? "Latihan Selesai" : "Workout Complete",
          <SessionSummaryView session={res.session} />
        );
      }
      refresh();
    },
    [activeSession, ctx, doneCount, premium, lang, openOverlay, toastMsg, persistSessionList, track, refresh]
  );

  const toggleSet = useCallback(
    (exIndex: number, setIndex: number, name: string, exId: string, kg: string, reps: string, rir: string, type: string) => {
      if (!ctx) return;
      const key = ctx.key(exIndex, setIndex);
      const was = !!log[key + "_ok"];
      if (was) {
        const nl = { ...log };
        delete nl[key + "_ok"];
        saveLogState(nl);
        refresh();
        return;
      }
      const res = completeSet({ name, exerciseId: exId, key, kg, reps, rir, type, session: activeSession, log, events: premium?.events || [] });
      if (!res.ok) {
        toastMsg(res.error || "Validasi gagal");
        return;
      }
      const nl = res.newLog as Log;
      saveLogState(nl);
      if (res.newEvents && premium) {
        const np = { ...premium, events: res.newEvents };
        // PR check on newest event
        const ev = res.newEvents[0];
        if (ev && ev.kg > 0 && ev.reps > 0) {
          const r = updatePR(np.prs as unknown as Record<string, BaselinePR>, ev.name, ev.kg, ev.reps);
          np.prs = r.prs as unknown as Record<string, PR>;
          if (r.isPR) toastMsg("🏆 Personal Record baru!");
        }
        savePremiumState(np);
      }
      if (activeSession) {
        const vol = (res.newEvents || []).filter((e) => String(e.sessionId) === String(activeSession.id) && e.type !== "W").reduce((a, e) => a + (Number(e.volume) || 0), 0);
        const upd = { ...activeSession, volume: vol };
        setActiveSession(upd);
        getStorage().saveActiveSession(upd);
      }
      // auto rest float
      const autoRest = premium?.settings?.autoRest !== false;
      if (autoRest && !ap) {
        const base = Number(premium?.settings?.rest) || 90;
        startRestFloat(base, name);
      }
      refresh();
    },
    [ctx, log, premium, activeSession, ap, saveLogState, savePremiumState, toastMsg, refresh]
  );

  const saveNote = useCallback(
    (v: string) => {
      if (!ctx) return;
      saveLogState({ ...log, [ctx.noteKey]: v });
    },
    [ctx, log, saveLogState]
  );

  // ---- rest float ----
  const startRestFloat = useCallback(
    (sec: number, label: string) => {
      if (restTimer.current) clearInterval(restTimer.current);
      setRest({ left: Math.max(1, sec || 90), running: true, label });
      restTimer.current = setInterval(() => {
        setRest((prev) => {
          if (!prev || !prev.running) return prev;
          const left = prev.left - 1;
          if (left <= 0) {
            if (restTimer.current) clearInterval(restTimer.current);
            try {
              if (premium?.settings?.sound !== false) {
                const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (AC) {
                  const a = new AC();
                  const o = a.createOscillator();
                  const gn = a.createGain();
                  o.connect(gn);
                  gn.connect(a.destination);
                  o.frequency.value = 880;
                  gn.gain.setValueAtTime(0.08, a.currentTime);
                  o.start();
                  o.stop(a.currentTime + 0.18);
                }
              }
              if (premium?.settings?.vibrate !== false && navigator.vibrate) navigator.vibrate([100, 80, 100]);
            } catch {}
            toastMsg(lang === "id" ? "Rest selesai — lanjut set berikutnya" : "Rest over — next set");
            return null;
          }
          return { ...prev, left };
        });
      }, 1000);
    },
    [premium, lang, toastMsg]
  );

  const adjustRestFloat = useCallback((d: number) => {
    setRest((prev) => (prev ? { ...prev, left: Math.max(0, prev.left + d) } : prev));
  }, []);
  const toggleRestFloat = useCallback(() => {
    setRest((prev) => (prev ? { ...prev, running: !prev.running } : prev));
  }, []);
  const stopRestFloat = useCallback(() => {
    if (restTimer.current) clearInterval(restTimer.current);
    setRest(null);
  }, []);

  // ---- readiness ----
  const saveReadiness = useCallback(
    (e: number, s: number, so: number) => {
      if (!premium) return;
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const item: ReadinessEntry = { ts: Date.now(), energy: e, sleep: s, soreness: so, dateKey };
      const list = [...(premium.readiness || [])];
      const idx = list.findIndex((x) => {
        const d = new Date(x.ts);
        const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        return (x.dateKey || k) === dateKey;
      });
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      const np = { ...premium, readiness: list.slice(0, 60) };
      savePremiumState(np);
      const score = readinessScore(item);
      track("readiness_saved", { energy: e, sleep: s, soreness: so, score });
      toastMsg(lang === "id" ? "Kesiapan hari ini tersimpan" : "Today's readiness saved");
      refresh();
    },
    [premium, savePremiumState, track, toastMsg, lang, refresh]
  );

  // ---- autopilot ----
  const openAutopilot = useCallback(() => {
    if (!ctx) {
      toastMsg(lang === "id" ? "Workout belum tersedia" : "Workout is not available");
      return;
    }
    let sess = activeSession;
    if (!sess) {
      const { session, error } = startSession(ctx, week, null);
      if (error || !session) {
        toastMsg(error || "Gagal memulai sesi");
        return;
      }
      sess = session;
      setActiveSession(sess);
      getStorage().saveActiveSession(sess);
      track("workout_started", {});
    }
    const state = createAutopilot(ctx, log);
    setAp(state);
    setEffort(null);
    try {
      localStorage.setItem(AP_KEY, JSON.stringify({ sets: state.sets, pos: state.pos, savedAt: Date.now() }));
    } catch {}
    track("autopilot_started", { sets: state.sets.length });
    openOverlay(lang === "id" ? "Sesi Latihan" : "Workout Session", <AutopilotBody />);
    refresh();
  }, [ctx, week, activeSession, log, lang, toastMsg, track, openOverlay, refresh]);

  const closeAutopilot = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const autopilotDone = useCallback(
    (kg: string, reps: string) => {
      if (!ap || !ctx) return;
      const item = ap.sets[ap.pos];
      if (!item) return;
      if (!kg || !reps) {
        toastMsg(lang === "id" ? "Isi kg dan reps" : "Enter kg and reps");
        return;
      }
      const rir = effort === null ? "2" : effort;
      const key = item.key;
      const was = !!log[key + "_ok"];
      const nl = { ...log, [key + "_kg"]: kg, [key + "_rp"]: reps, [key + "_rir"]: rir, [key + "_type"]: "N" } as Log;
      if (!was) {
        nl[key + "_ok"] = true;
        const res = completeSet({ name: item.name, exerciseId: item.exerciseId, key, kg, reps, rir, type: "N", session: activeSession, log: nl, events: premium?.events || [] });
        if (res.newEvents && premium) {
          const np = { ...premium, events: res.newEvents };
          const ev = res.newEvents[0];
          if (ev && ev.kg > 0 && ev.reps > 0) {
            const r = updatePR(np.prs as unknown as Record<string, BaselinePR>, ev.name, ev.kg, ev.reps);
            np.prs = r.prs as unknown as Record<string, PR>;
            if (r.isPR) toastMsg("🏆 Personal Record baru!");
          }
          savePremiumState(np);
        }
      }
      saveLogState(nl);
      setEffort(null);
      const next = nextUnloggedPos(ap.sets, nl, ap.pos);
      if (next < 0) {
        track("autopilot_completed", { sets: ap.sets.length });
        try {
          localStorage.removeItem(REST_KEY);
        } catch {}
        openOverlay(lang === "id" ? "Sesi Latihan" : "Workout Session", <AutopilotComplete />);
        refresh();
        return;
      }
      const nap = { ...ap, pos: next };
      setAp(nap);
      try {
        localStorage.setItem(AP_KEY, JSON.stringify({ sets: nap.sets, pos: nap.pos, savedAt: Date.now() }));
      } catch {}
      closeOverlay();
      setTimeout(() => {
        startRestFull();
        openOverlay(lang === "id" ? "Sesi Latihan" : "Workout Session", <AutopilotBody />);
        refresh();
      }, 50);
      refresh();
    },
    [ap, ctx, log, effort, premium, activeSession, lang, toastMsg, saveLogState, savePremiumState, track, openOverlay, closeOverlay, refresh]
  );

  // ---- rest fullscreen ----
  const startRestFull = useCallback(
    (sec?: number) => {
      const base = sec || Number(premium?.settings?.rest) || 90;
      const st: RestState = { end: Date.now() + base * 1000, base };
      setRestFull(st);
      saveRest(st);
    },
    [premium]
  );
  const adjustRestFull = useCallback((d: number) => {
    setRestFull((prev) => {
      if (!prev) return prev;
      const next = { ...prev, end: prev.end + d * 1000 };
      if (next.end < Date.now()) next.end = Date.now();
      saveRest(next);
      return next;
    });
  }, []);
  const finishRestFull = useCallback(() => {
    setRestFull(null);
    saveRest(null);
    refresh();
  }, [refresh]);

  // ---- swap ----
  const openSwapReason = useCallback(
    (name: string) => {
      openOverlay(lang === "id" ? "Ganti Latihan" : "Swap Exercise", <SwapReasonBody original={name} />);
    },
    [lang, openOverlay]
  );

  const confirmSwap = useCallback(
    (original: string, replacement: string) => {
      if (!ap || !ctx) {
        toastMsg(lang === "id" ? "Swap hanya tersedia di Session Autopilot." : "Swap is available inside Session Autopilot.");
        return;
      }
      const { newCtx, changed, newLog } = applySwap(ctx, log as Record<string, unknown>, original, replacement);
      if (!changed) {
        toastMsg(lang === "id" ? "Tidak ada set yang dapat diganti." : "No sets to replace.");
        return;
      }
      // persist swap map
      try {
        const sig = [newCtx.programId, newCtx.context, newCtx.day].join("|");
        const raw = localStorage.getItem(SWAP_KEY);
        const all = raw ? JSON.parse(raw) : {};
        all[sig] = { ...(all[sig] || {}), [original]: replacement };
        localStorage.setItem(SWAP_KEY, JSON.stringify(all));
      } catch {}
      saveLogState(newLog as Log);
      // rebuild autopilot sets from fresh context but keep display names
      const fresh = getSessionContext({ curPh, curWk, curDay, activeCP, cpWk, cpDay });
      if (fresh) {
        const swapped = {
          ...fresh,
          exs: fresh.exs.map((ex) => {
            const nm = ex.n || ex.name || "";
            if (nm === original) return { ...ex, n: replacement, name: replacement, id: `swap_${replacement.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32)}` };
            return ex;
          }),
        };
        const sets = flattenSession(swapped);
        setAp({ ctx: swapped, sets, pos: Math.min(ap.pos, Math.max(0, sets.length - 1)) });
      }
      track("swap_confirmed", { original, replacement });
      toastMsg(lang === "id" ? "Latihan berhasil diganti." : "Exercise replaced.");
      openOverlay(lang === "id" ? "Sesi Latihan" : "Workout Session", <AutopilotBody />);
      refresh();
    },
    [ap, ctx, log, curPh, curWk, curDay, activeCP, cpWk, cpDay, lang, saveLogState, toastMsg, track, openOverlay, refresh]
  );

  // ---- account ----
  const setAccountState = useCallback((a: Account) => {
    setAccount(a);
    if (a) writeJSON(AUTH_KEY, a);
    else {
      try {
        localStorage.removeItem(AUTH_KEY);
      } catch {}
    }
  }, []);

  const logout = useCallback(() => {
    setAccount(null);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    toastMsg(lang === "id" ? "Keluar / Ganti Akun" : "Signed out");
  }, [toastMsg, lang]);

  // ---- weights ----
  const addWeight = useCallback(
    (w: number, bf: number | null) => {
      if (!premium) return;
      if (!w || w < 30 || w > 300) {
        toastMsg(lang === "id" ? "Masukkan berat badan yang valid" : "Enter a valid weight");
        return;
      }
      const np = {
        ...premium,
        weights: [...(premium.weights || []), { ts: Date.now(), w, bf }].slice(-180),
        profile: { ...premium.profile, weight: w },
      };
      savePremiumState(np);
      toastMsg(lang === "id" ? "Pengukuran tersimpan" : "Measurement saved");
      refresh();
    },
    [premium, savePremiumState, toastMsg, lang, refresh]
  );

  const value = useMemo<Store>(
    () => ({
      lang, setLangFull, tab, goTab,
      curPh, setCurPh: (n) => { setCurPh(n); }, curWk, setCurWk, curDay, setCurDay,
      activeCat, setActiveCat, curLift, setCurLift,
      activeCP, setActiveCP, cpWk, setCpWk, cpDay, setCpDay,
      log, premium: premium as Premium, jevara, account,
      activeSession, ctx,
      saveLogState, savePremiumState, saveJevaraState, track,
      toastMsg, toast, overlay, openOverlay, closeOverlay,
      handleStart, handleFinish, toggleSet, saveNote, doneCount, volume,
      rest, startRestFloat, adjustRestFloat, toggleRestFloat, stopRestFloat,
      saveReadiness,
      ap, effort, setEffort, openAutopilot, autopilotDone, closeAutopilot,
      restFull, startRestFull, adjustRestFull, finishRestFull,
      openSwapReason, confirmSwap,
      addWeight, setAccountState, logout, hydrated, refresh, bump,
    }),
    [lang, tab, curPh, curWk, curDay, activeCat, curLift, activeCP, cpWk, cpDay, log, premium, jevara, account, activeSession, ctx, toast, overlay, doneCount, volume, rest, ap, effort, restFull, hydrated, bump,
      setLangFull, goTab, setActiveCP, saveLogState, savePremiumState, saveJevaraState, track, toastMsg, openOverlay, closeOverlay, handleStart, handleFinish, toggleSet, saveNote, startRestFloat, adjustRestFloat, toggleRestFloat, stopRestFloat, saveReadiness, setEffort, openAutopilot, autopilotDone, closeAutopilot, startRestFull, adjustRestFull, finishRestFull, openSwapReason, confirmSwap, addWeight, setAccountState, logout, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
