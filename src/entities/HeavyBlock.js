import Phaser from 'phaser';
import { HEAVY_BLOCK } from '../config.js';

/**
 * HeavyBlock — a gravity-following wall that the player CANNOT push or grab.
 *
 * Behavior:
 *   - Falls with world gravity (dynamic body).
 *   - Collides with platforms, push blocks (via topPlatform), doors, elevators.
 *   - Player collides with it (solid wall) and can stand on its topPlatform.
 *   - Player CANNOT grab, push, or move it in any way.
 *   - If its support is removed (e.g. a push block pulled out from under it),
 *     it falls until it lands on the next solid surface.
 *
 * Implementation mirrors PushBlock's two-body approach:
 *   1. this (the visible block) — dynamic body with gravity
 *   2. this.topPlatform — thin static body on top so the player can stand on it
 *
 * Use case: Place on top of a PushBlock to create an unjumpable barrier.
 * When the PushBlock is removed, the heavy block drops to the floor and becomes
 * short enough to jump over.
 */
export class HeavyBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, width, height) {
    const w = width  ?? HEAVY_BLOCK.WIDTH;
    const h = height ?? HEAVY_BLOCK.HEIGHT;

    // ── Generate texture (industrial steel panel) ──
    const texKey = `heavyblock_${w}x${h}`;
    if (!scene.textures.exists(texKey)) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });

      // Base steel plate
      g.fillStyle(0x556677, 1);
      g.fillRect(0, 0, w, h);

      // Darker border
      g.lineStyle(2, 0x334455, 1);
      g.strokeRect(1, 1, w - 2, h - 2);

      // Inner bevel (lighter top-left, darker bottom-right)
      g.lineStyle(1, 0x778899, 0.6);
      g.lineBetween(2, 2, w - 2, 2);   // top highlight
      g.lineBetween(2, 2, 2, h - 2);   // left highlight
      g.lineStyle(1, 0x2a3a4a, 0.6);
      g.lineBetween(w - 2, 2, w - 2, h - 2); // right shadow
      g.lineBetween(2, h - 2, w - 2, h - 2); // bottom shadow

      // Horizontal panel lines (welded seams)
      g.lineStyle(1, 0x3d4d5d, 0.7);
      const panels = Math.max(2, Math.floor(h / 24));
      for (let i = 1; i < panels; i++) {
        const py = (h / panels) * i;
        g.lineBetween(3, py, w - 3, py);
      }

      // Rivets along edges
      g.fillStyle(0x445566, 1);
      const rivetSpacingV = Math.max(16, h / 4);
      for (let ry = 8; ry < h - 4; ry += rivetSpacingV) {
        g.fillCircle(6, ry, 2);
        g.fillCircle(w - 6, ry, 2);
      }

      // Rivet highlights
      g.fillStyle(0x778899, 0.5);
      for (let ry = 8; ry < h - 4; ry += rivetSpacingV) {
        g.fillCircle(5.5, ry - 0.5, 1);
        g.fillCircle(w - 6.5, ry - 0.5, 1);
      }

      // Hazard stripe near top (yellow/black warning)
      const stripeH = 4;
      const stripeY = 4;
      g.fillStyle(0xccaa00, 0.7);
      g.fillRect(3, stripeY, w - 6, stripeH);
      // Diagonal black lines in the stripe
      g.lineStyle(1, 0x222222, 0.8);
      for (let sx = 0; sx < w; sx += 8) {
        g.lineBetween(sx, stripeY, sx + stripeH, stripeY + stripeH);
      }

      g.generateTexture(texKey, w, h);
      g.destroy();
    }

    super(scene, x, y, texKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, false); // DYNAMIC body

    /** Configurable dimensions */
    this._w = w;
    this._h = h;

    // Configure dynamic body
    this.body.setSize(w, h);
    this.body.setGravityY(0);       // uses world gravity (900)
    this.body.setBounce(0);
    this.body.setMaxVelocity(0, 600); // cannot move horizontally, only falls
    this.body.pushable = false;     // player cannot push it, but it still collides with platforms
    this.setCollideWorldBounds(true);

    /** @type {string} Unique ID assigned by GameScene */
    this.elementId = 'heavyblock';

    // ── Top platform (so player can stand on the heavy block) ──
    this.topPlatform = scene.add.rectangle(x, y - h / 2, w, 8, 0x000000, 0);
    scene.physics.add.existing(this.topPlatform, true); // static
    this.topPlatform.body.checkCollision.down  = false;
    this.topPlatform.body.checkCollision.left  = false;
    this.topPlatform.body.checkCollision.right = false;

    // Debug label
    this._label = scene.add.text(x, y - h / 2 - 12, 'HW', {
      fontSize: '12px', fontFamily: 'monospace', color: '#8899aa',
    }).setOrigin(0.5);

    // ── Skirt body (fills the gap between block bottom and the floor) ──
    // HW1 body sits above the player body (same-height objects = no vertical
    // overlap). The skirt extends below HW1 into the player's body range,
    // blocking horizontal passage. checkCollision up/down disabled so it
    // doesn't interfere with vertical movement (jumping over after drop).
    // When HW1 drops to the floor the skirt slides below floor level and
    // becomes inert (no overlap with player body).
    this._skirtH = 48;
    this.skirt = scene.add.rectangle(
      x, y + h / 2 + this._skirtH / 2,
      w, this._skirtH, 0x445566, 1
    );
    this.skirt.setStrokeStyle(1, 0x334455, 1);
    scene.physics.add.existing(this.skirt, true); // static
    this.skirt.body.checkCollision.up   = false;
    this.skirt.body.checkCollision.down = false;
    // left & right remain true — blocks horizontal passage
  }

  /** Called every frame from GameScene to keep auxiliary bodies in sync. */
  syncPosition() {
    // Top platform
    this.topPlatform.x = this.x;
    this.topPlatform.y = this.y - this._h / 2;
    this.topPlatform.body.reset(this.topPlatform.x, this.topPlatform.y);

    // Skirt (extends below main body)
    this.skirt.x = this.x;
    this.skirt.y = this.y + this._h / 2 + this._skirtH / 2;
    this.skirt.body.reset(this.skirt.x, this.skirt.y);

    // Label
    this._label.x = this.x;
    this._label.y = this.y - this._h / 2 - 12;
  }
}
