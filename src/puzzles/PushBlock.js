import Phaser from 'phaser';
import { PUSH_BLOCK, GRAVITY } from '../config.js';

/**
 * PushBlock — a block with 2.5D behavior.
 *
 * Visual layers:
 *   - By default the block is in the BACKGROUND. The hero walks past it
 *     (body collision disabled). The top of the block still acts as a
 *     platform the hero can stand on.
 *   - When the hero presses F (interact) near the block, it comes to the
 *     FOREGROUND. The hero grabs it and can push/pull.
 *   - Pressing F again releases the block (stays at current position,
 *     returns to background mode).
 *
 * Gravity / falling:
 *   The block uses a DYNAMIC body so it can fall off edges. It collides
 *   with platforms. When grabbed, gravity is still active on the block
 *   but horizontal movement is controlled by the player. If the block
 *   begins falling (body not blocked.down), the grab auto-releases.
 *
 * Implementation:
 *   We use TWO physics objects:
 *     1. this (the visible block) — dynamic body with gravity.
 *     2. this.topPlatform — a thin static body on top, always active,
 *        so the hero can always stand on the block even in background mode.
 */
export class PushBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Use wooden crate texture if available, fallback to placeholder
    const crateKey = `crate_${PUSH_BLOCK.SIZE}_8B6914`;
    const textureKey = scene.textures.exists(crateKey) ? crateKey : 'pushblock_bg';
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, false); // DYNAMIC body

    // Configure dynamic body
    this.body.setSize(PUSH_BLOCK.SIZE, PUSH_BLOCK.SIZE);
    this.body.setGravityY(0);       // uses world gravity
    this.body.setBounce(0);
    this.body.setMaxVelocity(PUSH_BLOCK.PUSH_SPEED, 600);
    this.setCollideWorldBounds(true);

    this.elementId = 'pushblock';

    /** Whether the block is in foreground (grabbed/solid) or background (walk-through). */
    this.inForeground = false;

    /** Whether the hero is currently holding this block. */
    this.isGrabbed = false;

    /** Reference to the grabbing player. */
    this._grabber = null;

    /** Grab offset — distance from player center to block center at grab time. */
    this._grabOffsetX = 0;

    // Create a thin platform body on top of the block so hero can always jump on it
    this.topPlatform = scene.add.rectangle(x, y - PUSH_BLOCK.SIZE / 2, PUSH_BLOCK.SIZE, 8, 0x000000, 0);
    scene.physics.add.existing(this.topPlatform, true); // static
    this.topPlatform.body.checkCollision.down = false;
    this.topPlatform.body.checkCollision.left = false;
    this.topPlatform.body.checkCollision.right = false;

    // Label
    this._label = scene.add.text(x, y - PUSH_BLOCK.SIZE / 2 - 12, 'B', {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaa',
    }).setOrigin(0.5);
  }

  /**
   * Called by Player.grabBlock(). Brings block to foreground and attaches to player.
   */
  grab(player) {
    this.isGrabbed = true;
    this.inForeground = true;
    this._grabber = player;
    this._grabOffsetX = this.x - player.x;

    // Brighten the crate when grabbed
    this.setTint(0xdddddd);
  }

  /**
   * Called by Player.releaseBlock(). Block returns to background mode.
   */
  release() {
    this.isGrabbed = false;
    this._grabber = null;
    this.inForeground = false;
    this.clearTint();
    // Stop horizontal movement on release
    this.setVelocityX(0);
  }

  /**
   * Called every frame by Player.update() when grabbed.
   * Move block with the player horizontally. If block is falling, auto-release.
   * @returns {boolean} true if still grabbed, false if auto-released due to falling
   */
  moveWith(player) {
    if (!this.isGrabbed) return false;

    // If block is falling (not on ground), auto-release
    if (!this.body.blocked.down) {
      return false; // signal to player to release
    }

    // Move block to follow player horizontally
    const targetX = player.x + this._grabOffsetX;
    this.x = targetX;
    this.setVelocityX(player.body.velocity.x);
    this._syncTop();
    this._label.x = this.x;
    return true;
  }

  /** Called every frame from GameScene to keep topPlatform in sync. */
  syncPosition() {
    this._syncTop();
    this._label.x = this.x;
    this._label.y = this.y - PUSH_BLOCK.SIZE / 2 - 12;
  }

  /** Sync the top platform with the block position. */
  _syncTop() {
    this.topPlatform.x = this.x;
    this.topPlatform.y = this.y - PUSH_BLOCK.SIZE / 2;
    this.topPlatform.body.reset(this.topPlatform.x, this.topPlatform.y);
  }

  /**
   * Check if player is close enough to grab this block.
   */
  isPlayerInRange(player) {
    // Must be beside the block, not on top
    const dx = Math.abs(this.x - player.x);
    const dy = Math.abs(this.y - player.y);
    const blockHalf = PUSH_BLOCK.SIZE / 2;
    // Horizontal: within 1.5 block widths
    // Vertical: player center must be within block's vertical span (not standing on top)
    return dx <= PUSH_BLOCK.SIZE * 1.5 && dy <= blockHalf + 8;
  }

  /**
   * Check if block is directly below a door (for propping).
   * @param {import('./SlideDoor.js').SlideDoor} door
   */
  isUnderDoor(door) {
    // Horizontal overlap
    const overlapX = Math.abs(this.x - door.x) < (PUSH_BLOCK.SIZE / 2 + door.width / 2);
    // Block's top edge must be above the door's bottom edge at closed position
    const blockTop = this.y - PUSH_BLOCK.SIZE / 2;
    const doorBottom = door.closedY + door.height / 2;
    return overlapX && blockTop < doorBottom;
  }
}
