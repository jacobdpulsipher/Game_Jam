import Phaser from 'phaser';
import { SCENES, PLAYER, GENERATOR, TERMINAL, DOOR, PUSH_BLOCK, ELEVATOR, ENEMY } from '../config.js';
import { generateSparkySprite } from '../assets/SparkySprite.js';
import { generateOutlet, generatePlug, generateWoodenCrate } from '../assets/AssetTextures.js';
import { generateWorkerSprite } from '../assets/WorkerSprite.js';
import sparkyJoeMenuUrl from '../assets/SparkyJoe_clean.png';

/**
 * PreloadScene — generates placeholder textures and transitions to menu.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload() {
    // Load Sparky Joe character image for the menu screen
    this.load.image('sparky_joe_menu', sparkyJoeMenuUrl);
  }

  create() {
    try {
    // --- Generate the Sparky Joe sprite sheet with all animations ---
    const electricianData = generateSparkySprite(this);

    // Register all animations
    this.anims.create({
      key: 'idle',
      frames: electricianData.animations.idle.frames,
      frameRate: electricianData.animations.idle.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'run',
      frames: electricianData.animations.run.frames,
      frameRate: electricianData.animations.run.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'grab',
      frames: electricianData.animations.grab.frames,
      frameRate: electricianData.animations.grab.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: electricianData.animations.jump.frames,
      frameRate: electricianData.animations.jump.frameRate,
      repeat: 0
    });

    this.anims.create({
      key: 'fall',
      frames: electricianData.animations.fall.frames,
      frameRate: electricianData.animations.fall.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'attack',
      frames: electricianData.animations.attack.frames,
      frameRate: electricianData.animations.attack.frameRate,
      repeat: 0
    });

    // --- Generate art textures ---
    // Outlet-style terminals (2-prong)
    generateOutlet(this, false);   // 'outlet_off'
    generateOutlet(this, true);    // 'outlet_on'
    generatePlug(this);            // 'plug_2prong'

    // Wooden crate for push blocks
    generateWoodenCrate(this, PUSH_BLOCK.SIZE); // 'crate_48_8B6914'

    // --- Generate rectangle textures for elements that still need them ---
    this._generateGeneratorTexture();
    this._rect('ledge', 32, 32, 0x555555);

    // Enemy texture
    this._generateEnemyTexture();

    // City-scape ground tiles (replaces plain grey 'ground' rect)
    this._generateGroundTexture();

    // --- Generate the worker sprite (reference character) ---
    generateWorkerSprite(this);

    this.scene.start(SCENES.MENU);
    } catch (e) {
      console.error('PreloadScene error:', e);
      this.add.text(20, 20, 'PRELOAD ERROR:\n' + e.message + '\n' + e.stack, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ff0000',
        wordWrap: { width: 980 },
      });
    }
  }

  /** Helper: create a filled rectangle texture. */
  _rect(key, w, h, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Generate a small robot/gremlin enemy sprite. */
  _generateEnemyTexture() {
    const w = ENEMY.WIDTH;
    const h = ENEMY.HEIGHT;
    const g = this.add.graphics();

    // Body — rounded rectangle
    g.fillStyle(ENEMY.COLOR, 1);
    g.fillRoundedRect(2, 4, w - 4, h - 4, 6);

    // Darker outline
    g.lineStyle(1, 0x881188, 1);
    g.strokeRoundedRect(2, 4, w - 4, h - 4, 6);

    // Eyes — two yellow dots
    g.fillStyle(ENEMY.EYE_COLOR, 1);
    g.fillCircle(w * 0.33, h * 0.35, 3);
    g.fillCircle(w * 0.67, h * 0.35, 3);

    // Pupils
    g.fillStyle(0x000000, 1);
    g.fillCircle(w * 0.35, h * 0.35, 1.2);
    g.fillCircle(w * 0.69, h * 0.35, 1.2);

    // Mouth — angry zigzag
    g.lineStyle(1.5, 0x220022, 1);
    g.beginPath();
    g.moveTo(w * 0.25, h * 0.6);
    g.lineTo(w * 0.35, h * 0.68);
    g.lineTo(w * 0.45, h * 0.58);
    g.lineTo(w * 0.55, h * 0.68);
    g.lineTo(w * 0.65, h * 0.58);
    g.lineTo(w * 0.75, h * 0.68);
    g.strokePath();

    // Little feet
    g.fillStyle(0x993399, 1);
    g.fillRect(w * 0.2, h - 4, 6, 4);
    g.fillRect(w * 0.6, h - 4, 6, 4);

    g.generateTexture('enemy', w, h);
    g.destroy();
  }

  /** Generate an industrial generator texture. */
  _generateGeneratorTexture() {
    const W = GENERATOR.WIDTH;  // 40
    const H = GENERATOR.HEIGHT; // 40
    const g = this.add.graphics();

    // === MAIN HOUSING (dark steel body) ===
    // Shadow underneath
    g.fillStyle(0x111111, 0.4);
    g.fillRoundedRect(2, 3, W - 2, H - 2, 3);
    // Body
    g.fillStyle(0x3a4048, 1);
    g.fillRoundedRect(0, 0, W, H, 3);
    // Slightly lighter top face (bevel)
    g.fillStyle(0x464e58, 1);
    g.fillRect(2, 2, W - 4, H * 0.4);

    // === HORIZONTAL PANEL LINES (louvered vents) ===
    g.lineStyle(1, 0x2a3038, 0.9);
    for (let y = 8; y < H - 6; y += 4) {
      g.beginPath();
      g.moveTo(4, y); g.lineTo(W - 4, y);
      g.strokePath();
    }
    // Vent highlight lines (just above each louver)
    g.lineStyle(1, 0x555e68, 0.3);
    for (let y = 7; y < H - 7; y += 4) {
      g.beginPath();
      g.moveTo(4, y); g.lineTo(W - 4, y);
      g.strokePath();
    }

    // === VERTICAL PANEL SEAM ===
    g.lineStyle(1, 0x2a2e34, 0.7);
    g.beginPath();
    g.moveTo(W * 0.6, 2); g.lineTo(W * 0.6, H - 2);
    g.strokePath();
    g.lineStyle(1, 0x555e68, 0.25);
    g.beginPath();
    g.moveTo(W * 0.6 + 1, 2); g.lineTo(W * 0.6 + 1, H - 2);
    g.strokePath();

    // === EXHAUST PORT (top-right, circular) ===
    g.fillStyle(0x222428, 1);
    g.fillCircle(W - 8, 7, 4);
    g.lineStyle(1, 0x555860, 0.6);
    g.strokeCircle(W - 8, 7, 4);
    // Inner ring
    g.lineStyle(0.5, 0x333638, 1);
    g.strokeCircle(W - 8, 7, 2.2);
    // "Heat" glow hint
    g.fillStyle(0x884422, 0.3);
    g.fillCircle(W - 8, 7, 2);

    // === PIPES (left side, two horizontal tubes) ===
    // Lower pipe
    g.fillStyle(0x606870, 1);
    g.fillRoundedRect(-2, H - 14, 10, 4, 2);
    g.lineStyle(0.5, 0x888e96, 0.5);
    g.beginPath();
    g.moveTo(0, H - 13); g.lineTo(7, H - 13);
    g.strokePath();
    // Upper pipe
    g.fillStyle(0x585e66, 1);
    g.fillRoundedRect(-2, H - 22, 8, 3, 1.5);
    g.lineStyle(0.5, 0x7a8088, 0.4);
    g.beginPath();
    g.moveTo(0, H - 21); g.lineTo(5, H - 21);
    g.strokePath();

    // === PIPE FITTINGS / JOINTS (small circles at pipe ends) ===
    g.fillStyle(0x70787e, 1);
    g.fillCircle(7, H - 12, 2.5);
    g.fillStyle(0x888e94, 0.6);
    g.fillCircle(6.5, H - 12.5, 1);
    g.fillStyle(0x70787e, 1);
    g.fillCircle(5, H - 20.5, 2);
    g.fillStyle(0x888e94, 0.5);
    g.fillCircle(4.5, H - 21, 0.8);

    // === HOSE (right side, flexible tube hanging down) ===
    g.lineStyle(2.5, 0x2a2a2a, 1);
    g.beginPath();
    g.moveTo(W - 4, H - 8);
    g.lineTo(W - 2, H - 4);
    g.lineTo(W - 5, H + 0);
    g.strokePath();
    // Hose highlight
    g.lineStyle(0.5, 0x444444, 0.6);
    g.beginPath();
    g.moveTo(W - 5, H - 8);
    g.lineTo(W - 3, H - 4);
    g.strokePath();
    // Hose coupling (metal ring)
    g.fillStyle(0x808890, 1);
    g.fillCircle(W - 4, H - 8, 2);

    // === CONTROL PANEL (small rectangle with indicator lights) ===
    g.fillStyle(0x2a2e34, 1);
    g.fillRect(W * 0.62 + 2, 4, 8, 10);
    g.lineStyle(0.5, 0x555860, 0.5);
    g.strokeRect(W * 0.62 + 2, 4, 8, 10);
    // Indicator LEDs
    g.fillStyle(0x00cc44, 1); // green = power on
    g.fillCircle(W * 0.62 + 5, 7, 1.2);
    g.fillStyle(0xcc3300, 0.6); // red = alert (dim)
    g.fillCircle(W * 0.62 + 8, 7, 1.0);
    // Small gauge / dial
    g.fillStyle(0x444a52, 1);
    g.fillCircle(W * 0.62 + 6, 11, 1.5);
    g.lineStyle(0.5, 0x00cc44, 0.8);
    g.beginPath();
    g.moveTo(W * 0.62 + 6, 11);
    g.lineTo(W * 0.62 + 7, 10);
    g.strokePath();

    // === MOUNTING BOLTS (corners) ===
    const boltPositions = [
      { x: 4, y: 4 },
      { x: W - 5, y: H - 5 },
      { x: 4, y: H - 5 },
    ];
    for (const b of boltPositions) {
      g.fillStyle(0x555e66, 1);
      g.fillCircle(b.x, b.y, 1.8);
      g.fillStyle(0x6e767e, 0.7);
      g.fillCircle(b.x - 0.3, b.y - 0.3, 0.7);
    }

    // === EDGE BORDER ===
    g.lineStyle(1, 0x2a2e34, 0.8);
    g.strokeRoundedRect(0, 0, W, H, 3);
    // Top highlight edge
    g.lineStyle(1, 0x5a6068, 0.3);
    g.beginPath();
    g.moveTo(4, 1); g.lineTo(W - 4, 1);
    g.strokePath();

    g.generateTexture('generator', W, H);
    g.destroy();
  }

  /** Generate a rusty steel-beam ground tile with rivets (64×32 rectangle). */
  _generateGroundTexture() {
    const g = this.add.graphics();
    const W = 64; // tile width  (elongated)
    const H = 32; // tile height

    // --- Rusty steel base (International Orange / oxide red) ---
    g.fillStyle(0x8b3a2a, 1);
    g.fillRect(0, 0, W, H);
    // Slightly darker bottom half for depth
    g.fillStyle(0x6e2e22, 1);
    g.fillRect(0, H * 0.55, W, H * 0.45);

    // --- Rust patina variation (blotchy patches, spread across wider tile) ---
    g.fillStyle(0xa04828, 0.5);
    g.fillRect(2, 2, 10, 7);
    g.fillRect(35, 10, 14, 8);
    g.fillRect(52, 3, 9, 6);
    g.fillRect(8, 22, 14, 6);
    g.fillRect(44, 22, 12, 7);
    g.fillStyle(0x944030, 0.4);
    g.fillRect(18, 1, 12, 5);
    g.fillRect(0, 14, 9, 6);
    g.fillRect(28, 18, 10, 5);
    g.fillRect(54, 14, 8, 6);
    // Darker corrosion spots
    g.fillStyle(0x5a2218, 0.35);
    g.fillRect(10, 10, 5, 3);
    g.fillRect(40, 4, 5, 3);
    g.fillRect(56, 26, 6, 3);
    g.fillRect(3, 27, 6, 3);
    g.fillRect(24, 12, 4, 3);

    // --- Horizontal beam groove lines ---
    g.lineStyle(1, 0x4a2018, 0.8);
    g.beginPath();
    g.moveTo(0, 6);  g.lineTo(W, 6);
    g.moveTo(0, 26); g.lineTo(W, 26);
    g.strokePath();

    // Lighter highlight just above grooves (top-lit bevel)
    g.lineStyle(1, 0xb05838, 0.4);
    g.beginPath();
    g.moveTo(0, 5);  g.lineTo(W, 5);
    g.moveTo(0, 25); g.lineTo(W, 25);
    g.strokePath();

    // --- Weathered streaks (rain staining / oxide runs) ---
    g.fillStyle(0xc06030, 0.2);
    g.fillRect(1, 9, 18, 1);
    g.fillRect(30, 14, 22, 1);
    g.fillRect(5, 19, 16, 1);
    g.fillRect(48, 11, 14, 1);
    g.fillStyle(0x4e1e14, 0.2);
    g.fillRect(22, 11, 16, 1);
    g.fillRect(8, 22, 24, 1);
    g.fillRect(42, 20, 18, 1);

    // --- Rivets (staggered, not a perfect grid) ---
    const rivetPositions = [
      { x: 5,  y: 5 },
      { x: 22, y: 5 },
      { x: 42, y: 5 },
      { x: W - 6, y: 5 },
      { x: 14, y: H - 6 },
      { x: 32, y: H - 6 },
      { x: 50, y: H - 6 },
    ];
    for (const r of rivetPositions) {
      // Rivet shadow (dark ring)
      g.fillStyle(0x3a1a10, 0.9);
      g.fillCircle(r.x, r.y + 0.5, 2.6);
      // Rivet body — oxidized metal
      g.fillStyle(0x9a5038, 1);
      g.fillCircle(r.x, r.y, 2.2);
      // Rivet highlight (specular dot)
      g.fillStyle(0xc87050, 0.7);
      g.fillCircle(r.x - 0.6, r.y - 0.6, 0.9);
    }

    // --- Vertical panel seam in the middle ---
    g.lineStyle(1, 0x4a1e14, 0.5);
    g.beginPath();
    g.moveTo(32, 0); g.lineTo(32, H);
    g.strokePath();
    g.lineStyle(1, 0xb86848, 0.2);
    g.beginPath();
    g.moveTo(33, 0); g.lineTo(33, H);
    g.strokePath();

    // --- Edge border (panel seam) ---
    g.lineStyle(1, 0x4a1e14, 0.7);
    g.strokeRect(0, 0, W, H);
    // Top-edge highlight (warm)
    g.lineStyle(1, 0xb86848, 0.3);
    g.beginPath();
    g.moveTo(1, 1); g.lineTo(W - 1, 1);
    g.strokePath();

    g.generateTexture('ground', W, H);
    g.destroy();
  }
}

