import Phaser from 'phaser';
import { ELEVATOR } from '../config.js';

/**
 * Elevator — a moving platform that travels between two stops when powered.
 *
 * Behavior:
 *   - **Activated (powered):** Cycles between `startY` and `endY` using `speed`.
 *     Pauses at each end for `pauseDuration` ms before reversing.
 *   - **Deactivated (unpowered):** Returns to its initial position (`startY`)
 *     at the same speed, then stops.
 *
 * Constructor options object (all optional — defaults from config.js):
 * @param {Phaser.Scene} scene
 * @param {object} opts
 * @param {number} opts.x          - Horizontal center (px). Required.
 * @param {number} opts.startY     - Resting / initial Y position (px). Required.
 * @param {number} opts.endY       - Destination Y when powered (px). Required.
 * @param {number} [opts.width]    - Platform width  (default: ELEVATOR.WIDTH).
 * @param {number} [opts.height]   - Platform height (default: ELEVATOR.HEIGHT).
 * @param {number} [opts.speed]    - Travel speed in px/s (default: ELEVATOR.SPEED).
 * @param {number} [opts.pauseDuration] - Pause at each stop in ms (default: ELEVATOR.PAUSE_DURATION).
 * @param {string} [opts.label]    - Debug label drawn above (default: 'E').
 *
 * The elevator uses a static physics body. Movement is done via tweens with
 * `refreshBody()` so the static body tracks the visual position.
 */
export class Elevator extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, opts) {
    const w = opts.width  ?? ELEVATOR.WIDTH;
    const h = opts.height ?? ELEVATOR.HEIGHT;

    // Generate per-instance textures with metal platform look
    const keyOn  = `elevator_on_${w}x${h}`;
    const keyOff = `elevator_off_${w}x${h}`;
    if (!scene.textures.exists(keyOn)) {
      const g = scene.add.graphics();
      g.fillStyle(0x4488cc, 1);
      g.fillRect(2, 2, w - 4, h - 4);
      g.fillStyle(0x5599dd, 1);
      g.fillRect(0, 0, w, 3); // top trim
      g.fillStyle(0x223366, 1);
      g.fillRect(0, h - 3, w, 3); // bottom trim
      // Safety rails
      g.fillStyle(0x335577, 1);
      g.fillRect(0, 2, 3, h - 4);
      g.fillRect(w - 3, 2, 3, h - 4);
      // Metal plating lines
      g.lineStyle(0.5, 0x5599dd, 0.4);
      for (let x = 6; x < w - 6; x += 8) g.lineBetween(x, 4, x, h - 4);
      g.generateTexture(keyOn, w, h);
      g.destroy();
    }
    if (!scene.textures.exists(keyOff)) {
      const g = scene.add.graphics();
      g.fillStyle(0x334455, 1);
      g.fillRect(2, 2, w - 4, h - 4);
      g.fillStyle(0x445566, 1);
      g.fillRect(0, 0, w, 3);
      g.fillStyle(0x222233, 1);
      g.fillRect(0, h - 3, w, 3);
      g.fillStyle(0x2a3a4a, 1);
      g.fillRect(0, 2, 3, h - 4);
      g.fillRect(w - 3, 2, 3, h - 4);
      g.lineStyle(0.5, 0x445566, 0.3);
      for (let x = 6; x < w - 6; x += 8) g.lineBetween(x, 4, x, h - 4);
      g.generateTexture(keyOff, w, h);
      g.destroy();
    }

    super(scene, opts.x, opts.startY, keyOff);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    /** @type {string} Unique ID assigned by GameScene */
    this.elementId = 'elevator';

    /** Configurable dimensions */
    this._w = w;
    this._h = h;
    this._keyOn  = keyOn;
    this._keyOff = keyOff;

    /** Positions */
    this.startY = opts.startY;
    this.endY   = opts.endY;

    /** Speed in px/sec */
    this.speed = opts.speed ?? ELEVATOR.SPEED;

    /** Pause duration at each stop (ms) */
    this.pauseDuration = opts.pauseDuration ?? ELEVATOR.PAUSE_DURATION;

    /** @private Current travel direction: -1 toward endY (up), 1 toward startY */
    this._goingToEnd = true;

    /** @private */
    this._isActive = false;

    // Debug label
    const label = opts.label ?? 'E';
    scene.add.text(opts.x, opts.startY - 20, label, {
      fontSize: '14px', fontFamily: 'monospace', color: '#4af',
    }).setOrigin(0.5);

    /** Track Y delta each frame so riders can be carried along */
    this._prevY = opts.startY;
    this._deltaY = 0;
  }

  // ───── Public API ─────

  get isActive() { return this._isActive; }

  /** Returns the Y movement delta since last frame (for carrying riders). */
  get deltaY() { return this._deltaY; }

  /** Call each frame (from GameScene.update) to track movement delta. */
  trackMovement() {
    this._deltaY = this.y - this._prevY;
    this._prevY = this.y;
  }

  /** Power on → start cycling between startY and endY. */
  activate() {
    if (this._isActive) return;
    this._isActive = true;
    this.setTexture(this._keyOn);
    this._goingToEnd = true;
    this._moveToNextStop();
  }

  /** Power off → return to startY and stop. */
  deactivate() {
    if (!this._isActive) return;
    this._isActive = false;
    this.setTexture(this._keyOff);
    this.scene.tweens.killTweensOf(this);
    this._returnToStart();
  }

  // ───── Internal helpers ─────

  /** Tween to the next stop, then pause and reverse. */
  _moveToNextStop() {
    if (!this._isActive) return;

    const targetY = this._goingToEnd ? this.endY : this.startY;
    const dist = Math.abs(this.y - targetY);
    if (dist < 1) { this._goingToEnd = !this._goingToEnd; this._moveToNextStop(); return; }

    this.scene.tweens.add({
      targets: this,
      y: targetY,
      duration: (dist / this.speed) * 1000,
      ease: 'Linear',
      onUpdate: () => this.refreshBody(),
      onComplete: () => {
        this._goingToEnd = !this._goingToEnd;
        this.scene.time.delayedCall(this.pauseDuration, () => this._moveToNextStop());
      },
    });
  }

  /** Smoothly return to startY when unpowered. */
  _returnToStart() {
    const dist = Math.abs(this.y - this.startY);
    if (dist < 1) { this.y = this.startY; this.refreshBody(); return; }

    this.scene.tweens.add({
      targets: this,
      y: this.startY,
      duration: (dist / this.speed) * 1000,
      ease: 'Linear',
      onUpdate: () => this.refreshBody(),
    });
  }
}
