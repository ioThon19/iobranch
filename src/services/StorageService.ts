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
    await safeDel(STORAGE_KEYS.SESSION);
    await safeDel(STORAGE_KEYS.PROGRESSION);
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
   * Menyimpan kemajuan pengujian jalur kondisi (branch coverage) dan memberi hadiah XP
   */
  public static async saveModuleCoverage(
    moduleId: string,
    branches: string[],
    xpReward = 0
  ): Promise<ModuleProgress> {
    const progressMap = (await safeGet<Record<string, ModuleProgress>>(STORAGE_KEYS.PROGRESS, {})) || {};
    const prevProgress = progressMap[moduleId];
    const prevBranches = prevProgress ? prevProgress.testedBranches : [];
    const mergedBranches = Array.from(new Set([...prevBranches, ...branches]));
    const stars = mergedBranches.length >= 2 ? 2 : mergedBranches.length;
    const isCompleted = mergedBranches.length >= 2;

    const updatedModule: ModuleProgress = {
      testedBranches: mergedBranches,
      stars,
      isCompleted,
      xpEarned: (prevProgress ? prevProgress.xpEarned : 0) + xpReward,
      updatedAt: Date.now()
    };

    progressMap[moduleId] = updatedModule;
    await safeSet(STORAGE_KEYS.PROGRESS, progressMap);

    // Tandai langkah tracing selesai jika sudah menguji cabang
    if (mergedBranches.length >= 1) {
      await this.saveProgressionState({ stepTracingCompleted: true });
    }

    // Perbarui akumulasi XP dan level pada sesi pasangan jika ada reward
    const currentSession = await this.getSession();
    if (currentSession && xpReward > 0) {
      currentSession.totalXp += xpReward;
      currentSession.currentLevel = Math.floor(currentSession.totalXp / 100) + 1;
      await this.saveSession(currentSession);
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
    const saved = await safeGet<FormativeScores>(STORAGE_KEYS.FORMATIVE_SCORES);

    const cycle = await this.getCycleState();
    const isCycle2 = cycle === 2;

    // 1. Nilai Telusur (0–100): Ketercapaian Bintang 2 pada modul kasus aktif
    const starsMod1 = allProgress['m01']?.stars || allProgress['kasus-1']?.stars || 0;
    const starsMod2 = allProgress['m02']?.stars || allProgress['kasus-2']?.stars || 0;
    const starsMod3 = allProgress['m03']?.stars || allProgress['kasus-3']?.stars || 0;
    const starsMod4 = allProgress['m04']?.stars || 0;
    const starsMod5 = allProgress['m05']?.stars || 0;

    let tracingScore = 0;
    if (isCycle2) {
      // Siklus 2: 5 Modul (m01..m05), total 10 bintang = 100 poin
      const totalStars = starsMod1 + starsMod2 + starsMod3 + starsMod4 + starsMod5;
      tracingScore = Math.min(100, Math.round((totalStars / 10) * 100));
    } else {
      // Siklus 1: 3 Modul (m01..m03), total 6 bintang = 100 poin
      const totalStars = starsMod1 + starsMod2 + starsMod3;
      tracingScore = Math.min(100, Math.round((totalStars / 6) * 100));
    }

    // 2. Nilai Tantangan (0–100): Selesai 5 ronde pertempuran logika
    const isBattleDone = !!(progState.stepBattleCompleted || saved?.isBattleLocked);
    const battleScore = saved?.isBattleLocked ? saved.battleScore : (isBattleDone ? 100 : 0);

    // 3. Nilai Evaluasi (0–100): 5 soal pilihan ganda konseptual (20 poin/soal)
    const evaluasiScore = saved?.evaluasiScore ?? 0;
    const evaluasiAttemptCount = saved?.evaluasiAttemptCount ?? (progState.stepEvaluationCompleted ? 1 : 0);
    const isEvaluasiLocked = saved?.isEvaluasiLocked ?? progState.stepEvaluationCompleted;

    // Nilai Formatif Akhir: Rata-rata 3 pilar (skala 1–100)
    const finalScore = Math.round((tracingScore + battleScore + evaluasiScore) / 3);

    const scores: FormativeScores = {
      tracingScore,
      battleScore,
      evaluasiScore,
      finalScore,
      evaluasiAttemptCount,
      isEvaluasiLocked,
      isBattleLocked: isBattleDone,
      evaluasiAnswers: saved?.evaluasiAnswers,
      updatedAt: saved?.updatedAt ?? Date.now()
    };

    return scores;
  }

  /**
   * Mencatat nilai tantangan pada percobaan pertama (First-Attempt Lock)
   */
  public static async recordFirstAttemptBattle(score = 100): Promise<FormativeScores> {
    const current = await this.getFormativeScores();
    if (current.isBattleLocked) {
      // Nilai resmi telah terkunci, abaikan penimpaan nilai
      return current;
    }

    const updated: FormativeScores = {
      ...current,
      battleScore: score,
      isBattleLocked: true,
      finalScore: Math.round((current.tracingScore + score + current.evaluasiScore) / 3),
      updatedAt: Date.now()
    };

    await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
    return updated;
  }

  /**
   * Mencatat nilai kuis evaluasi 5 soal pada percobaan pertama (First-Attempt Lock)
   */
  public static async recordFirstAttemptEvaluasi(
    correctAnswersCount: number,
    totalQuestions = 5,
    answers: number[] = []
  ): Promise<FormativeScores> {
    const current = await this.getFormativeScores();

    if (current.isEvaluasiLocked) {
      // Sesi latihan berikutnya: pertahankan nilai formatif resmi, catat jumlah percobaan
      const updated: FormativeScores = {
        ...current,
        evaluasiAttemptCount: current.evaluasiAttemptCount + 1,
        updatedAt: Date.now()
      };
      await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
      return updated;
    }

    // Pengerjaan pertama kali: hitung dan kunci nilai resmi (20 poin/soal)
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

    await safeSet(STORAGE_KEYS.FORMATIVE_SCORES, updated);
    return updated;
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

    const starsMod1 = mod1?.stars || 0;
    const starsMod2 = mod2?.stars || 0;
    const starsMod3 = mod3?.stars || 0;

    const branchesMod1 = (mod1?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod2 = (mod2?.testedBranches || []).join(', ') || 'Belum Diuji';
    const branchesMod3 = (mod3?.testedBranches || []).join(', ') || 'Belum Diuji';

    const formatRow = (label: string, value: string | number, width = 68): string => {
      const line = `|  ${label.padEnd(46, ' ')} : ${String(value).padStart(16, ' ')}  |`;
      return line.slice(0, width + 2);
    };

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
      formatRow(`1. Nilai Telusur (${cycle === 2 ? 'Modul 1-5' : 'Modul 1-3'})`, `${formative.tracingScore} / 100`),
      formatRow('2. Nilai Tantangan (Battle 5 Ronde Logika)', `${formative.battleScore} / 100`),
      formatRow('3. Nilai Evaluasi (5 Soal Pilihan Ganda)', `${formative.evaluasiScore} / 100`),
      '----------------------------------------------------------------------',
      formatRow('NILAI FORMATIF AKHIR (RATA-RATA 3 PILAR)', `${formative.finalScore} / 100`),
      formatRow('Status Penilaian Resmi', formative.isEvaluasiLocked ? 'TUNTAS (Percobaan Pertama Terkunci)' : 'PROSES PENGERJAAN'),
      formatRow('Frekuensi Percobaan Evaluasi', `${formative.evaluasiAttemptCount} kali`),
      '----------------------------------------------------------------------',
      '                 RINCIAN CAKUPAN PENGUJIAN CABANG (TELUSUR)            ',
      '----------------------------------------------------------------------',
      formatRow('Modul 1: Percabangan Tunggal IF (Stars)', `${starsMod1} / 2 Bintang`),
      formatRow('         Jalur Cabang Teruji', branchesMod1),
      formatRow('Modul 2: Percabangan Ganda IF-ELSE (Stars)', `${starsMod2} / 2 Bintang`),
      formatRow('         Jalur Cabang Teruji', branchesMod2),
      formatRow('Modul 3: Studi Kasus Kontekstual (Stars)', `${starsMod3} / 2 Bintang`),
      formatRow('         Jalur Cabang Teruji', branchesMod3),
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


