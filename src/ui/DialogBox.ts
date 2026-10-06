// src/ui/DialogBox.ts - Kotak Dialog RPG Typewriter & NPC Scaffolding (SSOT: DESIGN.md Section 4.4 & antislop-ui)
import { soundFx } from '../services/AudioService';
import { renderPixelIcon } from './UIManager';

export interface DialogChoice {
  text: string;
  onSelect: () => void;
}

export interface DialogMessage {
  speaker: string;
  avatarType?: 'teacher' | 'student' | 'hero' | 'none';
  text: string;
  choices?: DialogChoice[];
}

export class DialogBox {
  private container: HTMLElement;
  private currentMessage: DialogMessage | null = null;
  private typewriterInterval: number | null = null;
  private isTyping = false;
  private currentCharacterIndex = 0;
  private onCompleteCallback?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'rpg-dialog-box pixel-card';
    this.container.style.cssText = `
      margin: 12px;
      padding: 16px;
      display: none;
      position: relative;
      cursor: pointer;
      user-select: none;
      border: 2px solid var(--border-retro);
      border-radius: 10px;
      background-color: var(--surface-panel);
      box-shadow: 0 4px 16px rgba(28, 25, 23, 0.08);
    `;

    this.container.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.dialog-choice-btn')) {
        return;
      }
      this.handleClick();
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public show(message: DialogMessage, onComplete?: () => void): void {
    this.currentMessage = message;
    this.onCompleteCallback = onComplete;
    this.container.style.display = 'block';
    this.startTypewriter();
  }

  public hide(): void {
    this.clearTypewriter();
    this.container.style.display = 'none';
    this.currentMessage = null;
    this.isTyping = false;
  }

  public isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  private handleClick(): void {
    if (this.isTyping) {
      this.skipTypewriter();
    } else {
      if (!this.currentMessage?.choices || this.currentMessage.choices.length === 0) {
        this.onCompleteCallback?.();
      }
    }
  }

  private clearTypewriter(): void {
    if (this.typewriterInterval !== null) {
      window.clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
  }

  private getAvatarHtml(type?: 'teacher' | 'student' | 'hero' | 'none'): string {
    if (type === 'teacher') {
      return `<img src="/assets/images/pak_budi_portrait.jpg" alt="Pak Budi" style="
        width: 52px;
        height: 52px;
        border-radius: 8px;
        border: 2px solid var(--secondary);
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      " />`;
    }
    if (type === 'student') {
      return `<img src="/assets/images/character_evaluation.webp" alt="Raka (Murid SMA)" style="
        width: 52px;
        height: 52px;
        border-radius: 8px;
        border: 2px solid var(--primary);
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      " />`;
    }
    if (type === 'hero') {
      return `<img src="/assets/images/character_battle.webp" alt="Petualang" style="
        width: 52px;
        height: 52px;
        border-radius: 8px;
        border: 2px solid var(--warning);
        object-fit: cover;
        background-color: var(--bg-app);
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      " />`;
    }
    return '';
  }

  private startTypewriter(): void {
    if (!this.currentMessage) return;

    this.clearTypewriter();
    this.isTyping = true;
    this.currentCharacterIndex = 0;

    const fullText = this.currentMessage.text;
    const speaker = this.currentMessage.speaker;
    const avatarHtml = this.getAvatarHtml(this.currentMessage.avatarType);

    this.container.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        ${avatarHtml}
        <div style="flex: 1; min-width: 0;">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background-color: var(--surface-panel-alt);
            border: 1.5px solid var(--border-retro);
            border-radius: 6px;
            font-family: var(--font-pixel);
            font-size: 9.5px;
            color: var(--primary);
            margin-bottom: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--warning);"></span>
            <span>${speaker}</span>
          </div>
          <div class="dialog-text-content" style="
            font-family: var(--font-ui);
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-primary);
            min-height: 44px;
            font-weight: 500;
          "></div>
        </div>
      </div>
      <div class="dialog-choices-container" style="margin-top: 14px; display: none; flex-direction: column; gap: 8px;"></div>
      <div class="dialog-next-cursor" style="
        position: absolute;
        bottom: 10px;
        right: 16px;
        font-family: var(--font-code);
        font-size: 10px;
        font-weight: 700;
        color: var(--warning);
        display: none;
        align-items: center;
        gap: 5px;
        letter-spacing: 0.3px;
        opacity: 0.95;
      ">
        ${renderPixelIcon('arrow-down', 10, 'var(--warning)')} <span>Tekan untuk lanjut</span>
      </div>
    `;

    const textContentEl = this.container.querySelector<HTMLElement>('.dialog-text-content');
    if (!textContentEl) return;

    // Typewriter loop: 22ms per karakter
    this.typewriterInterval = window.setInterval(() => {
      this.currentCharacterIndex++;
      if (textContentEl) {
        textContentEl.textContent = fullText.slice(0, this.currentCharacterIndex);
      }

      if (this.currentCharacterIndex % 2 === 0) {
        soundFx.playDialogTick();
      }

      if (this.currentCharacterIndex >= fullText.length) {
        this.finishTyping();
      }
    }, 22);
  }

  private skipTypewriter(): void {
    if (!this.currentMessage) return;
    this.clearTypewriter();
    const textContentEl = this.container.querySelector<HTMLElement>('.dialog-text-content');
    if (textContentEl) {
      textContentEl.textContent = this.currentMessage.text;
    }
    this.finishTyping();
  }

  private finishTyping(): void {
    this.clearTypewriter();
    this.isTyping = false;

    const nextCursor = this.container.querySelector<HTMLElement>('.dialog-next-cursor');
    const choicesContainer = this.container.querySelector<HTMLElement>('.dialog-choices-container');

    if (this.currentMessage?.choices && this.currentMessage.choices.length > 0) {
      if (choicesContainer) {
        choicesContainer.style.display = 'flex';
        choicesContainer.innerHTML = '';
        this.currentMessage.choices.forEach((choice, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'game-btn game-btn-secondary dialog-choice-btn';
          btn.style.cssText = `
            text-align: left;
            justify-content: flex-start;
            padding: 10px 14px;
            font-size: 13px;
            width: 100%;
            min-height: 46px;
          `;
          btn.textContent = `[${idx + 1}] ${choice.text}`;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            soundFx.playButtonBlip();
            choice.onSelect();
          });
          choicesContainer.appendChild(btn);
        });
      }
    } else {
      if (nextCursor) {
        nextCursor.style.display = 'block';
      }
    }
  }
}
