# Konvensi Kode dan Arsitektur iobranch

Aturan ini wajib dipatuhi oleh agen AI saat menulis, mengubah, atau merefaktor kode di proyek **iobranch**.

---

## 1. Pola Arsitektur: Decoupled Hybrid Architecture

Sistem memisahkan dunia game 2D dan antarmuka kontrol menjadi lapisan independen:

1. **Layer 1: Game World Viewport (Phaser 3 Canvas)**
   - Bertanggung jawab murni atas visualisasi game 2D (Tilemap, Hero Sprite, Palang Gerbang Logika).
   - Dilarang mengakses atau memanipulasi elemen DOM aplikasi secara langsung.
2. **Layer 2: Retro Control Panel (HTML5 DOM)**
   - Bertanggung jawab atas interaksi siswa (Input nilai, tombol prediksi alur, saklar dwi-bahasa C / Pseudocode, penyorot baris kode, terminal output).
   - Dilarang memanggil instance internal scene Phaser secara langsung.
3. **Komunikasi Antar-Layer Melalui EventCenter**
   - Komunikasi antara Layer 1 dan Layer 2 **hanya boleh** melewati `EventCenter` (Phaser Event Bus terpusat).
   - Contoh event baku:
     - `RUN_SIMULATION`: Dikirim dari DOM ke Phaser saat siswa memulai penelusuran.
     - `STEP_HIGHLIGHT`: Dikirim untuk sinkronisasi baris kode yang sedang aktif.
     - `GATE_OPENED` / `GATE_BLOCKED`: Dikirim dari Phaser ke DOM saat karakter menabrak atau menembus gerbang.
     - `SIMULATION_COMPLETE`: Dikirim ke DOM saat karakter mencapai akhir jalur.
4. **Layer 3: Core Logic & Services (TypeScript murni)**
   - Layanan seperti `TracerEngine`, `CycleGuard`, `AudioService`, `StorageService`, dan `AssessmentExportService` harus berupa modul mandiri tanpa ketergantungan pada DOM maupun Phaser.

---

## 2. Standar TypeScript

- **Strict Mode**: Kode harus lolos kompilasi `tsc` dengan `strict: true`.
- **Larangan Tipe `any`**:
  - Dilarang menggunakan tipe `any`. Gunakan interface atau type eksplisit untuk model misi, langkah kode, status percabangan, dan konfigurasi state.
  - Untuk tipe dinamis yang belum diketahui formatnya, gunakan `unknown` disertai *type narrowing* atau *type guards*.
- **Eksplisit Return Type**: Semua fungsi dan method publik pada service atau engine wajib menyertakan return type secara eksplisit.
- **Immutability pada State**: State misi dan riwayat penelusuran tidak boleh diubah langsung secara mutasi objek; gunakan pola pembaruan *pure update* atau salinan objek baru (*immutable update*).

---

## 3. Penanganan Aset Game & Rendering

- **Pixel Art Fidelity**:
  - Konfigurasi game Phaser harus menyertakan `pixelArt: true` (menggunakan filter `nearest` agar rendering pixel 16-bit tetap tajam di semua DPI layar).
  - Skala canvas harus mendukung *responsive letterboxing* agar aspek rasio viewport game tidak terdistorsi di layar HP sempit (360px) maupun tablet.
- **Manajemen Siklus Hidup Scene**:
  - Hindari kebocoran memori (*memory leak*). Setiap listener pada `EventCenter` yang didaftarkan di dalam Scene wajib dibersihkan (`off`) saat Scene dimatikan (`shutdown` / `destroy`).

---

## 4. Kebersihan Komentar Kode (Anti-Slop R-35)

- Dilarang menulis komentar AI generik yang hanya mengulang baris kode (contoh: `// Inisialisasi variabel x`, `// Fungsi untuk menjalankan game`).
- Komentar hanya diizinkan untuk menjelaskan:
  1. Rasional arsitektural non-trivial.
  2. Alur logika evaluasi kondisi yang memerlukan kehati-hatian.
  3. Konteks keterkaitan dengan sintaks pembelajaran (Problem Based Learning / PTK).
