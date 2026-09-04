"use client";

import React, { useRef, useState } from "react";
import { useJevara, type CustomProgram } from "./store";
import { t } from "@/lib/i18n";
import { fmt, localDate, authMaskEmail } from "@/lib/jevara/format";
import { calcE1RM } from "@/lib/iq/e1rm";
import { backupToJson, parseBackupJson } from "@/lib/backup";
import { OnboardingWizard } from "./Auth";
import { PROGRAMS } from "@/data/programs";

// ---------- overlays ----------

export function CalcBody({ type }: { type: "1rm" | "plate" }) {
  const s = useJevara();
  const id = s.lang === "id";
  const [kg, setKg] = useState("");
  const [rp, setRp] = useState("");
  const [target, setTarget] = useState("");
  const [bar, setBar] = useState("20");
  const [result, setResult] = useState<React.ReactNode>(null);

  if (type === "1rm") {
    return (
      <div className="card">
        <div className="ctitle">Estimated 1RM • Epley</div>
        <div className="field">
          <label>Beban (kg)</label>
          <input id="cKg" type="number" step="0.5" placeholder="80" value={kg} onChange={(e) => setKg(e.target.value)} />
        </div>
        <div className="field">
          <label>Repetisi</label>
          <input id="cRp" type="number" placeholder="8" value={rp} onChange={(e) => setRp(e.target.value)} />
        </div>
        <button
          className="primary"
          style={{ width: "100%" }}
          onClick={() => {
            const e = calcE1RM(parseFloat(kg) || 0, parseInt(rp) || 0);
            setResult(
              <div className="kpirow">
                <div className="kpi">
                  <b>{fmt(e)}</b>
                  <small>e1RM kg</small>
                </div>
                <div className="kpi">
                  <b>{fmt(e * 0.9)}</b>
                  <small>90% TM</small>
                </div>
                <div className="kpi">
                  <b>{fmt(e * 0.8)}</b>
                  <small>80% e1RM</small>
                </div>
              </div>
            );
          }}
        >
          Hitung
        </button>
        <div id="cResult">{result}</div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="ctitle">Barbell Plate Calculator</div>
      <div className="field">
        <label>Target total (kg)</label>
        <input id="pTarget" type="number" step="0.5" placeholder="100" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div className="field">
        <label>Berat bar (kg)</label>
        <input id="pBar" type="number" value={bar} onChange={(e) => setBar(e.target.value)} />
      </div>
      <button
        className="primary"
        style={{ width: "100%" }}
        onClick={() => {
          const t = parseFloat(target) || 0;
          const b = parseFloat(bar) || 20;
          const side = (t - b) / 2;
          if (side < 0) {
            setResult(<div className="muted" style={{ marginTop: 12 }}>Target lebih ringan dari bar.</div>);
            return;
          }
          const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
          const res: string[] = [];
          let rem = side;
          plates.forEach((p) => {
            const n = Math.floor((rem + 0.001) / p);
            if (n) {
              res.push(`${n} × ${p}kg`);
              rem -= n * p;
            }
          });
          setResult(
            <div className="card" style={{ marginTop: 12, background: "var(--bg3)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Per sisi bar</div>
              <div style={{ fontSize: 18, fontWeight: 850, color: "var(--em)" }}>{res.join(" + ") || "Tanpa plate"}</div>
              <div className="muted" style={{ marginTop: 7 }}>
                Sisa {fmt(rem)} kg per sisi.
              </div>
            </div>
          );
        }}
      >
        Hitung Plate
      </button>
      <div id="pResult">{result}</div>
    </div>
  );
}

export function BackupBody() {
  const s = useJevara();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const doExport = () => {
    const json = backupToJson(s.log as Record<string, unknown>, s.premium);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jevara-beta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    s.toastMsg(s.lang === "id" ? "Backup dibuat" : "Backup created");
  };
  const doReset = () => {
    if (!confirm(s.lang === "id" ? "Hapus seluruh data latihan di perangkat ini?" : "Delete all workout data on this device?")) return;
    try {
      localStorage.removeItem("jevara_log_v2");
      localStorage.removeItem("jevara_premium_v2");
      localStorage.removeItem("jevara_active_session_v2");
      localStorage.removeItem("gym_v6");
      localStorage.removeItem("gym_iqbal_premium_v3");
    } catch {}
    window.location.reload();
  };
  return (
    <div className="card">
      <div className="ctitle">Data Management</div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Backup mencakup log set, beban, repetisi, PR, berat badan, settings, dan riwayat premium.
      </p>
      <button className="primary" style={{ width: "100%", marginBottom: 8 }} onClick={doExport}>
        Export Backup JSON
      </button>
      <button className="secondary" style={{ width: "100%", marginBottom: 8 }} onClick={() => fileRef.current?.click()}>
        Import Backup JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            try {
              const x = JSON.parse(String(r.result));
              if (!x.log || !x.premium) throw new Error("format");
              s.saveLogState(x.log);
              s.savePremiumState(x.premium);
              if (x.jevara) s.saveJevaraState({ ...s.jevara, ...x.jevara });
              s.closeOverlay();
              s.goTab("dash");
              s.toastMsg(s.lang === "id" ? "Backup berhasil dipulihkan" : "Backup restored");
            } catch {
              s.toastMsg(s.lang === "id" ? "File backup tidak valid" : "Invalid backup file");
            }
          };
          r.readAsText(f);
          e.target.value = "";
        }}
      />
      <button className="secondary" style={{ width: "100%", borderColor: "rgba(239,68,68,.4)", color: "var(--rd)" }} onClick={doReset}>
        Reset Semua Data
      </button>
    </div>
  );
}

export function BuilderBody() {
  const s = useJevara();
  const [name, setName] = useState("");
  const [rows, setRows] = useState([{ n: "", s: "3", r: "8-12" }, { n: "", s: "3", r: "8-12" }, { n: "", s: "3", r: "8-12" }]);
  return (
    <div className="card">
      <div className="ctitle">Create Simple Workout</div>
      <div className="field">
        <label>Nama program</label>
        <input id="pbName" placeholder="Upper A" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div id="pbRows">
        {rows.map((row, i) => (
          <div className="program-builder-row" key={i}>
            <input placeholder="Exercise" value={row.n} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, n: e.target.value } : x)))} />
            <input type="number" min={1} placeholder="Sets" value={row.s} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, s: e.target.value } : x)))} />
            <input placeholder="8-12" value={row.r} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, r: e.target.value } : x)))} />
          </div>
        ))}
      </div>
      <button className="secondary" style={{ width: "100%", marginBottom: 8 }} onClick={() => setRows([...rows, { n: "", s: "3", r: "8-12" }])}>
        + Add Exercise
      </button>
      <button
        className="primary"
        style={{ width: "100%" }}
        onClick={() => {
          const title = (name || "Custom Workout").trim();
          const ex = rows.filter((r) => r.n.trim()).map((r) => ({ n: r.n.trim(), s: parseInt(r.s) || 3, r: r.r || "8-12" }));
          if (!ex.length) {
            s.toastMsg(s.lang === "id" ? "Tambahkan minimal 1 exercise" : "Add at least 1 exercise");
            return;
          }
          const cp: CustomProgram = { id: "custom_" + Date.now(), title, createdAt: Date.now(), ex };
          const np = { ...s.premium, customPrograms: [cp, ...(s.premium?.customPrograms || [])] };
          s.savePremiumState(np as typeof s.premium);
          s.closeOverlay();
          s.toastMsg(s.lang === "id" ? "Custom program tersimpan" : "Custom program saved");
          s.refresh();
        }}
      >
        Save Program
      </button>
    </div>
  );
}

export function CoachSettingsBody() {
  const s = useJevara();
  const [auto, setAuto] = useState(s.premium?.settings?.autoProgression !== false ? "on" : "off");
  const [deload, setDeload] = useState(s.premium?.settings?.deloadSensitivity || "balanced");
  return (
    <div className="card">
      <div className="ctitle">Coach Behavior</div>
      <div className="field">
        <label>Auto Progression</label>
        <select id="acsAuto" value={auto} onChange={(e) => setAuto(e.target.value)}>
          <option value="on">Aktif</option>
          <option value="off">Nonaktif</option>
        </select>
      </div>
      <div className="field">
        <label>Deload Sensitivity</label>
        <select id="acsDeload" value={deload} onChange={(e) => setDeload(e.target.value)}>
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
      <div className="muted">
        Coach memakai histori latihan, RIR, readiness, e1RM, dan volume sebagai konteks. Rekomendasi bersifat panduan latihan, bukan diagnosis medis.
      </div>
      <button
        className="primary"
        style={{ width: "100%", marginTop: 12 }}
        onClick={() => {
          if (!s.premium) return;
          s.savePremiumState({ ...s.premium, settings: { ...s.premium.settings, autoProgression: auto === "on", deloadSensitivity: deload } });
          s.closeOverlay();
          s.toastMsg(s.lang === "id" ? "Coach settings tersimpan" : "Coach settings saved");
        }}
      >
        Save Coach Settings
      </button>
    </div>
  );
}

// ---------- main screen ----------

export function Tools() {
  const s = useJevara();
  const { lang, premium } = s;
  const id = lang === "id";
  const [restDef, setRestDef] = useState(String(premium?.settings?.rest ?? 90));
  const [pfW, setPfW] = useState(String(premium?.profile?.weight ?? 0));
  const [pfH, setPfH] = useState(String(premium?.profile?.height ?? 0));
  const [pfA, setPfA] = useState(String(premium?.profile?.age ?? 0));
  const [showOnb, setShowOnb] = useState(false);

  const tools: [string, string, string, () => void][] = [
    ["⏱", id ? "Waktu Istirahat" : "Rest Timer", id ? "Timer antar-set fleksibel" : "Flexible between-set timer", () => s.startRestFloat(Number(premium?.settings?.rest) || 90, "Manual timer")],
    ["🧮", id ? "Kalkulator 1RM" : "1RM Calculator", id ? "Estimasi 1RM metode Epley" : "Epley estimated 1RM", () => s.openOverlay("1RM Calculator", <CalcBody type="1rm" />)],
    ["🏋️", id ? "Kalkulator Plate" : "Plate Calculator", id ? "Hitung plate per sisi bar" : "Calculate plates per side", () => s.openOverlay("Plate Calculator", <CalcBody type="plate" />)],
    ["💾", id ? "Cadangkan / Pulihkan" : "Backup / Restore", id ? "Ekspor & impor data" : "Export & import data", () => s.openOverlay("Backup & Restore", <BackupBody />)],
    ["✚", id ? "Pembuat Program" : "Program Builder", id ? "Buat latihan khusus sendiri" : "Build your own custom workout", () => s.openOverlay("Custom Program Builder", <BuilderBody />)],
    ["◆", "JEVARA IQ", id ? "Penjelasan rekomendasi latihan" : "Workout recommendation details", () => { s.track("iq_viewed"); s.openOverlay("JEVARA IQ Settings", <CoachSettingsBody />); }],
  ];

  const customs = ((premium?.customPrograms || []) as CustomProgram[]).slice(0, 8);
  const recId = s.jevara.profile?.recommendedProgram;
  const recMeta = recId === "foundation"
    ? { title: "JEVARA 12-Week Foundation" }
    : PROGRAMS.find((p) => p.id === recId) || null;

  return (
    <div id="t-tools">
      <div className="hero">
        <div className="ey">{id ? "PENGATURAN & UTILITAS" : "SETTINGS & UTILITIES"}</div>
        <h2>{id ? "Lainnya" : "More"}</h2>
        <p>{id ? "Kalkulator, program, profil, bahasa, dan pengaturan aplikasi." : "Calculators, programs, profile, language, and app settings."}</p>
      </div>

      <div className="toolgrid">
        {tools.map(([ico, title, sub], i) => (
          <div className="tool" key={i} onClick={tools[i][3]}>
            <div className="ico">{ico}</div>
            <b>{title}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      {customs.length > 0 && (
        <div className="card">
          <div className="ctitle">Custom Workouts</div>
          {customs.map((p) => (
            <div className="history-row" key={p.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="history-dot" />
                <div className="history-body">
                  <b>{p.title}</b>
                  <small>
                    {p.ex.length} exercises • dibuat {localDate(p.createdAt)}
                  </small>
                </div>
                <div className="history-val">{p.ex.reduce((a, x) => a + x.s, 0)} sets</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="primary"
                  style={{ flex: 1, padding: 8, fontSize: 11 }}
                  onClick={() => {
                    if (s.activeSession) {
                      s.toastMsg(id ? "Selesaikan atau akhiri sesi yang sedang berjalan dulu." : "Finish the active session first.");
                      return;
                    }
                    s.setActiveCP({ id: p.id, title: p.title, c: "#3b82f6", cat: "Custom", lv: "—", dur: "", nd: 1, goal: "", sc: ["Latihan"], ss: { Latihan: { l: p.title, cd: "—", ex: p.ex } } });
                    s.goTab("log");
                    s.toastMsg((id ? "Program dimuat: " : "Program loaded: ") + p.title);
                  }}
                >
                  MULAI
                </button>
                <button
                  className="secondary"
                  style={{ padding: "8px 12px", fontSize: 11 }}
                  onClick={() => {
                    if (!confirm(id ? "Hapus program ini? Riwayat sesi yang sudah tercatat tidak akan ikut terhapus." : "Delete this program? Logged history stays.")) return;
                    const np = { ...s.premium, customPrograms: ((s.premium?.customPrograms || []) as CustomProgram[]).filter((x) => x.id !== p.id) };
                    s.savePremiumState(np as typeof s.premium);
                    s.toastMsg(id ? "Program dihapus." : "Program deleted.");
                    s.refresh();
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="ctitle">{id ? "Pengaturan Latihan" : "Workout Settings"}</div>
        <div className="field">
          <label>{id ? "Waktu istirahat default (detik)" : "Default rest timer (seconds)"}</label>
          <input type="number" id="restDefault" min={15} max={600} value={restDef} onChange={(e) => setRestDef(e.target.value)} />
        </div>
        <button
          className="primary"
          style={{ width: "100%", marginBottom: 10 }}
          onClick={() => {
            if (!s.premium) return;
            const v = parseInt(restDef) || 90;
            s.savePremiumState({ ...s.premium, settings: { ...s.premium.settings, rest: v } });
            s.toastMsg((id ? "Rest default " : "Default rest ") + v + (id ? " detik" : "s"));
          }}
        >
          {id ? "Simpan Waktu Istirahat" : "Save Rest Timer"}
        </button>
        {(
          [
            ["autoRest", id ? "Mulai istirahat otomatis" : "Auto-start rest after set", id ? "Timer otomatis dimulai setelah set selesai" : "Rest timer starts automatically after a completed set"],
            ["sound", id ? "Suara notifikasi" : "Notification sound", id ? "Bunyi saat waktu istirahat selesai" : "Sound when rest timer ends"],
            ["vibrate", id ? "Getaran" : "Vibration", id ? "Getaran jika perangkat mendukung" : "Haptic alert if supported"],
          ] as [string, string, string][]
        ).map(([k, title, sub]) => (
          <div className="settings-row" key={k}>
            <div>
              <b>{title}</b>
              <small>{sub}</small>
            </div>
            <div
              className={"switch " + ((s.premium?.settings as Record<string, unknown>)?.[k] ? "on" : "")}
              onClick={() => {
                if (!s.premium) return;
                s.savePremiumState({ ...s.premium, settings: { ...s.premium.settings, [k]: !(s.premium.settings as Record<string, unknown>)[k] } });
                s.refresh();
              }}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ctitle">◆ JEVARA IQ · Adaptive Profile</div>
        <div className="muted">
          {recMeta ? (id ? "Rekomendasi aktif: " : "Current recommendation: ") + recMeta.title : id ? "Lengkapi profil latihan untuk mendapatkan rekomendasi program." : "Complete your training profile to get a program recommendation."}
        </div>
        <button className="primary" style={{ width: "100%", marginTop: 12 }} onClick={() => setShowOnb(true)}>
          {id ? "BUAT / PERBARUI REKOMENDASI" : "CREATE / UPDATE RECOMMENDATION"}
        </button>
      </div>

      <div className="card">
        <div className="ctitle">{t(lang, "language")}</div>
        <div className="muted">
          {id
            ? "Pilih bahasa antarmuka. Istilah gym universal seperti RIR, 1RM, PR, Push, Pull, PPL, LISS dan HIIT tetap dipertahankan."
            : "Choose the interface language. Universal gym terms such as RIR, 1RM, PR, Push, Pull, PPL, LISS and HIIT are preserved."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          <button className={lang === "id" ? "primary" : "secondary"} onClick={() => { s.setLangFull("id"); s.toastMsg("Bahasa Indonesia aktif"); }}>
            🇮🇩 Indonesia
          </button>
          <button className={lang === "en" ? "primary" : "secondary"} onClick={() => { s.setLangFull("en"); s.toastMsg("English enabled"); }}>
            🇬🇧 English
          </button>
        </div>
      </div>

      <div className="card">
        <div className="ctitle">{t(lang, "profile")}</div>
        <div className="field">
          <label>Berat badan (kg)</label>
          <input id="pfW" type="number" step="0.1" value={pfW} onChange={(e) => setPfW(e.target.value)} />
        </div>
        <div className="field">
          <label>Tinggi badan (cm)</label>
          <input id="pfH" type="number" value={pfH} onChange={(e) => setPfH(e.target.value)} />
        </div>
        <div className="field">
          <label>Usia</label>
          <input id="pfA" type="number" value={pfA} onChange={(e) => setPfA(e.target.value)} />
        </div>
        <button
          className="secondary"
          style={{ width: "100%" }}
          onClick={() => {
            if (!s.premium) return;
            s.savePremiumState({
              ...s.premium,
              profile: {
                weight: parseFloat(pfW) || s.premium.profile.weight,
                height: parseInt(pfH) || s.premium.profile.height,
                age: parseInt(pfA) || s.premium.profile.age,
              },
            });
            s.toastMsg(id ? "Profile diperbarui" : "Profile updated");
          }}
        >
          {t(lang, "updateProfile")}
        </button>
      </div>

      <div className="install-note">
        <b style={{ color: "var(--cyan)" }}>{id ? "Tentang JEVARA" : "About JEVARA"}</b>
        <br />
        {id
          ? "Versi 0.9.9-rc1 · Data saat ini tersimpan di perangkat. Gunakan Cadangkan Data sebelum membersihkan data browser."
          : "Version 0.9.9-rc1 · Data is currently stored on this device. Back up your data before clearing browser data."}
      </div>

      <div id="accountDataCenter">
        <AccountDataCenter />
      </div>

      {showOnb && <OnboardingWizard onDone={() => setShowOnb(false)} />}
    </div>
  );
}

function AccountDataCenter() {
  const s = useJevara();
  const a = s.account || { name: "Belum login", id: "—", type: "guest", guest: true };
  const resetReadiness = () => {
    const m = s.lang === "id" ? "Reset ini hanya menghapus riwayat Daily Readiness. Workout dan profil tetap ada. Lanjutkan?" : "This reset only deletes Daily Readiness history. Workouts and profile remain. Continue?";
    if (!confirm(m)) return;
    if (!confirm(s.lang === "id" ? "Konfirmasi sekali lagi: hapus Daily Readiness?" : "Confirm again: delete Daily Readiness?")) return;
    if (!s.premium) return;
    s.savePremiumState({ ...s.premium, readiness: [] });
    s.toastMsg(s.lang === "id" ? "Readiness direset" : "Readiness reset");
    s.goTab("dash");
  };
  const resetWorkout = () => {
    const m = s.lang === "id" ? "Reset ini menghapus log workout dan progres. Profil, akun lokal, dan Readiness tetap dipertahankan. Lanjutkan?" : "This reset deletes workout logs and progress. Profile, local account, and Readiness remain. Continue?";
    if (!confirm(m)) return;
    if (!confirm(s.lang === "id" ? "Konfirmasi sekali lagi: hapus Workout & Progress?" : "Confirm again: delete Workout & Progress?")) return;
    try {
      localStorage.removeItem("jevara_log_v2");
      localStorage.removeItem("gym_v6");
    } catch {}
    window.location.reload();
  };
  const factoryReset = () => {
    const x = prompt("Factory Reset akan menghapus data lokal JEVARA pada perangkat ini.\n\nKetik RESET untuk melanjutkan:");
    if (x !== "RESET") return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }
      keys.forEach((k) => {
        const l = k.toLowerCase();
        if (l.includes("jevara") || l.includes("gym") || l.includes("premium")) localStorage.removeItem(k);
      });
    } catch {}
    window.location.reload();
  };
  return (
    <div>
      <div className="account-card">
        <span className="account-pill">{a.guest ? "GUEST BETA" : "BETA ACCOUNT"}</span>
        <h3 style={{ marginTop: 9 }}>{a.name}</h3>
        <div className="account-meta">{a.guest ? "Data hanya tersimpan di perangkat ini." : "Email: " + authMaskEmail(a.id)}</div>
        <button className="secondary" style={{ width: "100%", marginTop: 10 }} onClick={() => s.logout()}>
          Keluar / Ganti Akun
        </button>
      </div>
      <div className="data-card">
        <h3>Data &amp; Storage</h3>
        <div className="account-meta">Reset terpisah membantu beta testing tanpa selalu menghapus seluruh aplikasi.</div>
        <button className="secondary" style={{ width: "100%" }} onClick={resetWorkout}>
          Reset Workout &amp; Progress
        </button>
        <button className="secondary" style={{ width: "100%" }} onClick={resetReadiness}>
          Reset Daily Readiness
        </button>
        <button className="danger-btn" onClick={factoryReset}>
          Factory Reset JEVARA
        </button>
      </div>
    </div>
  );
}
