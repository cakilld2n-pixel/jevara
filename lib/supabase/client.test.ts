import { describe, it, expect, vi, beforeEach } from "vitest";
import { isSupabaseConfigured, healthCheck } from "./client";

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        limit: async () => ({ data: [], error: null, status: 200 }),
      }),
    }),
    auth: {},
  }),
}));

describe("Supabase client — PWA offline-first seam", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example");
  });

  it("isSupabaseConfigured returns true when env present (.env.local)", () => {
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("healthCheck returns not 401 when anon key present (mocked)", async () => {
    const result = await healthCheck();
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });

  it("isSupabaseConfigured returns false when env missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
    const result = await healthCheck();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not configured/i);
  });
});
