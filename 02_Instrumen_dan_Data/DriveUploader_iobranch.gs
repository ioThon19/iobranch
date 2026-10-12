/**
 * ==============================================================================
 * DRIVE UPLOADER & REKAPITULASI FORMATIF iobranch (GOOGLE APPS SCRIPT WEB APP)
 * Proyek PTK Informatika Kelas X-10 SMAN 15 Bandung
 * Peneliti: Anthonio Akbar | Pembimbing: Erna Piantari, S.T., M.Kom.
 * ==============================================================================
 * 
 * FUNGSI UTAMA:
 * 1. Menerima kiriman berkas laporan (.txt) dari PWA iobranch via 1-Klik Button.
 * 2. Routing folder otomatis dan dinamis:
 *    - Siklus 1 (06 Oktober 2026) -> Folder Drive Siklus 1
 *    - Siklus 2 (13 Oktober 2026) -> Folder Drive Siklus 2
 *    - Dukungan Custom Folder ID (jika ada override dinamis dari guru di kelas)
 * 3. Mencegah duplikasi berkas (prinsip idempotensi): memperbarui isi berkas jika nama berkas sudah ada.
 * 4. Penguncian konkurensi (LockService) hingga 10 detik agar transmisi serentak murid di kelas aman.
 * 5. (Opsional) Rekapitulasi otomatis ke Google Spreadsheet secara waktu-nyata (real-time).
 * 
 * CARA DEPLOY / PENERAPAN (Hanya butuh 2 Menit):
 * 1. Buka https://script.google.com/ lalu buat "Proyek Baru".
 * 2. Hapus seluruh isi kode bawaan, lalu salin (paste) seluruh isi berkas ini.
 * 3. Klik tombol [ Deploy ] di kanan atas -> Pilih [ New deployment ] (Penerapan baru).
 * 4. Pilih tipe: [ Web app ] (Aplikasi web).
 * 5. Konfigurasi:
 *    - Description: "iobranch Drive Uploader v2.0 Idempotent Lock"
 *    - Execute as: "Me" (Saya / akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja: agar murid bisa mengirim tanpa login akun Google di browser)
 * 6. Klik [ Deploy ], beri izin akses Google Drive.
 * 7. Salin "Web app URL" (contoh: https://script.google.com/macros/s/AKfycb.../exec).
 * 8. Tempelkan URL tersebut ke PWA iobranch (atau tambahkan ?api=URL pada tautan game).
 * ==============================================================================
 */

// KONFIGURASI TARGET GOOGLE DRIVE & SPREADSHEET RESMI
const CONFIG = {
  // Folder ID Google Drive Resmi per Siklus (SMAN 15 Bandung)
  CYCLE_FOLDERS: {
    1: '1wRjuFC4S5sP2fC4Qp42JuK3babiS0nEO', // Siklus I (06 Oktober 2026)
    2: '1r_GqGTE4MMtbQuMX822FlhzIHhfIdvRe'  // Siklus II (13 Oktober 2026)
  },

  // ID Google Spreadsheet untuk Rekapitulasi Otomatis (Opsional)
  // Biarkan string kosong '' jika tidak ingin mencatat ke spreadsheet,
  // atau isi ID Spreadsheet jika Anda memiliki lembar rekap nilai khusus.
  SPREADSHEET_ID: '',

  // Nama Sheet di dalam Spreadsheet rekapitulasi
  SHEET_NAME: 'Rekap Formatif iobranch'
};

/**
 * Endpoint HTTP POST: Menerima data laporan formatif murid dari PWA iobranch
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(10000); // Batas tunggu 10 detik untuk mencegah tabrakan eksekusi serentak murid

  if (!hasLock) {
    return createJsonResponse({
      status: 'error',
      message: 'Server sedang memproses antrean pengiriman murid lain. Silakan coba kirim ulang dalam beberapa detik.'
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'Payload data kosong atau tidak valid.'
      });
    }

    // Parsing payload JSON dari PWA
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        status: 'error',
        message: 'Format data JSON tidak valid: ' + parseErr.toString()
      });
    }

    const filename = data.filename || 'iobranch_laporan_formatif.txt';
    const content = data.content || '';
    const cycle = parseInt(data.cycle, 10) || 1;
    const studentAbsen = data.studentAbsen || '-';
    const studentName = data.studentName || 'Murid';
    const customFolderId = data.customFolderId || '';
    const scores = data.scores || {};

    // 1. Tentukan Folder Tujuan (Prioritaskan Custom Folder jika diatur guru, fallback ke Siklus)
    let targetFolderId = customFolderId;
    if (!targetFolderId) {
      targetFolderId = CONFIG.CYCLE_FOLDERS[cycle] || CONFIG.CYCLE_FOLDERS[1];
    }

    let folder;
    try {
      folder = DriveApp.getFolderById(targetFolderId);
    } catch (folderErr) {
      return createJsonResponse({
        status: 'error',
        message: 'Gagal membuka folder Google Drive target (' + targetFolderId + '): ' + folderErr.toString()
      });
    }

    // 2. Simpan atau Perbarui Berkas di Google Drive (Prinsip Idempotensi)
    // Mencegah duplikasi berkas jika murid mengirim ulang perbaikan
    const existingFiles = folder.getFilesByName(filename);
    let file;
    let isUpdated = false;

    if (existingFiles.hasNext()) {
      file = existingFiles.next();
      file.setContent(content);
      isUpdated = true;

      // Bersihkan salinan ekstra jika sebelumnya sempat ada duplikat kembar
      while (existingFiles.hasNext()) {
        const extraDuplicate = existingFiles.next();
        try {
          extraDuplicate.setTrashed(true);
        } catch (trashErr) {
          Logger.log('Gagal membuang duplikat ekstra: ' + trashErr.toString());
        }
      }
    } else {
      file = folder.createFile(filename, content, MimeType.PLAIN_TEXT);
    }

    const fileUrl = file.getUrl();
    const fileId = file.getId();
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // 3. Pencatatan Otomatis ke Google Spreadsheet (Jika Diaktifkan)
    let sheetRecorded = false;
    try {
      sheetRecorded = recordToSpreadsheet({
        timestamp: nowStr,
        cycle: cycle,
        studentAbsen: studentAbsen,
        studentName: studentName,
        tracingScore: scores.tracingScore ?? scores.tracing ?? '-',
        battleScore: scores.battleScore ?? scores.battle ?? '-',
        evaluasiScore: scores.evaluasiScore ?? scores.evaluasi ?? '-',
        finalScore: scores.finalScore ?? scores.final ?? '-',
        statusKetuntasan: (scores.finalScore ?? scores.final ?? 0) >= 75 ? 'TUNTAS' : 'SEDANG BERPROSES',
        filename: filename,
        fileUrl: fileUrl
      });
    } catch (sheetErr) {
      Logger.log('Pencatatan spreadsheet dilewati: ' + sheetErr.toString());
    }

    return createJsonResponse({
      status: 'success',
      message: isUpdated
        ? 'Laporan berhasil diperbarui di Google Drive Guru!'
        : 'Laporan berhasil disimpan ke Google Drive Guru!',
      filename: filename,
      fileId: fileId,
      fileUrl: fileUrl,
      folderName: folder.getName(),
      isUpdated: isUpdated,
      sheetRecorded: sheetRecorded,
      timestamp: nowStr
    });

  } catch (globalErr) {
    return createJsonResponse({
      status: 'error',
      message: 'Terjadi kesalahan sistem saat memproses laporan: ' + globalErr.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      Logger.log('Pelepasan lock dilewati: ' + releaseErr.toString());
    }
  }
}

/**
 * Endpoint HTTP GET: Pengecekan status layanan (Health-check)
 */
function doGet(e) {
  return createJsonResponse({
    status: 'active',
    service: 'iobranch Drive Uploader Web API v2.0',
    description: 'Endpoint penerima laporan formatif mandiri murid PTK Informatika SMAN 15 Bandung',
    cycleTargets: {
      cycle1FolderId: CONFIG.CYCLE_FOLDERS[1],
      cycle2FolderId: CONFIG.CYCLE_FOLDERS[2]
    },
    timestamp: Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss')
  });
}

/**
 * Mencatat baris nilai formatif murid ke Google Spreadsheet Rekapitulasi
 */
function recordToSpreadsheet(rowObj) {
  let ss = null;

  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== '') {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID.trim());
  } else {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      ss = null;
    }
  }

  if (!ss) return false;

  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Buat baris header standar jika sheet baru dibuat
    const headers = [
      'Waktu Pengiriman',
      'Siklus',
      'No. Absen',
      'Nama Lengkap Murid',
      'Nilai Telusur (0-100)',
      'Nilai Battle (0-100)',
      'Nilai Evaluasi (0-100)',
      'Nilai Formatif Akhir',
      'Status Ketuntasan',
      'Nama Berkas .txt',
      'Tautan Berkas Google Drive'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0F766E').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  // Tambahkan baris data murid
  sheet.appendRow([
    rowObj.timestamp,
    'Siklus ' + rowObj.cycle,
    rowObj.studentAbsen,
    rowObj.studentName,
    rowObj.tracingScore,
    rowObj.battleScore,
    rowObj.evaluasiScore,
    rowObj.finalScore,
    rowObj.statusKetuntasan,
    rowObj.filename,
    rowObj.fileUrl
  ]);

  return true;
}

/**
 * Format keluaran respon JSON standar
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
