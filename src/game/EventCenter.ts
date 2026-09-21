// src/game/EventCenter.ts - Jembatan Komunikasi Asinkronus Phaser 3 <-> DOM UI (SSOT: SDD.md Section 3.1.D)
import EventEmitter from 'eventemitter3';

export class AppEventCenter extends EventEmitter {
  public shutdown(): void {
    this.removeAllListeners();
  }

  public destroy(): void {
    this.removeAllListeners();
  }
}

export const EventCenter = new AppEventCenter();
