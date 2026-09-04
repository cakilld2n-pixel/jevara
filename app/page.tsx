"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { isSupabaseConfigured, healthCheck } from "@/lib/supabase/client";

export default function Home() {
  const { toast } = useToast();
  const [health, setHealth] = useState<string>("checking...");
  const [offline] = useState(false);

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

  return (
    <main className="mx-auto max-w-[520px] px-3 pb-24 pt-4 md:max-w-[780px]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-jevara-bd bg-jevara-bg2 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">JEVARA</h1>
          <p className="text-xs text-jevara-mu">Train with Direction.</p>
        </div>
        <span className="rounded-full border border-jevara-bd bg-jevara-bg3 px-2.5 py-1 text-[10px] font-black tracking-wide text-jevara-mu">
          BETA PRO
        </span>
      </div>

      <Tabs defaultValue="dash">
        <TabsList>
          <TabsTrigger value="dash">Home</TabsTrigger>
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
                Foundation Next.js + Tailwind + shadcn + Supabase skeleton siap. Sesi Terencana
                akan dirender dari <code className="text-jevara-blue">D</code> / <code className="text-jevara-blue">PG</code> di tiket 02.
              </p>
              <div className="mt-3 rounded-xl border border-jevara-bd bg-jevara-bg3 p-3 text-xs">
                <div className="font-bold">Supabase health</div>
                <div className="mt-1 text-jevara-mu">{health}</div>
                {offline && <div className="mt-1 text-jevara-danger">Offline — IndexedDB mode</div>}
              </div>
              <button
                onClick={() => toast("Scaffold toast OK")}
                className="mt-3 rounded-xl bg-jevara-blue px-4 py-2.5 text-xs font-black text-[#07111d]"
              >
                Test Toast
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardContent>
              <p className="text-sm text-jevara-mu">Workout — akan diisi di 04/06 (Session seam).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prog">
          <Card>
            <CardContent>
              <p className="text-sm text-jevara-mu">Progress — akan membaca Canonical Record di 08.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pgm">
          <Card>
            <CardContent>
              <p className="text-sm text-jevara-mu">Programs — Foundation + 6 Template (PG) di 02.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Tools — Scaffold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Demo Switch (shadcn)</span>
                <Switch checked={true} onCheckedChange={() => toast("Switch OK")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-[10px] text-jevara-mu">
        JEVARA 0.9.9 — PWA offline-first • Supabase replica • Vercel
      </p>
    </main>
  );
}
