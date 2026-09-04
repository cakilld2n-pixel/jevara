# 03 — Auth Supabase + Profile onboarding

**What to build:** Migrasi `AUTH_KEY` lokal (guest/email) ke Supabase Auth (email OTP + anon guest) dengan `profiles` table + RLS, serta onboarding `je098Recommend` yang menulis `recommended_program`.

**Blocked by:** 01 — Scaffold fondasi Next.js + Supabase project

**Status:** ready-for-agent

- [ ] Guest (anon) dan email OTP bisa login, `auth.uid()` terisi, `profiles` row `upsert` dengan `id = auth.uid()`
- [ ] RLS `USING (auth.uid() = user_id)` menolak `select` user lain (test dengan dua user)
- [ ] Onboarding 4 langkah (`goal/experience/days/equipment`) menghasilkan `recommended_program` (rc1/fl1/bu1/st1/hp1/foundation) yang sama dengan `je098Recommend` lama
- [ ] `LANG_KEY` dan `jevara_language_v1` tetap lokal, tidak ikut Supabase
- [ ] Logout + login di device lain menampilkan `profiles` yang sama
