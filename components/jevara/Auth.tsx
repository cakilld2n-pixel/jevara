"use client";

import React, { useState } from "react";
import { useJevara } from "./store";
import { recommendProgram } from "@/lib/profile/recommend";
import { programById } from "@/lib/session/context";
import { PROGRAMS } from "@/data/programs";
import { firstNameOf } from "@/lib/jevara/format";

function programMeta(id: string) {
  if (id === "foundation")
    return { id: "foundation", title: "JEVARA 12-Week Foundation", cat: "Rekomposisi", lv: "Beginner–Intermediate", dur: "12 Minggu", nd: 5, goal: "Fondasi → hipertrofi → kekuatan + definisi", c: "#3b82f6" };
  return programById(id);
}

// ---------- beta auth gate (blocking overlay) ----------
export function BetaAuthGate({ onAuthed }: { onAuthed: () => void }) {
  const s = useJevara();
  const id = s.lang === "id";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = () => {
    if (!name.trim() || !email.trim()) {
      alert(id ? "Isi nama dan email." : "Enter your name and email.");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      alert(id ? "Format email belum valid." : "Email format is not valid.");
      return;
    }
    s.setAccountState({ name: name.trim(), id: email.trim(), type: "email", guest: false, createdAt: Date.now() });
    s.track("account_created", { method: "email_local" });
    onAuthed();
  };
  const guest = () => {
    s.setAccountState({ name: id ? "Guest Beta" : "Beta Guest", id: "local-guest", type: "guest", guest: true, createdAt: Date.now() });
    onAuthed();
  };
  return (
    <div className="auth-overlay" id="authOverlay">
      <div className="auth-shell">
        <div className="auth-logo">JEVARA</div>
        <div className="auth-sub">
          Train with Direction.
          <br />
          {id ? "Buat profil beta lokal untuk menyimpan identitas pengguna di perangkat ini." : "Create a local beta profile to identify this user on this device."}
        </div>
        <div id="authForm">
          <div className="auth-field">
            <label>{id ? "Nama" : "Name"}</label>
            <input id="authName" autoComplete="name" placeholder={id ? "Nama Anda" : "Your name"} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input id="authId" type="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button style={{ width: "100%" }} id="authContinue" onClick={submit}>
            {id ? "LANJUTKAN" : "CONTINUE"}
          </button>
          <button className="secondary" style={{ width: "100%", marginTop: 7 }} id="authGuest" onClick={guest}>
            {id ? "COBA SEBAGAI GUEST" : "CONTINUE AS GUEST"}
          </button>
        </div>
        <div className="auth-note">
          {id
            ? "Login beta saat ini menyimpan profil di perangkat ini. Autentikasi server akan digunakan pada versi produksi."
            : "This beta stores the profile on this device. Server-backed authentication will be used for production."}
        </div>
      </div>
    </div>
  );
}

// ---------- onboarding wizard (je098) ----------
type ObData = { goal: string; experience: string; days: string; duration: string; equipment: string; preference: string; focus: string; avoid: string };

export function OnboardingWizard({ onDone }: { onDone?: () => void }) {
  const s = useJevara();
  const id = s.lang === "id";
  const p = s.jevara.profile;
  const [step, setStep] = useState<"form" | "rec" | "alt">("form");
  const [d, setD] = useState<ObData>({
    goal: p.goal || "recomp",
    experience: p.experience || "beginner",
    days: String(p.days || 4),
    duration: String(p.duration || 60),
    equipment: p.equipment || "fullgym",
    preference: p.preference || "balanced",
    focus: p.focus || "balanced",
    avoid: p.avoid || "",
  });
  const [rec, setRec] = useState<{ id: string; alternative: string; why: string[] } | null>(null);

  const set = (k: keyof ObData, v: string) => setD((prev) => ({ ...prev, [k]: v }));

  const finish = () => {
    const input = { goal: d.goal, experience: d.experience, days: parseInt(d.days) || 4, duration: parseInt(d.duration) || 60, equipment: d.equipment, preference: d.preference, focus: d.focus, avoid: d.avoid.trim() };
    const r = recommendProgram(input);
    const nj = {
      ...s.jevara,
      profile: { ...s.jevara.profile, ...input, setup: "adaptive-v1" as string, recommendedProgram: r.id },
      onboarded: true,
    };
    s.saveJevaraState(nj);
    s.track("adaptive_onboarding_completed", { goal: input.goal, experience: input.experience, days: input.days, equipment: input.equipment, recommendation: r.id });
    setRec(r);
    setStep("rec");
  };

  const activate = (pid: string) => {
    const nj = { ...s.jevara, profile: { ...s.jevara.profile, recommendedProgram: pid }, onboarded: true };
    s.saveJevaraState(nj);
    s.track("adaptive_program_accepted", { program: pid });
    if (pid === "foundation") {
      s.setActiveCP(null);
      s.setCurPh(1);
      s.setCurWk(1);
      s.setCurDay("Senin");
    } else {
      const pp = programById(pid);
      if (pp) s.setActiveCP(pp);
    }
    s.closeOverlay();
    s.goTab("log");
    s.toastMsg(id ? "Program rekomendasi diaktifkan" : "Recommended program activated");
    onDone?.();
  };

  if (step === "rec" && rec) {
    const pm = programMeta(rec.id);
    const alt = programMeta(rec.alternative);
    if (!pm) return null;
    return (
      <div className="adaptive-result">
        <div className="focus-kicker">◆ JEVARA IQ · INITIAL PROFILE</div>
        <h2>{pm.title}</h2>
        <div className="pgtags">
          <span className="ptag">{pm.cat}</span>
          <span className="ptag">{pm.lv}</span>
          <span className="ptag">{pm.dur}</span>
          <span className="ptag">
            {pm.nd} {id ? "hari/minggu" : "days/week"}
          </span>
        </div>
        <p>{pm.goal}</p>
        <div className="whybox">
          <b>{id ? "Mengapa program ini?" : "Why this program?"}</b>
          {rec.why.map((x, i) => (
            <div key={i}>• {x}</div>
          ))}
        </div>
        <div className="confidence-note">
          {id
            ? "Rekomendasi awal dibuat dari profil Anda. JEVARA IQ akan menyesuaikannya setelah mempelajari latihan dan kesiapan harian Anda."
            : "Initial confidence is profile-based. JEVARA IQ will learn from your actual load, reps, RIR, completion, readiness and progress."}
        </div>
        <button className="primary" style={{ width: "100%", marginTop: 14 }} onClick={() => activate(pm.id)}>
          {id ? "GUNAKAN PROGRAM INI" : "USE THIS PROGRAM"}
        </button>
        {alt && (
          <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => setStep("alt")}>
            {id ? "LIHAT ALTERNATIF" : "SEE ALTERNATIVE"}
          </button>
        )}
        <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => { s.closeOverlay(); s.goTab("pgm"); onDone?.(); }}>
          {id ? "PILIH SENDIRI" : "CHOOSE MYSELF"}
        </button>
      </div>
    );
  }

  if (step === "alt" && rec) {
    const pm = programMeta(rec.alternative);
    if (!pm) return null;
    return (
      <div className="adaptive-result">
        <div className="focus-kicker">◆ ALTERNATIVE</div>
        <h2>{pm.title}</h2>
        <p>{pm.goal}</p>
        <div className="pgtags">
          <span className="ptag">{pm.lv}</span>
          <span className="ptag">{pm.dur}</span>
          <span className="ptag">
            {pm.nd} {id ? "hari/minggu" : "days/week"}
          </span>
        </div>
        <button className="primary" style={{ width: "100%", marginTop: 14 }} onClick={() => activate(pm.id)}>
          {id ? "GUNAKAN ALTERNATIF" : "USE ALTERNATIVE"}
        </button>
        <button className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => setStep("form")}>
          {id ? "UBAH JAWABAN" : "CHANGE ANSWERS"}
        </button>
      </div>
    );
  }

  const sel = (label: string, value: string, opts: [string, string][], k: keyof ObData) => (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => set(k, e.target.value)}>
        {opts.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="adaptive-intro">
        <div className="focus-kicker">◆ JEVARA IQ · INITIAL PROFILE</div>
        <h2>{id ? "Bukan sekadar pertanyaan." : "Not just a questionnaire."}</h2>
        <p>{id ? "Setiap jawaban di bawah memengaruhi program awal yang direkomendasikan." : "Every answer below influences your initial program recommendation."}</p>
      </div>
      {sel(id ? "Tujuan utama" : "Primary goal", d.goal, [["recomp", "Recomposition"], ["fatloss", "Fat Loss"], ["muscle", "Muscle Gain"], ["strength", "Strength"], ["fitness", "General Fitness"]], "goal")}
      {sel(id ? "Pengalaman latihan" : "Training experience", d.experience, [["beginner", id ? "Pemula · <1 tahun" : "Beginner · <1 year"], ["intermediate", id ? "Menengah · 1–3 tahun" : "Intermediate · 1–3 years"], ["advanced", id ? "Lanjutan · 3+ tahun" : "Advanced · 3+ years"]], "experience")}
      {sel(id ? "Hari latihan per minggu" : "Training days per week", d.days, [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"]], "days")}
      {sel(id ? "Waktu per sesi" : "Time per session", d.duration, [["40", "30–45 min"], ["60", "45–60 min"], ["80", "60–90 min"]], "duration")}
      {sel(id ? "Peralatan" : "Equipment", d.equipment, [["fullgym", "Full Gym"], ["homegym", "Home Gym"], ["dumbbell", "Dumbbell Only"], ["bodyweight", "Bodyweight"]], "equipment")}
      {sel(id ? "Preferensi" : "Preference", d.preference, [["balanced", id ? "Seimbang / tidak ada preferensi" : "Balanced / no preference"], ["machine", "Machine"], ["freeweight", "Free Weight"]], "preference")}
      {sel(id ? "Prioritas tubuh" : "Body focus", d.focus, [["balanced", "Balanced"], ["upper", "Upper Body"], ["lower", "Lower Body"], ["chestback", "Chest + Back"], ["shoulderarms", "Shoulders + Arms"]], "focus")}
      <div className="field">
        <label>{id ? "Gerakan yang ingin dihindari (opsional)" : "Movements to avoid (optional)"}</label>
        <input placeholder={id ? "Contoh: overhead press" : "Example: overhead press"} value={d.avoid} onChange={(e) => set("avoid", e.target.value)} />
      </div>
      <div className="auth-note">
        {id ? "Catatan: pilihan “hindari” adalah preferensi latihan, bukan diagnosis atau evaluasi medis." : "Note: “avoid” is a training preference, not a medical diagnosis or assessment."}
      </div>
      <button className="primary" style={{ width: "100%", marginTop: 14 }} onClick={finish}>
        {id ? "LIHAT REKOMENDASI SAYA" : "SHOW MY RECOMMENDATION"}
      </button>
    </div>
  );
}

export function openOnboardingOverlay(s: { openOverlay: (t: string, b: React.ReactNode) => void; lang: "id" | "en" }) {
  s.openOverlay(s.lang === "id" ? "Kenali Cara Anda Berlatih" : "Tell Us How You Train", <OnboardingWizard />);
}

// ---------- license / beta dashboard / feedback ----------

export function LicenseBody() {
  const s = useJevara();
  const [code, setCode] = useState(s.jevara.activation || "");
  return (
    <div>
      <div className="card">
        <div className="ctitle">Beta entitlement</div>
        <div className="ent-card">
          <div>
            <b>{s.jevara.entitlement}</b>
            <div className="muted">Semua fitur intelligence terbuka selama Commercial Beta.</div>
          </div>
          <span className="ent-badge">ACTIVE</span>
        </div>
      </div>
      <div className="card">
        <div className="ctitle">Activation simulation</div>
        <div className="field">
          <label>Activation code</label>
          <input id="actCode" placeholder="JEV-CORE-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <button
          className="primary"
          style={{ width: "100%" }}
          onClick={() => {
            const v = code.trim().toUpperCase();
            if (!v) {
              s.toastMsg(s.lang === "id" ? "Masukkan activation code" : "Enter activation code");
              return;
            }
            const nj = { ...s.jevara, activation: v, entitlement: v.includes("PRO") ? "PRO" : "CORE" };
            s.saveJevaraState(nj);
            s.track("core_activated", { tier: nj.entitlement });
            s.closeOverlay();
            s.toastMsg("JEVARA " + nj.entitlement + (s.lang === "id" ? " aktif" : " active"));
          }}
        >
          Activate
        </button>
        <div className="muted" style={{ marginTop: 9 }}>
          Beta ini belum memakai server lisensi. Production release harus memvalidasi entitlement secara server-side.
        </div>
      </div>
    </div>
  );
}

export function BetaDashboardBody() {
  const s = useJevara();
  const id = s.lang === "id";
  const ev = s.jevara.events || [];
  const started = ev.filter((x) => x.name === "workout_started").length;
  const completed = ev.filter((x) => x.name === "workout_completed").length;
  const iq = ev.filter((x) => x.name === "iq_viewed").length;
  const completion = started ? Math.round((completed / started) * 100) : 0;
  return (
    <div>
      <div className="card commercial-hero">
        <div className="ctitle">Commercial Beta 0.9</div>
        <h3>Validation Dashboard</h3>
        <div className="muted">Local analytics on this device only. Aggregate multi-user analytics requires a privacy-aware backend.</div>
      </div>
      <div className="card">
        <div className="beta-metrics">
          <div className="beta-metric">
            <b>{started}</b>
            <small>WORKOUT STARTED</small>
          </div>
          <div className="beta-metric">
            <b>{completed}</b>
            <small>WORKOUT COMPLETED</small>
          </div>
          <div className="beta-metric">
            <b>{completion}%</b>
            <small>SESSION COMPLETION</small>
          </div>
          <div className="beta-metric">
            <b>{ev.length}</b>
            <small>BETA EVENTS</small>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="ctitle">Validation targets</div>
        <div className="muted">Week-4 retention ≥35% • ≥3 workouts/active user/week • JEVARA IQ usefulness ≥60% • recommendation acceptance ≥50% • Core willingness-to-pay ≥30%.</div>
      </div>
      <button className="primary" style={{ width: "100%" }} onClick={() => s.openOverlay("Beta Feedback", <BetaFeedbackBody />)}>
        Record Beta Feedback
      </button>
      <span style={{ display: "none" }}>{iq}</span>
    </div>
  );
}

export function BetaFeedbackBody() {
  const s = useJevara();
  const [iq, setIq] = useState("5");
  const [pay, setPay] = useState("Ya");
  const [note, setNote] = useState("");
  return (
    <div className="card">
      <div className="field">
        <label>JEVARA IQ usefulness (1–5)</label>
        <select id="fbIQ" value={iq} onChange={(e) => setIq(e.target.value)}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
      </div>
      <div className="field">
        <label>Bersedia membeli Core Rp149.000?</label>
        <select id="fbPay" value={pay} onChange={(e) => setPay(e.target.value)}>
          <option>Ya</option>
          <option>Mungkin</option>
          <option>Tidak</option>
        </select>
      </div>
      <div className="field">
        <label>Bagian paling berguna / membingungkan</label>
        <input id="fbNote" placeholder="Tulis singkat..." value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button
        className="primary"
        style={{ width: "100%" }}
        onClick={() => {
          const nj = { ...s.jevara, feedback: [{ ts: Date.now(), iq: parseInt(iq), pay, note }, ...(s.jevara.feedback || [])] };
          s.saveJevaraState(nj);
          s.track("beta_feedback_saved", { iq: parseInt(iq), pay });
          s.closeOverlay();
          s.toastMsg(s.lang === "id" ? "Feedback beta tersimpan" : "Beta feedback saved");
        }}
      >
        Save Feedback
      </button>
    </div>
  );
}

export function CommercialCard() {
  const s = useJevara();
  return (
    <div className="card commercial-hero">
      <div className="row" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div className="ctitle">JEVARA</div>
          <b>Train with Direction.</b>
          <div className="muted" style={{ marginTop: 5 }}>
            Catat latihan. Pahami progres. Ketahui langkah berikutnya.
          </div>
        </div>
        <span className="ent-badge">{s.jevara.entitlement}</span>
      </div>
      <button className="secondary" style={{ width: "100%", marginTop: 10 }} onClick={() => s.openOverlay("JEVARA Access", <LicenseBody />)}>
        Access &amp; Activation
      </button>
      <button suppressHydrationWarning className="secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => { s.track("founder_dashboard_viewed"); s.openOverlay("Founder • Beta Dashboard", <BetaDashboardBody />); }}>
        Beta Dashboard{s.hydrated && firstNameOf(s.account?.name) ? ` • ${firstNameOf(s.account?.name)}` : ""}
      </button>
    </div>
  );
}
