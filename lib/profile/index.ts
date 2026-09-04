import { getSupabase } from "@/lib/supabase/client";
import { recommendProgram, type OnboardingInput } from "./recommend";

export type Profile = {
  id: string;
  name?: string | null;
  goal: string;
  experience: string;
  days: number;
  equipment: string;
  focus: string;
  avoid?: string | null;
  recommended_program: string | null;
  onboarded: boolean;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Omit<Profile, "id">>
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase.from("profiles").upsert({ id: userId, ...patch }, { onConflict: "id" });
  if (error) return { error: error.message };
  return {};
}

export async function completeOnboarding(
  userId: string,
  input: OnboardingInput & { name?: string }
): Promise<{ recommended: string; error?: string }> {
  const rec = recommendProgram(input);
  const { error } = await upsertProfile(userId, {
    goal: input.goal,
    experience: input.experience,
    days: input.days,
    equipment: input.equipment,
    focus: input.focus ?? "balanced",
    recommended_program: rec.id,
    onboarded: true,
    name: input.name ?? null,
  });
  if (error) return { recommended: rec.id, error };
  return { recommended: rec.id };
}
