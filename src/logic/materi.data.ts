// src/logic/materi.data.ts - Bank Data Materi Pembelajaran Komprehensif SMA Fase E
// Memisahkan Kategori Prasyarat (Fondasi Algoritma) & Struktur Percabangan (Siklus 1 & Siklus 2)

export type MateriCategory = 'PRASYARAT' | 'PERCABANGAN';

export interface MateriSection {
  heading: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    codeC?: string;
    codePseudo?: string;
    description?: string;
  };
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface InteractiveCheck {
  question: string;
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface InteractiveSimulator {
  type: 'condition_tester';
  variableName: string;
  variableLabel: string;
  operator: '>=' | '>' | '<=' | '<' | '==' | '!=';
  threshold: number;
  defaultValue: number;
  unit: string;
  ifActionText: string;
  elseActionText: string;
  trueExplanation: string;
  falseExplanation: string;
}

export interface MateriTopic {
  id: string;
  category: MateriCategory;
  cycleRequired: 1 | 2; // 1 = Siklus 1 (Terbuka), 2 = Siklus 2 (Terkunci dengan Token Kelas)
  order: number;
  categoryLabel: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  summary: string;
  analogies?: string;
  sections: MateriSection[];
  diagramType?: 'flowchart_ifelse' | 'flowchart_single' | 'flowchart_symbols' | 'flowchart_nested';
  proTips: string;
  misconceptionWarning?: string;
  interactiveCheck?: InteractiveCheck;
  simulator?: InteractiveSimulator;
}

export const MATERI_BANK: MateriTopic[] = [
  // =================================================================
  // KATEGORI 1: FONDASI ALGORITMA (MATERI PRASYARAT)
  // =================================================================
  {
    id: 'pra-01',
    category: 'PRASYARAT',
    cycleRequired: 1,
    order: 1,
    categoryLabel: 'Materi Prasyarat',
    title: 'Konsep Algoritma & Notasi Naratif',
    subtitle: 'Menyusun Urutan Langkah Logis Tanpa Ambigu',
    badgeLabel: 'PRASYARAT 1',
    summary: 'Algoritma adalah serangkaian langkah logis yang tersusun secara teratur, pasti, dan terbatas untuk menyelesaikan suatu persoalan komputasi dari kondisi awal hingga mencapai hasil yang diinginkan.',
    analogies: 'Bayangkan algoritma seperti tutorial cara merakit tenda kemah atau panduan resep mie instan di balik bungkusnya: langkah 1 harus rebus air dulu, baru masukkan mie. Jika urutan langkah terbalik, hasilnya pasti gagal!',
    sections: [
      {
        heading: '5 Ciri Utama Algoritma (Standar Ilmu Komputer)',
        content: 'Dalam teori ilmu komputer, suatu instruksi baru diakui sebagai algoritma yang sah jika memenuhi 5 sifat penting:<br />' +
          '1. <strong>Finiteness (Keterhinggaan)</strong>: Algoritma wajib ada ujungnya (berhenti) setelah sejumlah langkah tertentu, tidak boleh berputar selamanya tanpa akhir (infinite loop).<br />' +
          '2. <strong>Definiteness (Kepastian)</strong>: Setiap baris instruksi harus bermakna jelas dan tunggal. Komputer tidak mengenal kata "secukupnya" atau "kira-kira".<br />' +
          '3. <strong>Input (Masukan)</strong>: Memiliki data awal (nol atau lebih) yang diberikan ke sistem untuk diproses (misal: saldo kartu atau nilai ujian).<br />' +
          '4. <strong>Output (Keluaran)</strong>: Menghasilkan minimal satu solusi hasil (misal: status pintu gerbang terbuka atau lencana kelulusan).<br />' +
          '5. <strong>Effectiveness (Efektivitas)</strong>: Setiap perintah harus cukup sederhana dan realistis sehingga mampu dikerjakan oleh mesin komputer.'
      },
      {
        heading: 'Notasi Naratif (Bahasa Alami Manusia)',
        content: 'Notasi naratif menyajikan langkah algoritma memakai bahasa sehari-hari yang terstruktur. Pendekatan ini sangat cocok saat kamu sedang merancang ide awal algoritma sebelum mulai mengetik kode pemrograman.',
        codeSnippet: {
          language: 'Contoh Naratif: Gerbang Otomatis Stasiun',
          code: `Langkah 1: Penumpang menempelkan kartu e-money pada sensor gerbang.
Langkah 2: Sistem komputer membaca jumlah saldo kartu saat ini.
Langkah 3: Komputer memeriksa: Apakah saldo minimal bernilai Rp4.000?
Langkah 4: Jika saldo mencukupi (>= Rp4.000), palang gerbang terbuka dan saldo dipotong.
Langkah 5: Jika saldo kurang (< Rp4.000), lampu merah menyala dan gerbang tetap terkunci.`
        }
      },
      {
        heading: 'Implementasi Logika: Pseudokode vs Bahasa C',
        content: 'Dari skenario naratif gerbang otomatis di atas, perhatikan bagaimana logika yang sama diterjemahkan ke dalam pseudokode dan Bahasa C:',
        codeSnippet: {
          language: 'Logika Gerbang Stasiun (2 Versi)',
          code: `// Lihat tab Bahasa C & Pseudokode`,
          codePseudo: `ALGORITMA GerbangStasiun
DEKLARASI:
    saldo: Integer

DESKRIPSI:
    BACA(saldo)
    JIKA (saldo >= 4000) MAKA
        TAMPILKAN("Gerbang Terbuka, Silakan Lewat")
        saldo <- saldo - 4000
    LAINNYA
        TAMPILKAN("Lampu Merah: Saldo Tidak Cukup")
    SELESAI JIKA
SELESAI`,
          codeC: `#include <stdio.h>

int main() {
    int saldo;
    scanf("%d", &saldo);

    if (saldo >= 4000) {
        printf("Gerbang Terbuka, Silakan Lewat\\n");
        saldo = saldo - 4000;
    } else {
        printf("Lampu Merah: Saldo Tidak Cukup\\n");
    }

    return 0;
}`,
          description: 'Perhatikan keselarasan: blok "JIKA ... MAKA" pada pseudokode berpadanan langsung dengan "if (...) { ... }" pada Bahasa C.'
        }
      }
    ],
    proTips: 'Komputer membaca instruksi persis seperti kita membaca buku: baris demi baris dari paling atas ke paling bawah. Pastikan tidak ada langkah penting yang terlewat!',
    misconceptionWarning: 'Komputer tidak memiliki firasat atau akal budi. Jika instruksi yang ditulis ambigu, komputer tidak akan menebak maksud pembuatnya melainkan langsung menghasilkan kesalahan (bug).',
    interactiveCheck: {
      question: 'Apakah instruksi "Aduk gula sampai manisnya pas secukupnya" memenuhi syarat Definiteness (Kepastian) pada algoritma komputer?',
      options: [
        {
          label: 'Ya, karena manusia paham maksud manis secukupnya.',
          isCorrect: false,
          explanation: 'Bagi komputer, kata "secukupnya" itu ambigu karena tidak ada takaran angka yang terukur!'
        },
        {
          label: 'Tidak, karena kata "secukupnya" ambigu dan tidak memiliki takaran eksak.',
          isCorrect: true,
          explanation: 'Tepat sekali! Komputer membutuhkan takaran eksak, misalnya "masukkan gula 10 gram dan aduk 15 detik".'
        }
      ]
    }
  },

  {
    id: 'pra-02',
    category: 'PRASYARAT',
    cycleRequired: 1,
    order: 2,
    categoryLabel: 'Materi Prasyarat',
    title: 'Diagram Alir (Flowchart) & Simbol Standar',
    subtitle: 'Memetakan Alur Logika dengan Simbol Geometris Standar',
    badgeLabel: 'PRASYARAT 2',
    summary: 'Diagram alir (Flowchart) adalah gambaran peta visual dari jalannya algoritma menggunakan bangun datar geometris standar internasional (ANSI/ISO). Setiap bentuk bangun datar memiliki tugas khusus yang tidak boleh tertukar.',
    analogies: 'Flowchart mirip seperti rambu petunjuk jalan raya di peta GPS: ada tanda mulai perjalanan, rambu persimpangan arah belok (percabangan), dan titik tujuan akhir.',
    sections: [
      {
        heading: 'Mengenal Fungsi Bentuk Geometris Flowchart',
        content: 'Berikut fungsi dari masing-masing bentuk simbol resmi yang digunakan dalam rekayasa perangkat lunak:',
        tableData: {
          headers: ['Simbol', 'Nama Bentuk', 'Fungsi Utama'],
          rows: [
            ['Kapsul / Oval', 'Terminator', 'Menandai titik MULAI (Start) atau SELESAI (End) dari program.'],
            ['Jajar Genjang', 'Input / Output', 'Operasi menerima data dari user (Input) atau menampilkan teks ke layar (Output).'],
            ['Persegi Panjang', 'Process', 'Melakukan perhitungan rumus matematika atau pengisian nilai variabel.'],
            ['Belah Ketupat', 'Decision', 'Pengecekan KONDISI (Percabangan). Selalu memiliki dua cabang: Ya (True) atau Tidak (False).'],
            ['Garis Panah', 'Flowline', 'Menunjukkan arah aliran langkah berikutnya (arah jalannya instruksi).']
          ]
        }
      },
      {
        heading: 'Aturan Khusus Simbol Belah Ketupat (Decision)',
        content: 'Simbol <strong>Belah Ketupat</strong> adalah jantung dari materi percabangan. Simbol ini hanya boleh memiliki <strong>satu anak panah masuk</strong>, dan <strong>tepat dua anak panah keluar</strong> yang diberi label tegas: <code>Ya (True)</code> dan <code>Tidak (False)</code>.'
      },
      {
        heading: 'Konversi Simbol Decision ke Kode Program',
        content: 'Setiap simbol belah ketupat di diagram alir diterjemahkan menjadi struktur seleksi kondisi:',
        codeSnippet: {
          language: 'Pemetaan Decision Flowchart (2 Versi)',
          code: `// Decision: suhu > 30?`,
          codePseudo: `JIKA (suhu > 30) MAKA
    TAMPILKAN("Kondisi Panas: Kipas ON")
LAINNYA
    TAMPILKAN("Kondisi Normal")
SELESAI JIKA`,
          codeC: `if (suhu > 30) {
    printf("Kondisi Panas: Kipas ON\\n");
} else {
    printf("Kondisi Normal\\n");
}`,
          description: 'Cabang "Ya" pada flowchart menjadi badan IF, sedangkan cabang "Tidak" menjadi badan ELSE.'
        }
      }
    ],
    diagramType: 'flowchart_symbols',
    proTips: 'Simbol belah ketupat adalah satu-satunya simbol flowchart yang memiliki dua anak panah keluar. Jangan pernah membuat simbol belah ketupat hanya dengan satu panah keluar!',
    misconceptionWarning: 'Sering tertukar antara Jajar Genjang (Input/Output) dan Persegi Panjang (Proses). Ingat: membaca input selalu jajar genjang, sedangkan menghitung nilai selalu persegi panjang.'
  },

  {
    id: 'pra-03',
    category: 'PRASYARAT',
    cycleRequired: 1,
    order: 3,
    categoryLabel: 'Materi Prasyarat',
    title: 'Pseudokode (Notasi Bebas Bahasa)',
    subtitle: 'Jembatan Pemikiran Logika ke Bahasa Pemrograman Formal',
    badgeLabel: 'PRASYARAT 3',
    summary: 'Pseudokode (kode semu) adalah cara menuliskan logika pemrograman menggunakan kata-kata sederhana yang mirip dengan kode program sungguhan, namun tanpa dibebani kerumitan tanda baca bahasa tertentu.',
    analogies: 'Pseudokode seperti coret-coretan naskah kasar sebelum naskah pidato diketik rapi. Kamu fokus pada jalan cerita logikanya, bukan pada aturan titik koma kompilator.',
    sections: [
      {
        heading: 'Mengapa Pseudokode Sangat Membantu Murid SMA?',
        content: 'Saat baru belajar koding, murid sering pusing memikirkan koma, titik dua, atau kurung kurawal <code>{}</code>. Dengan pseudokode, kamu bisa melatih daya nalar logika terlebih dahulu. Begitu logikanya sudah benar, mengubah ke Bahasa C, Python, atau Javascript akan terasa sangat mudah!'
      },
      {
        heading: 'Perbandingan 3 Bentuk Penulisan Algoritma',
        content: 'Perhatikan bagaimana satu kasus yang sama disajikan dalam tiga cara berbeda:',
        tableData: {
          headers: ['Naratif (Bahasa Manusia)', 'Pseudokode (Logika Terstruktur)', 'Bahasa Pemrograman C'],
          rows: [
            [
              'Jika nilai ujian murid mencapai minimal 75 maka murid dinyatakan lulus, jika tidak maka murid remidi.',
              'JIKA (nilai >= 75) MAKA\n    TAMPILKAN("LULUS")\nLAINNYA\n    TAMPILKAN("REMIDI")\nSELESAI JIKA',
              'if (nilai >= 75) {\n    printf("LULUS\\n");\n} else {\n    printf("REMIDI\\n");\n}'
            ]
          ]
        }
      },
      {
        heading: 'Contoh Praktik: Pengecekan Usia KTP',
        content: 'Berikut contoh lengkap struktur algoritma dalam 2 versi bahasa komputasi:',
        codeSnippet: {
          language: 'Studi Kasus: Kelayakan Pembuatan KTP',
          code: `// Cek syarat umur >= 17 tahun`,
          codePseudo: `ALGORITMA CekKTP
DEKLARASI:
    usia: Integer

DESKRIPSI:
    BACA(usia)
    JIKA (usia >= 17) MAKA
        TAMPILKAN("Wajib Mengurus KTP")
    LAINNYA
        TAMPILKAN("Belum Cukup Usia")
    SELESAI JIKA
SELESAI`,
          codeC: `#include <stdio.h>

int main() {
    int usia;
    printf("Masukkan usia: ");
    scanf("%d", &usia);

    if (usia >= 17) {
        printf("Wajib Mengurus KTP\\n");
    } else {
        printf("Belum Cukup Usia\\n");
    }

    return 0;
}`,
          description: 'Dalam pseudokode kita memakai kata kerja BACA dan TAMPILKAN, sedangkan di Bahasa C menggunakan fungsi pustaka scanf dan printf.'
        }
      }
    ],
    proTips: 'Gunakan spasi menjorok (indentasi) di dalam blok JIKA ... MAKA agar terlihat jelas baris mana saja yang menjadi milik cabang tersebut.',
    misconceptionWarning: 'Pseudokode dibuat untuk dibaca dan didiskusikan oleh manusia, sehingga tidak bisa langsung diklik "Run" oleh komputer tanpa diubah ke bahasa pemrograman nyata.'
  },

  {
    id: 'pra-04',
    category: 'PRASYARAT',
    cycleRequired: 1,
    order: 4,
    categoryLabel: 'Materi Prasyarat',
    title: 'Variabel, Tipe Data & Ekspresi',
    subtitle: 'Kotak Memori Penyimpan Data & Nilai Komputasi',
    badgeLabel: 'PRASYARAT 4',
    summary: 'Variabel adalah wadah penampung di memori komputer yang diberi nama untuk menyimpan data. Data di dalam variabel nilainya dapat berubah-ubah sepanjang program berjalan sesuai dengan tipe data yang ditentukan.',
    analogies: 'Bayangkan variabel seperti loker di sekolah yang diberi stiker nama. Loker bernama "saldo" khusus diisi lembaran uang (angka bulat), sedangkan loker bernama "nama_murid" khusus diisi kertas bertuliskan huruf.',
    sections: [
      {
        heading: '4 Tipe Data Dasar yang Paling Sering Digunakan',
        content: 'Berikut jenis tipe data dasar yang wajib dikuasai oleh murid:',
        tableData: {
          headers: ['Tipe Data', 'Pengertian Sederhana', 'Contoh Nilai Nyata', 'Penerapan di Game Ini'],
          rows: [
            ['Integer (int)', 'Bilangan bulat tanpa koma/pecahan', '5000, 10, 0, -3', 'Saldo kartu MRT, nomor meja, HP musuh'],
            ['Float / Real', 'Bilangan berkoma desimal', '36.5, 82.75, 3.14', 'Suhu ruangan server, nilai rata-rata ujian'],
            ['String / Teks', 'Kumpulan karakter huruf diapit kutip', '"LULUS", "Hero"', 'Nama murid, pesan notifikasi'],
            ['Boolean (bool)', 'Hanya dua status mutlak (Biner)', 'TRUE atau FALSE', 'Apakah pintu terbuka? (True/False)']
          ]
        }
      },
      {
        heading: 'Deklarasi Variabel & Penugasan Nilai (Assignment)',
        content: 'Menyimpan nilai ke dalam memori komputer dituliskan secara terstruktur dalam 2 versi:',
        codeSnippet: {
          language: 'Deklarasi Variabel & Perhitungan Ekspresi',
          code: `// Inisialisasi variabel dan operasi ekspresi matematika`,
          codePseudo: `DEKLARASI:
    saldoAwal: Integer
    biayaTiket: Integer
    sisaSaldo: Integer

DESKRIPSI:
    saldoAwal <- 10000
    biayaTiket <- 4000
    sisaSaldo <- saldoAwal - biayaTiket
    TAMPILKAN(sisaSaldo)`,
          codeC: `#include <stdio.h>

int main() {
    int saldoAwal = 10000;
    int biayaTiket = 4000;
    int sisaSaldo;

    sisaSaldo = saldoAwal - biayaTiket;
    printf("Sisa saldo: %d\\n", sisaSaldo);

    return 0;
}`,
          description: 'Simbol penugasan (assignment) di pseudokode sering menggunakan tanda panah kiri "<-", sedangkan di Bahasa C menggunakan tanda sama dengan tunggal "=".'
        }
      },
      {
        heading: 'Apa Itu Ekspresi?',
        content: 'Ekspresi adalah kombinasi antara nama variabel, angka, dan simbol operator yang dihitung komputer untuk menghasilkan nilai baru.<br />• Contoh ekspresi matematika: <code>sisa_saldo = saldo - 4000;</code><br />• Contoh ekspresi kondisi logika: <code>bisa_masuk = (saldo >= 4000);</code>'
      }
    ],
    proTips: 'Berikan nama variabel yang bermakna jelas (seperti "total_belanja"), hindari menamai variabel dengan satu huruf tidak jelas seperti "x" atau "y".',
    misconceptionWarning: 'Angka yang diapit tanda kutip seperti "5000" dianggap sebagai teks (String), bukan angka (Integer). Komputer tidak bisa membandingkan "5000" >= 4000 secara matematika jika tipenya teks!',
    interactiveCheck: {
      question: 'Manakah tipe data yang paling tepat untuk menyimpan data suhu badan murid 36.8°C?',
      options: [
        {
          label: 'Integer (Bilangan Bulat)',
          isCorrect: false,
          explanation: 'Salah, integer hanya menyimpan bilangan bulat tanpa pecahan desimal.'
        },
        {
          label: 'Float / Real (Bilangan Desimal)',
          isCorrect: true,
          explanation: 'Benar! Angka 36.8 memiliki pecahan koma sehingga wajib memakai Float/Real.'
        }
      ]
    }
  },

  {
    id: 'pra-05',
    category: 'PRASYARAT',
    cycleRequired: 1,
    order: 5,
    categoryLabel: 'Materi Prasyarat',
    title: 'Operator (Aritmatika, Relasional, & Logika)',
    subtitle: 'Simbol Penguji Kondisi & Perhitungan Algoritma',
    badgeLabel: 'PRASYARAT 5',
    summary: 'Operator adalah simbol khusus yang memerintahkan komputer untuk melakukan perhitungan angka atau pengujian perbandingan antara dua nilai. Hasil uji operator relasional SELALU berupa nilai kebenaran: TRUE atau FALSE.',
    analogies: 'Operator relasional seperti wasit di pertandingan olahraga: wasit hanya meniup peluit dengan dua keputusan pasti: SAH (True) atau PELANGGARAN (False). Tidak ada keputusan abu-abu!',
    sections: [
      {
        heading: 'Tabel Lengkap Operator Relasional (Pembanding)',
        content: 'Gunakan operator ini saat menyusun syarat pada percabangan if-else:',
        tableData: {
          headers: ['Operator', 'Makna Kalimat', 'Contoh Pengujian', 'Hasil Evaluasi Komputer'],
          rows: [
            ['==', 'Apakah nilainya sama persis?', '10 == 10', 'TRUE (Benar)'],
            ['!=', 'Apakah nilainya tidak sama?', '10 != 5', 'TRUE (Benar)'],
            ['>', 'Apakah lebih besar dari?', '15 > 20', 'FALSE (Salah)'],
            ['<', 'Apakah lebih kecil dari?', '8 < 12', 'TRUE (Benar)'],
            ['>=', 'Lebih besar ATAU sama dengan', '75 >= 75', 'TRUE (Benar)'],
            ['<=', 'Lebih kecil ATAU sama dengan', '50 <= 40', 'FALSE (Salah)']
          ]
        }
      },
      {
        heading: 'Pembeda Sakral: Tanda = vs Tanda ==',
        content: 'Perbedaan ini merupakan jebakan nomor satu bagi pelajar pemula:<br />' +
          '• <strong>Tanda <code>=</code> (Tunggal)</strong>: Operator <em>Assignment</em> untuk memasukkan nilai ke dalam variabel (contoh: <code>nilai = 80;</code>).<br />' +
          '• <strong>Tanda <code>==</code> (Ganda)</strong>: Operator <em>Relasional</em> untuk menanyakan apakah nilainya sama persis (contoh: <code>if (nilai == 80)</code>).'
      },
      {
        heading: 'Contoh Evaluasi Operator Relasional dalam Kode',
        content: 'Berikut penerapan operator relasional dalam menguji syarat kelulusan murid:',
        codeSnippet: {
          language: 'Penerapan Operator Relasional (2 Versi)',
          code: `// Uji kelulusan KKM: nilai >= 75`,
          codePseudo: `JIKA (nilaiUjian >= 75) MAKA
    status <- "LULUS"
LAINNYA
    status <- "REMIDI"
SELESAI JIKA`,
          codeC: `if (nilaiUjian >= 75) {
    printf("Status: LULUS\\n");
} else {
    printf("Status: REMIDI\\n");
}`,
          description: 'Operator relasional >= menghasilkan TRUE jika nilaiUjian bernilai 75 ke atas, dan FALSE jika di bawah 75.'
        }
      }
    ],
    proTips: 'Perhatikan operator >= ! Pada 75 >= 75 hasilnya TRUE karena angka 75 sama dengan 75. Namun jika memakai > saja (75 > 75), hasilnya adalah FALSE!',
    misconceptionWarning: 'Jangan pernah menulis if (nilai = 80). Perintah itu bukannya mengecek nilai, melainkan mengubah nilai variabel menjadi 80!',
    simulator: {
      type: 'condition_tester',
      variableName: 'nilai_murid',
      variableLabel: 'Nilai Ujian Murid',
      operator: '>=',
      threshold: 75,
      defaultValue: 80,
      unit: 'Poin',
      ifActionText: 'Status: LULUS (Cabang IF Aktif)',
      elseActionText: 'Status: REMIDI (Cabang ELSE Aktif)',
      trueExplanation: 'Karena nilai yang diuji mencapai atau melampaui KKM (>= 75), kondisi menghasilkan TRUE.',
      falseExplanation: 'Karena nilai yang diuji berada di bawah KKM (< 75), kondisi menghasilkan FALSE.'
    }
  },

  // =================================================================
  // KATEGORI 2: STRUKTUR PERCABANGAN (SIKLUS 1 & SIKLUS 2)
  // =================================================================
  {
    id: 'ptk-01',
    category: 'PERCABANGAN',
    cycleRequired: 1,
    order: 1,
    categoryLabel: 'Materi Percabangan',
    title: 'Konsep Dasar Percabangan & Evaluasi Boolean',
    subtitle: 'Cara Komputer Memilih Jalur Keputusan di Persimpangan',
    badgeLabel: 'MODUL 1',
    summary: 'Struktur percabangan (Branching) membuat program komputer tidak lagi berjalan kaku secara lurus saja, melainkan mampu mengambil keputusan arah instruksi berdasarkan pengujian kondisi yang bernilai benar (TRUE) atau salah (FALSE).',
    analogies: 'Sama seperti saat berpetualang: di sebuah persimpangan gua, JIKA kamu memiliki kunci emas MAKA pintu rahasia terbuka, LAINNYA kamu harus mencari jalan memutar.',
    sections: [
      {
        heading: 'Mengapa Percabangan Sangat Penting?',
        content: 'Dunia nyata penuh dengan situasi kondisional:<br />' +
          '• Jika baterai perangkat di bawah 20%: Aktifkan mode hemat daya.<br />' +
          '• Jika umur penonton minimal 17 tahun: Izinkan akses konten.<br />' +
          'Tanpa percabangan, teknologi pintar seperti perangkat digital, sensor pintu otomatis, dan lampu lalu lintas tidak akan bisa berfungsi.'
      },
      {
        heading: 'Prinsip Pasti Evaluasi Boolean',
        content: 'Komputer tidak pernah ragu. Setiap ekspresi kondisi yang diuji di dalam tanda kurung <code>if (...)</code> akan dihitung hingga menghasilkan satu dari dua kepastian: <strong>TRUE (1)</strong> atau <strong>FALSE (0)</strong>.',
        codeSnippet: {
          language: 'Pengecekan Kupon Diskon Belanja (2 Versi)',
          code: `// Kondisi: total_belanja >= 50000`,
          codePseudo: `JIKA (totalBelanja >= 50000) MAKA
    status <- "Dapat Kupon Diskon"
    poin <- poin + 10
LAINNYA
    status <- "Harga Normal"
    poin <- poin + 2
SELESAI JIKA`,
          codeC: `if (totalBelanja >= 50000) {
    printf("Dapat Kupon Diskon\\n");
    poin = poin + 10;
} else {
    printf("Harga Normal\\n");
    poin = poin + 2;
}`,
          description: 'Jika totalBelanja bernilai minimal 50000, ekspresi menghasilkan nilai boolean TRUE (1) dan cabang pertama dijalankan.'
        }
      }
    ],
    diagramType: 'flowchart_ifelse',
    proTips: 'Komputer mengevaluasi kondisi secara pasti: satu cabang dipilih, dan cabang alternatifnya otomatis dilewati (tidak dijalankan).',
    misconceptionWarning: 'Mustahil cabang IF dan cabang ELSE berjalan bersamaan pada satu kali putaran eksekusi program!',
    simulator: {
      type: 'condition_tester',
      variableName: 'total_belanja',
      variableLabel: 'Total Belanja Pelanggan (Rp)',
      operator: '>=',
      threshold: 50000,
      defaultValue: 65000,
      unit: 'Rupiah',
      ifActionText: 'Dapat Diskon + 10 Poin!',
      elseActionText: 'Harga Normal + 2 Poin',
      trueExplanation: 'Total belanja mencapai minimal Rp50.000 (TRUE), sehingga diskon diberikan.',
      falseExplanation: 'Total belanja kurang dari Rp50.000 (FALSE), belanja dikenakan harga normal.'
    }
  },

  {
    id: 'ptk-02',
    category: 'PERCABANGAN',
    cycleRequired: 1,
    order: 2,
    categoryLabel: 'Materi Percabangan',
    title: 'Percabangan Tunggal (Struktur IF)',
    subtitle: 'Menjalankan Aksi Khusus Hanya Saat Syarat Terpenuhi',
    badgeLabel: 'MODUL 2',
    summary: 'Percabangan tunggal (IF Satu Arah) digunakan ketika suatu tindakan hanya perlu dilakukan bila kondisi bernilai TRUE. Bila kondisi bernilai FALSE, tidak ada tindakan pengganti apa pun; komputer langsung melompati blok aksi tersebut.',
    analogies: 'Seperti sirine kebakaran di sekolah: Sirine HANYA berbunyi JIKA ada asap terdeteksi. JIKA tidak ada asap, sekolah beraktivitas biasa tanpa membunyikan apa-apa (tidak perlu ada pengumuman "kondisi aman").',
    sections: [
      {
        heading: 'Bentuk Struktur Percabangan Tunggal',
        content: 'Pada struktur ini, sama sekali tidak ada kata kunci <code>else</code>. Program berjalan efisien karena jika kondisi tidak terpenuhi, blok instruksi langsung dilewati tanpa membuang waktu pemrosesan alternatif.',
        codeSnippet: {
          language: 'Sirine Darurat Sensor Suhu (2 Versi)',
          code: `// Kondisi: suhu_ruang > 30`,
          codePseudo: `JIKA (suhuRuang > 30) MAKA
    BUNYIKAN_SIRINE_DARURAT()
    KIRIM_NOTIFIKASI_BAHAYA()
SELESAI JIKA`,
          codeC: `if (suhuRuang > 30) {
    bunyikan_sirine_darurat();
    kirim_notifikasi_bahaya();
}`,
          description: 'Perhatikan ketiadaan blok ELSE: aksi sirine hanya dipicu jika suhuRuang > 30. Jika tidak, alur langsung berlanjut ke baris berikutnya.'
        }
      },
      {
        heading: 'Analisis Alur Eksekusi',
        content: '• Jika <code>suhu_ruang = 33</code>: Evaluasi <code>(33 > 30)</code> bernilai <strong>TRUE</strong>. Sirine berbunyi.<br />' +
          '• Jika <code>suhu_ruang = 27</code>: Evaluasi <code>(27 > 30)</code> bernilai <strong>FALSE</strong>. Seluruh baris di dalam kurung kurawal dilewati, komputer langsung menuju baris berikutnya.'
      }
    ],
    diagramType: 'flowchart_single',
    proTips: 'Gunakan percabangan tunggal jika kejadian khusus (seperti sanksi denda keterlambatan buku perpus) hanya berlaku bagi yang melanggar saja.',
    misconceptionWarning: 'Jangan memaksakan menambahkan blok else kosong jika memang tidak ada aksi alternatif yang dibutuhkan saat kondisi bernilai salah.',
    interactiveCheck: {
      question: 'Jika suhu ruang server bernilai 28°C dan kondisi program adalah if (suhu_ruang > 30), apa yang dilakukan komputer?',
      options: [
        {
          label: 'Komputer menghasilkan pesan error karena tidak ada blok else.',
          isCorrect: false,
          explanation: 'Salah, percabangan tunggal tanpa else adalah kode yang sah dan normal.'
        },
        {
          label: 'Komputer melewati blok aksi sirine dan langsung melanjutkan langkah berikutnya.',
          isCorrect: true,
          explanation: 'Tepat sekali! Karena 28 > 30 bernilai FALSE, aksi sirine dilewati tanpa error.'
        }
      ]
    }
  },

  {
    id: 'ptk-03',
    category: 'PERCABANGAN',
    cycleRequired: 1,
    order: 3,
    categoryLabel: 'Materi Percabangan',
    title: 'Percabangan Ganda (Struktur IF-ELSE)',
    subtitle: 'Memilih Satu dari Dua Pilihan yang Saling Menolak',
    badgeLabel: 'MODUL 3',
    summary: 'Percabangan ganda (IF-ELSE Dua Arah) membagi aliran program menjadi dua pilihan yang saling menolak: Blok IF dijalankan jika kondisi TRUE, sedangkan Blok ELSE dijalankan jika kondisi FALSE.',
    analogies: 'Seperti saklar lampu di dinding ruangan: Saklar hanya bisa berada di salah satu posisi: JIKA saklar naik maka lampu MENYALA, LAINNYA lampu PADAM. Mustahil lampu menyala sekaligus padam bersamaan!',
    sections: [
      {
        heading: 'Struktur Dua Pilihan Mutlak',
        content: 'Dalam percabangan ganda, kedua cabang saling menolak (*mutually exclusive*). Salah satu cabang dijamin pasti dijalankan, dan cabang lawannya dijamin pasti diabaikan.',
        codeSnippet: {
          language: 'Sensor Palang Pintu Stasiun MRT (2 Versi)',
          code: `// Kondisi: saldo >= 4000`,
          codePseudo: `JIKA (saldo >= 4000) MAKA
    TAMPILKAN("Pintu Masuk Terbuka, Silakan Lewat")
LAINNYA
    TAMPILKAN("Saldo Kurang, Silakan Isi Ulang")
SELESAI JIKA`,
          codeC: `if (saldo >= 4000) {
    printf("Pintu Masuk Terbuka, Silakan Lewat\\n");
} else {
    printf("Saldo Kurang, Silakan Isi Ulang\\n");
}`,
          description: 'Kedua cabang saling melengkapi: bila saldo memenuhi syarat maka blok IF aktif, bila tidak maka blok ELSE yang dieksekusi.'
        }
      },
      {
        heading: 'Pemeriksaan Batas Kritis (Boundary Value)',
        content: 'Perhatikan kondisi batas <code>saldo >= 4000</code>:<br />' +
          '• Jika saldo tepat <code>4000</code>: Evaluasi bernilai <strong>TRUE</strong> karena ada operator sama dengan <code>>=</code>.<br />' +
          '• Jika programmer salah ketik menjadi <code>saldo > 4000</code>: Penumpang dengan saldo tepat 4000 justru akan ditolak (FALSE)! Inilah mengapa ketelitian memilih operator sangat menentukan nasib sistem.'
      }
    ],
    diagramType: 'flowchart_ifelse',
    proTips: 'Ingat baik-baik: Blok ELSE tidak pernah memiliki syarat kondisi tertulis lagi di sampingnya. Kata kunci else otomatis menampung semua nilai yang bernilai FALSE dari syarat IF.',
    misconceptionWarning: 'Menulis "else (saldo < 4000)" adalah kesalahan fatal sintaks di hampir semua bahasa pemrograman. Cukup tulis kata "else" saja!',
    simulator: {
      type: 'condition_tester',
      variableName: 'saldo_kartu',
      variableLabel: 'Saldo Kartu Penumpang (Rp)',
      operator: '>=',
      threshold: 4000,
      defaultValue: 5000,
      unit: 'Rupiah',
      ifActionText: 'PINTU TERBUKA (Cabang IF)',
      elseActionText: 'SALDO KURANG (Cabang ELSE)',
      trueExplanation: 'Saldo penumpang mencapai minimal Rp4.000 (TRUE), gerbang stasiun terbuka.',
      falseExplanation: 'Saldo penumpang di bawah Rp4.000 (FALSE), gerbang menolak akses.'
    }
  },

  {
    id: 'ptk-04',
    category: 'PERCABANGAN',
    cycleRequired: 2, // Gated dengan Token Siklus 2
    order: 4,
    categoryLabel: 'Materi Percabangan',
    title: 'Percabangan Bertingkat else-if & Operator Logika',
    subtitle: 'Alur Evaluasi Air Terjun dan Pengecekan Syarat Majemuk',
    badgeLabel: 'MODUL 4',
    summary: 'Percabangan bertingkat (if, else if, else) menangani banyak rentang kondisi secara bertahap dari atas ke bawah dengan bantuan operator logika majemuk && (DAN) serta || (ATAU).',
    analogies: 'Seperti seleksi bertingkat: pelamar diperiksa kualifikasi utamanya dulu, jika belum memenuhi akan dicek syarat berikutnya, hingga opsi cadangan terakhir.',
    sections: [
      {
        heading: '1. Alur Evaluasi dari Atas ke Bawah',
        content: 'Komputer menguji ekspresi kondisi satu demi satu mulai dari baris paling atas:<br />' +
          '• Begitu satu kondisi bernilai TRUE, blok kodenya langsung dieksekusi dan seluruh cabang di bawahnya dilewati.<br />' +
          '• Jika bernilai FALSE, komputer turun memeriksa kondisi else-if berikutnya.<br />' +
          '• Blok else penutup bertindak sebagai eksekusi terakhir bila semua syarat di atasnya bernilai FALSE.',
        codeSnippet: {
          language: 'Aturan Kuota Bandwidth Router (2 Versi)',
          code: `// Alur evaluasi else-if bertingkat`,
          codePseudo: `JIKA (prioritas == 1 DAN kuota >= 100) MAKA
    alokasi <- "Jalur Utama: Kuota 100 Mbps"
LAINNYA JIKA (kuota >= 50) MAKA
    alokasi <- "Jalur Standar: Kuota 50 Mbps"
LAINNYA
    alokasi <- "Jalur Hemat: Kuota 10 Mbps"
SELESAI JIKA`,
          codeC: `if (prioritas == 1 && kuota >= 100) {
    printf("Jalur Utama: Kuota 100 Mbps\\n");
} else if (kuota >= 50) {
    printf("Jalur Standar: Kuota 50 Mbps\\n");
} else {
    printf("Jalur Hemat: Kuota 10 Mbps\\n");
}`,
          description: 'Komputer mengecek kondisi prioritas dan kuota dari atas. Begitu syarat pertama terpenuhi, cabang berikutnya otomatis dilewati.'
        }
      },
      {
        heading: '2. Prinsip Air Terjun (Waterfall Execution)',
        content: 'Dalam percabangan bertingkat, penulisan syarat wajib mengikuti prinsip air terjun:<br />' +
          '• Urutan syarat ketat (nilai batas tertinggi) wajib diletakkan di bagian paling awal.<br />' +
          '• Syarat yang lebih longgar diletakkan di cabang berikutnya.<br />' +
          '• Komputer berhenti pada syarat pertama yang terpenuhi tanpa menguji cabang di bawahnya.'
      },
      {
        heading: '3. Tabel Kebenaran Operator Logika Majemuk && dan ||',
        content: 'Operator logika menggabungkan dua atau lebih syarat kondisi dalam satu baris pengecekan:<br />' +
          '• Operator && (DAN): Menghasilkan TRUE hanya jika kedua syarat sama-sama bernilai TRUE.<br />' +
          '• Operator || (ATAU): Menghasilkan TRUE jika minimal salah satu syarat bernilai TRUE.',
        tableData: {
          headers: ['Syarat A', 'Syarat B', 'Hasil A && B (DAN)', 'Hasil A || B (ATAU)', 'Keterangan'],
          rows: [
            ['TRUE', 'TRUE', 'TRUE', 'TRUE', 'Kedua syarat terpenuhi'],
            ['TRUE', 'FALSE', 'FALSE', 'TRUE', 'Hanya salah satu syarat yang terpenuhi'],
            ['FALSE', 'TRUE', 'FALSE', 'TRUE', 'Hanya salah satu syarat yang terpenuhi'],
            ['FALSE', 'FALSE', 'FALSE', 'FALSE', 'Kedua syarat tidak terpenuhi']
          ]
        }
      }
    ],
    diagramType: 'flowchart_nested',
    proTips: 'Selalu letakkan syarat yang paling ketat dengan angka batas tertinggi di urutan paling atas agar tidak terhalang oleh syarat yang lebih longgar.',
    misconceptionWarning: 'Urutan rentang nilai yang terbalik memicu unreachable code (baris mati). Jika syarat "kuota >= 50" ditulis sebelum "kuota >= 100", maka kuota bernilai 120 akan langsung tersangkut di cabang 50 dan cabang 100 tidak akan pernah dieksekusi!',
    interactiveCheck: {
      question: 'Mengapa syarat dengan kriteria paling ketat wajib ditulis di baris paling atas pada struktur else-if?',
      options: [
        {
          label: 'Agar data yang memenuhi syarat ketat tidak terlanjur tersaring oleh syarat yang lebih longgar (mencegah unreachable code).',
          isCorrect: true,
          explanation: 'Tepat sekali! Evaluasi air terjun berhenti begitu menemukan cabang bernilai TRUE pertama.'
        },
        {
          label: 'Karena komputer hanya mampu membaca angka yang diurutkan dari kecil ke besar.',
          isCorrect: false,
          explanation: 'Salah. Komputer membaca urutan kode baris demi baris persis seperti yang ditulis pembuat program.'
        }
      ]
    }
  },

  {
    id: 'ptk-05',
    category: 'PERCABANGAN',
    cycleRequired: 2, // Gated dengan Token Siklus 2
    order: 5,
    categoryLabel: 'Materi Percabangan',
    title: 'Percabangan Multi-Kategori switch-case',
    subtitle: 'Pemilihan Nilai Diskret dan Penanganan Kasus Default',
    badgeLabel: 'MODUL 5',
    summary: 'Struktur switch-case dipakai untuk memilih satu jalur instruksi dari banyak kemungkinan berdasarkan pencocokan nilai diskret secara langsung dan rapi.',
    analogies: 'Seperti tombol pada mesin penjual minuman otomatis: menekan tombol 1 mengeluarkan Air Mineral, tombol 2 Teh Melati, tombol 3 Kopi Susu, dan tombol selain itu memicu pesan Pilihan Tidak Valid.',
    sections: [
      {
        heading: '1. Pemilihan Nilai Diskret & Fungsi break;',
        content: 'Struktur switch-case bekerja dengan mencocokkan nilai variabel secara langsung ke label case yang sesuai:<br />' +
          '• Nilai diskret: Berupa angka bulat (integer) atau karakter huruf tunggal, bukan rentang perbandingan.<br />' +
          '• Fungsi break;: Menghentikan eksekusi dan segera melompat keluar dari blok switch.<br />' +
          '• Dampak tanpa break;: Memicu efek fall-through, yaitu instruksi pada case berikutnya ikut dijalankan meskipun labelnya tidak cocok!',
        codeSnippet: {
          language: 'Logika Tombol Mesin Minuman (2 Versi)',
          code: `// Pemilihan nilai diskret switch-case`,
          codePseudo: `PILIH (tombol)
    KASUS 1:
        TAMPILKAN("Keluarkan Air Mineral")
        BERHENTI
    KASUS 2:
        TAMPILKAN("Keluarkan Teh Melati")
        BERHENTI
    KASUS 3:
        TAMPILKAN("Keluarkan Kopi Susu")
        BERHENTI
    STANDAR:
        TAMPILKAN("Nomor Tombol Tidak Valid")
SELESAI PILIH`,
          codeC: `switch (tombol) {
    case 1:
        printf("Keluarkan Air Mineral\\n");
        break;
    case 2:
        printf("Keluarkan Teh Melati\\n");
        break;
    case 3:
        printf("Keluarkan Kopi Susu\\n");
        break;
    default:
        printf("Nomor Tombol Tidak Valid\\n");
        break;
}`,
          description: 'Setiap case diakhiri perintah break; agar mesin hanya memproses produk yang dipilih oleh murid.'
        }
      },
      {
        heading: '2. Fungsi Cabang Standar (default) sebagai Penyelamat Error',
        content: 'Cabang default bertugas menangani segala kondisi masukan yang tidak terduga:<br />' +
          '• Bekerja mirip seperti blok else terakhir pada struktur if-else.<br />' +
          '• Menjadi jaring pengaman bila murid menekan tombol yang tidak terdaftar (misal menekan angka 9 pada mesin 3 tombol).<br />' +
          '• Menjaga sistem tetap stabil tanpa mengalami kebingungan instruksi atau macet.'
      }
    ],
    diagramType: 'flowchart_ifelse',
    proTips: 'Selalu sertakan perintah break; pada setiap case dan blok default di bagian akhir untuk mengantisipasi masukan yang tidak valid.',
    misconceptionWarning: 'switch-case tidak dapat digunakan untuk mengecek rentang logika perbandingan seperti (nilai >= 75). Struktur ini khusus dirancang untuk mencocokkan nilai diskret pasti (1, 2, 3, dan seterusnya).',
    interactiveCheck: {
      question: 'Apa fungsi utama dari perintah break; di dalam setiap blok case?',
      options: [
        {
          label: 'Menghentikan eksekusi dan segera keluar dari struktur switch agar case berikutnya tidak ikut dijalankan.',
          isCorrect: true,
          explanation: 'Tepat sekali! Tanpa break;, program akan mengalami fall-through dan mengeksekusi case selanjutnya secara berurutan.'
        },
        {
          label: 'Menghapus nilai variabel masukan agar memori perangkat menjadi bersih.',
          isCorrect: false,
          explanation: 'Salah. Perintah break; murni mengatur alur kendali eksekusi program, bukan menghapus data variabel.'
        }
      ]
    }
  }
];

// Helper untuk mengambil topik berdasarkan ID
export function getMateriTopicById(id: string): MateriTopic {
  const found = MATERI_BANK.find((topic) => topic.id === id);
  return found || MATERI_BANK[0]!;
}

