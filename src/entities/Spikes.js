import Phaser from 'phaser';
import { SPIKES } from '../config.js';

/**
 * Spikes — a hazard zone that kills the player on contact.
 *
 * The spike strip is drawn procedurally as a row of triangles.
 * It has a static physics body for overlap detection.
 * Spikes can be "neutralised" when a PushBlock covers them,
 * which disables the kill zone.
 *
 * Constructor options:
 * @param {Phaser.Scene} scene
 * @param {object} opts
 * @param {number} opts.x       - Center X of the spike strip. Required.
 * @param {number} opts.y       - Center Y of the spike strip. Required.
 * @param {number} opts.width   - Total width of the spike strip. Required.
 * @param {number} [opts.height] - Spike height (default: SPIKES.HEIGHT).
 * @param {string} [opts.label] - Debug label (default: 'SPIKES').
 */
export class Spikes extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, opts) {
    const w = opts.width;
    const h = opts.height ?? SPIKES.HEIGHT;

    // Generate spike texture — row of triangles
    const key = `spikes_${w}x${h}`;
    if (!scene.textures.exists(key)) {
      const g = scene.add.graphics();
      const tileW = SPIKES.TILE_WIDTH;
      const count = Math.ceil(w / tileW);

      g.fillStyle(SPIKES.COLOR, 1);
      for (let i = 0; i < count; i++) {
        const lx = i * tileW;
        const cx = lx + tileW / 2;
        const rx = lx + tileW;
        // Triangle pointing UP
        g.fillTriangle(lx, h, rx, h, cx, 0);
      }
      g.generateTexture(key, w, h);
      g.destroy();
    }

    super(scene, opts.x, opts.y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body for overlap

    this.elementId = 'spikes';
    this._w = w;
    this._h = h;

    /** Whether the spikes have been neutralised (covered by a block). */
    this._neutralised = false;

    // Debug label
    if (opts.label !== false) {
      scene.add.text(opts.x, opts.y + h / 2 + 8, opts.label ?? '⚠', {
        fontSize: '10px', fontFamily: 'monospace', color: '#f44',
      }).setOrigin(0.5);
    }
  }

  /** Whether spikes are still dangerous. */
  get isDangerous() { return !this._neutralised; }

  /** Mark spikes as neutralised (e.g. covered by a block). */
  neutralise() {
    this._neutralised = true;
    this.body.enable = false; // disable overlap detection
    this.setAlpha(0.3);       // visual feedback
  }

  /** Re-enable spikes (if block is removed). */
  reactivate() {
    this._neutralised = false;
    this.body.enable = true;
    this.setAlpha(1);
  }
}
