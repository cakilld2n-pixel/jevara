# Vercel untuk PWA, tinggalkan Cloudflare Workers untuk hosting

`deploy/wrangler.toml` melayani JEVARA sebagai static Workers di `gymtracker.iqbal-nataprawira.workers.dev`. Kita putuskan migrasi hosting ke Vercel (Next.js App Router) karena native support untuk Tailwind/shadcn/ISR, env handling, dan `public/sw.js` + `manifest.webmanifest` yang identik. Workers dipertahankan hanya sebagai redirect 301 ke domain Vercel, bukan host utama.
