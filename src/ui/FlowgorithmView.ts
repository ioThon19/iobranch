// src/ui/FlowgorithmView.ts - Visualisasi Diagram Alir Minimalis Standar Flowgorithm (Anti-Slop Standard)
// Merender diagram alir berbasis SVG vektor murni yang ringan, tajam, dan responsif.
import { renderPixelIcon } from './UIManager';

export class FlowgorithmView {
  private container: HTMLElement;
  private currentModuleId: string = 'm01';
  private currentInputVal: number = 5000;
  private currentStep: number = 0;
  private activeBranch: string = '';
  private conditionResult: boolean | null = null;

  public getActiveBranch(): string {
    return this.activeBranch;
  }

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'flowgorithm-view-wrapper';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setModule(moduleId: string, inputVal: number): void {
    this.currentModuleId = moduleId;
    this.currentInputVal = inputVal;
    this.currentStep = 0;
    this.activeBranch = '';
    this.conditionResult = null;
    this.render();
  }

  public update(stepNumber: number, activeBranch: string, conditionResult: boolean | null, inputVal?: number): void {
    this.currentStep = stepNumber;
    this.activeBranch = activeBranch;
    this.conditionResult = conditionResult;
    if (inputVal !== undefined) {
      this.currentInputVal = inputVal;
    }
    this.render();
  }

  public reset(): void {
    this.currentStep = 0;
    this.activeBranch = '';
    this.conditionResult = null;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: rgba(15, 118, 110, 0.1);">
            ${renderPixelIcon('target', 13, 'var(--primary)')}
          </span>
          <div>
            <div style="font-family: var(--font-ui); font-size: 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
              Diagram Alir Logika
              <span style="font-size: 9px; font-family: var(--font-code); font-weight: 600; padding: 2px 6px; border-radius: 4px; background: rgba(15, 118, 110, 0.08); color: var(--primary);">
                Standar Flowgorithm
              </span>
            </div>
          </div>
        </div>

        <!-- Indikator Legenda Simbol -->
        <div style="display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--text-muted); font-family: var(--font-code); flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: #10b981;"></span>
            True (Benar)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: #ef4444;"></span>
            False (Salah)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: #f59e0b;"></span>
            Aktif
          </span>
        </div>
      </div>

      <!-- Kanvas SVG Diagram Alir -->
      <div class="flowgorithm-canvas-box">
        ${this.buildSvgContent()}
      </div>
    `;
  }

  private buildSvgContent(): string {
    switch (this.currentModuleId) {
      case 'm01':
        return this.renderSvgM01();
      case 'm02':
        return this.renderSvgM02();
      case 'm03':
        return this.renderSvgM03();
      case 'm04':
        return this.renderSvgM04();
      case 'm05':
        return this.renderSvgM05();
      default:
        return this.renderSvgM01();
    }
  }

  // =========================================================================
  // KASUS 1: Gerbang Tiket MRT (IF - ELSE: saldo >= 4000)
  // =========================================================================
  private renderSvgM01(): string {
    const isStepInit = this.activeBranch === 'INIT' || (this.currentStep === 1 && !this.activeBranch);
    const isStepCond = this.activeBranch === 'CONDITION' || (this.currentStep === 2 && !this.activeBranch);
    const isStepTrue = this.activeBranch === 'BRANCH_IF';
    const isStepFalse = this.activeBranch === 'BRANCH_ELSE';
    const isStepFinal = this.activeBranch === 'OUTPUT';

    // Standby: jangan aktifkan trigger visual True/False jika belum melangkah ke evaluasi kondisi
    const isEvaluated = this.currentStep >= 2 && this.conditionResult !== null;
    const isTrueActive = isEvaluated && this.conditionResult === true;
    const isFalseActive = isEvaluated && this.conditionResult === false;

    return `
      <svg viewBox="0 0 420 370" width="100%" height="370" style="max-width: 440px; display: block; font-family: var(--font-code);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-m1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#78716c" />
          </marker>
          <marker id="arr-emerald-m1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
          <marker id="arr-crimson-m1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
          </marker>
          <marker id="arr-amber-m1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
          </marker>
        </defs>

        <!-- Garis Penghubung Alur -->
        <!-- Start -> Input -->
        <path d="M 210 38 L 210 66" stroke="${isStepInit ? '#d97706' : '#78716c'}" stroke-width="${isStepInit ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepInit ? '#arr-amber-m1' : '#arr-m1'})" />

        <!-- Input -> Decision -->
        <path d="M 210 104 L 210 130" stroke="${isStepCond ? '#d97706' : '#78716c'}" stroke-width="${isStepCond ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepCond ? '#arr-amber-m1' : '#arr-m1'})" />

        <!-- Decision -> True (Kanan) -->
        <path d="M 285 160 L 335 160 L 335 204" stroke="${isStepTrue || (isTrueActive && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepTrue || (isTrueActive && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepTrue || (isTrueActive && isStepFinal) ? '#arr-emerald-m1' : '#arr-m1'})" />

        <!-- Decision -> False (Kiri) -->
        <path d="M 135 160 L 85 160 L 85 204" stroke="${isStepFalse || (isFalseActive && isStepFinal) ? '#dc2626' : '#a8a29e'}" stroke-width="${isStepFalse || (isFalseActive && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepFalse || (isFalseActive && isStepFinal) ? '#arr-crimson-m1' : '#arr-m1'})" />

        <!-- True Process -> Join -->
        <path d="M 335 250 L 335 288 L 210 288" stroke="${isTrueActive && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="${isTrueActive && isStepFinal ? '2.5' : '1.8'}" fill="none" />

        <!-- False Process -> Join -->
        <path d="M 85 250 L 85 288 L 210 288" stroke="${isFalseActive && isStepFinal ? '#dc2626' : '#a8a29e'}" stroke-width="${isFalseActive && isStepFinal ? '2.5' : '1.8'}" fill="none" />

        <!-- Join -> End -->
        <path d="M 210 288 L 210 316" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m1' : '#arr-m1'})" />

        <!-- 1. Terminator Start -->
        <g id="node-start" transform="translate(155, 10)">
          <rect width="110" height="28" rx="14" ry="14" fill="#ecfdf5" stroke="${this.currentStep === 0 ? '#10b981' : '#059669'}" stroke-width="${this.currentStep === 0 ? '2.5' : '1.5'}" />
          <text x="55" y="14" dominant-baseline="central" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">Mulai</text>
        </g>

        <!-- 2. Input Jajar Genjang (saldo) -->
        <g id="node-input" transform="translate(125, 66)" opacity="${isStepInit ? '1' : '0.9'}">
          <polygon points="18,0 170,0 152,38 0,38" fill="${isStepInit ? '#fef3c7' : '#f0fdfa'}" stroke="${isStepInit ? '#d97706' : '#0d9488'}" stroke-width="${isStepInit ? '2.8' : '1.5'}" />
          <text x="85" y="13" dominant-baseline="central" font-size="10" font-weight="600" fill="#134e4a" text-anchor="middle">Input saldo</text>
          <text x="85" y="27" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepInit ? '#b45309' : '#0f766e'}" text-anchor="middle">Rp${this.currentInputVal.toLocaleString('id-ID')}</text>
        </g>

        <!-- 3. Decision Diamond (saldo >= 4000) -->
        <g id="node-decision" transform="translate(135, 130)">
          <polygon points="75,0 150,30 75,60 0,30" fill="${isStepCond ? '#fef3c7' : '#fffbeb'}" stroke="${isStepCond ? '#d97706' : '#d97706'}" stroke-width="${isStepCond ? '3' : '1.8'}" />
          <text x="75" y="23" dominant-baseline="central" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle">saldo &gt;= 4000?</text>
          <text x="75" y="38" dominant-baseline="central" font-size="9" font-weight="600" fill="#92400e" text-anchor="middle">
            ${isStepCond ? `(${this.currentInputVal} &gt;= 4000)` : ''}
          </text>
        </g>

        <!-- Label Percabangan True -->
        <g transform="translate(292, 144)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isTrueActive ? '#10b981' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isTrueActive ? '#ffffff' : '#57534e'}" text-anchor="middle">True</text>
        </g>

        <!-- Label Percabangan False -->
        <g transform="translate(90, 144)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isFalseActive ? '#ef4444' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isFalseActive ? '#ffffff' : '#57534e'}" text-anchor="middle">False</text>
        </g>

        <!-- 4a. Process Box True: Pintu Masuk Terbuka -->
        <g id="node-true" transform="translate(265, 206)" opacity="${isStepTrue ? '1' : (isEvaluated ? (isTrueActive ? '0.85' : '0.35') : '0.85')}">
          <rect width="140" height="44" rx="6" ry="6" fill="${isStepTrue ? '#ecfdf5' : '#ffffff'}" stroke="${isStepTrue ? '#059669' : (isTrueActive ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepTrue ? '2.8' : '1.5'}" />
          <text x="70" y="16" dominant-baseline="central" font-size="9" font-weight="600" fill="#047857" text-anchor="middle">Tampilkan:</text>
          <text x="70" y="30" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#065f46" text-anchor="middle">"Pintu Masuk Terbuka"</text>
        </g>

        <!-- 4b. Process Box False: Saldo Kurang, Isi Ulang Dahulu -->
        <g id="node-false" transform="translate(15, 206)" opacity="${isStepFalse ? '1' : (isEvaluated ? (isFalseActive ? '0.85' : '0.35') : '0.85')}">
          <rect width="140" height="44" rx="6" ry="6" fill="${isStepFalse ? '#fef2f2' : '#ffffff'}" stroke="${isStepFalse ? '#dc2626' : (isFalseActive ? '#ef4444' : '#cbd5e1')}" stroke-width="${isStepFalse ? '2.8' : '1.5'}" />
          <text x="70" y="16" dominant-baseline="central" font-size="9" font-weight="600" fill="#b91c1c" text-anchor="middle">Tampilkan:</text>
          <text x="70" y="30" dominant-baseline="central" font-size="9" font-weight="700" fill="#991b1b" text-anchor="middle">"Saldo Kurang, Isi Ulang"</text>
        </g>

        <!-- 5. Terminator End -->
        <g id="node-end" transform="translate(155, 318)" opacity="${isStepFinal ? '1' : '0.85'}">
          <rect width="110" height="28" rx="14" ry="14" fill="${isStepFinal ? '#ecfdf5' : '#f1f5f9'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="${isStepFinal ? '2.5' : '1.5'}" />
          <text x="55" y="14" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Selesai</text>
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // KASUS 2: Alarm Suhu Server (IF Tunggal: suhu > 30)
  // =========================================================================
  private renderSvgM02(): string {
    const isStepInit = this.activeBranch === 'INIT' || (this.currentStep === 1 && !this.activeBranch);
    const isStepCond = this.activeBranch === 'CONDITION' || (this.currentStep === 2 && !this.activeBranch);
    const isStepTrue = this.activeBranch === 'BRANCH_IF';
    const isStepFinal = this.activeBranch === 'OUTPUT';

    // Standby: jangan aktifkan trigger visual True/False jika belum melangkah ke evaluasi kondisi
    const isEvaluated = this.currentStep >= 2 && this.conditionResult !== null;
    const isTrueActive = isEvaluated && this.conditionResult === true;
    const isFalseActive = isEvaluated && this.conditionResult === false;

    return `
      <svg viewBox="0 0 420 370" width="100%" height="370" style="max-width: 440px; display: block; font-family: var(--font-code);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-m2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#78716c" />
          </marker>
          <marker id="arr-emerald-m2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
          <marker id="arr-amber-m2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
          </marker>
        </defs>

        <path d="M 210 38 L 210 64" stroke="${isStepInit ? '#d97706' : '#78716c'}" stroke-width="${isStepInit ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepInit ? '#arr-amber-m2' : '#arr-m2'})" />
        <path d="M 210 102 L 210 126" stroke="${isStepCond ? '#d97706' : '#78716c'}" stroke-width="${isStepCond ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepCond ? '#arr-amber-m2' : '#arr-m2'})" />

        <!-- Decision -> True (Kanan ke Sirine) -->
        <path d="M 285 156 L 335 156 L 335 196" stroke="${isStepTrue || (isTrueActive && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepTrue || (isTrueActive && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepTrue || (isTrueActive && isStepFinal) ? '#arr-emerald-m2' : '#arr-m2'})" />
        <path d="M 335 240 L 335 266 L 210 266" stroke="${isTrueActive && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.8" fill="none" />

        <!-- Decision -> False (Bypass Langsung) -->
        <path d="M 135 156 L 90 156 L 90 266 L 210 266" stroke="${isFalseActive && (isStepFinal || this.currentStep >= 3) ? '#ef4444' : '#a8a29e'}" stroke-width="${isFalseActive && (isStepFinal || this.currentStep >= 3) ? '2.5' : '1.8'}" fill="none" />

        <!-- Merge -> Output Umum -->
        <path d="M 210 266 L 210 286" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m2' : '#arr-m2'})" />
        <path d="M 210 318 L 210 334" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m2' : '#arr-m2'})" />

        <!-- 1. Terminator Start -->
        <g transform="translate(155, 10)">
          <rect width="110" height="28" rx="14" ry="14" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
          <text x="55" y="14" dominant-baseline="central" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">Mulai</text>
        </g>

        <!-- 2. Input suhu -->
        <g transform="translate(125, 64)">
          <polygon points="18,0 170,0 152,38 0,38" fill="${isStepInit ? '#fef3c7' : '#f0fdfa'}" stroke="${isStepInit ? '#d97706' : '#0d9488'}" stroke-width="${isStepInit ? '2.8' : '1.5'}" />
          <text x="85" y="13" dominant-baseline="central" font-size="10" font-weight="600" fill="#134e4a" text-anchor="middle">Input suhu</text>
          <text x="85" y="27" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepInit ? '#b45309' : '#0f766e'}" text-anchor="middle">${this.currentInputVal} °C</text>
        </g>

        <!-- 3. Decision Diamond (suhu > 30) -->
        <g transform="translate(135, 126)">
          <polygon points="75,0 150,30 75,60 0,30" fill="${isStepCond ? '#fef3c7' : '#fffbeb'}" stroke="${isStepCond ? '#d97706' : '#d97706'}" stroke-width="${isStepCond ? '3' : '1.8'}" />
          <text x="75" y="23" dominant-baseline="central" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle">suhu &gt; 30?</text>
          <text x="75" y="38" dominant-baseline="central" font-size="9" font-weight="600" fill="#92400e" text-anchor="middle">${isStepCond ? `(${this.currentInputVal} &gt; 30)` : ''}</text>
        </g>

        <!-- Label True & False -->
        <g transform="translate(292, 140)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isTrueActive ? '#10b981' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isTrueActive ? '#ffffff' : '#57534e'}" text-anchor="middle">True</text>
        </g>
        <g transform="translate(90, 140)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isFalseActive ? '#ef4444' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isFalseActive ? '#ffffff' : '#57534e'}" text-anchor="middle">False</text>
        </g>

        <!-- 4a. Process Box True: Sirine Bahaya -->
        <g transform="translate(265, 198)" opacity="${isStepTrue ? '1' : (isEvaluated ? (isTrueActive ? '0.85' : '0.3') : '0.85')}">
          <rect width="140" height="42" rx="6" ry="6" fill="${isStepTrue ? '#ecfdf5' : '#ffffff'}" stroke="${isStepTrue ? '#059669' : '#cbd5e1'}" stroke-width="${isStepTrue ? '2.8' : '1.5'}" />
          <text x="70" y="15" dominant-baseline="central" font-size="9" font-weight="600" fill="#047857" text-anchor="middle">Tampilkan:</text>
          <text x="70" y="29" dominant-baseline="central" font-size="9" font-weight="700" fill="#065f46" text-anchor="middle">"Peringatan: Sirine Bahaya!"</text>
        </g>

        <!-- 5. Process Output Status Selesai -->
        <g transform="translate(110, 286)">
          <rect width="200" height="32" rx="4" ry="4" fill="${isStepFinal ? '#ecfdf5' : '#ffffff'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="${isStepFinal ? '2.5' : '1.5'}" />
          <text x="100" y="16" dominant-baseline="central" font-size="9.5" font-weight="600" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Tampilkan: "Status Selesai"</text>
        </g>

        <!-- 6. Terminator End -->
        <g transform="translate(155, 334)">
          <rect width="110" height="26" rx="13" ry="13" fill="${isStepFinal ? '#ecfdf5' : '#f1f5f9'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="1.5" />
          <text x="55" y="13" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Selesai</text>
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // KASUS 3: Kasir Kantin Kupon (IF - ELSE: total_belanja >= 25000)
  // =========================================================================
  private renderSvgM03(): string {
    const isStepInit = this.activeBranch === 'INIT' || (this.currentStep === 1 && !this.activeBranch);
    const isStepCond = this.activeBranch === 'CONDITION' || (this.currentStep === 2 && !this.activeBranch);
    const isStepTrue = this.activeBranch === 'BRANCH_IF';
    const isStepFalse = this.activeBranch === 'BRANCH_ELSE';
    const isStepFinal = this.activeBranch === 'OUTPUT';

    // Standby: jangan aktifkan trigger visual True/False jika belum melangkah ke evaluasi kondisi
    const isEvaluated = this.currentStep >= 2 && this.conditionResult !== null;
    const isTrueActive = isEvaluated && this.conditionResult === true;
    const isFalseActive = isEvaluated && this.conditionResult === false;

    return `
      <svg viewBox="0 0 420 370" width="100%" height="370" style="max-width: 440px; display: block; font-family: var(--font-code);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-m3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#78716c" />
          </marker>
          <marker id="arr-emerald-m3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
          <marker id="arr-crimson-m3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
          </marker>
          <marker id="arr-amber-m3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
          </marker>
        </defs>

        <path d="M 210 38 L 210 66" stroke="${isStepInit ? '#d97706' : '#78716c'}" stroke-width="${isStepInit ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepInit ? '#arr-amber-m3' : '#arr-m3'})" />
        <path d="M 210 104 L 210 130" stroke="${isStepCond ? '#d97706' : '#78716c'}" stroke-width="${isStepCond ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepCond ? '#arr-amber-m3' : '#arr-m3'})" />

        <path d="M 285 160 L 335 160 L 335 204" stroke="${isStepTrue || (isTrueActive && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepTrue || (isTrueActive && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepTrue || (isTrueActive && isStepFinal) ? '#arr-emerald-m3' : '#arr-m3'})" />
        <path d="M 135 160 L 85 160 L 85 204" stroke="${isStepFalse || (isFalseActive && isStepFinal) ? '#dc2626' : '#a8a29e'}" stroke-width="${isStepFalse || (isFalseActive && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepFalse || (isFalseActive && isStepFinal) ? '#arr-crimson-m3' : '#arr-m3'})" />

        <path d="M 335 250 L 335 288 L 210 288" stroke="${isTrueActive && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.8" fill="none" />
        <path d="M 85 250 L 85 288 L 210 288" stroke="${isFalseActive && isStepFinal ? '#dc2626' : '#a8a29e'}" stroke-width="1.8" fill="none" />
        <path d="M 210 288 L 210 316" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m3' : '#arr-m3'})" />

        <!-- 1. Start -->
        <g transform="translate(155, 10)">
          <rect width="110" height="28" rx="14" ry="14" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
          <text x="55" y="14" dominant-baseline="central" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">Mulai</text>
        </g>

        <!-- 2. Input -->
        <g transform="translate(115, 66)">
          <polygon points="18,0 190,0 172,38 0,38" fill="${isStepInit ? '#fef3c7' : '#f0fdfa'}" stroke="${isStepInit ? '#d97706' : '#0d9488'}" stroke-width="${isStepInit ? '2.8' : '1.5'}" />
          <text x="95" y="13" dominant-baseline="central" font-size="10" font-weight="600" fill="#134e4a" text-anchor="middle">Input total_belanja</text>
          <text x="95" y="27" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepInit ? '#b45309' : '#0f766e'}" text-anchor="middle">Rp${this.currentInputVal.toLocaleString('id-ID')}</text>
        </g>

        <!-- 3. Decision -->
        <g transform="translate(135, 130)">
          <polygon points="75,0 150,30 75,60 0,30" fill="${isStepCond ? '#fef3c7' : '#fffbeb'}" stroke="${isStepCond ? '#d97706' : '#d97706'}" stroke-width="${isStepCond ? '3' : '1.8'}" />
          <text x="75" y="23" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#78350f" text-anchor="middle">total &gt;= 25.000?</text>
          <text x="75" y="38" dominant-baseline="central" font-size="9" font-weight="600" fill="#92400e" text-anchor="middle">
            ${isStepCond ? `(${this.currentInputVal} &gt;= 25000)` : ''}
          </text>
        </g>

        <!-- Label True & False -->
        <g transform="translate(292, 144)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isTrueActive ? '#10b981' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isTrueActive ? '#ffffff' : '#57534e'}" text-anchor="middle">True</text>
        </g>
        <g transform="translate(90, 144)">
          <rect width="38" height="16" rx="4" ry="4" fill="${isFalseActive ? '#ef4444' : '#e7e5e4'}" />
          <text x="19" y="8" dominant-baseline="central" font-size="9" font-weight="700" fill="${isFalseActive ? '#ffffff' : '#57534e'}" text-anchor="middle">False</text>
        </g>

        <!-- 4a. Process Box True -->
        <g transform="translate(265, 206)" opacity="${isStepTrue ? '1' : (isEvaluated ? (isTrueActive ? '0.85' : '0.35') : '0.85')}">
          <rect width="140" height="44" rx="6" ry="6" fill="${isStepTrue ? '#ecfdf5' : '#ffffff'}" stroke="${isStepTrue ? '#059669' : (isTrueActive ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepTrue ? '2.8' : '1.5'}" />
          <text x="70" y="16" dominant-baseline="central" font-size="9" font-weight="600" fill="#047857" text-anchor="middle">Tampilkan:</text>
          <text x="70" y="30" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#065f46" text-anchor="middle">"Diskon Rp5.000"</text>
        </g>

        <!-- 4b. Process Box False -->
        <g transform="translate(15, 206)" opacity="${isStepFalse ? '1' : (isEvaluated ? (isFalseActive ? '0.85' : '0.35') : '0.85')}">
          <rect width="140" height="44" rx="6" ry="6" fill="${isStepFalse ? '#fef2f2' : '#ffffff'}" stroke="${isStepFalse ? '#dc2626' : (isFalseActive ? '#ef4444' : '#cbd5e1')}" stroke-width="${isStepFalse ? '2.8' : '1.5'}" />
          <text x="70" y="16" dominant-baseline="central" font-size="9" font-weight="600" fill="#b91c1c" text-anchor="middle">Tampilkan:</text>
          <text x="70" y="30" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#991b1b" text-anchor="middle">"Bayar Normal"</text>
        </g>

        <!-- 5. End -->
        <g transform="translate(155, 318)">
          <rect width="110" height="28" rx="14" ry="14" fill="${isStepFinal ? '#ecfdf5' : '#f1f5f9'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="1.5" />
          <text x="55" y="14" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Selesai</text>
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // KASUS 4: Kecepatan Paket Data (IF - ELSE IF - ELSE: >=50, >=20)
  // =========================================================================
  private renderSvgM04(): string {
    const isFast = this.currentInputVal >= 50;
    const isMedium = !isFast && this.currentInputVal >= 20;
    const isSlow = !isFast && !isMedium;

    const isStepInit = this.activeBranch === 'INIT' || (this.currentStep === 1 && !this.activeBranch);
    const isStepCond1 = (this.activeBranch === 'CONDITION' && this.currentStep === 2);
    const isStepFast = this.activeBranch === 'BRANCH_IF' && isFast;
    const isStepCond2 = (this.activeBranch === 'CONDITION' && this.currentStep === 3);
    const isStepMedium = this.activeBranch === 'BRANCH_IF' && isMedium;
    const isStepSlow = this.activeBranch === 'BRANCH_ELSE' && isSlow;
    const isStepFinal = this.activeBranch === 'OUTPUT';

    // Standby: evaluasi hanya muncul saat step kondisi aktif
    const isEvaluated1 = this.currentStep >= 2;
    const isEvaluated2 = this.currentStep >= 3 && !isFast;

    return `
      <svg viewBox="0 0 420 370" width="100%" height="370" style="max-width: 440px; display: block; font-family: var(--font-code);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-m4" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#78716c" />
          </marker>
          <marker id="arr-emerald-m4" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
          <marker id="arr-crimson-m4" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
          </marker>
          <marker id="arr-amber-m4" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
          </marker>
        </defs>

        <path d="M 170 34 L 170 56" stroke="${isStepInit ? '#d97706' : '#78716c'}" stroke-width="${isStepInit ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepInit ? '#arr-amber-m4' : '#arr-m4'})" />
        <path d="M 170 94 L 170 114" stroke="${isStepCond1 ? '#d97706' : '#78716c'}" stroke-width="${isStepCond1 ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepCond1 ? '#arr-amber-m4' : '#arr-m4'})" />

        <!-- Cond 1 -> Cepat (Kanan) -->
        <path d="M 235 140 L 290 140" stroke="${isStepFast || (isFast && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepFast || (isFast && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepFast || (isFast && isStepFinal) ? '#arr-emerald-m4' : '#arr-m4'})" />
        <!-- Cond 1 -> False (Bawah ke Cond 2) -->
        <path d="M 170 166 L 170 196" stroke="${!isFast && (isStepCond2 || isStepMedium || isStepSlow || isStepFinal) ? '#dc2626' : '#a8a29e'}" stroke-width="${!isFast && (isStepCond2 || isStepMedium || isStepSlow || isStepFinal) ? '2.5' : '1.8'}" fill="none" marker-end="url(${!isFast && (isStepCond2 || isStepMedium || isStepSlow || isStepFinal) ? '#arr-crimson-m4' : '#arr-m4'})" />

        <!-- Cond 2 -> Sedang (Kanan) -->
        <path d="M 235 222 L 290 222" stroke="${isStepMedium || (isMedium && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepMedium || (isMedium && isStepFinal) ? '2.8' : '1.8'}" fill="none" marker-end="url(${isStepMedium || (isMedium && isStepFinal) ? '#arr-emerald-m4' : '#arr-m4'})" />
        <!-- Cond 2 -> False (Bawah ke Lambat) -->
        <path d="M 170 248 L 170 274" stroke="${isSlow && (isStepSlow || isStepFinal) ? '#dc2626' : '#a8a29e'}" stroke-width="${isSlow && (isStepSlow || isStepFinal) ? '2.5' : '1.8'}" fill="none" marker-end="url(${isSlow && (isStepSlow || isStepFinal) ? '#arr-crimson-m4' : '#arr-m4'})" />

        <!-- Merge path to End -->
        <path d="M 350 160 L 350 326 L 230 326" stroke="${isFast && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 350 242 L 350 326" stroke="${isMedium && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 170 314 L 170 326" stroke="${isSlow && isStepFinal ? '#dc2626' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 170 326 L 170 336" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m4' : '#arr-m4'})" />

        <!-- 1. Start -->
        <g transform="translate(120, 10)">
          <rect width="100" height="24" rx="12" ry="12" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
          <text x="50" y="12" dominant-baseline="central" font-size="10.5" font-weight="700" fill="#065f46" text-anchor="middle">Mulai</text>
        </g>

        <!-- 2. Input -->
        <g transform="translate(90, 56)">
          <polygon points="16,0 160,0 144,38 0,38" fill="${isStepInit ? '#fef3c7' : '#f0fdfa'}" stroke="${isStepInit ? '#d97706' : '#0d9488'}" stroke-width="${isStepInit ? '2.8' : '1.5'}" />
          <text x="80" y="13" dominant-baseline="central" font-size="10" font-weight="600" fill="#134e4a" text-anchor="middle">Input kecepatan</text>
          <text x="80" y="27" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepInit ? '#b45309' : '#0f766e'}" text-anchor="middle">${this.currentInputVal} Mbps</text>
        </g>

        <!-- 3. Decision 1 (>= 50) -->
        <g transform="translate(105, 114)">
          <polygon points="65,0 130,26 65,52 0,26" fill="${isStepCond1 ? '#fef3c7' : '#fffbeb'}" stroke="${isStepCond1 ? '#d97706' : '#d97706'}" stroke-width="${isStepCond1 ? '2.8' : '1.8'}" />
          <text x="65" y="21" dominant-baseline="central" font-size="9" font-weight="700" fill="#78350f" text-anchor="middle">kecepatan &gt;= 50?</text>
          <text x="65" y="34" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#92400e" text-anchor="middle">${isEvaluated1 ? (isFast ? 'TRUE' : 'FALSE') : ''}</text>
        </g>

        <!-- Box Cepat -->
        <g transform="translate(290, 120)" opacity="${isStepFast ? '1' : (isEvaluated1 ? (isFast ? '0.85' : '0.35') : '0.85')}">
          <rect width="120" height="40" rx="4" ry="4" fill="${isStepFast ? '#ecfdf5' : '#ffffff'}" stroke="${isStepFast ? '#059669' : (isFast ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepFast ? '2.8' : '1.5'}" />
          <text x="60" y="15" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#047857" text-anchor="middle">Tampilkan:</text>
          <text x="60" y="28" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#065f46" text-anchor="middle">"Koneksi Cepat"</text>
        </g>

        <!-- 4. Decision 2 (>= 20) -->
        <g transform="translate(105, 196)" opacity="${!isFast ? '1' : '0.35'}">
          <polygon points="65,0 130,26 65,52 0,26" fill="${isStepCond2 ? '#fef3c7' : '#fffbeb'}" stroke="${isStepCond2 ? '#d97706' : '#d97706'}" stroke-width="${isStepCond2 ? '2.8' : '1.8'}" />
          <text x="65" y="21" dominant-baseline="central" font-size="9" font-weight="700" fill="#78350f" text-anchor="middle">kecepatan &gt;= 20?</text>
          <text x="65" y="34" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#92400e" text-anchor="middle">${isEvaluated2 ? (isMedium ? 'TRUE' : 'FALSE') : ''}</text>
        </g>

        <!-- Box Sedang -->
        <g transform="translate(290, 202)" opacity="${isStepMedium ? '1' : (isEvaluated2 ? (isMedium ? '0.85' : '0.35') : '0.85')}">
          <rect width="120" height="40" rx="4" ry="4" fill="${isStepMedium ? '#ecfdf5' : '#ffffff'}" stroke="${isStepMedium ? '#059669' : (isMedium ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepMedium ? '2.8' : '1.5'}" />
          <text x="60" y="15" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#047857" text-anchor="middle">Tampilkan:</text>
          <text x="60" y="28" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#065f46" text-anchor="middle">"Koneksi Sedang"</text>
        </g>

        <!-- Box Lambat -->
        <g transform="translate(110, 274)" opacity="${isStepSlow ? '1' : (isEvaluated2 ? (isSlow ? '0.85' : '0.35') : '0.85')}">
          <rect width="120" height="40" rx="4" ry="4" fill="${isStepSlow ? '#fef2f2' : '#ffffff'}" stroke="${isStepSlow ? '#dc2626' : (isSlow ? '#ef4444' : '#cbd5e1')}" stroke-width="${isStepSlow ? '2.8' : '1.5'}" />
          <text x="60" y="15" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#b91c1c" text-anchor="middle">Tampilkan:</text>
          <text x="60" y="28" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#991b1b" text-anchor="middle">"Koneksi Lambat"</text>
        </g>

        <!-- 5. End -->
        <g transform="translate(120, 336)">
          <rect width="100" height="24" rx="12" ry="12" fill="${isStepFinal ? '#ecfdf5' : '#f1f5f9'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="1.5" />
          <text x="50" y="12" dominant-baseline="central" font-size="10.5" font-weight="700" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Selesai</text>
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // KASUS 5: Mesin Minuman (SWITCH - CASE: 1, 2, 3, default)
  // =========================================================================
  private renderSvgM05(): string {
    const isCase1 = this.currentInputVal === 1;
    const isCase2 = this.currentInputVal === 2;
    const isCase3 = this.currentInputVal === 3;
    const isDef = !isCase1 && !isCase2 && !isCase3;

    const isStepInit = this.activeBranch === 'INIT' || (this.currentStep === 1 && !this.activeBranch);
    const isStepSwitch = this.activeBranch === 'CONDITION' || (this.currentStep === 2 && !this.activeBranch);
    const isStepCase1 = (this.activeBranch === 'BRANCH_IF' || this.activeBranch === 'CASE_1') && isCase1;
    const isStepCase2 = (this.activeBranch === 'BRANCH_IF' || this.activeBranch === 'CASE_2') && isCase2;
    const isStepCase3 = (this.activeBranch === 'BRANCH_IF' || this.activeBranch === 'CASE_3') && isCase3;
    const isStepDef = (this.activeBranch === 'BRANCH_ELSE' || this.activeBranch === 'DEFAULT') && isDef;
    const isStepFinal = this.activeBranch === 'OUTPUT';

    // Standby: evaluasi switch case
    const isEvaluated = this.currentStep >= 2;

    return `
      <svg viewBox="0 0 420 370" width="100%" height="370" style="max-width: 440px; display: block; font-family: var(--font-code);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-m5" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#78716c" />
          </marker>
          <marker id="arr-emerald-m5" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
          <marker id="arr-crimson-m5" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
          </marker>
          <marker id="arr-amber-m5" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
          </marker>
        </defs>

        <path d="M 210 34 L 210 58" stroke="${isStepInit ? '#d97706' : '#78716c'}" stroke-width="${isStepInit ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepInit ? '#arr-amber-m5' : '#arr-m5'})" />
        <path d="M 210 96 L 210 118" stroke="${isStepSwitch ? '#d97706' : '#78716c'}" stroke-width="${isStepSwitch ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepSwitch ? '#arr-amber-m5' : '#arr-m5'})" />

        <!-- Switch Branches down to each column -->
        <path d="M 210 158 L 55 158 L 55 190" stroke="${isStepCase1 || (isCase1 && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepCase1 || (isCase1 && isStepFinal) ? '2.8' : '1.5'}" fill="none" marker-end="url(${isStepCase1 || (isCase1 && isStepFinal) ? '#arr-emerald-m5' : '#arr-m5'})" />
        <path d="M 210 158 L 155 158 L 155 190" stroke="${isStepCase2 || (isCase2 && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepCase2 || (isCase2 && isStepFinal) ? '2.8' : '1.5'}" fill="none" marker-end="url(${isStepCase2 || (isCase2 && isStepFinal) ? '#arr-emerald-m5' : '#arr-m5'})" />
        <path d="M 210 158 L 265 158 L 265 190" stroke="${isStepCase3 || (isCase3 && isStepFinal) ? '#0f766e' : '#a8a29e'}" stroke-width="${isStepCase3 || (isCase3 && isStepFinal) ? '2.8' : '1.5'}" fill="none" marker-end="url(${isStepCase3 || (isCase3 && isStepFinal) ? '#arr-emerald-m5' : '#arr-m5'})" />
        <path d="M 210 158 L 365 158 L 365 190" stroke="${isStepDef || (isDef && isStepFinal) ? '#dc2626' : '#a8a29e'}" stroke-width="${isStepDef || (isDef && isStepFinal) ? '2.8' : '1.5'}" fill="none" marker-end="url(${isStepDef || (isDef && isStepFinal) ? '#arr-crimson-m5' : '#arr-m5'})" />

        <!-- Merge Lines down to End -->
        <path d="M 55 240 L 55 285 L 210 285" stroke="${isCase1 && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 155 240 L 155 285 L 210 285" stroke="${isCase2 && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 265 240 L 265 285 L 210 285" stroke="${isCase3 && isStepFinal ? '#0f766e' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 365 240 L 365 285 L 210 285" stroke="${isDef && isStepFinal ? '#dc2626' : '#a8a29e'}" stroke-width="1.5" fill="none" />
        <path d="M 210 285 L 210 318" stroke="${isStepFinal ? '#d97706' : '#78716c'}" stroke-width="${isStepFinal ? '2.5' : '1.8'}" fill="none" marker-end="url(${isStepFinal ? '#arr-amber-m5' : '#arr-m5'})" />

        <!-- 1. Start -->
        <g transform="translate(160, 10)">
          <rect width="100" height="24" rx="12" ry="12" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
          <text x="50" y="12" dominant-baseline="central" font-size="10.5" font-weight="700" fill="#065f46" text-anchor="middle">Mulai</text>
        </g>

        <!-- 2. Input -->
        <g transform="translate(130, 58)">
          <polygon points="16,0 160,0 144,38 0,38" fill="${isStepInit ? '#fef3c7' : '#f0fdfa'}" stroke="${isStepInit ? '#d97706' : '#0d9488'}" stroke-width="${isStepInit ? '2.8' : '1.5'}" />
          <text x="80" y="13" dominant-baseline="central" font-size="10" font-weight="600" fill="#134e4a" text-anchor="middle">Input pilihan</text>
          <text x="80" y="27" dominant-baseline="central" font-size="11" font-weight="700" fill="${isStepInit ? '#b45309' : '#0f766e'}" text-anchor="middle">Tombol [ ${this.currentInputVal} ]</text>
        </g>

        <!-- 3. Switch Selector Box -->
        <g transform="translate(125, 118)">
          <polygon points="15,0 155,0 170,20 155,40 15,40 0,20" fill="${isStepSwitch ? '#fef3c7' : '#fffbeb'}" stroke="${isStepSwitch ? '#d97706' : '#d97706'}" stroke-width="${isStepSwitch ? '2.8' : '1.8'}" />
          <text x="85" y="20" dominant-baseline="central" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle">PILIH (pilihan)</text>
        </g>

        <!-- Case 1 -->
        <g transform="translate(10, 192)" opacity="${isStepCase1 ? '1' : (isEvaluated ? (isCase1 ? '0.85' : '0.35') : '0.85')}">
          <rect width="90" height="48" rx="4" ry="4" fill="${isStepCase1 ? '#ecfdf5' : '#ffffff'}" stroke="${isStepCase1 ? '#059669' : (isCase1 ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepCase1 ? '2.8' : '1.5'}" />
          <text x="45" y="16" dominant-baseline="central" font-size="9" font-weight="700" fill="#065f46" text-anchor="middle">Kasus 1</text>
          <text x="45" y="32" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#047857" text-anchor="middle">"Kopi Hangat"</text>
        </g>

        <!-- Case 2 -->
        <g transform="translate(110, 192)" opacity="${isStepCase2 ? '1' : (isEvaluated ? (isCase2 ? '0.85' : '0.35') : '0.85')}">
          <rect width="90" height="48" rx="4" ry="4" fill="${isStepCase2 ? '#ecfdf5' : '#ffffff'}" stroke="${isStepCase2 ? '#059669' : (isCase2 ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepCase2 ? '2.8' : '1.5'}" />
          <text x="45" y="16" dominant-baseline="central" font-size="9" font-weight="700" fill="#065f46" text-anchor="middle">Kasus 2</text>
          <text x="45" y="32" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#047857" text-anchor="middle">"Teh Manis"</text>
        </g>

        <!-- Case 3 -->
        <g transform="translate(220, 192)" opacity="${isStepCase3 ? '1' : (isEvaluated ? (isCase3 ? '0.85' : '0.35') : '0.85')}">
          <rect width="90" height="48" rx="4" ry="4" fill="${isStepCase3 ? '#ecfdf5' : '#ffffff'}" stroke="${isStepCase3 ? '#059669' : (isCase3 ? '#10b981' : '#cbd5e1')}" stroke-width="${isStepCase3 ? '2.8' : '1.5'}" />
          <text x="45" y="16" dominant-baseline="central" font-size="9" font-weight="700" fill="#065f46" text-anchor="middle">Kasus 3</text>
          <text x="45" y="32" dominant-baseline="central" font-size="8.5" font-weight="600" fill="#047857" text-anchor="middle">"Susu Segar"</text>
        </g>

        <!-- Standar -->
        <g transform="translate(320, 192)" opacity="${isStepDef ? '1' : (isEvaluated ? (isDef ? '0.85' : '0.35') : '0.85')}">
          <rect width="95" height="48" rx="4" ry="4" fill="${isStepDef ? '#fef2f2' : '#ffffff'}" stroke="${isStepDef ? '#dc2626' : (isDef ? '#ef4444' : '#cbd5e1')}" stroke-width="${isStepDef ? '2.8' : '1.5'}" />
          <text x="47" y="16" dominant-baseline="central" font-size="9" font-weight="700" fill="#991b1b" text-anchor="middle">Standar</text>
          <text x="47" y="32" dominant-baseline="central" font-size="8" font-weight="600" fill="#b91c1c" text-anchor="middle">"Menu Tidak Tersedia"</text>
        </g>

        <!-- 5. End -->
        <g transform="translate(160, 318)">
          <rect width="100" height="24" rx="12" ry="12" fill="${isStepFinal ? '#ecfdf5' : '#f1f5f9'}" stroke="${isStepFinal ? '#059669' : '#64748b'}" stroke-width="1.5" />
          <text x="50" y="12" dominant-baseline="central" font-size="10.5" font-weight="700" fill="${isStepFinal ? '#065f46' : '#334155'}" text-anchor="middle">Selesai</text>
        </g>
      </svg>
    `;
  }
}
