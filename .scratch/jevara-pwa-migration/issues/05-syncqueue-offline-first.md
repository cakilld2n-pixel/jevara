# 05 — SyncQueue offline-first (outbox → Supabase)

**What to build:** Outbox `sync_queue` di IndexedDB yang enqueue setiap tulis `Set/Event/Session/Readiness` dan flush via `backgroundSync`/`onLine` ke Supabase dengan dedupe last-write-wins, serta hydrate device kedua.

**Blocked by:** 04 — StoragePort + Siklus Session (START → Set → FINISH → Canonical)

**Status:** ready-for-agent

- [ ] Setiap `je095SaveInput`/`onSetCompleted`/`saveReadiness` enqueue 1 entry `sync_queue` tanpa blok UI
- [ ] Saat offline, `supabase.upsert` tidak dipanggil; saat online/`backgroundSync`, flush memanggil `upsert` sekali per `(sessionId,key)` walau `onSetCompleted` dipanggil 3x
- [ ] Device B setelah login menampilkan `sessions` + `premium.events` yang sama dengan device A (hydrate `select where user_id`)
- [ ] `supabase.co/rest/v1/*` tidak pernah di-cache oleh SW (NetworkOnly)
- [ ] `showSv("Tersimpan")` tetap muncul lokal walau offline, tidak menunggu network
