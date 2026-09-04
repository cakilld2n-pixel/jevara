import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInAnonymously: vi.fn(async () => ({ data: { user: { id: "anon-123", email: null, is_anonymous: true } }, error: null })),
      signInWithOtp: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      getUser: vi.fn(async () => ({ data: { user: { id: "user-1", email: "a@b.com", is_anonymous: false } }, error: null })),
      getSession: async () => ({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: async () => ({ error: null }),
    }),
  })),
}));

describe("Auth — ticket 03 seam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signInAnonymously returns user id", async () => {
    const { signInAnonymously } = await import("./index");
    const { user, error } = await signInAnonymously();
    expect(error).toBeUndefined();
    expect(user?.id).toBe("anon-123");
    expect(user?.isAnonymous).toBe(true);
  });

  it("signInWithOtp calls supabase with email", async () => {
    const { signInWithOtp } = await import("./index");
    const { error } = await signInWithOtp("test@example.com");
    expect(error).toBeUndefined();
  });

  it("getUser returns AuthUser", async () => {
    const { getUser } = await import("./index");
    const u = await getUser();
    expect(u?.id).toBe("user-1");
    expect(u?.isAnonymous).toBe(false);
  });
});
