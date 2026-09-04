# 09 — PWA Install/Update + Backup/Restore + i18n

**What to build:** `beforeinstallprompt` Install button, UpdateBanner untuk build baru (network-first), Backup/Restore JSON yang kompatibel dengan Supabase, dan i18n toggle tanpa hard-code campur.

**Blocked by:** 02 — Shell PWA + 5 Tab + Sesi Terencana read-only, 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical)

**Status:** ready-for-agent

- [ ] Tools tab menampilkan tombol `Install JEVARA` saat `beforeinstallprompt` tersedia; setelah install, tombol hilang
- [ ] Saat `sw.js` detect `CACHE` baru, `UpdateBanner` muncul `Versi baru tersedia → Reload` dan `skipWaiting` aktif setelah reload
- [ ] Export JSON (`exportData` shape `log/premium/jevara`) tetap bisa di-import dan setelah import langsung `sync_queue` enqueue ke Supabase
- [ ] Toggle `id/en` (`setLanguage`) mengganti semua label, status `CALIBRATE/HOLD/BUILD_*`, dan copy `Recovery Status` tanpa sisa hard-code
- [ ] `sw.js` tidak meng-cache `supabase.co` dan tidak men-cache `POST /rest/v1`
