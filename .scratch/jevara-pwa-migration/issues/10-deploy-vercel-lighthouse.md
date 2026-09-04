# 10 — Deploy Vercel + Redirect + Lighthouse audit

**What to build:** Deploy produksi ke Vercel, redirect 301 dari `gymtracker.iqbal-nataprawira.workers.dev`, dan lulus Lighthouse PWA audit.

**Blocked by:** 02 — Shell PWA + 5 Tab + Sesi Terencana read-only, 05 — SyncQueue offline-first (outbox → Supabase), 09 — PWA Install/Update + Backup/Restore + i18n

**Status:** ready-for-agent

- [ ] `jevara.vercel.app` (atau `gymtracker` sesuai `wrangler.toml` name) live dengan env `NEXT_PUBLIC_SUPABASE_*` prod
- [ ] `gymtracker.iqbal-nataprawira.workers.dev/*` 301 ke `jevara.vercel.app/*` (Workers hanya redirect)
- [ ] Lighthouse CI `pwa` ≥90, `performance` ≥85: `manifest` valid, `sw.js` registered, `NetworkFirst` untuk document (tidak terjebak build lama), `CacheFirst` untuk `_next/static` dan ikon
- [ ] Vercel Preview per PR dan `vercel --prod` untuk main branch berjalan
- [ ] Tidak ada `undefined/NaN/null` bocor ke layar di semua 5 tab pada build produksi
