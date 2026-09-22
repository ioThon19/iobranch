# SYSTEM DESIGN DOCUMENT (SDD)
## iobranch — Interactive 2D Pixel Art Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi Dokumen**: 2.1.0 (Sinkronisasi First-Attempt Lock, Practice Mode, & exploredBranches)  
**Status**: Approved Architecture Blueprint  
**Arsitek Sistem**: Lead Educational Game Architect & Software Engineer  
**Standar Rekayasa & Desain**: Standar Anti-Slop ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Riset Tindakan**: Penelitian Tindakan Kelas (PTK) Informatika Kelas X-10 (46 Murid, 23 Pasangan)  
**Jadwal Tindakan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  

---

## 1. Ikhtisar Sistem & Prinsip Arsitektur

### 1.1 Deskripsi Sistem
*iobranch* adalah media pembelajaran interaktif berbasis *Progressive Web App (PWA)* yang menggabungkan mesin game 2D Pixel Art retro (estetika konsol 16-bit klasik GBA) dengan mesin visualisasi penelusuran kode langkah demi langkah (*step-by-step code tracing*) dan diagram alir berstandar Flowgorithm SVG.

Sistem memvisualisasikan struktur kontrol percabangan (`if`, `if-else`, `else-if`, `switch-case`) sebagai **persimpangan jalan fisik di dunia game**, di mana karakter (*Hero*) melangkah menembus gerbang logika berdasarkan evaluasi kondisi nilai masukan yang diuji oleh murid.

### 1.2 Tumpukan Teknologi Resmi (*Official Tech Stack*)

| Komponen Arsitektur | Teknologi Terpilih | Justifikasi Teknis & Kepatuhan Anti-Slop |
|---|---|---|
| **Game Engine** | **Phaser 3 (v3.87+)** | Mesin game HTML5 native, konfigurasi `pixelArt: true` (rendering tajam nearest-neighbor), tekstur prosedural native, dan manajemen scene modular. |
| **Bahasa Pemrograman** | **TypeScript (v5.x)** | Type-safety penuh pada pemodelan modul soal, penanganan state percabangan, dan serialisasi data pasangan. Menjamin 0 error saat build produksi. |
| **Peralatan Build & Bundler** | **Vite (v6.x)** | Pembangunan bundel sangat cepat, tree-shaking efisien, dan integrasi penggelaran instan di Vercel. |
| **Styling & Tata Letak DOM** | **Pure Vanilla CSS (`src/style.css`)** | Menolak dependensi Tailwind CSS berlebih. Menggunakan CSS Variables terstruktur bertema *Warm Parchment & Forest Emerald*, ringan di GPU ponsel murah. |
| **Diagram Alir Logika** | **Flowgorithm SVG Renderer (`FlowgorithmView.ts`)** | Generator SVG native berstandar Flowgorithm (Oval, Jajar Genjang, Belah Ketupat, Persegi Panjang) yang menyala sinkron dengan baris kode aktif. |
| **PWA & Offline Engine** | **vite-plugin-pwa (Workbox)** | Otomatisasi Service Worker precaching untuk seluruh bundel aset dan skrip, menjamin aplikasi 100% berjalan normal dalam Mode Pesawat. |
| **Penyimpanan Lokal** | **IndexedDB (`idb-keyval`)** | Penyimpanan lokal asinkronus (~600 byte footprint), tidak memblokir render thread 60 FPS, tahan terhadap pembersihan memori otomatis peramban. |
| **Platform Penggelaran** | **Vercel** | Hosting statis global berkecepatan tinggi dengan HTTPS otomatis (syarat mutlak PWA Service Worker) dan nol biaya peladen. |

### 1.3 Pola Arsitektur: *Decoupled Hybrid Architecture (Canvas + Retro DOM)*
Sistem memisahkan tanggung jawab visual dunia game dan manipulasi teks kode menjadi dua lapisan yang berkomunikasi secara asinkronus melalui **Event Bus Terpusat (`EventCenter`)**:

```text
+-----------------------------------------------------------------------------+
|                            iobranch ARCHITECTURE                            |
+-----------------------------------------------------------------------------+
|  LAYER 1: GAME WORLD VIEWPORT (Phaser 3 Canvas 2D / WebGL)                  |
|  |-- BootScene (Pembangkit Tekstur Prosedural Peta, Ubin, Gedung, & Karakter)|
|  |-- WorldScene (Eksplorasi Kota Harmoni, Navigasi Virtual D-Pad, Rambu IF) |
|  |-- BattleScene (Arena Pertarungan 5 Ronde Logika Percabangan RPG)         |
|  +-- GateSystem (Gerbang IF & ELSE dengan Obor Logika Menyala & Palang Buka) |
+--------------------------------------+--------------------------------------+
|                                      |                                      |
|   ^ Event: 'GATE_OPENED'             |   v Event: 'RUN_SIMULATION'          |
|   |                                  |   |                                  |
|   +----------------------+           |   +----------------------------------+
|                          |           |   |
|                     +----+-----------+---v----+
|                     |  Phaser EventCenter Bus |
|                     +----+-----------+---^----+
|                          |           |   |
+--------------------------+-----------+---+----------------------------------+
|  LAYER 2: RETRO CONTROL PANEL (DOM / HTML5 / Pure Vanilla CSS / Warm Theme) |
|  |-- Onboarding Modal (Registrasi Tim Pasangan: Tim Absen XX-YY)            |
|  |-- Dual-Syntax Switcher (Saklar Instan Pseudocode ID <-> Bahasa C)        |
|  |-- Mindful Predict-First Gate (Input Nilai Variabel & Tebakan Alur Cabang)|
|  |-- Code Stepper & Flowgorithm SVG (Penyorotan Baris Aktif & Alur Diagram) |
|  |-- Virtual D-Pad Overlay (Kontrol Navigasi Sentuh Khusus Layar Ponsel)    |
|  |-- Terminal Konsol Retro (Pencetak Keluaran Program & Umpan Balik)        |
|  +-- Branch Coverage Tracker (Lencana Bintang & Bobot Kasus Terpadu)        |
+-----------------------------------------------------------------------------+
|  LAYER 3: CORE LOGIC & PERSISTENCE (TypeScript Services)                    |
|  |-- TracerEngine.ts (Mesin Penelusuran Baris Kode & Evaluator Relasional)  |
|  |-- CycleGuard.ts (Pengunci Materi Siklus II: Token Murid & PIN Guru)      |
|  |-- AudioService.ts (Sintesis Suara Retro 8-Bit via Native Web Audio API)  |
|  |-- StorageService.ts (Penyimpanan Asinkronus Sesi & Skor Formatif PTK)    |
|  +-- AssessmentExportService.ts (Ekspor Laporan TXT/CSV & Web Share API)    |
+-----------------------------------------------------------------------------+
```

---

## 2. Struktur Modul & Manajemen Berkas Proyek

Proyek diorganisasikan dalam struktur modular berbasis TypeScript dan Vite yang bersih tanpa dependensi tak terpakai:

```text
iobranch/
|-- package.json                # Definisi dependensi (Phaser 3, idb-keyval, Vite, PWA)
|-- tsconfig.json               # Konfigurasi compiler TypeScript ketat
|-- vite.config.ts              # Konfigurasi Vite + vite-plugin-pwa (Workbox)
|-- vercel.json                 # Konfigurasi rute & header PWA Vercel
|-- index.html                  # Shell HTML antarmuka hybrid
|
|-- public/
|   |-- favicon.ico
|   |-- manifest.webmanifest    # Metadata PWA standalone
|   `-- assets/
|       |-- icons/ (icon-192.png, icon-512.png)
|       `-- images/ (pak_budi_portrait.jpg)
|
`-- src/
    |-- main.ts                 # Titik masuk aplikasi (Bootstrap SPA)
    |-- style.css               # Desain sistem Warm Parchment & Forest Emerald
    |
    |-- types/
    |   |-- module.types.ts     # Definisi tipe Modul, Kasus, dan Langkah Tracing
    |   |-- session.types.ts    # Definisi tipe Sesi Pasangan, Skor Formatif, & Status
    |   `-- events.types.ts     # Definisi tipe komunikasi EventCenter
    |
    |-- game/
    |   |-- config.ts           # Konfigurasi Phaser 3 (Canvas, resolusi, physics)
    |   |-- EventCenter.ts      # Event bus jembatan Phaser <-> DOM
    |   `-- scenes/
    |       |-- BootScene.ts    # Pembangkit tekstur prosedural ubin & sprite
    |       |-- WorldScene.ts   # Scene peta Kota Harmoni & gerak Hero
    |       `-- BattleScene.ts  # Scene tantangan pertarungan logika 5 ronde
    |
    |-- ui/
    |   |-- UIManager.ts            # Pengendali utama 12 layar antarmuka DOM
    |   |-- SyntaxRenderer.ts       # Saklar tampilan Pseudocode ID <-> Bahasa C
    |   |-- FlowgorithmView.ts      # Generator diagram alir SVG standar Flowgorithm
    |   |-- VirtualPad.ts           # Kontrol sentuh D-Pad navigasi kanvas ponsel
    |   |-- TeamSymbolRenderer.ts   # Renderer lambang tim pixel art (4 simbol)
    |   |-- DialogBox.ts            # Kotak dialog typewriter interaktif
    |   `-- CoverageView.ts         # Penampil lencana bintang & bobot kasus telusur
    |
    |-- logic/
    |   |-- TracerEngine.ts     # Simulator penelusuran baris & evaluator relasional
    |   |-- CycleGuard.ts       # Pengunci modul Siklus II (Token Murid & PIN Guru)
    |   |-- materi.data.ts      # Bank materi pembelajaran konseptual (5 topik)
    |   `-- modules.data.ts     # Bank data kasus masalah nyata (5 kasus)
    |
    `-- services/
        |-- AudioService.ts             # Sintesis efek suara 8-bit native Web Audio
        |-- StorageService.ts           # Abstraksi IndexedDB & kalkulasi nilai formatif
        `-- AssessmentExportService.ts  # Layanan ekspor CSV/TXT & Web Share API
```

---

## 3. Desain Komponen Inti & Alur Kerja Data

### 3.1 Game Engine Scene Architecture (`Phaser 3`)
Sistem game mengadopsi resolusi dasar retro 480 x 240 pixel dengan penskalaan `Phaser.Scale.FIT` dan `pixelArt: true` guna menjamin ketajaman visual.

#### A. Tekstur Prosedural Native (`BootScene.ts`)
Alih-alih memuat berkas peta eksternal Tiled JSON yang rentan terhadap galat jaringan atau HTTP 404 saat mode luring, `BootScene.ts` membangkitkan tekstur ubin secara prosedural pada saat booting:
* Tekstur jalan setapak batu paving *Warm Parchment*.
* Tekstur ubin rumput emerald dan pepohonan kota.
* Tekstur gedung sekolah SMA Harmoni, lab komputer, perpustakaan, dan gerbang logika.
* Sprite karakter Hero 16x16 px dan sprite Guru Pak Budi.

#### B. Navigasi Peta & Waypoint Tracing (`WorldScene.ts`)
* **Mode Eksplorasi Peta Kota (Layar 02):**
  * Murid menggerakkan karakter Hero di Kota Harmoni menuju gedung-gedung misi.
  * Masukan Sentuh Ponsel: Ditangani oleh komponen `VirtualPad.ts` (D-Pad sentuh).
  * Masukan Keyboard Laptop: Tombol panah atau WASD.
* **Mode Penelusuran Lab Telusur (Layar 05):**
  * Kontrol bebas dinonaktifkan sementara.
  * Karakter digerakkan secara deterministik dari titik awal, berhenti di persimpangan untuk evaluasi kondisi, lalu melangkah membuka gerbang IF (jika TRUE) atau gerbang ELSE (jika FALSE).

#### C. Arena Tantangan Pertarungan Logika (`BattleScene.ts`)
* Beroperasi sebagai arena evaluasi logika berbasis giliran (*turn-based*):
  * Karakter murid menghadapi Bug Monster dalam 5 ronde kondisi percabangan.
  * Evaluasi kondisi dieksekusi melalui pilihan serangan yang sesuai dengan aturan logika tiap ronde.
  * Keputusan tepat memicu serangan kritis dan menambah capaian skor tantangan tim (0–100).
  * Menyediakan mode latihan mandiri pasca-penyelesaian tantangan resmi.

#### D. Komunikasi EventCenter (`EventCenter.ts`)

| Nama Event | Pengirim | Penerima | Deskripsi & Payload |
|---|---|---|---|
| `RUN_SIMULATION` | DOM UI | `WorldScene` | Memicu Hero berjalan menelusuri waypoint `{ inputVal: number, conditionResult: boolean }`. |
| `GATE_OPENED` | `WorldScene` | DOM UI | Mengabarkan gerbang IF/ELSE terbuka, memicu penyorotan baris aktif. |
| `HERO_COMPLETED_BRANCH` | `WorldScene` | DOM UI & Logic | Hero tiba di cabang akhir, memicu evaluasi bintang coverage & simpan progres. |
| `START_BATTLE` | `WorldScene` / UI | `BattleScene` | Membuka battle arena tantangan logika. |
| `EXECUTE_BATTLE_TURN` | DOM UI | `BattleScene` | Murid memilih aksi bertarung `{ action: string, isCorrect: boolean }`. |
| `BATTLE_RESOLVED` | `BattleScene` | DOM UI | Pertempuran tuntas `{ won: boolean, score: number }`. |
| `CYCLE_UNLOCKED` | `CycleGuard` | DOM Nav | Membuka modul 4 & 5 setelah token atau PIN diverifikasi. |

---

### 3.2 Mesin Evaluator Logika & Pemodelan Data (`TracerEngine.ts`)

#### A. Evaluator Relasional Aman (*Safe Expression Evaluator*)
Aplikasi menolak penggunaan fungsi berbahaya `eval()` atau `new Function()`. Evaluator ekspresi relasional menguraikan masukan secara eksplisit:

```typescript
// src/logic/TracerEngine.ts
export type RelationalOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export function evaluateCondition(leftValue: number, op: RelationalOperator, rightValue: number): boolean {
  switch (op) {
    case '==': return leftValue === rightValue;
    case '!=': return leftValue !== rightValue;
    case '>':  return leftValue > rightValue;
    case '<':  return leftValue < rightValue;
    case '>=': return leftValue >= rightValue;
    case '<=': return leftValue <= rightValue;
    default:   return false;
  }
}
```

#### B. Antarmuka Data Sesi Murid, Progres Modul, & Penilaian Formatif PTK

```typescript
// src/types/session.types.ts
export type TeamSymbol = 'algoritma' | 'biner' | 'matriks' | 'vektor';

export interface StudentSession {
  pairId: string;           // Diformat otomatis: 'Tim Absen XX-YY'
  student1Name: string;     // Nama lengkap Murid 1
  student1Absen: number;    // Nomor absen Murid 1
  student2Name: string;     // Nama lengkap Murid 2
  student2Absen: number;    // Nomor absen Murid 2
  teamSymbol: TeamSymbol;   // Lambang pixel art tim
  totalXp: number;          // Kompatibilitas sesi (default: 0)
  currentLevel: number;     // Level tim
  createdAt: number;        // Timestamp pembuatan sesi
}

export interface ModuleProgress {
  testedBranches: string[];    // Cabang yang TERBUKTI BENAR (hipotesis murid cocok) → menentukan skor & bintang
  exploredBranches?: string[]; // Cabang yang SUDAH DIJELAJAHI (simulasi selesai, terlepas dari benar/salah) → menentukan akses ke Tantangan
  stars: number;               // Jumlah bintang yang diraih (0, 1, atau 2)
  isCompleted: boolean;        // true jika semua cabang wajib sudah teruji
  xpEarned: number;            // XP yang diperoleh dari modul ini
  updatedAt: number;           // Timestamp pembaruan terakhir
}

export interface FormativeScores {
  tracingScore: number;          // Pilar 1: Nilai Telusur (Bobot 30/30/40, maks 100)
  battleScore: number;           // Pilar 2: Nilai Tantangan Bug Monster (0-100)
  evaluasiScore: number;         // Pilar 3: Nilai Evaluasi Mandiri 5 Soal (0-100)
  evaluasiAttemptCount: number;  // Jumlah percobaan pengerjaan evaluasi
  finalScore: number;            // Rerata berbobot penilaian formatif resmi (0-100)
  isTracingLocked: boolean;      // true → nilai telusur dikunci (first-attempt lock aktif)
  isBattleLocked: boolean;       // true → nilai tantangan dikunci (first-attempt lock aktif)
  isEvaluasiLocked: boolean;     // true → nilai evaluasi dikunci (first-attempt lock aktif)
  updatedAt: number;             // Timestamp pembaruan terakhir
}
```

**Semantik Pemisahan `testedBranches` vs `exploredBranches`**:
* `testedBranches`: hanya diisi saat prediksi hipotesis murid (`userPrediction`) BENAR sesuai cabang yang dieksekusi simulator. Ini yang menentukan skor dan bintang.
* `exploredBranches`: diisi setiap kali murid menyelesaikan simulasi penuh, meskipun hipotesisnya salah. Ini yang menentukan apakah tombol "Lanjut ke Tantangan" dapat ditekan.

---

### 3.3 Mesin Diagram Alir Flowgorithm SVG (`FlowgorithmView.ts`)
Komponen ini merender diagram alir SVG murni berstandar Flowgorithm:
* **Simbol Terminator (Oval Lonjong)**: Penanda `Mulai` dan `Selesai`.
* **Simbol Input/Output (Jajar Genjang)**: Masukan nilai dan pencetakan keluaran.
* **Simbol Keputusan (Belah Ketupat)**: Titik evaluasi ekspresi kondisi percabangan.
* **Simbol Proses (Persegi Panjang)**: Inisialisasi variabel dan penugasan nilai.
* **Konektor Panah Dinamis**: Garis alir yang berubah warna dan menebal saat alur cabang dieksekusi secara waktu nyata, memberikan pemahaman visual 1:1 terhadap baris kode di sampingnya.

---

### 3.4 Kontrol Sentuh Ponsel Pintar (`VirtualPad.ts`)
* Merender overlay D-Pad arah (Atas, Bawah, Kiri, Kanan) transparan di atas kanvas Phaser khusus pada tampilan mobile (lebar layar <= 768 px).
* Menangani sentuhan *touch events* (`touchstart`, `touchend`, `touchmove`) secara halus tanpa menghalangi pandangan kanvas.

---

### 3.5 Pengunci Siklus & Pengaturan Fleksibel (`CycleGuard.ts`)
* **Mode Siklus Default**: Siklus 1 aktif saat pendaftaran tim.
* **Pembukaan Siklus 2 Mandiri (Token Murid)**: Murid dapat memasukkan token `SIKLUS2` yang dibagikan oleh guru di kelas untuk membuka materi Modul 4 dan 5 secara permanen di gawainya.
* **Mode Demo Guru (Bypass Mode)**: Fasilitator guru dapat memasukkan PIN `PTK10` pada modal rahasia untuk mengaktifkan mode bebas eksplorasi seluruh landmark tanpa batasan urutan langkah, berguna untuk keperluan peragaan di depan kelas.

---

### 3.6 Layanan Penyimpanan & Penilaian Formatif (`StorageService.ts`)
Menggunakan `idb-keyval` untuk penyimpanan asinkronus yang andal. Seluruh operasi tulis dikomunikasikan via `formativeWritePromise` (promise chain serializer) untuk menghindari race condition:
* `saveSession()` / `getSession()`: Mengelola sesi tim belajar murid.
* `getModuleProgress(moduleId)` / `saveModuleProgress(moduleId, data)`: Membaca dan menyimpan data `ModuleProgress` per kasus, termasuk `testedBranches` dan `exploredBranches`.
* `getFormativeScores()`: Membaca skor formatif resmi yang sudah tersimpan (`tracingScore` dari nilai terkunci jika `isTracingLocked === true`), bukan menghitung ulang dari progress live:
  * Siklus 1: Kasus 1 (30 poin), Kasus 2 (30 poin), Kasus 3 (40 poin) -> Total 100 poin.
  * Siklus 2: Kasus 1 (15), Kasus 2 (15), Kasus 3 (20), Kasus 4 (25), Kasus 5 (25) -> Total 100 poin.
* `recordFirstAttemptTracing(score)`: Dikunci via promise chain; hanya menyimpan skor jika `isTracingLocked` belum aktif, lalu menandai `isTracingLocked = true`.
* `recordFirstAttemptBattle(score)`: Pola identik untuk pilar Tantangan; mengunci `isBattleLocked = true`.
* `recordFirstAttemptEvaluasi(score, attemptCount)`: Pola identik untuk pilar Evaluasi; mengunci `isEvaluasiLocked = true`.
* `generateProgressTextReport()`: Menghasilkan berkas ringkasan teks terstruktur yang merangkum seluruh data kasus uji, lencana, dan skor untuk disalin ke LKPD fisik.

---

### 3.7 Layanan Ekspor & Pengunggahan Cloud (`AssessmentExportService.ts`)
* **Otomatisasi Nama Berkas**:  
  `iobranch_Siklus[Cycle]_[CleanPairId]_[M1]_[M2].csv` dan `.txt`.
* **Pengunggahan Dua Jalur (Mobile-First)**:
  1. *Jalur Utama (Web Share API)*: Memicu jendela bagikan sistem operasi ponsel (Android/iOS) sehingga murid dapat memilih aplikasi Google Drive dan menyimpan ke folder kelas dalam 2 ketukan.
  2. *Jalur Cadangan (Fallback)*: Mengunduh berkas secara lokal dan membuka tautan Google Drive guru di tab peramban baru.

---

### 3.8 Sistem Mode Latihan & Flag State UIManager (`UIManager.ts`)
`UIManager` adalah pengendali utama 12 layar antarmuka DOM. Setelah implementasi v2.1.0, `UIManager` membawa tiga flag mode latihan yang diinisialisasi ulang setiap kali `setScreen()` dipanggil:

```typescript
// Tiga flag mode latihan (diinisialisasi di setScreen())
private isEvaluasiPracticeMode = false;  // true → evaluasi sedang dalam mode latihan
private isBattlePracticeMode   = false;  // true → tantangan sedang dalam mode latihan
private isTracingPracticeMode  = false;  // true → lab telusur sedang dalam mode latihan
```

**Alur Deteksi Mode Latihan**:
1. `setScreen('TRACING')` membaca `formativeScores.isTracingLocked` dari `StorageService`.
2. Jika `isTracingLocked === true` → set `isTracingPracticeMode = true` → tampilkan modal "Mode Latihan Lab Telusur" setelah 120 ms delay.
3. Seluruh operasi tulis di dalam `finishTraceRun()` dilewati jika `isTracingPracticeMode === true`.
4. Badge header Hero Card berubah dari hijau *"Lab Formatif"* menjadi abu-abu *"Mode Latihan"*.
5. Pola identik diterapkan pada `setScreen('BATTLE')` dan `setScreen('EVALUASI')`.

**Guard Storage pada Mode Latihan**:
* Saat `isTracingPracticeMode` aktif: `saveModuleCoverage`, `recordFirstAttemptTracing` tidak dipanggil.
* Hanya `exploredBranches` yang tetap diperbarui (murid tetap bisa menjelajahi cabang baru saat latihan).
* Saat `isBattlePracticeMode` atau `isEvaluasiPracticeMode` aktif: seluruh operasi tulis skor diblokir sepenuhnya.

---

## 4. Spesifikasi Token Desain Visual Resmi (`src/style.css`)

Mengikuti pedoman [anti-slop](https://github.com/miqdadbadjuber/anti-slop) dan tema resmi *Warm Parchment & Forest Emerald*:

```css
/* src/style.css - Official Design Tokens */
:root {
  /* Surface Tokens: Warm Parchment Theme */
  --bg-app: #F7F5F0;            /* Latar aplikasi anti-silau */
  --bg-canvas: #1C1917;         /* Bingkai kanvas game */
  --surface-panel: #FFFFFF;     /* Kartu panel putih bersih */
  --surface-panel-alt: #EFECE6; /* Sub-kartu ivory lembut */
  --surface-code: #18181B;      /* Kotak editor kode gelap kontras tinggi */
  
  /* Border Tokens */
  --border-subtle: #E5E0D8;     /* Garis batas netral halus */
  --border-retro: #D0C7B8;      /* Garis batas retro berkarakter */
  --border-focus: #0F766E;      /* Cincin fokus emerald */

  /* Brand & Status Tokens */
  --primary: #0F766E;           /* Deep Forest Emerald */
  --secondary: #D97706;         /* Warm Amber */
  --success: #15803D;           /* Crisp Emerald Green */
  --danger: #DC2626;            /* Crimson Red */
  --warning: #D97706;           /* Warm Ochre */

  /* State Tokens: Logika Boolean */
  --state-true-bg: rgba(21, 128, 61, 0.12);
  --state-true-border: var(--success);
  --state-true-text: #15803D;

  --state-false-bg: rgba(220, 38, 38, 0.12);
  --state-false-border: var(--danger);
  --state-false-text: #DC2626;

  --state-skipped-opacity: 0.35;

  /* Typography Colors */
  --text-primary: #1C1917;      /* Charcoal Ink berkontras tinggi */
  --text-secondary: #57534E;    /* Stone Slate netral */
  --text-muted: #78716C;        /* Warm Gray untuk metadata */

  /* Font Families */
  --font-pixel: 'Press Start 2P', monospace;
  --font-code: 'JetBrains Mono', monospace;
  --font-ui: 'Inter', sans-serif;
}
```

---

## 5. Strategi PWA, Service Worker, & Deployment

### 5.1 Konfigurasi PWA Workbox
* PWA dikonfigurasi melalui `vite-plugin-pwa` dengan strategi precaching otomatis untuk berkas HTML, CSS, JavaScript, font lokal, dan gambar statis.
* Memastikan aplikasi dapat dimuat ulang dan dijalankan 100% normal saat gawai berada dalam Mode Pesawat (*Airplane Mode*).

### 5.2 Konfigurasi Deployment Vercel (`vercel.json`)
* Menerapkan aturan rute SPA bersih (*clean URLs*) yang mengarahkan seluruh permintaan rute ke `index.html`.
* Menyematkan header keamanan dan perizinan Service Worker: `Service-Worker-Allowed: /`.

---

## 6. Uji Ketahanan Sistem & Penanganan Kasus Ekstrem (*Resilience Tests*)

Sesuai standar Craftsmanship Anti-Slop **C-4 (Resilience)**:
1. **Validasi Masukan Ekstrem:**
   * Masukan huruf pada kolom angka dibersihkan otomatis tanpa memicu galat `NaN`.
   * Nilai angka 0, minus, atau di luar ambang batas diproses secara matematis benar.
2. **Uji Resolusi Layar Ponsel Sempit (360 px):**
   * Di layar HP sempit (360 px), kanvas game tetap stabil di bagian atas dan formulir kontrol di bawahnya dapat di-scroll lancar tanpa ada teks atau tombol yang terpotong.
3. **Uji Ketahanan Luring Total:**
   * Saat koneksi internet dimatikan total, seluruh 12 layar, simulasi penelusuran, audio 8-bit, dan penyimpanan IndexedDB berfungsi normal tanpa kendala.
4. **Uji Pergantian Sesi Tim:**
   * Fitur ganti tim di menu pengaturan mereset data sesi secara bersih dan siap digunakan oleh pasangan murid berikutnya.

---

## 7. Status Dokumen

Dokumen `SDD.md` versi 2.1.0 ini merupakan cetak biru resmi yang merefleksikan 100% kondisi nyata kode sumber aplikasi **`iobranch`** per 22 September 2026, termasuk arsitektur First-Attempt Lock, Practice Mode System tiga pilar, dan pemisahan semantik `testedBranches` vs `exploredBranches`. Dokumen ini menjadi acuan mutlak bagi pelaksanaan dan analisis Penelitian Tindakan Kelas (PTK) Informatika SMA.
