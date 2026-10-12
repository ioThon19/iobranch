// src/ui/CoverageView.ts - Pelacak Cakupan Cabang 2 Bintang & Progres Formatif (SSOT: DESIGN.md & antislop-ui)
import { ModuleProgress } from '../types/session.types';
import { StorageService } from '../services/StorageService';
import { renderPixelIcon } from './UIManager';

import { ModuleBranchDefinition, MODULE_BRANCHES } from '../logic/modules.data';

export type { ModuleBranchDefinition };
export { MODULE_BRANCHES };


export class CoverageView {
  private container: HTMLElement;
  private progress: ModuleProgress;
  private moduleId: string;
  private tracingScore: number;
  private isCycle2: boolean;

  constructor(initialProgress?: ModuleProgress, moduleId = 'm01', tracingScore = 0, isCycle2 = false) {
    this.progress = initialProgress ?? {
      testedBranches: [],
      stars: 0,
      isCompleted: false,
      xpEarned: 0,
      updatedAt: Date.now()
    };
    this.moduleId = moduleId;
    this.tracingScore = tracingScore;
    this.isCycle2 = isCycle2;

    this.container = document.createElement('div');
    this.container.className = 'coverage-view-card tactile-panel';
    this.container.style.cssText = `
      padding: 12px 16px;
      margin-top: 10px;
    `;
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(progress: ModuleProgress, moduleId?: string, tracingScore?: number, isCycle2?: boolean): void {
    this.progress = progress;
    if (moduleId) {
      this.moduleId = moduleId;
    }
    if (tracingScore !== undefined) {
      this.tracingScore = tracingScore;
    }
    if (isCycle2 !== undefined) {
      this.isCycle2 = isCycle2;
    }
    this.render();
  }

  public render(): HTMLElement {
    const branchDefs = MODULE_BRANCHES[this.moduleId] || MODULE_BRANCHES['m01']!;
    const cycleLabel = this.isCycle2 ? 'Siklus 2' : 'Siklus 1';

    const pillsHtml = branchDefs
      .map((b) => {
        const isTested = this.progress.testedBranches.includes(b.id);
        return `
          <div class="branch-pill" style="
            flex: 1;
            min-width: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 10px;
            border-radius: 6px;
            font-family: var(--font-code);
            font-size: 11px;
            font-weight: 700;
            background-color: ${isTested ? 'rgba(21, 128, 61, 0.14)' : 'var(--surface-code)'};
            border: 1.5px solid ${isTested ? 'var(--success)' : 'var(--border-retro)'};
            color: ${isTested ? 'var(--success)' : 'var(--text-muted)'};
          ">
            <span>${isTested ? renderPixelIcon('check', 12, 'var(--success)') : renderPixelIcon('refresh', 10, 'var(--text-muted)')}</span>
            <span>${b.label}</span>
          </div>
        `;
      })
      .join('');

    const tracingStars = StorageService.getTracingStars(this.tracingScore, this.isCycle2);

    let targetGuideHtml = '';
    if (this.isCycle2) {
      if (tracingStars >= 2) {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--success); font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('check', 12, 'var(--success)')} Luar biasa! Kedua kasus Siklus 2 telah berhasil diselesaikan (100/100, Bintang 2 Tuntas Penuh).
        </div>`;
      } else if (tracingStars >= 1) {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--primary); margin-bottom: 8px; line-height: 1.4;">
          Capaian: Bintang 1 Diraih (50 Poin)! Tuntaskan kasus berikutnya untuk meraih Bintang 2 (Nilai 100/100).
        </div>`;
      } else {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
          Target: Tuntaskan Kasus 4 (50 Poin) untuk Bintang 1, dan kedua kasus (Kasus 4 &amp; 5) untuk Bintang 2 (100/100).
        </div>`;
      }
    } else {
      if (tracingStars >= 2) {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--success); font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('check', 12, 'var(--success)')} Luar biasa! Seluruh 3 kasus wajib telah diselesaikan dengan benar (Nilai 100/100, Bintang 2 Tuntas Penuh).
        </div>`;
      } else if (tracingStars >= 1) {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--primary); margin-bottom: 8px; line-height: 1.4;">
          Capaian: Kasus 1 &amp; 2 tuntas (Bintang 1 Diraih, 60 Poin). Tuntaskan Kasus 3 (Bobot 40 Poin) untuk meraih Bintang 2 (100/100)!
        </div>`;
      } else if (this.tracingScore >= 30) {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
          Capaian: Kasus 1 tuntas (30 Poin). Selesaikan Kasus 2 (Bobot 30 Poin) untuk meraih Bintang 1 (60 Poin)!
        </div>`;
      } else {
        targetGuideHtml = `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
          Target: Selesaikan Kasus 1 (30 Poin) &amp; Kasus 2 (30 Poin) untuk Bintang 1, lalu Kasus 3 (40 Poin) untuk Bintang 2 (100/100).
        </div>`;
      }
    }

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="eyebrow-label" style="color: var(--warning); letter-spacing: 0.6px;">
          PROGRES UJI JALUR KONDISI
        </span>
        <div class="stars-display" style="font-family: var(--font-code); font-size: 11px; font-weight: bold; display: flex; gap: 8px;">
          <span style="color: ${tracingStars >= 1 ? 'var(--warning)' : 'var(--text-muted)'}; display: inline-flex; align-items: center; gap: 4px;">
            ${renderPixelIcon('star', 12, tracingStars >= 1 ? 'var(--warning)' : 'var(--text-muted)')} BINTANG 1
          </span>
          <span style="color: ${tracingStars >= 2 ? 'var(--warning)' : 'var(--text-muted)'}; display: inline-flex; align-items: center; gap: 4px;">
            ${renderPixelIcon('star', 12, tracingStars >= 2 ? 'var(--warning)' : 'var(--text-muted)')} BINTANG 2
          </span>
        </div>
      </div>

      <!-- Papan Nilai Formatif Telusur Dinamis Sesuai Siklus Aktif -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 118, 110, 0.08); border: 1.5px solid rgba(15, 118, 110, 0.25); border-radius: 8px; padding: 7px 12px; margin-bottom: 10px;">
        <span style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 13, 'var(--primary)')}
          <span>Nilai Formatif Telusur (${cycleLabel}):</span>
        </span>
        <span style="font-family: var(--font-code); font-size: 14px; font-weight: 800; color: var(--primary);">
          ${this.tracingScore} <span style="font-size: 10.5px; font-weight: 600; color: var(--text-secondary);">/ 100</span>
        </span>
      </div>

      ${targetGuideHtml}

      <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
        ${pillsHtml}
      </div>

      <!-- Bar Skor Formatif 1-100 Penelusuran Logika -->
      <div class="score-bar-wrapper">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: var(--text-secondary);">
          <span style="font-weight: 600;">Skor Akumulasi Telusur (${cycleLabel})</span>
          <span style="font-family: var(--font-code); font-weight: 700; color: var(--primary);">${this.tracingScore} / 100</span>
        </div>
        <div style="width: 100%; height: 8px; background-color: var(--surface-code); border: 1.5px solid var(--border-retro); border-radius: 4px; overflow: hidden;">
          <div style="width: ${this.tracingScore}%; height: 100%; background-color: var(--primary); transition: width 0.3s ease;"></div>
        </div>
      </div>
    `;

    return this.container;
  }
}
