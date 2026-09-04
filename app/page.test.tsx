import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";
import { ToastProvider } from "@/components/ui/toast";

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

function renderHome() {
  return render(
    <ToastProvider>
      <Home />
    </ToastProvider>
  );
}

describe("Shell PWA + Sesi Terencana — 02 seam", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 5 tabs and header JEVARA", () => {
    renderHome();
    expect(screen.getByText("JEVARA")).toBeInTheDocument();
    expect(screen.getByText("Workout")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Programs")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });

  it("shows Sesi Terencana Foundation Fase1 Senin = 19 sets read-only", () => {
    renderHome();
    // SessionCard inside dash tab shows expectedSets — multiple matches (dash summary + card), assert at least one
    expect(screen.getAllByText(/19 sets/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Barbell Bench Press/)).toBeInTheDocument();
    expect(screen.getByText(/Read-only — logging/)).toBeInTheDocument();
  });

  it("switches to Programs and shows template program", () => {
    renderHome();
    const progTab = screen.getByText("Programs");
    fireEvent.click(progTab);
    expect(screen.getByText("Rekomposisi Pemula")).toBeInTheDocument();
  });
});
