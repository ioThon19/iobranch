// src/services/StorageService.ts - Penyimpanan Asinkronus Lokal IndexedDB (SSOT: SDD.md Section 3.7)
import { get, set, del } from 'idb-keyval';
import { StudentSession, ModuleProgress, ProgressionState, FormativeScores } from '../types/session.types';

const STORAGE_KEYS = {
  SESSION: 'iobranch_session',
  PROGRESS: 'iobranch_progress',
  CYCLE: 'iobranch_active_cycle',
  DRIVE_URL: 'iobranch_drive_url',
  PROGRESSION: 'iobranch_progression_state',
  READ_MATERI: 'iobranch_read_materi',
  FORMATIVE_SCORES: 'iobranch_formative_scores'
} as const;

// In-memory fallback untuk ketahanan lingkungan tanpa IndexedDB (misal: private mode ketat atau test runner)
const memoryStore = new Map<string, unknown>();

async function safeGet<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  try {
    const val = await get<T>(key);
    if (val !== undefined) return val;
  } catch {
    // Fallback ke in-memory cache
  }
  return (memoryStore.get(key) as T) ?? defaultValue;
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  memoryStore.set(key, value);
  try {
    await set(key, value);
  } catch {
    // Operasi tetap aman di memori lokal
  }
}

async function safeDel(key: string): Promise<void> {
  memoryStore.delete(key);
  try {
    await del(key);
  } catch {
    // Abaikan jika tidak didukung
  }
}

export class StorageService {
  private static progressionMemoryCache: ProgressionState | null = null;
  private static progressionWritePromise: Promise<ProgressionState> | null = null;
  private static formativeMemoryCache: FormativeScores | null = null;
  private static formativeWritePromise: Promise<FormativeScores> | null = null;

  /**
   * Menyimpan sesi pasangan murid
   */
  public static async saveSession(session: StudentSession): Promise<void> {
    await safeSet(STORAGE_KEYS.SESSION, session);
  }

  /**
   * Mengambil sesi pasangan murid yang sedang aktif
   */
  public static async getSession(): Promise<StudentSession | undefined> {
    return await safeGet<StudentSession>(STORAGE_KEYS.SESSION);
  }

  /**
   * Menghapus sesi aktif (saat ganti pasangan)
   */
  public static async clearSession(): Promise<void> {
    this.progressionMemoryCache = null;
    this.formativeMemoryCache = null;
    await safeDel(STORAGE_KEYS.SESSION);
    await safeDel(STORAGE_KEYS.PROGRESSION);
    await safeDel(STORAGE_KEYS.FORMATIVE_SCORES);
  }

  /**
   * Mengambil status alur bertahap (Strict Progression Gating)
   */
  public static async getProgressionState(): Promise<ProgressionState> {
    const session = await this.getSession();
    const hasSession = !!(session && session.student1Name && session.student2Name);
    const defaultState: ProgressionState = {
      stepGuideCompleted: hasSession,
      stepRegistrationCompleted: hasSession,
      stepDialogCompleted: false,
      stepMaterialCompleted: false,
      stepTracingCompleted: false,
      stepBattleCompleted: false,
      stepEvaluationCompleted: false,
      teacherBypassMode: false
    };

    const saved = this.progressionMemoryCache ?? (await safeGet<Partial<ProgressionState>>(STORAGE_KEYS.PROGRESSION));
    if (!saved) return defaultState;

    const merged: ProgressionState = {
      ...defaultState,
      ...saved,
      // Pastikan registrasi dan panduan sinkron dengan keberadaan sesi
      stepGuideCompleted: hasSession || !!saved.stepGuideCompleted,
      stepRegistrationCompleted: hasSession || !!saved.stepRegistrationCompleted
    };
    this.progressionMemoryCache = merged;
    return merged;
  }

  /**
   * Menyimpan pembaruan status alur bertahap secara serial dan atomik
   */
  public static async saveProgressionState(partial: Partial<ProgressionState>): Promise<ProgressionState> {
    const executeSave = async (): Promise<ProgressionState> => {
      const current = await this.getProgressionState();
      const updated: ProgressionState = {
        ...current,
        ...partial
      };
      this.progressionMemoryCache = updated;
      await safeSet(STORAGE_KEYS.PROGRESSION, updated);
      return updated;
    };

    const nextPromise = (this.progressionWritePromise ?? Promise.resolve(null as unknown as ProgressionState))
      .then(() => executeSave(), () => executeSave());
    this.progressionWritePromise = nextPromise;
    return await nextPromise;
  }

  /**
   * Mengaktifkan atau menonaktifkan Mode Pengujian Bebas Khusus Guru
   */
  public static async setTeacherBypassMode(enabled: boolean): Promise<ProgressionState> {
    return await this.saveProgressionState({ teacherBypassMode: enabled });
  }

  /**
   * Menyimpan kemajuan pengujian jalur kondisi (branch coverage)
   */
  public static async saveModuleCoverage(
    moduleId: string,
    branches: string[],
    _reward = 0,
    exploredBranches?: string[]
  ): Promise<ModuleProgress> {
    const progressMap = (await safeGet<Record<string, ModuleProgress>>(STORAGE_KEYS.PROGRESS, {})) || {};
    const prevProgress = progressMap[moduleId];
    const prevBranches = prevProgress ? prevProgress.testedBranches : [];
    const mergedBranches = Array.from(new Set([...prevBranches, ...branches]));
    const stars = mergedBranches.length >= 2 ? 2 : (mergedBranches.length >= 1 ? 1 : 0);
    const isCompleted = mergedBranches.length >= 1;

    // Gabungkan exploredBranches (terpisah dari testedBranches, tidak memberi nilai)
    const prevExplored = prevProgress?.exploredBranches || [];
    const mergedExplored = exploredBranches
      ? Array.from(new Set([...prevExplored, ...exploredBranches]))
      : prevExplored;

    const updatedModule: ModuleProgress = {
      testedBranches: mergedBranches,
      exploredBranches: mergedExplored,
      stars,
      isCompleted,
      xpEarned: 0,
      updatedAt: Date.now()
    };

    progressMap[moduleId] = updatedModule;
    await safeSet(STORAGE_KEYS.PROGRESS, progressMap);

    // Tandai langkah tracing selesai jika sudah menguji cabang (benar ATAU sekedar dijelajahi)
    if (mergedBranches.length >= 1 || mergedExplored.length >= 1) {
      await this.saveProgressionState({ stepTracingCompleted: true });
    }

    return updatedModule;
  }


  /**
   * Mengambil data progres untuk modul tertentu
   */
  public static async getModuleProgress(moduleId: string): Promise<ModuleProgress | undefined> {
    const progressMap = await safeGet<Record<string, ModuleProgress>>(STORAGE_KEYS.PROGRESS, {});
    return progressMap?.[moduleId];
  }

  /**
   * Mengambil seluruh data progres modul
   */
  public static async getAllProgress(): Promise<Record<string, ModuleProgress>> {
    return (await safeGet<Record<string, ModuleProgress>>(STORAGE_KEYS.PROGRESS, {})) || {};
  }

  /**
   * Mengambil status siklus aktif (1 = Siklus I, 2 = Siklus II)
   */
  public static async getCycleState(): Promise<number> {
    const cycle = await safeGet<number>(STORAGE_KEYS.CYCLE, 1);
    return cycle === 2 ? 2 : 1;
  }

  /**
   * Memperbarui status siklus aktif
   */
  public static async setCycleState(cycle: 1 | 2): Promise<void> {
    await safeSet(STORAGE_KEYS.CYCLE, cycle);
  }

  /**
   * Mengambil URL Google Drive tujuan pengumpulan
   */
  /**
   * Mengambil URL Google Drive tujuan pengumpulan (default: https://s.id/progres-siklus1)
   */
  public static async getDriveUrl(): Promise<string> {
    return (await safeGet<string>(STORAGE_KEYS.DRIVE_URL, 'https://s.id/progres-siklus1')) || 'https://s.id/progres-siklus1';
  }

  /**
   * Memperbarui URL Google Drive tujuan pengumpulan
   */
  public static async setDriveUrl(url: string): Promise<void> {
    await safeSet(STORAGE_KEYS.DRIVE_URL, url.trim());
  }

  /**
   * Mengambil daftar ID materi yang telah dipelajari/dibaca murid
   */
  public static async getReadMateriIds(): Promise<string[]> {
    return (await safeGet<string[]>(STORAGE_KEYS.READ_MATERI, [])) || [];
  }

  /**
   * Menandai suatu ID materi telah dibuka dan dibaca oleh murid
   */
  public static async markMateriAsRead(materiId: string): Promise<string[]> {
    const current = await this.getReadMateriIds();
    if (!current.includes(materiId)) {
      const updated = [...current, materiId];
      await safeSet(STORAGE_KEYS.READ_MATERI, updated);
      return updated;
    }
    return current;
  }

  /**
   * Mengambil kalkulasi realtime nilai formatif 3 pilar (Skala 1–100)
   */
  public static async getFormativeScores(): Promise<FormativeScores> {
    const allProgress = await this.getAllProgress();
    const progState = await this.getProgressionState();
    const saved = this.formativeMemoryCache ?? (await safeGet<FormativeScores>(STORAGE_KEYS.FORMATIVE_SCORES));

    const cycle = await this.getCycleState();
    const isCycle2 = cycle === 2;

    // 1. Nilai Telusur (0–100): Sistem Pembobotan Kasus Kontekstual Sesuai Siklus Aktif
    const isMod1Done = (allProgress['m01']?.testedBranches?.length || 0) >= 1 || !!allProgress['m01']?.isCompleted;
    const isMod2Done = (allProgress['m02']?.testedBranches?.length || 0) >= 1 || !!allProgress['m02']?.isCompleted;
    const isMod3Done = (allProgress['m03']?.testedBranches?.length || 0) >= 1 || !!allProgress['m03']?.isCompleted;
    const isMod4Done = (allProgress['m04']?.testedBranches?.length || 0) >= 1 || !!allProgress['m04']?.isCompleted;
    const isMod5Done = (allProgress['m05']?.testedBranches?.length || 0) >= 1 || !!allProgress['m05']?.isCompleted;

    let tracingScore = 0;
    if (isCycle2) {
      // Siklus 2: 5 Kasus (Kasus 1: 15, Kasus 2: 15, Kasus 3: 20, Kasus 4: 25, Kasus 5: 25) -> Total 100
      if (isMod1Done) tracingScore += 15;
      if (isMod2Done) tracingScore += 15;
      if (isMod3Done) tracingScore += 20;
      if (isMod4Done) tracingScore += 25;
      if (isMod5Done) tracingScore += 25;
    } else {
      // Siklus 1: 3 Kasus Wajib (Kasus 1: 30, Kasus 2: 30, Kasus 3: 40) -> Total 100
      if (isMod1Done) tracingScore += 30;
      if (isMod2Done) tracingScore += 30;
      if (isMod3Done) tracingScore += 40;
    }
    tracingScore = Math.min(100, tracingScore);

    // 2. Nilai Tantangan (0–100): Selesai 5 ronde pertempuran logika
    const isBattleDone = !!(progState.stepBattleCompleted || saved?.isBattleLocked);
    const battleScore = saved?.isBattleLocked ? saved.battleScore : (isBattleDone ? 100 : 0);

    // 3. Nilai Evaluasi (0–100): 5 soal pilihan ganda konseptual (20 poin/soal)
    const evaluasiScore = saved?.evaluasiScore ?? 0;
    const evaluasiAttemptCount = saved?.evaluasiAttemptCount ?? (progState.stepEvaluationCompleted ? 1 : 0);
    const isEvaluasiLocked = saved?.isEvaluasiLocked ?? progState.stepEvaluationCompleted;

    // Kunci nilai telusur resmi: jika sudah dikunci, gunakan skor tersimpan
    const isTracingLocked = saved?.isTracingLocked ?? false;
    const lockedTracingScore = isTracingLocked ? (saved?.tracingScore ?? tracingScore) : tracingScore;

    // Nilai Formatif Akhir: Rata-rata 3 pilar (skala 1–100)
    const finalScore = Math.round((lockedTracingScore + battleScore + evaluasiScore) / 3);

    const scores: FormativeScores = {
      tracingScore: lockedTracingScore,
      battleScore,
      evaluasiScore,
      finalScore,
      evaluasiAttemptCount,
      isTracingLocked,
      isEvaluasiLocked,
      isBattleLocked: isBattleDone,
      evaluasiAnswers: saved?.evaluasiAnswers,
      updatedAt: saved?.updatedAt ?? Date.now()
    };

    this.formativeMemoryCache = scores;
    return scores;
  }

  /**
   * Mengambil jumlah bintang capaian telusur berdasarkan skor formatif telusur dan siklus aktif:
   * - Siklus 1: Selesai Kasus 1 & 2 (Skor >= 60) = 1 Bintang; Selesai Kasus 3 (Skor 100) = 2 Bintang.
   * - Siklus 2: Selesai Kasus 1, 2, & 3 (Skor >= 50) = 1 Bintang; Selesai seluruh 5 kasus (Skor 100) = 2 Bintang.
   */
  public static getTracingStars(tracingScore: number, isCycle2 = false): number {
    if (isCycle2) {
      if (tracingScore >= 100) return 2;
      if (tracingScore >= 50) return 1;
      return 0;
    } else {
      if (tracingScore >= 100) return 2;
      if (tracingScore >= 60) return 1;
      return 0;
    }
  }

  /**
   * Mencatat nilai telusur pada percobaan pertama (First-Attempt Lock)
   * Dipanggil saat murid pertama kali menyelesaikan semua kasus siklus aktif.
   */
  public static async recordFirstAttemptTracing(score: number): Promise<FormativeScores> {
    const execute = async (): Promise<FormativeScores> => {
      const current = await this.getFormativeScores();
      if (current.isTracingLocked) {
        return current;
      }
      const updated: FormativeScores = {
        ...current,
        tracingScore: score,
        isTracingLocked: true,
        finalScore: Math.round((score + current.battleScore + current.evaluasiScore) / 3),
        updatedAt: Date.now()
      };
      this.formativeMemoryCache = updated;
      await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
      return updated;
    };
    const nextPromise = (this.formativeWritePromise ?? Promise.resolve(null as unknown as FormativeScores))
      .then(() => execute(), () => execute());
    this.formativeWritePromise = nextPromise;
    return await nextPromise;
  }

  /**
   * Mencatat nilai tantangan pada percobaan pertama (First-Attempt Lock)
   */
  public static async recordFirstAttemptBattle(score = 100): Promise<FormativeScores> {
    const execute = async (): Promise<FormativeScores> => {
      const current = await this.getFormativeScores();
      if (current.isBattleLocked) {
        return current;
      }

      const updated: FormativeScores = {
        ...current,
        battleScore: score,
        isBattleLocked: true,
        finalScore: Math.round((current.tracingScore + score + current.evaluasiScore) / 3),
        updatedAt: Date.now()
      };

      this.formativeMemoryCache = updated;
      await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
      return updated;
    };

    const nextPromise = (this.formativeWritePromise ?? Promise.resolve(null as unknown as FormativeScores))
      .then(() => execute(), () => execute());
    this.formativeWritePromise = nextPromise;
    return await nextPromise;
  }

  /**
   * Mencatat nilai kuis evaluasi 5 soal pada percobaan pertama (First-Attempt Lock)
   */
  public static async recordFirstAttemptEvaluasi(
    correctAnswersCount: number,
    totalQuestions = 5,
    answers: number[] = []
  ): Promise<FormativeScores> {
    const execute = async (): Promise<FormativeScores> => {
      const current = await this.getFormativeScores();

      if (current.isEvaluasiLocked) {
        const updated: FormativeScores = {
          ...current,
          evaluasiAttemptCount: current.evaluasiAttemptCount + 1,
          updatedAt: Date.now()
        };
        this.formativeMemoryCache = updated;
        await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
        return updated;
      }

      const officialScore = Math.min(100, Math.round((correctAnswersCount / totalQuestions) * 100));
      const updated: FormativeScores = {
        ...current,
        evaluasiScore: officialScore,
        evaluasiAttemptCount: 1,
        isEvaluasiLocked: true,
        evaluasiAnswers: answers,
        finalScore: Math.round((current.tracingScore + current.battleScore + officialScore) / 3),
        updatedAt: Date.now()
      };

      this.formativeMemoryCache = updated;
      await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
      return updated;
    };

    const nextPromise = (this.formativeWritePromise ?? Promise.resolve(null as unknown as FormativeScores))
      .then(() => execute(), () => execute());
    this.formativeWritePromise = nextPromise;
    return await nextPromise;
  }

  /**
   * Membuat berkas laporan rekap kemajuan belajar format teks rapi (.txt) berbingkai ASCII
   */
  public static async generateProgressTextReport(): Promise<{ filename: string; content: string }> {
    const session = await this.getSession();
    const cycle = await this.getCycleState();
    const allProgress = await this.getAllProgress();
    const formative = await this.getFormativeScores();
    const driveUrl = await this.getDriveUrl();

    const cleanPairId = session?.pairId
      ? session.pairId.replace(/\s+/g, '_')
      : `Absen${String(session?.student1Absen || 0).padStart(2, '0')}-${String(session?.student2Absen || 0).padStart(2, '0')}`;
    const s1 = session?.student1Name ? session.student1Name.replace(/[^a-zA-Z0-9]/g, '') : 'M1';
    const s2 = session?.student2Name ? session.student2Name.replace(/[^a-zA-Z0-9]/g, '') : 'M2';
    const filename = `iobranch_Siklus${cycle}_${cleanPairId}_${s1}_${s2}.txt`;

    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const mod1 = allProgress['m01'] || allProgress['kasus-1'];
    const mod2 = allProgress['m02'] || allProgress['kasus-2'];
    const mod3 = allProgress['m03'] || allProgress['kasus-3'];
    const mod4 = allProgress['m04'];
    const mod5 = allProgress['m05'];

    const branchesMod1 = (mod1?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod2 = (mod2?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod3 = (mod3?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod4 = (mod4?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod5 = (mod5?.testedBranches || []).join(', ') || 'Belum Diuji';

    const isMod1Done = (mod1?.testedBranches || []).length >= 1 || !!mod1?.isCompleted;
    const isMod2Done = (mod2?.testedBranches || []).length >= 1 || !!mod2?.isCompleted;
    const isMod3Done = (mod3?.testedBranches || []).length >= 1 || !!mod3?.isCompleted;
    const isMod4Done = (mod4?.testedBranches || []).length >= 1 || !!mod4?.isCompleted;
    const isMod5Done = (mod5?.testedBranches || []).length >= 1 || !!mod5?.isCompleted;

    const formatRow = (label: string, value: string | number, width = 68): string => {
      const line = `|  ${label.padEnd(46, ' ')} : ${String(value).padStart(16, ' ')}  |`;
      return line.slice(0, width + 2);
    };

    const moduleRows: string[] = [
      formatRow(`Modul 1: Percabangan IF (Bobot ${cycle === 2 ? '15' : '30'} Poin)`, isMod1Done ? 'TUNTAS' : 'BELUM SELESAI'),
      formatRow('         Jalur Cabang Teruji', branchesMod1),
      formatRow(`Modul 2: Percabangan IF-ELSE (Bobot ${cycle === 2 ? '15' : '30'} Poin)`, isMod2Done ? 'TUNTAS' : 'BELUM SELESAI'),
      formatRow('         Jalur Cabang Teruji', branchesMod2),
      formatRow(`Modul 3: Kasus Kontekstual (Bobot ${cycle === 2 ? '20' : '40'} Poin)`, isMod3Done ? 'TUNTAS' : 'BELUM SELESAI'),
      formatRow('         Jalur Cabang Teruji', branchesMod3)
    ];

    if (cycle === 2) {
      moduleRows.push(
        formatRow('Modul 4: Percabangan Bertingkat (Bobot 25 Poin)', isMod4Done ? 'TUNTAS' : 'BELUM SELESAI'),
        formatRow('         Jalur Cabang Teruji', branchesMod4),
        formatRow('Modul 5: Switch-Case Multi-Kategori (Bobot 25 Poin)', isMod5Done ? 'TUNTAS' : 'BELUM SELESAI'),
        formatRow('         Jalur Cabang Teruji', branchesMod5)
      );
    }

    const tracingStars = StorageService.getTracingStars(formative.tracingScore, cycle === 2);

    const content = [
      '======================================================================',
      '                 LAPORAN HASIL BELAJAR FORMATIF SIKLUS ' + cycle,
      '                          IOBRANCH CODING LAB                         ',
      '======================================================================',
      formatRow('Waktu Pencatatan Laporan', timeString),
      formatRow('Identitas Tim Belajar', session?.pairId || 'Tim Belajar Murid'),
      formatRow('Lambang Tim', (session?.teamSymbol || 'algoritma').toUpperCase()),
      formatRow('Murid 1 (No. Absen)', `${session?.student1Name || 'Murid 1'} (No. ${session?.student1Absen || '-'})`),
      formatRow('Murid 2 (No. Absen)', `${session?.student2Name || 'Murid 2'} (No. ${session?.student2Absen || '-'})`),
      formatRow('Status Ketuntasan Belajar', formative.finalScore >= 75 ? 'TUNTAS (>= KKM 75)' : 'SEDANG BERPROSES'),
      '----------------------------------------------------------------------',
      '                 REKAPITULASI NILAI FORMATIF (SKALA 1-100)            ',
      '----------------------------------------------------------------------',
      formatRow(`1. Nilai Telusur (${cycle === 2 ? 'Modul 1-5' : 'Modul 1-3'})`, `${formative.tracingScore} / 100 (${tracingStars} / 2 Bintang)`),
      formatRow('2. Nilai Tantangan (Battle 5 Ronde Logika)', `${formative.battleScore} / 100`),
      formatRow('3. Nilai Evaluasi (5 Soal Pilihan Ganda)', `${formative.evaluasiScore} / 100`),
      '----------------------------------------------------------------------',
      formatRow('NILAI FORMATIF AKHIR (RATA-RATA 3 PILAR)', `${formative.finalScore} / 100`),
      formatRow('Status Penilaian Resmi', formative.isEvaluasiLocked ? 'TUNTAS (Percobaan Pertama Terkunci)' : 'PROSES PENGERJAAN'),
      formatRow('Frekuensi Percobaan Evaluasi', `${formative.evaluasiAttemptCount} kali`),
      '----------------------------------------------------------------------',
      '                 RINCIAN CAKUPAN PENGUJIAN CABANG (TELUSUR)            ',
      '----------------------------------------------------------------------',
      ...moduleRows,
      '======================================================================',
      formatRow('Tautan Pengumpulan Google Drive Guru', driveUrl),
      '======================================================================',
      'Catatan Guru: Berkas ini disimpan otomatis oleh sistem iobranch sebagai',
      'bukti portofolio pembelajaran formatif murid dalam Siklus ' + cycle + '.',
      '======================================================================\n'
    ].join('\n');

    return { filename, content };
  }
}


