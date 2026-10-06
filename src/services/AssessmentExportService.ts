// src/services/AssessmentExportService.ts - Ekspor Data Formatif & 1-Klik Direct Cloud Upload (SSOT: SDD.md Section 3.8 & PRD.md FR-10)
import { StorageService } from './StorageService';

export interface ExportResult {
  filename: string;
  content: string;
  methodUsed: 'web-share' | 'download-fallback';
  success: boolean;
  message: string;
}

export interface DirectUploadResult {
  filename: string;
  content: string;
  methodUsed: 'direct-cloud' | 'download-fallback';
  success: boolean;
  message: string;
  fileUrl?: string;
  fileId?: string;
  folderName?: string;
  isUpdated?: boolean;
  timestamp?: string;
}

export class AssessmentExportService {

  /**
   * Menghasilkan konten laporan teks rapi (.txt) dan nama berkas otomatis sesuai format penelitian PTK
   */
  public static async generateTextData(): Promise<{ filename: string; content: string }> {
    return await StorageService.generateProgressTextReport();
  }

  /**
   * Mengunduh berkas teks (.txt) secara lokal ke perangkat murid (Zero Data Loss)
   */
  public static triggerLocalDownload(filename: string, content: string): void {
    if (typeof window === 'undefined') return;
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Abaikan jika lingkungan peramban membatasi operasi DOM download
    }
  }

  /**
   * Mengirim data formatif ke Google Drive guru via unduhan lokal (.txt) dan pembukaan tautan Google Drive
   */
  public static async exportToDrive(customDriveUrl?: string, preOpenedWindow?: Window | null): Promise<ExportResult> {
    const cycle = await StorageService.getCycleState();
    const targetUrl = customDriveUrl || (await StorageService.getDriveUrl(cycle));
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

    // Unduh berkas .txt secara langsung ke perangkat murid
    this.triggerLocalDownload(filename, content);

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

  /**
   * Mengirim data laporan formatif langsung ke Google Drive guru via Web API Google Apps Script (1-Klik Direct Cloud Upload).
   * Secara otomatis melakukan pencadangan unduhan .txt lokal di gawai murid guna menjamin nol risiko kehilangan data.
   */
  public static async uploadDirectToDrive(
    customEndpointUrl?: string,
    customFolderId?: string
  ): Promise<DirectUploadResult> {
    const cycle = await StorageService.getCycleState();
    const session = await StorageService.getSession();
    const formative = await StorageService.getFormativeScores(cycle);
    const { filename, content } = await this.generateTextData();

    // 1. Selalu unduh cadangan lokal di gawai murid (Nol Risiko Kehilangan Data)
    this.triggerLocalDownload(filename, content);

    // 2. Ambil URL Web App Google Apps Script
    const endpoint = (customEndpointUrl || (await StorageService.getGasApiUrl())).trim();

    if (!endpoint) {
      return {
        filename,
        content,
        methodUsed: 'download-fallback',
        success: false,
        message: 'Endpoint Google Apps Script belum diatur guru. Berkas laporan .txt telah diunduh ke gawai murid.'
      };
    }

    // 3. Susun data payload pengiriman
    const isIndividual = !!(session?.studentName && session?.studentAbsen);
    const studentAbsen = isIndividual
      ? String(session?.studentAbsen || '-')
      : (session?.student1Absen ? `${session.student1Absen} & ${session.student2Absen}` : '-');

    const studentName = isIndividual
      ? (session?.studentName || 'Murid')
      : (session?.pairId ? `${session.student1Name || 'M1'} & ${session.student2Name || 'M2'}` : 'Murid');

    // Deteksi jika guru menetapkan custom folder id atau url kustom
    let targetCustomFolderId = customFolderId ? StorageService.extractDriveFolderId(customFolderId) : '';
    if (!targetCustomFolderId) {
      const activeDriveUrl = await StorageService.getDriveUrl(cycle);
      const extractedId = StorageService.extractDriveFolderId(activeDriveUrl);
      const defaultCycleFolderId = cycle === 2 ? '1r_GqGTE4MMtbQuMX822FlhzIHhfIdvRe' : '1wRjuFC4S5sP2fC4Qp42JuK3babiS0nEO';
      if (extractedId && extractedId !== defaultCycleFolderId) {
        targetCustomFolderId = extractedId;
      }
    }

    const payload = {
      filename,
      content,
      cycle,
      studentAbsen,
      studentName,
      customFolderId: targetCustomFolderId,
      scores: {
        tracingScore: formative.tracingScore,
        battleScore: formative.battleScore,
        evaluasiScore: formative.evaluasiScore,
        finalScore: formative.finalScore,
        evaluasiAttemptCount: formative.evaluasiAttemptCount
      }
    };

    // 4. Eksekusi pengiriman HTTP POST ke Google Apps Script Web App
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 detik batas waktu pengiriman

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const jsonRes = await response.json();

      if (jsonRes && jsonRes.status === 'success') {
        return {
          filename,
          content,
          methodUsed: 'direct-cloud',
          success: true,
          message: jsonRes.message || 'Laporan berhasil disimpan ke Google Drive Guru!',
          fileUrl: jsonRes.fileUrl,
          fileId: jsonRes.fileId,
          folderName: jsonRes.folderName,
          isUpdated: jsonRes.isUpdated,
          timestamp: jsonRes.timestamp
        };
      } else {
        return {
          filename,
          content,
          methodUsed: 'direct-cloud',
          success: false,
          message: (jsonRes && jsonRes.message) || 'Gagal menyimpan berkas ke Google Drive Guru.'
        };
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errMsg = isAbort
        ? 'Waktu pengiriman habis (koneksi lambat). Berkas cadangan .txt telah tersimpan di gawai.'
        : 'Tidak dapat terhubung ke Google Drive Guru. Berkas cadangan .txt telah tersimpan di gawai.';

      return {
        filename,
        content,
        methodUsed: 'download-fallback',
        success: false,
        message: errMsg
      };
    }
  }
}
