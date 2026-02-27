import Phaser from 'phaser';
import { SCENES } from '../config.js';
import { getAllLevels } from '../levels/LevelRegistry.js';
import { music } from '../audio/ProceduralMusic.js';

/**
 * MenuScene — title screen / main menu.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // ── Dark city-themed background ──
    this._drawBackground();

    const narrow = this.scale.width < 800;

    // ── Sparky Joe character image (left side) ──
    const charX = narrow ? cx - 180 : cx - 220;
    const charY = cy + 40;
    const sparky = this.add.image(charX, charY, 'sparky_joe_menu');
    // Scale to a nice menu size (~320px tall)
    const targetHeight = 320;
    const scale = targetHeight / sparky.height;
    sparky.setScale(scale);
    sparky.setOrigin(0.5, 0.5);

    // Gentle floating animation for the character
    this.tweens.add({
      targets: sparky,
      y: charY - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Big cartoonish title (right side) ──
    const titleX = narrow ? cx + 100 : cx + 120;
    const titleY = 100;
    const cartoonFont = '"Arial Black", "Impact", "Helvetica", sans-serif';
    const titleFontSize = narrow ? '44px' : '58px';
    const subtitleFontSize = narrow ? '28px' : '36px';

    // Shadow layer (deep dark outline)
    this.add.text(titleX + 4, titleY + 4, 'SPARKY JOE', {
      fontSize: titleFontSize,
      fontFamily: cartoonFont,
      color: '#1a0a2e',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Outer glow / outline layer
    this.add.text(titleX + 2, titleY + 2, 'SPARKY JOE', {
      fontSize: titleFontSize,
      fontFamily: cartoonFont,
      color: '#ff4400',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Main title text – bright yellow
    const titleMain = this.add.text(titleX, titleY, 'SPARKY JOE', {
      fontSize: titleFontSize,
      fontFamily: cartoonFont,
      color: '#ffdd00',
      fontStyle: 'bold',
      stroke: '#cc4400',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle "SAVES THE DAY" with fun styling
    this.add.text(titleX + 3, titleY + 53, 'SAVES THE DAY!', {
      fontSize: subtitleFontSize,
      fontFamily: cartoonFont,
      color: '#1a0a2e',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const subtitleMain = this.add.text(titleX, titleY + 50, 'SAVES THE DAY!', {
      fontSize: subtitleFontSize,
      fontFamily: cartoonFont,
      color: '#44eeff',
      fontStyle: 'bold',
      stroke: '#0055aa',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Pulsing scale on title for extra fun
    this.tweens.add({
      targets: [titleMain],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtle scale pulse on subtitle
    this.tweens.add({
      targets: subtitleMain,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Tagline ──
    this.add.text(titleX, titleY + 90, 'An Electrician\'s Puzzle Adventure', {
      fontSize: '14px',
      fontFamily: cartoonFont,
      color: '#aaaacc',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Buttons area (right-center) ──
    const btnX = titleX;
    const btnBaseY = cy + 60;

    // ── Start Game button ──
    const startBtn = this.add.text(btnX, btnBaseY, '▶  START GAME  ▶', {
      fontSize: '24px',
      fontFamily: cartoonFont,
      color: '#44ff44',
      fontStyle: 'bold',
      stroke: '#005500',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerup', () => this._startGame());
    startBtn.on('pointerover', () => { startBtn.setColor('#ffffff'); startBtn.setScale(1.1); });
    startBtn.on('pointerout', () => { startBtn.setColor('#44ff44'); startBtn.setScale(1.0); });

    // ── Level Select heading ──
    this.add.text(btnX, btnBaseY + 48, '— LEVELS —', {
      fontSize: '16px',
      fontFamily: cartoonFont,
      color: '#8888cc',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Level buttons ──
    const levels = getAllLevels();
    const startY = btnBaseY + 75;
    const spacing = 32;

    levels.forEach((lvl, i) => {
      const label = `${lvl.index}. ${lvl.name}`;
      const btn = this.add.text(btnX, startY + i * spacing, label, {
        fontSize: '17px',
        fontFamily: cartoonFont,
        color: '#44ddaa',
        stroke: '#003322',
        strokeThickness: 1,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerup', () => this._startLevel(lvl.id));
      btn.on('pointerover', () => { btn.setColor('#ffffff'); btn.setScale(1.05); });
      btn.on('pointerout', () => { btn.setColor('#44ddaa'); btn.setScale(1.0); });
    });

    // Also allow Enter/Space to start from level 1
    this.input.keyboard.on('keydown-ENTER', () => this._startGame());
    this.input.keyboard.on('keydown-SPACE', () => this._startGame());

    // Number keys 1-9 as shortcuts for levels
    levels.forEach((lvl) => {
      if (lvl.index <= 9) {
        this.input.keyboard.on(`keydown-${lvl.index}`, () => this._startLevel(lvl.id));
      }
    });

    // Start menu music on first interaction
    this.input.once('pointerdown', () => {
      music.init();
      music.playMenu();
    });
    this.input.keyboard.once('keydown', () => {
      music.init();
      music.playMenu();
    });
  }

  _drawBackground() {
    const bg = this.add.graphics();
    const W = this.scale.width;
    const H = this.scale.height;
    // Night sky gradient
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.floor(10 + t * 16);
      const g = Math.floor(10 + t * 14);
      const b = Math.floor(30 + t * 20);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, y, W, 1);
    }
    // Dim stars
    for (let i = 0; i < 30; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * (H * 0.4);
      const brightness = Math.random() * 0.3 + 0.2;
      const grey = Math.floor(brightness * 255);
      bg.fillStyle(Phaser.Display.Color.GetColor(grey, grey, grey + 30));
      bg.fillRect(sx, sy, 1, 1);
    }
    // Silhouette buildings
    for (let i = 0; i < 14; i++) {
      const bw = 40 + Math.random() * 70;
      const bh = 80 + Math.random() * 200;
      const bx = i * (W / 14) + Math.random() * 20 - 10;
      bg.fillStyle(0x0e0e1a, 0.9);
      bg.fillRect(bx, H - bh, bw, bh);
      // Windows
      for (let wy = H - bh + 8; wy < H - 10; wy += 16) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 14) {
          if (Math.random() < 0.25) {
            bg.fillStyle(0x443300, 0.4);
            bg.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }
  }

  _startGame() {
    music.stop();
    this.scene.start(SCENES.GAME, { levelId: 'tut_1' });
  }

  _startLevel(levelId) {
    music.stop();
    this.scene.start(SCENES.GAME, { levelId });
  }
}
