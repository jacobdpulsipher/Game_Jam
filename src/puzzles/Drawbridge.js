import Phaser from 'phaser';
import { DRAWBRIDGE } from '../config.js';

/**
 * Drawbridge — a bridge plank that rotates from vertical (closed) to horizontal (open).
 *
 * Behavior:
 *   - **Closed (unpowered):** The plank hangs vertically downward from its pivot.
 *     No walkable surface — anything below is exposed (e.g. spikes).
 *   - **Open (powered):** The plank rotates up to horizontal, creating a bridge
 *     the player can walk across.
 *
 * Implementation notes:
 *   Arcade physics bodies don't rotate, so we use two objects:
 *     1. `this` — a sprite whose `angle` is tweened for the visual rotation.
 *        Its origin is set to (0, 0.5) so it pivots at its left-center.
 *     2. `this.bridgeBody` — a thin invisible static body that matches the
 *        bridge's horizontal footprint. Enabled only when the bridge is fully open.
 *
 * Constructor options:
 * @param {Phaser.Scene} scene
 * @param {object} opts
 * @param {number} opts.pivotX     - X of the pivot / hinge point. Required.
 * @param {number} opts.pivotY     - Y of the pivot / hinge point. Required.
 * @param {number} [opts.width]    - Length of the bridge plank (default: DRAWBRIDGE.WIDTH).
 * @param {number} [opts.height]   - Thickness (default: DRAWBRIDGE.HEIGHT).
 * @param {number} [opts.speed]    - Rotation speed in deg/s (default: DRAWBRIDGE.SPEED).
 * @param {string} [opts.direction] - Which direction the bridge extends when open:
 *                                    'right' (default) or 'left'.
 * @param {string} [opts.label]    - Debug label (default: 'DB').
 */
export class Drawbridge extends Phaser.GameObjects.Sprite {
  constructor(scene, opts) {
    const w     = opts.width    ?? DRAWBRIDGE.WIDTH;
    const h     = opts.height   ?? DRAWBRIDGE.HEIGHT;
    const speed = opts.speed    ?? DRAWBRIDGE.SPEED;
    const dir   = opts.direction ?? 'right';
    const label = opts.label    ?? 'DB';

    // Generate a wooden plank texture with metal reinforcements
    const key = `drawbridge_${w}x${h}`;
    if (!scene.textures.exists(key)) {
      const g = scene.add.graphics();
      // Wood base
      g.fillStyle(0x8B6914, 1);
      g.fillRect(0, 0, w, h);
      // Wood grain
      g.lineStyle(1, 0x6B4910, 0.4);
      for (let y = 2; y < h; y += 4) g.lineBetween(0, y, w, y);
      // Darker edges
      g.lineStyle(1, 0x5C3D0F, 0.6);
      g.strokeRect(0, 0, w, h);
      // Metal reinforcement bands
      const bands = Math.max(2, Math.floor(w / 50));
      for (let i = 0; i < bands; i++) {
        const bx = (w / (bands + 1)) * (i + 1) - 3;
        g.fillStyle(0x666666, 0.8);
        g.fillRect(bx, 0, 6, h);
      }
      // Metal corner brackets
      g.fillStyle(0x555555, 1);
      g.fillRect(0, 0, 4, 4);
      g.fillRect(w - 4, 0, 4, 4);
      g.fillRect(0, h - 4, 4, 4);
      g.fillRect(w - 4, h - 4, 4, 4);
      g.generateTexture(key, w, h);
      g.destroy();
    }

    // Position the sprite so the origin (pivot) is at pivotX, pivotY.
    super(scene, opts.pivotX, opts.pivotY, key);
    scene.add.existing(this);

    this.elementId = 'drawbridge';

    /** Dimensions */
    this._w = w;
    this._h = h;

    /** Direction the bridge extends when horizontal */
    this._dir = dir;

    /** Speed in degrees/second */
    this._speed = speed;

    /** Pivot coordinates */
    this.pivotX = opts.pivotX;
    this.pivotY = opts.pivotY;

    /** States */
    this._isActive = false;

    // Set origin so pivot is at the correct edge
    if (dir === 'right') {
      this.setOrigin(0, 0.5);
      this.setAngle(90);   // starts hanging DOWN from pivot
    } else {
      this.setOrigin(1, 0.5);
      this.setAngle(-90);  // starts hanging DOWN from pivot (mirrored)
    }

    // ── Bridge collision body ──
    // An invisible static body enabled only when the bridge is horizontal.
    // We make it tall enough to block the player from walking through the side.
    // The top of the body is flush with pivotY (the ground/platform surface).
    const bodyH = Math.max(h, 64); // tall enough to block sideways entry
    const bodyX = dir === 'right'
      ? opts.pivotX + w / 2
      : opts.pivotX - w / 2;
    const bodyY = opts.pivotY + bodyH / 2; // positions top of body at pivotY

    this.bridgeBody = scene.add.rectangle(bodyX, bodyY, w, bodyH, 0x000000, 0);
    scene.physics.add.existing(this.bridgeBody, true); // static
    this.bridgeBody.body.enable = false; // start disabled (bridge is down)

    // Debug label
    this._label = scene.add.text(opts.pivotX, opts.pivotY - 16, label, {
      fontSize: '12px', fontFamily: 'monospace', color: '#c84',
    }).setOrigin(0.5);

    this.setDepth(5);
  }

  // ───── Public API ─────

  get isActive() { return this._isActive; }

  /** Power on → rotate bridge to horizontal. */
  activate() {
    if (this._isActive) return;
    this._isActive = true;

    this.scene.tweens.killTweensOf(this);

    const targetAngle = 0; // horizontal
    const currentAngle = this.angle;
    const angleDist = Math.abs(targetAngle - currentAngle);
    const duration = (angleDist / this._speed) * 1000;

    this.scene.tweens.add({
      targets: this,
      angle: targetAngle,
      duration: Math.max(duration, 100),
      ease: 'Power2',
      onComplete: () => {
        // Enable the walkable body now that bridge is horizontal
        this.bridgeBody.body.enable = true;
      },
    });
  }

  /** Power off → rotate bridge back to vertical (down). */
  deactivate() {
    if (!this._isActive) return;
    this._isActive = false;

    // Immediately disable the walkable body
    this.bridgeBody.body.enable = false;

    this.scene.tweens.killTweensOf(this);

    const targetAngle = this._dir === 'right' ? 90 : -90;
    const angleDist = Math.abs(targetAngle - this.angle);
    const duration = (angleDist / this._speed) * 1000;

    this.scene.tweens.add({
      targets: this,
      angle: targetAngle,
      duration: Math.max(duration, 100),
      ease: 'Power2',
    });
  }
}
