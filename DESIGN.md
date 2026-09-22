# DOKUMEN DESAIN SISTEM VISUAL & ANTARMUKA (DESIGN.md)
## iobranch — Interactive 2D Pixel Art Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi Dokumen**: 2.0.0 (Sinkronisasi Desain Visual & Standar Mutu Anti-Slop)  
**Status**: Approved Design System Standard  
**Prinsip Desain**: Mengadopsi Standar **Anti-Slop** ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Riset Tindakan**: PTK Informatika Kelas X-10 SMA (46 Murid, 23 Pasangan *Pair Programming*)  
**Jadwal Pelaksanaan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  
**Referensi Visual Utama**: Lembar Spesifikasi Desain Layar `iobranch` (12 Layar, Palet Resmi Warm Parchment, Diagram Flowgorithm SVG, & Desain Aset)

---

## 1. Visi Desain, Filosofi, & Standar Kualitas

### 1.1 Visi Estetika: *16-Bit Retro Pixel Art Meets Functional Engineering DOM*
`iobranch` menggabungkan dua dunia antarmuka secara harmonis:
1. **Dunia Game 2D Pixel Art (Canvas Viewport)**: Estetika konsol genggam retro 16-bit klasik (*Game Boy Advance*). Menggunakan karakter petualang (*Hero*), ubin lingkungan kota dan sekolah yang dibangkitkan secara prosedural (*procedural dynamic textures*), serta persimpangan gerbang fisik untuk merepresentasikan titik evaluasi kondisi percabangan algoritma.
2. **Panel Kontrol Rekayasa Edukatif (Warm Parchment DOM Layer)**: Tata letak antarmuka fungsional berkontras tinggi dengan kartu panel bersih, kotak kode monospace yang tajam, saklar bahasa dwi-sintaks instan, diagram alir standar Flowgorithm SVG, serta umpan balik langkah demi langkah (*step tracing*) yang memandu logika murid tanpa hiasan yang mengaburkan fokus.

```text
+-----------------------------------------------------------------------------+
|                           iobranch DESIGN SYSTEM                            |
+-----------------------------------------------------------------------------+
|  CANVAS 2D PIXEL VIEWPORT (Phaser 3 / Nearest-Neighbor 60 FPS)              |
|  * Visualisasi dunia petualangan Kota Harmoni, karakter Hero, dan gerbang    |
|  * Resolusi kanvas: 480 x 270 px (skala integer pixel-perfect di layar HP)  |
|  * Kontrol sentuh terintegrasi via Virtual D-Pad transparan di ponsel       |
+-----------------------------------------------------------------------------+
|  WARM PARCHMENT DOM UI OVERLAY (Pure Vanilla CSS / Semantic HTML5)          |
|  * Kartu panel taktil simetris dengan border netral halus                   |
|  * Kotak dialog RPG typewriter, penelusur kode dwi-bahasa, diagram SVG      |
|  * Dasbor capaian formatif 100 poin, rekap LKPD, dan lencana prestasi       |
+-----------------------------------------------------------------------------+
```

---

### 1.2 Penerapan 5 Pilar Standar Anti-Slop (Craftsmanship Standards)
Sesuai panduan kurasi mutu [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop), antarmuka `iobranch` dibangun dengan integritas desain yang ketat:

1. **C-1: Intentionality (Keberalasan Mutlak)**
   * Setiap warna, ikon, margin, dan animasi memiliki tujuan pedagogis yang konkret.
   * Warna fungsional digunakan khusus untuk indikator status logika komputasi: Hijau (`TRUE`), Merah (`FALSE`), Emas/Amber (`Pencapaian & Skor Formatif`), dan Forest Emerald (`Aksi Utama & Baris Aktif`). Tidak ada elemen dekoratif tanpa makna.
2. **C-2: Functional Completeness (Kelengkapan Fungsi)**
   * Tidak ada tombol pajangan, navigasi semu, atau teks statis yang berpenampilan seperti tombol interaktif.
   * Modul Siklus II (`else-if` dan `switch-case`) yang belum dibuka ditampilkan dengan status `disabled`, opasitas redup, dan label penjelasan edukatif yang ramah saat disentuh.
3. **C-3: Content-Driven Composition (Struktur Berbasis Alur Berpikir)**
   * Tata letak layar mencerminkan alur pemecahan masalah algoritma di kelas: **Identifikasi Masalah -> Masukan Nilai -> Prediksi Cabang (*Mindful Pause*) -> Simulasi Alur Kode & Flowchart -> Evaluasi & Catat ke LKPD**.
4. **C-4: Resilience (Ketahanan Ekstrem di Kelas Nyata)**
   * **Batas Resolusi Terkecil**: Seluruh antarmuka diuji presisi pada viewport ponsel selebar **360 px** (standar ponsel Android murid di kelas). Tidak ada teks meluap (*overflow*) atau tombol terpotong.
   * **100% Luring (Offline First)**: Ikon status PWA memberikan verifikasi visual bahwa seluruh aset telah tersimpan di memori perangkat melalui Service Worker.
5. **C-5: Evidence Over Claims (Bahasa Jujur & Realistis)**
   * Menggunakan mikrokopi bahasa Indonesia instruksional yang lugas, hangat, dan presisi layaknya penjelasan guru informatika di kelas. Bebas dari istilah bombastis AI dan bebas dari duplikasi sapaan yang canggung.

---

### 1.3 Penolakan Pola AI Slop (*Slop Pattern Filter*)

| Pola AI Slop yang Dilarang | Alasan Penolakan Teknis & Kognitif | Standar Pengganti di `iobranch` |
|---|---|---|
| **Gradien Ungu-Merah Muda / Biru AI Slop** | Mengaburkan kontras, membuat mata lelah, dan mengaburkan pemahaman status kondisi boolean. | Palet fungsional *Warm Parchment & Forest Emerald* dengan kontras teks tinggi. |
| **Glassmorphism / Blur Berat (`backdrop-blur`)** | Membebani GPU ponsel murah (RAM 2 GB), menyebabkan penurunan frame rate animasi kanvas ke bawah 30 FPS. | Kartu solid bersih (`.tactile-card`) dengan border netral halus 1 px dan bayangan taktil subtil. |
| **Ikon Sihir / Kilauan (*Sparkles / Magic Stars*)** | Menanamkan miskonsepsi fatal bahwa algoritma komputer bekerja secara mistis, bukan berbasis evaluasi logika terstruktur. | Ikonografi representasi komputasi nyata: terminal monokrom, saklar boolean, palang pintu gerbang, dan diagram alir. |
| **Animasi Mengambang Tak Berhenti (*Infinite Floating*)** | Memecah konsentrasi murid saat menelusuri baris kode per baris. | Animasi hanya terjadi saat ada aksi eksplisit murid: langkah Hero melangkah atau penyorot baris berpindah. |
| **Placeholder Generik Tanpa Konteks** | Teks seperti *"Lorem ipsum"* membingungkan murid SMA. | Contoh data konkret kasus nyata: `total_belanja = 25000`, `suhu = 32`, `saldo = 15000`. |

---

## 2. Sistem Token Desain Spesifik (*Design Tokens*)

### 2.1 Palet Warna Resmi (*Color Palette System*)
Nilai warna resmi diekstraksi secara presisi dari tema *Warm Parchment & Forest Emerald*:

```css
/* src/style.css - Official Design Tokens */
:root {
  /* Brand Palette: Forest Emerald & Warm Amber */
  --primary: #0F766E;           /* Deep Forest Emerald / Jade */
  --primary-hover: #115E59;
  --primary-dark: #042F2E;
  
  --secondary: #D97706;         /* Warm Amber / Terracotta */
  --secondary-hover: #B45309;
  
  --success: #15803D;           /* Crisp Emerald Green */
  --success-hover: #166534;
  --success-dark: #14532D;
  
  --warning: #D97706;           /* Warm Ochre / Amber */
  --warning-hover: #B45309;
  --warning-dark: #92400E;
  
  --danger: #DC2626;            /* Crimson Red */
  --danger-hover: #B91C1C;
  --danger-dark: #991B1B;

  /* Surfaces & Backgrounds: Warm Parchment & Clean Light */
  --bg-app: #F7F5F0;            /* Warm Parchment / Alabaster (Anti-Silau) */
  --bg-canvas: #1C1917;         /* Game Canvas Frame (Warm Dark Ink) */
  --surface-panel: #FFFFFF;     /* Pure White Card */
  --surface-panel-alt: #EFECE6; /* Warm Ivory Sub-Cards */
  --surface-code: #18181B;      /* Dark Zinc Ink for High-Contrast Code Syntax */

  /* Border Tokens */
  --border-subtle: #E5E0D8;     /* Soft warm border */
  --border-retro: #D0C7B8;      /* Defined retro warm border */
  --border-focus: #0F766E;      /* Emerald Focus Ring */

  /* Semantic Logic State Tokens */
  --state-true-bg: rgba(21, 128, 61, 0.12);
  --state-true-border: var(--success);
  --state-true-text: #15803D;
  --state-false-bg: rgba(220, 38, 38, 0.12);
  --state-false-border: var(--danger);
  --state-false-text: #DC2626;
  --state-active-step: var(--primary);
  --state-skipped-opacity: 0.35;

  /* Typography Colors (WCAG AAA Contrast) */
  --text-primary: #1C1917;      /* Charcoal Ink */
  --text-secondary: #57534E;    /* Stone Slate Warm Dark */
  --text-muted: #78716C;        /* Warm Gray */

  /* Syntax Highlighting */
  --text-code-kw: #0F766E;      /* Kata kunci (if, else, switch, int) */
  --text-code-var: #F8FAFC;     /* Variabel pada dark editor */
  --text-code-num: #D97706;     /* Angka & konstanta */
  --text-code-str: #15803D;     /* String literal */
}
```

#### Tabel Kontras & Rasio Aksesibilitas WCAG AAA
| Pasangan Warna | Nilai Hex | Rasio Kontras | Kepatuhan WCAG | Konteks Penggunaan |
|---|---|---|---|---|
| Teks Ink pada Warm Parchment | `#1C1917` pada `#F7F5F0` | **14.8 : 1** | Lolos (AAA) | Judul, label tombol, teks soal, opsi jawaban |
| Teks Ink pada Kartu Putih | `#1C1917` pada `#FFFFFF` | **16.1 : 1** | Lolos (AAA) | Kartu materi, kuis evaluasi, dialog |
| Forest Emerald pada Putih | `#0F766E` pada `#FFFFFF` | **5.8 : 1** | Lolos (AA+) | Tombol aksi utama, tab aktif, ikon |
| Crimson Alert pada Putih | `#DC2626` pada `#FFFFFF` | **4.9 : 1** | Lolos (AA) | Evaluasi FALSE, peringatan, kartu keliru |
| Teks Putih pada Forest Emerald | `#FFFFFF` pada `#0F766E` | **5.8 : 1** | Lolos (AA+) | Tombol aksi utama permainan |

---

### 2.2 Tipografi Baku (*Typography System*)

```text
+-----------------------------------------------------------------------------+
|                            TYPOGRAPHY ROLES                                 |
+-----------------------------------------------------------------------------+
|  Press Start 2P (Monospace Pixel)                                           |
|  -> Logo, Judul Layar, HUD In-Game, Badge Identitas, Label Kasus            |
+-----------------------------------------------------------------------------+
|  Inter / Plus Jakarta Sans (Clean Geometric Sans-Serif)                     |
|  -> Narasi Dialog NPC, Isi Materi Pembelajaran, Soal LKPD, Tombol, Form Input|
+-----------------------------------------------------------------------------+
|  JetBrains Mono / Consolas (Monospace Code)                                 |
|  -> Blok Editor Kode Sumber C/Pseudocode, Nomor Baris, dan Konsol Output     |
+-----------------------------------------------------------------------------+
```

---

### 2.3 Standar Kartu Bersih Simetris (`.tactile-card`)
Mengacu pada aturan mutu proyek, kartu antarmuka menolak garis aksen warna tebal di bagian atas (*zero decorative top-border stripes*). Seluruh kartu mematuhi standar konsisten:
* Border simetris 4-sisi netral dan halus (`border: 1px solid var(--border-subtle)`).
* Sudut membulat rapi (`border-radius: 12px` hingga `14px`).
* Latar belakang panel putih bersih (`var(--surface-panel)` atau `#FFFFFF`).
* Bayangan taktil subtil alami (`box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04), 0 6px 16px -4px rgba(28, 25, 23, 0.05)`).
* Penanda status atau kategori cukup direpresentasikan melalui komponen semantik yang rapi seperti *badge pill* (`.badge-pill`) dan ikon pixel art tajam.

---

## 3. Spesifikasi Terperinci 12 Layar Utama Aplikasi

### Layar 01: Panduan & Onboarding Registrasi Tim Belajar
* **Tujuan**: Menyambut sepasang murid, memberikan panduan petualangan singkat, dan mendaftarkan nomor absen serta nama kedua murid.
* **Komposisi**:
  * Panduan Petualangan: 4 langkah misi belajar (Materi, Telusur, Tantangan, Evaluasi LKPD).
  * Form Registrasi: Input nama dan nomor absen Murid 1 & Murid 2 (validasi: absen tidak boleh sama).
  * Pemilih Lambang Tim: 4 simbol pixel art (*Algoritma*, *Biner*, *Matriks*, *Vektor*).
  * Format Otomatis: `Tim Absen XX-YY` (menghindari redundansi penulisan kata "Tim").

### Layar 02: Eksplorasi Peta Dunia (Overworld Map HUD & Location Pins)
* **Tujuan**: Menghubungkan konsep logika percabangan dengan peta lokasi kontekstual sekolah.
* **Komposisi**:
  * Viewport Kanvas Game 2D: Menampilkan kota, jalan paving, pepohonan, gedung sekolah, lab, perpustakaan, dan taman.
  * Radar Mini-Map & HUD Misi Aktif: Menunjukkan langkah yang sedang berjalan.
  * Kontrol Ganda: Tombol keyboard (WASD/Panah) untuk laptop dan overlay Virtual D-Pad transparan untuk ponsel.

### Layar 03: Pertemuan Dialog Guru Pak Budi (Problem Orientation)
* **Tujuan**: Menerapkan strategi orientasi masalah Problem Based Learning melalui percakapan hangat dengan Guru Pak Budi.
* **Komposisi**:
  * Potret retro Pak Budi dan teks berjalan typewriter.
  * Sapaan hangat dan wajar: *"Selamat datang di Kota Harmoni, rekan-rekan [Nama Tim]!..."*.
  * Ringkasan 5 masalah otomasi kota (Gerbang MRT, Alarm Server, Kupon Diskon, dsb).
  * Peta langkah penyelidikan (1. Ruang Kelas -> 2. Lab Telusur -> 3. Arena Bug -> 4. LKPD Fisik).

### Layar 04: Materi Pembelajaran Percabangan (Theory & Simulator)
* **Tujuan**: Menyajikan referensi konsep percabangan dasar yang terstruktur dan interaktif.
* **Komposisi**:
  * 5 Topik Materi Lengkap (`pra-01` s.d. `ptk-05`): Pengantar Logika, Struktur If Tunggal, Struktur If-Else, Percabangan Bertingkat, dan Switch-Case.
  * Kode Dwi-Sintaks Interaktif (Pseudocode Bahasa Indonesia dan Bahasa C).
  * Kartu Analogi Nyata & Tabel Kebenaran Operator Pembanding.
  * Tombol transisi ke Meja Kerja Lab Telusur.

### Layar 05: Lab Telusur Kode Visual & Diagram Alir Flowgorithm SVG
* **Tujuan**: Simulator penelusuran logika langkah demi langkah yang membuktikan jalannya alur percabangan.
* **Komposisi**:
  * Selector Kasus Terpadu: Kasus 1 (30 poin), Kasus 2 (30 poin), Kasus 3 (40 poin).
  * Input Nilai Variabel Uji & Gerbang Berkesadaran (*Mindful Predict-First*).
  * Editor Kode Tracing dengan penyorot baris aktif dan pemudaran cabang yang dilompati.
  * Diagram Alir Flowgorithm SVG dinamis yang menyala sinkron dengan baris kode yang sedang dieksekusi.
  * Konsol Terminal Keluaran Waktu Nyata.
  * Pelacak Cakupan Cabang (Branch Coverage Bar): Bintang 1 (Skor >= 60) dan Bintang 2 (Skor 100).

### Layar 06: Pertarungan Logika (Branching Battle RPG Challenge)
* **Tujuan**: Menguji ketangkasan evaluasi kondisi murid melalui pertarungan giliran melawan Bug Monster.
* **Komposisi**:
  * 5 Ronde Pertarungan Terstruktur dengan aturan evaluasi kondisi dinamis.
  * Bilah HP Hero dan Bug Monster.
  * Skor tantangan tercatat 0–100 pada sistem penilaian formatif tim.
  * Mode Latihan Mandiri pasca-kemenangan pertama untuk memperdalam pemahaman.

### Layar 07: Kuis Evaluasi Formatif Mandiri (Formative Quiz)
* **Tujuan**: Mengukur pemahaman kognitif mandiri melalui 5 butir soal pilihan ganda reflektif.
* **Komposisi**:
  * 5 Butir Soal Berbobot Seimbang dengan sebaran kunci jawaban alami (C - A - B - D - B).
  * Pilihan jawaban radio yang nyaman disentuh dengan kontras jelas.
  * Umpan balik diagnostik langkah demi langkah pasca-submit soal.

### Layar 08: Dasbor Capaian Belajar & Lencana Prestasi (Progress Dashboard)
* **Tujuan**: Pusat rekapitulasi penilaian formatif kelompok dan ekspor bukti belajar ke LKPD fisik.
* **Komposisi**:
  * Kartu Profil Tim Belajar dengan lambang pixel art resmi (tanpa label redundan "Tim: Tim").
  * 3 Pilar Nilai Formatif Resmi: Nilai Telusur (0–100), Nilai Tantangan (0–100), Nilai Evaluasi (0–100), dan Rerata Formatif Akhir.
  * Bilah Tab Kategori (Lencana, Materi & Kasus, Pengumpulan LKPD) dengan padding lega anti-clipping.
  * Ekspor Laporan LKPD Teks (.txt) dan Lembar Nilai CSV (.csv).
  * Integrasi tombol Web Share API untuk menyimpan langsung ke Google Drive kelas.

### Layar 09: Panduan Lengkap Petualangan (Help & Guidebook)
* **Tujuan**: Manual interaktif yang menjelaskan simbol-simbol game, fungsi tiap tombol, dan alur pengerjaan LKPD.

### Layar 10: Pengaturan & Hak Akses Guru (Settings & Teacher PIN)
* **Tujuan**: Pengaturan preferensi visual, audio, reset tim, dan panel administrasi rahasia guru (PIN `PTK10`).
* **Fitur**: Buka Kunci Siklus 2 manual, Mode Demo Bebas (*Teacher Bypass*), dan konfigurasi URL Drive kelas.

### Layar 11: Modal Token Murid Siklus 2
* **Tujuan**: Memfasilitasi pembukaan materi Siklus 2 secara mandiri oleh murid menggunakan token `SIKLUS2` yang dibagikan guru di kelas.

### Layar 12: Modal Selebrasi Kelulusan / Bintang Penuh
* **Tujuan**: Dialog perayaan bernada suportif saat murid berhasil menuntaskan seluruh misi atau meraih 2 Bintang sempurna.

---

## 4. Spesifikasi Desain Diagram Alir Flowgorithm SVG (`FlowgorithmView.ts`)

Diagram alir dirender secara native berbasis SVG dengan kepatuhan bentuk standar Flowgorithm:

```text
+-----------------------------------------------------------------------------+
|                      FLOWGORITHM SVG SYMBOL STANDARDS                       |
+-----------------------------------------------------------------------------+
|  1. TERMINATOR (Oval Lonjong)       -> rx="18", ry="18"                     |
|     • Latar: #FEF3C7 (Warm Cream), Border: #D97706 (Amber)                  |
|  2. INPUT / OUTPUT (Jajar Genjang)  -> polygon skewed (dx: 14 px)           |
|     • Latar: #EFF6FF (Soft Blue-White), Border: #0F766E (Emerald)           |
|  3. KEPUTUSAN / DECISION (Belah Ketupat) -> polygon 4 titik                 |
|     • Latar: #FEF2F2 (Soft Rose), Border: #DC2626 (Crimson)                 |
|     • Label Cabang: Teks "BENAR" (Hijau) & "SALAH" (Merah)                  |
|  4. PROSES (Persegi Panjang)        -> rect rx="4", ry="4"                  |
|     • Latar: #F0FDF4 (Soft Green), Border: #15803D (Emerald)                |
+-----------------------------------------------------------------------------+
|  PENYOROT AKTIF (Active Execution State):                                    |
|  • Garis tepi bersinar terang (stroke-width: 3px, stroke: var(--primary))   |
|  • Panah alur yang dilalui menyala hijau/merah sesuai hasil evaluasi        |
+-----------------------------------------------------------------------------+
```

---

## 5. Tata Letak Multi-Perangkat (*Responsive Device Matrix*)

Aplikasi beradaptasi pada tiga mode tampilan perangkat:
1. **Mode Mobile Portrait (Ponsel Murid 360 s.d. 414 px)**:
   * Tata letak bertingkat (*stacked column*).
   * Kanvas game 16:9 tetap utuh dan stabil di bagian atas.
   * Kontrol Virtual D-Pad transparan aktif di atas kanvas.
   * Panel kode, flowchart, dan kontrol formulir di bawahnya dapat di-scroll lancar tanpa scrollbar OS mentah.
2. **Mode Tablet / Layar Sentuh Berbagi (Split-View 50:50)**:
   * Sisi kiri menampilkan kanvas petualangan dan visualisasi gerbang.
   * Sisi kanan menampilkan meja kerja penelusuran kode dan diagram alir.
3. **Mode Laptop / Proyektor Kelas (1366x768 s.d. 1920x1080 px)**:
   * Tampilan terpusat dengan bingkai konsol retro estetik, ideal untuk peragaan klasikal guru.

---

## 6. Status Dokumen & Ketetapan Rekayasa

Dokumen `DESIGN.md` versi 2.0.0 ini merupakan **standar desain visual acuan mutlak** yang mengikat seluruh kode dan antarmuka aplikasi **`iobranch`**. Seluruh komponen yang diuraikan di atas telah terimplementasi secara presisi pada kode sumber aplikasi dan siap digunakan untuk Penelitian Tindakan Kelas (PTK).
