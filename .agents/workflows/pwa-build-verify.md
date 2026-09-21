# Workflow: Verifikasi Build dan Pengujian PWA Offline

Alur kerja ini digunakan untuk memvalidasi proses build produksi, kesiapan Service Worker, dan kepatuhan PWA offline sebelum penggelaran (deployment).

---

## Tahapan Eksekusi

### 1. Validasi Tipe & Linter
Jalankan pemeriksaan tipe data TypeScript:
```powershell
npm run build
```
Pastikan kompilasi selesai dengan status keluar `0` tanpa pesan galat (*zero TypeScript errors*).

### 2. Audit Aset Bundle & Manifest
Periksa berkas output di folder `dist/`:
1. Pastikan `manifest.webmanifest` ter-generate dengan benar:
   - `display: "standalone"`
   - `orientation: "portrait"` (atau `"any"` sesuai kebutuhan)
   - Ikon PWA 192x192 dan 512x512 tersedia secara fisik.
2. Pastikan file `sw.js` (Service Worker Workbox) terbit dan menyertakan daftar precache seluruh aset statis (`assets/maps/*.json`, `assets/sprites/*`, font lokal, dan suara).

### 3. Pengujian Server Pratinjau Lokal
Jalankan preview build produksi:
```powershell
npm run preview
```
Buka browser dan lakukan pengujian:
1. Buka DevTools -> Application -> Service Workers. Pastikan Service Worker berstatus **Activated and is running**.
2. Centang opsi **Offline** di DevTools Network tab.
3. Muat ulang halaman (F5 / Ctrl+R):
   - Aplikasi harus tetap terbuka sempurna tanpa tampilan "No Internet / Dinosaurus".
   - Viewport game Phaser harus me-render tilemap dan sprite tanpa kegagalan fetch aset.

### 4. Pemeriksaan Console Bebas Galat
Pastikan tidak ada peringatan atau galat merah (*red error log*) di konsol browser selama proses interaksi awal dan navigasi antar-modul.
