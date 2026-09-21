<!-- antislop:start -->
## antislop & taste-skill & ponytail
For UI, copy, people, mobile layout, code comments, or token-efficient minimal coding work, load the antislop, design-taste, and ponytail skills:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Frontend taste & aesthetic reasoning: `design-taste-frontend`
- Copy & text: `antislop-copywriting`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
- Minimalist & Token Saver Mode (YAGNI / Stdlib / Native first): `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->

## Aturan Khusus Proyek (Project Rules & Quality Gates)

### 1. Larangan Mutlak Emoji Mentah (Zero Raw Emojis)
- **DILARANG KERAS** menggunakan emoji mentah Unicode (seperti ⚔️, 🛡️, 🏆, 💡, 📖, 🧪, 📍, 🎮, 📘, ⚡, ✔, dll.) pada seluruh antarmuka pengguna, tombol aksi, judul, badge, HUD, notifikasi, maupun dialog game.
- Setiap ikonografi visual wajib menggunakan:
  - Komponen SVG inline berpola pixel art / retro tajam beresolusi pas, atau
  - Tipografi retro terstruktur (`Press Start 2P`, `Inter`, `JetBrains Mono`), atau
  - Aset grafis/gambar pixel art yang dibuat khusus dengan bantuan Nano Banana / `generate_image`.

### 2. Standar Visual Anti-Slop (Harmoni Warna, Layout & Responsivitas)
- **Harmoni Warna Terang Anti-Slop (Zero Blue AI-Slop)**: Mengikuti palet resmi *Warm Parchment & Forest Emerald* (`--bg-app: #F7F5F0`, `--surface-panel: #FFFFFF`, `--surface-panel-alt: #EFECE6`) dengan aksen fungsional berkarakter: Forest Emerald (`#0F766E` / `#0D9488`), Warm Amber (`#D97706`), Crimson Alert (`#DC2626`), dan Charcoal Ink (`#1C1917`). DILARANG menggunakan warna biru AI-slop (seperti `#209cee`, `#38b2f6`, atau palet gelap kebiruan generik).
- **Layout Teratur & Tanpa Redundansi**: Tidak boleh ada antarmuka ganda (seperti duplikasi battle arena di DOM dan Canvas secara bersamaan).
- **Responsivitas Ekstrem (Mobile 360 px)**: Tampilan mobile wajib mengadopsi struktur kolom bertingkat (*stacked column*) di mana kanvas game tetap utuh dan stabil di bagian atas, dan kontrol/formulir interaksi di bawahnya dapat di-scroll lancar tanpa scrollbar OS mentah atau teks terpotong.
- **Acuan Desain Visual**: Seluruh pengembangan visual wajib berpatokan pada lembar acuan desain resmi (`DESIGN.md` & `implementation_plan.md`).

### 3. Eksekusi Mandatori di Awal Setiap Task (Mandatory Pre-Flight)
- **Trio Mandatori Selalu Aktif Sejak Detik Pertama**: Pada setiap task baru, seluruh aturan dalam `AGENTS.md` beserta tiga pilar utama:
  1. `ponytail` (Senior Dev Efficiency, YAGNI, Stdlib/Native First, Minimalist Diff & Token Saver)
  2. `antislop` (Core Filter, Anti-Slop UI, Copywriting, Code Hygiene, Mobile Layout, Human Accessibility)
  3. `design-taste-frontend` (Crafted Aesthetics, Warm Parchment & Forest Emerald Theme, Dynamic & Responsive UX)
  **WAJIB langsung aktif dan diterapkan sejak detik pertama proses berpikir, perancangan, dan penulisan kode**.
- Tidak boleh menunda atau melonggarkan standar taste dan efisiensi ke fase pasca-implementasi.
- Hindari frasa klise AI-slop, larangan em dash (`—`), larangan panah mentah (`▶`, `▼`), dan larangan pemblokir browser seperti `alert()`. Gunakan Title Case yang bersih dan ramah murid.

### 4. Larangan Mutlak Verifikasi Screenshot Browser (Zero Screenshot Storage Waste)
- **DILARANG KERAS** melakukan verifikasi otomatis dengan mengambil screenshot melalui browser, `browser_subagent`, `browser_screenshot`, Playwright, atau Puppeteer secara rutin, karena membebani ruang penyimpanan (storage disk) pengguna.
- Verifikasi hasil wajib dilakukan secara efisien melalui:
  1. Pemeriksaan tipe data statis: `npx tsc --noEmit`
  2. Pengujian bundle produksi: `npm run build`
  3. Pemeriksaan pola string dan regex teks menggunakan ripgrep (`grep_search`)
  4. Peninjauan kode langsung (*direct code review*)
- Pengambilan screenshot **HANYA** diperbolehkan apabila pengguna meminta secara eksplisit dalam instruksinya.

### 5. Pembakuan Mutlak Istilah Murid (Zero "Siswa" / "Peserta Didik")
- **Wajib Sejak Detik Pertama**: Pada setiap pembuatan kode baru, teks modul, narasi cerita, opsi kuis, umpan balik, dialog game, antarmuka pengguna (UI), komentar kode, maupun dokumen baru, agen **WAJIB LANGSUNG menghasilkan istilah "murid" sejak awal penulisan teks dan kode**.
- **DILARANG KERAS** memunculkan atau menggunakan istilah `siswa` maupun `peserta didik` dalam bentuk apa pun (huruf kecil, huruf kapital, maupun camelCase).
- **Verifikasi Mandatori Setiap Task**: Sebelum menyelesaikan task apa pun, lakukan penelusuran mandatori untuk memastikan tidak ada kata `siswa` atau `peserta didik` yang tidak sengaja tertulis ke dalam berkas proyek.

### 6. Pembakuan Kartu Bersih & Larangan Border Aksen Asimetris (Zero Decorative Top-Border Stripes)
- **DILARANG KERAS** membuat elemen kartu (*card*) dengan garis aksen warna tebal di bagian atas, baik melalui `border-top` berwarna kontras maupun pseudo-element (`::before` / `::after`) berbentuk garis aksen horizontal / gradien di tepi atas kartu.
- Seluruh kartu wajib mematuhi standar konsisten `.tactile-card`:
  - Menggunakan border simetris 4-sisi netral dan halus (`border: 1px solid var(--border-subtle)` atau `border: 1px solid var(--border-retro)`).
  - Sudut membulat rapi (`border-radius: 12px`).
  - Latar belakang panel bersih (`var(--surface-panel)` atau `#ffffff`).
  - Bayangan taktil subtil alami (`box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04), 0 6px 16px -4px rgba(28, 25, 23, 0.05)`).
- Penanda fokus, status, atau kategori pada kartu cukup direpresentasikan melalui komponen semantik yang rapi seperti *badge pill* (`.badge-pill`), teks *eyebrow*, atau ikon piksel retro, bukan melalui modifikasi garis border tepi asimetris.


