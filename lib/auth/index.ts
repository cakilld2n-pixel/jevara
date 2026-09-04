import { getSupabase } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email?: string | null;
  isAnonymous: boolean;
};

export async function signInAnonymously(): Promise<{ user: AuthUser | null; error?: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return { user: null, error: error.message };
  const u = data.user;
  if (!u) return { user: null, error: "No user returned" };
  return { user: { id: u.id, email: u.email, isAnonymous: !!u.is_anonymous } };
}

export async function signInWithOtp(email: string): Promise<{ error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) return { error: error.message };
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  return { id: u.id, email: u.email, isAnonymous: !!u.is_anonymous };
}
