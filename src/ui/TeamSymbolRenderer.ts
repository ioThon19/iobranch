// src/ui/TeamSymbolRenderer.ts - Generator Ikon Lambang Tim 16-Bit Retro Pixel Art
import { TeamSymbol } from '../types/session.types';

export interface TeamSymbolMeta {
  id: TeamSymbol;
  name: string;
  tagline: string;
  concept: string;
  primaryColor: string;
  accentColor: string;
}

export const TEAM_SYMBOLS_DATA: Record<TeamSymbol, TeamSymbolMeta> = {
  algoritma: {
    id: 'algoritma',
    name: 'ALGORITMA',
    tagline: 'Logika Percabangan',
    concept: 'Bagan pohon keputusan IF-ELSE dan diagram alir algoritma pemecahan masalah.',
    primaryColor: '#0F766E',
    accentColor: '#F59E0B'
  },
  biner: {
    id: 'biner',
    name: 'BINER',
    tagline: 'Arsitektur Komputasi',
    concept: 'Mikroprosesor 16-bit logika biner, transmisi bit 0 dan 1 pada gerbang digital.',
    primaryColor: '#0D9488',
    accentColor: '#2DD4BF'
  },
  matriks: {
    id: 'matriks',
    name: 'MATRIKS',
    tagline: 'Struktur Data Grid',
    concept: 'Array data dua dimensi dan jaringan komputasi grid memori tabular.',
    primaryColor: '#D97706',
    accentColor: '#10B981'
  },
  vektor: {
    id: 'vektor',
    name: 'VEKTOR',
    tagline: 'Koordinat & Arah',
    concept: 'Magnitudo arah penelusuran lintasan dan vektor koordinat kartesius 2D.',
    primaryColor: '#EA580C',
    accentColor: '#FBBF24'
  }
};

/**
 * Menghasilkan SVG 16-bit retro pixel art tajam (crisp edges) untuk lambang avatar murid
 */
export function renderTeamSymbolPixelArt(symbol: TeamSymbol, size = 32): string {
  switch (symbol) {
    case 'algoritma':
      // Pohon Keputusan Logika Percabangan (Flowchart Diamond & Branching Nodes)
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: inline-block; vertical-align: middle;">
          <!-- Node Input Masuk Atas -->
          <rect x="11" y="1" width="2" height="3" fill="#1C1917" />
          
          <!-- Diamond Keputusan Percabangan (IF Condition) -->
          <rect x="11" y="4" width="2" height="2" fill="#D97706" />
          <rect x="9" y="5" width="6" height="2" fill="#F59E0B" />
          <rect x="7" y="6" width="10" height="2" fill="#F59E0B" />
          <rect x="8" y="7" width="8" height="2" fill="#FEF08A" />
          <rect x="9" y="8" width="6" height="2" fill="#F59E0B" />
          <rect x="11" y="9" width="2" height="2" fill="#D97706" />
          <rect x="11" y="7" width="2" height="2" fill="#1C1917" />

          <!-- Jalur Percabangan Tengah Turun -->
          <rect x="11" y="11" width="2" height="2" fill="#1C1917" />

          <!-- Percabangan Kiri (TRUE / IF) & Kanan (FALSE / ELSE) -->
          <rect x="5" y="13" width="14" height="2" fill="#1C1917" />
          <rect x="5" y="15" width="2" height="2" fill="#1C1917" />
          <rect x="17" y="15" width="2" height="2" fill="#1C1917" />

          <!-- Kotak Hasil Cabang Kiri: TRUE (Forest Emerald) -->
          <rect x="3" y="17" width="6" height="6" fill="#042F2E" />
          <rect x="4" y="18" width="4" height="4" fill="#0F766E" />
          <rect x="5" y="19" width="2" height="2" fill="#34D399" />

          <!-- Kotak Hasil Cabang Kanan: FALSE (Crimson Alert) -->
          <rect x="15" y="17" width="6" height="6" fill="#450A0A" />
          <rect x="16" y="18" width="4" height="4" fill="#DC2626" />
          <rect x="17" y="19" width="2" height="2" fill="#FCA5A5" />
        </svg>
      `.trim();

    case 'biner':
      // Chip Mikroprosesor 16-Bit dengan Gerbang Bit 0 dan 1
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: inline-block; vertical-align: middle;">
          <!-- Pin Konektor Tembaga Emas (Bus IO) -->
          <!-- Atas & Bawah -->
          <rect x="7" y="1" width="2" height="3" fill="#D97706" />
          <rect x="11" y="1" width="2" height="3" fill="#D97706" />
          <rect x="15" y="1" width="2" height="3" fill="#D97706" />
          <rect x="7" y="20" width="2" height="3" fill="#D97706" />
          <rect x="11" y="20" width="2" height="3" fill="#D97706" />
          <rect x="15" y="20" width="2" height="3" fill="#D97706" />
          <!-- Kiri & Kanan -->
          <rect x="1" y="7" width="3" height="2" fill="#D97706" />
          <rect x="1" y="11" width="3" height="2" fill="#D97706" />
          <rect x="1" y="15" width="3" height="2" fill="#D97706" />
          <rect x="20" y="7" width="3" height="2" fill="#D97706" />
          <rect x="20" y="11" width="3" height="2" fill="#D97706" />
          <rect x="20" y="15" width="3" height="2" fill="#D97706" />

          <!-- Bodi Silikon Chip 16-Bit -->
          <rect x="4" y="4" width="16" height="16" fill="#0F172A" />
          <rect x="5" y="5" width="14" height="14" fill="#1E293B" />
          
          <!-- Indikator Sudut Notch Chip (Pin 1) -->
          <rect x="5" y="5" width="2" height="2" fill="#2DD4BF" />

          <!-- Angka Biner Pixel '1' (Kiri) -->
          <rect x="8" y="8" width="2" height="1" fill="#2DD4BF" />
          <rect x="9" y="9" width="2" height="6" fill="#2DD4BF" />
          <rect x="8" y="14" width="4" height="1" fill="#2DD4BF" />

          <!-- Angka Biner Pixel '0' (Kanan) -->
          <rect x="14" y="8" width="3" height="1" fill="#FACC15" />
          <rect x="13" y="9" width="2" height="5" fill="#FACC15" />
          <rect x="16" y="9" width="2" height="5" fill="#FACC15" />
          <rect x="14" y="14" width="3" height="1" fill="#FACC15" />
        </svg>
      `.trim();

    case 'matriks':
      // Grid Matriks 2D & Kurung Siku Tabular Komputasi
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: inline-block; vertical-align: middle;">
          <!-- Kurung Siku Kiri '[' -->
          <rect x="2" y="3" width="4" height="2" fill="#D97706" />
          <rect x="2" y="5" width="2" height="14" fill="#D97706" />
          <rect x="2" y="19" width="4" height="2" fill="#D97706" />

          <!-- Kurung Siku Kanan ']' -->
          <rect x="18" y="3" width="4" height="2" fill="#D97706" />
          <rect x="20" y="5" width="2" height="14" fill="#D97706" />
          <rect x="18" y="19" width="4" height="2" fill="#D97706" />

          <!-- Sel Matriks Baris 1 -->
          <rect x="7" y="5" width="2" height="2" fill="#0D9488" />
          <rect x="11" y="5" width="2" height="2" fill="#E2E8F0" />
          <rect x="15" y="5" width="2" height="2" fill="#0F766E" />

          <!-- Sel Matriks Baris 2 -->
          <rect x="7" y="9" width="2" height="2" fill="#E2E8F0" />
          <rect x="11" y="9" width="2" height="2" fill="#F59E0B" />
          <rect x="15" y="9" width="2" height="2" fill="#E2E8F0" />

          <!-- Sel Matriks Baris 3 -->
          <rect x="7" y="13" width="2" height="2" fill="#0F766E" />
          <rect x="11" y="13" width="2" height="2" fill="#E2E8F0" />
          <rect x="15" y="13" width="2" height="2" fill="#0D9488" />

          <!-- Sel Matriks Baris 4 -->
          <rect x="7" y="17" width="2" height="2" fill="#E2E8F0" />
          <rect x="11" y="17" width="2" height="2" fill="#10B981" />
          <rect x="15" y="17" width="2" height="2" fill="#E2E8F0" />
        </svg>
      `.trim();

    case 'vektor':
      // Sumbu Koordinat Kartesius & Vektor Arah Gerak 45 Derajat
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges; display: inline-block; vertical-align: middle;">
          <!-- Sumbu Y (Vertikal) -->
          <rect x="4" y="2" width="2" height="1" fill="#64748B" />
          <rect x="3" y="3" width="4" height="1" fill="#64748B" />
          <rect x="4" y="4" width="2" height="16" fill="#475569" />

          <!-- Sumbu X (Horizontal) -->
          <rect x="4" y="18" width="16" height="2" fill="#475569" />
          <rect x="20" y="17" width="1" height="4" fill="#64748B" />
          <rect x="21" y="18" width="1" height="2" fill="#64748B" />

          <!-- Titik Asal Origin (0,0) -->
          <rect x="3" y="17" width="4" height="4" fill="#0F172A" />
          <rect x="4" y="18" width="2" height="2" fill="#38BDF8" />

          <!-- Badan Vektor Diagonal 45 Derajat (Stepped Pixel Art) -->
          <rect x="6" y="16" width="2" height="2" fill="#EA580C" />
          <rect x="8" y="14" width="2" height="2" fill="#EA580C" />
          <rect x="10" y="12" width="2" height="2" fill="#F97316" />
          <rect x="12" y="10" width="2" height="2" fill="#F97316" />
          <rect x="14" y="8" width="2" height="2" fill="#FBBF24" />

          <!-- Kepala Panah Vektor Tajam di Kanan Atas -->
          <rect x="16" y="4" width="5" height="2" fill="#DC2626" />
          <rect x="19" y="6" width="2" height="4" fill="#DC2626" />
          <rect x="15" y="6" width="4" height="2" fill="#F59E0B" />
          <rect x="17" y="8" width="2" height="2" fill="#FEF08A" />
        </svg>
      `.trim();

    default:
      return '';
  }
}
