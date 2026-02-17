import Phaser from 'phaser';
import { SCENES, PLAYER, GENERATOR, TERMINAL, DOOR, PUSH_BLOCK, ELEVATOR, ENEMY } from '../config.js';
import { generateSparkySprite } from '../assets/SparkySprite.js';
import { generateOutlet, generatePlug, generateWoodenCrate } from '../assets/AssetTextures.js';
import { generateLamppost, generateLamppostGlow } from '../assets/EnvironmentTextures.js';
import { generateWorkerSprite } from '../assets/WorkerSprite.js';
import { generateMentorFace } from '../assets/MentorFace.js';
import sparkyJoeMenuUrl from '../assets/SparkyJoe_clean.png';
import mentorBigUrl from '../assets/mentor_big.png';

// Relative crop box (0..1) into mentor_big to create a zoomed bust portrait.
// If you want it tighter/looser, tweak these numbers.
const MENTOR_BUST_CROP = { x: 0.22, y: 0.02, w: 0.56, h: 0.56 };
const MENTOR_PORTRAIT_SIZE = 64;

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

    // Load mentor portrait for tutorial radio popups
    this.load.image('mentor_big', mentorBigUrl);
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

    // --- Environment decorations ---
    generateLamppost(this);           // 'lamppost'
    generateLamppostGlow(this);       // 'lamppost_glow'

    // --- Generate rectangle textures for elements that still need them ---
    this._generateGeneratorTexture();
    this._rect('ledge', 32, 32, 0x555555);

    // Enemy texture
    this._generateEnemyTexture();

    // City-scape ground tiles (replaces plain grey 'ground' rect)
    this._generateGroundTexture();

    // --- Generate the worker sprite (reference character) ---
    generateWorkerSprite(this);

    // --- Mentor portrait for tutorial radio popups ---
    // Prefer the provided PNG (cropped to a bust). Fallback to procedural if missing.
    this._createMentorBustPortrait();
    generateMentorFace(this);

    this.scene.start(SCENES.MENU);
    } catch (e) {
      console.error('PreloadScene error:', e);
      this.add.text(20, 20, 'PRELOAD ERROR:\n' + e.message + '\n' + e.stack, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ff0000',
        wordWrap: { width: 980 },
      });
    }
  }

  /** Create a zoomed-in bust portrait texture `mentor_face` from `mentor_big`. */
  _createMentorBustPortrait() {
    if (!this.textures.exists('mentor_big')) return;
    if (this.textures.exists('mentor_face')) return;

    const srcImg = this.textures.get('mentor_big').getSourceImage();
    if (!srcImg?.width || !srcImg?.height) return;

    const sx = Math.max(0, Math.floor(srcImg.width * MENTOR_BUST_CROP.x));
    const sy = Math.max(0, Math.floor(srcImg.height * MENTOR_BUST_CROP.y));
    const sw = Math.max(1, Math.floor(srcImg.width * MENTOR_BUST_CROP.w));
    const sh = Math.max(1, Math.floor(srcImg.height * MENTOR_BUST_CROP.h));

    const canvasTex = this.textures.createCanvas('mentor_face', MENTOR_PORTRAIT_SIZE, MENTOR_PORTRAIT_SIZE);
    const ctx = canvasTex.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, MENTOR_PORTRAIT_SIZE, MENTOR_PORTRAIT_SIZE);
    ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, MENTOR_PORTRAIT_SIZE, MENTOR_PORTRAIT_SIZE);
    canvasTex.refresh();
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

  /**
   * Generate a concrete rooftop parapet tile with old New York–style
   * ornamentation (64×32, tileable).  Top edge is a decorative cornice
   * with dentil molding and a capstone lip; body is weathered concrete.
   */
  _generateGroundTexture() {
    const g = this.add.graphics();
    const W = 64;
    const H = 32;

    // ── Concrete body ──
    g.fillStyle(0x7a7568, 1);           // warm sandstone-gray
    g.fillRect(0, 0, W, H);

    // Slightly darker lower half (shadow / underside)
    g.fillStyle(0x6a6558, 0.6);
    g.fillRect(0, H * 0.55, W, H * 0.45);

    // Subtle color variation patches (weathered concrete is never uniform)
    g.fillStyle(0x8a8578, 0.35);
    g.fillRect(3, 12, 12, 6);
    g.fillRect(34, 14, 10, 5);
    g.fillRect(52, 10, 8, 7);
    g.fillStyle(0x625e52, 0.25);
    g.fillRect(16, 18, 14, 5);
    g.fillRect(44, 20, 12, 6);
    g.fillRect(6, 24, 8, 5);

    // Hairline cracks (very subtle)
    g.lineStyle(0.5, 0x555048, 0.3);
    g.lineBetween(18, 14, 22, 28);
    g.lineBetween(46, 12, 50, 22);
    g.lineStyle(0.5, 0x555048, 0.2);
    g.lineBetween(8, 20, 14, 26);

    // ── Capstone lip (top edge — the walkable parapet cap) ──
    const capH = 4;
    g.fillStyle(0x908a7c, 1);           // lighter limestone cap
    g.fillRect(0, 0, W, capH);
    // Bright edge highlight
    g.fillStyle(0xa8a294, 0.6);
    g.fillRect(0, 0, W, 1);
    // Shadow line under cap
    g.lineStyle(1, 0x5a564c, 0.7);
    g.lineBetween(0, capH, W, capH);

    // ── Cornice molding band (below cap) ──
    const moldY = capH + 1;
    const moldH = 3;
    // Ogee / quarter-round profile (lighter raised band)
    g.fillStyle(0x86806e, 1);
    g.fillRect(0, moldY, W, moldH);
    // Top highlight on molding
    g.fillStyle(0x9a9486, 0.5);
    g.fillRect(0, moldY, W, 1);
    // Bottom shadow on molding
    g.fillStyle(0x5e5a4e, 0.5);
    g.fillRect(0, moldY + moldH - 1, W, 1);

    // ── Dentil molding row ──
    const dentilY = moldY + moldH + 1;  // ~9
    const dentilW = 4;
    const dentilH = 3;
    const dentilGap = 3;
    const dentilStep = dentilW + dentilGap;

    g.fillStyle(0x8a8474, 1);
    for (let dx = 1; dx < W; dx += dentilStep) {
      g.fillRect(dx, dentilY, dentilW, dentilH);
    }
    // Tiny highlight on each dentil top
    g.fillStyle(0x9e9888, 0.5);
    for (let dx = 1; dx < W; dx += dentilStep) {
      g.fillRect(dx, dentilY, dentilW, 1);
    }
    // Shadow line under dentil row
    g.lineStyle(0.5, 0x5a564a, 0.5);
    g.lineBetween(0, dentilY + dentilH, W, dentilY + dentilH);

    // ── Recessed panel lines (below dentils, brownstone-style) ──
    const panelY = dentilY + dentilH + 2; // ~14
    const panelH = H - panelY - 4;        // body panel height
    const panelInset = 2;

    // Left panel
    g.lineStyle(0.5, 0x605c50, 0.5);
    g.strokeRect(panelInset, panelY, W / 2 - panelInset - 1, panelH);
    // Right panel
    g.strokeRect(W / 2 + 1, panelY, W / 2 - panelInset - 1, panelH);
    // Inner shadow (gives recessed look)
    g.lineStyle(0.5, 0x8a8678, 0.3);
    g.lineBetween(panelInset + 1, panelY + panelH - 1, W / 2 - panelInset, panelY + panelH - 1);
    g.lineBetween(W / 2 + 2, panelY + panelH - 1, W - panelInset - 1, panelY + panelH - 1);

    // ── Bottom edge / drip line ──
    g.fillStyle(0x5a564c, 0.7);
    g.fillRect(0, H - 2, W, 2);
    // Water stain drip marks (atmospheric)
    g.fillStyle(0x56524a, 0.2);
    g.fillRect(10, H - 6, 2, 4);
    g.fillRect(38, H - 5, 2, 3);
    g.fillRect(55, H - 7, 2, 5);

    // ── Mortar line at tile seams (vertical) ──
    g.lineStyle(0.5, 0x5e5a50, 0.3);
    g.lineBetween(0, capH + 1, 0, H);
    g.lineBetween(W - 1, capH + 1, W - 1, H);

    // ── Edge border ──
    g.lineStyle(1, 0x504c44, 0.5);
    g.strokeRect(0, 0, W, H);

    g.generateTexture('ground', W, H);
    g.destroy();
  }
}
