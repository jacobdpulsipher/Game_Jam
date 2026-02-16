import Phaser from 'phaser';
import { DOOR } from '../config.js';

/**
 * SlideDoor — a door that slides open when powered and closes when unpowered.
 *
 * Behavior:
 *   - **Activated (powered):** Slides from `closedPos` to `openPos` over time.
 *   - **Deactivated (unpowered):** Slides back to `closedPos`.
 *     If a PushBlock is underneath, the door stops (props) on the block;
 *     when the block moves away, the door resumes closing.
 *
 * Constructor options object (all optional — defaults from config.js):
 * @param {Phaser.Scene} scene
 * @param {object} opts
 * @param {number} opts.x         - Horizontal center (px). Required.
 * @param {number} opts.y         - Closed (resting) center Y (px). Required.
 * @param {number} [opts.width]   - Door width  (default: DOOR.WIDTH).
 * @param {number} [opts.height]  - Door height (default: DOOR.HEIGHT).
 * @param {number} [opts.slideSpeed] - Speed in px/sec (default: DOOR.SLIDE_SPEED).
 * @param {string} [opts.direction]  - 'up' | 'down' | 'left' | 'right' (default: 'up').
 * @param {number} [opts.range]   - How far the door slides in px (default: opts.height).
 * @param {string} [opts.label]   - Debug label (default: 'D').
 *
 * Uses a static physics body. Movement via tweens + `refreshBody()`.
 */
export class SlideDoor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, opts) {
    const w     = opts.width      ?? DOOR.WIDTH;
    const h     = opts.height     ?? DOOR.HEIGHT;
    const speed = opts.slideSpeed ?? DOOR.SLIDE_SPEED;
    const dir   = opts.direction  ?? 'up';
    const range = opts.range      ?? h;
    const label = opts.label      ?? 'D';

    // Generate per-instance texture with industrial city look
    const key = `door_${w}x${h}`;
    if (!scene.textures.exists(key)) {
      const g = scene.add.graphics();
      // Dark metallic body
      g.fillStyle(0x3a3a4a, 1);
      g.fillRect(0, 0, w, h);
      // Panel border
      g.lineStyle(2, 0x222233, 1);
      g.strokeRect(0, 0, w, h);
      g.lineStyle(1, 0x555566, 0.6);
      g.strokeRect(2, 2, w - 4, h - 4);
      // Panel dividers
      const panelWidth = w / 3;
      for (let i = 1; i < 3; i++) {
        g.lineStyle(1, 0x2a2a3a, 0.8);
        g.lineBetween(panelWidth * i, 4, panelWidth * i, h - 4);
      }
      // Rivets
      g.fillStyle(0x556677, 1);
      for (let y = 10; y < h - 10; y += 18) {
        for (let x = 6; x < w - 6; x += Math.max(w / 4, 10)) {
          g.fillCircle(x, y, 1.5);
        }
      }
      // Small indicator window at top
      const winS = Math.min(w / 4, 10);
      g.fillStyle(0x112233, 1);
      g.fillRect(w / 2 - winS / 2, 6, winS, winS);
      g.lineStyle(1, 0x556677, 0.8);
      g.strokeRect(w / 2 - winS / 2, 6, winS, winS);
      g.generateTexture(key, w, h);
      g.destroy();
    }

    super(scene, opts.x, opts.y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    /** @type {string} */
    this.elementId = 'door';

    /** Configurable dimensions */
    this._w = w;
    this._h = h;

    /** @private */
    this._isActive = false;
    this._propped  = false;
    this._slideSpeed = speed;

    // Compute closed / open positions based on direction
    this.closedX = opts.x;
    this.closedY = opts.y;

    const offsets = { up: [0, -range], down: [0, range], left: [-range, 0], right: [range, 0] };
    const [dx, dy] = offsets[dir] || offsets.up;
    this.openX = opts.x + dx;
    this.openY = opts.y + dy;

    /** Total range in pixels (for duration calc) */
    this._range = range;

    // Debug label
    scene.add.text(opts.x, opts.y - h / 2 - 10, label, {
      fontSize: '14px', fontFamily: 'monospace', color: '#a5f',
    }).setOrigin(0.5);
  }

  // ───── Public API ─────

  get isActive() { return this._isActive; }
  get isPropped() { return this._propped; }

  /** Power on → slide to open position. */
  activate() {
    if (this._isActive) return;
    this._isActive = true;
    this._propped = false;
    this.scene.tweens.killTweensOf(this);

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.openX, this.openY);
    if (dist < 1) return;

    this.scene.tweens.add({
      targets: this,
      x: this.openX,
      y: this.openY,
      duration: (dist / this._slideSpeed) * 1000,
      ease: 'Power1',
      onUpdate: () => this.refreshBody(),
    });
  }

  /** Power off → slide back to closed position. Emits 'door-closing-tick' each frame. */
  deactivate() {
    if (!this._isActive) return;
    this._isActive = false;
    this._propped = false;
    this.scene.tweens.killTweensOf(this);

    this._tweenToClose(this.closedX, this.closedY);
  }

  /** Stop closing at a specific position (propped by a block). */
  propAt(y) {
    this.scene.tweens.killTweensOf(this);
    this.y = y;
    this._propped = true;
    this.refreshBody();
  }

  /** Resume closing after block is removed. */
  resumeClosing() {
    if (!this._propped) return;
    this._propped = false;
    this._tweenToClose(this.closedX, this.closedY);
  }

  // ───── Internal ─────

  /** @private Tween toward the closed position, emitting tick events. */
  _tweenToClose(targetX, targetY) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    if (dist < 1) { this.x = targetX; this.y = targetY; this.refreshBody(); return; }

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: (dist / this._slideSpeed) * 1000,
      ease: 'Power1',
      onUpdate: () => {
        this.refreshBody();
        this.scene.events.emit('door-closing-tick', this);
      },
    });
  }
}
