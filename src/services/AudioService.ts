// src/services/AudioService.ts - Sintesis Suara Retro 8-Bit Native Web Audio API (SSOT: SDD.md Section 3.6 & DESIGN.md Section 5.2)

export class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterVolume = 0.1;

  /**
   * Inisialisasi AudioContext pada interaksi/sentuhan pertama pengguna
   */
  public initOnFirstTouch(): void {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  /**
   * Membangkitkan nada sintetis melalui osilator peramban
   */
  public playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.08): void {
    if (this.isMuted || !this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = volume * (this.masterVolume / 0.1);
      gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback jika osilator gagal
    }
  }

  /**
   * Efek suara klik mikro mesin tik untuk dialog NPC (480 Hz)
   */
  public playDialogTick(): void {
    this.playTone(480, 0.02, 'square', 0.04);
  }

  /**
   * Efek suara blip tombol interaktif retro (330 Hz)
   */
  public playButtonBlip(): void {
    this.playTone(330, 0.04, 'square', 0.08);
  }

  /**
   * Efek suara nada tinggi kondisi TRUE / Langkah Berhasil (587.33 Hz / D5)
   */
  public playLogicTrue(): void {
    this.playTone(587.33, 0.08, 'triangle', 0.1);
  }

  /**
   * Efek suara nada rendah kondisi FALSE / Cabang Alternatif (220.00 Hz / A3)
   */
  public playLogicFalse(): void {
    this.playTone(220.00, 0.12, 'sawtooth', 0.08);
  }

  /**
   * Efek suara kemenangan 2 Bintang (Arpeggio Retro C5 - E5 - G5 - C6)
   */
  public playBranchSuccessChime(): void {
    if (this.isMuted || !this.ctx) return;

    const fanfare = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 70 },
      { freq: 783.99, delay: 140 },
      { freq: 1046.50, delay: 210 }
    ];

    fanfare.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, 0.08, 'triangle', 0.1);
      }, note.delay);
    });
  }

  /**
   * Efek suara klik stepper langkah penelusuran (392 Hz)
   */
  public playStepTick(): void {
    this.playTone(392, 0.03, 'square', 0.05);
  }

  public playVictoryFanfare(): void {
    this.playBranchSuccessChime();
  }

  // =========================================================================
  // Manajemen Musik Latar (BGM Backsound)
  // =========================================================================
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;
  private bgmVolume = 0.35;
  private bgmListeners: Array<(isPlaying: boolean) => void> = [];

  /**
   * Menginisialisasi pemutar musik latar (backsound.mp3)
   */
  public initBgm(src = '/assets/backsound.mp3'): void {
    if (typeof window === 'undefined' || this.bgmAudio) return;
    try {
      this.bgmAudio = new Audio(src);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
      this.bgmAudio.preload = 'auto';

      this.bgmAudio.addEventListener('ended', () => {
        if (this.isBgmPlaying && this.bgmAudio) {
          this.bgmAudio.currentTime = 0;
          this.bgmAudio.play().catch(() => {});
        }
      });
    } catch {
      // Peramban tanpa dukungan Audio
    }
  }

  /**
   * Saklar toggle ON / OFF pemutaran musik latar
   * Secara default mati (OFF) saat web dibuka, menyala saat ditekan pengguna
   */
  public toggleBgm(): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.bgmAudio) {
      this.initBgm();
    }

    if (!this.bgmAudio) return false;

    if (this.isBgmPlaying) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
      this.notifyBgmListeners(false);
    } else {
      this.initOnFirstTouch();
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
      this.bgmAudio
        .play()
        .then(() => {
          this.isBgmPlaying = true;
          this.notifyBgmListeners(true);
        })
        .catch((err) => {
          console.warn('Pemutaran musik latar terhalang izin browser:', err);
          this.isBgmPlaying = false;
          this.notifyBgmListeners(false);
        });
      this.isBgmPlaying = true;
      this.notifyBgmListeners(true);
    }

    return this.isBgmPlaying;
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }

  public setBgmVolume(volumePercent: number): void {
    const clamped = Math.max(0, Math.min(100, volumePercent));
    this.bgmVolume = (clamped / 100) * 0.7;
    if (this.bgmAudio && !this.isMuted) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  public getBgmVolume(): number {
    return Math.round((this.bgmVolume / 0.7) * 100);
  }

  public onBgmChange(listener: (isPlaying: boolean) => void): () => void {
    this.bgmListeners.push(listener);
    return () => {
      this.bgmListeners = this.bgmListeners.filter((l) => l !== listener);
    };
  }

  private notifyBgmListeners(isPlaying: boolean): void {
    this.bgmListeners.forEach((fn) => {
      try {
        fn(isPlaying);
      } catch {
        // Abaikan error pada listener
      }
    });
  }

  /**
   * Mengubah status mute audio (bisu)
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    return this.isMuted;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public setVolume(volPercentage: number): void {
    const clamped = Math.max(0, Math.min(100, volPercentage));
    this.masterVolume = (clamped / 100) * 0.2;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
}

export const soundFx = new AudioService();
