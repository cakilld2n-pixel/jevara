# JEVARA — Beta Release Build (0.9.9-beta1)

Dibuat: 3 September 2026
Basis: J1.18.34 (upload terakhir Anda), setelah rangkaian perbaikan menyeluruh.

Ini adalah build pertama yang saya anggap **siap untuk beta terbatas** (Anda + 1–2
penguji tepercaya). Bukan rilis publik — lihat "Batasan yang Diketahui" di bawah.

---

## Cara pakai dokumen ini

Setiap perbaikan ditandai dengan tingkat keparahan:
- 🔴 **Kritis** — data hilang/rusak, atau fitur inti gagal total
- 🟠 **Signifikan** — fitur tertentu gagal diam-diam, tidak ada crash terlihat
- 🟡 **Kecil** — kosmetik atau edge-case jarang terjadi

---

## Ringkasan perbaikan (kronologis)

### Fondasi & struktur file
- 🔴 `</body></html>` prematur di tengah file, membuat 9+ blok patch tereksekusi
  di luar struktur dokumen dan patch terbaru (v34) bukan yang aktif — diperbaiki,
  urutan eksekusi sekarang sesuai niat aslinya.
- 🔴 Satu blok patch (`je1817-hotfix`) ternyata syntax error total (tersimpan
  sebagai string ter-escape, bukan kode asli) — dihapus, fungsinya sudah
  digantikan patch lain yang benar.
- 🟡 Karakter `\n` literal muncul sebagai teks di layar — dibersihkan.
- 🟡 Regex salah escape di 2 fungsi deteksi jenis latihan "hold" (Plank dll).

### Sinkronisasi sesi & data
- 🔴 Set yang sama bisa tercatat berkali-kali (`premium.events`) setiap kali
  diedit/diulang — jumlah set & volume total jadi salah. Diperbaiki jadi upsert,
  plus migrasi otomatis membersihkan data lama yang sudah kadung dobel.
- 🔴 Nilai kg/reps/RIR bisa hilang dari layar setelah sesi diakhiri lebih awal,
  padahal data di riwayat tetap benar — beberapa fungsi "hydrate" ternyata
  menghapus data valid saat snapshot tidak lengkap. Diperbaiki jadi non-destruktif.
- 🔴 `startWorkout()` otomatis (recovery) bisa menghapus data yang baru saja
  selesai dicatat — sekarang hanya membersihkan jika konteks benar-benar kosong.
- 🔴 Mengulang hari yang sama (LATIH ULANG) tidak pernah menggantikan tampilan
  sesi lama, walau sesi baru selesai 100% — ringkasan tetap macet di sesi
  pertama selamanya. Akar masalah: 8+ fungsi berbeda punya aturan "sesi ulangan
  tidak pernah jadi resmi", plus `currentCanonicalKey()` (dipakai lusinan
  tempat) ternyata terkurung di scope dan tidak pernah benar-benar berjalan.
  Semua diperbaiki dan diverifikasi lewat simulasi end-to-end.

### Latihan khusus (Plank, bodyweight, assisted)
- 🔴 Validasi input manual menolak SEMUA percobaan menyelesaikan set Plank atau
  latihan bodyweight (push-up/pull-up tanpa beban) karena mengharuskan beban > 0
  tanpa peduli jenis latihan. Diperbaiki jadi sadar jenis latihan.
- 🟠 `e1rmEligible` (penentu kelayakan estimasi 1RM) tersimpan di scope yang
  tidak bisa diakses fungsi lain — memicu crash yang selalu ditangkap diam-diam.
- 🟠 `suggestedRest` dan `lastEventFor` dipanggil di banyak tempat tapi tidak
  pernah benar-benar didefinisikan — timer istirahat otomatis dan lookup "set
  terakhir" gagal diam-diam. Dilengkapi.

### Custom Program Builder
- 🟠 Fitur ini bisa menyimpan program tapi tidak ada cara memulai sesi darinya
  — sekarang fitur penuh: tombol MULAI dan Hapus, terintegrasi ke mesin
  logging/finalisasi yang sama dengan program bawaan.
- 🔴 **(Ditemukan saat membangun fitur di atas)** `selected()` — dipakai setiap
  kali `startWorkout()` — selalu memakai konteks Foundation (hari/fase/minggu)
  tanpa cek apakah sedang di custom program. Custom program bisa tercatat
  dengan kunci hari Foundation yang kebetulan aktif di background, berisiko
  bentrok dengan progress Foundation asli. Diperbaiki di akar (`selected()`
  dan `stampSession()`).

---

## Cakupan pengujian

Diverifikasi lewat simulasi otomatis end-to-end (bukan cuma baca kode) —
Node.js + jsdom menjalankan app sungguhan, bukan mock:

✅ Alur harian normal (isi set → selesai/akhiri lebih awal → sinkron)
✅ LATIH ULANG (redo hari yang sama)
✅ Plank / bodyweight / assisted-reps — input manual & Mode Terpandu
✅ Swap latihan di tengah sesi (Mode Terpandu)
✅ Custom Program Builder — buat, mulai, selesaikan, hapus
✅ Ganti ke program bawaan lain (bukan Foundation)
✅ Onboarding
✅ Navigasi fase/minggu
✅ Logika deload
✅ Tampilan PR di Progress tab untuk semua jenis latihan
✅ Tidak ada "undefined/null/NaN" yang bocor ke layar di semua skenario di atas
✅ Semua 51 blok `<script>` lolos validasi sintaks Node.js

## Batasan yang diketahui (belum diuji sama sekali)

❌ Kalkulator 1RM / Kalkulator Plate
❌ Backup / Restore (ekspor-impor data)
❌ Migrasi data dari versi JEVARA sebelumnya (upgrade path)
❌ Device fisik — semua verifikasi di atas pakai simulator browser (jsdom) di
   Node.js, mendekati perilaku Safari/Chrome asli tapi bukan pengganti 100%
❌ Perilaku dengan banyak user/device berbeda memakai app secara bersamaan
   (app ini murni client-side, tidak ada sinkronisasi server)

## Rekomendasi rollout

1. Deploy build ini ke `gymtracker.iqbal-nataprawira.workers.dev`
2. Pakai sendiri dulu minimal satu siklus mingguan penuh (lewati semua hari/fase)
3. Kalau mulus, undang 1–2 penguji tepercaya, pantau selama seminggu
4. Baru pertimbangkan memperluas — dan sebelum itu, uji area yang masih
   "Belum Diuji" di atas, terutama Backup/Restore (risiko kehilangan data)
