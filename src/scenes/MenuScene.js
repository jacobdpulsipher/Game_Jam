import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { getFirstLevel } from '../levels/LevelRegistry.js';
import { music } from '../audio/ProceduralMusic.js';

/**
 * MenuScene — title screen / main menu.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // ── Dark city-themed background ──
    const bg = this.add.graphics();
    // Night sky gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(10 + t * 16);
      const g = Math.floor(10 + t * 14);
      const b = Math.floor(30 + t * 20);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, y, GAME_WIDTH, 1);
    }
    // Dim stars
    for (let i = 0; i < 30; i++) {
      const sx = Math.random() * GAME_WIDTH;
      const sy = Math.random() * (GAME_HEIGHT * 0.4);
      const brightness = Math.random() * 0.3 + 0.2;
      const grey = Math.floor(brightness * 255);
      bg.fillStyle(Phaser.Display.Color.GetColor(grey, grey, grey + 30));
      bg.fillRect(sx, sy, 1, 1);
    }
    // Silhouette buildings
    for (let i = 0; i < 14; i++) {
      const bw = 40 + Math.random() * 70;
      const bh = 80 + Math.random() * 200;
      const bx = i * (GAME_WIDTH / 14) + Math.random() * 20 - 10;
      bg.fillStyle(0x0e0e1a, 0.9);
      bg.fillRect(bx, GAME_HEIGHT - bh, bw, bh);
      // Windows
      for (let wy = GAME_HEIGHT - bh + 8; wy < GAME_HEIGHT - 10; wy += 16) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 14) {
          if (Math.random() < 0.25) {
            bg.fillStyle(0x443300, 0.4);
            bg.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }

    this.add.text(cx, cy - 100, 'Everything Is Connected', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 55, 'An Electrician\'s Puzzle', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#8888aa',
    }).setOrigin(0.5);

    const startBtn = this.add.text(cx, cy + 40, '[ Start Game ]', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#44aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerup', () => {
      this._startGame();
    });

    startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerout', () => startBtn.setColor('#44aaff'));

    // Also allow Enter/Space to start
    this.input.keyboard.on('keydown-ENTER', () => this._startGame());
    this.input.keyboard.on('keydown-SPACE', () => this._startGame());

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

  _startGame() {
    music.stop();
    const first = getFirstLevel();
    this.scene.start(SCENES.GAME, { levelId: first.id });
  }
}
