"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { isSupabaseConfigured, healthCheck } from "@/lib/supabase/client";
import { getSessionContext } from "@/lib/session/context";
import { FOUNDATION, DAYS } from "@/data/foundation";
import { PROGRAMS } from "@/data/programs";
import { SessionCard } from "@/components/shell/SessionCard";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { OnboardingWizard } from "@/components/auth/OnboardingWizard";
import { getUser, signOut, type AuthUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import type { Program } from "@/data/types";

const LANG_KEY = "jevara_language_v1";

export default function Home() {
  const { toast } = useToast();
  const [health, setHealth] = useState<string>("checking...");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [curPh, setCurPh] = useState(1);
  const [curWk, setCurWk] = useState(1);
  const [curDay, setCurDay] = useState<string>("Senin");
  const [activeCP, setActiveCP] = useState<Program | null>(null);
  const [cpWk, setCpWk] = useState(1);
  const [cpDay, setCpDay] = useState<string | null>(null);
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileOnboarded, setProfileOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as "id" | "en" | null;
    if (saved === "en" || saved === "id") setLang(saved);
  }, []);

  const toggleLang = (v: "id" | "en") => {
    setLang(v);
    localStorage.setItem(LANG_KEY, v);
    toast(v === "id" ? "Bahasa Indonesia aktif" : "English enabled");
  };

  useEffect(() => {
    getUser().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileOnboarded(null);
      return;
    }
    getProfile(user.id).then((p) => setProfileOnboarded(p?.onboarded ?? false));
  }, [user]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setHealth("Supabase env not configured (.env.local)");
      return;
    }
    healthCheck().then((r) => {
      if (r.ok) setHealth(`Supabase OK (${r.status})`);
      else setHealth(`Supabase not reachable: ${r.error} (status ${r.status})`);
    });
  }, []);

  const ctx = getSessionContext({ curPh, curWk, curDay, activeCP, cpWk, cpDay });
  const phase = FOUNDATION[curPh];

  return (
    <main className="mx-auto max-w-[520px] px-3 pb-24 pt-4 md:max-w-[780px]">
      {/* Header — JEVARA identity */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-jevara-bd bg-jevara-bg2 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">JEVARA</h1>
          <p className="text-xs text-jevara-mu">Train with Direction.</p>
          {user && <p className="text-[10px] text-jevara-mu">{user.isAnonymous ? "Guest" : user.email} • {profileOnboarded ? "Onboarded" : "Setup needed"}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-jevara-bd bg-jevara-bg3 px-2.5 py-1 text-[10px] font-black tracking-wide text-jevara-mu">
            BETA PRO
          </span>
          {isInstallable && !isInstalled && (
            <button
              onClick={async () => {
                const ok = await promptInstall();
                toast(ok ? "Install diterima" : "Install ditunda");
              }}
              className="rounded-full bg-jevara-blue px-3 py-1.5 text-[10px] font-black text-[#07111d]"
            >
              Install
            </button>
          )}
          {!user ? (
            <button onClick={() => setShowAuth(true)} className="rounded-full bg-jevara-bg3 border border-jevara-bd px-3 py-1.5 text-[10px] font-bold">
              Masuk
            </button>
          ) : (
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
                toast("Keluar");
              }}
              className="rounded-full bg-jevara-bg3 border border-jevara-bd px-3 py-1.5 text-[10px] font-bold"
            >
              Keluar
            </button>
          )}
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} onSuccess={() => getUser().then(setUser)} />
      {user && (
        <OnboardingWizard
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          userId={user.id}
          onComplete={(rec) => {
            setProfileOnboarded(true);
            const prog = PROGRAMS.find((p) => p.id === rec);
            if (prog) {
              setActiveCP(prog);
              setCpDay(prog.sc[0]);
            } else if (rec === "foundation") {
              setActiveCP(null);
            }
          }}
        />
      )}

      <Tabs defaultValue="dash">
        <TabsList>
          <TabsTrigger value="dash">{lang === "id" ? "Home" : "Home"}</TabsTrigger>
          <TabsTrigger value="log">Workout</TabsTrigger>
          <TabsTrigger value="prog">Progress</TabsTrigger>
          <TabsTrigger value="pgm">Programs</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="dash">
          <Card>
            <CardHeader>
              <CardTitle>◆ JEVARA IQ — Scaffold</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-jevara-mu">
                {ctx
                  ? `${ctx.day} • ${ctx.label} • ${ctx.exs.length} exercises • ${ctx.expectedSets} sets`
                  : "Hari pemulihan"}
              </p>
              <div className="mt-3 rounded-xl border border-jevara-bd bg-jevara-bg3 p-3 text-xs">
                <div className="font-bold">Supabase health</div>
                <div className="mt-1 text-jevara-mu">{health}</div>
              </div>
              <button
                onClick={() => toast("Scaffold toast OK")}
                className="mt-3 rounded-xl bg-jevara-blue px-4 py-2.5 text-xs font-black text-[#07111d]"
              >
                Test Toast
              </button>
            </CardContent>
          </Card>

          <div className="mt-3">
            <SessionCard ctx={ctx} />
          </div>
        </TabsContent>

        <TabsContent value="log">
          <div className="space-y-3">
            {/* Foundation pills */}
            {!activeCP && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setCurPh(p);
                        setCurWk(1);
                        setCurDay("Senin");
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${
                        p === curPh
                          ? "border-transparent text-white"
                          : "border-jevara-bd bg-jevara-bg2 text-jevara-mu"
                      }`}
                      style={p === curPh ? { background: FOUNDATION[p].c } : {}}
                    >
                      {FOUNDATION[p].l}
                      <span className="block text-[10px] font-normal opacity-75">
                        {FOUNDATION[p].t}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs" style={{ background: `${phase.c}18`, borderColor: `${phase.c}44` }}>
                  <div>
                    <div className="font-bold" style={{ color: phase.c }}>
                      {phase.l} • {phase.w}
                    </div>
                    <div className="text-jevara-mu">{phase.f}</div>
                  </div>
                  <span className="rounded-md px-2 py-1 text-[10px] font-bold" style={{ background: `${phase.c}22`, color: phase.c }}>
                    {phase.t}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((w) => (
                    <button
                      key={w}
                      onClick={() => setCurWk(w)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold ${w === curWk ? "text-white" : "bg-jevara-bg2 text-jevara-mu border border-jevara-bd"}`}
                      style={w === curWk ? { background: phase.c } : {}}
                    >
                      Minggu {w}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setCurDay(d)}
                      className={`rounded-xl px-2 py-2 text-xs font-bold ${d === curDay ? "text-white" : "bg-jevara-bg2 text-jevara-mu border border-jevara-bd"}`}
                      style={d === curDay ? { background: phase.c } : {}}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Active program banner */}
            {activeCP && (
              <div className="rounded-xl border p-3" style={{ background: `${activeCP.c}18`, borderColor: `${activeCP.c}44` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black tracking-widest" style={{ color: activeCP.c }}>
                      {activeCP.cat} • {activeCP.lv}
                    </div>
                    <div className="text-sm font-bold">{activeCP.title}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveCP(null);
                      setCpDay(null);
                      setCpWk(1);
                    }}
                    className="rounded-lg border border-jevara-bd bg-jevara-bg3 px-3 py-1.5 text-xs text-jevara-mu"
                  >
                    Ganti
                  </button>
                </div>
                <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(activeCP.sc.length, 5)}, minmax(0, 1fr))` }}>
                  {activeCP.sc.map((d) => (
                    <button
                      key={d}
                      onClick={() => setCpDay(d)}
                      className={`rounded-xl px-2 py-2 text-xs font-bold ${cpDay === d || (!cpDay && d === activeCP.sc[0]) ? "text-white" : "bg-jevara-bg2 text-jevara-mu border border-jevara-bd"}`}
                      style={cpDay === d || (!cpDay && d === activeCP.sc[0]) ? { background: activeCP.c } : {}}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((w) => (
                    <button
                      key={w}
                      onClick={() => setCpWk(w)}
                      className={`rounded-lg px-2 py-1.5 text-xs font-bold ${w === cpWk ? "text-white" : "bg-jevara-bg2 text-jevara-mu border border-jevara-bd"}`}
                      style={w === cpWk ? { background: activeCP.c } : {}}
                    >
                      W{w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <SessionCard ctx={ctx} />
          </div>
        </TabsContent>

        <TabsContent value="prog">
          <Card>
            <CardContent>
              <p className="text-sm text-jevara-mu">Progress — akan membaca Canonical Record di 08 (finalized sessions).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pgm">
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["Semua", "Rekomposisi", "Fat Loss", "Bulking", "Kekuatan", "Hipertrofi", "Maintenance"].map((cat) => (
                <button
                  key={cat}
                  className="whitespace-nowrap rounded-full border border-jevara-bd bg-jevara-bg2 px-3 py-1.5 text-xs font-bold text-jevara-mu"
                >
                  {cat}
                </button>
              ))}
            </div>
            {PROGRAMS.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-jevara-bd bg-jevara-bg2">
                <div className="h-1" style={{ background: p.c }} />
                <div className="p-4">
                  <div className="text-sm font-bold">{p.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${p.c}22`, color: p.c }}>
                      {p.cat}
                    </span>
                    <span className="rounded-full bg-jevara-bg3 px-2 py-0.5 text-[10px] text-jevara-mu">
                      {p.lv} • {p.dur} • {p.nd} hari/minggu
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-jevara-mu">{p.goal}</p>
                  <button
                    onClick={() => {
                      setActiveCP(p);
                      setCpDay(p.sc[0]);
                      setCpWk(1);
                      toast(`${p.title} dimuat`);
                    }}
                    className="mt-3 w-full rounded-xl py-2.5 text-xs font-black text-white"
                    style={{ background: p.c }}
                  >
                    Gunakan Program Ini
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Account & Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="space-y-2">
                  <p className="text-xs text-jevara-mu">Belum masuk — data hanya lokal. Masuk untuk sync Supabase (RLS).</p>
                  <button onClick={() => setShowAuth(true)} className="w-full rounded-xl bg-jevara-blue py-2.5 text-xs font-black text-[#07111d]">
                    Masuk / Guest
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-jevara-mu">
                    {user.isAnonymous ? "Guest anon" : user.email} • {profileOnboarded ? "Onboarded" : "Belum onboarded"}
                  </p>
                  <button onClick={() => setShowOnboarding(true)} className="w-full rounded-xl bg-jevara-blue py-2.5 text-xs font-black text-[#07111d]">
                    {profileOnboarded ? "Ubah Onboarding" : "Mulai Onboarding (4 langkah)"}
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      setUser(null);
                      toast("Keluar — kembali ke lokal");
                    }}
                    className="w-full rounded-xl border border-jevara-bd bg-jevara-bg3 py-2.5 text-xs font-bold"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tools — Scaffold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Demo Switch (shadcn)</span>
                <Switch checked={true} onCheckedChange={() => toast("Switch OK")} />
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => toggleLang("id")} className={`rounded-xl px-3 py-2 text-xs font-bold ${lang === "id" ? "bg-jevara-blue text-[#07111d]" : "bg-jevara-bg3 text-jevara-mu border border-jevara-bd"}`}>
                  🇮🇩 Indonesia
                </button>
                <button onClick={() => toggleLang("en")} className={`rounded-xl px-3 py-2 text-xs font-bold ${lang === "en" ? "bg-jevara-blue text-[#07111d]" : "bg-jevara-bg3 text-jevara-mu border border-jevara-bd"}`}>
                  🇬🇧 English
                </button>
              </div>
              <div className="mt-3 text-xs text-jevara-mu">
                {lang === "id" ? "Bahasa aktif: Indonesia" : "Active language: English"} • JE_LANG persisted
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-[10px] text-jevara-mu">
        JEVARA 0.9.9 — PWA offline-first • Supabase replica • Vercel • Sesi Terencana {ctx?.expectedSets ?? 0} sets
      </p>
    </main>
  );
}
