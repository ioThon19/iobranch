// src/utils/security.ts - Utilitas Keamanan Data, Sanitasi XSS & Proteksi CSV Formula Injection
// Menerapkan prinsip Defense in Depth pada seluruh masukan murid dan luaran antarmuka

/**
 * Melakukan escaping karakter HTML untuk mencegah Cross-Site Scripting (XSS)
 * saat merender teks dinamis ke dalam innerHTML.
 */
export function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Memvalidasi apakah nama murid aman dari tag skrip atau karakter injeksi berbahaya
 */
export function isValidSafeName(name: string): boolean {
  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return false;
  }
  // Tolak karakter tag HTML atau injeksi skrip
  if (/[<>{}[\]\\/]/.test(name)) {
    return false;
  }
  // Tolak karakter emoji mentah Unicode
  if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(name) || /[\u2600-\u27BF]/.test(name) || /[\uE000-\uF8FF]/.test(name)) {
    return false;
  }
  return true;
}

/**
 * Membersihkan sel CSV dari Formula Injection (DDE / Dynamic Data Exchange)
 * yang dapat dieksekusi saat dibuka pada Microsoft Excel atau Google Sheets.
 */
export function sanitizeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  if (typeof val === 'number') return String(val);

  let str = String(val).replace(/"/g, '""');
  // Jika diawali operator formula spreadsheet (=, +, -, @, tab, newline), netralkan dengan tanda petik tunggal
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}

/**
 * Memastikan tautan eksternal menggunakan protokol aman (https:// atau http://)
 * serta mencegah skema berbahaya seperti javascript:, data:, atau vbscript:
 */
export function sanitizeWebUrl(url: string, defaultUrl = 'https://drive.google.com'): string {
  if (!url || typeof url !== 'string') return defaultUrl;
  const trimmed = url.trim();
  if (trimmed === '') return defaultUrl;

  // Tolak skema berbahaya
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return defaultUrl;
  }

  // Tambahkan https:// jika protokol belum disertakan
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}
