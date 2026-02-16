import Phaser from 'phaser';
import { TERMINAL } from '../config.js';
import { music } from '../audio/ProceduralMusic.js';

/**
 * Terminal — a plug point on a puzzle element.
 * The hero stands near it and presses E to connect/disconnect the cord.
 * When powered, it activates its linked puzzle element.
 *
 * Properties:
 *   this.powered      — whether the cord is plugged in
 *   this.linkedElement — the puzzle element this terminal controls
 */
export class Terminal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Use outlet texture if available, fallback to plain rectangle
    const textureKey = scene.textures.exists('outlet_off') ? 'outlet_off' : 'terminal';
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static

    this.elementId = null;
    this.powered = false;
    this._useOutletTexture = scene.textures.exists('outlet_off');

    /** The puzzle element this terminal powers */
    this.linkedElement = null;

    /** Label above terminal */
    this._label = scene.add.text(x, y - 20, 't', {
      fontSize: '11px', fontFamily: 'monospace', color: '#f00',
    }).setOrigin(0.5);
  }

  /**
   * Link this terminal to a puzzle element.
   * When powered, it calls element.activate(); when unpowered, element.deactivate().
   */
  linkTo(element) {
    this.linkedElement = element;
  }

  /**
   * Set powered state. Called by Player.connectTo() / Player.disconnectCord().
   */
  setPowered(value) {
    // Only play sound if state actually changes
    if (this.powered !== value) {
      music.playElectricity();
    }
    
    this.powered = value;
    
    // Swap texture to outlet on/off or fallback
    if (this._useOutletTexture) {
      this.setTexture(value ? 'outlet_on' : 'outlet_off');
    } else {
      this.setTexture(value ? 'terminal_powered' : 'terminal');
    }
    this._label.setColor(value ? '#0f0' : '#f00');

    // Activate or deactivate linked element
    if (this.linkedElement) {
      if (value) {
        this.linkedElement.activate();
      } else {
        this.linkedElement.deactivate();
      }
    }
  }

  /**
   * Check if player is within interaction range.
   */
  isPlayerInRange(player) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return dist <= TERMINAL.INTERACT_RANGE;
  }
}
