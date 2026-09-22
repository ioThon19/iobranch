// src/logic/modules.data.ts - Bank Data Kasus Pembelajaran Kontekstual (SSOT: PRD.md & SDD.md)
import { CaseModule } from '../types/module.types';

export const CASE_MODULES: CaseModule[] = [
  {
    id: 'm01',
    title: 'Gerbang Tiket Stasiun MRT',
    cycleRequired: 1,
    concept: 'Operator Relasional & Evaluasi Boolean',
    storyPrompt: 'Kalian berada di depan gerbang stasiun MRT. Untuk dapat masuk ke peron, penumpang harus menempelkan kartu dengan saldo minimal Rp4.000. Ujilah apakah kartu tim dapat membuka gerbang.',
    inputVariable: 'saldo',
    inputLabel: 'Saldo Kartu (Rp)',
    defaultInput: 5000,
    minInput: 0,
    maxInput: 100000,
    targetComparison: {
      op: '>=',
      boundaryValue: 4000
    },
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
    storyPrompt: 'Sensor memantau suhu ruangan server komputer sekolah. Sirine darurat hanya berbunyi jika suhu melebihi 30°C. Jika suhu aman, sistem melanjutkan tugas pemantauan seperti biasa tanpa aksi tambahan.',
    inputVariable: 'suhu',
    inputLabel: 'Suhu Ruangan (°C)',
    defaultInput: 26,
    minInput: -10,
    maxInput: 100,
    targetComparison: {
      op: '>',
      boundaryValue: 30
    },
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
    storyPrompt: 'Kantin digital memberikan potongan kupon belanja Rp5.000 jika total belanja minimal Rp25.000. Jika belanja di bawah nominal tersebut, pelanggan membayar dengan tarif normal.',
    inputVariable: 'total_belanja',
    inputLabel: 'Total Belanja (Rp)',
    defaultInput: 18000,
    minInput: 0,
    maxInput: 500000,
    targetComparison: {
      op: '>=',
      boundaryValue: 25000
    },
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
    title: 'Klasifikasi Kecepatan Paket Data',
    cycleRequired: 2,
    concept: 'Percabangan Bertingkat (ELSE - IF)',
    storyPrompt: 'Menguji kualitas koneksi internet: Cepat jika kecepatan minimal 50 Mbps, Sedang jika minimal 20 Mbps, dan Lambat jika di bawah 20 Mbps.',
    inputVariable: 'kecepatan',
    inputLabel: 'Kecepatan Internet (Mbps)',
    defaultInput: 35,
    minInput: 0,
    maxInput: 1000,
    targetComparison: {
      op: '>=',
      boundaryValue: 50
    },
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
      level3: 'Ujilah nilai 55, 30, dan 10 untuk membuktikan alur masing-masing cabang.'
    }
  },
  {
    id: 'm05',
    title: 'Pemilih Menu Minuman Otomatis',
    cycleRequired: 2,
    concept: 'Percabangan Multi-Kategori (SWITCH - CASE)',
    storyPrompt: 'Mesin minuman otomatis di sekolah mengeluarkan minuman berdasarkan nomor tombol: 1 untuk Kopi, 2 untuk Teh, 3 untuk Susu, atau nomor lain jika menu tidak tersedia.',
    inputVariable: 'pilihan',
    inputLabel: 'Nomor Pilihan Minuman',
    defaultInput: 2,
    minInput: 1,
    maxInput: 10,
    targetComparison: {
      op: '==',
      boundaryValue: 1
    },
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
      level2: 'Switch-case langsung mencocokkan angka pilihan tim dengan menu (case) yang sesuai.',
      level3: 'Pilihan STANDAR (default) otomatis dipilih jika nomor menu yang dimasukkan tidak ada di daftar (misal angka 4 atau 9).'
    }
  }
];
