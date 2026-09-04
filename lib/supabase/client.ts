import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _clientKey = "";

function env() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = env();
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  const key = `${url}::${anonKey}`;
  if (!_client || _clientKey !== key) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    _clientKey = key;
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = env();
  return Boolean(url && anonKey);
}

export async function healthCheck(): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase env not configured" };
  }
  try {
    const supabase = getSupabase();
    const { error, status } = await supabase.from("profiles").select("id").limit(1);
    if (error) {
      // 401 = missing/invalid key, PGRST116 = no rows but ok
      return { ok: false, status: status ?? 500, error: error.message };
    }
    return { ok: true, status: status ?? 200 };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
