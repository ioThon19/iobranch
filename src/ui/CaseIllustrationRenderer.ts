// src/ui/CaseIllustrationRenderer.ts - Generator Ilustrasi Kontekstual 16-Bit Pixel Art untuk Kasus Penelusuran (SSOT: PRD.md, DESIGN.md & antislop-ui)

export interface CaseIllustrationMeta {
  title: string;
  subtitle: string;
  accentColor: string;
}

/**
 * Menghasilkan SVG 16-bit retro pixel art tajam (crispEdges) yang merepresentasikan
 * skenario masalah nyata pada masing-masing modul kasus di Meja Kerja Lab Telusur.
 */
export function renderCaseIllustrationPixelArt(moduleId: string, width = 160, height = 120): string {
  switch (moduleId) {
    case 'm01':
      // KASUS 1: Gerbang Tiket Stasiun MRT (Palang Otomatis, Kartu Saldo Metro, Indikator Lampu & Layar TAP IN)
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: block; border-radius: 8px; background: #1c1917; border: 1.5px solid #292524;" aria-label="Ilustrasi Gerbang Otomatis Stasiun MRT">
          <!-- Latar Dinding Terowongan Stasiun & Ubin Lantai Checkered -->
          <rect x="0" y="0" width="80" height="42" fill="#1c1917" />
          <rect x="0" y="42" width="80" height="18" fill="#292524" />
          <line x1="0" y1="42" x2="80" y2="42" stroke="#44403c" stroke-width="1" />
          <line x1="20" y1="42" x2="10" y2="60" stroke="#373330" stroke-width="1" />
          <line x1="40" y1="42" x2="35" y2="60" stroke="#373330" stroke-width="1" />
          <line x1="60" y1="42" x2="65" y2="60" stroke="#373330" stroke-width="1" />

          <!-- Garis Jalur Kereta & Dinding Belakang -->
          <rect x="4" y="6" width="72" height="2" fill="#292524" />
          <rect x="8" y="10" width="64" height="1" fill="#292524" />

          <!-- Tiang Penyangga Gerbang Kiri -->
          <rect x="16" y="16" width="10" height="28" fill="#334155" />
          <rect x="18" y="18" width="6" height="24" fill="#475569" />
          <rect x="20" y="20" width="2" height="20" fill="#64748b" />

          <!-- Palang Pintu Mekanik Gerbang MRT (Bilah Penghalang Swing) -->
          <!-- Posisi Palang: Menutup Melintang dengan Garis Kuning-Hitam Peringatan -->
          <rect x="26" y="28" width="28" height="4" fill="#f59e0b" />
          <rect x="30" y="28" width="4" height="4" fill="#1c1917" />
          <rect x="38" y="28" width="4" height="4" fill="#1c1917" />
          <rect x="46" y="28" width="4" height="4" fill="#1c1917" />

          <!-- Tiang Konsol Pembaca Kartu Kanan (Turnstile Console) -->
          <rect x="54" y="12" width="14" height="34" fill="#1e293b" />
          <rect x="56" y="14" width="10" height="30" fill="#334155" />
          <rect x="58" y="16" width="6" height="26" fill="#475569" />

          <!-- Lampu Status Indikator di Puncak Konsol (Hijau / Merah) -->
          <rect x="57" y="8" width="8" height="4" fill="#0f172a" />
          <rect x="58" y="9" width="3" height="2" fill="#22c55e" />
          <rect x="61" y="9" width="3" height="2" fill="#ef4444" />

          <!-- Layar Mini Terminal: ">= 4K" -->
          <rect x="57" y="16" width="8" height="6" fill="#042f2e" />
          <rect x="58" y="17" width="6" height="4" fill="#0f766e" />
          <rect x="59" y="18" width="4" height="2" fill="#2dd4bf" />

          <!-- Bantalan Sensor Pemindai Kartu RFID (Tap Pad) -->
          <rect x="57" y="25" width="8" height="5" fill="#0284c7" />
          <rect x="58" y="26" width="6" height="3" fill="#38bdf8" />

          <!-- Kartu Metro Penumpang (Melayang Siap Tap) -->
          <rect x="48" y="20" width="12" height="8" fill="#1d4ed8" rx="1" />
          <rect x="49" y="21" width="10" height="6" fill="#3b82f6" />
          <rect x="50" y="23" width="3" height="2" fill="#f59e0b" /> <!-- Chip Emas -->
          <rect x="55" y="22" width="3" height="1" fill="#93c5fd" />

          <!-- Gelombang Sinyal RFID (NFC Radiance Pixel) -->
          <rect x="46" y="22" width="1" height="2" fill="#38bdf8" />
          <rect x="45" y="21" width="1" height="4" fill="#7dd3fc" />

          <!-- Tanda Panah Arah Jalur Masuk di Lantai -->
          <rect x="38" y="46" width="4" height="2" fill="#0f766e" />
          <rect x="37" y="48" width="6" height="2" fill="#14b8a6" />
          <rect x="39" y="50" width="2" height="4" fill="#0f766e" />

          <!-- Teks Badge Pojok: Rp4.000 Threshold -->
          <rect x="4" y="4" width="28" height="7" fill="#0f172a" rx="2" />
          <rect x="5" y="5" width="26" height="5" fill="#1e293b" />
          <text x="7" y="9" font-family="monospace" font-size="4" font-weight="bold" fill="#38bdf8">SYARAT &gt;= 4.000</text>
        </svg>
      `.trim();

    case 'm02':
      // KASUS 2: Sistem Alarm Suhu Server (Rak Server, Sirine Darurat, Lampu Indikator Termal & Pendingin)
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: block; border-radius: 8px; background: #1c1917; border: 1.5px solid #292524;" aria-label="Ilustrasi Ruang Server dan Sirine Suhu">
          <!-- Latar Ruang Server dengan Kisi Ventilasi & Lantai Raised Floor -->
          <rect x="0" y="0" width="80" height="44" fill="#0f172a" />
          <rect x="0" y="44" width="80" height="16" fill="#1e293b" />
          <line x1="0" y1="44" x2="80" y2="44" stroke="#334155" stroke-width="1" />
          <line x1="26" y1="44" x2="20" y2="60" stroke="#334155" stroke-width="1" />
          <line x1="54" y1="44" x2="60" y2="60" stroke="#334155" stroke-width="1" />

          <!-- Rak Kabinet Server Utama (19-Inch Rack) -->
          <rect x="22" y="14" width="36" height="34" fill="#020617" />
          <rect x="24" y="15" width="32" height="32" fill="#1e293b" />

          <!-- Server Blade 1 (Atas) -->
          <rect x="26" y="17" width="28" height="6" fill="#0f172a" />
          <rect x="28" y="19" width="3" height="2" fill="#22c55e" /> <!-- LED Power -->
          <rect x="32" y="19" width="2" height="2" fill="#38bdf8" /> <!-- LED Network -->
          <rect x="36" y="18" width="16" height="4" fill="#1e293b" /> <!-- Grill Ventilasi -->
          <line x1="38" y1="19" x2="50" y2="19" stroke="#334155" stroke-width="1" />
          <line x1="38" y1="21" x2="50" y2="21" stroke="#334155" stroke-width="1" />

          <!-- Server Blade 2 (Tengah - Modul Sensor Termal) -->
          <rect x="26" y="25" width="28" height="8" fill="#0f172a" />
          <!-- Tampilan Digital Suhu Mini -->
          <rect x="28" y="27" width="12" height="4" fill="#450a0a" />
          <text x="29" y="30.5" font-family="monospace" font-size="3.5" font-weight="bold" fill="#ef4444">&gt; 30°C</text>
          <rect x="42" y="27" width="2" height="2" fill="#f59e0b" />
          <rect x="45" y="27" width="2" height="2" fill="#ef4444" />
          <rect x="49" y="26" width="4" height="6" fill="#1e293b" /> <!-- Kipas Mini -->

          <!-- Server Blade 3 (Bawah) -->
          <rect x="26" y="35" width="28" height="6" fill="#0f172a" />
          <rect x="28" y="37" width="3" height="2" fill="#22c55e" />
          <rect x="33" y="37" width="2" height="2" fill="#22c55e" />
          <rect x="37" y="36" width="15" height="4" fill="#1e293b" />

          <!-- Sirine Bahaya Darurat di Puncak Rak (Rotary Emergency Beacon) -->
          <rect x="36" y="10" width="8" height="4" fill="#334155" />
          <rect x="37" y="5" width="6" height="6" fill="#b91c1c" rx="1" />
          <rect x="38" y="6" width="4" height="4" fill="#ef4444" />
          <rect x="39" y="7" width="2" height="2" fill="#fef08a" /> <!-- Pijar Cahaya Tengah -->

          <!-- Pancaran Kilat Sirine (Warning Radiation Beams) -->
          <polygon points="34,6 26,3 28,8" fill="rgba(239, 68, 68, 0.45)" />
          <polygon points="46,6 54,3 52,8" fill="rgba(239, 68, 68, 0.45)" />
          <polygon points="40,3 40,0 42,0" fill="rgba(254, 240, 138, 0.7)" />

          <!-- Termometer Rak Rak Gantung Kiri -->
          <rect x="8" y="16" width="6" height="24" fill="#1e293b" rx="2" />
          <rect x="10" y="18" width="2" height="16" fill="#ffffff" />
          <rect x="10" y="24" width="2" height="10" fill="#dc2626" /> <!-- Air Raksa Panas -->
          <circle cx="11" cy="36" r="2" fill="#dc2626" />

          <!-- Badge Status Peringatan -->
          <rect x="52" y="4" width="24" height="7" fill="#450a0a" rx="2" />
          <rect x="53" y="5" width="22" height="5" fill="#7f1d1d" />
          <text x="55" y="9" font-family="monospace" font-size="3.5" font-weight="bold" fill="#fca5a5">AMBANG &gt; 30°C</text>
        </svg>
      `.trim();

    case 'm03':
      // KASUS 3: Kasir Kantin Cerdas (Mesin Kasir POS Digital, Struk Kertas Diskon, Voucher Kupon & Barcode Scanner)
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: block; border-radius: 8px; background: #1c1917; border: 1.5px solid #292524;" aria-label="Ilustrasi Mesin Kasir Digital dan Kupon Diskon">
          <!-- Meja Kasir Kantin Kayu Jati Retro -->
          <rect x="0" y="0" width="80" height="38" fill="#1e293b" />
          <rect x="0" y="38" width="80" height="22" fill="#78350f" />
          <rect x="0" y="38" width="80" height="2" fill="#92400e" />
          <line x1="0" y1="46" x2="80" y2="46" stroke="#451a03" stroke-width="1" />

          <!-- Terminal Mesin Kasir Digital POS (Point of Sale) -->
          <!-- Alas Kasir (Cash Drawer) -->
          <rect x="20" y="30" width="40" height="12" fill="#334155" />
          <rect x="22" y="32" width="36" height="8" fill="#475569" />
          <rect x="38" y="35" width="4" height="2" fill="#0f172a" /> <!-- Lubang Kunci Laci -->

          <!-- Layar Monitor Kasir POS (Menghadap Kasir/Murid) -->
          <rect x="36" y="22" width="8" height="8" fill="#1e293b" /> <!-- Leher Dudukan -->
          <rect x="26" y="8" width="28" height="16" fill="#0f172a" rx="1" />
          <rect x="28" y="10" width="24" height="12" fill="#042f2e" /> <!-- Layar Hijau CRT -->
          <text x="30" y="15" font-family="monospace" font-size="3" font-weight="bold" fill="#34d399">TOTAL BELANJA</text>
          <text x="30" y="19" font-family="monospace" font-size="3.5" font-weight="bold" fill="#fef08a">&gt;= Rp25.000</text>

          <!-- Mesin Cetak Struk Mini (Thermal Printer di Sisi Kanan) -->
          <rect x="56" y="24" width="14" height="10" fill="#1e293b" />
          <rect x="58" y="22" width="10" height="2" fill="#0f172a" />
          <!-- Kertas Struk Keluar Melambai -->
          <polygon points="59,16 67,16 66,22 60,22" fill="#f8fafc" />
          <line x1="61" y1="18" x2="65" y2="18" stroke="#64748b" stroke-width="0.8" />
          <line x1="61" y1="20" x2="64" y2="20" stroke="#64748b" stroke-width="0.8" />

          <!-- Voucher Kupon Diskon Emas Rp5.000 (Melayang di Kiri) -->
          <rect x="6" y="18" width="18" height="10" fill="#b45309" rx="1" />
          <rect x="7" y="19" width="16" height="8" fill="#f59e0b" />
          <rect x="8" y="20" width="14" height="6" fill="#fef08a" />
          <text x="9" y="24" font-family="monospace" font-size="3.5" font-weight="bold" fill="#b45309">DISKON</text>
          <text x="9.5" y="27" font-family="monospace" font-size="3" font-weight="bold" fill="#78350f">-Rp5.000</text>
          <!-- Lingkaran Potongan Tiket di Tepi Kupon -->
          <circle cx="6" cy="23" r="1.5" fill="#1e293b" />
          <circle cx="24" cy="23" r="1.5" fill="#1e293b" />

          <!-- Pemindai Barcode (Handheld Scanner di Meja) -->
          <polygon points="12,42 16,38 18,40 14,44" fill="#0f172a" />
          <line x1="16" y1="38" x2="22" y2="34" stroke="#ef4444" stroke-dasharray="1 1" stroke-width="0.8" /> <!-- Laser Merah -->

          <!-- Badge Syarat Aturan -->
          <rect x="4" y="4" width="22" height="7" fill="#064e3b" rx="2" />
          <rect x="5" y="5" width="20" height="5" fill="#065f46" />
          <text x="7" y="9" font-family="monospace" font-size="3.5" font-weight="bold" fill="#6ee7b7">IF &gt;= 25.000</text>
        </svg>
      `.trim();

    case 'm04':
      // KASUS 4: Router Jaringan & Kuota Internet (Router Wi-Fi Ganda, Gelombang Sinyal 3 Level & Port LAN)
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: block; border-radius: 8px; background: #1c1917; border: 1.5px solid #292524;" aria-label="Ilustrasi Router Wi-Fi dan Tingkat Kecepatan">
          <!-- Latar Meja Lab & Dinding Jaringan -->
          <rect x="0" y="0" width="80" height="40" fill="#0f172a" />
          <rect x="0" y="40" width="80" height="20" fill="#1e293b" />
          <line x1="0" y1="40" x2="80" y2="40" stroke="#334155" stroke-width="1" />

          <!-- Kotak Router Wi-Fi Utama -->
          <rect x="22" y="28" width="36" height="12" fill="#020617" rx="2" />
          <rect x="24" y="29" width="32" height="9" fill="#1e293b" />
          <!-- Lampu LED Indikator Router -->
          <rect x="27" y="32" width="2" height="2" fill="#22c55e" /> <!-- Power -->
          <rect x="31" y="32" width="2" height="2" fill="#38bdf8" /> <!-- Internet -->
          <rect x="35" y="32" width="2" height="2" fill="#22c55e" /> <!-- Wi-Fi -->
          <rect x="39" y="32" width="2" height="2" fill="#38bdf8" /> <!-- LAN 1 -->
          <rect x="43" y="32" width="2" height="2" fill="#eab308" /> <!-- LAN 2 -->

          <!-- Antena Router Kiri (Miring) & Kanan (Miring) -->
          <line x1="28" y1="28" x2="22" y2="12" stroke="#475569" stroke-width="2" />
          <line x1="52" y1="28" x2="58" y2="12" stroke="#475569" stroke-width="2" />
          <rect x="21" y="10" width="2" height="3" fill="#64748b" />
          <rect x="57" y="10" width="2" height="3" fill="#64748b" />

          <!-- Gelombang Sinyal Wi-Fi 3 Tingkat (Else-If Representation) -->
          <!-- Busur 1: Cepat (Hijau >= 50 Mbps) -->
          <path d="M 28 8 A 16 16 0 0 1 52 8" stroke="#22c55e" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <!-- Busur 2: Sedang (Kuning >= 20 Mbps) -->
          <path d="M 32 12 A 11 11 0 0 1 48 12" stroke="#eab308" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <!-- Busur 3: Lambat (Merah < 20 Mbps) -->
          <path d="M 36 16 A 6 6 0 0 1 44 16" stroke="#ef4444" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <circle cx="40" cy="20" r="1.5" fill="#f8fafc" />

          <!-- Kabel UTP LAN Masuk ke Router -->
          <path d="M 12 48 Q 20 44 26 39" stroke="#0284c7" stroke-width="2" fill="none" />
          <path d="M 68 48 Q 60 44 54 39" stroke="#0f766e" stroke-width="2" fill="none" />

          <!-- Badge Klasifikasi Bertingkat -->
          <rect x="4" y="4" width="24" height="7" fill="#1e1b4b" rx="2" />
          <rect x="5" y="5" width="22" height="5" fill="#312e81" />
          <text x="6.5" y="9" font-family="monospace" font-size="3.2" font-weight="bold" fill="#a5b4fc">ELSE-IF 3 JALUR</text>
        </svg>
      `.trim();

    case 'm05':
    default:
      // KASUS 5: Mesin Minuman Otomatis (Vending Machine Retro, 3 Kaleng Minuman, Tombol Pilihan 1-2-3 & Chute)
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: block; border-radius: 8px; background: #1c1917; border: 1.5px solid #292524;" aria-label="Ilustrasi Mesin Minuman Otomatis">
          <!-- Latar Selasar Sekolah & Ubin Lantai -->
          <rect x="0" y="0" width="80" height="46" fill="#1c1917" />
          <rect x="0" y="46" width="80" height="14" fill="#292524" />
          <line x1="0" y1="46" x2="80" y2="46" stroke="#44403c" stroke-width="1" />

          <!-- Lemari Kabinet Mesin Penjual Minuman (Vending Machine) -->
          <rect x="22" y="6" width="36" height="46" fill="#042f2e" rx="2" />
          <rect x="24" y="8" width="32" height="42" fill="#0f766e" />
          <!-- Kanopi Atas Mesin -->
          <rect x="24" y="8" width="32" height="5" fill="#115e59" />
          <text x="26" y="12" font-family="monospace" font-size="3.5" font-weight="bold" fill="#fef08a">MINUMAN SEGAR</text>

          <!-- Jendela Kaca Display Minuman (3 Rak) -->
          <rect x="26" y="15" width="18" height="20" fill="#022c22" rx="1" />
          <rect x="27" y="16" width="16" height="18" fill="#134e4a" />

          <!-- Kaleng 1: Kopi (Cokelat) [Tombol 1] -->
          <rect x="29" y="18" width="3" height="5" fill="#78350f" rx="0.5" />
          <rect x="29" y="20" width="3" height="1" fill="#fef08a" />
          <!-- Kaleng 2: Teh (Hijau) [Tombol 2] -->
          <rect x="34" y="18" width="3" height="5" fill="#15803d" rx="0.5" />
          <rect x="34" y="20" width="3" height="1" fill="#86efac" />
          <!-- Kaleng 3: Susu (Putih/Biru) [Tombol 3] -->
          <rect x="39" y="18" width="3" height="5" fill="#f8fafc" rx="0.5" />
          <rect x="39" y="20" width="3" height="1" fill="#38bdf8" />

          <!-- Rak Penyangga Kaleng Kaca -->
          <line x1="27" y1="24" x2="43" y2="24" stroke="#042f2e" stroke-width="1" />
          <!-- Baris Kaleng Cadangan di Bawah -->
          <rect x="29" y="26" width="3" height="5" fill="#78350f" />
          <rect x="34" y="26" width="3" height="5" fill="#15803d" />
          <rect x="39" y="26" width="3" height="5" fill="#f8fafc" />
          <line x1="27" y1="32" x2="43" y2="32" stroke="#042f2e" stroke-width="1" />

          <!-- Panel Kontrol Keypad (Sisi Kanan Mesin) -->
          <rect x="46" y="15" width="8" height="20" fill="#042f2e" />
          <!-- Tampilan Angka LED -->
          <rect x="47" y="17" width="6" height="4" fill="#000000" />
          <text x="49" y="20" font-family="monospace" font-size="3.5" font-weight="bold" fill="#38bdf8">1-3</text>
          <!-- Tombol Pilihan [1] [2] [3] -->
          <rect x="48" y="23" width="2" height="2" fill="#f59e0b" />
          <rect x="51" y="23" width="2" height="2" fill="#22c55e" />
          <rect x="48" y="26" width="2" height="2" fill="#38bdf8" />
          <rect x="51" y="26" width="2" height="2" fill="#ef4444" /> <!-- Default/Cancel -->
          <!-- Slot Koin / Uang Kertas -->
          <rect x="48" y="30" width="4" height="1" fill="#64748b" />

          <!-- Pintu Pengeluaran Minuman Bawah (Dispense Chute Flap) -->
          <rect x="28" y="38" width="16" height="8" fill="#022c22" />
          <rect x="30" y="40" width="12" height="4" fill="#334155" />
          <!-- Kaleng Siap Diambil -->
          <rect x="34" y="41" width="4" height="2" fill="#f59e0b" />

          <!-- Badge Switch-Case -->
          <rect x="4" y="4" width="20" height="7" fill="#042f2e" rx="2" />
          <rect x="5" y="5" width="18" height="5" fill="#0f766e" />
          <text x="6.5" y="9" font-family="monospace" font-size="3.5" font-weight="bold" fill="#5eead4">SWITCH-CASE</text>
        </svg>
      `.trim();
  }
}
