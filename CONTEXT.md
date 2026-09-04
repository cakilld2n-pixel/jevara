# JEVARA

Sistem gym tracker offline-first yang mencatat latihan, menghitung progres, dan memberi arahan beban berikutnya. Satu sesi = satu canonical record yang menjadi sumber tunggal untuk History, Progress, dan JEVARA IQ.

## Language

### Training Core

**Set**:
Satu baris kerja yang ditandai Done — kombinasi kg, reps, RIR, dan type yang disimpan di `log[key+"_ok"]`.
_Avoid_: rep, event, exposure

**Session**:
Satu siklus START → FINISH yang menghasilkan canonical record dengan id, volume, duration, dan state `completed` atau `ended_early`. Hanya Session yang sudah difinalisasi yang mengajar IQ.
_Avoid_: workout, event, exposure

**Event**:
Entri mentah di ledger `premium.events` hasil `onSetCompleted`. Belum tentu valid untuk IQ jika bertipe Warm-up atau Session belum final.
_Avoid_: set, log, session

**Exposure**:
Satu Session yang sudah difinalisasi yang mengandung minimal satu Event valid untuk exercise tertentu. Dihitung per hari/sesi, bukan per set. Threshold `<3` berarti CALIBRATE.
_Avoid_: set count, session count, volume

### Readiness & Recovery

**Readiness**:
Input subjektif harian sebelum latihan — Energy, Sleep, Soreness (1–5) menjadi skor 0–100. Konteks hari ini untuk menunda progression, bukan diagnosis medis. Tidak pernah memicu deload sendirian.
_Avoid_: recovery, fatigue, soreness

**Soreness**:
Salah satu dimensi Readiness (rasa pegal/DOMS 1–5). Bukan sinonim Readiness.
_Avoid_: readiness, fatigue

**Recovery Status**:
Output JEVARA IQ (LOW / WATCH / STABLE) dari kombinasi Readiness + penurunan performa persisten. Bukan input harian.
_Avoid_: readiness, soreness

**Fatigue**:
Sinyal akumulasi kelelahan yang dihitung dari trend performa dan Readiness, bukan input manual.
_Avoid_: soreness, readiness

### Progression Intelligence

**e1RM (Estimated One-Rep Max)**:
Estimasi kekuatan maksimal 1 rep via rumus Epley `kg*(1+reps/30)`. Hanya dihitung untuk exercise compound yang `e1rmEligible`.
_Avoid_: PR, best set, 1RM aktual

**Baseline**:
Hasil valid pertama untuk satu exercise di Session yang sudah difinalisasi. Disimpan dengan flag `baseline:true`, bukan PR. Syarat minimal 1 Exposure.
_Avoid_: PR, e1RM

**PR (Personal Record)**:
Rekor yang mengalahkan Baseline. Untuk compound memakai e1RM, untuk isolasi memakai `best_set = kg×reps`. Disimpan `baseline:false`.
_Avoid_: baseline, e1RM

**CALIBRATE**:
Status IQ saat Exposure <3. Belum beri target beban, hanya kumpulkan data valid.
_Avoid_: hold, build_load

**HOLD**:
Baseline ada tapi performa belum konsisten. Beban dipertahankan, kejar konsistensi reps dan RIR.
_Avoid_: calibrate, build_load

**BUILD_REPS**:
Beban sudah tepat, tambah repetisi hingga batas atas rentang target. Beban tetap.
_Avoid_: build_load

**BUILD_LOAD**:
Kenaikan beban kecil diizinkan karena reps >= max, RIR >=2, Exposure >=3, dan Readiness >=60.
_Avoid_: build_reps, hold

**RECOVER**:
Progression ditunda hari ini karena Readiness <50 atau penurunan performa persisten. Bukan diagnosis deload.
_Avoid_: deload, hold

### Program Structure

**Program**:
Koleksi Sesi Terencana dengan tujuan spesifik (rekomposisi, fat loss, strength). Induk dari semua varian.
_Avoid_: workout, template

**Foundation**:
Program utama JEVARA 12 minggu, 3 Fase (1:Fondasi, 2:Hipertrofi, 3:Kekuatan+Definisi), 5 hari/minggu. Didefinisikan di `D` dan dipakai via `curPh/curWk/curDay`.
_Avoid_: custom program, template

**Template Program**:
Enam program jadi di `PG` (rc1, fl1, bu1, st1, hp1, mn1) yang dapat dipakai langsung sebagai `activeCP`.
_Avoid_: foundation, custom

**Custom Program**:
Program buatan pengguna via Program Builder, disimpan di `premium.customPrograms` dan diadaptasi ke bentuk `PG` agar masuk mesin logging yang sama.
_Avoid_: foundation, template

**Sesi Terencana (Planned Session)**:
Satu hari spesifik dalam Program (mis. Foundation Fase 1 Minggu 1 Senin Push) yang menentukan `expectedSets` dan menjadi dasar canonical record saat START.
_Avoid_: session, event

**Canonical Record**:
Snapshot final satu Session (state `completed`/`ended_early`, volume, exerciseSummary) hasil `finishWorkout`. Satu-satunya sumber kebenaran untuk History, Progress, dan IQ. Ledger Event hanya audit.
_Avoid_: event, log
