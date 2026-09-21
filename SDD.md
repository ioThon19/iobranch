# SYSTEM DESIGN DOCUMENT (SDD)
## iobranch — Interactive 2D Pixel Art Logic Tracer PWA

**Nama Produk**: iobranch  
**Versi Dokumen**: 1.0.0  
**Status**: Approved Architecture Blueprint  
**Arsitek Sistem**: Lead Educational Game Architect & Software Engineer  
**Standar Rekayasa & Desain**: Standar Anti-Slop ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop))  
**Target Riset Tindakan**: Penelitian Tindakan Kelas (PTK) Informatika Kelas X-10 (46 Murid)  
**Jadwal Tindakan**: 22 September 2026 (Siklus I) & 6 Oktober 2026 (Siklus II)  

---

## 1. Ikhtisar Sistem & Prinsip Arsitektur

### 1.1 Deskripsi Sistem
*iobranch* adalah media pembelajaran interaktif berbasis *Progressive Web App (PWA)* yang menggabungkan mesin game 2D Pixel Art retro (estetika konsol 16-bit klasik ala Pokémon GBA / Harvest Moon) dengan mesin visualisasi penelusuran kode (*step-by-step code tracing*). 

Sistem ini memvisualisasikan struktur kontrol percabangan (`if`, `if-else`, `else-if`, `switch-case`) sebagai **persimpangan jalan fisik di dunia game**, di mana karakter (*Hero*) melangkah menembus gerbang logika berdasarkan evaluasi kondisi nilai masukan yang diuji oleh murid.

### 1.2 Tumpukan Teknologi Resmi (*Official Tech Stack*)

| Komponen Arsitektur | Teknologi Terpilih | Justifikasi Teknis |
|---|---|---|
| **Game Engine** | **Phaser 3 (v3.87+)** | Mesin game HTML5 native berstandar industri, rendering WebGL dengan Canvas fallback, konfigurasi `pixelArt: true` (nearest-neighbor crisp rendering), dan native Tiled JSON loader. |
| **Bahasa Pemrograman** | **TypeScript (v5.x)** | Type-safety penuh pada pemodelan modul soal, penanganan state branching, dan serialisasi data pasangan. Mencegah runtime bug di kelas. |
| **Peralatan Build & Bundler**| **Vite (v6.x)** | Hot Module Replacement (HMR) sub-detik, tree-shaking efisien, dan integrasi penggelaran instan di Vercel. |
| **Desain Peta (*Tilemap*)** | **Tiled Map Editor (JSON)** | Format standar industri ekspor JSON. Memisahkan layer visual (Terrain, Walls) dengan *Object Layer* penentu koordinat persimpangan dan pemicu gerbang. |
| **Aset Pixel Art** | **Aseprite / Pixelorama** | Ekspor sprite-sheet dan texture atlas JSON teroptimasi untuk siklus jalan (*walk cycle*) Hero 4-arah dan animasi palang gerbang. |
| **PWA & Offline Engine** | **vite-plugin-pwa (Workbox)** | Standar emas PWA modern: otomatisasi Service Worker precaching untuk semua bundel aset dan tilemap, menjamin 100% offline di sekolah. |
| **Penyimpanan Lokal** | **IndexedDB (`idb-keyval`)** | Penyimpanan lokal asinkronus (~600 byte footprint), tidak memblokir render thread 60 FPS, tahan terhadap pembersihan memori otomatis ponsel. |
| **Platform Penggelaran** | **Vercel** | Hosting statis global berkecepatan tinggi, sertifikat SSL/HTTPS otomatis (syarat mutlak PWA Service Worker), dan nol biaya operasional. |

### 1.3 Pola Arsitektur: *Decoupled Hybrid Architecture (Canvas + Retro DOM)*
Sistem memisahkan tanggung jawab visual dunia game dan manipulasi teks kode menjadi dua lapisan yang berkomunikasi secara asinkronus melalui **Event Bus Terpusat (`EventCenter`)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            iobranch ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: GAME WORLD VIEWPORT (Phaser 3 Canvas 2D / WebGL)                  │
│  ├── WorldScene (Tilemap Tiled: Jalur Tanah, Rerumputan, Pohon, Rambu IF)   │
│  ├── HeroSprite (Karakter Pixel 16x16, Animasi Walk-Cycle 4-Arah)           │
│  └── GateSystem (Gerbang IF & ELSE dengan Permata Menyala & Palang Buka)    │
├──────────────────────────────────────┬──────────────────────────────────────┤
│                                      │                                      │
│   ▲ Event: 'GATE_OPENED'             │   ▼ Event: 'RUN_SIMULATION'          │
│   │                                  │   │                                  │
│   └──────────────────────┐           │   ┌──────────────────────────────────┘
│                          │           │   │
│                     ┌────┴───────────┴───▼────┐
│                     │  Phaser EventCenter Bus │
│                     └────┬───────────┬───▲────┘
│                          │           │   │
├──────────────────────────┴───────────┴───┴──────────────────────────────────┤
│  LAYER 2: RETRO RPG CONTROL PANEL (DOM / HTML5 / Tailwind / GBA Style)      │
│  ├── Onboarding Modal (Registrasi Kelompok Pasangan / Murid 1 & 2)           │
│  ├── Dual-Syntax Switcher (Saklar Instan Pseudocode ID ⮂ Bahasa C)          │
│  ├── Mindful Predict-First Gate (Input Data & Pemilihan Tebakan Jalur)      │
│  ├── Code Highlighter Stepper (Penyorotan Baris Aktif, Cabang Lewat Redup)  │
│  ├── Terminal Konsol Retro (Pencetak Keluaran Program & Umpan Balik)        │
│  └── Branch Coverage Tracker (Lencana Gamifikasi 2 Bintang)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: CORE LOGIC & PERSISTENCE (TypeScript Services)                    │
│  ├── TracerEngine.ts (Mesin Penelusuran Baris Kode & Evaluator Ekspresi)    │
│  ├── CycleGuard.ts (Pengunci Materi Siklus I & II dengan PIN Guru 'PTK10')  │
│  ├── AudioService.ts (Sintesis Suara Retro 8-Bit via Native Web Audio API)   │
│  ├── StorageService.ts (Penyimpanan Asinkronus Sesi Pasangan via IndexedDB) │
│  └── AssessmentExportService.ts (Ekspor CSV & Web Share API ke Drive)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Modul & Manajemen Berkas Proyek

Proyek diorganisasikan dalam struktur modular berbasis TypeScript dan Vite:

```text
d:\Anthonio Akbar\After Wisuda\PPG PRAJAB\LMS\!SEMESTER 2\PTK\iobranch\
├── package.json                # Definisi dependensi (Phaser, idb-keyval, Vite, PWA)
├── tsconfig.json               # Konfigurasi compiler TypeScript
├── vite.config.ts              # Konfigurasi Vite + vite-plugin-pwa (Workbox)
├── vercel.json                 # Konfigurasi rute & header PWA Vercel
├── index.html                  # Shell HTML antarmuka hybrid
│
├── public/
│   ├── favicon.ico
│   ├── manifest.webmanifest    # Metadata PWA standalone
│   ├── assets/
│   │   ├── tilesets/
│   │   │   ├── retro_terrain.png # Tileset 16x16 rumput, tanah, pohon, pagar
│   │   │   └── logic_gates.png   # Tileset gerbang kayu, batu, & obor permata
│   │   ├── maps/
│   │   │   ├── mission_01.json   # Tilemap Tiled kasus 1 (Operator/Gerbang)
│   │   │   ├── mission_02.json   # Tilemap Tiled kasus 2 (Percabangan IF)
│   │   │   └── mission_03.json   # Tilemap Tiled kasus 3 (Percabangan IF-ELSE)
│   │   ├── sprites/
│   │   │   ├── hero.png          # Sprite sheet karakter petualang
│   │   │   └── hero.json         # Atlas definisi frame animasi Aseprite
│   │   └── icons/
│   │       ├── icon-192.png      # Ikon PWA 192x192 px
│   │       └── icon-512.png      # Ikon PWA 512x512 px
│
└── src/
    ├── main.ts                 # Titik masuk aplikasi (Bootstrap SPA)
    ├── style.css               # Desain sistem Retro RPG & utilitas layout
    │
    ├── types/
    │   ├── module.types.ts     # Definisi tipe Modul, Kasus, dan Langkah Tracing
    │   ├── session.types.ts    # Definisi tipe Sesi Pasangan & Lencana
    │   └── events.types.ts     # Definisi tipe komunikasi EventCenter
    │
    ├── game/
    │   ├── config.ts           # Konfigurasi Phaser 3 (Canvas, resolusi, physics)
    │   ├── EventCenter.ts      # Event bus jembatan Phaser ↔ DOM
    │   └── scenes/
    │       ├── BootScene.ts    # Prapemuatan aset statis & inisialisasi awal
    │       ├── WorldScene.ts   # Scene utama dunia Tiled, gerak Hero, & animasi gerbang
    │       └── BattleScene.ts  # Scene pertarungan logika RPG (Turn-based Branching Challenge)
    │
    ├── ui/
    │   ├── UIManager.ts        # Pengendali DOM UI Layer retro GBA
    │   ├── SyntaxRenderer.ts   # Saklar tampilan Pseudocode ID ↔ Bahasa C
    │   ├── DialogBox.ts        # Penampil teks typewriter konsol guru/status
    │   └── CoverageView.ts     # Penampil visual lencana 2 Bintang (Branch Coverage)
    │
    ├── logic/
    │   ├── TracerEngine.ts     # Simulator penelusuran baris kode & evaluasi kondisi
    │   ├── CycleGuard.ts       # Pengunci modul Siklus II (Teacher PIN PTK10)
    │   └── modules.data.ts     # Bank data soal kontekstual (Modul 1 s.d. 5)
    │
    └── services/
        ├── AudioService.ts             # Sintesis efek suara 8-bit native Web Audio API
        ├── StorageService.ts           # Abstraksi penyimpanan IndexedDB (idb-keyval)
        └── AssessmentExportService.ts  # Layanan ekspor CSV & Web Share API ke Google Drive
```

---

## 3. Desain Komponen Inti & Alur Kerja Data

### 3.1 Game Engine Scene Architecture (`Phaser 3`)
Sistem game mengadopsi resolusi dasar retro $480 \times 240$ pixel dengan penskalaan `Phaser.Scale.FIT` dan `pixelArt: true` guna menjamin ketajaman pixel (*zero-blur*).

#### A. `BootScene.ts`
* Memuat seluruh texture atlas (`hero.png`, `hero.json`), tileset terrain, dan file peta JSON dari Tiled.
* Mendaftarkan animasi global sprite Hero:
  * `hero-walk-down` (Frame 0–3, 8 FPS)
  * `hero-walk-up` (Frame 4–7, 8 FPS)
  * `hero-walk-right` (Frame 8–11, 8 FPS)
  * `hero-idle` (Frame 0, diam)

#### B. `WorldScene.ts` & Mekanika Navigasi Peta Dunia
* Membaca Tiled JSON dan merender layer: `GroundLayer`, `PathLayer`, `FoliageLayer`.
* **Sistem Navigasi Ganda Berdasarkan Konteks:**
  1. **Mode Eksplorasi Bebas (*Overworld Free Roaming* - Layar 02):**
     * Murid dapat menggerakkan karakter Hero berjalan-jalan di Kota Harmoni menuju gedung Sekolah, Lab, Perpustakaan, dan Taman.
     * Masukan Sentuh (*Mobile*): Komponen Virtual D-Pad (Atas, Bawah, Kiri, Kanan) dan tombol aksi 'A'.
     * Masukan Keyboard (*Desktop*): Tombol WASD / Arrow Keys + Space/Enter untuk berdialog dengan NPC.
  2. **Mode Penelusuran Kode (*Tracing Waypoint Mode* - Layar 05):**
     * Kontrol bebas dinonaktifkan sementara.
     * Karakter digerakkan otomatis secara deterministik melalui *Object Layer* koordinat:
       * `SpawnPoint`: Koordinat awal Hero $(x: 32, y: 120)$.
       * `ForkPoint`: Koordinat persimpangan jalan $(x: 200, y: 120)$ di depan rambu `IF?`.
       * `GateIFPoint`: Koordinat Gerbang Atas $(x: 380, y: 60)$.
       * `GateELSEPoint`: Koordinat Gerbang Bawah $(x: 380, y: 180)$.
     * Saat menerima event `RUN_SIMULATION`, Hero berjalan ke `ForkPoint`, berhenti memeriksa kondisi, lalu melangkah ke `GateIFPoint` (jika TRUE) atau `GateELSEPoint` (jika FALSE) dan menembakkan event `HERO_COMPLETED_BRANCH`.

#### C. `BattleScene.ts` & Mekanika Tantangan Pertarungan Logika (Layar 06)
* Beroperasi sebagai arena evaluasi turn-based RPG yang diakses di Lab Komputer / Taman Kota:
  * Menampilkan sprite Hero berhadapan dengan *Bug Monster Lv. 4* (HP: 28/40).
  * Menerima payload evaluasi kondisi dari `TracerEngine.ts` via `EventCenter`:
    * Event: `EXECUTE_BATTLE_TURN`, payload: `{ conditionRule: string, chosenAction: string, isCorrect: boolean }`.
    * Jika pilihan aksi sesuai logika kondisi (`TRUE`): Hero mengeksekusi serangan kritis (*Critical Attack*), darah monster berkurang, dan memicu penambahan **+50 XP**.
    * Jika pilihan salah (`FALSE`): Monster menyerang balik dan memicu umpan balik reflektif dari NPC Guru Pak Budi.
* Menyediakan jembatan mulus untuk kembali ke `WorldScene` pasca-pertempuran.

#### D. Antarmuka Komunikasi Asinkronus EventCenter (`EventCenter.ts`)
Komunikasi antara Canvas Phaser 3, retro DOM UI, dan Logic Service dijembatani oleh event bus terpusat:

| Nama Event | Pengirim | Penerima | Deskripsi & Payload |
|---|---|---|---|
| `RUN_SIMULATION` | DOM UI | `WorldScene` | Memicu Hero berjalan menelusuri waypoint `{ inputVal: number, conditionResult: boolean }`. |
| `GATE_OPENED` | `WorldScene` | DOM UI | Mengabarkan gerbang IF/ELSE terbuka, memicu penyorotan baris aktif. |
| `HERO_COMPLETED_BRANCH` | `WorldScene` | DOM UI & Logic | Hero tiba di cabang akhir; memicu evaluasi bintang coverage & simpan progress. |
| `START_BATTLE` | `WorldScene` / UI | `BattleScene` | Mem-pause WorldScene & membuka battle arena `{ enemyId: string, conditionRule: string }`. |
| `EXECUTE_BATTLE_TURN` | DOM UI | `BattleScene` | Murid memilih aksi bertarung `{ action: string, isCorrect: boolean }`. |
| `BATTLE_RESOLVED` | `BattleScene` | `WorldScene` & UI | Pertempuran tuntas `{ won: boolean, xpEarned: number }`; melanjutkan eksplorasi. |
| `CYCLE_UNLOCKED` | `CycleGuard` | DOM Nav | Membuka modul 4 & 5 setelah PIN guru `PTK10` valid diverifikasi. |

---

### 3.2 Mesin Penelusuran Kode & Evaluator Logika (`TracerEngine.ts`)

#### A. Evaluator Relasional Aman (*Safe Expression Evaluator*)
Aplikasi menolak penggunaan fungsi berbahaya `eval()` atau `new Function()`. Evaluator ekspresi relasional menguraikan input dan operator secara eksplisit:

```typescript
// src/logic/TracerEngine.ts
export type RelationalOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export function evaluateCondition(leftValue: number, op: RelationalOperator, rightValue: number): boolean {
  switch (op) {
    case '==': return leftValue === rightValue;
    case '!=': return leftValue !== rightValue;
    case '>':  return leftValue > rightValue;
    case '<':  return leftValue < rightValue;
    case '>=': return leftValue >= rightValue;
    case '<=': return leftValue <= rightValue;
    default:   return false;
  }
}
```

#### B. Struktur Data Definisi Kasus & Langkah Tracing
Setiap modul soal dimodelkan dengan antarmuka TypeScript yang ketat:

```typescript
// src/types/module.types.ts
export interface CodeLine {
  lineNumber: number;
  pseudoText: string;
  cText: string;
  branchType: 'INIT' | 'CONDITION' | 'BRANCH_IF' | 'BRANCH_ELSE' | 'OUTPUT';
}

export interface CaseModule {
  id: string;               // Contoh: 'm03'
  title: string;            // 'Kasir Kantin Cerdas (Kupon Diskon)'
  cycleRequired: 1 | 2;     // 1: Siklus I (Aktif), 2: Siklus II (Terkunci)
  inputVariable: string;    // 'total_belanja'
  defaultInput: number;     // 30000
  targetComparison: {
    op: RelationalOperator; // '>='
    boundaryValue: number;  // 25000
  };
  lines: CodeLine[];
  hints: {
    level1: string;
    level2: string;
    level3: string;
  };
}

  // src/types/session.types.ts
  export interface StudentSession {
    pairId: string;
    student1Name: string;
    student1Absen: number;
    student2Name: string;
    student2Absen: number;
    teamSymbol: 'algoritma' | 'biner' | 'matriks' | 'vektor';
    totalXp: number;      // Akumulasi poin pengalaman (default: 0)
    currentLevel: number; // Kalkulasi: Math.floor(totalXp / 100) + 1
    createdAt: number;
  }

  export interface ModuleProgress {
    testedBranches: string[]; // ['IF', 'ELSE']
    stars: number;            // 0, 1, atau 2
    isCompleted: boolean;
    xpEarned: number;
    updatedAt: number;
  }
```

---

### 3.3 Saklar Dwi-Bahasa (*Dual-Syntax Switcher* - `SyntaxRenderer.ts`)
* Elemen HTML kode diberi atribut penanda baris: `<div data-line="1" class="code-line">`.
* Saat tombol toggle ditekan:
  * State `currentSyntax` berganti antara `'pseudo'` dan `'c'`.
  * Sistem hanya memperbarui properti `textContent` setiap baris sesuai pemetaan `lines[i].pseudoText` atau `lines[i].cText`.
  * Penanda sorotan aktif (*highlight active class*) dan opasitas cabang yang meredup (*dimmed skipped branch*) tidak berubah sama sekali, sehingga transisi bahasa terjadi seketika (*0ms latency*) tanpa merusak posisi simulasi.

---

### 3.4 Pelacak Cakupan Cabang & Sistem Pengalaman (*CoverageView.ts*)
* Setiap modul memiliki set cabang yang dilacak: `Set<'IF' | 'ELSE'>`.
* **Kalkulasi Lencana & Hadiah XP:**
  * Ukuran Set $= 0$: `⭐ 0/2 Cabang Teruji` (Monokrom redup, 0 XP).
  * Ukuran Set $= 1$: `⭐ 1/2 Cabang Teruji` (Amber Gold, **+50 XP**, tantangan: *"Bagus! Sekarang cari nilai input lain agar cabang satunya ikut teruji!"*).
  * Ukuran Set $= 2$: `⭐⭐ 2/2 TUNTAS!` (Emerald Green menyala, **+100 XP**, memicu fanfare kemenangan retro dan membuka tanda centang pada menu modul).
* Data langsung disimpan secara persisten ke **IndexedDB**.

---

### 3.5 Sistem Penguncian Siklus PTK (`CycleGuard.ts`)
* **Status Default**: `activeCycle = 1`.
* Saat modul dimuat di menu navigasi:
  * Modul dengan `cycleRequired: 2` (Modul 4 *else-if* dan Modul 5 *switch-case*) otomatis diberi atribut `disabled`, kelas CSS `grayscale opacity-50 cursor-not-allowed`, dan ikon gembok 🔒.
  * Murid yang mencoba mengklik modul terkunci akan memicu dialog ramah: *"Materi Misi Siklus II - Akan dibuka pada pertemuan berikutnya!"*
* **Teacher Passcode Verification & Admin Control**:
  * Ketuk 3 kali pada logo `iobranch` di header membuka modal tersembunyi guru.
  * Masukan PIN rahasia `PTK10` membuka **Teacher Control Panel**:
    1. **Buka Kunci Siklus II**: Mengubah state ke Siklus II dan membuka Modul 4 & 5.
    2. **Konfigurasi Tautan Google Drive**: Menampilkan URL tujuan unggah aktif (default: `https://s.id/drive-ptk-x10`) dan menyediakan kolom input teks bagi guru untuk memperbarui tautan tersebut sewaktu-waktu secara instan di kelas.
    ```typescript
    export async function verifyTeacherPin(pinInput: string): Promise<boolean> {
      if (pinInput.trim() === 'PTK10') {
        EventCenter.emit('TEACHER_PANEL_OPENED');
        return true;
      }
      return false;
    }

    export async function updateCycleAndDrive(cycle: 1 | 2, customDriveUrl?: string): Promise<void> {
      await StorageService.setCycleState(cycle);
      if (customDriveUrl && customDriveUrl.trim() !== '') {
        await StorageService.setDriveUrl(customDriveUrl.trim());
      }
      EventCenter.emit('CYCLE_UNLOCKED', cycle);
    }
    ```
  * Begitu berhasil diperbarui, pengaturan langsung tersimpan permanen di IndexedDB gawai tersebut tanpa perlu kompilasi ulang.

---

### 3.6 Sintesis Suara Retro 8-Bit Native (`AudioService.ts`)
Menolak penggunaan file suara luar (`.mp3`/`.wav`) demi menjaga kecepatan, portabilitas, dan ukuran bundel di bawah 1 MB.

```typescript
// src/services/AudioService.ts
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  public initOnFirstTouch(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(freq: number, duration: number, type: OscillatorType = 'square', volume: number = 0.08): void {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playDialogTick(): void {
    this.playTone(480, 0.02, 'square', 0.04);
  }

  public playButtonBlip(): void {
    this.playTone(330, 0.04, 'square', 0.08);
  }

  public playLogicTrue(): void {
    this.playTone(587.33, 0.08, 'triangle', 0.1);
  }

  public playLogicFalse(): void {
    this.playTone(220.00, 0.12, 'sawtooth', 0.08);
  }

  public playBranchSuccessChime(): void {
    if (this.isMuted || !this.ctx) return;
    // Victory Fanfare 4 Nada Sesuai DESIGN.md: C5, E5, G5, C6
    const fanfare = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 70 },
      { freq: 783.99, delay: 140 },
      { freq: 1046.50, delay: 210 }
    ];
    fanfare.forEach((n) => setTimeout(() => this.playTone(n.freq, 0.08, 'triangle', 0.1), n.delay));
  }
}
export const soundFx = new AudioService();
```

---

### 3.7 Penyimpanan Asinkronus IndexedDB (`StorageService.ts`)
Menggunakan pustaka mini `idb-keyval` untuk keandalan data jangka panjang:

```typescript
// src/services/StorageService.ts
import { get, set, del } from 'idb-keyval';
import { StudentSession, ModuleProgress } from '../types/session.types';

const KEYS = {
  SESSION: 'iobranch_session',
  PROGRESS: 'iobranch_progress',
  CYCLE: 'iobranch_active_cycle',
  DRIVE_URL: 'iobranch_drive_url'
};

export class StorageService {
  public static async saveSession(session: StudentSession): Promise<void> {
    await set(KEYS.SESSION, session);
  }

  public static async getSession(): Promise<StudentSession | undefined> {
    return await get<StudentSession>(KEYS.SESSION);
  }

  public static async saveModuleCoverage(moduleId: string, branches: string[], xpReward: number = 0): Promise<void> {
    const progress = (await get<Record<string, ModuleProgress>>(KEYS.PROGRESS)) || {};
    const prev = progress[moduleId];
    const prevBranches = prev ? prev.testedBranches : [];
    const merged = Array.from(new Set([...prevBranches, ...branches]));
    
    progress[moduleId] = {
      testedBranches: merged,
      stars: merged.length >= 2 ? 2 : merged.length,
      isCompleted: merged.length >= 2,
      xpEarned: (prev ? prev.xpEarned : 0) + xpReward,
      updatedAt: Date.now()
    };
    await set(KEYS.PROGRESS, progress);

    // Update total XP pada sesi
    const session = await this.getSession();
    if (session && xpReward > 0) {
      session.totalXp += xpReward;
      session.currentLevel = Math.floor(session.totalXp / 100) + 1;
      await this.saveSession(session);
    }
  }

  public static async getCycleState(): Promise<number> {
    return (await get<number>(KEYS.CYCLE)) || 1;
  }

  public static async setCycleState(cycle: number): Promise<void> {
    await set(KEYS.CYCLE, cycle);
  }

  public static async getDriveUrl(): Promise<string> {
    return (await get<string>(KEYS.DRIVE_URL)) || 'https://s.id/drive-ptk-x10';
  }

  public static async setDriveUrl(url: string): Promise<void> {
    await set(KEYS.DRIVE_URL, url.trim());
  }
}
```

---

### 3.8 Layanan Ekspor Data Formatif & Web Share API (`AssessmentExportService.ts`)
Mengotomatisasi penamaan file standar dan pengunggahan 2-ketukan ke Google Drive di perangkat seluler:

```typescript
// src/services/AssessmentExportService.ts
import { StorageService } from './StorageService';

export class AssessmentExportService {
  public static async generateCsvData(): Promise<{ filename: string; content: string }> {
    const session = await StorageService.getSession();
    const cycle = await StorageService.getCycleState();
    
    const pairId = session?.pairId || 'Meja00';
    const s1 = session?.student1Name ? `${session.student1Name}${session.student1Absen}` : 'S1';
    const s2 = session?.student2Name ? `${session.student2Name}${session.student2Absen}` : 'S2';
    const filename = `iobranch_S${cycle}_${pairId}_${s1}_${s2}.csv`;

    const headers = [
      'Timestamp', 'Siklus', 'PairId', 'Murid1', 'AbsenMurid1', 
      'Murid2', 'AbsenMurid2', 'TeamSymbol', 'TotalXP', 'CurrentLevel'
    ].join(',');

    const row = [
      new Date().toISOString(),
      cycle,
      session?.pairId || '',
      session?.student1Name || '',
      session?.student1Absen || 0,
      session?.student2Name || '',
      session?.student2Absen || 0,
      session?.teamSymbol || 'algoritma',
      session?.totalXp || 0,
      session?.currentLevel || 1
    ].join(',');

    return { filename, content: `${headers}\n${row}\n` };
  }

  public static async exportToDrive(customDriveUrl?: string): Promise<void> {
    const targetUrl = customDriveUrl || (await StorageService.getDriveUrl());
    const { filename, content } = await this.generateCsvData();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], filename, { type: 'text/csv' });

    // Jalur Utama: Web Share API untuk HP Android / iOS (Simpan langsung ke Google Drive App)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Rekap Formatif iobranch',
          text: `Data formatif pembelajaran pasangan ${filename}`
        });
        return;
      } catch {
        // Fallback jika dibatalkan atau tidak diizinkan sistem
      }
    }

    // Jalur Cadangan: Unduh file CSV lokal + buka link Google Drive di tab baru
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    window.open(targetUrl, '_blank');
  }
}
```

---

## 4. Spesifikasi Desain Antarmuka & Token Visual Anti-Slop (SSOT: `DESIGN.md`)

Mengikuti pedoman [anti-slop](https://github.com/miqdadbadjuber/anti-slop) dan acuan baku `DESIGN.md`:

```css
/* src/style.css - Official Design Tokens */
:root {
  /* Surface Tokens */
  --bg-app: #081026;
  --bg-canvas: #090e17;
  --surface-panel: #0b132b;
  --surface-panel-alt: #131d2e;
  --surface-code: #050b14;
  --border-retro: #2a3a54;
  --border-focus: #38b2f6;

  /* Brand & Action Tokens */
  --brand-cyan: #38b2f6;
  --cta-gold: #f59e0b;
  --cta-gold-dark: #d97706;

  /* State Tokens: Logika Boolean */
  --color-true-bg: rgba(16, 185, 129, 0.18);
  --color-true-border: #10b981;
  --color-true-text: #34d399;

  --color-false-bg: rgba(239, 68, 68, 0.18);
  --color-false-border: #ef4444;
  --color-false-text: #f87171;

  --color-skipped-opacity: 0.35;
  --color-gold-star: #f59e0b;

  /* Typography */
  --font-pixel: 'Press Start 2P', monospace;
  --font-code: 'JetBrains Mono', 'Consolas', monospace;
  --font-ui: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 5. Strategi PWA, Service Worker, & Deployment Vercel

### 5.1 Konfigurasi `vite.config.ts` (Workbox Integration)
```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/**/*', 'public/assets/**/*'],
      manifest: {
        name: 'iobranch - Belajar Percabangan Logika',
        short_name: 'iobranch',
        description: 'Media PWA Gamifikasi Pembelajaran Percabangan 2D Pixel untuk Informatika SMA',
        theme_color: '#090e17',
        background_color: '#090e17',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/assets/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,json,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'iobranch_images_cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ]
});
```

### 5.2 Konfigurasi Penggelaran Vercel (`vercel.json`)
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 6. Uji Ketahanan Sistem & Penanganan Kasus Ekstrem (*Resilience Tests*)

Sesuai standar Craftsmanship Anti-Slop **C-4 (Resilience)**:
1. **Validasi Input Ekstrem:**
   * Input teks huruf pada kotak angka otomatis dibersihkan / ditolak.
   * Input angka negatif atau 0 tetap diproses secara matematis benar tanpa memicu error `NaN`.
2. **Uji Layar Sempit (Resolusi 360 px):**
   * Di layar HP sempit, canvas game otomatis menyesuaikan aspek rasio, dan form kontrol di bawahnya dapat di-scroll vertikal secara mulus tanpa elemen tombol terpotong.
3. **Uji Mode Pesawat (*Airplane Mode Test*):**
   * Saat internet dimatikan total, murid dapat memuat ulang aplikasi dan seluruh aset gambar tileset, suara 8-bit, serta data soal tetap dapat dijalankan 100% luring.
4. **Uji Pergantian Perangkat (*Device Switch Test*):**
   * Tombol "Ganti Pasangan" menghapus sesi di `IndexedDB` dan membawa aplikasi kembali ke layar Onboarding tanpa merusak file cache aplikasi.

---

## 7. Matriks Penyelarasan Riset Tindakan Kelas (PTK Traceability)

| Komponen Teknis `iobranch` | Korelasi Langsung pada PTK Kelas X-10 |
|---|---|
| **Peta Persimpangan Tiled & Hero Waypoint** | Membantu murid memvisualisasikan eksekusi baris kondisi secara konkret, mendukung pencapaian **IKTP-1 (Konsep & Operator)**. |
| **Stepper Penyorot Baris Kode & Dimmed Branch** | Melatih keterampilan penalaran langkah demi langkah secara mendalam, mendukung pencapaian **IKTP-2 (Code Tracing & Jalur)**. |
| **Adaptive Scaffolding Hint di Kotak Konsol** | Membimbing murid merefleksikan letak kesalahan logika saat tebakan meleset, mendukung pencapaian **IKTP-3 (Analisis Kesalahan)**. |
| **Branch Coverage 2-Star Badge System** | Memotivasi pasangan murid menguji seluruh percabangan (`IF` dan `ELSE`), mendukung pencapaian **IKTP-4 (Kasus Uji Menyeluruh)**. |
| **Offline PWA + Workbox + IndexedDB** | Menjamin kelancaran intervensi tindakan di kelas tanpa hambatan kuota, mendukung peningkatan nilai **$N\text{-Gain} \ge 0{,}30$**. |
| **Estetika 2D Pixel Art Retro GBA** | Menciptakan suasana belajar yang menggembirakan (*Joyful Learning*), mendukung capaian **Angket Persepsi Media ($\text{Rerata} \ge 3{,}00$)**. |

---

## 8. Status Dokumen & Langkah Selanjutnya

Dokumen `SDD.md` ini telah resmi menetapkan seluruh cetak biru rekayasa perangkat lunak untuk aplikasi **`iobranch`**. Dokumen ini menjadi acuan mutlak sebelum tahap implementasi kode program dimulai pada sesi kerja berikutnya.
