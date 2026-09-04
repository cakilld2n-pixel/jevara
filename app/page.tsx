"use client";

import React, { useEffect, useRef } from "react";
import { JevaraProvider, useJevara } from "@/components/jevara/store";
import { Header, TabBar, Overlay, Toast, RestFloat } from "@/components/jevara/Shell";
import { Home } from "@/components/jevara/Home";
import { Workout } from "@/components/jevara/Workout";
import { Progress } from "@/components/jevara/Progress";
import { Programs } from "@/components/jevara/Programs";
import { Tools } from "@/components/jevara/Tools";
import { BetaAuthGate, OnboardingWizard } from "@/components/jevara/Auth";
import { RestFullscreen } from "@/components/jevara/Autopilot";
import { useSync } from "@/hooks/useSync";

function AutoFlow() {
  const s = useJevara();
  const fired = useRef(false);
  useEffect(() => {
    if (!s.hydrated || fired.current) return;
    fired.current = true;
    const t = setTimeout(() => {
      if (!s.account) {
        // BetaAuthGate renders itself when account is null
      } else if (!s.jevara.onboarded) {
        s.openOverlay(s.lang === "id" ? "Kenali Cara Anda Berlatih" : "Tell Us How You Train", <OnboardingWizard />);
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.hydrated]);
  return null;
}

function SyncBoot() {
  useSync();
  return null;
}

function App() {
  const s = useJevara();
  const { tab, account, hydrated } = s;
  return (
    <>
      <Header />
      <div className="main">
        {tab === "dash" && <Home />}
        {tab === "log" && <Workout />}
        {tab === "prog" && <Progress />}
        {tab === "pgm" && <Programs />}
        {tab === "tools" && <Tools />}
      </div>
      <TabBar />
      <Overlay />
      <RestFullscreen />
      <RestFloat />
      <Toast />
      <input type="file" id="fileImport" accept="application/json" />
      {hydrated && !account && (
        <BetaAuthGate
          onAuthed={() => {
            if (!s.jevara.onboarded) {
              setTimeout(() => {
                s.openOverlay(s.lang === "id" ? "Kenali Cara Anda Berlatih" : "Tell Us How You Train", <OnboardingWizard />);
              }, 80);
            }
          }}
        />
      )}
      <AutoFlow />
      <SyncBoot />
    </>
  );
}

export default function Home2() {
  return (
    <JevaraProvider>
      <App />
    </JevaraProvider>
  );
}
