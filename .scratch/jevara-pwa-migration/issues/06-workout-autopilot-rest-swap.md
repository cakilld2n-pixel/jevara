# 06 — Mesin Workout: Autopilot + Rest + Swap

**What to build:** Session Autopilot set-by-set dengan `effort/RIR`, rest timer full-screen yang persist, dan swap exercise beralasan tanpa copy beban (pengganti masuk CALIBRATE).

**Blocked by:** 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical), 05 — SyncQueue offline-first (outbox → Supabase)

**Status:** ready-for-agent

- [ ] Autopilot `je095OpenAutopilot` membuka `pos` pertama yang belum Done; `je095AutopilotDone` validasi per `measurementType` (timed_hold pakai `durationSec`, bodyweight kg=0) dan advance ke next unlogged
- [ ] Rest `je096StartRest` (default 90s, `suggestedRest` per exercise) bisa pause/adjust ±15s/skip dan survive refresh via `je099RestState` persist
- [ ] Swap: pilih alasan `EQUIPMENT_BUSY/NO_EQUIPMENT/TOO_DIFFICULT` → 3 kandidat `je099bSwapCandidates` → confirm mengganti `exId` dan clear `log[key_ok]` tanpa copy kg, `sync_queue` enqueue pengganti
- [ ] Pengganti yang belum punya Baseline langsung `CALIBRATE` (Exposure 0/3) di IQ
- [ ] `Autopilot` tidak memicu `startRest` legacy floating timer saat autopilot aktif
