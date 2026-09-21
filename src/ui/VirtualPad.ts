// src/ui/VirtualPad.ts - Pengontrol D-Pad Virtual Responsif untuk Mobile & Tablet
import { EventCenter } from '../game/EventCenter';
import { renderPixelIcon } from './UIManager';

export class VirtualPad {
  private container: HTMLElement | null = null;
  private isVisible = true;

  public init(parentContainerId = 'game-container'): void {
    const parent = document.getElementById(parentContainerId);
    if (!parent) return;

    // Hindari duplikasi jika sudah ada
    if (parent.querySelector('.virtual-controls-layer')) return;

    this.container = document.createElement('div');
    this.container.className = 'virtual-controls-layer';

    this.container.innerHTML = `
      <!-- D-Pad Arah Sentuh (Kiri Bawah) -->
      <div class="virtual-dpad" role="group" aria-label="Kontrol Arah D-Pad">
        <button type="button" class="dpad-btn dpad-up" data-x="0" data-y="-1" aria-label="Gerak ke Atas">
          ${renderPixelIcon('arrow-up', 14, '#f7f5f0')}
        </button>
        <div class="dpad-middle-row" style="display: contents;">
          <button type="button" class="dpad-btn dpad-left" data-x="-1" data-y="0" aria-label="Gerak ke Kiri">
            ${renderPixelIcon('arrow-left', 14, '#f7f5f0')}
          </button>
          <div class="dpad-center-hub">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4);"></span>
          </div>
          <button type="button" class="dpad-btn dpad-right" data-x="1" data-y="0" aria-label="Gerak ke Kanan">
            ${renderPixelIcon('arrow-right', 14, '#f7f5f0')}
          </button>
        </div>
        <button type="button" class="dpad-btn dpad-down" data-x="0" data-y="1" aria-label="Gerak ke Bawah">
          ${renderPixelIcon('arrow-down', 14, '#f7f5f0')}
        </button>
      </div>

      <!-- Tombol Aksi Sentuh (Kanan Bawah) -->
      <div class="virtual-action-group">
        <button type="button" class="virtual-action-btn" id="btn-vpad-action" aria-label="Tombol Aksi Masuk / Interaksi">
          ${renderPixelIcon('play', 10, '#ffffff')}
          <span>AKSI</span>
        </button>
      </div>
    `;

    parent.appendChild(this.container);
    this.bindEvents();

    // Dengarkan pergantian layar: D-Pad hanya untuk OVERWORLD (Taman Kota)
    EventCenter.on('SCREEN_CHANGED', (screen: string) => {
      this.setVisibility(screen === 'OVERWORLD');
    });

    // Default sembunyikan jika bukan OVERWORLD
    this.setVisibility(false);
  }

  private bindEvents(): void {
    if (!this.container) return;

    const dpadButtons = this.container.querySelectorAll<HTMLButtonElement>('.dpad-btn');
    dpadButtons.forEach((btn) => {
      const x = parseFloat(btn.dataset.x || '0');
      const y = parseFloat(btn.dataset.y || '0');

      const startMove = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('active');
        EventCenter.emit('HERO_VIRTUAL_MOVE', { x, y });
      };

      const stopMove = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.remove('active');
        EventCenter.emit('HERO_VIRTUAL_MOVE', { x: 0, y: 0 });
      };

      btn.addEventListener('pointerdown', startMove);
      btn.addEventListener('pointerup', stopMove);
      btn.addEventListener('pointercancel', stopMove);
      btn.addEventListener('pointerleave', stopMove);
    });

    const actionBtn = this.container.querySelector<HTMLButtonElement>('#btn-vpad-action');
    if (actionBtn) {
      actionBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        EventCenter.emit('HERO_INTERACT');
      });
    }
  }

  public setVisibility(visible: boolean): void {
    this.isVisible = visible;
    if (this.container) {
      // Menggunakan empty string agar mematuhi media query desktop (display: none di >1024px)
      this.container.style.display = visible ? '' : 'none';
    }
  }

  public toggleVisibility(): boolean {
    this.setVisibility(!this.isVisible);
    return this.isVisible;
  }
}

export const virtualPad = new VirtualPad();
