import Phaser from 'phaser';
import { ENEMY } from '../config.js';

/**
 * Enemy — a patrolling hazard that kills the player on contact.
 *
 * Behavior:
 *   - Patrols horizontally between rangeLeft and rangeRight.
 *   - Reverses direction when hitting a patrol boundary or a wall.
 *   - Touching the player triggers player.die() (same as spikes).
 *   - Jumping on top does NOT kill the enemy.
 *   - Can only be killed by the extension cord plug (when cord is NOT
 *     connected to a terminal — i.e. the plug is dangling free).
 *
 * Constructor options:
 * @param {Phaser.Scene} scene
 * @param {object} opts
 * @param {number}  opts.x          - Starting X position.
 * @param {number}  opts.y          - Starting Y position.
 * @param {number}  [opts.speed]    - Movement speed (default: ENEMY.SPEED).
 * @param {number}  opts.rangeLeft  - Left patrol boundary (world X).
 * @param {number}  opts.rangeRight - Right patrol boundary (world X).
 * @param {string}  [opts.direction]- Starting direction: 'left' or 'right' (default: 'right').
 * @param {string}  [opts.label]    - Debug label.
 * @param {string}  [opts.id]       - Element id.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, opts) {
    const w = opts.width ?? ENEMY.WIDTH;
    const h = opts.height ?? ENEMY.HEIGHT;

    // Prefer hoodlum spritesheet if available; fallback to procedural placeholder
    const textureKey = scene.textures.exists('hoodlum') ? 'hoodlum' : 'enemy';
    super(scene, opts.x, opts.y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.elementId = opts.id || 'enemy';
    this._speed = opts.speed ?? ENEMY.SPEED;
    this._rangeLeft = opts.rangeLeft;
    this._rangeRight = opts.rangeRight;
    this._alive = true;
    this._usesHoodlumSprite = textureKey === 'hoodlum';

    // Set up physics body — sized to match the enemy sprite
    this.body.setSize(w, h);
    this.setDisplaySize(w, h);
    this.body.setAllowGravity(true);
    this.setCollideWorldBounds(true);

    // Start moving in the specified direction
    const dir = opts.direction === 'left' ? -1 : 1;
    this.setVelocityX(this._speed * dir);
    if (dir === -1) this.setFlipX(true);

    if (this._usesHoodlumSprite && scene.anims.exists('hoodlum_walk')) {
      this.play('hoodlum_walk');
    }

    // Debug label
    if (opts.label) {
      this._debugLabel = scene.add.text(opts.x, opts.y - h / 2 - 12, opts.label, {
        fontSize: '10px', fontFamily: 'monospace', color: '#f88',
      }).setOrigin(0.5);
    }
  }

  /** Whether this enemy is still alive and dangerous. */
  get isDangerous() { return this._alive; }

  /** Called every frame from GameScene.update(). */
  update() {
    if (!this._alive) return;

    if (this._usesHoodlumSprite && this.anims && this.scene.anims.exists('hoodlum_walk')) {
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'hoodlum_walk') {
        this.play('hoodlum_walk');
      }
    }

    // Reverse at patrol boundaries
    if (this.x <= this._rangeLeft) {
      this.x = this._rangeLeft + 1;
      this.setVelocityX(this._speed);
      this.setFlipX(false);
    } else if (this.x >= this._rangeRight) {
      this.x = this._rangeRight - 1;
      this.setVelocityX(-this._speed);
      this.setFlipX(true);
    }

    // Reverse if hitting a wall
    if (this.body.blocked.left) {
      this.setVelocityX(this._speed);
      this.setFlipX(false);
    } else if (this.body.blocked.right) {
      this.setVelocityX(-this._speed);
      this.setFlipX(true);
    }

    // Update debug label position
    if (this._debugLabel) {
      this._debugLabel.setPosition(this.x, this.y - this.body.height / 2 - 12);
    }
  }

  /**
   * Kill the enemy — called when hit by the extension cord plug.
   * Plays a brief death animation then removes from the scene.
   */
  kill() {
    if (!this._alive) return;
    this._alive = false;

    // Stop movement
    this.setVelocity(0, 0);
    this.body.enable = false;

    // Death visual — flash and shrink
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        if (this._debugLabel) this._debugLabel.destroy();
        this.destroy();
      },
    });
  }

  destroy(fromScene) {
    if (this._debugLabel) {
      this._debugLabel.destroy();
      this._debugLabel = null;
    }
    super.destroy(fromScene);
  }
}
