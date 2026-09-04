import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Page from "./page";

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: () => true,
  healthCheck: async () => ({ ok: true, status: 200 }),
  getSupabase: () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      getSession: async () => ({ data: { session: null } }),
      signInAnonymously: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: async () => ({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/auth", () => ({
  getUser: async () => null,
  signOut: async () => {},
  signInAnonymously: async () => ({ user: null }),
  signInWithOtp: async () => ({}),
}));

vi.mock("@/lib/profile", () => ({
  getProfile: async () => null,
  upsertProfile: async () => ({}),
  completeOnboarding: async () => ({ recommended: "rc1" }),
}));

vi.mock("agentation", () => ({
  Agentation: () => null,
}));

function renderPage() {
  return render(<Page />);
}

describe("JEVARA shell — reference parity", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders header JEVARA + 5 bottom tabs", () => {
    renderPage();
    expect(screen.getAllByText("JEVARA").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Train with Direction.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Latihan")).toBeInTheDocument();
    expect(screen.getByText("Progres")).toBeInTheDocument();
    expect(screen.getByText("Program")).toBeInTheDocument();
    expect(screen.getByText("Lainnya")).toBeInTheDocument();
  });

  it("home shows greeting hero + start button + readiness + IQ", () => {
    renderPage();
    expect(screen.getByText("MULAI LATIHAN")).toBeInTheDocument();
    expect(screen.getByText("Kesiapan Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("◆ JEVARA IQ")).toBeInTheDocument();
  });

  it("workout tab shows foundation program + phase pills + session", () => {
    renderPage();
    fireEvent.click(screen.getByText("Latihan"));
    expect(screen.getByText("PROGRAM AKTIF")).toBeInTheDocument();
    expect(screen.getByText("JEVARA 12-Week Foundation")).toBeInTheDocument();
    expect(screen.getByText("START WORKOUT")).toBeInTheDocument();
    expect(screen.getByText("MODE TERPANDU")).toBeInTheDocument();
  });

  it("programs tab shows foundation feature + template programs", () => {
    renderPage();
    fireEvent.click(screen.getByText("Program"));
    expect(screen.getByText("Gunakan Program Utama")).toBeInTheDocument();
    expect(screen.getByText("Rekomposisi Pemula")).toBeInTheDocument();
  });

  it("tools tab shows tool grid + settings + language + profile", () => {
    renderPage();
    fireEvent.click(screen.getByText("Lainnya"));
    expect(screen.getByText("Waktu Istirahat")).toBeInTheDocument();
    expect(screen.getByText("Kalkulator 1RM")).toBeInTheDocument();
    expect(screen.getByText("Pengaturan Latihan")).toBeInTheDocument();
  });

  it("shows beta auth gate when no account", () => {
    renderPage();
    expect(screen.getByText("COBA SEBAGAI GUEST")).toBeInTheDocument();
  });
});
