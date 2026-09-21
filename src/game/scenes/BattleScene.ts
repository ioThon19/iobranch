// src/game/scenes/BattleScene.ts - Panggung Visual Pertarungan RPG Percabangan (SSOT: SDD.md Section 3.1.C & DESIGN.md)
import Phaser from 'phaser';
import { EventCenter } from '../EventCenter';
import { ExecuteBattleTurnPayload } from '../../types/events.types';

export class BattleScene extends Phaser.Scene {
  // Sprites & Visual Entities
  private enemySprite!: Phaser.GameObjects.Sprite;
  private heroSprite!: Phaser.GameObjects.Sprite;
  private enemyDamageTrailFill!: Phaser.GameObjects.Graphics;
  private enemyHpBarFill!: Phaser.GameObjects.Graphics;
  private heroDamageTrailFill!: Phaser.GameObjects.Graphics;
  private heroHpBarFill!: Phaser.GameObjects.Graphics;
  private enemyHpText!: Phaser.GameObjects.Text;
  private heroHpText!: Phaser.GameObjects.Text;

  // Statistik Pertempuran (Tersinkronisasi Realtime dengan Animasi)
  private enemyMaxHp = 50;
  private enemyHp = 50;
  private displayedEnemyHp = 50;
  private heroMaxHp = 45;
  private heroHp = 45;
  private displayedHeroHp = 45;

  private enemyHpTween?: Phaser.Tweens.Tween;
  private heroHpTween?: Phaser.Tweens.Tween;

  private isBattleActive = false;
  private isTurnExecuting = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  public create(): void {
    this.buildScenicBackdrop();
    this.createEnemyEntity();
    this.createHeroEntity();
    this.createBattleHUD();
    this.registerBattleEvents();
    this.resetBattleStats();
  }

  private resetBattleStats(): void {
    this.enemyHp = 50;
    this.displayedEnemyHp = 50;
    this.heroHp = 45;
    this.displayedHeroHp = 45;
    this.isBattleActive = true;
    this.isTurnExecuting = false;

    if (this.enemyHpTween) this.enemyHpTween.stop();
    if (this.heroHpTween) this.heroHpTween.stop();

    if (this.enemyHpBarFill) {
      this.drawEnemyHp(50);
      this.drawEnemyTrail(50);
    }
    if (this.heroHpBarFill) {
      this.drawHeroHp(45);
      this.drawHeroTrail(45);
    }
    if (this.enemySprite) {
      this.enemySprite.setAlpha(1);
      this.enemySprite.clearTint();
      this.enemySprite.setPosition(380, 105);
    }
    if (this.heroSprite) {
      this.heroSprite.setAlpha(1);
      this.heroSprite.clearTint();
      this.heroSprite.setPosition(100, 150);
    }
  }

  // =========================================================================
  // 1. Pemandangan Panggung Pertarungan Sinematik (480x270 px)
  // =========================================================================
  private buildScenicBackdrop(): void {
    // Latar Belakang Panggung Pertarungan (Hutan & Arena Lingkar Batu)
    this.add.image(240, 135, 'battle_backdrop').setDisplaySize(480, 270).setDepth(0);
  }

  // =========================================================================
  // 2. Entitas Monster Musuh (Terbang Melayang di Atas Jalur Tanah Seberang)
  // =========================================================================
  private createEnemyEntity(): void {
    // Bayangan Monster di atas tanah jalur setapak
    const shadowEnemy = this.add.image(325, 138, 'shadow_oval')
      .setScale(2.8, 1.3)
      .setAlpha(0.65)
      .setDepth(4);

    // Sprite Monster Bug (Proporsional terhadap Jalur Belakang)
    this.enemySprite = this.add.sprite(325, 88, 'red_monster').setDepth(5);
    this.enemySprite.setDisplaySize(114, 90);

    // Animasi Terbang Melayang (Hovering Bobbing)
    this.tweens.add({
      targets: this.enemySprite,
      y: 78,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sinkronisasi Bayangan Terbang (Mengecil & Pudar saat Monster Naik)
    this.tweens.add({
      targets: shadowEnemy,
      scaleX: 2.3,
      scaleY: 1.1,
      alpha: 0.45,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // =========================================================================
  // 3. Entitas Karakter Murid Hero (Diperbesar di Arena Batu Melingkar Depan)
  // =========================================================================
  private createHeroEntity(): void {
    // Bayangan Hero di atas platform melingkar batu (Sinkron di bawah kaki x: 100)
    this.add.image(100, 226, 'shadow_oval')
      .setScale(2.4, 1.3)
      .setAlpha(0.75)
      .setDepth(4);

    // Sprite Karakter Hero Murid (Proporsional terhadap Platform Batu Depan, Statis & Kokoh)
    this.heroSprite = this.add.sprite(100, 159, 'hero_battle_back').setDepth(6);
    this.heroSprite.setDisplaySize(64, 134);
  }

  // =========================================================================
  // 4. HUD Status Pertarungan (Realtime Animated HP Bars & Damage Trails)
  // =========================================================================
  // =========================================================================
  // 4. HUD Status Pertarungan (16-Bit Tactical GBA Pods with Live HP Gauges)
  // =========================================================================
  private createBattleHUD(): void {
    // -----------------------------------------------------------------------
    // A. Tactical Combat Pod Musuh: Bug Monster (Kiri Atas)
    // -----------------------------------------------------------------------
    const plateEnemyShadow = this.add.graphics().setDepth(9);
    plateEnemyShadow.fillStyle(0x000000, 0.45);
    plateEnemyShadow.fillRoundedRect(16, 16, 172, 48, 4);

    const plateEnemy = this.add.graphics().setDepth(10);
    // Plat dasar Deep Obsidian bertekstur
    plateEnemy.fillStyle(0x0a101d, 0.96);
    plateEnemy.fillRoundedRect(14, 14, 172, 48, 4);
    // Garis tepi beveled Crimson Alert
    plateEnemy.lineStyle(1.5, 0xb91c1c, 0.95);
    plateEnemy.strokeRoundedRect(14, 14, 172, 48, 4);
    // Strip aksen atas merah menyala
    plateEnemy.fillStyle(0xe11d48, 0.9);
    plateEnemy.fillRoundedRect(16, 15, 168, 2, 1);

    // Label Nama Entitas
    this.add.text(22, 21, 'BUG MONSTER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7.5px',
      color: '#ffffff'
    }).setDepth(11);

    // Pill Badge Level Musuh
    const enemyBadge = this.add.graphics().setDepth(11);
    enemyBadge.fillStyle(0x4c0519, 0.9);
    enemyBadge.fillRoundedRect(138, 19, 42, 11, 2);
    enemyBadge.lineStyle(1, 0x9f1239, 1);
    enemyBadge.strokeRoundedRect(138, 19, 42, 11, 2);

    this.add.text(159, 24.5, 'LV.01', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5.5px',
      color: '#fca5a5'
    }).setOrigin(0.5).setDepth(12);

    // Mini Lencana [HP] Taktis
    const enemyHpTag = this.add.graphics().setDepth(11);
    enemyHpTag.fillStyle(0xd97706, 1);
    enemyHpTag.fillRoundedRect(22, 34, 18, 11, 2);
    this.add.text(31, 39.5, 'HP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5).setDepth(12);

    // Rel Alur Tertanam (Recessed Track)
    const trackEnemy = this.add.graphics().setDepth(11);
    trackEnemy.fillStyle(0x050811, 1);
    trackEnemy.fillRoundedRect(44, 34, 136, 11, 2);
    trackEnemy.lineStyle(1, 0x1e293b, 1);
    trackEnemy.strokeRoundedRect(44, 34, 136, 11, 2);
    // Garis penanda batas 50%
    trackEnemy.lineStyle(1, 0x1e293b, 0.85);
    trackEnemy.lineBetween(112, 35, 112, 44);

    // Lapisan Trail Kerusakan (Ghost Damage Trail)
    this.enemyDamageTrailFill = this.add.graphics().setDepth(12);
    // Lapisan HP Aktif Multi-Tone
    this.enemyHpBarFill = this.add.graphics().setDepth(13);

    // Teks Angka Numerik HP
    this.enemyHpText = this.add.text(180, 47, `${this.enemyHp} / ${this.enemyMaxHp}`, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(1, 0).setDepth(14);

    this.drawEnemyHp(this.displayedEnemyHp);
    this.drawEnemyTrail(this.displayedEnemyHp);

    // -----------------------------------------------------------------------
    // B. Tactical Combat Pod Pemain: Hero Murid (Kanan Bawah)
    // -----------------------------------------------------------------------
    const plateHeroShadow = this.add.graphics().setDepth(9);
    plateHeroShadow.fillStyle(0x000000, 0.45);
    plateHeroShadow.fillRoundedRect(296, 204, 172, 48, 4);

    const plateHero = this.add.graphics().setDepth(10);
    // Plat dasar Deep Obsidian
    plateHero.fillStyle(0x0a101d, 0.96);
    plateHero.fillRoundedRect(294, 202, 172, 48, 4);
    // Garis tepi beveled Forest Emerald
    plateHero.lineStyle(1.5, 0x0f766e, 0.95);
    plateHero.strokeRoundedRect(294, 202, 172, 48, 4);
    // Strip aksen atas hijau zamrud
    plateHero.fillStyle(0x0d9488, 0.9);
    plateHero.fillRoundedRect(296, 203, 168, 2, 1);

    // Label Nama Entitas
    this.add.text(302, 209, 'HERO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7.5px',
      color: '#ffffff'
    }).setDepth(11);

    // Pill Badge Kelas Murid
    const heroBadge = this.add.graphics().setDepth(11);
    heroBadge.fillStyle(0x022c22, 0.9);
    heroBadge.fillRoundedRect(418, 207, 42, 11, 2);
    heroBadge.lineStyle(1, 0x0f766e, 1);
    heroBadge.strokeRoundedRect(418, 207, 42, 11, 2);

    this.add.text(439, 212.5, 'MURID', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5.5px',
      color: '#6ee7b7'
    }).setOrigin(0.5).setDepth(12);

    // Mini Lencana [HP] Taktis
    const heroHpTag = this.add.graphics().setDepth(11);
    heroHpTag.fillStyle(0xd97706, 1);
    heroHpTag.fillRoundedRect(302, 222, 18, 11, 2);
    this.add.text(311, 227.5, 'HP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5).setDepth(12);

    // Rel Alur Tertanam (Recessed Track)
    const trackHero = this.add.graphics().setDepth(11);
    trackHero.fillStyle(0x050811, 1);
    trackHero.fillRoundedRect(324, 222, 136, 11, 2);
    trackHero.lineStyle(1, 0x1e293b, 1);
    trackHero.strokeRoundedRect(324, 222, 136, 11, 2);
    // Garis penanda batas 50%
    trackHero.lineStyle(1, 0x1e293b, 0.85);
    trackHero.lineBetween(392, 223, 392, 232);

    // Lapisan Trail Kerusakan Pemain
    this.heroDamageTrailFill = this.add.graphics().setDepth(12);
    // Lapisan HP Aktif Pemain
    this.heroHpBarFill = this.add.graphics().setDepth(13);

    // Teks Angka Numerik HP Pemain
    this.heroHpText = this.add.text(460, 235, `${this.heroHp} / ${this.heroMaxHp}`, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(1, 0).setDepth(14);

    this.drawHeroHp(this.displayedHeroHp);
    this.drawHeroTrail(this.displayedHeroHp);
  }

  private drawEnemyHp(currentHp: number): void {
    this.enemyHpBarFill.clear();
    const ratio = Math.max(0, currentHp / this.enemyMaxHp);
    const maxBarWidth = 134;
    const currentWidth = maxBarWidth * ratio;

    if (currentWidth > 0) {
      // Penentuan Palet Warna Adaptif (Sehat -> Peringatan -> Kritis)
      let highlightColor: number;
      let bodyColor: number;
      let shadowColor: number;

      if (ratio > 0.4) {
        highlightColor = 0xfb7185; // Kilau Ruby
        bodyColor = 0xe11d48;      // Crimson Utama
        shadowColor = 0x9f1239;    // Bevel Bawah
      } else if (ratio > 0.2) {
        highlightColor = 0xfcd34d; // Kilau Emas
        bodyColor = 0xf59e0b;      // Amber Peringatan
        shadowColor = 0xb45309;    // Bevel Bawah
      } else {
        highlightColor = 0xf87171; // Kilau Merah Darurat
        bodyColor = 0xdc2626;      // Crimson Alert Kritis
        shadowColor = 0x7f1d1d;    // Bevel Bawah
      }

      // 1. Badan Utama Bilah
      this.enemyHpBarFill.fillStyle(bodyColor, 1);
      this.enemyHpBarFill.fillRect(45, 35, currentWidth, 9);

      // 2. Kilau Kristal Atas (Specular Shine)
      this.enemyHpBarFill.fillStyle(highlightColor, 0.9);
      this.enemyHpBarFill.fillRect(45, 35, currentWidth, 2.5);

      // 3. Bevel Bayangan Bawah
      this.enemyHpBarFill.fillStyle(shadowColor, 0.95);
      this.enemyHpBarFill.fillRect(45, 42, currentWidth, 2);
    }

    this.enemyHpText.setText(`${Math.max(0, Math.round(currentHp))} / ${this.enemyMaxHp}`);
  }

  private drawEnemyTrail(trailHp: number): void {
    this.enemyDamageTrailFill.clear();
    const ratio = Math.max(0, trailHp / this.enemyMaxHp);
    const width = 134 * ratio;
    if (width > 0) {
      this.enemyDamageTrailFill.fillStyle(0xfde047, 0.9);
      this.enemyDamageTrailFill.fillRect(45, 35, width, 9);
    }
  }

  private animateEnemyHpDamage(targetHp: number, onComplete?: () => void): void {
    const startHp = this.displayedEnemyHp;
    this.enemyHp = targetHp;

    if (this.enemyHpTween) this.enemyHpTween.stop();

    this.enemyHpTween = this.tweens.addCounter({
      from: startHp,
      to: targetHp,
      duration: 500,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const val = tween.getValue() ?? targetHp;
        this.displayedEnemyHp = val;
        this.drawEnemyHp(val);
      },
      onComplete: () => {
        this.displayedEnemyHp = targetHp;
        this.drawEnemyHp(targetHp);

        this.tweens.addCounter({
          from: startHp,
          to: targetHp,
          duration: 350,
          delay: 80,
          ease: 'Sine.easeInOut',
          onUpdate: (t) => {
            this.drawEnemyTrail(t.getValue() ?? targetHp);
          },
          onComplete: () => {
            this.drawEnemyTrail(targetHp);
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  private drawHeroHp(currentHp: number): void {
    this.heroHpBarFill.clear();
    const ratio = Math.max(0, currentHp / this.heroMaxHp);
    const maxBarWidth = 134;
    const currentWidth = maxBarWidth * ratio;

    if (currentWidth > 0) {
      // Penentuan Palet Warna Adaptif Hero
      let highlightColor: number;
      let bodyColor: number;
      let shadowColor: number;

      if (ratio > 0.4) {
        highlightColor = 0x34d399; // Kilau Mint Zamrud
        bodyColor = 0x10b981;      // Forest Emerald Utama
        shadowColor = 0x047857;    // Bevel Bawah
      } else if (ratio > 0.2) {
        highlightColor = 0xfcd34d; // Kilau Emas
        bodyColor = 0xf59e0b;      // Amber Peringatan
        shadowColor = 0xb45309;    // Bevel Bawah
      } else {
        highlightColor = 0xf87171; // Kilau Merah Darurat
        bodyColor = 0xef4444;      // Merah Kritis
        shadowColor = 0x991b1b;    // Bevel Bawah
      }

      // 1. Badan Utama Bilah
      this.heroHpBarFill.fillStyle(bodyColor, 1);
      this.heroHpBarFill.fillRect(325, 223, currentWidth, 9);

      // 2. Kilau Kristal Atas (Specular Shine)
      this.heroHpBarFill.fillStyle(highlightColor, 0.9);
      this.heroHpBarFill.fillRect(325, 223, currentWidth, 2.5);

      // 3. Bevel Bayangan Bawah
      this.heroHpBarFill.fillStyle(shadowColor, 0.95);
      this.heroHpBarFill.fillRect(325, 230, currentWidth, 2);
    }

    this.heroHpText.setText(`${Math.max(0, Math.round(currentHp))} / ${this.heroMaxHp}`);
  }

  private drawHeroTrail(trailHp: number): void {
    this.heroDamageTrailFill.clear();
    const ratio = Math.max(0, trailHp / this.heroMaxHp);
    const width = 134 * ratio;
    if (width > 0) {
      this.heroDamageTrailFill.fillStyle(0xf87171, 0.85);
      this.heroDamageTrailFill.fillRect(325, 223, width, 9);
    }
  }

  private animateHeroHpDamage(targetHp: number, onComplete?: () => void): void {
    const startHp = this.displayedHeroHp;
    this.heroHp = targetHp;

    if (this.heroHpTween) this.heroHpTween.stop();

    this.heroHpTween = this.tweens.addCounter({
      from: startHp,
      to: targetHp,
      duration: 500,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const val = tween.getValue() ?? targetHp;
        this.displayedHeroHp = val;
        this.drawHeroHp(val);
      },
      onComplete: () => {
        this.displayedHeroHp = targetHp;
        this.drawHeroHp(targetHp);

        this.tweens.addCounter({
          from: startHp,
          to: targetHp,
          duration: 350,
          delay: 80,
          ease: 'Sine.easeInOut',
          onUpdate: (t) => {
            this.drawHeroTrail(t.getValue() ?? targetHp);
          },
          onComplete: () => {
            this.drawHeroTrail(targetHp);
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  // =========================================================================
  // 5. Eksekusi Aksi Pertarungan (Dipicu dari Panel Kontrol DOM Kanan)
  // =========================================================================
  private handleTurnExecution(isCorrect: boolean, damage = 10, targetEnemyHp?: number, targetHeroHp?: number): void {
    if (this.isTurnExecuting || !this.isBattleActive) return;
    this.isTurnExecuting = true;

    if (isCorrect) {
      // Evaluasi TRUE: Hero menerjang maju dari posisi x:100 ke x:165
      this.tweens.add({
        targets: this.heroSprite,
        x: 165,
        y: 140,
        duration: 180,
        yoyo: true,
        onYoyo: () => {
          // Efek Sayatan Slash di Atas Monster
          const slash = this.add.sprite(this.enemySprite.x, this.enemySprite.y, 'attack_slash').setDepth(15);
          slash.setScale(2.0);
          this.tweens.add({
            targets: slash,
            alpha: 0,
            scale: 2.5,
            duration: 250,
            onComplete: () => slash.destroy()
          });

          // Guncangan Kamera Halus
          this.cameras.main.shake(140, 0.005);

          // Flash Efek Kerusakan Musuh
          this.tweens.add({
            targets: this.enemySprite,
            alpha: 0.2,
            tint: 0xffffff,
            duration: 70,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              this.enemySprite.clearTint();
            }
          });

          this.showFloatingText(this.enemySprite.x, this.enemySprite.y - 50, `CRITICAL! -${damage} HP`, '#2ecc71');

          // Pengurangan HP Monster Realtime Teranimasi (Tepat 10 HP per serangan benar)
          const nextHp = targetEnemyHp !== undefined ? targetEnemyHp : Math.max(0, this.enemyHp - damage);
          this.animateEnemyHpDamage(nextHp, () => {
            this.isTurnExecuting = false;
          });
        }
      });
    } else {
      // Evaluasi FALSE: Monster menukik menyerang balik ke posisi Hero (x:100)
      this.tweens.add({
        targets: this.enemySprite,
        x: 190,
        y: 125,
        duration: 180,
        yoyo: true,
        onYoyo: () => {
          this.tweens.add({
            targets: this.heroSprite,
            alpha: 0.2,
            tint: 0xff0000,
            duration: 70,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              this.heroSprite.clearTint();
            }
          });

          this.showFloatingText(this.heroSprite.x, this.heroSprite.y - 75, 'TERPANTUL! -5 HP', '#ef4444');

          // Pengurangan HP Hero Realtime Teranimasi (Tepat 5 HP saat hero terkena damage)
          const nextHeroHp = targetHeroHp !== undefined ? targetHeroHp : Math.max(0, this.heroHp - 5);
          this.animateHeroHpDamage(nextHeroHp, () => {
            this.isTurnExecuting = false;
          });
        }
      });
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const floating = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color,
      backgroundColor: '#050b14',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: floating,
      y: y - 25,
      alpha: 0,
      duration: 1000,
      onComplete: () => floating.destroy()
    });
  }

  private playVictoryAnimation(): void {
    if (!this.isBattleActive) return;
    this.isBattleActive = false;

    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        const victoryBanner = this.add.text(240, 135, '[ VICTORY! +50 XP ]', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '11px',
          color: '#f59e0b',
          backgroundColor: '#050b14',
          padding: { x: 14, y: 8 }
        }).setOrigin(0.5).setDepth(40);

        this.tweens.add({
          targets: victoryBanner,
          scale: 1.1,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      }
    });
  }

  // =========================================================================
  // 6. Pendaftaran & Pembersihan Event Bus
  // =========================================================================
  private registerBattleEvents(): void {
    const onTurn = (payload: ExecuteBattleTurnPayload) => {
      if (!this.isBattleActive) return;
      this.handleTurnExecution(payload.isCorrect, payload.damage ?? 10, payload.enemyHp, payload.heroHp);
    };

    const onLeave = () => {
      this.isBattleActive = false;
    };

    const onVictory = () => {
      this.playVictoryAnimation();
    };

    const onReset = () => {
      this.resetBattleStats();
    };

    EventCenter.on('EXECUTE_BATTLE_TURN', onTurn);
    EventCenter.on('LEAVE_BATTLE', onLeave);
    EventCenter.on('TRIGGER_BATTLE_VICTORY', onVictory);
    EventCenter.on('RESET_BATTLE', onReset);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventCenter.off('EXECUTE_BATTLE_TURN', onTurn);
      EventCenter.off('LEAVE_BATTLE', onLeave);
      EventCenter.off('TRIGGER_BATTLE_VICTORY', onVictory);
      EventCenter.off('RESET_BATTLE', onReset);
    });
  }
}
