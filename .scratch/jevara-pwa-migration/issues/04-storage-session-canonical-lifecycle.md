# 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical)

**What to build:** Adapter `IndexedDB` (fallback localStorage `gym_v6`/`gym_iqbal_premium_v3`) dan siklus Session lengkap: `START` → `Set` Done (kg/reps/RIR/type valid per measurementType) → `FINISH` idempotent `RC4` → 1 Canonical Record `completed/ended_early`.

**Blocked by:** 01 — Scaffold fondasi Next.js + Supabase project, 03 — Auth Supabase + Profile onboarding

**Status:** ready-for-agent

- [ ] `IndexedDB` menyimpan `log` (`key_ok`), `premium.events[500]`, `sessions[150]`, `readiness[60]` dengan batas yang sama; fallback migrasi dari `localStorage` lama berhasil
- [ ] Validasi Set: `weighted_reps/assisted_reps` wajib kg>0, `bodyweight_reps` kg=0 boleh, `W` tidak butuh RIR, `N` wajib RIR — toast error jika invalid
- [ ] `START` membuat `activeSession` dengan `plannedSessionId` + `contextSig`; `FINISH` dengan `expectedSets` benar menghasilkan `completed` jika `done==expected`, `ended_early` jika kurang
- [ ] `FINISH` dua kali untuk `sessionId` yang sama tetap 1 row (guard `FINALIZING`, `upsert` PK `id`)
- [ ] `premium.events` dedupe `(sessionId,key)` last-write-wins tetap bekerja
