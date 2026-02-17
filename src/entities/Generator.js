import Phaser from 'phaser';
import { GENERATOR } from '../config.js';

/**
 * Generator — a power source the hero is tethered to.
 *
 * Two types:
 *   - PRIMARY (isPrimary=true): hero carries cord from this to terminals
 *   - SECONDARY (isPrimary=false): auto-activates linked elements when triggered
 *
 * Static object — doesn't move.
 */
export class Generator extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, 'generator');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static

    this.elementId = null; // set by GameScene

    // Generator type
    this.isPrimary = options.isPrimary !== false; // default true
    this.isActivated = options.isActivated ?? this.isPrimary; // secondaries start inactive

    // List of element IDs this generator auto-activates (secondary only)
    this.autoActivateIds = options.autoActivateIds || [];

    // Track currently-active linked elements for deactivation
    this._activeElements = new Map(); // elementId → element

    // Label
    this._label = scene.add.text(x, y - 30, 'G', {
      fontSize: '14px', fontFamily: 'monospace', color: this._getLabelColor(),
    }).setOrigin(0.5);

    // Glow effect for activation state (secondary only)
    this._glowGraphics = null;
    if (!this.isPrimary) {
      this._initGlow();
    }
  }

  /**
   * Get label color based on generator type and activation state
   */
  _getLabelColor() {
    if (this.isPrimary) return '#0f0';     // Green for primary
    if (this.isActivated) return '#ffff00'; // Yellow for active secondary
    return '#ff6600';                       // Orange for inactive secondary
  }

  /**
   * Initialize glow effect for secondary generators
   */
  _initGlow() {
    const scene = this.scene;
    this._glowGraphics = scene.make.graphics({
      x: this.x,
      y: this.y,
      add: true,
    });
    this._glowGraphics.setDepth(-1); // behind the sprite
    this._updateGlow();
  }

  /**
   * Update glow based on activation state
   */
  _updateGlow() {
    if (!this._glowGraphics) return;

    this._glowGraphics.clear();

    if (this.isActivated) {
      // Bright yellow glow when active
      this._glowGraphics.fillStyle(0xffff00, 0.3);
      this._glowGraphics.fillCircle(0, 0, 60);
      this._glowGraphics.fillCircle(0, 0, 40);
    } else {
      // Dim orange glow when inactive
      this._glowGraphics.fillStyle(0xff6600, 0.15);
      this._glowGraphics.fillCircle(0, 0, 50);
    }
  }

  /**
   * Set label text
   */
  setLabel(text) {
    this._label.setText(text);
  }

  /**
   * Activate this generator and all its linked elements (secondary only).
   * For primary generators, this is a no-op (they're always "on" via cord).
   * @param {Object.<string, Phaser.Physics.Arcade.Sprite>} elementsById
   */
  activate(elementsById = {}) {
    if (this.isPrimary) return; // primary generators don't auto-activate

    this.isActivated = true;
    this._label.setColor(this._getLabelColor());
    this._updateGlow();

    // Activate all linked elements (permanently — generator power doesn't toggle)
    for (const id of this.autoActivateIds) {
      const element = elementsById[id];
      if (element && element.activate) {
        element._permanentlyPowered = true;
        element.activate();
        this._activeElements.set(id, element);
      }
    }

    // Emit event for debugging/UI
    this.scene.events.emit('generator-activated', {
      generatorId: this.elementId,
      activatedElements: Array.from(this._activeElements.keys()),
    });
  }

  /**
   * Deactivate this generator and all its linked elements (secondary only).
   * @param {Object.<string, Phaser.Physics.Arcade.Sprite>} elementsById
   */
  deactivate(elementsById = {}) {
    if (this.isPrimary) return; // primary generators don't auto-deactivate

    this.isActivated = false;
    this._label.setColor(this._getLabelColor());
    this._updateGlow();

    // Deactivate all currently-active linked elements
    for (const [id, element] of this._activeElements.entries()) {
      if (element && element.deactivate) {
        element.deactivate();
      }
    }
    this._activeElements.clear();

    // Emit event for debugging/UI
    this.scene.events.emit('generator-deactivated', {
      generatorId: this.elementId,
    });
  }

  /**
   * Toggle activation state (secondary only)
   * @param {Object.<string, Phaser.Physics.Arcade.Sprite>} elementsById
   */
  toggle(elementsById = {}) {
    if (this.isActivated) {
      this.deactivate(elementsById);
    } else {
      this.activate(elementsById);
    }
  }

  /**
   * Clean up resources
   */
  destroy(fromScene) {
    if (this._glowGraphics) {
      this._glowGraphics.destroy();
      this._glowGraphics = null;
    }
    if (this._label) {
      this._label.destroy();
      this._label = null;
    }
    super.destroy(fromScene);
  }
}
