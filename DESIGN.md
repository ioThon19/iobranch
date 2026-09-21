# DOKUMEN DESAIN SISTEM VISUAL & ANTARMUKA (DESIGN.md)
## iobranch — Interactive 2D Pixel Art Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi Dokumen**: 1.0.0  
**Status**: Approved Design System Standard  
**Prinsip Desain**: Mengadopsi Standar **Anti-Slop** ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Riset Tindakan**: PTK Informatika Kelas X-10 SMA (46 Murid, 23 Pasangan *Pair Programming*)  
**Jadwal Pelaksanaan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  
**Referensi Visual Utama**: Lembar Spesifikasi Desain Layar `iobranch` (Desain 12 Layar, Palet Resmi, & Desain Aset)

---

## 1. Visi Desain, Filosofi, & Standar Kualitas

### 1.1 Visi Estetika: *16-Bit Retro Pixel Art Meets Functional Engineering DOM*
`iobranch` menggabungkan dua dunia antarmuka secara harmonis:
1. **Dunia Game 2D Pixel Art (Canvas Viewport)**: Estetika konsol genggam retro 16-bit klasik (*Game Boy Advance / Pokémon Emerald / Harvest Moon: Friends of Mineral Town*). Menggunakan karakter petualang (*Hero*), ubin lingkungan (*tileset* alam dan sekolah), serta persimpangan gerbang fisik untuk merepresentasikan titik pengambilan keputusan dalam algoritma.
2. **Panel Kontrol Rekayasa Edukatif (Retro DOM Layer)**: Tata letak antarmuka fungsional berkontras tinggi dengan bingkai piksel bertekstur, kotak kode monospace yang tajam, saklar bahasa dwi-sintaks instan, serta umpan balik langkah-demi-langkah (*step tracing*) yang jelas tanpa hiasan yang mengalihkan fokus kognitif murid.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           iobranch DESIGN SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  CANVAS 2D PIXEL VIEWPORT (Phaser 3 / Nearest-Neighbor 60 FPS)              │
│  • Visualisasi dunia petualangan, kota sekolah, karakter Hero, dan gerbang  │
│  • Resolusi kanvas: 480 × 270 px (skala integer pixel-perfect di layar HP)  │
├─────────────────────────────────────────────────────────────────────────────┤
│  RETRO GBA DOM UI OVERLAY (Tailwind CSS / Semantic HTML5)                   │
│  • Bingkai retro pixelated (box-shadow bertingkat tanpa blur)               │
│  • Kotak dialog RPG typewriter, penelusur kode, dan pelacak cakupan cabang │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Penerapan 5 Pilar Standar Anti-Slop (Craftsmanship Standards)
Sesuai panduan kurasi mutu [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop), antarmuka `iobranch` dibangun dengan integritas desain yang ketat:

1. **C-1: Intentionality (Keberalasan Mutlak)**
   * Setiap warna, ikon, margin, dan animasi memiliki tujuan pedagogis yang konkret.
   * Warna cerah **hanya** digunakan untuk indikator status logika komputasi: Hijau (`TRUE`), Merah (`FALSE`), Kuning/Emas (`XP / Star Progress`), dan Cyan (`Baris Eksekusi Aktif`). Tidak ada elemen dekoratif acak.
2. **C-2: Functional Completeness (Kelengkapan Fungsi)**
   * Tidak ada tombol pajangan, navigasi pura-pura, atau teks statis yang berpenampilan seperti tombol.
   * Modul Siklus II (`else-if` dan `switch-case`) yang belum dibuka ditampilkan dengan status `disabled`, opasitas redup, dan ikon gembok fungsional (🔒) yang menampilkan pesan ramah edukatif saat disentuh.
3. **C-3: Content-Driven Composition (Struktur Berbasis Alur Berpikir)**
   * Tata letak layar mencerminkan alur pemecahan masalah algoritma di kelas: **Identifikasi Masalah -> Masukan Nilai -> Prediksi Cabang (*Mindful Pause*) -> Simulasi Alur Kode -> Evaluasi & Catat ke LKPD**.
4. **C-4: Resilience (Ketahanan Ekstrem di Kelas Nyata)**
   * **Batas Resolusi Terkecil**: Seluruh antarmuka diuji presisi pada viewport ponsel selebar **360 px** (standar ponsel Android murah murid). Tidak ada teks meluap (*overflow*) atau tombol terpotong.
   * **100% Luring (Offline First)**: Ikon sinyal PWA di pojok kiri bawah memberikan verifikasi visual hijau bahwa seluruh aset telah tersimpan di memori perangkat melalui Service Worker.
5. **C-5: Evidence Over Claims (Bahasa Jujur & Realistis)**
   * Menggunakan mikrokopi bahasa Indonesia instruksional yang lugas, hangat, dan presisi layaknya penjelasan Guru Informatika di kelas. Bebas dari istilah bombastis AI seperti *"Kecerdasan Super"*, *"Revolusi Masa Depan"*, atau *"Dashboard Ajaib"*.

---

### 1.3 Penolakan Pola AI Slop (*Slop Pattern Filter*)

| Pola AI Slop yang DILARANG | Alasan Penolakan Teknis & Kognitif | Standar Pengganti di `iobranch` |
|---|---|---|
| **Gradien Ungu-Merah Muda / Pelangi Acak** | Mengaburkan kontras, membuat mata lelah, dan mengaburkan pemahaman status kondisi boolean. | Palet fungsional *Deep Slate* (`#0B132B`) dengan aksen warna logika semantik murni. |
| **Glassmorphism / Blur Berat (`backdrop-blur`)** | Membebani GPU ponsel murah (RAM 2 GB), menyebabkan penurunan frame rate animasi kanvas ke bawah 30 FPS. | Kartu solid retro (`#131D2E`) dengan garis tepi tajam berulang 2 px (`border: 2px solid #2A3A54`). |
| **Ikon Sihir / Kilauan (*Sparkles / Magic Stars*)** | Menanamkan miskonsepsi fatal bahwa algoritma komputer bekerja secara mistis/ajaib, bukan berbasis evaluasi logika deterministik. | Ikon representasi komputasi nyata: terminal monokrom, saklar boolean, palang pintu gerbang, dan diagram alur panah. |
| **Animasi Mengambang Tak Berhenti (*Infinite Floating*)** | Memecah konsentrasi murid saat menelusuri baris kode per baris. | Animasi hanya terjadi saat ada aksi eksplisit murid: langkah Hero melangkah, permata gerbang menyala, atau penyorot baris berpindah. |
| **Placeholder Generik Tanpa Konteks** | Teks seperti *"Lorem ipsum"* atau *"Ketik teks di sini..."* membingungkan murid X-10. | Contoh data konkret kasus nyata: `total_belanja = 25000`, `suhu = 32`, `skor = 80`. |

---

## 2. Sistem Token Desain Spesifik (*Design Tokens*)

### 2.1 Palet Warna Resmi (*Color Palette System*)
Nilai warna diekstraksi secara presisi dari lembar acuan desain `iobranch`:

```css
/* src/style.css - Official Rebranded Light Theme Design Tokens (Zero Blue AI-Slop) */
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
  --surface-light: #FFFFFF;     /* Clean White Surface */
  --surface-light-alt: #F4F1EA; /* Soft Off-White */

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
  --state-skipped-opacity: 0.4;

  /* Typography Colors (WCAG AAA Contrast) */
  --text-primary: #1C1917;      /* Ink Black / Deep Charcoal */
  --text-secondary: #57534E;    /* Stone Slate Warm Dark */
  --text-code-kw: #0f766e;      /* Syntax: Kata kunci (if, else, switch, int) */
  --text-code-var: #1c1917;     /* Syntax: Nama variabel (nilai, total_belanja) */
  --text-code-num: #d97706;     /* Syntax: Angka & konstanta (75, 25000) */
  --text-code-str: #15803d;     /* Syntax: String literal ("Lulus", "Diskon") */
}
```

#### Tabel Kontras & Rasio Aksesibilitas WCAG AAA (Tema Terang Anti-Slop)
| Pasangan Warna | Nilai Hex | Rasio Kontras | Kepatuhan WCAG | Konteks Penggunaan |
|---|---|---|---|---|
| Teks Ink pada Warm Parchment | `#1C1917` pada `#F7F5F0` | **14.8 : 1** | Lolos (AAA) | Judul, label tombol, teks soal, opsi jawaban |
| Teks Ink pada Kartu Putih | `#1C1917` pada `#FFFFFF` | **16.1 : 1** | Lolos (AAA) | Kartu materi, kuis evaluasi, dialog |
| Forest Emerald pada Putih | `#0F766E` pada `#FFFFFF` | **5.8 : 1** | Lolos (AA+) | Tombol aksi utama, tab aktif, ikon |
| Crimson Alert pada Putih | `#DC2626` pada `#FFFFFF` | **4.9 : 1** | Lolos (AA) | Evaluasi `FALSE`, peringatan, kartu keliru |
| Teks Hitam pada Emas CTA | `#000000` pada `#F59E0B` | **11.8 : 1** | Lolos (AAA) | Tombol utama "Mulai" di menu utama |

---

### 2.2 Tipografi Baku (*Typography System*)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TYPOGRAPHY ROLES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Press Start 2P (Monospace Pixel)                                           │
│  → Logo, Judul Layar, HUD In-Game, Badge Level, Skor XP, & Label Status     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Inter / Plus Jakarta Sans (Clean Geometric Sans-Serif)                     │
│  → Narasi Dialog NPC, Isi Materi Pembelajaran, Soal LKPD, Tombol, Form Input │
├─────────────────────────────────────────────────────────────────────────────┤
│  JetBrains Mono / Consolas (Monospace Code)                                 │
│  → Blok Editor Kode Sumber C/Pseudocode, Nomor Baris, dan Konsol Output     │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Rincian Ukuran & Bobot Tipografi
| Level / Peran | Font Family | Ukuran (px) | Bobot (Weight) | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Logo Produk** | `Press Start 2P` | 20 px | 400 | 1.4 | 1.0 px |
| **Judul Layar / Sub-judul** | `Press Start 2P` | 14 px | 400 | 1.6 | 0.5 px |
| **HUD / Badge Label** | `Press Start 2P` | 9–10 px | 400 | 1.4 | 0.2 px |
| **Heading Modul (H1)** | `Inter` | 18 px | 700 (Bold) | 1.3 | -0.2 px |
| **Subheading (H2/H3)** | `Inter` | 15 px | 600 (SemiBold) | 1.4 | 0 px |
| **Body / Konten Teks** | `Inter` | 14 px | 400 (Regular) | 1.6 | 0 px |
| **Body Bold / Penekanan** | `Inter` | 14 px | 600 (SemiBold) | 1.6 | 0 px |
| **Teks Tombol Aksi** | `Inter` | 14 px | 600 (SemiBold) | 1.0 | 0.2 px |
| **Teks Dialog NPC** | `Inter` | 14 px | 500 (Medium) | 1.5 | 0 px |
| **Teks Kode Sumber** | `JetBrains Mono` | 13 px | 500 (Medium) | 1.7 | 0 px |
| **Nomor Baris Kode** | `JetBrains Mono` | 12 px | 400 (Regular) | 1.7 | 0 px |
| **Mikrokopi / Metadata** | `Inter` | 11–12 px | 400 (Regular) | 1.4 | 0 px |

---

### 2.3 Sistem Bingkai, Sudut (*Radius*), & Bayangan Retro (*Pixel Border Matrix*)

Menolak penggunaan *drop-shadow blur* modern yang kabur. Sebagai gantinya, antarmuka menggunakan **Bayangan Kotak Piksel Padat (*Solid Pixel Box Shadow*)** yang merefleksikan perangkat keras konsol klasik:

```css
/* src/style.css - Retro Pixel Border Utility Classes */

/* 1. Bingkai Luar Kotak Kartu Dialog & Panel Retro */
.pixel-card {
  background-color: var(--surface-panel);
  border: 2px solid var(--border-retro);
  box-shadow: 
    0 -3px 0 0 #000000,
    0 3px 0 0 #000000,
    -3px 0 0 0 #000000,
    3px 0 0 0 #000000;
  border-radius: 4px;
}

/* 2. Tombol Aksi Retro 3D (Timbul) */
.pixel-btn-primary {
  background-color: var(--brand-cyan);
  color: #050B14;
  font-weight: 600;
  border: none;
  box-shadow: 
    inset -2px -2px 0 0 #1D4ED8,
    inset 2px 2px 0 0 #93C5FD,
    0 0 0 2px #000000;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.05s ease;
}

.pixel-btn-primary:active {
  box-shadow: 
    inset 2px 2px 0 0 #1D4ED8,
    0 0 0 2px #000000;
  transform: translateY(2px);
}

/* 3. Tombol Emas Utama (CTA "MULAI") */
.pixel-btn-gold {
  background-color: var(--cta-gold);
  color: #000000;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  box-shadow: 
    inset -3px -3px 0 0 var(--cta-gold-dark),
    inset 3px 3px 0 0 #FDE68A,
    0 0 0 2px #000000;
  border-radius: 3px;
}

.pixel-btn-gold:active {
  box-shadow: 
    inset 3px 3px 0 0 var(--cta-gold-dark),
    0 0 0 2px #000000;
  transform: translateY(2px);
}

/* 4. Penjepit Kanvas Rendering Pixel-Perfect */
canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

---

### 2.4 Sistem Spasi & Skala Geometris (*Spacing Grid*)
Mengadopsi skala berbasis kelipatan **4 px** dan **8 px** untuk menjaga keselarasan proporsi di seluruh komponen:

| Token Spasi | Nilai (px) | Penggunaan Spesifik |
|---|---|---|
| `space-1` | 4 px | Radius sudut mikro, jarak antar ikon dan teks kecil |
| `space-2` | 8 px | Padding tombol kecil, celah daftar opsi jawaban, margin antar-tag |
| `space-3` | 12 px | Padding dalam sel kode, jarak vertikal antar-paragraf dialog |
| `space-4` | 16 px | Padding standar kartu panel, margin antar-komponen utama |
| `space-5` | 20 px | Celah antar-kolom layout split-view |
| `space-6` | 24 px | Padding kontainer halaman luar |
| `space-8` | 32 px | Jarak vertikal antar-seksi besar di halaman beranda |

---

## 3. Spesifikasi Terperinci 12 Layar Utama

Dokumen ini membedah setiap layar dari lembar spesifikasi desain resmi menjadi arsitektur komponen yang siap diprogram:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      iobranch SCREEN ARCHITECTURE                           │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│ 01. Halaman Menu Utama       │ 02. Eksplorasi Peta Dunia    │ 03. Dialog NPC│
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ 04. Materi Pembelajaran      │ 05. Penelusur Kode (Tracing) │ 06. Simulasi  │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ 07. Latihan Soal Evaluasi    │ 08. Umpan Balik Kognitif     │ 09. Pencapaian│
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ 10. Pengaturan & Preferensi  │ 11. Ketahanan Mode Luring    │ 12. Aset & UI │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

---

### Layar 01: Halaman Awal / Menu Utama (Hero Landing)
* **Tujuan Pedagogis**: Membangun suasana belajar yang menggembirakan (*Joyful Learning*), menyambut pasangan murid (*Murid 1 & Murid 2*), dan mengonfirmasi kesiapan luring gawai sebelum memulai pembelajaran di kelas.
* **Komposisi Tata Letak**:
  * **Sisi Kiri / Latar Belakang (Viewport 2D Canvas)**: Ilustrasi pixel art karakter petualang berpakaian biru dengan tas ransel cokelat dan anjing pendamping kuning di atas tebing berumput hijau, menatap lembah kota sekolah bernuansa kastil retro di bawah langit biru cerah.
  * **Sisi Kiri Bawah (Status PWA)**: Pil lencana status `[ 📶 PWA - Offline Ready ]` berwarna hijau toska dengan indikator denyut (*pulse dot*).
  * **Sisi Kanan (Hero Title & Navigation Card)**:
    * Logo: Ikon cabang cyan bercabang dua + teks judul `iobranch` (`Press Start 2P`, 18 px).
    * Sub-judul: *"Telusuri Logika, Temukan Solusinya"* (14 px, SemiBold).
    * Deskripsi Ringkas: *"Media pembelajaran interaktif untuk memahami algoritma percabangan melalui petualangan seru."* (12 px, Regular, `#94A3B8`).
    * **Gugus Tombol Menu (Vertikal)**:
      1. `▶ Mulai`: Tombol emas tebal (`--cta-gold`), font pixel, aksi membuka modal registrasi pasangan *pair programming*.
      2. `📖 Materi`: Tombol abu-abu slate (`--surface-panel-alt`), membuka indeks materi Bab Percabangan.
      3. `⚙ Pengaturan`: Mengatur volume suara chiptune dan preferensi visual.
      4. `🚪 Keluar / Ganti Akun`: Mereset sesi aktif pasangan untuk berganti gawai.
    * Kutipan Kaki: *"Langkah kecil hari ini, logika besar untuk masa depan."* (11 px, Italic, `#64748B`).

---

### Layar 02: Eksplorasi Peta (Game World Overworld)
* **Tujuan Pedagogis**: Menghubungkan konsep abstrak logika percabangan dengan peta lokasi kontekstual sekolah. Menghilangkan kecemasan belajar murid (*math/coding anxiety*) melalui navigasi ruang yang ramah.
* **Komposisi Tata Letak**:
  * **Tampilan Peta (Top-Down Tilemap)**: Peta berukuran $32 \times 32$ tile (resolusi ubin 16×16 px).
    * **Gedung Sekolah (Materi)**: Tempat utama mempelajari teori percabangan dasar.
    * **Perpustakaan (Baca/Referensi)**: Tempat membaca buku glosarium dan tabel kebenaran logika.
    * **Lab Komputer (Simulasi Tracing)**: Tempat misi penelusuran kode dan uji kasus percabangan.
    * **Taman Kota (Latihan Soal)**: Lokasi tantangan kuis pemecahan masalah kontekstual.
  * **HUD Atas (Heads-Up Display)**:
    * Label Lokasi (Kiri Atas): Kapsul gelap berbingkai `📍 Kota Harmoni` (10 px, pixel font).
    * Radar Mini-Map (Kanan Atas): Persegi $64 \times 64$ px dengan grid hijau dan titik kuning penanda posisi karakter pemain.
  * **HUD Bawah (Objective Tracker & Dialog Cepat)**:
    * Banner Misi Aktif: *"Tujuan Saat Ini: Bicaralah dengan Guru Informatika di sekolah."* Disertai ikon kompas cyan yang berdenyut lembut.
    * Balon Dialog Karakter Guru (Pak Budi): Muncul otomatis saat mendekati gerbang sekolah dengan teks pemandu awal.

---

### Layar 03: Dialog Karakter NPC (Story Scaffolding Engine)
* **Tujuan Pedagogis**: Menerapkan strategi *scaffolding* (bimbingan bertahap) melalui dialog interaktif dengan Guru Informatika (Pak Budi) dan rekan sebaya untuk mengklarifikasi miskonsepsi logika sebelum memulai penugasan mandiri.
* **Komposisi Tata Letak**:
  * **Visual Scene**: Interior ruang kelas retro. Meja guru kayu, papan tulis hijau bertuliskan diagram if-else, dan jendela kaca berbingkai kayu. Sprite Pak Budi (kacamata, dasi, kemeja putih) berdiri di depan meja menghadap karakter pemain.
  * **Kotak Dialog Retro (Bawah)**:
    * Label Pembicara: `Pak Budi` dalam kotak timbul berwarna biru gelap.
    * Kotak Teks Typewriter: Teks dialog dicetak huruf per huruf (kecepatan 25 ms/karakter) dengan bunyi klik mikro 8-bit sintetis.
      > *"Dalam algoritma percabangan, kita sering menemukan kondisi seperti if-else. Kamu sudah paham cara kerjanya?"*
    * **Panel Pilihan Respon Murid (Multi-Branch Interaction)**:
      * `🔘 Sudah, Pak.` -> Melompat langsung ke tantangan simulasi.
      * `🔘 Masih bingung.` -> Pak Budi memberikan analogi sederhana (contoh payung saat hujan).
      * `🔘 Bisa dijelaskan lagi?` -> Menampilkan penjelasan sintaks dasar dan diagram alur.
    * Tombol Indikator Lanjut: Segitiga kedip `▶` di pojok kanan bawah kotak dialog.

---

### Layar 04: Materi Pembelajaran (Modular Concept Reader)
* **Tujuan Pedagogis**: Menyajikan referensi konsep percabangan dasar yang terstruktur, padat, dan bebas jargon membingungkan, mendukung pencapaian **IKTP-1 (Konsep & Operator)**.
* **Komposisi Tata Letak (Split-View)**:
  * **Sidebar Kiri (Indeks Materi)**:
    * Tab 1: `1. Pengantar` (Status: Aktif, berlatar biru `--brand-cyan` dengan teks tebal).
    * Tab 2: `2. Sintaks`
    * Tab 3: `3. Contoh Program`
    * Tab 4: `4. Latihan Soal`
    * Tab 5: `5. Evaluasi`
  * **Panel Konten Utama (Kanan)**:
    * Header: `1. Konsep If-Else`
    * Teks Konsep: *"If-else adalah struktur kontrol yang digunakan untuk menjalankan blok kode tertentu berdasarkan evaluasi suatu kondisi boolean."*
    * **Diagram Alur Logika Visual (*Mini Flowchart*)**:
      * Kotak belah ketupat keputusan `Kondisi?` dengan dua jalur cabang:
        * Cabang Hijau `Ya` -> Kotak Aksi 1 (`hasil = "Lulus"`).
        * Cabang Merah `Tidak` -> Kotak Aksi 2 (`hasil = "Belum Lulus"`).
    * **Blok Kode Contoh Sintaks**:
      * Nomor baris 1 s.d. 5, sintaks kata kunci `if` dan `else` disorot warna cyan, string literal warna hijau.
    * **Kotak Petunjuk Khusus (*Pro-Tip Callout*)**:
      * Latar kuning redup bertuliskan: *"💡 Tips: Operator perbandingan yang sering digunakan: ==, !=, >, <, >=, <="*.
    * Tombol Navigasi Bawah: `◀ Sebelumnya` dan `Selanjutnya ▶`.

---

### Layar 05: Penelusuran Kode Langkah-demi-Langkah (Step-by-Step Code Tracing)
* **Tujuan Pedagogis**: Mematahkan kebiasaan buruk murid menebak langsung hasil akhir (*guessing*), dengan melatih kemampuan menelusuri eksekusi program baris per baris secara sistematis, mendukung pencapaian **IKTP-2 (Code Tracing)**.
* **Komposisi Tata Letak**:
  * **Header Kontrol**: Saklar dwi-sintaks instan `[ Pseudocode ]` | `[ Bahasa C ]`.
  * **Kolom Kiri (Editor Kode Sumber Tracing)**:
    * Bingkai gelap (`#050B14`) dengan penomoran baris 1 s.d. 10.
    * **Indikator Baris Aktif**: Baris yang sedang dieksekusi memiliki latar belakang menyala biru/hijau dan indikator panah kursor kecil `▶`.
    * **Indikator Cabang Dilewati (*Skipped Branch*)**: Baris di dalam blok yang tidak memenuhi syarat kondisi otomatis meredup (*opacity: 0.35*), membuktikan secara visual bahwa baris tersebut dilompati oleh komputer.
  * **Kolom Kanan (Pemeriksa Langkah Eksekusi / State Inspector)**:
    * Urutan langkah berangka:
      1. `Inisialisasi nilai = 80`
      2. `Cek kondisi: nilai >= 75 ?`
      3. `Hasil: TRUE` (Lencana hijau terang timbul)
      4. `Jalankan blok if -> printf("Lulus")`
      5. `Selesai`
    * **Kotak Terminal Output**:
      * Menampilkan teks murni keluaran program: `Lulus`.
  * **Bilah Kontrol Pemutaran (*Playback Stepper Bar*)**:
    * `|◀` (Lompat ke Awal), `◀` (Langkah Mundur), `▶` (Langkah Maju), dan `Reset`.

---

### Layar 06: Pertarungan Logika (Branching Battle Challenge)
* **Tujuan Pedagogis**: Menguji pemahaman percabangan melalui simulasi turn-based RPG yang menggembirakan. Murid harus mengevaluasi kondisi statistik pertempuran agar dapat memilih aksi serangan yang valid.
* **Komposisi Tata Letak**:
  * **Arena Tempur 2D Pixel**:
    * Sisi Kiri Atas: Musuh (`Bug Monster Lv. 4`, HP: `28/40` dengan bilah darah merah-kuning).
    * Sisi Kanan Bawah: Karakter Petualang Murid (`Kamu Lv. 3`, HP: `32/32` dengan bilah energi hijau).
  * **Panel Logika Percabangan (Kanan Atas)**:
    * Kotak Aturan Kondisi: `Kondisi: HP musuh > 50 ?`
    * Kartu Keputusan Bersyarat:
      * `Jika Ya -> Serangan A (Critical Strike)` (Kartu Hijau)
      * `Jika Tidak -> Serangan B (Normal Strike)` (Kartu Merah)
  * **Menu Perintah Bawah (Command Action Bar)**:
    * `[ ⚔ Serang ]` (Tombol merah timbul)
    * `[ 🎒 Item ]` (Tombol abu-abu slate)
    * `[ 📖 Belajar ]` (Membuka contekan materi sintaks if-else)
    * `[ 🏃 Lari ]` (Mundur kembali ke peta)
  * Baris Dialog Aksi: *"Pilih aksi serangan yang sesuai dengan evaluasi kondisi!"*

---

### Layar 07 & 08: Latihan Soal, Evaluasi, & Umpan Balik Kognitif
* **Tujuan Pedagogis**: Mengukur pemahaman kognitif murid secara formatif dan memberikan umpan balik diagnostik langsung tanpa menjatuhkan motivasi, mendukung pencapaian **IKTP-3 (Analisis Logika)**.
* **Komposisi Layar 07 (Pengerjaan Soal)**:
  * Indikator Progres: `Soal 3 dari 5` dilengkapi bilah kemajuan hijau persentase.
  * Teks Masalah Kontekstual:
    > *"Jika nilai = 60, maka hasil dari jalannya program berikut adalah..."*
  * Kotak Kode Program: Potongan kode percabangan ringkas yang harus dianalisis murid.
  * **Pilihan Ganda Radio Retro**:
    * `🔘 A. Lulus`
    * `🔘 B. Belum Lulus` (Kondisi dipilih: border menyala cyan tebal)
    * `🔘 C. Error`
    * `🔘 D. 60`
  * Karakter avatar murid berdiri di samping kotak soal dengan ekspresi berpikir.
  * Tombol Aksi: `[ Cek Jawaban ]` (Warna biru terang).
* **Komposisi Layar 08 (Hasil & Umpan Balik Diagnostik)**:
  * Kartu Hasil: Latar hijau emerald dengan ikon centang tebal `✔ Jawaban Kamu Benar!`.
  * Penjelasan Logis Sederhana: *"Karena nilai = 60 (< 75), maka kondisi bernilai FALSE sehingga cabang ELSE yang dijalankan."*
  * **Daftar Runtutan Eksekusi (*Execution Trace Checklist*)**:
    * `✔ 1. Cek kondisi: 60 >= 75 -> FALSE`
    * `✔ 2. Lompat ke blok else`
    * `✔ 3. hasil = "Belum Lulus"`
  * Tombol Lanjut: `[ Lanjut ke Soal Berikutnya ▶ ]`.

---

### Layar 09: Progres & Pencapaian Murid (Gamification Dashboard)
* **Tujuan Pedagogis**: Memvisualisasikan perkembangan kompetensi belajar murid secara positif melalui lencana ketercapaian, mendukung motivasi intrinsik dan pencapaian **IKTP-4 (Cakupan Kasus Uji)**.
* **Komposisi Tata Letak**:
  * **Header Profil Kelompok Berpasangan (*Collaborative Team Header*)**:
    * **Lencana Anggota Pasangan**:
      * `👥 Anggota: Raka (Absen 12) & Budi (Absen 08)`
      * Identitas Meja: `📍 Meja 03`
    * **Lencana Tim**: `[ 🛡️ Tim Algoritma ]` — Tingkat: `Lv. 3 Petualang Logika`.
    * **Bilah Pengalaman Kolektif (Team XP Bar)**: `120 / 300 XP` (warna hijau emerald cerah dengan teks angka tajam).
  * **Tab Navigasi Dashboard**: `[ Pencapaian ]` | `[ Materi ]` | `[ Statistik Tracing ]`.
  * **Daftar Lencana Prestasi (Achievement Badges)**:
    1. `Mengenal If-Else` (Lencana Emas Bersinar 🌟): *"Menyelesaikan latihan pertama"* (Tercapai: 22 Sep 2026).
    2. `Penjelajah Logika` (Lencana Biru Kompas 🧭): *"Selesaikan 5 misi percabangan"* (Status: Progres 3/5).
    3. `Master Kondisi` (Lencana Abu-abu Gembok 🔒): *"Selesaikan seluruh latihan If-Else tanpa kesalahan"* (Status: Terkunci).
  * **Kartu Pengumpulan Data Formatif (*Formative Submission Card*)**:
    * Bingkai: Kartu solid retro `#131D2E` bergaris batas emas tebal 2 px (`border: 2px solid #F59E0B`), padding 16 px.
    * Header Kartu: `📥 Rekap Hasil Misi Belajar` (`Press Start 2P`, 11 px, warna emas `--cta-gold`).
    * Teks Pemandu: *"Kirimkan laporan kemajuan belajarmu ke Google Drive Guru sebagai bukti penyelesaian misi kelompok."* (12 px, `#94A3B8`).
    * Format Nama Berkas Otomatis: `iobranch_S1_Meja[XX]_[Murid1]_[Murid2].csv`.
    * **Gugus Tombol Aksi Pengumpulan**:
      1. `[ 📤 Kirim Rekap ke Google Drive ]`: Tombol utama (lebar 100%, tinggi 48 px, latar `--brand-cyan`, border retro, teks tebal `Inter` 14 px putih). Memicu Web Share API native HP untuk langsung mengunggah file ke Google Drive (tautan default: `https://s.id/drive-ptk-x10`).
      2. `[ 💾 Simpan File CSV Cadangan ]`: Tombol sekunder (lebar 100%, tinggi 48 px, latar `--surface-panel`, border `#2A3A54`, teks abu-abu terang). Mengunduh berkas `.csv` fisik ke memori gawai sebagai cadangan luring.

---

### Layar 10: Pengaturan & Preferensi Sistem (Settings)
* **Tujuan Pedagogis**: Memberikan kenyamanan aksesibilitas gawai bagi seluruh murid, termasuk murid dengan keterbatasan penglihatan atau preferensi audio di kelas yang bising.
* **Komposisi Tata Letak**:
  * **Sidebar Menu Kategori**:
    * `⚙ Umum` (Aktif)
    * `🔊 Audio & Efek`
    * `🎮 Kontrol Sentuh`
    * `ℹ Tentang Aplikasi`
  * **Panel Pengaturan Kanan**:
    * **Pilihan Bahasa**: Dropdown menu retro `[ Bahasa Indonesia ▾ ]`.
    * **Mode Tampilan**: Saklar toggle `Layar Penuh (Full Screen)` [On/Off].
    * **Efek Partikel & Animasi**: Saklar toggle `Efek Visual Ringan` [On/Off] (fitur hemat baterai).
    * **Volume Audio Chiptune**: Penggeser slider 0 s.d. 100% untuk efek suara ketukan retro.
  * **Menu Rahasia Fasilitator Guru (*Teacher Admin Modal* - PIN `PTK10`)**:
    * Pemicu: Ketuk 3 kali pada logo `iobranch` di bilah atas aplikasi.
    * Autentikasi: Input PIN rahasia 5 karakter (`PTK10`).
    * **Kontrol Khusus Guru**:
      1. `Gembok Materi`: Saklar toggle `Buka Kunci Materi Siklus II (Modul 4 & 5)` [Aktifkan / Kunci].
      2. `Tautan Google Drive`: Kolom input teks URL tujuan pengumpulan. Nilai bawaan: `https://s.id/drive-ptk-x10`. Guru dapat mengganti URL ini sewaktu-waktu jika folder Drive kelas diperbarui di hari pelaksanaan.
      3. Tombol `[ Simpan Pengaturan Guru ]` (Tinggi 48 px, latar hijau `--state-true-border`).

---

### Layar 11: Ketahanan Mode Luring (Offline Resilience Architecture)
* **Tujuan Pedagogis**: Menjamin kegiatan belajar mengajar di laboratorium/kelas tetap berlangsung mulus 100% tanpa hambatan kuota atau sinyal WiFi sekolah yang tidak stabil.
* **Komposisi Tata Letak**:
  * Banner Verifikasi Luring: Kartu hijau gelap dengan ikon centang tebal `✔ Siap Offline!`.
  * Pesan Transparan: *"Semua modul materi, simulasi tracing, dan bank soal telah tersimpan di gawai. Kamu dapat belajar dan berlatih kapan saja tanpa koneksi internet."*
  * **Tiga Pilar Penyimpanan Data Luring**:
    1. `Game Assets (Precached via Workbox Service Worker)`: Gambar tileset, sprite karakter, dan suara chiptune.
    2. `Materi & Modul Kasus (Application Bundle)`: Data kasus terstruktur dalam JavaScript murni.
    3. `Progres Sesi Murid (IndexedDB)`: Catatan jawaban, XP, dan lencana tersimpan aman di penyimpanan lokal peramban.

---

### Layar 12: Katalog Komponen UI & Desain Aset Pixel Art
* **Tujuan Pedagogis**: Panduan referensi baku untuk perancang grafis dan programmer agar seluruh aset visual yang dimasukkan ke dalam game memiliki gaya visual yang seragam dan kohesif.
* **Spesifikasi Aset Pixel Art**:
  * **Karakter Pemain (*Hero Sprite*)**: Grid $16 \times 16$ px, 4 arah hadap (Bawah, Atas, Kiri, Kanan), 3 frame animasi jalan (*walk cycle*).
  * **Karakter Guru & NPC**: Grid $16 \times 20$ px dengan ekspresi wajah ramah.
  * **Musuh / Monster Algoritma**: *Bug Monster* (serangga hijau berkacamata), *Syntax Goblin* (merah bertanduk), *Logic Slime* (biru berair).
  * **Ubin Lingkungan (*Tileset*)**: Ubin rumput, jalur tanah berkerikil, jembatan kayu, air beranimasi 2 frame, pagar pembatas, bunga, pohon rindang, dan dinding batu bata sekolah.
  * **Ikon Antarmuka Retro**: Buku catatan, roda gigi, koin XP, bintang prestasi, tas item, dan terminal kode.

---

## 4. Matriks Komponen Antarmuka & Status Interaksi

Setiap komponen wajib memiliki perilaku visual eksplisit pada setiap *state* untuk menjamin konsistensi interaksi:

### 4.1 Tombol Aksi (*Action Buttons*)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Default     │  │      Hover      │  │     Active      │  │    Disabled     │
│   Border Timbul │  │  Warna Lebih    │  │ Bergeser 2px    │  │  Grayscale 50%  │
│   Tinggi 48 px  │  │  Terang + Glow  │  │ Ke Bawah (Klik) │  │  Cursor Blocked │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

| Tipe Tombol | Latar Belakang (Default) | Border & Bayangan | State Hover | State Active (Klik) | State Disabled |
|---|---|---|---|---|---|
| **Primary Blue** | `#38B2F6` | Bayangan biru tua `#1D4ED8` | Latar `#60A5FA` | Geser ke bawah 2 px, bayangan rata | Abu-abu `#374151`, teks `#9CA3AF`, kursor not-allowed |
| **CTA Gold (Mulai)** | `#F59E0B` | Bayangan emas gelap `#D97706` | Latar `#FBBF24` | Geser ke bawah 2 px | Opasitas 50%, tanpa bayangan timbul |
| **Secondary Slate** | `#1F2937` | Border tipis `#374151` | Latar `#374151` | Latar `#111827`, border `#4B5563` | Opasitas 40% |
| **Success Green** | `#10B981` | Bayangan hijau tua `#047857` | Latar `#34D399` | Geser ke bawah 2 px | Abu-abu redup |
| **Danger Red** | `#EF4444` | Bayangan merah tua `#B91C1C` | Latar `#F87171` | Geser ke bawah 2 px | Abu-abu redup |

* **Ukuran Minimum Sentuhan (*Touch Target*)**: Area sentuh minimal **48×48 px** (tinggi minimal **48 px**) dengan lebar proporsional untuk mencegah salah sentuh di layar ponsel bersama sesuai standar WCAG 2.2 AAA.

---

### 4.2 Kotak Penelusuran Kode (*Code Block & Stepper*)
* **Penomoran Baris**: Rata kanan, lebar 28 px, warna teks `#64748B`, font monospace 12 px.
* **Baris Netral**: Latar transparan, teks perintah putih terang (`#F8FAFC`).
* **Baris Aktif (Active Execution Line)**:
  * Latar: `rgba(56, 178, 246, 0.22)`.
  * Garis Tepi Kiri: `border-left: 4px solid #38B2F6`.
  * Teks: Menyala terang dengan indikator kursor panah `▶`.
* **Baris Cabang Terpenuhi (`TRUE Branch`)**:
  * Latar: `rgba(16, 185, 129, 0.20)`.
  * Garis Tepi Kiri: `border-left: 4px solid #10B981`.
* **Baris Cabang Dilewati (*Skipped Branch*)**:
  * Latar: Transparan.
  * Opasitas: Diturunkan menjadi **35% (`opacity: 0.35`)** untuk menegaskan bahwa blok ini tidak dibaca oleh komputer.

---

### 4.3 Formulir Masukan & Kontrol Pilihan (*Input Controls*)
* **Kotak Masukan Angka Uji (*Numeric Input Box*)**:
  * Dimensi: Tinggi 44 px, padding horizontal 12 px, font `JetBrains Mono` 16 px tebal (mencegah zoom otomatis pada peramban iOS/Android).
  * Latar: `#050B14`, border `2px solid #2A3A54`.
  * State Fokus: Border berubah menjadi `2px solid #38B2F6` dengan pendaran halus tanpa blur.
  * Validasi: Hanya menerima karakter angka. Huruf dan simbol otomatis ditolak tanpa memicu error sistem.
* **Kotak Pilihan Ganda (*Radio Option Card*)**:
  * Susunan: Kartu horizontal penuh dengan label huruf (`A`, `B`, `C`, `D`) di dalam lingkaran retro kecil.
  * State Belum Terpilih: Latar `#131D2E`, border `2px solid #2A3A54`.
  * State Terpilih: Latar `rgba(56, 178, 246, 0.15)`, border `2px solid #38B2F6`, lingkaran huruf berwarna cyan penuh.
* **Saklar Toggle (*Retro Switch*)**:
  * Dimensi: $48 \times 24$ px.
  * State Mati (OFF): Latar `#374151`, tuas kotak abu-abu di sebelah kiri.
  * State Hidup (ON): Latar `#10B981`, tuas kotak putih bergeser ke sebelah kanan.

---

### 4.4 Sistem Kotak Dialog RPG (*NPC Dialog Box*)
* **Dimensi**: Membentang penuh di bagian bawah layar dengan margin luar 12 px.
* **Avatar Pembicara**: Kotak potret $48 \times 48$ px di sisi kiri dengan bingkai piksel ganda.
* **Efek Teks Mengetik (*Typewriter Effect*)**: Karakter teks muncul berurutan dengan jeda 25 milidetik per karakter. Mengklik sembarang area dialog saat teks sedang berjalan akan langsung memunculkan seluruh teks secara instan (*skip typewriter*).
* **Indikator Lanjut**: Segitiga piksel berkedip di pojok kanan bawah dengan laju 500 milidetik.

---

## 5. Pola Interaksi, Gerak Animasi, & Audio Sintetik

### 5.1 Pedoman Gerak Animasi (*Motion Design*)
Animasi dalam `iobranch` menganut prinsip **reponsif, fungsional, dan ramah performa**:
1. **Langkah Karakter Hero (*Walk-Cycle*)**:
   * Kecepatan Animasi: 8 frame per detik (125 ms per frame).
   * Kecepatan Gerak Antar-Waypoint: Interpolasi linier konstan 120 px/detik.
2. **Gerbang Logika Membuka**:
   * Saat kondisi `TRUE`: Obor permata gerbang menyala hijau dalam waktu 150 ms, palang kayu bergeser ke atas dalam waktu 300 ms (`ease-out`).
   * Saat kondisi `FALSE`: Palang gerbang alternatif yang bergeser.
3. **Penyorot Baris Kode (*Code Stepper Glow*)**:
   * Transisi perpindahan sorotan baris: 100 ms dengan transisi warna latar instan agar penelusuran nalar terasa tegas.

---

### 5.2 Sintesis Efek Suara 8-Bit Native (*Web Audio API*)
Tanpa menggunakan berkas `.mp3` atau `.wav` eksternal. Seluruh efek suara dibangkitkan langsung melalui generator gelombang suara (*oscillator*) peramban:

```typescript
// Konfigurasi Frekuensi Suara Chiptune Retro
export const AUDIO_CRAFT = {
  // 1. Suara dialog typewriter (klik mikro lembut)
  DIALOG_TICK: { freq: 480, duration: 0.02, type: 'square', volume: 0.05 },

  // 2. Suara tombol ditekan (blip retro standar)
  BUTTON_BLIP: { freq: 330, duration: 0.04, type: 'square', volume: 0.08 },

  // 3. Suara kondisi bernilai TRUE / Langkah Berhasil
  LOGIC_TRUE: { freq: 587.33, duration: 0.08, type: 'triangle', volume: 0.1 },

  // 4. Suara kondisi bernilai FALSE / Gerbang Alternatif
  LOGIC_FALSE: { freq: 220.00, duration: 0.12, type: 'sawtooth', volume: 0.08 },

  // 5. Suara Kemenangan 2 Bintang (Arpeggio Retro C5 - E5 - G5 - C6)
  VICTORY_FANFARE: [
    { freq: 523.25, delay: 0 },
    { freq: 659.25, delay: 70 },
    { freq: 783.99, delay: 140 },
    { freq: 1046.50, delay: 210 }
  ]
};
```

---

## 6. Tata Letak Multi-Perangkat (*Responsive Device Matrix*)

Aplikasi wajib beradaptasi dengan sempurna pada tiga mode penggunaan perangkat di sekolah:

```
┌──────────────────────┐  ┌──────────────────────────────────────────────────┐
│   MOBILE PORTRAIT    │  │            DESKTOP / LAPTOP (16:9)               │
│   (Lebar 360-414 px) │  │            (Resolusi 1920 × 1080 px)             │
├──────────────────────┤  ├────────────────────────┬─────────────────────────┤
│  CANVAS VIEWPORT     │  │                        │  PANEL KONTROL KODE     │
│  (Rasio 16:9 Atas)   │  │   DUNIA GAME CANVAS    │  • Editor dwi-sintaks   │
├──────────────────────┤  │   (Phaser 3 Engine)    │  • Input angka uji      │
│  PANEL KONTROL DOM   │  │   Skala besar tajam    │  • Stepper eksekusi     │
│  • Kode & Penelusur  │  │   dengan frame GBA     │  • Konsol umpan balik   │
│  • Input & Tombol    │  │                        │                         │
│  (Scrollable Bawah)  │  │                        │                         │
└──────────────────────┘  └────────────────────────┴─────────────────────────┘
```

1. **Mode Mobile Portrait (Ponsel Murid di Meja Praktikum - 360 s.d. 414 px)**:
   * Tata letak vertikal bertingkat (*stacked column*).
   * Bagian atas: Kanvas dunia pixel 16:9 tetap terlihat stabil.
   * Bagian bawah: Panel interaksi kode dan form input dapat digulir (*scroll*) secara mulus dengan jempol tangan tanpa menutupi kanvas visual.
2. **Mode Mobile Landscape & Tablet (Gawai Berbagi Pasangan - 16:9)**:
   * Tata letak berdampingan (*split view* 50 : 50).
   * Kiri: Dunia game pergerakan Hero dan gerbang logika.
   * Kanan: Panel dialog, editor penelusur kode, dan form jawaban.
3. **Mode Laptop / Proyektor Kelas Guru (1366×768 s.d. 1920×1080 px)**:
   * Tampilan terpusat dengan bingkai konsol retro estetik (*retro arcade bezel*).
   * Memudahkan demonstrasi klasikal oleh guru di depan kelas.

---

## 7. Pedoman Konten, Mikro-Kopi, & Nada Suara (*Tone of Voice*)

Bahasa yang digunakan dalam `iobranch` merefleksikan karakter guru informatika yang mengayomi, membimbing, dan menghargai proses bernalar murid:

### 7.1 Pedoman Suara Antarmuka
* **Ramah dan Mengajak Berpikir**: Hindari kesan menghakimi saat jawaban murid salah. Alih-alih menuliskan *"Salah! Kamu tidak teliti!"*, gunakan kalimat pembimbing: *"Nilai 60 belum memenuhi syarat >= 75. Coba telusuri kembali: cabang mana yang seharusnya terbuka?"*
* **Istilah Baku dan Konsisten**:
  * Gunakan istilah **"Kondisi"** (bukan *syarat* atau *tes*).
  * Gunakan istilah **"Percabangan"** (bukan *cabang-cabang*).
  * Gunakan istilah **"Penelusuran Alur"** untuk padanan *Code Tracing*.
  * Gunakan istilah **"Kasus Uji"** untuk padanan *Test Case / Branch Coverage*.

### 7.2 Contoh Salinan Teks Nyata (*Microcopy Matrix*)
| Konteks Antarmuka | Teks yang TEPAT di `iobranch` | Teks yang DITOLAK (Slop/Kasar) |
|---|---|---|
| **Selamat Datang** | *"Halo Petualang! Bersama rekanmu, mari pecahkan teka-teki logika gerbang sekolah."* | *"Selamat datang di AI canggih generasi masa depan!"* |
| **Instruksi Tracing** | *"Masukkan angka belanjamu, lalu tebaklah gerbang mana yang akan terbuka sebelum menjalankan simulasi."* | *"Klik tombol untuk mulai."* |
| **Umpan Balik Sukses** | *"Luar biasa! Analisis logikamu tepat sasaran. Kedua cabang (IF dan ELSE) kini telah teruji sempurna!"* | *"Skor kamu 100! Kamu jenius!"* |
| **Umpan Balik Keliru** | *"Tebakanmu sedikit meleset. Perhatikan operator `>=`: apakah 25000 lebih besar atau sama dengan 25000?"* | *"Jawaban salah. Coba lagi."* |
| **Gembok Siklus II** | *"Misi Siklus II (else-if & switch-case) tersimpan rapi di laboratorium. Akan dibuka bersama Guru pada pertemuan berikutnya!"* | *"Fitur terkunci. Beli versi pro atau masukkan lisensi."* |

---

## 8. Matriks Penyelarasan Desain terhadap 4 IKTP Riset Tindakan Kelas

Setiap komponen visual pada desain `iobranch` terikat langsung dengan instrumen pengukuran keberhasilan kognitif murid:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PTK RESEARCH ALIGNMENT MATRIX                            │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ Target Indikator PTK  │ Komponen Desain Visual Penunjang                    │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ IKTP-1: Konsep Dasar  │ • Papan rambu fisik 'IF?' di persimpangan jalan     │
│ & Operator Relasional │ • Diagram belah ketupat mini di tab Materi          │
│                       │ • Callout tips operator pembanding (== vs =)        │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ IKTP-2: Penelusuran   │ • Stepper eksekusi baris per baris bernomor urut    │
│ Alur (Code Tracing)   │ • Sorotan baris aktif cyan + panah kursor           │
│                       │ • Redup otomatis baris cabang yang diabaikan (35%)  │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ IKTP-3: Analisis &    │ • Kotak umpan balik diagnostik runtutan eksekusi   │
│ Perbaikan Kesalahan   │ • Dialog pemandu adaptif dari NPC Pak Budi          │
│                       │ • Saklar instan Pseudocode ID ⮂ Bahasa C            │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ IKTP-4: Cakupan Kasus │ • Sistem lencana 2 Bintang (Branch Coverage Bar)    │
│ Uji (Branch Coverage) │ • Status perubahan bintang (0/2 → 1/2 → 2/2 Tuntas) │
│                       │ • Kartu tantangan aksi bersyarat di arena simulasi  │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 9. Status Dokumen & Ketetapan Rekayasa

Dokumen `DESIGN.md` ini merupakan **standar desain visual minimal dan acuan mutlak** yang mengikat bagi seluruh proses pengembangan antarmuka dan aset aplikasi `iobranch`. Setiap detail nilai hex, ukuran font, margin, dan perilaku komponen yang dijabarkan dalam dokumen ini wajib diimplementasikan secara presisi tanpa penyimpangan.
