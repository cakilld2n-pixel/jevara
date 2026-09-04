# 08 — Progress & History dari Canonical

**What to build:** Progress tab (phase bars, lift chart Deadlift/Squat/Bench, weeklyMuscles, weight chart, PR) yang hanya membaca `jeRC4FinalizedSessions` dan `je099cComparableEvents`, bukan ledger mentah.

**Blocked by:** 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical), 07 — JEVARA IQ + Readiness engine

**Status:** ready-for-agent

- [ ] Phase bars menghitung `done/expected` hanya dari `sessions` `completed/ended_early` RC4, bukan `log` mentah
- [ ] Lift chart 12 minggu (W1–W12) hanya dari `sessions` final; 1 minggu tanpa sesi final tidak menambah titik
- [ ] `weeklyMuscles` menghitung `muscleFor` hanya dari `events` yang `sessionId` ada di `finalizedIds` dan `ts >= weekStart`
- [ ] `PR` card hanya menampilkan `prs` dengan `baseline:false`, diurut `e1RM`/`bestMetric` desc, max 8
- [ ] `Readiness spark` dan `Recovery Status` (LOW/WATCH/STABLE) ter-localize id/en dan empty state `Belum cukup data` saat <3 entry
