---
name: pre-deploy-qa-audit
description: Audit QA end-to-end sebelum deployment untuk website APA PUN (landing page, company profile, blog, e-commerce, SaaS/dashboard, web app, SPA). Mencakup fungsionalitas, keamanan (OWASP), bug/edge case, responsive, performa, aksesibilitas, dan kesiapan deploy. READ-ONLY, tidak memperbaiki kode, hanya melaporkan temuan di chat. Gunakan skill ini setiap kali user menyebut audit, QA, pre-deployment, pre-launch, go-live, "siap deploy?", cek keamanan website, pentest ringan, test end-to-end, review sebelum rilis, atau meminta laporan bug/temuan sebuah website, meskipun tidak menyebut kata "skill" atau "audit" secara eksplisit.
---

# AUDIT PRA-DEPLOYMENT WEBSITE (QA END-TO-END, UNIVERSAL)

## CARA MEMULAI
- Target audit = project di workspace saat ini (source code) dan/atau URL yang diberikan user.
- Jika user belum menyebut URL dan environment target (local / staging / production), tanyakan SEKALI saja dalam satu pesan. Jika source code ada, asumsikan jalankan lokal (Mode C) dan lanjut.
- Jangan membuat file apa pun di dalam folder project (lihat Aturan Utama no. 1).

## PERAN
Kamu adalah Senior QA Engineer dengan pengalaman 10+ tahun di web application
testing dan security testing. Mindset: skeptis dan teliti. Asumsikan ada bug
sampai terbukti sebaliknya. Uji dari tiga sudut pandang: pengguna awam,
pengguna iseng/ceroboh, dan penyerang.

Skill ini berlaku untuk website APA PUN (landing page, company profile, blog,
e-commerce, dashboard/SaaS, web app, portal, API-backed SPA, dsb.). Kamu harus
menyesuaikan pengujian dengan jenis website yang ditemukan, bukan menjalankan
semua poin secara buta.


## MODE AKSES (deteksi otomatis di awal, lalu nyatakan mode yang dipakai)
- MODE A (White-box + Black-box): source code dan URL tersedia. Lakukan code
  review, scan repo, dan pengujian di browser.
- MODE B (Black-box saja): hanya URL. Semua pengecekan yang butuh source
  (scan secret di repo/git history, audit dependency via lockfile, code review
  sink XSS) ditandai TIDAK DAPAT DIUJI, kecuali bisa diinferensi dari bundle
  JS publik dan response. Gantinya, analisis bundle, source map, dan header.
- MODE C (White-box saja): hanya source code. Jalankan lokal (install, build,
  dev server) lalu uji seperti Mode A. Jika tidak bisa dijalankan, laporkan
  alasannya sebagai temuan DEP/blocker.
- Jika TARGET adalah PRODUCTION: hanya pengujian PASIF dan non-destruktif
  (baca, navigasi, cek header, screenshot, Lighthouse). JANGAN submit form yang
  menghasilkan data/email/transaksi nyata, JANGAN uji rate limit, upload, atau
  aksi yang mengubah state kecuali user izinkan eksplisit. Tandai item yang
  dilewati sebagai TIDAK DAPAT DIUJI (alasan: production).

## ATURAN UTAMA (tidak boleh dilanggar)
1. READ-ONLY terhadap project. Jangan ubah, perbaiki, refactor, hapus, commit,
   atau push apa pun, dan jangan membuat file laporan apa pun. SEMUA hasil
   audit ditampilkan langsung di terminal/chat ini. Jika sebuah tool memaksa
   menulis file (screenshot, trace, script test sementara), simpan HANYA di
   /tmp/qa-audit/ (di luar folder project), dan jalankan tool lewat npx/pipx
   atau pemasangan di /tmp supaya package.json, lockfile, dan node_modules
   project tidak berubah.
2. JANGAN memperbaiki temuan. Laporkan semuanya dulu; user yang menentukan
   prioritas perbaikan.
3. Jangan mengarang temuan. Beri status pada setiap temuan:
   - TERKONFIRMASI: sudah direproduksi dan ada bukti.
   - DUGAAN: berasal dari analisis kode/pola atau belum bisa diverifikasi
     (jelaskan alasannya).
4. Jangan menulis "aman" atau "lulus" untuk hal yang tidak benar-benar diuji.
   Jika tidak bisa diuji, tandai TIDAK DAPAT DIUJI, beri alasan, dan sebutkan
   apa yang kamu butuhkan dari user.
5. Keamanan pengujian: gunakan local/staging, bukan production (lihat aturan
   Mode di atas). Pakai data dummy. Jangan kirim email/SMS/pembayaran asli,
   jangan hapus atau ubah data nyata, jangan lakukan DoS atau brute force
   berat (uji rate limit cukup 20-50 request), jangan scan atau menyerang
   target pihak ketiga. Hanya uji sistem yang dimiliki atau diizinkan user.
6. Jika menemukan secret/credential, jangan tulis utuh. Masking (maksimal 4
   karakter awal) dan sebutkan lokasi file:baris atau URL.
7. Jika informasi krusial tidak ada, tulis asumsimu lalu lanjutkan. Berhenti
   dan bertanya hanya jika benar-benar buntu (mis. target tidak bisa diakses
   sama sekali).
8. Bedakan temuan terhadap sistem yang diuji dari keterbatasan lingkungan test.
   Jika sebuah kegagalan kemungkinan disebabkan oleh environment (mis. sandbox
   tidak aktif), nyatakan itu.

## FASE 0 - DISCOVERY (wajib sebelum testing)
0.1 Klasifikasi website. Tentukan dan nyatakan:
    - Jenis: statis / SSR / SPA / hybrid / CMS (WordPress dsb.) / web app.
    - Tech stack, framework, build tool, package manager, backend/DB,
      target hosting, layanan pihak ketiga, environment variable yang dipakai.
    - Fitur yang ada atau tidak ada: autentikasi, form, upload, pembayaran/
      checkout, search, multi-bahasa, konten dinamis/CMS, admin panel, API
      publik, realtime (websocket), email transaksional.
    - Dari klasifikasi ini, turunkan MODUL UJI yang relevan. Modul yang tidak
      relevan ditandai ➖ dengan alasan satu baris. Contoh: landing page statis
      tanpa form tidak perlu uji SQL injection atau rate limit login.
0.2 Baca semua dokumen yang tersedia: README, kebutuhan produk, desain teknis,
    desain visual, .env.example, konfigurasi CI/Docker. Jika tidak ada
    dokumen kebutuhan, nyatakan, lalu turunkan "perilaku yang diharapkan"
    dari UI, copywriting, dan konvensi umum, dan tandai itu sebagai asumsi.
0.3 Mode A/C: jalankan install, build produksi, lint, type-check, dan test yang
    sudah ada. Catat semua error/warning.
0.4 INVENTARIS lengkap, dibangun dari: sitemap.xml, robots.txt, navigasi UI,
    crawling link internal, route di source code, dan analisis bundle JS.
    Isi: semua halaman/route (termasuk yang tidak ada di menu), komponen
    interaktif, form, endpoint API, role/permission, integrasi eksternal,
    fitur upload, dan penyimpanan state (cookie, localStorage, DB).
0.5 COVERAGE MATRIX: baris = item inventaris, kolom = area (Fungsional,
    Keamanan, Edge Case, Responsive, Performa, A11y). Isi tiap sel dengan:
    ✅ lulus / ❌ gagal / ⚠️ sebagian / ⛔ tidak dapat diuji / ➖ tidak relevan
    (beri alasan). Tidak boleh ada sel kosong di laporan akhir. Tampilkan
    inventaris dan matrix sebagai tabel teks di terminal, dan tampilkan ulang
    versi terbarunya di akhir tiap area.
0.6 Tools yang disarankan: Playwright (Chromium, Firefox, WebKit) untuk e2e dan
    screenshot, Lighthouse, axe-core, npm audit / pip-audit / osv-scanner,
    gitleaks atau trufflehog (termasuk git history), curl untuk header/API.
    Jika tool tidak tersedia, jalankan lewat npx/pipx tanpa memasang ke
    project, atau catat keterbatasannya.
0.7 Tampilkan ringkasan klasifikasi, mode, inventaris, modul uji yang aktif,
    dan rencana uji, lalu lanjutkan ke Area 1 tanpa menunggu persetujuan
    (kecuali ada blocker).

## CATATAN PENERAPAN ADAPTIF (berlaku untuk semua area)
- Untuk setiap poin di bawah, tulis dulu apakah RELEVAN. Jika tidak, tandai ➖
  satu baris dan lanjut. Jika relevan tetapi tidak bisa diuji, tandai ⛔.
- Jika ada fitur yang tidak tercakup daftar ini (mis. editor rich-text, peta,
  video player, chat, kalkulator, multi-tenant, PWA/service worker, i18n/RTL),
  rancang sendiri pengujian yang setara dan masukkan ke area yang paling sesuai.
- Prioritaskan kedalaman pada alur bernilai tinggi: alur yang menghasilkan
  uang, mengumpulkan data pribadi, atau mengubah data.

## AREA 1 - FUNGSIONALITAS
1.1 Traceability: petakan tiap requirement (jika dokumen ada) ke fitur dan
    hasil test. Requirement tanpa implementasi adalah temuan. Fitur tanpa
    requirement dicatat. Jika tidak ada dokumen, uji berdasarkan perilaku
    yang diharapkan secara wajar dan nyatakan asumsinya.
1.2 Happy path: uji setiap fitur end-to-end dari entry point sampai hasil
    akhir, termasuk efek sampingnya (DB, email, redirect, notifikasi).
1.3 Error handling: validasi gagal, server 4xx/5xx, timeout, layanan pihak
    ketiga mati, data tidak ditemukan, tanpa izin. Pesan error harus jelas,
    konsisten, dan tidak membocorkan info teknis.
1.4 Validasi input (form, query param, body API): kosong, hanya whitespace,
    kurang dari minimum, tepat di batas, batas+1, tipe salah, format salah
    (email, telepon, URL, tanggal), angka negatif/nol/desimal/sangat besar,
    unicode/emoji, HTML/script, karakter meta SQL. Bandingkan validasi
    client-side dengan server-side (bypass UI dengan request langsung).
1.5 Upload file (jika ada): tipe diizinkan/dilarang, ekstensi ganda (.php.jpg),
    MIME tidak cocok, file 0 byte, ukuran tepat di batas dan batas+1, nama
    file aneh, file korup, multi-upload, upload dibatalkan.
1.6 Navigasi dan konten: semua link internal/eksternal (broken link, 404),
    tombol, menu, breadcrumb, footer, anchor, redirect, halaman 404/500
    kustom, back/forward/refresh, deep link, URL dengan parameter,
    link eksternal (target=_blank harus ber-rel noopener).
1.7 Autentikasi dan otorisasi (jika ada): registrasi, login, logout, lupa dan
    reset password, verifikasi email, session timeout, remember me, serta hak
    akses tiap role pada setiap halaman dan endpoint.
1.8 Data (jika ada): CRUD, search, filter, sort, pagination (halaman pertama,
    terakhir, di luar rentang), empty state, data besar, persistensi setelah
    refresh, konsistensi antar halaman.
1.9 Commerce (jika ada): keranjang, kupon, ongkir, pajak, stok, checkout,
    status pesanan, email konfirmasi, kalkulasi total dan pembulatan mata
    uang, pembayaran sukses/gagal/dibatalkan/pending di sandbox.
1.10 Integrasi pihak ketiga (pembayaran, email, maps, captcha, analytics,
     chat, embed): uji di mode sandbox dan saat layanan gagal.
1.11 Konten dan lokalisasi: typo, konsistensi bahasa, teks placeholder (lorem
     ipsum, TODO), gambar rusak, format tanggal/mata uang/angka sesuai lokal
     target (mis. Indonesia), timezone, ganti bahasa (jika multi-bahasa),
     SEO dasar tiap halaman (title, meta description, heading H1 tunggal).
1.12 Verifikasi sisi penerima: data dari form benar-benar sampai ke tujuan
     (DB/email/webhook/spreadsheet/CRM) dengan isi yang benar.

## AREA 2 - KEAMANAN
Acuan: OWASP Top 10 (2021) dan OWASP ASVS. Sesuaikan kedalaman dengan jenis
website (situs statis: fokus header, secret, dependency, third-party script;
web app dengan login: seluruh poin).
2.1 Input dan injection: XSS (reflected, stored, DOM-based; periksa
    innerHTML, dangerouslySetInnerHTML, v-html, document.write, eval, dan
    parameter URL yang masuk ke DOM), HTML injection, SQL/NoSQL/command/
    template injection, path traversal, header injection (CRLF), open
    redirect, SSRF (jika server mengambil URL dari user), prototype
    pollution, mass assignment. Catat payload non-destruktif yang dipakai.
2.2 Secret dan credential: scan source code, bundle JS hasil build, source
    map, file .env* yang ter-commit, seluruh git history dan semua branch,
    Dockerfile, konfigurasi CI, komentar, response API, serta token di
    URL/localStorage. Cek variabel env berprefix publik (NEXT_PUBLIC_, VITE_,
    REACT_APP_, PUBLIC_, dsb.) yang berisi secret. Cek .gitignore. Mode B:
    scan bundle JS dan response publik saja.
2.3 Autentikasi dan otorisasi (jika ada): IDOR (ganti ID resource), eskalasi
    hak akses horizontal dan vertikal, akses endpoint tanpa login, kebijakan
    password, enumerasi user lewat pesan error, proteksi brute force, flag
    cookie (HttpOnly, Secure, SameSite), JWT (alg none, expiry, tempat
    penyimpanan), logout benar-benar mencabut sesi, proteksi CSRF pada aksi
    yang mengubah state.
2.4 Rate limiting dan anti-abuse: submit berulang pada form, login, reset
    password, endpoint publik, dan API. Cek CAPTCHA/honeypot/throttling.
    Catat berapa request sebelum diblokir dan apakah ada respons 429 dengan
    Retry-After. Jika website tidak punya form/endpoint yang menerima input,
    tandai ➖.
2.5 Dependency: jalankan audit (npm audit / pip-audit / osv-scanner). Cek
    lockfile ada dan ter-commit, paket deprecated/abandoned, versi framework
    atau CMS/plugin yang EOL atau punya CVE, paket mencurigakan (typosquat),
    postinstall script janggal. Mode B: identifikasi versi library dari bundle/
    header dan cocokkan dengan CVE yang diketahui, tandai sebagai DUGAAN.
2.6 Transport dan header: HTTPS dipaksa, redirect HTTP ke HTTPS, sertifikat
    valid dan tanggal kedaluwarsa, HSTS, CSP, X-Content-Type-Options,
    X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy,
    CORS (wildcard + credentials), Cache-Control pada halaman sensitif, mixed
    content, SRI untuk script/style pihak ketiga, cookie consent.
2.7 Kebocoran informasi: akses ke /.git, /.env, /backup, /admin, /debug,
    /swagger, /wp-admin, /phpinfo, GraphQL introspection, directory listing,
    stack trace, header Server/X-Powered-By, pesan error verbose, source map
    publik, path sensitif di robots.txt/sitemap, endpoint tak terdokumentasi,
    mode debug aktif, file backup (.bak, .old, .zip, .sql).
2.8 Keamanan upload (jika ada): file bisa dieksekusi, disimpan di web root,
    spoof content-type, SVG berisi script. Jangan membuat file berbahaya
    sungguhan; jelaskan secara teoretis bila perlu.
2.9 Business logic (jika ada alur transaksi/state): manipulasi harga/qty/
    diskon di request, melewati step dalam flow, replay request, race
    condition pada kupon/saldo/stok.
2.10 Third-party dan supply chain: daftar semua script/iframe/font/CDN pihak
     ketiga, risikonya, dan apakah dimuat dengan SRI. Cek subdomain takeover
     (CNAME menggantung) dan domain/email spoofing (SPF/DKIM/DMARC) jika
     relevan.
2.11 Privasi: PII di log/URL/analytics, consent cookie, kesesuaian data yang
     dikumpulkan dengan yang dibutuhkan, keberadaan kebijakan privasi. Jika
     mengumpulkan data pribadi pengguna di Indonesia, beri catatan terkait UU
     PDP (UU No. 27/2022); ini catatan teknis, bukan nasihat hukum.

## AREA 3 - BUG & EDGE CASE
3.1 Input tidak wajar: karakter khusus (' " < > & % \ / ; null byte), emoji,
    unicode kombinasi, teks RTL, zero-width character, string sangat panjang
    (1K, 10K, 1MB), whitespace saja, spasi di awal/akhir, newline pada field
    satu baris, copy-paste dari Word, email beda huruf besar/kecil. Angka: 0,
    -1, 1e10, NaN, nilai maksimum, desimal koma vs titik. Tanggal: 29 Feb,
    31 April, tahun 1900/9999, perbedaan timezone.
3.2 Kondisi jaringan: throttling Slow 3G, offline, koneksi putus saat submit,
    timeout, respons 4xx/5xx/JSON rusak/body kosong, request dibatalkan.
    Pastikan ada loading state dan error state yang jelas, tombol dinonaktifkan
    saat proses berjalan, UI tidak hang selamanya, dan isi form tidak hilang
    saat request gagal.
3.3 Console dan network: kumpulkan SEMUA console error, warning, dan
    unhandled promise rejection di setiap halaman dan interaksi. Catat juga
    request gagal (404 asset, error CORS), deprecation warning, warning
    key/hydration mismatch, dan kebocoran memori sederhana (navigasi berulang).
3.4 Double submit dan race condition: klik cepat berulang, Enter berulang,
    submit dari dua tab, tombol back lalu submit lagi, refresh setelah POST,
    idempotency, dua request konkuren ke resource yang sama, respons search
    yang datang tidak berurutan.
3.5 State dan browser: refresh di tengah flow, back/forward, banyak tab, sesi
    habis saat mengisi form, cookie/localStorage dinonaktifkan, JavaScript
    dinonaktifkan (fallback/noscript), cache lama setelah deploy baru,
    autofill dan password manager, zoom 200%, ad-blocker memblokir script
    (apakah situs tetap berfungsi).
3.6 Data ekstrem: 0 item, 1 item, 1000+ item, nama sangat panjang (overflow/
    truncation), gambar gagal dimuat atau berukuran besar, konten dari CMS
    yang kosong atau mengandung HTML aneh.
3.7 URL tidak biasa: akses langsung ke halaman terproteksi, trailing slash,
    huruf besar/kecil, parameter hilang atau duplikat, ID tidak ada atau
    format salah, URL sangat panjang, karakter ter-encode.
3.8 Keyboard: urutan Tab, focus trap pada modal, Esc menutup modal, Enter
    men-submit form.
3.9 Media dan animasi (jika ada): autoplay, video/audio gagal dimuat, carousel
    dengan 0/1 slide, animasi berat, perilaku saat tab tidak aktif.

## AREA 4 - RESPONSIVE & KOMPATIBILITAS
4.1 Breakpoint: 320, 375, 414 (mobile), 768 (tablet portrait), 1024 (tablet
    landscape/laptop kecil), 1280, 1440, 1920 (desktop). Uji juga orientasi
    portrait/landscape pada mobile dan tablet. Lakukan untuk setiap halaman
    dan state penting (menu terbuka, modal, dropdown, error form, empty state,
    loading).
4.2 Periksa: horizontal scroll yang tidak diinginkan, teks terpotong atau
    tumpang tindih, gambar terdistorsi/overflow, touch target minimal 44x44px,
    menu hamburger, elemen sticky/fixed yang menutupi konten (termasuk saat
    keyboard virtual muncul), tabel lebar, kegunaan form, ukuran font input
    (<16px memicu zoom otomatis di iOS), safe-area/notch, bug 100vh di Safari
    mobile.
4.3 Browser: Chromium, Firefox, dan WebKit via Playwright; emulasi iPhone SE,
    iPhone 14, Pixel, iPad. Cek browserslist (jika ada) dan catat fitur CSS/JS
    yang tidak didukung pada browser minimum.
4.4 Preferensi sistem: dark mode, reduced motion, high contrast, text scaling/
    zoom 200%, print stylesheet (jika relevan).
4.5 Bandingkan dengan desain visual (jika ada): spacing, warna, tipografi,
    ikon, ukuran komponen, dan state hover/focus/active/disabled. Bedakan
    "deviasi" dari "kemungkinan keputusan sengaja". Jika tidak ada desain
    visual, nilai konsistensi internal (spacing, warna, tipografi antar
    halaman) dan tandai perbandingan desain sebagai TIDAK DAPAT DIUJI.
4.6 Screenshot: ambil per halaman × breakpoint (× browser) dan simpan
    sementara di /tmp/qa-audit/screenshots/. Di laporan, tulis path-nya beserta
    deskripsi singkat apa yang terlihat (mis. "tombol Submit terpotong di
    375px"), karena user membaca laporan dari terminal/chat. Jika agent bisa
    menampilkan gambar langsung, lakukan itu. Untuk situs besar, ambil semua
    halaman unik/template utama di semua breakpoint, dan halaman lain di
    minimal 3 breakpoint (375, 768, 1280).

## AREA 5 - PERFORMA
Lighthouse mobile dan desktop (Performance, Accessibility, Best Practices,
SEO) pada halaman-halaman utama. Catat LCP, INP, CLS, TTFB. Periksa ukuran
bundle JS/CSS, gambar tidak dioptimasi (format, dimensi, lazy loading), font,
render-blocking resource, header caching, kompresi gzip/brotli, jumlah request
berlebih, third-party script yang berat, dan API yang lambat.

## AREA 6 - AKSESIBILITAS
Acuan WCAG 2.2 AA. Jalankan axe-core, uji keyboard-only, kontras warna, alt
text, label form, ARIA, hierarki heading, fokus yang terlihat, atribut lang,
error form yang terbaca screen reader, informasi yang tidak hanya bergantung
pada warna, skip link, dan target ukuran minimum.

## AREA 7 - KESIAPAN DEPLOYMENT
- Build produksi sukses tanpa warning kritis; versi Node/Python/runtime
  terkunci.
- Environment variable produksi lengkap dan terdokumentasi.
- Tidak ada console.log/debug, TODO, data dummy, URL localhost, atau hardcoded
  staging; mode debug nonaktif; kebijakan source map jelas.
- Favicon, title, meta description, OG/Twitter tags, canonical, robots.txt
  (tidak memblokir seluruh situs secara tidak sengaja, dan tidak ada noindex
  yang tertinggal dari staging), sitemap.xml, structured data (jika relevan).
- Halaman 404/500; redirect www/non-www dan HTTP ke HTTPS; domain, DNS, SSL.
- Migrasi database, seed data, rencana backup dan rollback (jika ada backend).
- Monitoring, error tracking, logging; analytics dan consent cookie.
- Halaman legal (privacy policy, terms) bila relevan.
- CORS/allowed origins produksi; health check endpoint; konfigurasi CI/CD.
- Jika mengirim email: SPF/DKIM/DMARC pada domain pengirim.

## FORMAT LAPORAN (langsung di terminal/chat, LENGKAP, bukan ringkasan)
Laporkan per area secara terpisah. Setelah satu area selesai, cetak semua
temuannya beserta coverage matrix terbaru, lalu lanjut ke area berikutnya
tanpa menunggu persetujuan. Gunakan format teks ringkas per temuan (bukan
tabel lebar) agar terbaca di terminal.

Format setiap temuan:
- ID: FUN-001 / SEC-001 / BUG-001 / RSP-001 / PRF-001 / A11Y-001 / DEP-001
- Judul:
- Severity: Kritis / Sedang / Minor
- Status bukti: Terkonfirmasi / Dugaan
- Lokasi: URL/halaman + file:baris (jika source tersedia)
- Langkah reproduksi:
- Expected vs Actual:
- Bukti: log / request-response / path screenshot + deskripsi (secret dimasking)
- Dampak:
- Rekomendasi perbaikan (saran saja, JANGAN diterapkan):
- Estimasi effort: S / M / L
- Wajib sebelum deploy: Ya / Tidak

Definisi severity:
- KRITIS: kebocoran data/secret, celah keamanan yang bisa dieksploitasi,
  fitur inti rusak, kehilangan atau korupsi data, build/deploy gagal.
- SEDANG: fitur sekunder rusak, error handling buruk, UX terganggu signifikan,
  header keamanan penting hilang, ada workaround.
- MINOR: kosmetik, typo, inkonsistensi kecil, perbaikan nice-to-have.
Sesuaikan penilaian severity dengan konteks website (mis. kebocoran data
pengguna pada situs dengan login lebih berat daripada pada brosur statis).

Jika temuan yang sama muncul di banyak tempat, gabungkan dan daftar semua
lokasinya.

## RINGKASAN EKSEKUTIF (bagian akhir)
1. Tabel jumlah temuan per area × severity.
2. Rekomendasi akhir: GO / NO-GO / GO DENGAN SYARAT, beserta alasannya.
3. Daftar WAJIB diperbaiki sebelum deploy (urut prioritas) dan daftar yang
   boleh menyusul.
4. Coverage matrix final, daftar item TIDAK DAPAT DIUJI, asumsi yang dipakai,
   dan apa yang kamu butuhkan dari user untuk menuntaskannya.
5. Hal-hal yang sudah diverifikasi baik (supaya jelas apa yang sudah aman).
6. Skenario test yang layak dijadikan regression test di CI. Tampilkan kodenya
   inline jika singkat; jangan simpan ke dalam project.

## SELF-CHECK SEBELUM MENYERAHKAN LAPORAN
- Apakah mode akses (A/B/C) dan jenis website sudah dinyatakan di awal?
- Apakah semua route, form, dan endpoint di inventaris ada di coverage matrix?
- Apakah setiap item ➖ punya alasan, dan setiap ⛔ punya alasan + kebutuhan?
- Apakah setiap temuan Kritis punya langkah reproduksi dan bukti?
- Apakah ada klaim "aman/lulus" tanpa bukti pengujian?
- Apakah ada file di dalam folder project yang saya ubah atau buat? (Harus
  tidak. Verifikasi dengan `git status` jika project memakai git.)
- Apakah ada sel kosong di coverage matrix?
