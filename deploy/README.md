# Deploy JEVARA ke Cloudflare Workers

Struktur folder ini sudah siap pakai untuk Cloudflare Workers (Static Assets) —
model yang sama seperti `gymtracker.iqbal-nataprawira.workers.dev` yang sudah
berjalan sekarang.

```
.
├── wrangler.toml
└── public/
    ├── index.html          (versi revisi — 4 bug utama sudah diperbaiki)
    ├── icon-192.png
    ├── icon-512.png
    ├── manifest.webmanifest
    └── sw.js
```

## Cara deploy

1. Install Wrangler (sekali saja, butuh Node.js terpasang):
   ```
   npm install -g wrangler
   ```

2. Login ke akun Cloudflare Anda:
   ```
   wrangler login
   ```

3. Dari dalam folder ini, deploy:
   ```
   wrangler deploy
   ```

   Wrangler akan pakai `wrangler.toml` yang sudah ada, upload isi `public/`,
   dan memberi Anda URL `*.workers.dev` (atau nama project lain kalau Anda
   ganti `name` di `wrangler.toml`).

4. Untuk update di kemudian hari, cukup ganti isi `public/index.html` dan
   jalankan `wrangler deploy` lagi.

### Kalau mau nama project / URL berbeda

Ubah baris `name = "gymtracker"` di `wrangler.toml` sebelum deploy pertama kali.

### Kalau mau custom domain

Setelah deploy pertama berhasil, tambahkan custom domain lewat dashboard
Cloudflare (Workers & Pages → project ini → Settings → Domains & Routes),
atau lewat `wrangler.toml`:
```
[[routes]]
pattern = "gym.namadomainanda.com"
custom_domain = true
```

## Kenapa `not_found_handling = "single-page-application"`

App ini adalah single-page app (satu `index.html`, semua tab dirender lewat
JS). Setting ini memastikan path apa pun yang tidak match file statis (bukan
`icon-192.png`, dst.) tetap diarahkan ke `index.html`, bukan 404.

## Catatan tentang service worker & manifest

File `manifest.webmanifest` dan `sw.js` di folder ini baru saya buat —
keduanya sudah dirujuk oleh `index.html` (`<link rel="manifest">` dan
`navigator.serviceWorker.register('./sw.js')`) tapi tidak ada di file yang
Anda upload sebelumnya, jadi kemungkinan sebelumnya selalu gagal diam-diam
(errornya di-`catch()` sehingga tidak terlihat, tapi PWA "Add to Home
Screen" kemungkinan tidak berfungsi optimal tanpa manifest). Service worker
yang saya buat sengaja **network-first untuk index.html** — supaya user
selalu dapat versi terbaru dan tidak pernah "terjebak" di build lama yang
ke-cache, mengingat riwayat bug app ini.
