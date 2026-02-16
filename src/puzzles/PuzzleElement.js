import Phaser from 'phaser';

/**
 * PuzzleElement — abstract base class for all puzzle mechanisms.
 *
 * Every puzzle piece (door, elevator, drawbridge, push-block, trigger)
 * extends this class and implements activate() / deactivate().
 *
 * The ConnectionSystem uses this interface to wire elements together
 * without caring about the concrete type.
 */
export class PuzzleElement extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {object} [props] — custom properties from the Tiled object
   */
  constructor(scene, x, y, texture, props = {}) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static by default

    /** Unique ID, typically set from the Tiled object layer. */
    this.elementId = props.id ?? null;

    /** Whether this element is currently in its "active" state. */
    this._isActive = false;
  }

  /** @returns {boolean} */
  get isActive() {
    return this._isActive;
  }

  /**
   * Turn this element ON (open, raise, etc.).
   * Override in subclass.
   */
  activate() {
    this._isActive = true;
  }

  /**
   * Turn this element OFF (close, lower, etc.).
   * Override in subclass.
   */
  deactivate() {
    this._isActive = false;
  }

  /** Toggle between active and inactive. */
  toggle() {
    if (this._isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }
}
