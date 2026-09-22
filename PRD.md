# PRODUCT REQUIREMENT DOCUMENT (PRD)
## iobranch — Interactive Gamified Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi**: 2.1.0 (Sinkronisasi First-Attempt Lock, Practice Mode, & Sistem Akses Telusur)  
**Status**: Approved Living Specification  
**Penyusun**: Lead Educational Software Architect & Instructional Designer  
**Prinsip Desain & Kualitas**: Mengadopsi Standar **Anti-Slop** ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Rilis Tindakan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  
**Konteks Riset**: Penelitian Tindakan Kelas (PTK) Informatika Kelas X-10 (46 Murid, 23 Pasangan *Pair Programming*)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
*iobranch* adalah media pembelajaran interaktif berbasis *Progressive Web App* (PWA) yang dirancang khusus untuk memecahkan hambatan kognitif murid SMA Kelas X pada materi struktur kontrol percabangan dasar (`if`, `if-else`, `else-if`, `switch-case`). 

Aplikasi ini menolak pendekatan perangkat lunak AI generik yang serba hiasan (*anti-slop philosophy*). Alih-alih menyajikan kuis hafalan atau tampilan visual penuh efek tanpa arti, *iobranch* bertindak sebagai **simulator penelusuran logika langkah demi langkah (*step-by-step visual tracing*)** yang fungsional, jujur, berdaya guna tinggi, dan terikat langsung dengan aktivitas lembar kerja murid di kelas nyata.

### 1.2 Masalah Pokok Lapangan yang Diselesaikan
1. **Miskonsepsi Operator**: Murid kerap menyamakan operator penugasan (`=`) dengan operator pembanding kesamaan (`==`).
2. **Kebiasaan Menebak (*Guessing vs Tracing*)**: Murid cenderung langsung menebak keluaran akhir program tanpa membaca dan menelusuri baris per baris jalannya kondisi.
3. **Buta Cabang (*Branch Blindness*)**: Murid hanya menguji kondisi saat bernilai `TRUE` dan tidak menyadari bahwa cabang alternatif (`FALSE` / `ELSE`) juga memiliki konsekuensi alur yang wajib diuji.
4. **Beban Kognitif Berlebih (*Cognitive Overload*)**: Terjebak pada kesalahan sintaks tanda baca bahasa pemrograman sebelum logika dasarnya matang.

### 1.3 Nilai Tambah Utama (*Core Value Proposition*)
* **Pembelajaran Mendalam (*Deep Learning*)**: Berkesadaran (*Mindful*), Bermakna (*Meaningful*), dan Menggembirakan (*Joyful*).
* **Dwi-Bahasa Adaptif (*Toggle Pseudocode <-> Bahasa C*)**: Transisi mulus dari bahasa semi-natural ke sintaks formal standar.
* **Visualisasi Ganda: Kode & Diagram Alir Flowgorithm**: Visualisasi baris kode sinkron 1:1 dengan diagram alir berstandar Flowgorithm SVG (Terminator, Input/Output, Decision, Process).
* **Kolaborasi Berpasangan (*Pair Programming First*)**: Dioptimalkan untuk 1 gawai per 2 murid guna memicu dialog nalar verbal dan mereduksi distraksi.
* **Offline-First & Zero-Infrastructure**: Berjalan 100% tanpa internet pasca-instalasi, tanpa biaya peladen, siap disajikan instan via Vercel.

---

## 2. Standar Craftsmanship & Integrasi Filosofi Anti-Slop

Mengacu pada prinsip [anti-slop](https://github.com/miqdadbadjuber/anti-slop), antarmuka dan kode *iobranch* disaring ketat agar tidak menyerupai produk AI generik (*slop*) yang membingungkan murid atau terasa steril.

### 2.1 Lima Pilar Standar Craftsmanship (C-1 s.d. C-5)
1. **C-1 Intentionality (Keberalasan Mutlak)**:
   Setiap tombol, warna, animasi, dan baris teks memiliki tujuan pedagogis yang dapat dipertanggungjawabkan. Tidak ada elemen yang dipasang hanya karena hiasan template semata.
2. **C-2 Functional Completeness (Kelengkapan Fungsi)**:
   Setiap elemen interaktif di layar **wajib berfungsi penuh**. Tidak ada tombol pajangan, dropdown kosong, atau navigasi semu. Modul Siklus II (`else-if` dan `switch-case`) terkunci secara fungsional (*disabled*) hingga token pembelajaran diverifikasi.
3. **C-3 Content-Driven Composition (Struktur Berbasis Kebutuhan Konten)**:
   Tata letak layar disusun murni berdasarkan urutan berpikir murid saat memecahkan masalah percabangan: Identifikasi Masalah, Masukan Data Uji, Prediksi Alur (*Mindful Pause*), Simulasi Penelusuran, Evaluasi, dan Catatan LKPD.
4. **C-4 Resilience (Ketahanan Ekstrem)**:
   Aplikasi tahan pada layar ponsel sempit (lebar 360 px), tetap berfungsi normal saat internet mati total (*offline mode*), dan tahan menangani masukan ekstrem dari murid (angka 0, nilai minus, atau angka di luar batas wajar).
5. **C-5 Evidence Over Claims (Kejujuran Bahasa & Data)**:
   Bahasa pengantar aplikasi menggunakan kalimat lugas, manusiawi, dan hangat seperti seorang guru informatika di kelas. Bebas dari klaim bombastis AI dan bebas dari istilah asing yang mengaburkan instruksi kerja.

### 2.2 Penolakan Pola AI Slop (*Slop Pattern Filter*)

| Pola AI Slop yang Dilarang | Alasan Penolakan | Alternatif yang Diterapkan di iobranch |
|---|---|---|
| **Gradien Ungu-Biru / Gelap Generik** | Melelahkan mata di kelas siang hari dan mengaburkan kontras teks logika. | Palet terang anti-silau *Warm Parchment* (`#F7F5F0`) dengan aksen *Forest Emerald* (`#0F766E`) dan *Warm Amber* (`#D97706`). |
| **Glassmorphism / Blur Berat Berlebihan** | Membuat rendering patah-patah (*lag*) pada ponsel murid dengan spesifikasi RAM 2 GB. | Kartu panel solid bersih (`#FFFFFF` dan `#EFECE6`) dengan garis tepi netral halus yang ringan di-render. |
| **Ikon Sihir / Kilau (*Magic AI*)** | Menimbulkan miskonsepsi bahwa komputer bekerja dengan "sihir", bukan logika terstruktur. | Ikonografi SVG pixel art fungsional: terminal, saklar gerbang, alur panah, dan diagram kondisi. |
| **Teks Bahasa Pemasaran Mengambang** | Membingungkan murid SMA yang membutuhkan instruksi konkret operasional. | Bahasa instruksional bahasa Indonesia yang jelas, ringkas, dan memandu langkah aksi murid secara langsung. |
| **Animasi Melayang Berulang-Ulang** | Menghambat konsentrasi penelusuran kode baris demi baris. | Animasi terarah hanya pada aliran alur eksekusi (*stepper glow*) yang bergerak saat tombol simulasi ditekan. |

---

## 3. Fondasi Teoretis & Pedagogis

Media ini dirancang dengan mengintegrasikan tiga kerangka kerja pedagogis modern:

```text
+-------------------------------------------------------------------------+
|                    PEMBELAJARAN MENDALAM (DEEP LEARNING)                 |
+-------------------+-------------------------+---------------------------+
|    BERKESADARAN   |        BERMAKNA         |       MENGGEMBIRAKAN      |
|     (MINDFUL)     |       (MEANINGFUL)      |          (JOYFUL)         |
+-------------------+-------------------------+---------------------------+
| Fitur:            | Fitur:                  | Fitur:                    |
| "Pause & Predict" | Kasus Masalah Nyata     | Visual Aliran Logika,     |
| Murid wajib jeda  | (Gerbang MRT, Kupon     | Lencana Branch Coverage,  |
| menalar sebelum   | Belanja, Alarm Suhu)    | Efek Suara Web Audio,     |
| simulasi jalan.   | bukan rumus abstrak.    | Scaffolding Bertahap.     |
+-------------------+-------------------------+---------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
|              SINTAKS PROBLEM BASED LEARNING (PBL) BERPASANGAN           |
|  Orientasi Masalah -> Organisasi Belajar -> Penyelidikan Terpandu ->    |
|  Penyajian Solusi -> Evaluasi & Refleksi di LKPD Kertas                 |
+-------------------------------------------------------------------------+
```

1. **Berkesadaran (*Mindful*)**: Melatih metakognisi. Aplikasi menonaktifkan tombol eksekusi sebelum pasangan murid memilih prediksi alur dan mendiskusikan hipotesisnya.
2. **Bermakna (*Meaningful*)**: Setiap konsep dibungkus dalam masalah kontekstual dunia digital yang akrab dengan remaja.
3. **Menggembirakan (*Joyful*)**: Menggunakan mekanika gamifikasi edukatif: kepuasan visual saat melihat alur logika yang menyala tepat, lencana pencapaian, dan umpan balik yang suportif.
4. **Pemisahan Evaluasi Murni**: Skor di dalam PWA berfungsi sebagai pendorong belajar formatif (*formative scaffold*). Keberhasilan kognitif akhir tetap dinilai melalui **tes tertulis mandiri di kertas (Form A-D)** untuk menjamin validitas metodologis PTK.

---

## 4. Profil Pengguna & Karakteristik Konteks Kelas

### 4.1 Profil Pengguna
* **Pengguna Utama (Murid)**: Murid Kelas X-10 SMA (46 orang, usia 15–16 tahun). Tingkat literasi komputer bervariasi; rentan terdistraksi jika memegang gawai sendiri-sendiri tanpa pembagian peran yang terarah.
* **Format Kerja**: 23 Kelompok Belajar Berpasangan (1 Smartphone per Meja).
  * **Pola Kolaborasi Alami**: Pasangan murid berbagi 1 gawai untuk menelusuri alur kode di game dan bersama-sama mengisi lembar LKPD fisik secara fleksibel tanpa beban aturan kaku pergantian peran (*no forced role-swap*).
  * **Identitas Kelompok**: Diformat otomatis menjadi `Tim Absen XX-YY` beranggotakan Murid 1 dan Murid 2 dengan nomor absen masing-masing.
* **Fasilitator (Guru / Peneliti)**: Mengontrol laju kelas, membagikan token pembuka siklus, mengaktifkan mode demo bila diperlukan, dan memfasilitasi refleksi kelas.

### 4.2 Lingkungan Teknis Sekolah
* **Perangkat**: Mayoritas Smartphone Android murid (spesifikasi bervariasi dari RAM 2 GB hingga 6 GB) serta laptop murid/lab.
* **Konektivitas**: Sinyal seluler dan WiFi sekolah sering berfluktuasi/lemah. Aplikasi **wajib beroperasi 100% mandiri secara luring (*offline-first*)** setelah pemuatan pertama.
* **Rasio Layar**: Dioptimalkan untuk orientasi *portrait* di ponsel (360x640 px hingga 412x915 px) serta adaptif responsif pada layar laptop (1366x768 px).

---

## 5. Arsitektur Alur Pengguna (*User Flow*)

```text
[Mulai di Browser HP / Standalone PWA]
   |
   v
[Layar 01: Panduan & Onboarding Registrasi Tim]
   |-- Baca Panduan Singkat Petualangan
   |-- Masukkan Nama & Nomor Absen Murid 1
   |-- Masukkan Nama & Nomor Absen Murid 2
   |-- Pilih Lambang Tim Pixel Art (Algoritma, Biner, Matriks, Vektor)
   |-- Format Otomatis: Tim Absen XX-YY -> Tersimpan di IndexedDB
   |
   v
[Layar 02: Peta Eksplorasi Kota Harmoni (Overworld Map)]
   |-- HUD Status Misi Aktif & Radar Lokasi
   |-- Navigasi Sentuh Virtual D-Pad / Keyboard WASD
   |
   v (Langkah 01: Orientasi Masalah)
[Layar 03: Pertemuan Dialog Guru Pak Budi]
   |-- Dialog Typewriter Interaktif & Pengenalan 5 Masalah Otomasi Kota
   |-- Hipotesis Awal Gerbang Logika & Pembukaan Ruang Kelas
   |
   v (Langkah 02: Teori & Pemahaman Konsep)
[Layar 04: Materi Pembelajaran Percabangan]
   |-- 5 Topik Modul (pra-01 s.d. ptk-05)
   |-- Penjelasan Konsep, Kode Dwi-Sintaks, Analogi Nyata, & Simulator
   |
   v (Langkah 03: Pembuktian Logika di Meja Kerja)
[Layar 05: Lab Telusur Kode Visual (Tracing)]
   |-- Pilih Kasus: Kasus 1 (30 poin), Kasus 2 (30 poin), Kasus 3 (40 poin)
   |-- Saklar Dwi-Bahasa: [Pseudocode ID] <-> [Bahasa C]
   |-- Masukkan Nilai Variabel Uji
   |-- Gerbang Berkesadaran ("Pause & Predict") -> Pilih Nilai & Cabang
   |-- Jalankan Visual Tracing -> Stepper Kode & Diagram Alir Flowgorithm SVG
   |-- Pelacak Cakupan Cabang -> Bintang 1 (Skor >= 60), Bintang 2 (Skor 100)
   |
   v (Langkah 04: Tantangan Tanggap Logika)
[Layar 06: Pertarungan Logika (Branching Battle RPG)]
   |-- 5 Ronde Evaluasi Logika Cepat Melawan Bug Monster
   |-- Skor Tantangan 0-100 & Opsi Latihan Mandiri
   |
   v (Langkah 05: Uji Pemahaman Mandiri)
[Layar 07: Evaluasi Mandiri Reflektif]
   |-- 5 Butir Soal Pemahaman Logika dengan Kunci Jawaban Seimbang (C-A-B-D-B)
   |-- Umpan Balik Diagnostik Langkah Analisis
   |
   v (Langkah 06: Rekapitulasi Capaian & Pelaporan)
[Layar 08: Dasbor Capaian Belajar & Lencana Prestasi]
   |-- Nilai Formatif Terpadu (Telusur, Tantangan, Evaluasi)
   |-- Lencana Capaian Tim & Riwayat Kasus Teruji
   |-- Ekspor Laporan LKPD Teks (.txt) & Lembar CSV Nilai (.csv)
   |-- Pengunggahan Gawai via Web Share API ke Google Drive Kelas
```

---

## 6. Spesifikasi Kebutuhan Fungsional (*Functional Requirements*)

### FR-1: Onboarding Gamifikasi & Manajemen Sesi Pasangan
* **Deskripsi**: Layar awal pembuka untuk mendaftarkan identitas 1 tim belajar (2 murid).
* **Komponen Masukan**:
  * Input Nomor Absen & Nama Lengkap Murid 1 (minimal 2 karakter).
  * Input Nomor Absen & Nama Lengkap Murid 2 (minimal 2 karakter, nomor absen tidak boleh sama dengan Murid 1).
  * Pemilih Lambang Tim (4 pilihan pixel art: *Algoritma*, *Biner*, *Matriks*, *Vektor*).
  * Pembuatan ID Tim Otomatis: `Tim Absen XX-YY` (contoh: `Tim Absen 03-14`).
* **Aturan Persistensi & Kebersihan Teks**:
  * Kolaborasi berlangsung alami tanpa aturan kaku pertukaran gawai yang membebani.
  * Seluruh data tersimpan secara asinkronus di **IndexedDB** lokal (`idb-keyval`).
  * Tidak ada duplikasi kata tim pada tampilan antarmuka (terhindar dari "Tim Tim Absen").
  * Disediakan tombol "Ganti Tim" di menu pengaturan untuk mereset sesi jika perangkat berganti pengguna.

### FR-2: Mesin Dwi-Bahasa (*Dual-Syntax Switcher Engine*)
* **Deskripsi**: Saklar instan untuk menampilkan representasi kode dalam Pseudocode Bahasa Indonesia atau Bahasa C.
* **Aturan Bahasa**:
  * **Mode Pseudocode**: Menggunakan kata kunci bahasa Indonesia kapital rapi (`JIKA`, `MAKA`, `LAINNYA`, `SELESAI JIKA`, `TAMPILKAN`, `==`, `!=`).
  * **Mode Bahasa C**: Menggunakan sintaks formal standar (`if (...) { ... } else { ... }`, `printf(...)`).
* **Kriteria Penerimaan**:
  * Pergantian sintaks terjadi seketika (*instant zero-delay*) tanpa memuat ulang halaman.
  * Penomoran baris dan penyorotan aktif (*active line highlight*) tetap presisi 1:1 pada kedua mode.

### FR-3: Mesin Penelusuran Alur Visual & Diagram Alir Flowgorithm SVG
* **Deskripsi**: Mesin penelusuran langkah demi langkah yang memvisualisasikan eksekusi baris kode bersanding dengan diagram alir SVG dinamis.
* **Mekanika Visual**:
  * *Line Stepper*: Penunjuk visual bergerak menelusuri baris inisialisasi menuju baris pemeriksaan kondisi.
  * *Evaluasi Kondisi Nyata*: Perbandingan nilai dihitung langsung di depan mata murid (contoh: `[ 80 >= 75 : bernilai TRUE ]` dengan warna hijau lembut).
  * *Pemisahan Jalur Aktif & Jalur Redup*: Blok instruksi yang dijalankan menyala kontras, sedangkan blok yang dilompati meredup (*opacity: 0.35*).
  * *Diagram Alir Flowgorithm SVG*: Menampilkan representasi visual standar Flowgorithm dengan simbol Terminator lonjong, Input/Output jajar genjang, Decision belah ketupat, dan Process persegi panjang yang menyala sinkron dengan baris kode aktif.
  * *Terminal Konsol*: Menampilkan teks hasil program di kotak terminal secara waktu nyata.

### FR-4: Gerbang Prediksi Berkesadaran (*Mindful Predict-First*)
* **Deskripsi**: Fitur metakognisi untuk menghentikan kebiasaan klik asal-asalan.
* **Alur Validasi**:
  * Saat nilai input baru ditetapkan, tombol "Jalankan Simulasi" terkunci (*disabled*).
  * Murid diwajibkan memilih 2 hal terlebih dahulu:
    1. Nilai Kondisi: `[ BENAR (TRUE) ]` atau `[ SALAH (FALSE) ]`.
    2. Jalur yang Dijalankan: `[ Cabang IF ]` atau `[ Cabang ELSE ]`.
  * Begitu kedua prediksi dipilih, tombol simulasi aktif menyala.
  * Pasca-simulasi, aplikasi membandingkan tebakan murid dengan fakta jalannya program secara objektif dan mendidik.

### FR-5: Sistem Penilaian Formatif PTK Berbobot (100 Poin) & First-Attempt Lock
* **Deskripsi**: Sistem penilaian formatif terstruktur dengan penguncian nilai percobaan pertama (*First-Attempt Lock*) pada ketiga pilar asesmen, menjamin validitas evaluasi tindakan kelas.
* **Pembobotan Kasus Telusur**:
  * **Siklus 1 (3 Kasus Wajib)**:
    * Kasus 1 (`m01` - Gerbang MRT): Bobot 30 poin.
    * Kasus 2 (`m02` - Alarm Server): Bobot 30 poin.
    * Kasus 3 (`m03` - Kupon Diskon): Bobot 40 poin.
    * Akumulasi ketiga kasus menghasilkan nilai formatif sempurna **100/100 poin**.
  * **Siklus 2 (5 Kasus Terpadu)**:
    * Kasus 1 (15 poin), Kasus 2 (15 poin), Kasus 3 (20 poin), Kasus 4 (25 poin), Kasus 5 (25 poin) -> Total 100 poin.
* **Kriteria Bintang Telusur**:
  * Kasus 1 & 2 selesai (skor minimal 60 poin) meraih **1 Bintang**.
  * Seluruh 3 kasus selesai (skor 100 poin) meraih **2 Bintang Tuntas**.
* **Pemisahan Akses vs Nilai (Tracing)**:
  * **`testedBranches`** (Cabang Terbukti Benar): Menentukan nilai/stars. Hanya diisi jika prediksi hipotesis murid **cocok** dengan cabang yang dieksekusi simulator.
  * **`exploredBranches`** (Cabang Sudah Dijelajahi): Menentukan akses ke halaman Tantangan. Diisi setiap kali murid menyelesaikan simulasi penuh, meskipun prediksinya salah. Murid dapat lanjut ke Tantangan setelah menjelajahi semua kasus siklus aktif.
* **Penguncian First-Attempt Lock (Tiga Pilar)**:
  * `isTracingLocked`: Dikunci otomatis saat murid pertama kali menuntaskan seluruh kasus siklus aktif. Nilai telusur tidak dapat berubah setelah dikunci.
  * `isBattleLocked`: Dikunci saat murid pertama kali memenangkan 5 ronde pertarungan. Skor tantangan tetap 100.
  * `isEvaluasiLocked`: Dikunci saat murid pertama kali mengumpulkan jawaban evaluasi 5 soal. Skor berdasarkan jumlah jawaban benar.

### FR-6: Sistem Bantuan Bertahap (*Adaptive Scaffolding*)
* **Deskripsi**: Bantuan reflektif saat hasil simulasi berbeda dengan prediksi murid.
* **Aturan**: Tidak boleh langsung memberikan jawaban jadi.
* **Tingkatan Bantuan**:
  * *Level 1*: Mengarahkan perhatian pada nilai variabel saat ini.
  * *Level 2*: Mengingatkan kembali makna operator pembanding yang digunakan.
  * *Level 3*: Mengarahkan ke konsekuensi lompatan alur eksekusi komputer.

### FR-7: Sistem Penguncian Siklus PTK & Mode Bypass Guru
* **Deskripsi**: Isolasi perlakuan tindakan agar materi Siklus II tidak diakses mendahului jadwal, disertai fleksibilitas demonstrasi kelas.
* **Mekanisme**:
  * Default sistem: Siklus 1 aktif (Modul 1-3 terbuka, Modul 4-5 terkunci).
  * **Jalur Mandiri Murid**: Murid memasukkan token pembelajaran yang dibagikan guru (`SIKLUS2`) untuk membuka Modul 4 dan 5 secara permanen di perangkat tim.
  * **Jalur Fasilitator Guru (Mode Demo)**: Guru dapat mengetuk logo header 3 kali, memasukkan PIN `PTK10`, dan mengaktifkan mode demonstrasi bebas (*Teacher Bypass Mode*) untuk membuka semua landmark tanpa batasan urutan langkah.

### FR-8: Rekapitulasi Sesi & Jembatan ke LKPD Fisik
* **Deskripsi**: Fasilitas penyalinan data uji yang telah dibuktikan murid ke lembar kerja fisik kelompok.
* **Format**: Menampilkan daftar nilai uji, evaluasi kondisi, jalur terpilih, dan teks keluaran program.

### FR-9: Arena Tantangan Pertarungan Logika (*Branching Battle Challenge*)
* **Deskripsi**: Mode tantangan gamifikasi berbasis pertempuran giliran (*turn-based RPG*) untuk menguji ketangkasan evaluasi kondisi percabangan secara dinamis.
* **Mekanika**:
  * Karakter murid menghadapi Bug Monster dalam 5 ronde evaluasi kondisi.
  * Setiap ronde menyajikan aturan kondisi logika percabangan. Keputusan tepat memberikan serangan kritis dan poin evaluasi.
  * Skor tantangan tercatat 0–100 pada penilaian formatif tim dan dikunci via `isBattleLocked` setelah percobaan pertama.
  * Tersedia mode latihan mandiri pasca-penyelesaian tantangan pertama untuk memperdalam pemahaman tanpa mengubah skor resmi.

### FR-10: Ekspor Asesmen Formatif & Integrasi Cloud Drive (Web Share API)
* **Deskripsi**: Fasilitas pengambilan data kemajuan belajar formatif kelompok dari IndexedDB untuk dianalisis oleh guru sebagai bukti triangulasi tindakan PTK.
* **Format Penamaan File Standar**:
  `iobranch_Siklus[Siklus]_[CleanPairId]_[M1]_[M2].csv` dan `.txt`  
  (Contoh: `iobranch_Siklus1_Tim_Absen_03-14_Budi3_Siti14.csv`).
* **Format Rekap**:
  * Berkas CSV: Timestamp, Siklus, PairId, Nama Murid 1, Absen Murid 1, Nama Murid 2, Absen Murid 2, Lambang Tim, Nilai Telusur Kasus, Skor Tantangan Monster, Nilai Evaluasi Formatif, dan Nilai Formatif Akhir.
  * Berkas TXT: Laporan tertulis rapi yang memuat rekapitulasi data uji, capaian lencana, dan refleksi belajar tim untuk lampiran LKPD fisik.
* **Dua Jalur Pengunggahan**:
  1. *Jalur Utama (Web Share API)*: Membuka jendela bagikan bawaan ponsel untuk menyimpan langsung ke Google Drive kelas dalam 2 ketukan.
  2. *Jalur Cadangan (Fallback)*: Mengunduh berkas fisik secara lokal ke gawai dan membuka tautan Google Drive guru di tab baru.

### FR-11: Sistem Mode Latihan Tiga Pilar (*Practice Mode System*)
* **Deskripsi**: Setelah murid menyelesaikan sesi resmi pada salah satu dari tiga pilar asesmen (Telusur, Tantangan, Evaluasi), sistem secara otomatis mengaktifkan Mode Latihan saat murid mengakses kembali halaman tersebut.
* **Mekanika**:
  * **Deteksi Otomatis**: Saat memasuki halaman yang sudah selesai (`isTracingLocked`, `isBattleLocked`, atau `isEvaluasiLocked` bernilai `true`), sistem menampilkan modal informatif.
  * **Modal Pemberitahuan**: Teks modal mencantumkan bahwa nilai formatif resmi tidak akan berubah; murid dipersilakan berlatih untuk mengasah pemahaman.
  * **Badge Status**: Header halaman menampilkan badge *"Mode Latihan"* (abu-abu netral) sebagai pengganti badge *"Lab Formatif"* / *"Tantangan Formatif"* (hijau resmi).
  * **Guard Storage**: Seluruh operasi tulis ke `StorageService` (nilai stars, testedBranches, skor) diblokir selama sesi latihan aktif. Hanya `exploredBranches` yang tetap dapat diperbarui pada Lab Telusur.
* **Teks Modal per Pilar**:
  * **Lab Telusur**: *"Tim kalian telah menyelesaikan misi Lab Telusur ini sebelumnya. Tim kalian dipersilakan berlatih kembali untuk mengasah pemahaman penelusuran kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmi kalian."*
  * **Tantangan**: *"Kalian telah menyelesaikan misi Tantangan ini sebelumnya. Tim kalian dipersilakan berlatih kembali untuk mengasah pemahaman evaluasi kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmi kalian."*
  * **Evaluasi**: *"Tim kalian telah menyelesaikan evaluasi resmi Siklus 1 sebelumnya. Kalian dipersilakan mengerjakan ulang untuk memperdalam pemahaman konsep logika percabangan, namun nilai formatif resmi tetap menggunakan hasil pengerjaan pertama."*

### FR-10: Ekspor Asesmen Formatif & Integrasi Cloud Drive (Web Share API)
* **Deskripsi**: Fasilitas pengambilan data kemajuan belajar formatif kelompok dari IndexedDB untuk dianalisis oleh guru sebagai bukti triangulasi tindakan PTK.
* **Format Penamaan File Standar**:
  `iobranch_Siklus[Siklus]_[CleanPairId]_[M1]_[M2].csv` dan `.txt`  
  (Contoh: `iobranch_Siklus1_Tim_Absen_03-14_Budi3_Siti14.csv`).
* **Format Rekap**:
  * Berkas CSV: Timestamp, Siklus, PairId, Nama Murid 1, Absen Murid 1, Nama Murid 2, Absen Murid 2, Lambang Tim, Nilai Telusur Kasus, Skor Tantangan Monster, Nilai Evaluasi Formatif, dan Nilai Formatif Akhir.
  * Berkas TXT: Laporan tertulis rapi yang memuat rekapitulasi data uji, capaian lencana, dan refleksi belajar tim untuk lampiran LKPD fisik.
* **Dua Jalur Pengunggahan**:
  1. *Jalur Utama (Web Share API)*: Membuka jendela bagikan bawaan ponsel untuk menyimpan langsung ke Google Drive kelas dalam 2 ketukan.
  2. *Jalur Cadangan (Fallback)*: Mengunduh berkas fisik secara lokal ke gawai dan membuka tautan Google Drive guru di tab baru.

---

## 7. Katalog Kasus Masalah Nyata (*Meaningful Learning Modules*)

| Kode | Kasus Nyata | Masalah Dunia Nyata | Konsep Percabangan | Bobot Formatif |
|---|---|---|---|---|
| **M-01** | **Gerbang Tiket Stasiun MRT** | Penumpang masuk peron berdasarkan saldo kartu vs tarif minimal perjalanan (Rp4.000). | Operator Relasional (`>=`, `==`), evaluasi Boolean. Mengikis kerancuan antara `=` dan `==`. | 30 Poin (Siklus 1) / 15 Poin (Siklus 2) |
| **M-02** | **Sistem Alarm Suhu Ruang Server** | Menyalakan sirine peringatan hanya jika suhu ruangan melebihi 30 derajat Celcius. | Percabangan Tunggal (`IF`). Memahami bahwa jika kondisi salah, komputer langsung lanjut ke baris berikutnya. | 30 Poin (Siklus 1) / 15 Poin (Siklus 2) |
| **M-03** | **Kantin Digital (Kupon Diskon)** | Total belanja di atas Rp25.000 mendapat potongan kupon Rp5.000, di bawah itu tarif normal. | Percabangan Ganda (`IF - ELSE`). Melatih pembuktian 100% *Branch Coverage* (menguji kasus diskon dan normal). | 40 Poin (Siklus 1) / 20 Poin (Siklus 2) |
| **M-04** | **Klasifikasi Kecepatan Paket Data** | Menentukan status jaringan: Cepat (>= 50 Mbps), Sedang (20-49 Mbps), atau Lambat (< 20 Mbps). | Percabangan Bertingkat (`ELSE - IF`). Menganalisis urutan evaluasi kondisi agar tidak tumpang tindih. | 25 Poin (Khusus Siklus 2) |
| **M-05** | **Pemilih Menu Mesin Minuman** | Pengguna menekan tombol 1 (Kopi), 2 (Teh), 3 (Susu), atau nomor lain (Menu Tidak Tersedia). | Percabangan Multi-Kategori (`SWITCH - CASE`). Memahami perbandingan nilai diskrit berbasis menu angka. | 25 Poin (Khusus Siklus 2) |

---

## 8. Spesifikasi Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

### NFR-1: PWA & Offline-First Caching
* **Web App Manifest (`manifest.webmanifest`)**:
  * Mendukung mode `display: standalone` sehingga saat ditambahkan ke layar utama, aplikasi berjalan bersih tanpa bilah alamat browser.
  * Ikon standar PWA ukuran 192x192 px dan 512x512 px.
* **Service Worker (`sw.js`)**:
  * Menerapkan strategi Cache-First untuk seluruh berkas statis (HTML, CSS, JS, font, aset gambar).
  * Menjamin aplikasi 100% berfungsi normal dalam Mode Pesawat (*Airplane Mode*) tanpa membutuhkan internet pasca-instalasi.

### NFR-2: Performa & Efisiensi Sumber Daya
* Ukuran bundel produksi teroptimasi (dibangun via Vite + TypeScript) dengan waktu muat awal (*First Meaningful Paint*) di bawah 1 detik pada ponsel Android RAM 2 GB.
* Menggunakan Pure Vanilla CSS terstruktur tanpa dependensi runtime Tailwind CSS, menjamin rendering cepat dan bebas overhead.
* Rendering peta kanvas menggunakan tekstur prosedural native Phaser, menghindarkan ketergantungan pada pemuatan file eksternal yang rentan gagal di jaringan luring.

### NFR-3: Aksesibilitas & Responsivitas Antarmuka
* **Ukuran Sentuh (*Touch Target*)**: Seluruh tombol aksi memiliki tinggi minimal 44–48 px agar nyaman ditekan oleh jari murid pada gawai bersama di meja kelas (sesuai standar WCAG 2.2 AAA).
* **Kontras Warna**: Memenuhi rasio kontras teks WCAG AAA (rasio kontras teks Charcoal `#1C1917` terhadap latar Warm Parchment `#F7F5F0` mencapai 14.8 : 1).
* **Navigasi Sentuh Khusus Ponsel**: Menyediakan kontrol Virtual D-Pad transparan di atas kanvas peta untuk kemudahan kendali karakter pada layar sentuh ponsel.

### NFR-4: Privasi & Nol Beban Infrastruktur
* Tidak mengumpulkan data pribadi sensitif (tanpa email, tanpa nomor telepon, tanpa pelacak analitik eksternal).
* Seluruh data sesi pasangan, capaian formatif, dan riwayat kasus tersimpan secara privat di IndexedDB lokal gawai.

---

## 9. Desain Sistem & Token Visual Resmi (*Warm Parchment & Forest Emerald*)

### 9.1 Palet Warna Resmi
* **Latar Aplikasi (*App Background*)**: `#F7F5F0` (Warm Parchment / Alabaster anti-silau)
* **Latar Kanvas Game (*Canvas Background*)**: `#1C1917` (Charcoal Ink)
* **Kartu Panel Utama (*Surface Panel*)**: `#FFFFFF` (Pure White Card)
* **Kartu Panel Sekunder (*Surface Panel Alt*)**: `#EFECE6` (Warm Ivory)
* **Latar Kotak Editor Kode (*Code Surface*)**: `#18181B` (Dark Zinc Ink berkontras tinggi)
* **Warna Aksen Utama (*Primary*)**: `#0F766E` (Deep Forest Emerald)
* **Warna Aksen Sekunder (*Secondary / Warning*)**: `#D97706` (Warm Amber)
* **Status Logika BENAR (*Logic TRUE*)**: Latar `rgba(21, 128, 61, 0.12)`, border `#15803D`, teks `#15803D`.
* **Status Logika SALAH (*Logic FALSE*)**: Latar `rgba(220, 38, 38, 0.12)`, border `#DC2626`, teks `#DC2626`.
* **Jalur Dilewati (*Skipped Branch*)**: Opasitas otomatis turun menjadi 35% (`opacity: 0.35`).
* **Teks Utama (*Primary Text*)**: `#1C1917` (Charcoal Ink)
* **Teks Sekunder (*Muted Text*)**: `#57534E` (Stone Slate)

### 9.2 Tipografi Baku
* **Logo, Judul Layar, HUD, & Badge Status**: `Press Start 2P`, monospace pixel art.
* **Teks Narasi, Konten, & Soal**: `Inter` / `Plus Jakarta Sans`, sans-serif bersih dan tajam.
* **Blok Kode Sumber & Terminal**: `JetBrains Mono` / `Consolas`, monospace dengan keterbacaan tinggi.

### 9.3 Efek Suara Mikro Edukatif (*Native Web Audio API*)
* Menghasilkan audio langsung dari osilator peramban tanpa mengunduh berkas audio eksternal:
  * Dialog Mesin Tik: Klik mikro frekuensi 480 Hz (20 ms, square wave).
  * Tombol Interaksi: Blip nada 330 Hz (40 ms, square wave).
  * Kondisi TRUE: Nada tinggi 587.33 Hz / D5 (80 ms, triangle wave).
  * Kondisi FALSE: Nada rendah 220.00 Hz / A3 (120 ms, sawtooth wave).
  * Kemenangan Misi: Arpeggio kemenangan 4 nada retro C5-E5-G5-C6 (523-1046 Hz).
* Disediakan tombol bisu (Mute) di bilah atas jika kelas membutuhkan keheningan.

---

## 10. Matriks Penyelarasan Indikator Keberhasilan PTK (*Traceability Matrix*)

| Target Indikator PTK | Fitur Spesifik PWA iobranch | Bukti Keberhasilan Terverifikasi |
|---|---|---|
| **IKTP-1 (Konsep Dasar & Operator)** | Modul Teori 1-3 & Saklar Dwi-Bahasa (Pseudocode <-> C) menegaskan perbedaan `=` vs `==`. | Murid menjawab benar butir soal konsep dan operator pada tes tertulis. |
| **IKTP-2 (Penelusuran Alur / Tracing)** | Mesin Penelusur Alur menyorot baris aktif dan diagram Flowgorithm SVG secara sinkron. | Murid terbiasa menelusuri jalannya eksekusi baris per baris secara berurutan. |
| **IKTP-3 (Analisis Kesalahan Logika)** | Bantuan Scaffolding bertahap membimbing murid saat tebakan prediksinya tidak sesuai dengan fakta eksekusi. | Murid mampu mendeteksi kondisi tumpang tindih dan kekeliruan alur pada soal uraian. |
| **IKTP-4 (Cakupan Kasus Uji / Coverage)** | Lencana Bintang 2 menantang murid mencari data uji yang mencakup seluruh cabang (IF dan ELSE). | Murid mampu menyusun tabel kasus uji lengkap pada lembar kerja LKPD kelompok. |
| **Pilar Kognitif Klasikal (N-Gain >= 0.30)** | Gabungan pengalaman simulasi interaktif memicu pemahaman konsep mendalam dari Pretest ke Posttest. | Rerata nilai kelas meningkat dengan skor N-Gain minimal kategori Sedang. |
| **Pilar Kepuasan Media (Rerata >= 3.00)** | Antarmuka bersih anti-slop, lancar luring tanpa kuota, dan pengalaman kerja berpasangan yang menyenangkan. | Skor angket respon murid di akhir siklus mencapai kategori Positif / Sangat Baik. |

---

## 11. Gerbang Pengiriman Anti-Slop (*Delivery Gate Checklist*)

Sebelum media digunakan dalam tindakan kelas nyata, aplikasi wajib memenuhi seluruh kriteria kelulusan berikut:

- [x] **PASS**: Bebas dari gradien ungu/pelangi generik dan bebas warna biru AI-slop.
- [x] **PASS**: Seluruh tombol interaktif berfungsi penuh 100% (tidak ada tombol pajangan).
- [x] **PASS**: Saklar dwi-bahasa (Pseudocode <-> Bahasa C) beralih seketika dengan pemetaan baris yang presisi.
- [x] **PASS**: Diagram alir Flowgorithm SVG terintegrasi dan menyala sinkron dengan baris kode aktif.
- [x] **PASS**: Tombol simulasi terkunci sebelum murid memilih prediksi nilai kondisi dan cabang.
- [x] **PASS**: Nilai formatif hanya dicatat jika prediksi hipotesis murid BENAR (hipotesis salah = explored, bukan tested).
- [x] **PASS**: First-Attempt Lock aktif pada ketiga pilar (`isTracingLocked`, `isBattleLocked`, `isEvaluasiLocked`).
- [x] **PASS**: Mode Latihan aktif otomatis (modal + badge) saat murid kembali ke halaman yang sudah selesai.
- [x] **PASS**: Sistem penilaian formatif berbobot (30/30/40) tercatat akurat dan sinkron dengan dasbor progres.
- [x] **PASS**: Modul Siklus II terkunci rapat dan dapat dibuka via token murid (`SIKLUS2`) atau PIN guru (`PTK10`).
- [x] **PASS**: Aplikasi berfungsi normal 100% dalam Mode Pesawat (*Airplane Mode*) tanpa koneksi internet.
- [x] **PASS**: Zero Raw Emojis (seluruh ikon menggunakan komponen SVG pixel art tajam).
- [x] **PASS**: 100% konsisten menggunakan istilah "murid" di seluruh antarmuka dan dokumentasi.
- [x] **PASS**: Teks instruksional ramah jenjang SMA, bebas dari duplikasi kata "Tim", dan bebas kalimat klise AI.
