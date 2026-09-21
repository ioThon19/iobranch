// src/logic/CycleGuard.ts - Pengunci Modul Siklus PTK & PIN Guru (SSOT: SDD.md Section 3.5)
import { EventCenter } from '../game/EventCenter';
import { StorageService } from '../services/StorageService';

export const TEACHER_SECRET_PIN = 'PTK';

export class CycleGuard {
  /**
   * Token kelas yang diizinkan untuk murid membuka Siklus 2 secara mandiri
   */
  public static readonly VALID_STUDENT_TOKENS = ['S1KLUS2'];

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
   * Memverifikasi PIN rahasia guru untuk membuka modal kendali guru
   */
  public static async verifyTeacherPin(pinInput: string): Promise<boolean> {
    if (!pinInput) return false;
    const clean = pinInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
    const isValid = clean === TEACHER_SECRET_PIN.toUpperCase();
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
