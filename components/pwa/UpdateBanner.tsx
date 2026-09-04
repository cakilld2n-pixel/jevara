"use client";

import { useEffect, useState } from "react";

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker as unknown as { addEventListener?: (a: string, b: () => void) => void; ready?: Promise<ServiceWorkerRegistration>; controller?: unknown };
    if (typeof sw.addEventListener !== "function") return;
    sw.addEventListener("controllerchange", () => setShow(true));
    // also listen for new SW
    sw.ready?.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const inst = reg.installing;
        if (!inst) return;
        inst.addEventListener("statechange", () => {
          if (inst.state === "installed" && (navigator.serviceWorker as unknown as { controller?: unknown }).controller) setShow(true);
        });
      });
    });
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-jevara-bd bg-jevara-bg2 px-4 py-2 text-xs shadow-lg">
      <span>Versi baru tersedia</span>
      <button onClick={() => location.reload()} className="rounded-full bg-jevara-blue px-3 py-1 text-[10px] font-black text-[#07111d]">
        Reload
      </button>
    </div>
  );
}
