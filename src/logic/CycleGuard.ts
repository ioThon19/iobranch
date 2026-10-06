// src/logic/CycleGuard.ts - Pengunci Modul Siklus PTK & PIN Guru (SSOT: SDD.md Section 3.5)
import { EventCenter } from '../game/EventCenter';
import { StorageService } from '../services/StorageService';

/**
 * Sidik jari kriptografis SHA-256 PIN resmi fasilitator guru.
 * Menyimpan hash alih-alih teks polos untuk mencegah pembacaan string rahasia di bundle klien.
 */
export const TEACHER_PIN_HASHES: readonly string[] = [
  '7f42f76dcdf8690a92ce03c21c0676bee45db04c544d59292a3a8d0f489f2a26', // Hash SHA-256 untuk 'PTK'
  '331376f0642e1d61df2481484f5379fcb76752a65d63af3b403baec2bca39217'  // Hash SHA-256 untuk 'PTK10'
];

export const TEACHER_SECRET_PINS = TEACHER_PIN_HASHES;

/**
 * Menghitung hash SHA-256 secara aman menggunakan Web Crypto API peramban
 */
async function computeSha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Abaikan jika peramban membatasi Web Crypto
    }
  }
  return '';
}

export class CycleGuard {
  /**
   * Token kelas yang diizinkan untuk murid membuka Siklus 2 secara mandiri
   */
  public static readonly VALID_STUDENT_TOKENS = ['SIKLUS2', 'S1KLUS2'];

  /**
   * Memverifikasi token kelas yang diinput murid untuk membuka Siklus 2
   */
  public static async verifyStudentToken(tokenInput: string): Promise<boolean> {
    if (!tokenInput) return false;
    const clean = tokenInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
    const isValid = CycleGuard.VALID_STUDENT_TOKENS.includes(clean);
    if (isValid) {
      await this.updateCycleAndDrive(2);
    }
    return isValid;
  }

  /**
   * Memverifikasi PIN rahasia guru untuk membuka modal kendali guru melalui pencocokan hash
   */
  public static async verifyTeacherPin(pinInput: string): Promise<boolean> {
    if (!pinInput) return false;
    const clean = pinInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
    const hashed = await computeSha256(clean);
    const isValid = TEACHER_PIN_HASHES.includes(hashed);
    if (isValid) {
      EventCenter.emit('TEACHER_PANEL_OPENED');
    }
    return isValid;
  }

  /**
   * Memperbarui siklus aktif dan URL Google Drive pengumpulan tugas
   */
  public static async updateCycleAndDrive(cycle: 1 | 2, customDriveUrl?: string): Promise<void> {
    await StorageService.setCycleState(cycle);
    if (customDriveUrl && customDriveUrl.trim() !== '') {
      await StorageService.setDriveUrl(customDriveUrl.trim());
    }
    EventCenter.emit('CYCLE_UNLOCKED', cycle);
  }

  /**
   * Memeriksa apakah suatu modul diizinkan untuk dibuka berdasarkan siklus aktif
   */
  public static isModuleUnlocked(cycleRequired: 1 | 2, activeCycle: number): boolean {
    if (cycleRequired === 1) return true;
    return activeCycle >= 2;
  }
}
