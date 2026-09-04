"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { flushQueue, getQueue } from "@/lib/sync/queue";

export function useSync() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = () => setPending(getQueue().length);

  const flush = async () => {
    if (!isSupabaseConfigured()) return;
    if (!navigator.onLine) return;
    setSyncing(true);
    try {
      const supabase = getSupabase();
      await flushQueue(supabase as never);
      refreshPending();
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshPending();
    const onOnline = () => flush();
    const onVisibility = () => {
      if (document.visibilityState === "visible" && navigator.onLine) flush();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    // initial flush if online
    if (navigator.onLine) flush();
    const interval = setInterval(refreshPending, 3000);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pending, syncing, flush, refreshPending };
}
