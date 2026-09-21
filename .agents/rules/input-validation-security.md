# Validasi Input, Keamanan Logika, dan Proteksi Siklus PTK

Aturan ini mengatur keamanan penelusuran logika program dan penanganan input pada aplikasi **iobranch**.

---

## 1. Larangan Keras Eksekusi Kode Dinamis (Anti-eval)

Untuk mengevaluasi ekspresi logika percabangan siswa (misal: `x > 10`, `a == b`, `nilai >= 75`):
- **DILARANG KERAS** menggunakan `eval()`, `Function()`, `window.eval()`, `setTimeout(string)`, atau trik eksekusi dinamis JavaScript lainnya.
- **Wajib menggunakan Safe Expression Evaluator**:
  - Mesin penelusur (`TracerEngine`) harus memproses kondisi logika menggunakan token parser terbatas atau operator mapping deterministik.
  - Operator yang didukung terbatas pada:
    - Kesetaraan & Relasional: `==`, `!=`, `<`, `<=`, `>`, `>=`
    - Logika Boolean: `&&`, `||`, `!`
    - Aritmatika Dasar: `+`, `-`, `*`, `/`, `%`
  - Setiap ekspresi yang mengandung karakter berbahaya atau di luar whitelist operator harus ditolak dengan pesan galat ramah pengguna.

---

## 2. Validasi Masukan Siswa (Input Edge Cases & Resilience)

Siswa di kelas sering kali menguji aplikasi dengan input tak terduga. Aplikasi harus memiliki ketahanan penuh terhadap kondisi batas:
- **Nilai Numerik**:
  - Validasi penanganan nilai `0`, angka negatif, desimal, dan angka sangat besar (*integer overflow*).
  - Jika input yang diharapkan adalah bilangan bulat, bersihkan masukan dengan `parseInt(value, 10)` dan validasi dengan `Number.isFinite()`.
  - Tampilkan pesan umpan balik visual yang jelas jika siswa memasukkan karakter non-angka pada field input numerik.
- **Nama & Identitas Kelompok (Sesi Pasangan)**:
  - Sanitasi masukan nama siswa dan nomor kelompok untuk mencegah karakter khusus yang merusak format ekspor CSV atau penyimpanan IndexedDB.
  - Batasi panjang karakter nama (maksimal 30 karakter per siswa).

---

## 3. Proteksi Modul Siklus Penelitian (CycleGuard)

Aplikasi digunakan dalam konteks Penelitian Tindakan Kelas (PTK) dengan dua siklus waktu:
- **Siklus I**: Materi IF dan IF-ELSE (Target: 22 September 2026).
- **Siklus II**: Materi ELSE-IF dan SWITCH-CASE (Target: 6 Oktober 2026).

Aturan proteksi:
1. **Penguncian Fungsional**:
   - Modul Siklus II harus berstatus terkunci secara default.
   - Tombol modul Siklus II tidak boleh disembunyikan secara diam-diam, melainkan ditampilkan dengan status terkunci (*disabled with badge*) disertai keterangan "Materi Siklus II".
2. **PIN Guru (PTK10)**:
   - Pembukaan modul Siklus II hanya dapat dilakukan dengan memasukkan PIN Guru yang valid: `PTK10`.
   - Penyimpanan status pembukaan kunci di IndexedDB harus terisolasi dan tervalidasi kembali saat aplikasi dimuat ulang.
