# PRODUCT REQUIREMENT DOCUMENT (PRD)
## iobranch — Interactive Gamified Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi**: 1.2.0 (Rebranded & Integrated Anti-Slop Standard)  
**Status**: Approved Specification  
**Penyusun**: Lead Educational Software Architect & Instructional Designer  
**Prinsip Desain & Kualitas**: Mengadopsi Standar **Anti-Slop** ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Rilis Tindakan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  
**Konteks Riset**: Penelitian Tindakan Kelas (PTK) Informatika Kelas X-10 (46 Murid, 23 Pasangan *Pair Programming*)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
*iobranch* adalah media pembelajaran interaktif berbasis *Progressive Web App* yang dirancang khusus untuk memecahkan hambatan kognitif murid SMA Kelas X pada materi struktur kontrol percabangan dasar (`if`, `if-else`, `else-if`, `switch-case`). 

Aplikasi ini menolak pendekatan perangkat lunak AI generik yang serba hiasan (*anti-slop philosophy*). Alih-alih menyajikan kuis hafalan atau tampilan visual penuh efek tanpa arti, *iobranch* bertindak sebagai **simulator penelusuran logika langkah-demi-langkah (*step-by-step visual tracing*)** yang fungsional, jujur, berdaya guna tinggi, dan terikat langsung dengan aktivitas lembar kerja murid di kelas nyata.

### 1.2 Masalah Pokok Lapangan yang Diselesaikan
1. **Miskonsepsi Operator**: Murid kerap menyamakan operator penugasan (`=`) dengan operator pembanding kesamaan (`==`).
2. **Kebiasaan Menebak (*Guessing vs Tracing*)**: Murid cenderung langsung menebak keluaran akhir program tanpa membaca dan menelusuri baris per baris jalannya kondisi.
3. **Buta Cabang (*Branch Blindness*)**: Murid hanya menguji kondisi saat bernilai `TRUE` dan tidak menyadari bahwa cabang alternatif (`FALSE` / `ELSE`) juga memiliki konsekuensi alur yang wajib diuji.
4. **Beban Kognitif Berlebih (*Cognitive Overload*)**: Terjebak pada kesalahan sintaks tanda baca bahasa pemrograman sebelum logika dasarnya matang.

### 1.3 Nilai Tambah Utama (*Core Value Proposition*)
* **Pembelajaran Mendalam (*Deep Learning*)**: Berkesadaran (*Mindful*), Bermakna (*Meaningful*), dan Menggembirakan (*Joyful*).
* **Dwi-Bahasa Adaptif (*Toggle Pseudocode $\leftrightarrow$ Bahasa C*)**: Transisi mulus dari bahasa semi-natural ke sintaks formal.
* **Kolaborasi Berpasangan (*Pair Programming First*)**: Dioptimalkan untuk 1 gawai per 2 murid guna memicu dialog nalar verbal dan mereduksi distraksi.
* **Offline-First & Zero-Infrastructure**: Berjalan 100% tanpa internet pasca-instalasi, tanpa biaya server, siap di-deploy secara instan di Vercel.

---

## 2. Standar Craftsmanship & Integrasi Filosofi Anti-Slop

Mengacu pada prinsip [anti-slop](https://github.com/miqdadbadjuber/anti-slop), antarmuka dan kode *iobranch* disaring ketat agar tidak menyerupai produk AI generik (*slop*) yang membingungkan murid atau terasa steril.

### 2.1 Lima Pilar Standar Craftsmanship (C-1 s.d. C-5)
1. **C-1 Intentionality (Keberalasan Mutlak)**:
   Setiap tombol, warna, animasi, dan baris teks harus memiliki tujuan pedagogis yang dapat dipertanggungjawabkan. Tidak ada elemen yang dipasang hanya karena "bawaan template AI".
2. **C-2 Functional Completeness (Kelengkapan Fungsi)**:
   Setiap elemen interaktif di layar **wajib berfungsi penuh**. Tidak boleh ada tombol pajangan, dropdown kosong, atau navigasi semu. Jika suatu modul belum saatnya dibuka (materi Siklus II), modul tersebut dinyatakan terkunci secara fungsional (*disabled with clear explanation*).
3. **C-3 Content-Driven Composition (Struktur Berbasis Kebutuhan Konten)**:
   Tata letak layar disusun murni berdasarkan urutan berpikir murid saat memecahkan masalah percabangan (Masalah -> Input -> Prediksi -> Tracing -> Umpan Balik -> Catatan LKPD), bukan bento-grid acak.
4. **C-4 Resilience (Ketahanan Ekstrem)**:
   Aplikasi tidak boleh rusak atau terpotong pada layar HP sempit (lebar 360 px), tetap berfungsi normal saat internet mati total (*offline mode*), dan tahan menangani input ekstrem dari murid (misal: input angka 0, nilai minus, atau angka sangat besar).
5. **C-5 Evidence Over Claims (Kejujuran Bahasa & Data)**:
   Bahasa pengantar aplikasi menggunakan kalimat lugas, manusiawi, dan hangat seperti seorang guru informatika di kelas. Bebas dari klaim bombastis AI seperti *"Membuka Potensi Tak Terbatas"*, *"Sistem Cerdas Generasi Baru"*, atau statistik palsu.

### 2.2 Penolakan Pola AI Slop (*Slop Pattern Filter*)

| Pola AI Slop yang DILARANG | Alasan Penolakan | Alternatif yang Diterapkan di iobranch |
|---|---|---|
| **Gradien Ungu-Biru / Pelangi Tanpa Makna** | Melelahkan mata di kelas dan mengalihkan fokus murid dari alur logika. | Palet fungsional bertema *Deep Slate* (`#0B132B`). Warna mencolok hanya dipakai untuk status logika: Hijau untuk `TRUE`, Merah untuk `FALSE`. |
| **Glassmorphism / Blur Berat Berlebihan** | Membuat rendering berat dan patah-patah (*lag*) pada HP murid berspesifikasi rendah. | Kartu solid bersih (*clean solid cards*) dengan garis tepi kontras halus yang ringan di-render oleh GPU ponsel. |
| **Ikon Sihir / Kilau (*Sparkles / Magic AI*)** | Menimbulkan miskonsepsi bahwa komputer bekerja dengan "sihir", bukan logika terstruktur. | Ikon fungsional yang merepresentasikan komputasi nyata: terminal, saklar gerbang, alur panah, dan diagram kondisi. |
| **Teks Bahasa Pemasaran Mengambang** | Membingungkan murid SMA yang membutuhkan instruksi konkret operasional. | Bahasa instruksional bahasa Indonesia yang jelas, ringkas, dan memandu langkah aksi murid secara langsung. |
| **Animasi Melayang Berulang-Ulang** | Menghambat konsentrasi penelusuran kode baris demi baris. | Animasi terarah hanya pada aliran alur eksekusi (*stepper glow*) yang bergerak saat tombol simulasi ditekan. |

---

## 3. Fondasi Teoretis & Pedagogis

Media ini dirancang dengan mengintegrasikan tiga kerangka kerja pedagogis modern:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PEMBELAJARAN MENDALAM (DEEP LEARNING)                 │
├───────────────────┬─────────────────────────┬───────────────────────────┤
│    BERKESADARAN   │        BERMAKNA         │       MENGGEMBIRAKAN      │
│     (MINDFUL)     │       (MEANINGFUL)      │          (JOYFUL)         │
├───────────────────┼─────────────────────────┼───────────────────────────┤
│ Fitur:            │ Fitur:                  │ Fitur:                    │
│ "Pause & Predict" │ Kasus Masalah Nyata     │ Visual Aliran Logika,     │
│ Murid wajib jeda  │ (Gerbang MRT, Kupon     │ Lencana Branch Coverage,  │
│ menalar sebelum   │ Belanja, Alarm Suhu)    │ Efek Suara Web Audio,     │
│ simulasi jalan.   │ bukan rumus abstrak.    │ Scaffolding Membangun.    │
└───────────────────┴─────────────────────────┴───────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              SINTAKS PROBLEM BASED LEARNING (PBL) BERPASANGAN           │
│  Orientasi Masalah ➔ Organisasi Belajar ➔ Penyelidikan Terpandu ➔       │
│  Penyajian Solusi ➔ Evaluasi & Refleksi di LKPD Kertas                  │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Berkesadaran (*Mindful*)**: Melatih metakognisi. Aplikasi menonaktifkan tombol eksekusi sebelum pasangan murid memilih prediksi alur dan mendiskusikan hipotesisnya.
2. **Bermakna (*Meaningful*)**: Setiap konsep dibungkus dalam masalah kontekstual dunia digital yang akrab dengan remaja.
3. **Menggembirakan (*Joyful*)**: Menggunakan mekanika gamifikasi edukatif: kepuasan visual saat melihat alur logika yang menyala tepat (*Aha! moment*), lencana pencapaian, dan umpan balik yang suportif.
4. **Pemisahan Evaluasi Murni**: Skor di dalam PWA hanya berfungsi sebagai pendorong belajar (*formative scaffold*). Keberhasilan kognitif akhir tetap dinilai melalui **tes tertulis mandiri di kertas (Form A–D)** untuk menjamin validitas metodologis PTK.

---

## 4. Profil Pengguna & Karakteristik Konteks Kelas

### 4.1 Profil Pengguna
* **Pengguna Utama (Murid)**: Murid Kelas X-10 SMA (46 orang, usia 15–16 tahun). Tingkat literasi komputer bervariasi; rentan terdistraksi jika memegang gawai sendiri-sendiri tanpa pembagian peran yang tegas.
* **Format Kerja**: 23 Kelompok Belajar Berpasangan (1 Smartphone per Meja).
  * **Pola Kolaborasi Alami**: Pasangan murid berbagi 1 gawai untuk menelusuri alur kode di game dan bersama-sama mengisi lembar LKPD fisik secara fleksibel tanpa beban aturan kaku pergantian peran (*no forced role-swap*).
  * **Identitas Kelompok**: Terdiri atas Murid 1 dan Murid 2 dengan nomor meja dan nomor absen masing-masing.
* **Fasilitator (Guru / Peneliti)**: Mengontrol laju kelas, membuka gerbang siklus, dan memfasilitasi refleksi kelas.

### 4.2 Lingkungan Teknis Sekolah
* **Perangkat**: Mayoritas Smartphone Android murid (spesifikasi bervariasi dari RAM 2GB hingga 6GB) serta laptop murid/lab.
* **Konektivitas**: Sinyal seluler dan WiFi sekolah sering berfluktuasi/lemah. Aplikasi **wajib beroperasi 100% mandiri secara luring (*offline-first*)** setelah pemuatan pertama.
* **Rasio Layar**: Dioptimalkan untuk orientasi *portrait* di ponsel (360×640 px hingga 412×915 px) serta adaptif responsif pada layar laptop (1366×768 px).

---

## 5. Arsitektur Alur Pengguna (*User Flow*)

```
[Mulai di Browser HP / Standalone PWA]
   │
   ▼
[Layar Onboarding Gamifikasi]
   ├── Input No. Meja / ID Kelompok
   ├── Input No. Absen & Nama Murid 1
   ├── Input No. Absen & Nama Murid 2
   └── Pilih Lencana Tim ➔ [Tersimpan Asinkronus di IndexedDB]
   │
   ▼
[Pusat Kendali Misi / Dashboard Modul]
   │
   ├── [Modul 1: Fondasi Logika & Operator] ──┐
   ├── [Modul 2: Percabangan Tunggal IF] ─────┼── [STATUS: TERBUKA (SIKLUS I)]
   ├── [Modul 3: Percabangan Ganda IF-ELSE] ──┘
   │
   ├── [Modul 4: Percabangan ELSE-IF] ────────┐
   └── [Modul 5: Percabangan SWITCH-CASE] ────┴── [STATUS: TERKUNCI 🔒 (SIKLUS II)]
                                                  (Dapat dibuka via Teacher PIN)
   │
   ▼ (Pilih Modul Aktif)
[Arena Tantangan Kasus]
   │
   ├── 1. Baca Kasus Masalah Nyata & Amati Kode
   │      └── Tombol Toggle Cepat: [Pseudocode ID] ⮂ [Bahasa C]
   │
   ├── 2. Masukkan Angka Uji (Input Data)
   │
   ├── 3. Gerbang Berkesadaran ("Pause & Predict")
   │      └── Wajib Pilih: Apakah Kondisi TRUE / FALSE? Output apa yang diharapkan?
   │
   ├── 4. Buka Kunci Simulasi ➔ Tekan "Jalankan Visual Tracing"
   │      └── Animasi Stepper: Baris kode dievaluasi (Hijau / Merah / Redup)
   │
   ├── 5. Umpan Balik Real-time & Scaffolding
   │      ├── Prediksi Tepat ➔ Validasi nalar positif
   │      └── Prediksi Meleset ➔ Hint penuntun bertahap (tanpa membocorkan kunci)
   │
   ├── 6. Pelacak Branch Coverage (Tantangan Bintang 2)
   │      ├── Baru 1 cabang diuji ➔ Bintang 1 ⭐ (Tantangan: Uji cabang lainnya!)
   │      └── Kedua cabang teruji ➔ Bintang 2 ⭐⭐ (Lencana 100% Teruji)
   │
   └── 7. Penutupan Aktivitas
          └── Instruksi: "Salin tabel data uji dan simpulan ke LKPD Fisik Kelompok!"
```

---

## 6. Spesifikasi Kebutuhan Fungsional (*Functional Requirements*)

### FR-1: Onboarding Gamifikasi & Manajemen Sesi Pasangan
* **Deskripsi**: Layar awal pembuka bertema markas penyelidik kode (*Logic Mission*) untuk 1 kelompok (2 murid).
* **Komponen Input**:
  * Input Nomor Meja / ID Kelompok (Contoh: `03`).
  * Input Nomor Absen & Nama Lengkap Murid 1.
  * Input Nomor Absen & Nama Lengkap Murid 2.
  * Pemilih Lambang Tim (4 pilihan sederhana: *Tim Algoritma*, *Tim Biner*, *Tim Matriks*, *Tim Vektor*).
* **Aturan Anti-Slop & Persistensi**:
  * Kolaborasi berpasangan berlangsung secara alami tanpa sistem kaku tukar peran (*swap roles*) yang membebani murid di kelas.
  * Tidak ada formulir registrasi palsu, tidak meminta email atau password.
  * Data sesi dan progres disimpan secara asinkronus di **IndexedDB** lokal gawai (menggunakan pustaka ringan `idb-keyval`), tanpa membebani render-thread kanvas dan tahan terhadap pembersihan memori otomatis peramban.
  * Terdapat tombol kecil "Ganti Pasangan" untuk mereset data jika HP berganti pengguna.

### FR-2: Mesin Dwi-Bahasa (*Dual-Syntax Switcher Engine*)
* **Deskripsi**: Saklar instan untuk menampilkan representasi logika dalam Pseudocode Bahasa Indonesia atau Bahasa C.
* **Aturan Bahasa**:
  * **Mode Pseudocode**: Menggunakan kata kunci bahasa Indonesia kapital rapi (`JIKA`, `MAKA`, `LAINNYA`, `SELESAI JIKA`, `TAMPILKAN`, `==`, `!=`).
  * **Mode Bahasa C**: Menggunakan sintaks formal standar (`if (...) { ... } else { ... }`, `printf(...)`).
* **Kriteria Penerimaan**:
  * Pergantian sintaks terjadi seketika (*instant zero-delay*) tanpa me-refresh halaman.
  * Penomoran baris dan penyorotan aktif (*active line highlight*) tetap presisi 1:1 pada kedua mode.

### FR-3: Mesin Penelusuran Alur Visual (*Visual Code Tracing Engine*)
* **Deskripsi**: Mesin penelusuran langkah-demi-langkah yang memvisualisasikan eksekusi kode.
* **Mekanika Visual**:
  * *Line Stepper*: Penunjuk visual bergerak menelusuri baris inisialisasi menuju baris pemeriksaan kondisi.
  * *Evaluasi Kondisi Nyata*:
    * Pada baris kondisi, perbandingan nilai langsung dihitung di depan mata murid. Contoh: `nilai >= 75` dengan input `80` akan memunculkan transisi halus label `[ 80 >= 75 → BENAR ]` dengan latar hijau lembut.
    * Jika bernilai salah: `[ 70 >= 75 → SALAH ]` dengan latar merah lembut.
  * *Pemisahan Jalur Aktif & Jalur Redup*:
    * Blok instruksi yang dijalankan menyala kontras dengan bingkai jelas.
    * Blok instruksi yang dilewati (*skipped branch*) otomatis meredup dengan tingkat kecerahan rendah (opasitas 35%), menegaskan bahwa CPU tidak mengeksekusi instruksi tersebut.
  * *Terminal Konsol Mini*: Menampilkan teks hasil program di kotak terminal bawah secara real-time.

### FR-4: Gerbang Prediksi Berkesadaran (*Mindful Predict-First*)
* **Deskripsi**: Fitur metakognisi untuk menghentikan kebiasaan asal klik (*mindless clicking*).
* **Alur Validasi**:
  * Saat nilai input baru diketikkan, tombol "Jalankan Simulasi" terkunci (*disabled*).
  * Murid diwajibkan memilih 2 hal terlebih dahulu:
    1. Nilai Kondisi: `[ BENAR ]` atau `[ SALAH ]`.
    2. Jalur yang Dijalankan: `[ Cabang IF ]` atau `[ Cabang ELSE ]`.
  * Begitu kedua prediksi dipilih, tombol simulasi aktif menyala.
  * Pasca-simulasi, aplikasi membandingkan tebakan murid dengan fakta alur program secara objektif dan mendidik.

### FR-5: Pelacak Cakupan Cabang & Sistem Pengalaman (*Branch Coverage & XP*)
* **Deskripsi**: Sistem gamifikasi 2 Bintang dan poin pengalaman (XP) untuk menjamin murid menguji seluruh skenario percabangan.
* **Kriteria Lencana & XP**:
  * **⭐ Bintang 1 (Uji Cabang Pertama)**: Diraih saat murid berhasil menguji salah satu cabang (misalnya input bernilai `TRUE`) -> memperoleh **+50 XP**.
  * **⭐⭐ Bintang 2 (100% Branch Coverage)**: Diraih saat murid berhasil memikirkan dan memasukkan data uji yang mengeksekusi cabang lainnya (cabang `FALSE` / `ELSE`) -> memperoleh **+100 XP** tambahan.
  * **Level Karakter Pasangan**: Poin XP menaikkan level tim ($Level = \lfloor \frac{XP}{100} \rfloor + 1$, hingga Level 5 maksimal pada akhir Siklus II).
  * Muncul pesan pemenuhan target: *"Hebat! Kedua cabang logika sudah berhasil kalian uji secara tuntas!"*

### FR-6: Sistem Scaffolding & Bantuan Bertahap (*Adaptive Hints*)
* **Deskripsi**: Bantuan reflektif saat hasil simulasi berbeda dengan prediksi murid.
* **Aturan Anti-Slop**: **Tidak boleh langsung memberikan jawaban jadi.**
* **Tingkatan Bantuan**:
  * *Level 1*: Mengarahkan perhatian pada nilai variabel saat ini.
  * *Level 2*: Mengingatkan kembali makna operator relasional yang dipakai.
  * *Level 3*: Mengarahkan ke konsekuensi lompatan alur program.

### FR-7: Sistem Penguncian Siklus PTK (*Cycle Gating System*)
* **Deskripsi**: Isolasi perlakuan tindakan agar materi Siklus II tidak diakses mendahului jadwal.
* **Mekanisme**:
  * Parameter sistem default: `activeCycle = 1`.
  * Pada Siklus I:
    * Modul 1, 2, 3: Terbuka dan dapat dimainkan.
    * Modul 4 (`else-if`) dan Modul 5 (`switch-case`): Terkunci (ikon gembok 🔒, tampilan monokrom, dan keterangan: *"Materi Misi Siklus II - Akan diaktifkan pada pertemuan berikutnya"*).
  * **Teacher Secret Passcode**:
    * Mengetuk logo pojok kiri atas 3 kali memunculkan modal PIN guru.
    * Memasukkan PIN `PTK10` akan mengubah mode menjadi Siklus II dan seketika membuka modul 4 dan 5 secara permanen pada perangkat tersebut.

### FR-8: Rekapitulasi Sesi & Jembatan ke LKPD Fisik
* **Deskripsi**: Tabel rekapitulasi data uji yang telah dicoba murid untuk disalin ke LKPD kertas.
* **Format Tabel**: Menampilkan daftar input yang dicoba, nilai kondisi, jalur yang terpilih, dan teks keluaran.
* **Instruksi Operasional**: *"Salin data kasus uji yang telah kalian buktikan di atas ke Lembar LKPD Kelompok, lalu diskusikan kesimpulannya bersama pasanganmu!"*

### FR-9: Arena Tantangan Pertarungan Logika (*Branching Battle Challenge*)
* **Deskripsi**: Mode tantangan gamifikasi berbasis pertempuran giliran (*turn-based RPG*) yang ditempatkan di arena khusus (*Lab Komputer / Taman Kota*) untuk menguji ketangkasan evaluasi kondisi murid di situasi dinamis.
* **Mekanika Permainan**:
  * Karakter pemain berhadapan dengan *Bug Monster Lv. 4* (HP: 28/40).
  * Murid membaca aturan kondisi: `Kondisi: HP musuh > 50 ? Jika Ya -> Serangan A, Jika Tidak -> Serangan B`.
  * Murid memilih aksi pada menu perintah (`[⚔ Serang]`, `[🎒 Item]`, `[📖 Belajar]`, `[🏃 Lari]`).
  * Keputusan yang tepat menghasilkan serangan kritis efektif (+50 XP) dan efek suara kemenangan retro; keputusan yang keliru memicu serangan balik musuh dan umpan balik reflektif dari NPC Guru.

### FR-10: Ekspor Asesmen Formatif & Integrasi Cloud Drive (Web Share API)
* **Deskripsi**: Fasilitas pengambilan data kemajuan belajar formatif kelompok dari IndexedDB lokal untuk dianalisis oleh guru sebagai bukti triangulasi tindakan PTK.
* **Format Penamaan File Otomatis**:
  `iobranch_S[Siklus]_Meja[IDMeja]_[Murid1]_[Murid2].csv`  
  (Contoh: `iobranch_S1_Meja03_Raka12_Budi08.csv`).
* **Struktur Rekap Data Formatif**:
  Timestamp sesi, Nomor Meja/Kelompok, Nama Murid 1 & No. Absen, Nama Murid 2 & No. Absen, Simbol Tim, Modul yang Diselesaikan, Skor Kuis Formatif In-Game (Layar 07/08), Status Branch Coverage (Bintang 1/2), Jumlah Kesalahan Prediksi, dan Total Akumulasi XP.
* **Mekanisme Pengunggahan Dua Jalur (Mobile-First)**:
  1. *Jalur Utama (Web Share API)*: Mengetuk tombol `[ 📤 Kirim Rekap ke Google Drive ]` memicu jendela *Native Share Sheet* HP (Android/iOS). Murid memilih aplikasi **"Google Drive (Simpan ke Drive)"** dan menyimpan ke folder kelas guru dalam 2 ketukan.
  2. *Jalur Cadangan (Fallback)*: Jika peramban gawai tidak mendukung Web Share, sistem otomatis mengunduh file `.csv` lokal dan membuka tab peramban baru ke tautan Google Drive guru (Tautan default: `https://s.id/drive-ptk-x10`, dapat diubah dinamis oleh guru melalui menu PIN `PTK10`).

---

## 7. Katalog Kasus Masalah Nyata (*Meaningful Learning Modules*)

| Kode | Kasus Nyata | Masalah Dunia Nyata | Konsep Percabangan |
|---|---|---|---|
| **M-01** | **Gerbang Tiket Stasiun KRL/MRT** | Menentukan apakah penumpang boleh masuk peron berdasarkan saldo kartu vs tarif minimal perjalanan (Rp4.000). | Operator Relasional (`>=`, `==`), evaluasi nilai Boolean. Mengikis kerancuan antara `=` dan `==`. |
| **M-02** | **Sistem Alarm Suhu Ruang Server** | Menyalakan sirine peringatan hanya jika suhu ruangan melebihi 30°C. Jika tidak, sistem tenang tanpa aksi tambahan. | Percabangan Tunggal (`IF`). Memahami bahwa jika kondisi salah, komputer tidak melakukan apa-apa dan langsung lanjut. |
| **M-03** | **Kantin Digital (Kupon Diskon)** | Total belanja di atas Rp25.000 mendapat potongan harga kupon Rp5.000, sedangkan di bawah itu membayar tarif normal. | Percabangan Ganda (`IF - ELSE`). Melatih pembuktian 100% *Branch Coverage* (menguji kasus dapat diskon dan tanpa diskon). |
| **M-04** | **Klasifikasi Kecepatan Paket Data** | *[SIKLUS II - TERKUNCI 🔒]* Menentukan status jaringan: Cepat ($\ge 50$ Mbps), Sedang ($20 - 49$ Mbps), atau Lambat ($< 20$ Mbps). | Percabangan Bertingkat (`ELSE - IF`). Menganalisis kesalahan urutan kondisi dan pencegahan kondisi tumpang tindih. |
| **M-05** | **Pemilih Menu Minuman Mesin Otomatis** | *[SIKLUS II - TERKUNCI 🔒]* Pengguna menekan tombol 1 (Kopi), 2 (Teh), 3 (Susu), atau nomor lain (Menu Tidak Ada). | Percabangan Multi-Kategori (`SWITCH - CASE`). Memahami perbandingan diskrit berbasis menu angka. |

---

## 8. Spesifikasi Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

### NFR-1: PWA & Offline-First Caching
* **Web App Manifest (`manifest.webmanifest`)**:
  * Mendukung mode `display: standalone` sehingga saat di-*Add to Home Screen*, aplikasi berjalan bersih tanpa bilah alamat (*address bar*) browser.
  * Ikon standar PWA ukuran 192×192 px dan 512×512 px.
* **Service Worker (`sw.js`)**:
  * Menerapkan strategi **Cache-First** untuk semua berkas inti statis (HTML, CSS, JS, font lokal).
  * Menjamin aplikasi **100% berfungsi normal dalam Mode Pesawat (*Airplane Mode*)** tanpa butuh koneksi internet sama sekali setelah pemuatan pertama.

### NFR-2: Performa & Ringan Sumber Daya
* Total ukuran seluruh berkas aplikasi (HTML + CSS + JS + Ikon) **di bawah 1 MB**.
* Bebas dari pustaka/framework luar yang berat (*zero heavy external frameworks*).
* Waktu inisialisasi awal (*First Meaningful Paint*) $< 1$ detik di ponsel Android RAM 2 GB.
* Tidak ada animasi berat yang menguras baterai atau membuat ponsel murid panas.

### NFR-3: Aksesibilitas & Responsivitas Antarmuka
* **Ukuran Sentuh (*Touch Target*)**: Semua tombol memiliki area sentuh minimal 48×48 px (tinggi tombol minimal 48 px) agar nyaman ditekan jemari murid pada gawai bersama di meja sesuai standar WCAG 2.2 AAA.
* **Kontras Warna**: Memenuhi standar keterbacaan WCAG AA (rasio kontras teks kode terhadap latar gelap minimal 4.5:1).
* **Tipografi**: Menggunakan font monospace bersih untuk blok kode dengan pemisahan warna sintaks yang kontras dan jelas.

### NFR-4: Privasi & Nol Beban Infrastruktur
* Tidak mengumpulkan data pribadi murid (tanpa email, tanpa nomor HP, tanpa pelacak analitik luar).
* Tidak membutuhkan database peladen (*cloud database*); seluruh status lencana, XP, dan sesi pasangan tersimpan secara privat di **IndexedDB** lokal gawai.

---

## 9. Desain Sistem & Antarmuka (UI/UX Design Tokens)

### 9.1 Palet Warna Fungsional (*Non-Slop Color Tokens - SSOT: DESIGN.md*)
* **Latar Luar Aplikasi (*App Background*)**: `#081026`
* **Latar Kanvas Dunia Pixel (*Canvas Background*)**: `#090E17`
* **Kartu Panel Kontrol Retro (*Surface Panel*)**: `#0B132B` (Deep Slate) & `#131D2E` dengan garis batas retro `#2A3A54`.
* **Latar Kotak Editor Kode (*Code Surface*)**: `#050B14`
* **Aksen Utama Merek (*Brand Cyan*)**: `#38B2F6` (Tombol navigasi, link, active highlight).
* **Tombol Aksi Utama (*CTA Gold*)**: `#F59E0B` dengan bayangan bawah `#D97706`.
* **Teks Utama (*Primary Text*)**: `#F8FAFC` (Putih tajam berkontras tinggi).
* **Teks Sekunder (*Muted Text*)**: `#94A3B8` (Abu-abu netral untuk petunjuk sekunder).
* **Status Logika BENAR (*Logic TRUE*)**: `#10B981` (Teks `#34D399`, latar semi-transparan `rgba(16, 185, 129, 0.18)`).
* **Status Logika SALAH (*Logic FALSE*)**: `#EF4444` (Teks `#F87171`, latar semi-transparan `rgba(239, 68, 68, 0.18)`).
* **Jalur Dilewati (*Skipped Branch*)**: Opasitas otomatis turun menjadi **35% (`opacity: 0.35`)**.

### 9.2 Tipografi
* **Logo, Judul, HUD, & Badge Status**: `Press Start 2P`, monospace pixel.
* **Teks Narasi, Konten, & Soal**: `Inter` / `Plus Jakarta Sans`, sans-serif bersih dan tajam.
* **Blok Kode Sumber & Terminal**: `JetBrains Mono` / `Consolas`, monospace keterbacaan tinggi.

### 9.3 Efek Suara Mikro Edukatif (*Native Web Audio API*)
* Menghasilkan audio langsung dari peramban tanpa mengunduh file audio luar (mengikuti spesifikasi `AUDIO_CRAFT` pada `DESIGN.md`):
  * *Dialog Mesin Tik*: Klik mikro frekuensi 480 Hz (20 ms, square wave).
  * *Tombol Interaksi*: Blip nada 330 Hz (40 ms, square wave).
  * *Kondisi TRUE*: Nada tinggi 587.33 Hz / D5 (80 ms, triangle wave).
  * *Kondisi FALSE*: Nada rendah 220.00 Hz / A3 (120 ms, sawtooth wave).
  * *Capaian 100% Branch Coverage*: Arpeggio kemenangan 4 nada retro C5–E5–G5–C6 (523–1046 Hz).
* Tombol *Mute Audio* (Bisu) disediakan di pojok atas jika ruang kelas membutuhkan keheningan.

---

## 10. Arsitektur Teknis Berkas Proyek

Aplikasi dikemas dalam arsitektur modern berbasis **Phaser 3 + TypeScript + Vite + PWA** di dalam direktori `iobranch/`:

```text
d:\Anthonio Akbar\After Wisuda\PPG PRAJAB\LMS\!SEMESTER 2\PTK\
└── iobranch/
    ├── package.json            # Dependensi inti (Phaser 3, idb-keyval, Vite, PWA)
    ├── tsconfig.json           # Konfigurasi compiler TypeScript ketat
    ├── vite.config.ts          # Integrasi Workbox PWA & aset precaching
    ├── vercel.json             # Konfigurasi deployment & header HTTPS PWA
    ├── index.html              # Shell antarmuka hybrid (Canvas + Retro DOM)
    │
    ├── public/
    │   ├── manifest.webmanifest
    │   └── assets/ (tilesets, maps Tiled JSON, sprites atlas Aseprite, icons)
    │
    └── src/
        ├── main.ts             # Titik masuk bootstrap aplikasi
        ├── style.css           # Token desain Anti-Slop & utilitas retro GBA
        ├── types/              # Definisi interface modul, sesi, dan event
        ├── game/               # Phaser config, EventCenter, dan Scenes
        ├── ui/                 # Pengendali DOM UI, SyntaxRenderer, DialogBox
        ├── logic/              # TracerEngine, CycleGuard, dan data modul
        └── services/           # StorageService (IndexedDB) & AudioService (Web Audio)
```

---

## 11. Rencana Penggelaran Vercel & Prosedur Akses Murid

1. **Konfigurasi `vercel.json`**:
   * Menyediakan aturan perutean bersih (*clean URLs*) agar file `index.html` selalu terlayani dengan benar.
   * Menambahkan header perizinan Service Worker (`Service-Worker-Allowed: /`).
2. **Prosedur Penggelaran Cepat**:
   * Direktori `iobranch` dapat langsung di-deploy melalui dasbor Vercel (bisa melalui import Git atau deploy instan).
   * Vercel otomatis menyediakan sertifikat keamanan HTTPS (syarat mutlak agar fitur PWA dan Service Worker aktif).
3. **Distribusi Kelas pada 22 September**:
   * Tautan Vercel diperpendek menjadi link lokal ramah murid: **`s.id/iobranch`**.
   * Disediakan QR Code di slide depan kelas untuk dipindai oleh 23 gawai pasangan murid.
   * Murid diarahkan memilih menu peramban: *"Tambahkan ke Layar Utama" (Add to Home Screen)*.

---

## 12. Matriks Penyelarasan Indikator Keberhasilan PTK (*Traceability Matrix*)

| Target PTK | Fitur Spesifik PWA | Bukti Keberhasilan Terverifikasi |
|---|---|---|
| **IKTP-1 (Konsep & Operator)** | Modul 1 & Saklar Dwi-Bahasa (Pseudocode $\leftrightarrow$ C) menegaskan perbedaan `=` vs `==`. | Murid mampu menjawab benar butir soal 1–4 pada tes tertulis. |
| **IKTP-2 (Code Tracing & Jalur)** | Mesin Penelusur Alur menyorot baris aktif, memvalidasi kondisi secara visual, dan menampilkan terminal. | Murid terbiasa menelusuri alur langkah-demi-langkah pada soal 5–9 tes tertulis. |
| **IKTP-3 (Analisis Kesalahan Logika)** | Bantuan *Scaffolding* membimbing murid saat prediksi alurnya tidak sesuai dengan kenyataan eksekusi. | Murid mampu mendeteksi kondisi tumpang tindih pada soal uraian nomor 10 tes tertulis. |
| **IKTP-4 (Branch Coverage & Kasus Uji)** | Lencana Bintang 2 menantang murid mencari data uji yang mencakup cabang `IF` dan cabang `ELSE`. | Murid mampu menyusun kasus uji menyeluruh pada soal uraian nomor 11 tes tertulis. |
| **Pilar 1: Kognitif Klasikal ($N\text{-Gain} \ge 0{,}30$)** | Gabungan pengalaman simulasi interaktif memicu pemahaman konsep mendalam dari *Pretest* ke *Posttest*. | Nilai rata-rata kelas meningkat dengan skor $N\text{-Gain}$ minimal kategori Sedang. |
| **Pilar 3: Persepsi Media PWA ($\text{Rerata} \ge 3{,}00$)** | Antarmuka bersih anti-slop, lancar luring tanpa kuota, dan pengalaman kerja berpasangan yang menyenangkan. | Skor angket persepsi murid di akhir Siklus II mencapai kategori Positif / Sangat Baik. |

---

## 13. Gerbang Pengiriman Anti-Slop (*Delivery Gate Checklist*)

Sebelum PWA dinyatakan selesai dan siap digunakan di kelas pada 22 September 2026, aplikasi wajib melewati audit kelulusan berikut:

- [ ] **PASS**: Bebas dari gradien ungu/pelangi generik tanpa alasan pedagogis.
- [ ] **PASS**: Seluruh tombol interaktif berfungsi 100% (tidak ada tombol pajangan).
- [ ] **PASS**: Saklar dwi-bahasa (Pseudocode $\leftrightarrow$ Bahasa C) beralih seketika dengan pemetaan baris yang presisi.
- [ ] **PASS**: Tombol simulasi terkunci sebelum murid memilih prediksi nilai kondisi dan cabang.
- [ ] **PASS**: Indikator *Branch Coverage* memberikan bintang secara akurat saat kedua cabang berhasil diuji.
- [ ] **PASS**: Modul Siklus II terkunci rapat dan hanya dapat dibuka melalui PIN rahasia guru.
- [ ] **PASS**: Aplikasi dapat dibuka dan dimainkan secara penuh dalam *Airplane Mode* (tanpa internet).
- [ ] **PASS**: Tidak ada teks pemasaran klise AI; seluruh instruksi bernada edukatif, hangat, dan operasional.
