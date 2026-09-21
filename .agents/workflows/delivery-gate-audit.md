# Workflow: Audit Kesiapan Rilis Kelas (Delivery Gate PTK)

Alur kerja ini dijalankan sebelum aplikasi diserahkan atau dipakai oleh siswa pada siklus penelitian tindakan kelas (PTK). Mengacu pada aturan Anti-Slop R-35 (Verify Before You Deliver) dan lima pilar Craftsmanship (C-1 s.d. C-5).

---

## Daftar Periksa Audit (Delivery Checklist)

### 1. Uji Kontrol Interaktif (Click-Through Audit R-26 & R-35)
Klik dan uji seluruh elemen interaktif satu per satu pada aplikasi yang sedang berjalan:
- [ ] Tombol Registrasi Pasangan (Input nama Siswa 1, Siswa 2, Kelompok): Menyimpan data dan beralih ke layar misi.
- [ ] Saklar Dwi-Bahasa (C ⮂ Pseudocode): Beralih instan tanpa me-reload game atau menghilangkan input.
- [ ] Input Nilai Variabel: Merespons angka positif, angka 0, dan angka negatif dengan aman.
- [ ] Tombol Pilihan Prediksi (Pause & Predict): Wajib dipilih sebelum tombol simulasi dapat diaktifkan.
- [ ] Tombol Eksekusi / Tracing: Menjalankan animasi Hero di Canvas Phaser dan sinkron dengan sorotan baris kode.
- [ ] Dialog Kunci Siklus II (PIN Guru): Menerima PIN `PTK10` untuk membuka modul, dan menolak PIN yang salah dengan pesan jelas.
- [ ] Tombol Ekspor CSV / Rekap: Mengunduh file CSV dengan format kolom rapi tanpa crash.

### 2. Audit Kontras Aksesibilitas Warna (R-25)
Jalankan skrip pemeriksaan kontras warna terhadap palet UI dan teks:
```powershell
python .agents/skills/antislop-human/contrast-check.py "#0B132B" "#F8FAFC"
```
- [ ] Rasio kontras teks normal memenuhi standar minimal WCAG AA (4.5:1).
- [ ] Rasio kontras teks status TRUE (Hijau) dan FALSE (Merah) terhadap latar belakang terbaca dengan jelas.

### 3. Audit Tampilan Layar HP Sempit (360px R-03)
Uji aplikasi pada viewport HP (lebar 360px, misal Samsung Galaxy atau Xiaomi low-end):
- [ ] Tidak ada scroll horizontal yang tidak disengaja (*no horizontal overflow*).
- [ ] Canvas Phaser menyesuaikan skala secara proporsional (*letterboxing* rapi).
- [ ] Semua tombol dan input memiliki ukuran sentuh minimal 44px (*tap target compliance*).
- [ ] Teks dan kode tidak terpotong atau tumpang tindih.

### 4. Audit Kejujuran Bahasa & Anti-Slop Copy (R-02 & R-36)
- [ ] Bebas dari tanda baca em dash (`—`) pada seluruh teks antarmuka.
- [ ] Bebas dari kata pemasaran klise ("AI-Powered", "Generasi Baru", dsb.).
- [ ] Seluruh pesan umpan balik menggunakan bahasa instruksional yang membimbing nalar siswa.
