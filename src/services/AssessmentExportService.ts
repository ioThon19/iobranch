// src/services/AssessmentExportService.ts - Ekspor Data Formatif & Web Share API (SSOT: SDD.md Section 3.8 & PRD.md FR-10)
import { StorageService } from './StorageService';
import { sanitizeCsvCell } from '../utils/security';

export interface ExportResult {
  filename: string;
  content: string;
  methodUsed: 'web-share' | 'download-fallback';
  success: boolean;
  message: string;
}

export class AssessmentExportService {
  /**
   * Menghasilkan konten CSV dan nama berkas otomatis sesuai format penelitian PTK
   */
  public static async generateCsvData(): Promise<{ filename: string; content: string }> {
    const session = await StorageService.getSession();
    const cycle = await StorageService.getCycleState();
    const allProgress = await StorageService.getAllProgress();

    const cleanPairId = session?.pairId
      ? session.pairId.replace(/\s+/g, '_')
      : `Absen${String(session?.student1Absen || 0).padStart(2, '0')}-${String(session?.student2Absen || 0).padStart(2, '0')}`;
    const s1 = session?.student1Name ? session.student1Name.replace(/[^a-zA-Z0-9]/g, '') : 'M1';
    const s2 = session?.student2Name ? session.student2Name.replace(/[^a-zA-Z0-9]/g, '') : 'M2';
    const filename = `iobranch_Siklus${cycle}_${cleanPairId}_${s1}_${s2}.csv`;

    let totalStars = 0;
    let completedModulesCount = 0;
    Object.values(allProgress).forEach((prog) => {
      totalStars += prog.stars;
      if (prog.isCompleted) completedModulesCount++;
    });

    const formative = await StorageService.getFormativeScores();

    const headers = [
      'Timestamp',
      'Siklus',
      'PairId',
      'Murid1',
      'AbsenMurid1',
      'Murid2',
      'AbsenMurid2',
      'TeamSymbol',
      'NilaiTelusur',
      'NilaiTantangan',
      'NilaiEvaluasi',
      'NilaiFormatifAkhir',
      'StatusKetuntasan',
      'ModulTuntas',
      'BintangTotal'
    ].join(',');

    const row = [
      new Date().toISOString(),
      cycle,
      sanitizeCsvCell(session?.pairId || 'Tim Belajar'),
      sanitizeCsvCell(session?.student1Name || 'Murid 1'),
      session?.student1Absen || 0,
      sanitizeCsvCell(session?.student2Name || 'Murid 2'),
      session?.student2Absen || 0,
      sanitizeCsvCell(session?.teamSymbol || 'algoritma'),
      formative.tracingScore,
      formative.battleScore,
      formative.evaluasiScore,
      formative.finalScore,
      sanitizeCsvCell(formative.finalScore >= 75 ? 'TUNTAS' : 'SEDANG BERPROSES'),
      completedModulesCount,
      totalStars
    ].join(',');

    const content = `${headers}\n${row}\n`;
    return { filename, content };
  }

  /**
   * Menghasilkan konten laporan teks rapi (.txt) dan nama berkas otomatis sesuai format penelitian PTK
   */
  public static async generateTextData(): Promise<{ filename: string; content: string }> {
    return await StorageService.generateProgressTextReport();
  }

  /**
   * Mengirim data formatif ke Google Drive guru via unduhan lokal (.txt) dan pembukaan tautan Google Drive
   */
  public static async exportToDrive(customDriveUrl?: string, preOpenedWindow?: Window | null): Promise<ExportResult> {
    const targetUrl = customDriveUrl || (await StorageService.getDriveUrl());
    const { filename, content } = await this.generateTextData();

    if (typeof window === 'undefined') {
      return {
        filename,
        content,
        methodUsed: 'download-fallback',
        success: true,
        message: 'Data laporan teks berhasil dibuat.'
      };
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });

    // Unduh berkas .txt secara langsung ke perangkat murid
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(objectUrl);

    // Navigasikan atau buka tautan Google Drive guru di tab baru
    if (targetUrl) {
      if (preOpenedWindow && !preOpenedWindow.closed) {
        try {
          preOpenedWindow.location.href = targetUrl;
        } catch {
          // Abaikan jika ada pembatasan cross-origin
        }
      } else {
        try {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } catch {
          // Abaikan jika pemblokir popup aktif
        }
      }
    }

    return {
      filename,
      content,
      methodUsed: 'download-fallback',
      success: true,
      message: 'Berkas laporan .txt berhasil diunduh dan Folder Google Drive Guru dibuka.'
    };
  }
}

