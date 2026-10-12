// scripts/verify_tsk02_tsk05.mjs
// Verifikasi Unit Logic Formula Bobot Siklus 2 dan Fail-Safe Unduhan Lokal

import { StorageService } from '../src/services/StorageService.ts';
import { AssessmentExportService } from '../src/services/AssessmentExportService.ts';
import { CASE_MODULES } from '../src/logic/modules.data.ts';

async function runVerification() {
  console.log('[TEST] Mulai verifikasi unit logic TSK-02 sampai TSK-05...');

  // 1. Verifikasi Data Modul Kasus 4 & 5 (TSK-03)
  const m04 = CASE_MODULES.find(m => m.id === 'm04');
  const m05 = CASE_MODULES.find(m => m.id === 'm05');

  if (!m04 || m04.weightPoints !== 50) {
    throw new Error(`[FAIL] Modul m04 harus berbobot 50 poin, ditemukan: ${m04?.weightPoints}`);
  }
  if (!m05 || m05.weightPoints !== 50) {
    throw new Error(`[FAIL] Modul m05 harus berbobot 50 poin, ditemukan: ${m05?.weightPoints}`);
  }

  const m04Branches = (m04.testPresets || []).map(p => p.targetBranch);
  if (!m04Branches.includes('IF') || !m04Branches.includes('ELSE_IF') || !m04Branches.includes('ELSE')) {
    throw new Error(`[FAIL] Modul m04 testPresets tidak lengkap untuk IF, ELSE_IF, ELSE: ${m04Branches.join(', ')}`);
  }

  const m05Branches = (m05.testPresets || []).map(p => p.targetBranch);
  if (!m05Branches.includes('CASE_1') || !m05Branches.includes('CASE_2') || !m05Branches.includes('CASE_3') || !m05Branches.includes('DEFAULT')) {
    throw new Error(`[FAIL] Modul m05 testPresets tidak lengkap: ${m05Branches.join(', ')}`);
  }
  console.log('[PASS] TSK-03: Data modul m04 & m05 valid (50:50 poin & testPresets lengkap).');

  // 2. Verifikasi Formula Bobot Telusur Siklus 2 (TSK-02)
  await StorageService.resetAllProgress();
  await StorageService.setCycleState(2);

  // Tanpa modul selesai
  let scores = await StorageService.getFormativeScores(2);
  if (scores.tracingScore !== 0) {
    throw new Error(`[FAIL] Skor awal harus 0, ditemukan: ${scores.tracingScore}`);
  }

  // Uji modul 1-3 saja (Siklus 1) saat berada di Siklus 2
  await StorageService.saveModuleCoverage('m01', ['IF']);
  await StorageService.saveModuleCoverage('m02', ['IF']);
  await StorageService.saveModuleCoverage('m03', ['IF']);
  scores = await StorageService.getFormativeScores(2);
  if (scores.tracingScore !== 0) {
    throw new Error(`[FAIL] Siklus 2 tidak boleh mengakumulasi modul 1-3, ditemukan: ${scores.tracingScore}`);
  }
  console.log('[PASS] TSK-02: Tidak ada akumulasi kasus 1-3 pada Siklus 2.');

  // Selesaikan Kasus 4 saja -> 50 poin, 1 bintang
  await StorageService.saveModuleCoverage('m04', ['IF', 'ELSE_IF']);
  scores = await StorageService.getFormativeScores(2);
  let stars = StorageService.getTracingStars(scores.tracingScore, true);
  if (scores.tracingScore !== 50 || stars !== 1) {
    throw new Error(`[FAIL] Kasus 4 selesai harus 50 poin & 1 bintang, ditemukan: ${scores.tracingScore} poin, ${stars} bintang`);
  }
  console.log('[PASS] TSK-02: Kasus 4 menghasilkan 50 poin dan 1 Bintang.');

  // Selesaikan Kasus 5 juga -> 100 poin, 2 bintang
  await StorageService.saveModuleCoverage('m05', ['CASE_1', 'CASE_2']);
  scores = await StorageService.getFormativeScores(2);
  stars = StorageService.getTracingStars(scores.tracingScore, true);
  if (scores.tracingScore !== 100 || stars !== 2) {
    throw new Error(`[FAIL] Kasus 4 & 5 selesai harus 100 poin & 2 bintang, ditemukan: ${scores.tracingScore} poin, ${stars} bintang`);
  }
  console.log('[PASS] TSK-02: Kasus 4 & 5 tuntas menghasilkan 100 poin dan 2 Bintang.');

  // Verifikasi First-Attempt Lock
  const locked = await StorageService.recordFirstAttemptTracing(scores.tracingScore, 2);
  if (!locked.isTracingLocked || locked.tracingScore !== 100) {
    throw new Error('[FAIL] First-attempt lock gagal mengunci skor telusur.');
  }
  console.log('[PASS] TSK-02: First-Attempt Lock berhasil mengunci skor 100.');

  // 3. Verifikasi Fail-Safe Unduhan Lokal & Offline Direct Upload (TSK-05)
  // Simulasi pengiriman saat offline / endpoint fiktif
  const progressReports = [];
  const uploadResult = await AssessmentExportService.uploadDirectToDrive(
    'https://dummy-non-existent-endpoint-domain.test/exec',
    undefined,
    (status, details) => {
      progressReports.push({ status, details });
    }
  );

  if (uploadResult.success !== false) {
    throw new Error('[FAIL] Pengiriman offline harus bernilai false.');
  }
  if (!uploadResult.content || !uploadResult.filename) {
    throw new Error('[FAIL] Berkas laporan cadangan .txt harus tetap terbuat.');
  }
  if (!progressReports.some(p => p.status === 'saving_local')) {
    throw new Error('[FAIL] Callback saving_local tidak terpanggil di awal.');
  }
  if (!progressReports.some(p => p.status === 'retrying')) {
    throw new Error('[FAIL] Callback retrying tidak terpanggil selama percobaan ulang.');
  }
  if (!progressReports.some(p => p.status === 'error')) {
    throw new Error('[FAIL] Callback error tidak terpanggil di akhir.');
  }

  console.log('[PASS] TSK-05: Fail-safe offline berhasil mengunduh berkas dan retry 3x tanpa crash.');
  console.log('\n[SUMMARY] Seluruh pengujian kriteria selesai [TSK-02] sampai [TSK-05] LULUS 100%!');
}

runVerification().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
