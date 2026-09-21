// src/game/scenes/BootScene.ts - Inisialisasi & Pembangkitan Aset Pixel Art 16-Bit Otentik (SSOT: DESIGN.md & Lembar Referensi)
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // 1. Karakter Hero (Murid 1) & Rekan Belajar (Murid 2)
    this.createHeroTexture();
    this.createPartnerStudentTexture();
    this.createPetDogTexture();

    // 2. Lingkungan Kota Harmoni (Ubin, Bangunan, Rambu, & Pin Lokasi)
    this.createEnvironmentTextures();
    this.createBuildingTextures();
    this.createLocationPinTextures();

    // 3. NPC & Musuh
    this.createNpcTexture();
    this.createMonsterTexture();

    // 4. Latar & Efek Pertarungan RPG
    this.createBattleBackdropTextures();

    // 5. Muat aset gambar yang sudah tersedia di public/assets/images
    this.load.image('red_monster', '/assets/bug_battle.webp');
    this.load.image('hero_battle_back', '/assets/character_battle.webp');
    this.load.image('overworld_map', '/assets/images/overworld_map_full.jpg');
    this.load.image('battle_backdrop', '/assets/images/battle_backdrop.jpg');
  }

  public create(): void {
    this.createHeroAnimations();
    this.createPartnerStudentAnimations();
    this.createPetAnimations();

    // Beralih langsung ke WorldScene
    this.scene.start('WorldScene');
  }

  // =========================================================================
  // 1. Pembangkitan Tekstur Karakter Hero & Anjing Petualang
  // =========================================================================
  private createHeroTexture(): void {
    if (this.textures.exists('hero')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 16 * 4;
    canvas.height = 16 * 4;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    const skin = '#fcd34d';
    const hair = '#b45309';
    const tunic = '#0F766E';
    const pants = '#1e293b';
    const boots = '#451a03';
    const pack = '#d97706';

    // Frame 0..3: Hadap Bawah (Down)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, 1, 8, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 5, 4, 6, 4);
      drawPixel(ox + 6, 5, '#000000');
      drawPixel(ox + 9, 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 4, 8, 8, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 4, 8, 2, 4);
      ctx.fillRect(ox + 10, 8, 2, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 5, 12, 6, 2);
      ctx.fillStyle = boots;
      if (f % 2 === 1) {
        ctx.fillRect(ox + 4, 14, 3, 2);
        ctx.fillRect(ox + 9, 13, 3, 2);
      } else {
        ctx.fillRect(ox + 4, 14, 3, 2);
        ctx.fillRect(ox + 9, 14, 3, 2);
      }
    }

    // Row 1: Hadap Atas (Up)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 16;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, oy + 1, 8, 7);
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 4, oy + 8, 8, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 5, oy + 12, 6, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 4, oy + 14, 3, 2);
      ctx.fillRect(ox + 9, oy + 14, 3, 2);
    }

    // Row 2: Hadap Kanan (Right)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 32;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 5, oy + 1, 7, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 7, oy + 4, 4, 4);
      drawPixel(ox + 9, oy + 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 3, oy + 8, 3, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 6, oy + 12, 4, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 6, oy + 14, 4, 2);
    }

    // Row 3: Hadap Kiri (Left)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 48;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, oy + 1, 7, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 5, oy + 4, 4, 4);
      drawPixel(ox + 6, oy + 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 10, oy + 8, 3, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 6, oy + 12, 4, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 6, oy + 14, 4, 2);
    }

    const texture = this.textures.addCanvas('hero', canvas);
    if (texture) {
      let frameIndex = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          texture.add(frameIndex, 0, col * 16, row * 16, 16, 16);
          frameIndex++;
        }
      }
    }
  }

  // Rekan Belajar / Murid 2 (Partner Student Companion)
  private createPartnerStudentTexture(): void {
    if (this.textures.exists('hero_partner')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 16 * 4;
    canvas.height = 16 * 4;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    const skin = '#fcd34d';
    const hair = '#1c1917';      // Rambut hitam rapi / hijab
    const tunic = '#d97706';     // Rompi/jaket oranye ambar hangat (kontras harmonis dengan zamrud Murid 1)
    const pants = '#334155';     // Celana panjang slate
    const boots = '#1c1917';     // Sepatu kasual hitam
    const pack = '#0f766e';      // Tas ransel zamrud (serasi dengan Murid 1)

    // Frame 0..3: Hadap Bawah (Down)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, 1, 8, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 5, 4, 6, 4);
      drawPixel(ox + 6, 5, '#000000');
      drawPixel(ox + 9, 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 4, 8, 8, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 4, 8, 2, 4);
      ctx.fillRect(ox + 10, 8, 2, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 5, 12, 6, 2);
      ctx.fillStyle = boots;
      if (f % 2 === 1) {
        ctx.fillRect(ox + 4, 14, 3, 2);
        ctx.fillRect(ox + 9, 13, 3, 2);
      } else {
        ctx.fillRect(ox + 4, 14, 3, 2);
        ctx.fillRect(ox + 9, 14, 3, 2);
      }
    }

    // Row 1: Hadap Atas (Up)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 16;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, oy + 1, 8, 7);
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 4, oy + 8, 8, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 5, oy + 12, 6, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 4, oy + 14, 3, 2);
      ctx.fillRect(ox + 9, oy + 14, 3, 2);
    }

    // Row 2: Hadap Kanan (Right)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 32;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 5, oy + 1, 7, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 7, oy + 4, 4, 4);
      drawPixel(ox + 9, oy + 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 3, oy + 8, 3, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 6, oy + 12, 4, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 6, oy + 14, 4, 2);
    }

    // Row 3: Hadap Kiri (Left)
    for (let f = 0; f < 4; f++) {
      const ox = f * 16;
      const oy = 48;
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, oy + 1, 7, 4);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 5, oy + 4, 4, 4);
      drawPixel(ox + 6, oy + 5, '#000000');
      ctx.fillStyle = tunic;
      ctx.fillRect(ox + 5, oy + 8, 6, 4);
      ctx.fillStyle = pack;
      ctx.fillRect(ox + 10, oy + 8, 3, 4);
      ctx.fillStyle = pants;
      ctx.fillRect(ox + 6, oy + 12, 4, 2);
      ctx.fillStyle = boots;
      ctx.fillRect(ox + 6, oy + 14, 4, 2);
    }

    const texture = this.textures.addCanvas('hero_partner', canvas);
    if (texture) {
      let frameIndex = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          texture.add(frameIndex, 0, col * 16, row * 16, 16, 16);
          frameIndex++;
        }
      }
    }
  }

  private createPetDogTexture(): void {
    if (this.textures.exists('pet_dog')) return;

    // Sprite anjing kecil warna keemasan (4 arah @ 14x14 px)
    const canvas = document.createElement('canvas');
    canvas.width = 14 * 4;
    canvas.height = 14 * 4;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fur = '#f59e0b';
    const furDark = '#d97706';
    const ear = '#b45309';
    const collar = '#ef4444';

    for (let row = 0; row < 4; row++) {
      const oy = row * 14;
      for (let f = 0; f < 4; f++) {
        const ox = f * 14;
        // Badan
        ctx.fillStyle = fur;
        ctx.fillRect(ox + 3, oy + 4, 8, 6);
        // Kepala
        ctx.fillRect(ox + (row === 2 ? 6 : row === 3 ? 2 : 4), oy + 2, 6, 5);
        // Telinga
        ctx.fillStyle = ear;
        ctx.fillRect(ox + 3, oy + 1, 2, 3);
        ctx.fillRect(ox + 9, oy + 1, 2, 3);
        // Kalung leher
        ctx.fillStyle = collar;
        ctx.fillRect(ox + 4, oy + 6, 6, 1);
        // Mata
        ctx.fillStyle = '#000000';
        ctx.fillRect(ox + 5, oy + 3, 1, 1);
        ctx.fillRect(ox + 8, oy + 3, 1, 1);
        // Ekor bergerak
        ctx.fillStyle = furDark;
        const tailOffset = (f % 2 === 0) ? 0 : -1;
        ctx.fillRect(ox + (row === 2 ? 1 : 11), oy + 4 + tailOffset, 2, 2);
        // Kaki
        ctx.fillStyle = furDark;
        ctx.fillRect(ox + 4, oy + 10, 2, 3);
        ctx.fillRect(ox + 8, oy + 10, 2, 3);
      }
    }

    const texture = this.textures.addCanvas('pet_dog', canvas);
    if (texture) {
      let frameIndex = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          texture.add(frameIndex, 0, col * 14, row * 14, 14, 14);
          frameIndex++;
        }
      }
    }
  }

  // =========================================================================
  // 2. Pembangkitan Tekstur Lingkungan Kota Harmoni (Vibrant 16-Bit Palette)
  // =========================================================================
  private createEnvironmentTextures(): void {
    // 1. Rumput Hangat Retro JRPG (16x16)
    if (!this.textures.exists('tile_grass')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#3ca35d'; // Hijau subur segar
        ctx.fillRect(0, 0, 16, 16);
        // Shading rumput cerah
        ctx.fillStyle = '#4cd17c';
        ctx.fillRect(2, 3, 2, 2);
        ctx.fillRect(10, 8, 2, 2);
        ctx.fillRect(6, 13, 2, 2);
        // Shading rumput dalam
        ctx.fillStyle = '#2f854b';
        ctx.fillRect(3, 5, 2, 1);
        ctx.fillRect(11, 10, 2, 1);
        // Bunga padang rumput mungil (kuning & putih)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, 3, 1, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 11, 1, 1);
        this.textures.addCanvas('tile_grass', c);
      }
    }

    // 2. Air Sungai Berkilau (16x16)
    if (!this.textures.exists('tile_water')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(0, 2, 16, 4);
        ctx.fillRect(0, 10, 16, 4);
        // Riak air putih
        ctx.fillStyle = '#ccfbf1';
        ctx.fillRect(2, 3, 4, 1);
        ctx.fillRect(10, 5, 5, 1);
        ctx.fillRect(4, 11, 6, 1);
        ctx.fillRect(12, 13, 3, 1);
        this.textures.addCanvas('tile_water', c);
      }
    }

    // 3. Jembatan Kayu / Batu di Atas Sungai (16x16)
    if (!this.textures.exists('tile_bridge')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(0, 0, 16, 2);
        ctx.fillRect(0, 14, 16, 2);
        // Bilah papan
        ctx.fillStyle = '#d97706';
        for (let x = 1; x < 16; x += 4) {
          ctx.fillRect(x, 2, 3, 12);
        }
        ctx.fillStyle = '#78350f';
        for (let x = 0; x < 16; x += 4) {
          ctx.fillRect(x, 2, 1, 12);
        }
        this.textures.addCanvas('tile_bridge', c);
      }
    }

    // 4. Jalan Setapak Batu Cobblestone (16x16)
    if (!this.textures.exists('tile_path')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#b09e80'; // Nat semen batu hangat
        ctx.fillRect(0, 0, 16, 16);
        // Batu-batu bundar retro
        const stones = [
          { x: 1, y: 1, w: 6, h: 5, c: '#e5d7ba' },
          { x: 8, y: 1, w: 7, h: 4, c: '#d4c3a3' },
          { x: 1, y: 7, w: 7, h: 4, c: '#d4c3a3' },
          { x: 9, y: 6, w: 6, h: 5, c: '#e5d7ba' },
          { x: 2, y: 12, w: 6, h: 3, c: '#c2b090' },
          { x: 9, y: 12, w: 6, h: 3, c: '#d4c3a3' }
        ];
        stones.forEach(s => {
          ctx.fillStyle = s.c;
          ctx.fillRect(s.x, s.y, s.w, s.h);
          ctx.fillStyle = '#8a775b';
          ctx.fillRect(s.x, s.y + s.h - 1, s.w, 1);
        });
        this.textures.addCanvas('tile_path', c);
      }
    }

    // 5. Rambu Ranting Persimpangan IF? (24x24)
    if (!this.textures.exists('sign_if')) {
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(10, 12, 4, 12);
        // Papan belah ketupat kuning
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(3, 2, 18, 12);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 3, 16, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('IF?', 5, 11);
        this.textures.addCanvas('sign_if', c);
      }
    }

    // 6. Gerbang Logika Bertiang Batu (16x32)
    if (!this.textures.exists('gate_closed')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 32;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 4, 16, 28);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(2, 6, 12, 24);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 14, 16, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 0, 8, 4);
        this.textures.addCanvas('gate_closed', c);
      }
    }

    // 7. Pohon Oak Rindang (32x36)
    if (!this.textures.exists('tree_oak')) {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 36;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Batang
        ctx.fillStyle = '#78350f';
        ctx.fillRect(13, 22, 6, 14);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(15, 24, 2, 12);
        // Kanopi Daun Berlapis
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(16, 14, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(14, 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(12, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        this.textures.addCanvas('tree_oak', c);
      }
    }

    // 8. Pohon Cemara / Pinus (24x36)
    if (!this.textures.exists('tree_pine')) {
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 36;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 26, 4, 10);
        // Segitiga bertingkat
        ctx.fillStyle = '#14532d';
        ctx.fillRect(2, 20, 20, 8);
        ctx.fillStyle = '#166534';
        ctx.fillRect(4, 12, 16, 8);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(7, 4, 10, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(10, 2, 4, 3);
        this.textures.addCanvas('tree_pine', c);
      }
    }

    // 9. Semak Bunga Taman (16x16)
    if (!this.textures.exists('flower_bush')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(2, 4, 12, 10);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(3, 3, 10, 8);
        // Kuntum bunga warna-warni
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4, 5, 2, 2);
        ctx.fillRect(10, 7, 2, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(7, 4, 2, 2);
        ctx.fillRect(5, 9, 2, 2);
        this.textures.addCanvas('flower_bush', c);
      }
    }

    // 10. Lampu Jalan Besi Retro (10x24)
    if (!this.textures.exists('street_lamp')) {
      const c = document.createElement('canvas');
      c.width = 10;
      c.height = 24;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 4, 2, 20);
        ctx.fillRect(2, 22, 6, 2);
        // Lentera kuning berpendar
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 2, 6, 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(3, 3, 4, 4);
        this.textures.addCanvas('street_lamp', c);
      }
    }

    // 11. Bangku Taman Kayu (16x12)
    if (!this.textures.exists('bench')) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 12;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(1, 2, 14, 4); // Sandaran
        ctx.fillRect(1, 7, 14, 3); // Dudukan
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 10, 2, 2); // Kaki
        ctx.fillRect(12, 10, 2, 2);
        this.textures.addCanvas('bench', c);
      }
    }
  }

  // =========================================================================
  // 3. Pembangkitan Tekstur 4 Bangunan Utama Sesuai Lembar Referensi
  // =========================================================================
  private createBuildingTextures(): void {
    // 1. Gedung Sekolah (Materi) - 64x48 px
    if (!this.textures.exists('building_school')) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 48;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Dinding batu bata krem
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(4, 16, 56, 32);
        ctx.fillStyle = '#fde68a';
        for (let y = 18; y < 48; y += 6) {
          ctx.fillRect(4, y, 56, 1);
        }
        // Atap genteng oranye bertingkat
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(2, 10, 60, 6);
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(8, 4, 48, 6);
        // Menara lonceng/jam tengah
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(26, 0, 12, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(29, 3, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(31, 4, 2, 4);
        // Jendela kaca teal retro
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(8, 22, 10, 10);
        ctx.fillRect(46, 22, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 22, 2, 10);
        ctx.fillRect(50, 22, 2, 10);
        // Pintu masuk kayu ganda
        ctx.fillStyle = '#78350f';
        ctx.fillRect(24, 28, 16, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(27, 36, 2, 2);
        ctx.fillRect(35, 36, 2, 2);
        this.textures.addCanvas('building_school', c);
      }
    }

    // 2. Gedung Perpustakaan (Baca) - 60x44 px
    if (!this.textures.exists('building_library')) {
      const c = document.createElement('canvas');
      c.width = 60;
      c.height = 44;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Dinding pilar marmer putih
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(4, 14, 52, 30);
        // Pilar klasik
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(6, 16, 6, 26);
        ctx.fillRect(48, 16, 6, 26);
        ctx.fillRect(20, 16, 4, 26);
        ctx.fillRect(36, 16, 4, 26);
        // Atap kubah / slate emerald
        ctx.fillStyle = '#134e4a';
        ctx.fillRect(2, 8, 56, 6);
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(10, 2, 40, 6);
        // Jendela melengkung hangat
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, 20, 6, 12);
        ctx.fillRect(41, 20, 6, 12);
        // Pintu masuk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(25, 26, 10, 18);
        this.textures.addCanvas('building_library', c);
      }
    }

    // 3. Gedung Lab Komputer (Simulasi) - 60x44 px
    if (!this.textures.exists('building_lab')) {
      const c = document.createElement('canvas');
      c.width = 60;
      c.height = 44;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Dinding teknologi abu-abu gelap
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 14, 52, 30);
        // Aksen garis neon teal
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(4, 14, 52, 2);
        // Atap datar dengan antena satelit
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, 8, 56, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(12, 1, 2, 7);
        ctx.fillRect(8, 2, 10, 2); // Antena dish
        // Jendela kaca lebar dengan tampilan monitor menyala di dalam
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 20, 18, 12);
        ctx.fillRect(34, 20, 18, 12);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(11, 23, 5, 4);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(19, 23, 5, 4);
        ctx.fillRect(37, 23, 5, 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(45, 23, 5, 4);
        // Pintu otomatis
        ctx.fillStyle = '#475569';
        ctx.fillRect(26, 26, 8, 18);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(29, 26, 2, 18);
        this.textures.addCanvas('building_lab', c);
      }
    }

    // 4. Air Mancur Taman Kota (Latihan) - 40x36 px
    if (!this.textures.exists('building_park')) {
      const c = document.createElement('canvas');
      c.width = 40;
      c.height = 36;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Kolam bundar batu
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(20, 22, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.ellipse(20, 22, 15, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pilar air mancur
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(18, 8, 4, 14);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(15, 6, 10, 3);
        // Pancuran air ke atas
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(19, 1, 2, 5);
        ctx.fillRect(17, 3, 6, 2);
        this.textures.addCanvas('building_park', c);
      }
    }
  }

  // =========================================================================
  // 4. Pembangkitan Lencana Pin Lokasi Peta (Sesuai Lembar Referensi)
  // =========================================================================
  private createLocationPinTextures(): void {
    const pins = [
      { key: 'pin_school', tag: 'S', bg: '#f59e0b', border: '#b45309', fg: '#1c1917' },
      { key: 'pin_library', tag: 'P', bg: '#0f766e', border: '#042f2e', fg: '#ffffff' },
      { key: 'pin_park', tag: 'T', bg: '#ea580c', border: '#9a3412', fg: '#ffffff' },
      { key: 'pin_lab', tag: 'L', bg: '#0d9488', border: '#115e59', fg: '#ffffff' }
    ];

    pins.forEach(pin => {
      if (this.textures.exists(pin.key)) return;

      const w = 22;
      const h = 24;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;

      const ctx = c.getContext('2d');
      if (ctx) {
        // Lingkaran / Diamond Pin Penanda RPG
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(3, 1, 16, 16);
        ctx.fillRect(1, 3, 20, 12);
        
        // Ekor penunjuk ke bawah
        ctx.fillRect(9, 17, 4, 3);
        ctx.fillRect(10, 20, 2, 3);

        // Badan pin utama
        ctx.fillStyle = pin.border;
        ctx.fillRect(3, 2, 16, 14);
        ctx.fillRect(2, 4, 18, 10);
        ctx.fillRect(9, 16, 4, 3);
        ctx.fillRect(10, 19, 2, 2);

        // Lapisan warna cerah
        ctx.fillStyle = pin.bg;
        ctx.fillRect(4, 3, 14, 12);
        ctx.fillRect(3, 5, 16, 8);

        // Highlight kilauan sudut
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 4, 3, 2);

        // Huruf inisial penanda lokasi (S, P, T, L)
        ctx.fillStyle = pin.fg;
        ctx.font = 'bold 8px "Press Start 2P", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pin.tag, 11, 10);

        this.textures.addCanvas(pin.key, c);
      }
    });
  }

  // =========================================================================
  // 5. Pembangkitan Tekstur NPC Guru Pak Budi & Musuh
  // =========================================================================
  private createNpcTexture(): void {
    if (this.textures.exists('npc_teacher')) return;

    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 20;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Rambut hitam & kacamata
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, 1, 8, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(5, 5, 6, 4);
    // Kacamata guru
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(5, 6, 2, 2);
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(7, 7, 2, 1);
    // Kemeja putih & dasi merah
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 9, 8, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(7, 9, 2, 5);
    // Celana hitam & sepatu
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5, 15, 6, 4);
    ctx.fillRect(4, 18, 3, 2);
    ctx.fillRect(9, 18, 3, 2);

    this.textures.addCanvas('npc_teacher', c);
  }

  private createMonsterTexture(): void {
    if (this.textures.exists('monster_bug')) return;

    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Bug Monster hijau bertanduk
    ctx.fillStyle = '#15803d';
    ctx.fillRect(8, 2, 2, 6);
    ctx.fillRect(22, 2, 2, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(6, 8, 20, 18);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(8, 10, 16, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, 12, 6, 5);
    ctx.fillRect(18, 12, 6, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 13, 2, 2);
    ctx.fillRect(19, 13, 2, 2);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(2, 14, 4, 2);
    ctx.fillRect(26, 14, 4, 2);
    ctx.fillRect(2, 20, 4, 2);
    ctx.fillRect(26, 20, 4, 2);

    this.textures.addCanvas('monster_bug', c);
  }

  // =========================================================================
  // 6. Pembangkitan Latar & FX Pertarungan RPG (Panel 4 Lembar Referensi)
  // =========================================================================
  private createBattleBackdropTextures(): void {
    // 1. Langit Cerah Berawan (480x150)
    if (!this.textures.exists('battle_sky')) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 150;
      const ctx = c.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 150);
        grad.addColorStop(0, '#134e4a'); // Deep emerald twilight
        grad.addColorStop(0.5, '#0d9488'); // Atmospheric emerald teal
        grad.addColorStop(1, '#ccfbf1'); // Pale mint horizon
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 480, 150);

        // Awan putih lembut
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const drawCloud = (cx: number, cy: number, r: number) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.8, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
          ctx.arc(cx - r * 0.8, cy + r * 0.1, r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        };
        drawCloud(80, 40, 18);
        drawCloud(240, 25, 22);
        drawCloud(400, 50, 16);

        this.textures.addCanvas('battle_sky', c);
      }
    }

    // 2. Perbukitan Hijau Jauh (480x60)
    if (!this.textures.exists('battle_hills')) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 60;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.quadraticCurveTo(120, 10, 240, 35);
        ctx.quadraticCurveTo(360, 5, 480, 25);
        ctx.lineTo(480, 60);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.quadraticCurveTo(80, 25, 180, 45);
        ctx.quadraticCurveTo(300, 20, 480, 40);
        ctx.lineTo(480, 60);
        ctx.closePath();
        ctx.fill();

        this.textures.addCanvas('battle_hills', c);
      }
    }

    // 3. Pagar Kayu Pedesaan (480x24)
    if (!this.textures.exists('battle_fence')) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 24;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#78350f';
        // Palang horizontal ganda
        ctx.fillRect(0, 8, 480, 3);
        ctx.fillRect(0, 15, 480, 3);
        // Tiang kayu vertikal tiap 30px
        for (let x = 10; x < 480; x += 30) {
          ctx.fillRect(x, 2, 4, 22);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x + 3, 2, 1, 22);
          ctx.fillStyle = '#78350f';
        }
        this.textures.addCanvas('battle_fence', c);
      }
    }

    // 4. Padang Rumput Pertempuran & Platform Bertarung (480x130)
    if (!this.textures.exists('battle_ground')) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 130;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Hamparan rumput hijau cerah
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, 480, 130);

        // Pola rumput hangat bertekstur
        ctx.fillStyle = '#16a34a';
        for (let y = 0; y < 130; y += 8) {
          for (let x = (y % 16 === 0 ? 0 : 8); x < 480; x += 16) {
            ctx.fillRect(x, y, 6, 2);
          }
        }

        // Platform bundar musuh (Kiri Atas)
        ctx.fillStyle = 'rgba(21, 128, 61, 0.65)';
        ctx.beginPath();
        ctx.ellipse(120, 40, 65, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Platform bundar hero (Kanan Bawah)
        ctx.fillStyle = 'rgba(21, 128, 61, 0.75)';
        ctx.beginPath();
        ctx.ellipse(360, 85, 75, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('battle_ground', c);
      }
    }

    // 5. Efek Sayatan Serangan (Slash Attack) (32x32)
    if (!this.textures.exists('attack_slash')) {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(16, 16, 12, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();

        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 16, 10, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();

        this.textures.addCanvas('attack_slash', c);
      }
    }

    // 6. Bayangan Transparan Karakter (32x12)
    if (!this.textures.exists('shadow_oval')) {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 12;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(16, 6, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        this.textures.addCanvas('shadow_oval', c);
      }
    }
  }

  // =========================================================================
  // 7. Pendaftaran Siklus Animasi Sprite
  // =========================================================================
  private createHeroAnimations(): void {
    if (this.anims.exists('hero-walk-down')) return;

    this.anims.create({
      key: 'hero-walk-down',
      frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'hero-walk-up',
      frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'hero-walk-right',
      frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'hero-idle',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 1
    });
  }

  private createPetAnimations(): void {
    if (this.anims.exists('pet-walk-down')) return;

    this.anims.create({
      key: 'pet-walk-down',
      frames: this.anims.generateFrameNumbers('pet_dog', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'pet-walk-up',
      frames: this.anims.generateFrameNumbers('pet_dog', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'pet-walk-right',
      frames: this.anims.generateFrameNumbers('pet_dog', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'pet-idle',
      frames: [{ key: 'pet_dog', frame: 0 }],
      frameRate: 1
    });
  }

  // Animasi Berjalan Rekan Murid 2 (Partner Student Animations)
  private createPartnerStudentAnimations(): void {
    if (this.anims.exists('partner-walk-down')) return;

    this.anims.create({
      key: 'partner-walk-down',
      frames: this.anims.generateFrameNumbers('hero_partner', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'partner-walk-up',
      frames: this.anims.generateFrameNumbers('hero_partner', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'partner-walk-right',
      frames: this.anims.generateFrameNumbers('hero_partner', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'partner-idle',
      frames: [{ key: 'hero_partner', frame: 0 }],
      frameRate: 1
    });
  }
}

