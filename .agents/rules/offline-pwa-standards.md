# Standar PWA Offline-First dan Ketahanan Penyimpanan

Aturan ini mengatur keandalan aplikasi **iobranch** di lingkungan kelas dengan koneksi internet terbatas atau tanpa internet sama sekali.

---

## 1. Prinsip 100% Offline-First (Zero-Infrastructure)

Aplikasi harus dapat beroperasi penuh tanpa jaringan internet setelah proses instalasi awal atau pemuatan pertama selesai:
- **Larangan CDN Eksternal**:
  - Dilarang memuat stylesheet, font, library JS, icon set, atau aset audio/gambar melalui link CDN publik (seperti cdnjs, unpkg, google fonts web link).
  - Semua font pixel/sans-serif harus di-bundle secara lokal di folder `public/fonts/` atau diimpor lewat CSS bundel Vite.
- **Service Worker & Precaching**:
  - Konfigurasi `vite-plugin-pwa` dengan Workbox harus mem-precach seluruh bundel: file HTML, script JS/TS, CSS, tilemap JSON, sprite atlas, dan audio lokal.
  - Terapkan strategi caching `CacheFirst` atau `StaleWhileRevalidate` yang konsisten untuk aset statis game.
- **Deteksi Status Jaringan**:
  - Sediakan indikator status koneksi yang halus (offline ready badge). Aplikasi tidak boleh menampilkan dialog popup peringatan yang mengganggu konsentrasi siswa jika internet terputus.

---

## 2. Penyimpanan Asinkronus (IndexedDB & idb-keyval)

Data progres belajar, lencana percabangan (*branch coverage*), dan hasil tes siswa disimpan di sisi klien:
- **Penyimpanan Non-Blocking**:
  - Gunakan `idb-keyval` untuk operasi baca/tulis data sesi berpasangan.
  - Dilarang menggunakan `localStorage` untuk payload besar yang berisiko memblokir thread rendering 60 FPS Phaser.
- **Resiliensi Data Corrupted & Fallback**:
  - Selalu bungkus operasi database dengan blok `try-catch` asinkron.
  - Jika IndexedDB dibatasi oleh browser (misal: mode penyamaran ketat tertentu), sediakan in-memory fallback transparan sehingga aktivitas belajar di kelas tetap berjalan lancar tanpa crash.
- **Integritas Format Ekspor**:
  - Fitur ekspor rekapitulasi penilaian kelas (ke format CSV atau Web Share API) harus dapat dijalankan secara instan tanpa membutuhkan koneksi server backend.
