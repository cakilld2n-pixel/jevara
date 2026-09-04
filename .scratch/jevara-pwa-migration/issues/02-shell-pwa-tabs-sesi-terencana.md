# 02 — Shell PWA + 5 Tab + Sesi Terencana read-only

**What to build:** Layout Header + TabBar (dash/log/prog/pgm/tools) dengan `JE_LANG` dan Sesi Terencana read-only (Foundation `curPh/curWk/curDay` atau `activeCP` dari `D`/`PG`) yang bisa diinstal sebagai PWA dan navigasi offline tanpa menulis data.

**Blocked by:** 01 — Scaffold fondasi Next.js + Supabase project

**Status:** ready-for-agent

- [ ] 5 tab `goTab` beralih tanpa reload dan `JE_LANG` id/en mengganti label tanpa hard-code campur
- [ ] Sesi Terencana menampilkan `expectedSets`, `exs.length`, dan `cardio` yang benar untuk `Foundation Senin Push` maupun `Template Program rc1`
- [ ] `beforeinstallprompt` belum wajib, tapi `manifest` + `sw.js` membuat app installable di Chrome (Lighthouse `installable`)
- [ ] Offline: refresh saat offline tetap menampilkan Sesi Terencana terakhir (cache document NetworkFirst)
- [ ] Badge IQ `CALIBRATE` muncul saat Exposure <3 dengan copy `Baseline n/3` yang lokalized
