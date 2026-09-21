// src/game/scenes/WorldScene.ts - Dunia Game Canvas 2D Pixel Art Kota Harmoni (SSOT: SDD.md Section 3.1.B & Lembar Referensi)
import Phaser from 'phaser';
import { EventCenter } from '../EventCenter';
import { soundFx } from '../../services/AudioService';

export class WorldScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite;
  private partnerHero!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private proximityTooltip!: Phaser.GameObjects.Text;
  private riverObstacles!: Phaser.Physics.Arcade.StaticGroup;
  private targetPoint: { x: number; y: number } | null = null;
  private targetMarker: Phaser.GameObjects.Arc | null = null;
  private virtualMoveVector: { x: number; y: number } = { x: 0, y: 0 };
  private currentNearTarget: { name: string; x: number; y: number; screen: string } | null = null;

  // Pin Lokasi Interaktif
  private locationPins: { [key: string]: Phaser.GameObjects.Sprite } = {};

  constructor() {
    super({ key: 'WorldScene' });
  }

  public create(): void {
    this.buildKotaHarmoniEnvironment();
    this.createWorldCollisionObstacles();
    this.createInteractiveLandmarksAndPins();
    this.createHeroAndCompanion();
    this.setupInputControls();
    this.createHudOverlays();
    this.registerEventListeners();
  }

  public update(): void {
    this.handlePlayerMovement();
    this.updatePartnerCompanion();
    this.checkBuildingProximity();
  }

  // =========================================================================
  // 1. Pembangunan Lingkungan Peta Kota Harmoni (16-Bit Overworld Map)
  // =========================================================================
  private buildKotaHarmoniEnvironment(): void {
    // Peta Kota Harmoni 16-Bit Utuh (480x270 px)
    this.add.image(240, 135, 'overworld_map').setDisplaySize(480, 270).setDepth(0);
  }

  // =========================================================================
  // 1.B. Rintangan Fisik Dunia: Sungai, Bangunan, & Aset Peta (Solid Colliders)
  // =========================================================================
  private createWorldCollisionObstacles(): void {
    this.riverObstacles = this.physics.add.staticGroup();

    // Helper untuk membuat obstacle tak kasat mata
    const addObstacle = (x: number, y: number, w: number, h: number) => {
      const rect = this.add.rectangle(x, y, w, h);
      this.physics.add.existing(rect, true);
      this.riverObstacles.add(rect);
      return rect;
    };

    // --- 1. ALIRAN SUNGAI & PAGAR JEMBATAN ---
    // Sungai Utara (di atas jembatan)
    addObstacle(240, 57, 44, 114);
    // Sungai Selatan (di bawah jembatan)
    addObstacle(240, 213, 44, 114);
    // Pagar Pembatas Jembatan Sisi Atas
    addObstacle(240, 115, 88, 6);
    // Pagar Pembatas Jembatan Sisi Bawah
    addObstacle(240, 155, 88, 6);

    // --- 2. GEDUNG SEKOLAH (Barat Laut / Kiri Atas) ---
    // Badan Utama Gedung Sekolah & Atap Oranye
    addObstacle(96, 46, 132, 60);
    // Sayap Kiri Gedung Sekolah
    addObstacle(50, 91, 32, 30);
    // Sayap Kanan Gedung Sekolah
    addObstacle(142, 91, 32, 30);
    // Semak & Pagar Pembatas Sisi Barat Sekolah
    addObstacle(20, 68, 14, 96);

    // --- 3. GEDUNG PERPUSTAKAAN (Timur Laut / Kanan Atas) ---
    // Struktur Utama Gedung Bertingkat Abu-abu
    addObstacle(391, 56, 114, 80);
    // Semak Pembatas Sisi Kiri Perpustakaan
    addObstacle(324, 68, 14, 90);
    // Semak Pembatas Sisi Kanan Perpustakaan
    addObstacle(456, 68, 14, 90);

    // --- 4. TAMAN KOTA & AIR MANCUR (Barat Daya / Kiri Bawah) ---
    // Kolam Air Mancur Batu Melingkar
    addObstacle(104, 196, 32, 28);
    // 4 Petak Bunga di sekeliling air mancur
    addObstacle(80, 173, 14, 14);
    addObstacle(128, 173, 14, 14);
    addObstacle(80, 219, 14, 14);
    addObstacle(128, 219, 14, 14);
    // Rumpun Pohon Taman Kiri Atas
    addObstacle(42, 168, 28, 36);
    // Rumpun Pohon Taman Kanan Atas (Tepi Sungai)
    addObstacle(164, 168, 26, 36);
    // Rumpun Pohon Taman Kiri Bawah
    addObstacle(42, 228, 28, 36);
    // Rumpun Pohon Taman Kanan Bawah (Tepi Sungai)
    addObstacle(164, 228, 26, 36);

    // --- 5. GEDUNG LAB KOMPUTER (Tenggara / Kanan Bawah) ---
    // Bangunan Modern Kaca & Ruang Komputer
    addObstacle(390, 185, 84, 82);
    // Semak / Pagar Pembatas Sisi Barat Lab
    addObstacle(332, 185, 12, 76);
    // Semak / Pagar Pembatas Sisi Timur Lab
    addObstacle(444, 185, 12, 76);

    // --- 6. DERETAN POHON PEMBATAS LUAR KOTA (TEPI UTARA & SELATAN) ---
    // Pohon Tepi Utara Kiri
    addObstacle(115, 8, 210, 16);
    // Pohon Tepi Utara Kanan
    addObstacle(365, 8, 210, 16);
    // Pohon Tepi Selatan Kiri
    addObstacle(115, 262, 210, 16);
    // Pohon Tepi Selatan Kanan
    addObstacle(365, 262, 210, 16);
  }

  // =========================================================================
  // 2. Landmark 4 Lokasi Utama & Lencana Pin Interaktif
  // =========================================================================
  private createInteractiveLandmarksAndPins(): void {
    // 1. Gedung Sekolah (Materi) - Barat Laut (Kiri Atas)
    const schoolZone = this.add.zone(92, 65, 90, 70).setRectangleDropZone(90, 70).setDepth(4);
    schoolZone.setInteractive({ useHandCursor: true });
    schoolZone.on('pointerdown', () => this.handlePinClick('MATERI'));

    // Guru Pak Budi berdiri di luar sekolah: ujung kiri jalan utama antara pepohonan
    const teacher = this.add.sprite(32, 134, 'npc_teacher').setDepth(9);
    teacher.setInteractive({ useHandCursor: true });
    teacher.on('pointerdown', () => this.handlePinClick('DIALOG'));

    // Label Penanda Nama Pak Budi (mengambang di atas kepala dengan jarak aman)
    const teacherLabel = this.add.text(32, 119, 'Pak Budi', {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(15, 118, 110, 0.95)',
      padding: { x: 4, y: 1.5 }
    }).setOrigin(0.5, 1).setDepth(20);
    teacherLabel.setInteractive({ useHandCursor: true });
    teacherLabel.on('pointerdown', () => this.handlePinClick('DIALOG'));

    this.tweens.add({
      targets: [teacher, teacherLabel],
      y: '-=3',
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Pin Sekolah (Materi)
    this.createFloatingPin('pin_school', 92, 36, 'MATERI', 'Sekolah');

    // 2. Gedung Perpustakaan (Evaluasi LKPD) - Timur Laut (Kanan Atas)
    const libraryZone = this.add.zone(390, 65, 90, 70).setRectangleDropZone(90, 70).setDepth(4);
    libraryZone.setInteractive({ useHandCursor: true });
    libraryZone.on('pointerdown', () => this.handlePinClick('EVALUASI'));
    this.createFloatingPin('pin_library', 390, 36, 'EVALUASI', 'Perpustakaan');

    // 3. Taman Kota (Arena Tantangan Bug) - Barat Daya (Kiri Bawah)
    const parkZone = this.add.zone(90, 205, 80, 70).setRectangleDropZone(80, 70).setDepth(4);
    parkZone.setInteractive({ useHandCursor: true });
    parkZone.on('pointerdown', () => this.handlePinClick('BATTLE'));
    this.createFloatingPin('pin_park', 90, 168, 'BATTLE', 'Arena Bug');

    // 4. Gedung Lab Komputer (Simulasi) - Tenggara (Kanan Bawah)
    const labZone = this.add.zone(390, 205, 80, 70).setRectangleDropZone(80, 70).setDepth(4);
    labZone.setInteractive({ useHandCursor: true });
    labZone.on('pointerdown', () => this.handlePinClick('TRACING'));
    this.createFloatingPin('pin_lab', 390, 168, 'TRACING', 'Lab Telusur');
  }

  private createFloatingPin(key: string, x: number, y: number, screenTarget: string, labelTitle: string): void {
    const pin = this.add.sprite(x, y, key).setDepth(25);
    pin.setInteractive({ useHandCursor: true });

    // Label Penanda Lokasi Retro Minimalis di Bawah Pin
    const label = this.add.text(x, y + 11, labelTitle, {
      fontFamily: 'monospace',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(28, 25, 23, 0.88)',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5, 0).setDepth(26);
    label.setInteractive({ useHandCursor: true });

    // Efek Melayang Lembut (Floating Bobbing Tween) bersama Pin & Label
    this.tweens.add({
      targets: [pin, label],
      y: '-=4',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Interaksi Hover & Klik (sinkron pin dan label)
    const onHover = () => {
      pin.setScale(1.08);
      label.setColor('#f59e0b');
    };
    const onOut = () => {
      pin.setScale(1.0);
      label.setColor('#ffffff');
    };
    const onClick = () => {
      this.handlePinClick(screenTarget);
    };

    pin.on('pointerover', onHover);
    pin.on('pointerout', onOut);
    pin.on('pointerdown', onClick);

    label.on('pointerover', onHover);
    label.on('pointerout', onOut);
    label.on('pointerdown', onClick);

    this.locationPins[key] = pin;
  }

  private handlePinClick(screenTarget: string): void {
    soundFx.playButtonBlip();
    EventCenter.emit('NAVIGATE_SCREEN', screenTarget);
  }

  // =========================================================================
  // 3. Karakter Murid 1 (Hero) & Rekan Belajar Murid 2 (Partner Companion)
  // =========================================================================
  private createHeroAndCompanion(): void {
    // Sprite Karakter Hero (Murid 1)
    this.hero = this.physics.add.sprite(160, 135, 'hero', 0);
    this.hero.setCollideWorldBounds(true);
    this.hero.setSize(12, 14);
    this.hero.setDepth(10);

    // Tabrakan Fisik dengan Sungai & Pagar Jembatan (Hanya Bisa Lewat Jembatan)
    this.physics.add.collider(this.hero, this.riverObstacles);

    // Sprite Rekan Belajar (Murid 2)
    this.partnerHero = this.add.sprite(142, 135, 'hero_partner', 0);
    this.partnerHero.setDepth(10);
  }

  private updatePartnerCompanion(): void {
    if (!this.partnerHero || !this.hero) return;

    // Menghitung jarak ke Murid 1
    const dx = this.hero.x - this.partnerHero.x;
    const dy = this.hero.y - this.partnerHero.y;
    const distance = Math.hypot(dx, dy);

    // Murid 2 berjalan mengikuti Murid 1 jika jarak > 18 px
    if (distance > 18) {
      const speed = 1.6;
      this.partnerHero.x += (dx / distance) * speed;
      this.partnerHero.y += (dy / distance) * speed;

      // Putar arah hadap & mainkan animasi langkah kaki Murid 2
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          this.partnerHero.setFlipX(false);
          this.partnerHero.anims.play('partner-walk-right', true);
        } else {
          this.partnerHero.setFlipX(true);
          this.partnerHero.anims.play('partner-walk-right', true);
        }
      } else {
        if (dy > 0) {
          this.partnerHero.anims.play('partner-walk-down', true);
        } else {
          this.partnerHero.anims.play('partner-walk-up', true);
        }
      }
    } else {
      this.partnerHero.anims.play('partner-idle', true);
    }
  }

  private setupInputControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      // PENTING: Bersihkan capture keyboard bawaan Phaser agar tidak memanggil event.preventDefault()
      // yang memblokir pengetikan huruf W, A, S, D dan spasi di elemen input teks form / modal DOM HTML!
      this.input.keyboard.clearCaptures();
    }

    // Tap-to-Move untuk Layar Sentuh Mobile / Tablet / Mouse
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const tx = Phaser.Math.Clamp(pointer.worldX, 14, 466);
      const ty = Phaser.Math.Clamp(pointer.worldY, 14, 256);
      this.targetPoint = { x: tx, y: ty };

      // Indikator Titik Tujuan Tap yang Lembut
      if (!this.targetMarker) {
        this.targetMarker = this.add.circle(tx, ty, 6, 0x0f766e, 0.5).setDepth(8);
      } else {
        this.targetMarker.setPosition(tx, ty).setVisible(true).setAlpha(0.6).setScale(1);
      }
      this.tweens.add({
        targets: this.targetMarker,
        scale: 1.8,
        alpha: 0,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.targetMarker?.setVisible(false);
        }
      });
    });
  }

  /**
   * Pengecekan apakah pengguna sedang mengetik di elemen form/input DOM
   */
  private isUserTyping(): boolean {
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tag = activeEl.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (activeEl as HTMLElement).isContentEditable;
  }

  private createHudOverlays(): void {
    // Proximity Tooltip di Bawah Tengah (Petunjuk Aksi Ramah Pengguna)
    this.proximityTooltip = this.add.text(240, 252, '', {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f59e0b',
      backgroundColor: 'rgba(28, 25, 23, 0.90)',
      padding: { x: 12, y: 5 }
    }).setOrigin(0.5).setDepth(30).setVisible(false);
  }

  private handlePlayerMovement(): void {
    // Abaikan input arah keyboard jika pengguna sedang mengetik nama di modal pendaftaran / form input
    if (this.isUserTyping()) {
      this.hero.setVelocity(0);
      this.hero.anims.play('hero-idle', true);
      return;
    }

    const speed = 110;

    const left = this.cursors?.left?.isDown || this.wasdKeys?.A?.isDown || this.virtualMoveVector.x < 0;
    const right = this.cursors?.right?.isDown || this.wasdKeys?.D?.isDown || this.virtualMoveVector.x > 0;
    const up = this.cursors?.up?.isDown || this.wasdKeys?.W?.isDown || this.virtualMoveVector.y < 0;
    const down = this.cursors?.down?.isDown || this.wasdKeys?.S?.isDown || this.virtualMoveVector.y > 0;

    if (left || right || up || down) {
      this.targetPoint = null; // Batalkan tap-to-move jika ada input arah manual
      let vx = 0;
      let vy = 0;

      if (left) {
        vx = -speed;
        this.hero.setFlipX(true);
        this.hero.anims.play('hero-walk-right', true);
      } else if (right) {
        vx = speed;
        this.hero.setFlipX(false);
        this.hero.anims.play('hero-walk-right', true);
      }

      if (up) {
        vy = -speed;
        this.hero.anims.play('hero-walk-up', true);
      } else if (down) {
        vy = speed;
        this.hero.anims.play('hero-walk-down', true);
      }

      this.hero.setVelocity(vx, vy);
    } else if (this.targetPoint) {
      // Pergerakan Menuju Titik Tap (Tap-to-Move)
      const dx = this.targetPoint.x - this.hero.x;
      const dy = this.targetPoint.y - this.hero.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        this.hero.setVelocity(vx, vy);

        if (Math.abs(dx) > Math.abs(dy)) {
          this.hero.setFlipX(dx < 0);
          this.hero.anims.play('hero-walk-right', true);
        } else {
          if (dy > 0) {
            this.hero.anims.play('hero-walk-down', true);
          } else {
            this.hero.anims.play('hero-walk-up', true);
          }
        }
      } else {
        this.hero.setVelocity(0);
        this.hero.anims.play('hero-idle', true);
        this.targetPoint = null;
      }
    } else {
      this.hero.setVelocity(0);
      this.hero.anims.play('hero-idle', true);
    }
  }

  private checkBuildingProximity(): void {
    const targets = [
      { name: 'Guru Pak Budi', actionText: 'Bicara dengan Pak Budi', x: 32, y: 134, screen: 'DIALOG' },
      { name: 'Gedung Sekolah', actionText: 'Buka Ruang Kelas (Materi)', x: 92, y: 65, screen: 'MATERI' },
      { name: 'Perpustakaan', actionText: 'Buka Ruang Evaluasi LKPD', x: 392, y: 70, screen: 'EVALUASI' },
      { name: 'Arena Bug Logika', actionText: 'Masuk Arena Tantangan', x: 88, y: 195, screen: 'BATTLE' },
      { name: 'Lab Telusur Kode', actionText: 'Masuk Lab Telusur Kode', x: 392, y: 195, screen: 'TRACING' }
    ];

    let nearTarget: typeof targets[0] | null = null;
    for (const t of targets) {
      const dist = Math.hypot(this.hero.x - t.x, this.hero.y - t.y);
      const threshold = t.screen === 'DIALOG' ? 36 : 40;
      if (dist < threshold) {
        nearTarget = t;
        break;
      }
    }

    this.currentNearTarget = nearTarget;

    if (nearTarget) {
      const isUnlocked = (window as unknown as { uiManagerInstance?: { isScreenUnlocked: (s: string) => boolean } })
        .uiManagerInstance?.isScreenUnlocked(nearTarget.screen) ?? true;

      if (isUnlocked) {
        this.proximityTooltip.setText(`Tekan Spasi atau Ketuk: ${nearTarget.actionText}`);
        this.proximityTooltip.setColor('#f59e0b');
      } else {
        if (nearTarget.screen === 'MATERI') {
          this.proximityTooltip.setText('Terkunci: Bicaralah dengan Guru Pak Budi di tepi jalan dahulu');
        } else {
          this.proximityTooltip.setText(`Terkunci: Selesaikan langkah misi sebelumnya untuk membuka ${nearTarget.name}`);
        }
        this.proximityTooltip.setColor('#f87171');
      }
      this.proximityTooltip.setVisible(true);

      if (!this.isUserTyping() && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.handlePinClick(nearTarget.screen);
      }
    } else {
      this.proximityTooltip.setVisible(false);
    }
  }

  // =========================================================================
  // 5. Pendaftaran Listener Event Bus & Simulasi Deterministic Tracing
  // =========================================================================
  // 4. Pendaftaran Listener Event Bus
  // =========================================================================
  private registerEventListeners(): void {
    const onStartBattle = () => {
      this.scene.start('BattleScene');
    };

    const onVirtualMove = (vec: { x: number; y: number }) => {
      this.virtualMoveVector = vec;
    };

    const onVirtualInteract = () => {
      if (this.currentNearTarget) {
        this.handlePinClick(this.currentNearTarget.screen);
      }
    };

    EventCenter.on('START_BATTLE', onStartBattle);
    EventCenter.on('HERO_VIRTUAL_MOVE', onVirtualMove);
    EventCenter.on('HERO_INTERACT', onVirtualInteract);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventCenter.off('START_BATTLE', onStartBattle);
      EventCenter.off('HERO_VIRTUAL_MOVE', onVirtualMove);
      EventCenter.off('HERO_INTERACT', onVirtualInteract);
    });
  }
}


