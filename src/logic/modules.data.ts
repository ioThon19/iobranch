// src/logic/modules.data.ts - Bank Data Kasus Pembelajaran Kontekstual (SSOT: PRD.md & SDD.md)
import { CaseModule } from '../types/module.types';

export const CASE_MODULES: CaseModule[] = [
  {
    id: 'm01',
    title: 'Gerbang Tiket Stasiun MRT',
    cycleRequired: 1,
    concept: 'Operator Relasional & Evaluasi Boolean',
    weightPoints: 30,
    storyPrompt: 'Pagi ini di Stasiun MRT Kota Harmoni, antrean panjang penumpang menumpuk di depan Gerbang Otomatis 03. Palang gerbang berulang kali menolak beberapa penumpang meskipun mereka sudah menempelkan kartu tiket di sensor RFID.\n\nPenyelidikan awal mengungkap bahwa sensor gerbang diprogram dengan aturan evaluasi boolean: palang gerbang HANYA akan berayun terbuka JIKA saldo kartu penumpang memenuhi syarat minimal tarif Rp4.000 (saldo >= 4000). Jika saldo di bawah nominal itu, palang tetap terkunci rapat dan layar menampilkan pesan isi ulang.\n\nTugas Penyelidikanmu:\nBuktikan mengapa kartu dengan saldo Rp2.500 tertahan di luar, dan temukan berapa nilai saldo yang tepat agar palang pintu terbuka meloloskan penumpang ke peron kereta!',
    inputVariable: 'saldo',
    inputLabel: 'Saldo Kartu (Rp)',
    defaultInput: 5000,
    minInput: 0,
    maxInput: 100000,
    targetComparison: {
      op: '>=',
      boundaryValue: 4000
    },
    testPresets: [
      {
        label: 'Coba Rp5.000',
        value: 5000,
        targetBranch: 'IF',
        badge: 'Jalur IF (Buka)',
        explanation: 'Saldo Rp5.000 >= Rp4.000 (Kondisi TRUE: Pintu Terbuka)'
      },
      {
        label: 'Coba Rp2.500',
        value: 2500,
        targetBranch: 'ELSE',
        badge: 'Jalur ELSE (Tolak)',
        explanation: 'Saldo Rp2.500 < Rp4.000 (Kondisi FALSE: Saldo Kurang)'
      },
      {
        label: 'Coba Tepat Rp4.000',
        value: 4000,
        targetBranch: 'IF',
        badge: 'Jalur IF (Ambang)',
        explanation: 'Saldo Rp4.000 >= Rp4.000 (Kondisi TRUE: Pas di Ambang Batas)'
      }
    ],
    lines: [
      {
        lineNumber: 1,
        pseudoText: 'saldo = [INPUT]',
        cText: 'int saldo = [INPUT];',
        branchType: 'INIT'
      },
      {
        lineNumber: 2,
        pseudoText: 'JIKA (saldo >= 4000) MAKA',
        cText: 'if (saldo >= 4000) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 3,
        pseudoText: '  TAMPILKAN("Pintu Masuk Terbuka")',
        cText: '  printf("Pintu Masuk Terbuka\\n");',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 4,
        pseudoText: 'LAINNYA',
        cText: '} else {',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 5,
        pseudoText: '  TAMPILKAN("Saldo Kurang, Isi Ulang Dahulu")',
        cText: '  printf("Saldo Kurang, Isi Ulang Dahulu\\n");',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 6,
        pseudoText: 'SELESAI JIKA',
        cText: '}',
        branchType: 'OUTPUT'
      }
    ],
    hints: {
      level1: 'Periksa nilai saldo kartu yang dimasukkan saat ini.',
      level2: 'Operator >= memeriksa apakah saldo bernilai lebih besar atau sama dengan Rp4.000.',
      level3: 'Jika saldo kurang dari 4000, kondisi bernilai FALSE dan program mengeksekusi blok LAINNYA.'
    }
  },
  {
    id: 'm02',
    title: 'Sistem Alarm Suhu Server',
    cycleRequired: 1,
    concept: 'Percabangan Tunggal (IF)',
    weightPoints: 30,
    storyPrompt: 'Ruang Server Utama Komputer Sekolah Kota Harmoni menyimpan seluruh data ujian dan arsip penting. Saat ini, salah satu pendingin ruangan cadangan mengalami penurunan daya, menyebabkan suhu di dalam rak server merangkak naik perlahan.\n\nSistem pengaman otomatis diprogram dengan percabangan tunggal (IF): Sirine darurat peringatan HANYA akan menyala kencang JIKA sensor termal mendeteksi suhu melampaui ambang batas 30°C (suhu > 30). Jika suhu masih berada pada level aman (<= 30°C), sistem tetap hening dan melanjutkan pemantauan rutin tanpa aksi tambahan.\n\nTugas Penyelidikanmu:\nApakah suhu tepat 30°C akan membunyikan sirine darurat? Bagaimana jika suhu melonjak ke 36°C? Ujilah kedua kondisi batas ini untuk memastikan sistem proteksi server bekerja dengan akurat!',
    inputVariable: 'suhu',
    inputLabel: 'Suhu Ruangan (°C)',
    defaultInput: 26,
    minInput: -10,
    maxInput: 100,
    targetComparison: {
      op: '>',
      boundaryValue: 30
    },
    testPresets: [
      {
        label: 'Coba 36°C',
        value: 36,
        targetBranch: 'IF',
        badge: 'Jalur IF (Bahaya)',
        explanation: 'Suhu 36°C > 30°C (Kondisi TRUE: Sirine Bahaya Menyala)'
      },
      {
        label: 'Coba 26°C',
        value: 26,
        targetBranch: 'NORMAL',
        badge: 'Jalur Normal (Aman)',
        explanation: 'Suhu 26°C <= 30°C (Kondisi FALSE: Sistem Aman & Senyap)'
      },
      {
        label: 'Coba Titik Batas 30°C',
        value: 30,
        targetBranch: 'NORMAL',
        badge: 'Jalur Normal (Batas 30)',
        explanation: 'Suhu 30°C TIDAK > 30°C (Kondisi FALSE: Belum Melebihi Batas)'
      }
    ],
    lines: [
      {
        lineNumber: 1,
        pseudoText: 'suhu = [INPUT]',
        cText: 'int suhu = [INPUT];',
        branchType: 'INIT'
      },
      {
        lineNumber: 2,
        pseudoText: 'JIKA (suhu > 30) MAKA',
        cText: 'if (suhu > 30) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 3,
        pseudoText: '  TAMPILKAN("Peringatan: Sirine Bahaya Menyala!")',
        cText: '  printf("Peringatan: Sirine Bahaya Menyala!\\n");',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 4,
        pseudoText: 'SELESAI JIKA',
        cText: '}',
        branchType: 'OUTPUT'
      },
      {
        lineNumber: 5,
        pseudoText: 'TAMPILKAN("Status Pemantauan Selesai")',
        cText: 'printf("Status Pemantauan Selesai\\n");',
        branchType: 'OUTPUT'
      }
    ],
    hints: {
      level1: 'Amati angka suhu yang terbaca oleh sensor.',
      level2: 'Perhatikan operator >: angka 30 belum membunyikan alarm karena syaratnya harus lebih dari 30 (misal 31 ke atas).',
      level3: 'Pada percabangan tunggal, jika kondisi bernilai FALSE (salah), baris di dalam IF dilewati dan langsung lanjut ke baris berikutnya.'
    }
  },
  {
    id: 'm03',
    title: 'Kasir Kantin Cerdas (Kupon Diskon)',
    cycleRequired: 1,
    concept: 'Percabangan Ganda (IF - ELSE)',
    weightPoints: 40,
    storyPrompt: 'Kantin Digital Cerdas Kota Harmoni baru saja meluncurkan fitur promo kupon potongan belanja Rp5.000. Namun, banyak murid bingung dan menduga mesin kasir sedang eror karena beberapa dari mereka tidak mendapatkan potongan harga saat membayar makanan.\n\nSistem kasir digital bekerja berdasarkan aturan percabangan ganda (IF - ELSE): Diskon kupon Rp5.000 HANYA diberikan JIKA total belanjaan murid mencapai minimal Rp25.000 (total_belanja >= 25000). Jika total belanja di bawah nominal tersebut, mesin kasir otomatis mengeksekusi cabang LAINNYA dengan menagih tarif normal tanpa potongan.\n\nTugas Penyelidikanmu:\nBuktikan mengapa belanja Rp18.000 tidak memicu diskon kupon, dan buktikan berapa total belanjaan yang harus dipenuhi agar kupon potongan belanja Rp5.000 berhasil terpotong di struk kasir!',
    inputVariable: 'total_belanja',
    inputLabel: 'Total Belanja (Rp)',
    defaultInput: 18000,
    minInput: 0,
    maxInput: 500000,
    targetComparison: {
      op: '>=',
      boundaryValue: 25000
    },
    testPresets: [
      {
        label: 'Coba Rp30.000',
        value: 30000,
        targetBranch: 'IF',
        badge: 'Jalur IF (Diskon)',
        explanation: 'Belanja Rp30.000 >= Rp25.000 (Kondisi TRUE: Diskon Rp5.000 Terpakai)'
      },
      {
        label: 'Coba Rp18.000',
        value: 18000,
        targetBranch: 'ELSE',
        badge: 'Jalur ELSE (Normal)',
        explanation: 'Belanja Rp18.000 < Rp25.000 (Kondisi FALSE: Tarif Normal Tanpa Diskon)'
      },
      {
        label: 'Coba Tepat Rp25.000',
        value: 25000,
        targetBranch: 'IF',
        badge: 'Jalur IF (Ambang)',
        explanation: 'Belanja Rp25.000 >= Rp25.000 (Kondisi TRUE: Memenuhi Syarat Minimal)'
      }
    ],
    lines: [
      {
        lineNumber: 1,
        pseudoText: 'total_belanja = [INPUT]',
        cText: 'int total_belanja = [INPUT];',
        branchType: 'INIT'
      },
      {
        lineNumber: 2,
        pseudoText: 'JIKA (total_belanja >= 25000) MAKA',
        cText: 'if (total_belanja >= 25000) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 3,
        pseudoText: '  TAMPILKAN("Selamat! Diskon Kupon Rp5.000 Digunakan")',
        cText: '  printf("Selamat! Diskon Kupon Rp5.000 Digunakan\\n");',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 4,
        pseudoText: 'LAINNYA',
        cText: '} else {',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 5,
        pseudoText: '  TAMPILKAN("Total Bayar Normal Tanpa Diskon")',
        cText: '  printf("Total Bayar Normal Tanpa Diskon\\n");',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 6,
        pseudoText: 'SELESAI JIKA',
        cText: '}',
        branchType: 'OUTPUT'
      }
    ],
    hints: {
      level1: 'Lihat jumlah total belanja yang tercatat pada kasir.',
      level2: 'Kupon aktif jika belanja minimal Rp25.000 (menggunakan operator perbandingan >=).',
      level3: 'Untuk meraih 2 Bintang, ujilah kedua cabang: belanja yang memenuhi syarat diskon dan belanja yang membayar tarif normal.'
    }
  },
  {
    id: 'm04',
    title: 'Router Wi-Fi Laboratorium (Klasifikasi Kecepatan)',
    cycleRequired: 2,
    concept: 'Percabangan Bertingkat (ELSE - IF)',
    weightPoints: 50,
    storyPrompt: 'Saat pelaksanaan asesmen pembelajaran digital di Laboratorium Komputer Sekolah Kota Harmoni, beberapa murid mengeluhkan tampilan soal yang lambat dimuat, sementara murid di baris lain melaporkan koneksi berjalan lancar. Router cerdas laboratorium ternyata sedang mengalami kendala dalam mengklasifikasikan pembagian prioritas lebar pita (bandwidth) antrean data.\n\nRouter jaringan diprogram menggunakan rantai percabangan bertingkat ELSE - IF: Kualitas koneksi diklasifikasikan menjadi Koneksi Cepat HANYA JIKA kecepatan terdeteksi minimal 50 Mbps (kecepatan >= 50). JIKA TIDAK dan kecepatan minimal 20 Mbps (kecepatan >= 20), sistem menetapkannya sebagai Koneksi Sedang. Untuk kecepatan di bawah 20 Mbps, router otomatis mengeksekusi cabang terakhir sebagai Koneksi Lambat.\n\nTugas Penyelidikanmu:\nBuktikan mengapa kecepatan 35 Mbps dialokasikan ke jalur Koneksi Sedang, dan selidiki berapa ambang batas kecepatan minimal yang harus dipenuhi agar perangkat murid memperoleh prioritas tertinggi Koneksi Cepat!',
    inputVariable: 'kecepatan',
    inputLabel: 'Kecepatan Internet (Mbps)',
    defaultInput: 35,
    minInput: 0,
    maxInput: 1000,
    targetComparison: {
      op: '>=',
      boundaryValue: 50
    },
    testPresets: [
      {
        label: 'Coba 65 Mbps',
        value: 65,
        targetBranch: 'IF',
        badge: 'Jalur IF (Cepat)',
        explanation: 'Kecepatan 65 >= 50 Mbps (Cabang IF: Koneksi Cepat)'
      },
      {
        label: 'Coba 35 Mbps',
        value: 35,
        targetBranch: 'ELSE_IF',
        badge: 'Jalur ELSE IF (Sedang)',
        explanation: 'Kecepatan 35 >= 20 Mbps (Cabang ELSE IF: Koneksi Sedang)'
      },
      {
        label: 'Coba 12 Mbps',
        value: 12,
        targetBranch: 'ELSE',
        badge: 'Jalur ELSE (Lambat)',
        explanation: 'Kecepatan 12 < 20 Mbps (Cabang ELSE: Koneksi Lambat)'
      }
    ],
    lines: [
      {
        lineNumber: 1,
        pseudoText: 'kecepatan = [INPUT]',
        cText: 'int kecepatan = [INPUT];',
        branchType: 'INIT'
      },
      {
        lineNumber: 2,
        pseudoText: 'JIKA (kecepatan >= 50) MAKA',
        cText: 'if (kecepatan >= 50) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 3,
        pseudoText: '  TAMPILKAN("Koneksi Cepat")',
        cText: '  printf("Koneksi Cepat\\n");',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 4,
        pseudoText: 'LAINNYA JIKA (kecepatan >= 20) MAKA',
        cText: '} else if (kecepatan >= 20) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 5,
        pseudoText: '  TAMPILKAN("Koneksi Sedang")',
        cText: '  printf("Koneksi Sedang\\n");',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 6,
        pseudoText: 'LAINNYA',
        cText: '} else {',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 7,
        pseudoText: '  TAMPILKAN("Koneksi Lambat")',
        cText: '  printf("Koneksi Lambat\\n");',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 8,
        pseudoText: 'SELESAI JIKA',
        cText: '}',
        branchType: 'OUTPUT'
      }
    ],
    hints: {
      level1: 'Amati kecepatan internet yang dimasukkan.',
      level2: 'Evaluasi kondisi bertingkat berjalan dari atas ke bawah. Begitu satu kondisi terpenuhi, kondisi berikutnya tidak diperiksa lagi.',
      level3: 'Ujilah nilai 65, 35, dan 12 untuk membuktikan alur masing-masing cabang.'
    }
  },
  {
    id: 'm05',
    title: 'Mesin Minuman Otomatis (Smart Vending Machine)',
    cycleRequired: 2,
    concept: 'Percabangan Multi-Kategori (SWITCH - CASE)',
    weightPoints: 50,
    storyPrompt: 'Mesin penjual minuman pintar (Smart Vending Machine) baru saja diresmikan di selasar lobi Sekolah Kota Harmoni. Namun pada jam istirahat pertama, beberapa murid mengira mesin mengalami kerusakan sistem karena layar berkedip dan menolak mengeluarkan minuman saat mereka menekan tombol angka yang tidak ada di etalase.\n\nPengendali mesin diprogram menggunakan struktur multi-kategori SWITCH - CASE: Tombol angka 1 memilih Kopi Hangat, tombol angka 2 memilih Teh Manis, dan tombol angka 3 memilih Susu Segar. Setiap menu dipagari instruksi break; agar pilihan tidak tertimpa. JIKA murid menekan tombol angka selain 1, 2, atau 3 (misalnya tombol angka 9), sistem otomatis meluncur ke cabang pengaman STANDAR (default) untuk menampilkan peringatan menu tidak tersedia tanpa membuat sistem eror.\n\nTugas Penyelidikanmu:\nBuktikan menu apa yang tersaji saat murid menekan tombol 2, lalu selidiki bagaimana cabang STANDAR (default) menyelamatkan program dari kegagalan saat ada murid yang menekan tombol asing seperti nomor 9!',
    inputVariable: 'pilihan',
    inputLabel: 'Nomor Pilihan Minuman',
    defaultInput: 2,
    minInput: 1,
    maxInput: 10,
    targetComparison: {
      op: '==',
      boundaryValue: 1
    },
    testPresets: [
      {
        label: 'Menu 1: Kopi',
        value: 1,
        targetBranch: 'CASE_1',
        badge: 'Menu 1 (Kopi)',
        explanation: 'Pilihan 1 mengeluarkan Menu Kopi Hangat'
      },
      {
        label: 'Menu 2: Teh',
        value: 2,
        targetBranch: 'CASE_2',
        badge: 'Menu 2 (Teh)',
        explanation: 'Pilihan 2 mengeluarkan Menu Teh Manis'
      },
      {
        label: 'Menu 3: Susu',
        value: 3,
        targetBranch: 'CASE_3',
        badge: 'Menu 3 (Susu)',
        explanation: 'Pilihan 3 mengeluarkan Menu Susu Segar'
      },
      {
        label: 'Menu 9: Standar / Batal',
        value: 9,
        targetBranch: 'DEFAULT',
        badge: 'Standar (Default)',
        explanation: 'Pilihan 9 memicu blok Standar/Default (Menu Tidak Tersedia / Batal)'
      }
    ],
    lines: [
      {
        lineNumber: 1,
        pseudoText: 'pilihan = [INPUT]',
        cText: 'int pilihan = [INPUT];',
        branchType: 'INIT'
      },
      {
        lineNumber: 2,
        pseudoText: 'PILIH (pilihan)',
        cText: 'switch (pilihan) {',
        branchType: 'CONDITION'
      },
      {
        lineNumber: 3,
        pseudoText: '  KASUS 1: TAMPILKAN("Menu Kopi Hangat")',
        cText: '  case 1: printf("Menu Kopi Hangat\\n"); break;',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 4,
        pseudoText: '  KASUS 2: TAMPILKAN("Menu Teh Manis")',
        cText: '  case 2: printf("Menu Teh Manis\\n"); break;',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 5,
        pseudoText: '  KASUS 3: TAMPILKAN("Menu Susu Segar")',
        cText: '  case 3: printf("Menu Susu Segar\\n"); break;',
        branchType: 'BRANCH_IF'
      },
      {
        lineNumber: 6,
        pseudoText: '  STANDAR: TAMPILKAN("Pilihan Menu Tidak Tersedia")',
        cText: '  default: printf("Pilihan Menu Tidak Tersedia\\n"); break;',
        branchType: 'BRANCH_ELSE'
      },
      {
        lineNumber: 7,
        pseudoText: 'SELESAI PILIH',
        cText: '}',
        branchType: 'OUTPUT'
      }
    ],
    hints: {
      level1: 'Perhatikan nomor pilihan yang ditekan pada mesin minuman.',
      level2: 'Switch-case langsung mencocokkan angka pilihan kamu dengan menu (case) yang sesuai.',
      level3: 'Pilihan STANDAR (default) otomatis dipilih jika nomor menu yang dimasukkan tidak ada di daftar (misal angka 4 atau 9).'
    }
  }
];

export interface ModuleBranchDefinition {
  id: string;
  label: string;
}

export const MODULE_BRANCHES: Record<string, ModuleBranchDefinition[]> = {
  m01: [
    { id: 'IF', label: 'Cabang IF (>= 4000)' },
    { id: 'ELSE', label: 'Cabang ELSE (< 4000)' }
  ],
  m02: [
    { id: 'IF', label: 'Cabang IF (> 30°C / Bahaya)' },
    { id: 'NORMAL', label: 'Jalur Normal (<= 30°C / Aman)' }
  ],
  m03: [
    { id: 'IF', label: 'Cabang IF (>= 25.000 / Diskon)' },
    { id: 'ELSE', label: 'Cabang ELSE (< 25.000 / Normal)' }
  ],
  m04: [
    { id: 'IF', label: 'Cabang 1: Cepat (>= 50)' },
    { id: 'ELSE_IF', label: 'Cabang 2: Sedang (>= 20)' },
    { id: 'ELSE', label: 'Cabang 3: Lambat (< 20)' }
  ],
  m05: [
    { id: 'CASE_1', label: 'Kasus 1: Kopi' },
    { id: 'CASE_2', label: 'Kasus 2: Teh' },
    { id: 'CASE_3', label: 'Kasus 3: Susu' },
    { id: 'DEFAULT', label: 'Standar: Lainnya' }
  ]
};

