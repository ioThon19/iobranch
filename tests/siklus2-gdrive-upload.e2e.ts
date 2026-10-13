import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('alur lengkap pendaftaran murid hingga berkas terupload ke google drive pada siklus 2', async ({ app, browser, screen }) => {
  // Helper penutup modal petunjuk kontekstual yang muncul pada pergantian layar awal
  const dismissGuidanceModalIfPresent = async () => {
    const confirmBtn = browser.locator('#btn-confirm-screen-guide');
    try {
      await confirmBtn.waitFor({ state: 'visible', timeout: 1200 });
      await confirmBtn.click();
      await confirmBtn.waitFor({ state: 'hidden', timeout: 1200 });
    } catch {
      // Modal tidak muncul atau sudah ditutup sebelumnya
    }
  };

  // 1. Buka aplikasi di halaman awal
  await app.open('/');
  await expect(browser.locator('body')).toBeVisible();

  // 2. Beranda: klik tombol mulai untuk membaca panduan
  const btnStart = browser.locator('#btn-start-game');
  await expect(btnStart).toBeVisible();
  await btnStart.click();

  // 3. Masuk ke layar PANDUAN dan telusuri langkah panduan
  await dismissGuidanceModalIfPresent();
  await expect(screen.getByText('Petunjuk Petualangan & Alur Misi Logika')).toBeVisible();

  const btnAdvance1 = browser.locator('#btn-advance-stack-1');
  await expect(btnAdvance1).toBeVisible();
  await btnAdvance1.click();

  const btnAdvance2 = browser.locator('#btn-advance-stack-2');
  await expect(btnAdvance2).toBeVisible();
  await btnAdvance2.click();

  // 4. Selesaikan panduan dan buka formulir registrasi murid
  const btnCompleteGuide = browser.locator('#btn-complete-guide');
  await expect(btnCompleteGuide).toBeVisible();
  await btnCompleteGuide.click();

  // 5. Isi profil murid baru (Nama & Absen 12)
  const nameInput = browser.locator('#input-student-name');
  const absenInput = browser.locator('#input-student-absen');
  await expect(nameInput).toBeVisible();
  await expect(absenInput).toBeVisible();

  await nameInput.fill('Budi Pratama');
  await absenInput.fill('12');

  const submitBtn = browser.locator('#form-onboarding button[type="submit"]');
  await submitBtn.click();

  // 6. Verifikasi identitas murid tersimpan dan muncul di bilah navigasi atas
  await dismissGuidanceModalIfPresent();
  await expect(browser.locator('.navbar-student-badge')).toBeVisible();
  await expect(browser.locator('.navbar-student-name')).toHaveText('Budi Pratama');
  await expect(browser.locator('.navbar-student-absen')).toHaveText('Absen 12');

  // 7. Kembali ke BERANDA untuk membuka gerbang Siklus 2
  const berandaTab = browser.locator('.gba-tab-bar button').filter({ hasText: 'BERANDA' });
  await expect(berandaTab).toBeVisible();
  await berandaTab.click();
  await dismissGuidanceModalIfPresent();

  // 8. Buka modal token kelas dan masukkan token SIKLUS2
  const btnToken = browser.locator('#btn-menu-token');
  await expect(btnToken).toBeVisible();
  await btnToken.click();

  const tokenInput = browser.locator('#input-student-token');
  await expect(tokenInput).toBeVisible();
  await tokenInput.fill('SIKLUS2');

  const btnSubmitToken = browser.locator('#btn-submit-token');
  await btnSubmitToken.click();

  // Tutup modal selebrasi pembukaan Siklus 2
  const btnCloseCelebrate = browser.locator('#btn-close-celebrate');
  await expect(btnCloseCelebrate).toBeVisible();
  await btnCloseCelebrate.click();

  // 9. Verifikasi Siklus 2 aktif pada header navigasi
  await expect(browser.locator('.navbar-brand-subtitle')).toContainText('SIKLUS 2 (MAJU)');

  // 10. Buka akses layar penuh via panel fasilitator guru (PIN PTK)
  const logo = browser.locator('.navbar-brand-logo');
  await logo.click();
  await logo.click();
  await logo.click();

  const teacherPinInput = browser.locator('#input-teacher-pin');
  await expect(teacherPinInput).toBeVisible();
  await teacherPinInput.fill('PTK');

  const btnVerifyPin = browser.locator('#btn-verify-pin');
  await btnVerifyPin.click();

  // Aktifkan bypass mode demo guru untuk membuka akses langsung ke seluruh layar
  const bypassRow = browser.locator('#bypass-trigger-row');
  await expect(bypassRow).toBeVisible();
  await bypassRow.click();

  const btnSaveTeacher = browser.locator('#btn-save-teacher');
  await expect(btnSaveTeacher).toBeVisible();
  await btnSaveTeacher.click();

  // 11. Buka layar PROGRES (Dasbor Portofolio Nilai)
  const progresTab = browser.locator('.gba-tab-bar button').filter({ hasText: 'PROGRES' });
  await expect(progresTab).toBeVisible();
  await progresTab.click();
  await dismissGuidanceModalIfPresent();

  // Buka Stack 3: Evaluasi Akhir & Pengiriman Laporan ke Guru
  const stack3Header = browser.locator('#progres-stack-header-3');
  await expect(stack3Header).toBeVisible();
  await stack3Header.click();

  // 12. Verifikasi informasi pengiriman Siklus 2 di kartu unggah
  await expect(screen.getByText('Langkah 1: Kirim Bukti Belajar ke Guru')).toBeVisible();
  await expect(screen.getByText('Folder Google Drive Siklus 2 Sekolah Kota Harmoni')).toBeVisible();
  await expect(screen.getByText('iobranch_Siklus2_Absen12_BudiPratama.txt')).toBeVisible();

  // 13. Tekan tombol 1-Klik Kirim Laporan Langsung ke Drive Guru
  const uploadBtn = browser.locator('#btn-direct-upload-drive');
  await expect(uploadBtn).toBeVisible();
  await uploadBtn.click();

  // 14. Verifikasi berkas laporan berhasil terupload ke Google Drive
  // Batas waktu pengiriman cloud live hingga 25 detik
  const mintSuccessBanner = browser.locator('.cloud-upload-mint-banner');
  await expect(mintSuccessBanner).toBeVisible({ timeout: 25000 });

  // Verifikasi isi banner konfirmasi
  await expect(mintSuccessBanner).toContainText('Laporan Berhasil');
  await expect(mintSuccessBanner).toContainText('Tersimpan di Cloud');
  await expect(mintSuccessBanner).toContainText('iobranch_Siklus2_Absen12_BudiPratama.txt');

  // Verifikasi ketersediaan tautan buka berkas di Google Drive
  const driveFileLink = browser.locator('.cloud-upload-mint-banner a[href*="drive.google.com"]');
  await expect(driveFileLink).toBeVisible();
});
