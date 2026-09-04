"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const t0Ref = useRef<number | null>(null);
  const accRef = useRef(0);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paint = useCallback(() => {
    if (t0Ref.current === null) return;
    const now = Date.now();
    const cur = accRef.current + Math.floor((now - t0Ref.current) / 1000);
    setElapsed(cur);
  }, []);

  const start = useCallback(() => {
    if (ivRef.current) return;
    t0Ref.current = Date.now();
    ivRef.current = setInterval(paint, 250);
    setRunning(true);
  }, [paint]);

  const pause = useCallback(() => {
    if (!ivRef.current || t0Ref.current === null) return;
    accRef.current = accRef.current + Math.floor((Date.now() - t0Ref.current) / 1000);
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = null;
    t0Ref.current = null;
    setElapsed(accRef.current);
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (running) pause();
    else start();
  }, [running, start, pause]);

  const reset = useCallback(() => {
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = null;
    t0Ref.current = null;
    accRef.current = 0;
    setElapsed(0);
    setRunning(false);
  }, []);

  const stop = useCallback(() => {
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = null;
    t0Ref.current = null;
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (ivRef.current) clearInterval(ivRef.current);
    };
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return { elapsed, running, start, pause, toggle, reset, stop, label: `${mm}:${ss}` };
}
