import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('alur pendaftaran murid baru dan orientasi masalah Pak Budi', async ({ app, browser, screen }) => {
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

  // 2. Layar awal (BERANDA/MENU): klik tombol pendaftaran/panduan
  const btnStart = browser.locator('#btn-start-game');
  await expect(btnStart).toBeVisible();
  await btnStart.click();

  // 3. Masuk ke layar PANDUAN dan tutup modal petunjuk jika muncul otomatis
  await dismissGuidanceModalIfPresent();
  await expect(screen.getByText('Petunjuk Petualangan & Alur Misi Logika')).toBeVisible();

  // 4. Buka dan pelajari langkah panduan secara bertahap
  const btnAdvance1 = browser.locator('#btn-advance-stack-1');
  await expect(btnAdvance1).toBeVisible();
  await btnAdvance1.click();

  const btnAdvance2 = browser.locator('#btn-advance-stack-2');
  await expect(btnAdvance2).toBeVisible();
  await btnAdvance2.click();

  // 5. Konfirmasi penyelesaian panduan untuk membuka formulir pendaftaran murid
  const btnCompleteGuide = browser.locator('#btn-complete-guide');
  await expect(btnCompleteGuide).toBeVisible();
  await btnCompleteGuide.click();

  // 6. Formulir pendaftaran murid muncul
  const nameInput = browser.locator('#input-student-name');
  const absenInput = browser.locator('#input-student-absen');
  await expect(nameInput).toBeVisible();
  await expect(absenInput).toBeVisible();

  // 7. Isi data murid
  await nameInput.fill('Budi Pratama');
  await absenInput.fill('12');

  // 8. Kirim formulir pendaftaran
  const submitBtn = browser.locator('#form-onboarding button[type="submit"]');
  await submitBtn.click();

  // 9. Masuk ke layar OVERWORLD, tutup petunjuk jika ada, dan periksa identitas murid di navbar
  await dismissGuidanceModalIfPresent();
  await expect(browser.locator('.navbar-student-badge')).toBeVisible();
  await expect(browser.locator('.navbar-student-name')).toHaveText('Budi Pratama');
  await expect(browser.locator('.navbar-student-absen')).toHaveText('Absen 12');

  // 10. Verifikasi kartu misi orientasi aktif di OVERWORLD
  await expect(screen.getByText('Orientasi Masalah bersama Guru Pak Budi')).toBeVisible();

  // 11. Buka sesi dialog dengan Guru Pak Budi melalui tombol misi utama
  const missionPrimaryBtn = browser.locator('#btn-quest-primary');
  await expect(missionPrimaryBtn).toBeVisible();
  await missionPrimaryBtn.click();

  // 12. Masuk ke layar DIALOG dan verifikasi sesi bersama Guru Pak Budi
  await dismissGuidanceModalIfPresent();
  await expect(screen.getByText('LANGKAH 01: ORIENTASI MASALAH')).toBeVisible();
  await expect(screen.getByText('Pertemuan Guru Pak Budi')).toBeVisible();
  await expect(screen.getByText('Sesi Orientasi Masalah: Budi Pratama')).toBeVisible();
});
