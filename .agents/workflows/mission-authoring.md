# Workflow: Penambahan dan Konfigurasi Modul Misi Logika

Alur kerja ini digunakan setiap kali menambahkan skenario misi baru (Kasus 1 s.d. 4) ke dalam game edukasi **iobranch**.

---

## Tahapan Eksekusi

### 1. Definisi Kontrak Data Kasus (Mission Model)
Tambahkan entri kasus pada file konfigurasi misi (`src/data/missions.ts`):
- `id`: Pengenal unik (contoh: `'mission-01'`)
- `title`: Judul kasus kontekstual (contoh: *"Gerbang Tiket MRT"*)
- `targetCycle`: Siklus PTK (`1` atau `2`)
- `concept`: Konsep yang diuji (`'ASSIGNMENT_VS_EQUALITY'`, `'IF_SINGLE'`, `'IF_ELSE'`, `'ELSE_IF'`, atau `'SWITCH_CASE'`)
- `storyPrompt`: Narasi masalah dunia nyata yang membumi
- `inputSchema`:
  - Label input (contoh: *"Saldo Kartu (Rp)"*)
  - Tipe input (`'number'`, range min-max, nilai default)
  - Placeholder ramah siswa
- `codeSnippet`:
  - `pseudocode`: Representasi bahasa terstruktur Indonesia
  - `cLanguage`: Representasi sintaks formal Bahasa C

### 2. Konfigurasi Penelusuran (Trace Sequence & Assertions)
Definisikan langkah-langkah penelusuran baris demi baris:
1. Pemetaan nomor baris kode aktif untuk setiap evaluasi variabel.
2. Kondisi cabang:
   - Kondisi evaluasi logika (contoh: `saldo >= 5000`).
   - Cabang TRUE: Jalur gerbang terbuka, output teks terminal, dan animasi Hero berjalan lurus.
   - Cabang FALSE / ELSE: Jalur alternatif atau palang tertutup, pesan peringatan terminal, dan arah gerak Hero.
3. Kriteria *Branch Coverage*:
   - Catat apakah kedua cabang (TRUE dan FALSE) sudah pernah diuji oleh pasangan siswa untuk memperoleh lencana 2 Bintang.

### 3. Pembuatan atau Pemetaan Tilemap (Tiled JSON)
Pastikan berkas peta Tiled (`public/assets/maps/mission_XX.json`) tersedia:
1. Layer `Terrain`: Jalur tanah dan batas rintangan.
2. Layer `Objects`:
   - Titik mulai Hero: Objek `SpawnPoint` (x, y).
   - Titik persimpangan logika: Objek `ForkPoint` (x, y).
   - Titik gerbang TRUE: Objek `GateTrue` (x, y).
   - Titik gerbang FALSE: Objek `GateFalse` (x, y).
   - Titik finish: Objek `GoalPoint` (x, y).

### 4. Uji Verifikasi Dual-Syntax
Pastikan saklar toggle bahasa C ⮂ Pseudocode berfungsi mulus:
- Pergantian bahasa tidak mereset nilai input yang telah diketik siswa.
- Penyorot baris (*line highlighter*) tetap sinkron pada baris yang setara di kedua bahasa.
