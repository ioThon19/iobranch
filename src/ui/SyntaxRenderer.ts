// src/ui/SyntaxRenderer.ts - Pengendali Saklar Dwi-Bahasa Instan (SSOT: DESIGN.md Section 4.2 & SDD.md Section 3.1)
import { CodeLine } from '../types/module.types';

export type SyntaxMode = 'pseudo' | 'c';

export interface SyntaxRendererOptions {
  lines: CodeLine[];
  initialMode?: SyntaxMode;
  inputValue?: number;
  onSyntaxChange?: (mode: SyntaxMode) => void;
}

export class SyntaxRenderer {
  private container: HTMLElement;
  private lines: CodeLine[];
  private currentMode: SyntaxMode;
  private activeLineNumber: number | null = null;
  private executedBranch: 'IF' | 'ELSE' | null = null;
  private skippedLines: Set<number> = new Set();
  private inputValue: number = 0;
  private onSyntaxChange?: (mode: SyntaxMode) => void;

  constructor(options: SyntaxRendererOptions) {
    this.lines = options.lines;
    this.currentMode = options.initialMode ?? 'pseudo';
    this.inputValue = options.inputValue ?? 0;
    this.onSyntaxChange = options.onSyntaxChange;
    this.container = document.createElement('div');
    this.container.className = 'syntax-renderer-wrapper';
    this.render();
  }

  public setLines(lines: CodeLine[], inputValue?: number): void {
    this.lines = lines;
    if (inputValue !== undefined) {
      this.inputValue = inputValue;
    }
    this.render();
  }

  public setInputValue(value: number): void {
    this.inputValue = value;
    this.render();
  }

  public setSyntax(mode: SyntaxMode): void {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.onSyntaxChange?.(mode);
    this.render();
  }

  public getSyntax(): SyntaxMode {
    return this.currentMode;
  }

  public setActiveLine(lineNumber: number | null): void {
    this.activeLineNumber = lineNumber;
    this.updateLineStates();
  }

  public setExecutedBranch(branch: 'IF' | 'ELSE' | null): void {
    this.executedBranch = branch;
    this.updateLineStates();
  }

  public setSkippedLines(lines: number[]): void {
    this.skippedLines = new Set(lines);
    this.updateLineStates();
  }

  public resetHighlights(): void {
    this.activeLineNumber = null;
    this.executedBranch = null;
    this.skippedLines.clear();
    this.updateLineStates();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public render(): HTMLElement {
    this.container.style.cssText = `
      background: #18181b;
      border: 1.5px solid #27272a;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      width: 100%;
      box-sizing: border-box;
    `;

    this.container.innerHTML = `
      <div class="syntax-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 6px; flex-wrap: wrap; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0;"></span>
          <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: #e4e4e7; letter-spacing: 0.4px;">
            KODE SUMBER LOGIKA
          </span>
        </div>
        <div class="syntax-switch" style="display: inline-flex; border: 1px solid #3f3f46; border-radius: 6px; overflow: hidden; background-color: #27272a; padding: 2px; gap: 2px;">
          <button type="button" class="syntax-toggle-btn ${this.currentMode === 'pseudo' ? 'active' : ''}" data-mode="pseudo" style="
            padding: 3px 8px;
            font-family: var(--font-code);
            font-size: 10px;
            font-weight: 700;
            background-color: ${this.currentMode === 'pseudo' ? 'var(--primary)' : 'transparent'};
            color: ${this.currentMode === 'pseudo' ? '#ffffff' : '#a1a1aa'};
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
          ">
            Pseudocode
          </button>
          <button type="button" class="syntax-toggle-btn ${this.currentMode === 'c' ? 'active' : ''}" data-mode="c" style="
            padding: 3px 8px;
            font-family: var(--font-code);
            font-size: 10px;
            font-weight: 700;
            background-color: ${this.currentMode === 'c' ? 'var(--primary)' : 'transparent'};
            color: ${this.currentMode === 'c' ? '#ffffff' : '#a1a1aa'};
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
          ">
            Bahasa C
          </button>
        </div>
      </div>
      <div class="code-container" style="width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 4px 0; box-sizing: border-box; scrollbar-width: thin;">
        <div class="code-lines-body" style="display: flex; flex-direction: column; gap: 2px; width: 100%; min-width: 100%; box-sizing: border-box;">
          ${this.generateLinesHtml()}
        </div>
      </div>
    `;

    // Pasang event listener saklar dwi-bahasa
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('.syntax-toggle-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.dataset.mode as SyntaxMode;
        this.setSyntax(mode);
      });
    });

    this.updateLineStates();
    return this.container;
  }

  private generateLinesHtml(): string {
    return this.lines
      .map((line) => {
        const rawText = this.currentMode === 'pseudo' ? line.pseudoText : line.cText;
        const textWithInput = rawText.replace('[INPUT]', String(this.inputValue));
        const highlighted = this.highlightSyntax(textWithInput, this.currentMode);

        return `
          <div class="code-line" data-line="${line.lineNumber}" style="display: flex; align-items: baseline; min-height: 24px; padding: 2px 6px; font-family: var(--font-code); font-size: 11.5px; line-height: 1.5; border-radius: 4px; transition: background 0.15s ease; box-sizing: border-box; gap: 6px;">
            <span class="line-cursor" style="display: inline-block; width: 8px; flex-shrink: 0; color: var(--warning); font-weight: bold; user-select: none;"></span>
            <span class="line-num" style="display: inline-block; width: 18px; flex-shrink: 0; text-align: right; margin-right: 4px; color: #71717a; font-size: 11px; user-select: none;">${line.lineNumber}</span>
            <span class="line-code" style="flex: 1; min-width: 0; white-space: pre-wrap; word-break: break-word; color: #f4f4f5; font-family: var(--font-code); font-size: 11.5px;">${highlighted}</span>
            <span class="line-skipped-tag" style="display: none; margin-left: auto; flex-shrink: 0; font-size: 9.5px; color: #a1a1aa; font-family: var(--font-ui); font-style: italic; padding-left: 8px; white-space: nowrap;">[dilewati komputer]</span>
          </div>
        `;
      })
      .join('');
  }

  private highlightSyntax(text: string, mode: SyntaxMode): string {
    // Sanitasi HTML terlebih dahulu
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Ekstraksi komentar jika ada (// ...)
    const comments: string[] = [];
    escaped = escaped.replace(/(\/\/.*$)/g, (match) => {
      comments.push(`<span class="tok-comment">${match}</span>`);
      return `___COMMENT_TOK_${comments.length - 1}___`;
    });

    // 2. Ekstraksi string literal dengan placeholder agar tidak terpengaruh tokenisasi kata kunci/angka
    const strings: string[] = [];
    escaped = escaped.replace(/(&quot;.*?&quot;|".*?"|'.*?')/g, (match) => {
      strings.push(`<span class="tok-str">${match}</span>`);
      return `___STR_TOK_${strings.length - 1}___`;
    });

    // 3. Kata kunci sesuai mode
    if (mode === 'pseudo') {
      escaped = escaped.replace(
        /\b(JIKA|MAKA|SELAIN_ITU|SELESAI|TAMPILKAN|MASUKAN|KASUS|LAINNYA|PILIH|STANDAR|BACA)\b/g,
        '<span class="tok-kw">$1</span>'
      );
    } else {
      escaped = escaped.replace(
        /\b(if|else|switch|case|break|default|int|return|printf|scanf)\b/g,
        '<span class="tok-kw">$1</span>'
      );
    }

    // 4. Angka numerik
    escaped = escaped.replace(
      /\b(\d+)\b/g,
      '<span class="tok-num">$1</span>'
    );

    // 5. Kembalikan string literal dan komentar
    escaped = escaped.replace(/___STR_TOK_(\d+)___/g, (_, idx) => strings[Number(idx)] ?? '');
    escaped = escaped.replace(/___COMMENT_TOK_(\d+)___/g, (_, idx) => comments[Number(idx)] ?? '');

    return escaped;
  }

  private updateLineStates(): void {
    const lineElements = this.container.querySelectorAll<HTMLElement>('.code-line');
    lineElements.forEach((el) => {
      const lineNum = Number(el.dataset.line);
      const cursor = el.querySelector<HTMLElement>('.line-cursor');

      // Reset kelas
      el.classList.remove('active-line', 'true-branch', 'false-branch', 'skipped-branch');
      el.style.backgroundColor = 'transparent';
      el.style.borderLeft = 'none';
      el.style.opacity = '1';
      if (cursor) cursor.textContent = '';

      // Terapkan cabang yang dilewati (skipped branch)
      const skippedTag = el.querySelector<HTMLElement>('.line-skipped-tag');
      if (this.skippedLines.has(lineNum)) {
        el.classList.add('skipped-branch');
        el.style.opacity = 'var(--state-skipped-opacity)';
        if (skippedTag) skippedTag.style.display = 'inline';
      } else {
        if (skippedTag) skippedTag.style.display = 'none';
      }

      // Terapkan penanda cabang yang dieksekusi
      if (this.executedBranch) {
        const lineObj = this.lines.find((l) => l.lineNumber === lineNum);
        if (lineObj && lineObj.branchType === (this.executedBranch === 'IF' ? 'BRANCH_IF' : 'BRANCH_ELSE')) {
          el.classList.add(this.executedBranch === 'IF' ? 'true-branch' : 'false-branch');
        }
      }

      // Terapkan penanda baris aktif
      if (this.activeLineNumber === lineNum) {
        el.classList.add('active-line');
        el.style.backgroundColor = 'rgba(15, 118, 110, 0.2)';
        el.style.borderLeft = '4px solid var(--state-active-step)';
        if (cursor) cursor.textContent = '>';
      }
    });
  }
}
