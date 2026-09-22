// src/types/session.types.ts - Definisi Tipe Sesi Pasangan dan Progres (SSOT: SDD.md)

export type TeamSymbol = 'algoritma' | 'biner' | 'matriks' | 'vektor';

export interface StudentSession {
  pairId: string; // ID Pasangan Tim Belajar (contoh: 'Tim Absen 01-02')
  student1Name: string;
  student1Absen: number;
  student2Name: string;
  student2Absen: number;
  teamSymbol: TeamSymbol;
  totalXp: number; // Akumulasi poin pengalaman (default: 0)
  currentLevel: number; // Kalkulasi: Math.floor(totalXp / 100) + 1
  createdAt: number;
}

export interface ModuleProgress {
  testedBranches: string[];   // Cabang yang TERBUKTI BENAR (menentukan nilai/stars)
  exploredBranches?: string[]; // Cabang yang sudah dijelajahi (menentukan akses ke Tantangan)
  stars: number; // 0, 1, atau 2
  isCompleted: boolean;
  xpEarned: number;
  updatedAt: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface ProgressionState {
  stepGuideCompleted: boolean;
  stepRegistrationCompleted: boolean;
  stepDialogCompleted: boolean;
  stepMaterialCompleted: boolean;
  stepTracingCompleted: boolean;
  stepBattleCompleted: boolean;
  stepEvaluationCompleted: boolean;
  teacherBypassMode: boolean;
}

export interface FormativeScores {
  tracingScore: number; // 0 - 100 (berdasarkan pemenuhan bintang 2 pada 3 modul Siklus 1)
  battleScore: number;  // 0 - 100 (berdasarkan keberhasilan 5 ronde pertarungan logika)
  evaluasiScore: number; // 0 - 100 (berdasarkan 5 soal evaluasi konseptual)
  finalScore: number;   // Rata-rata 3 pilar: Math.round((tracing + battle + evaluasi) / 3)
  evaluasiAttemptCount: number;
  isTracingLocked: boolean;  // true = nilai telusur resmi sudah terkunci (first-attempt lock)
  isEvaluasiLocked: boolean;
  isBattleLocked: boolean;
  evaluasiAnswers?: number[];
  updatedAt: number;
}



