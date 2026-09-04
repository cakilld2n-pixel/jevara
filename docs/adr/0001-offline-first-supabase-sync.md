# Offline-first PWA dengan Supabase sebagai replica

JEVARA adalah gym tracker yang dipakai di dalam gym dengan sinyal tidak stabil. Kita putuskan IndexedDB/localStorage lokal tetap menjadi source-of-truth; Supabase Postgres hanya replica yang di-sync via SyncQueue + Service Worker backgroundSync. Alternatif online-only ditolak karena user akan kehilangan set saat offline, dan server-wins ditolak karena akan menimpa data lokal yang baru saja dicatat.
