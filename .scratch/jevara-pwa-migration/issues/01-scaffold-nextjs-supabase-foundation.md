# 01 — Scaffold fondasi Next.js + Supabase project

**What to build:** Repo Next.js 14 App Router + TypeScript strict + Tailwind + shadcn/ui yang memetakan token JEVARA lama (`--bg:#080B12`, `--blue:#5DA8FF`) dan menghubungkan Supabase project, sehingga `npm run dev` jalan dan `manifest.webmanifest` valid sebagai PWA skeleton.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Next.js App Router dengan TypeScript strict berhasil `build` tanpa error
- [ ] Tailwind memetakan semua token `:root` lama dan shadcn `Card/Tabs/Dialog/Toast/Switch` terpasang
- [ ] `public/manifest.webmanifest` (name JEVARA, standalone, ikon 192/512) dan `public/sw.js` skeleton (skipWaiting/clientsClaim) tersaji di Vercel preview
- [ ] Env `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` terhubung (health check `supabase.from('profiles').select()` tidak 401)
- [ ] Lighthouse PWA `manifest` check hijau untuk skeleton
