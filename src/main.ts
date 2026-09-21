// src/main.ts - Titik Masuk Utama Aplikasi iobranch (SSOT: SDD.md Section 1.2 & DESIGN.md)
import './style.css';
import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { soundFx } from './services/AudioService';
import { UIManager } from './ui/UIManager';
import { virtualPad } from './ui/VirtualPad';

console.log('[iobranch] Initializing Phaser 3 Game World and DOM UI Overlay...');

// Inisialisasi AudioContext pada interaksi/sentuhan pertama
window.addEventListener('pointerdown', () => {
  soundFx.initOnFirstTouch();
}, { once: true });

window.addEventListener('keydown', () => {
  soundFx.initOnFirstTouch();
}, { once: true });

// Buat instance Game Canvas Phaser 3
export const phaserGame = new Phaser.Game(gameConfig);
(window as unknown as { phaserGame: Phaser.Game }).phaserGame = phaserGame;

// Inisialisasi UIManager untuk 12 layar DOM Overlay
export const uiManager = new UIManager('ui-overlay');
(window as unknown as { uiManagerInstance: UIManager }).uiManagerInstance = uiManager;
void uiManager.init();

// Inisialisasi Kontrol Sentuh D-Pad Virtual untuk Mobile & Tablet
virtualPad.init('game-container');

// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Jalur cadangan luring
    });
  });
}
