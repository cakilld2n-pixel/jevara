# 07 — JEVARA IQ + Readiness engine

**What to build:** Pure engine `iqLite` dengan 5 status `CALIBRATE/HOLD/BUILD_REPS/BUILD_LOAD/RECOVER` yang menghormati `e1RM` scope, `Baseline` vs `PR`, `Exposure` count, dan modifier `Readiness`.

**Blocked by:** 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical)

**Status:** ready-for-agent

- [ ] `e1RM` hanya untuk `e1rmEligible` (bench/squat/deadlift/row, bukan isolasi); isolasi memakai `best_set = kg×reps`
- [ ] `Baseline` (`baseline:true`) pertama tidak memicu toast PR; `PR` hanya saat `metric > old.bestMetric`
- [ ] `CALIBRATE` saat `Exposure <3` dengan copy `Baseline n/3`; `BUILD_LOAD` hanya jika `reps>=max && RIR>=2 && Exposure>=3 && Readiness>=60` dengan `smallestJump` 1–2.5kg
- [ ] `RECOVER` saat `Readiness <50` menunda progression (`HOLD TODAY`) tapi tidak memicu `Recovery Status` deload sendirian (butuh `je099cPersistentDecline`)
- [ ] `Why?` sheet menjelaskan `exposures`, `readiness zone`, dan `reason` yang lokalized id/en
