import Phaser from 'phaser';

/**
 * TriggerZone — an invisible/debug-visible zone that activates a generator.
 *
 * When the player enters this zone, the linked generator auto-activates.
 * Can optionally trigger only once, then disable itself.
 *
 * In debug mode, renders as a translucent rectangle for visibility.
 */
export class TriggerZone extends Phaser.GameObjects.Zone {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.width
   * @param {number} options.height
   * @param {string} options.triggersGenerator — generator ID to activate
   * @param {boolean} [options.onceOnly=false] — disable after first trigger
   * @param {boolean} [options.debugVisible=true] — show in debug mode
   */
  constructor(scene, options) {
    super(
      scene,
      options.x,
      options.y,
      options.width || 100,
      options.height || 100
    );

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static

    this.elementId = options.elementId || `trigger_${Math.random().toString(36).substr(2, 9)}`;
    this.triggersGenerator = options.triggersGenerator;
    this.onceOnly = options.onceOnly || false;
    this.isActive = true;

    // Debug visualization
    this._debugGraphics = null;
    if (options.debugVisible !== false && scene.sys.settings.debug) {
      this._createDebugVisuals();
    }
  }

  /**
   * Create a debug-visible rectangle for this trigger zone
   * @private
   */
  _createDebugVisuals() {
    const scene = this.scene;
    this._debugGraphics = scene.make.graphics({
      x: this.x - this.displayWidth / 2,
      y: this.y - this.displayHeight / 2,
      add: true,
    });

    this._debugGraphics.fillStyle(0x00ffff, 0.2); // cyan with transparency
    this._debugGraphics.fillRect(
      0,
      0,
      this.displayWidth,
      this.displayHeight
    );

    this._debugGraphics.lineStyle(2, 0x00ffff, 0.5);
    this._debugGraphics.strokeRect(
      0,
      0,
      this.displayWidth,
      this.displayHeight
    );

    this._debugGraphics.setDepth(10); // in front of most game elements
  }

  /**
   * Called when player enters this trigger zone
   */
  onPlayerEnter() {
    if (!this.isActive) return;

    // Emit event for GeneratorSystem to pick up
    this.scene.events.emit('trigger-zone-activated', {
      triggerId: this.elementId,
      generatorId: this.triggersGenerator,
    });

    // Disable this trigger if one-time only
    if (this.onceOnly) {
      this.disable();
    }
  }

  /**
   * Disable this trigger zone (prevents further activations)
   */
  disable() {
    this.isActive = false;

    if (this._debugGraphics) {
      this._debugGraphics.fillStyle(0xff0000, 0.1); // red when disabled
      this._debugGraphics.fillRect(
        0,
        0,
        this.displayWidth,
        this.displayHeight
      );
    }
  }

  /**
   * Re-enable this trigger zone
   */
  enable() {
    this.isActive = true;

    if (this._debugGraphics) {
      this._debugGraphics.fillStyle(0x00ffff, 0.2); // back to cyan
      this._debugGraphics.fillRect(
        0,
        0,
        this.displayWidth,
        this.displayHeight
      );
    }
  }

  /**
   * Clean up resources
   */
  destroy(fromScene) {
    if (this._debugGraphics) {
      this._debugGraphics.destroy();
      this._debugGraphics = null;
    }
    super.destroy(fromScene);
  }
}
