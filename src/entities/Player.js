import Phaser from 'phaser';
import { PLAYER } from '../config.js';

/**
 * Player — the hero electrician.
 *
 * Controls:
 *   A/D or Left/Right — move
 *   W or Up or Space  — jump
 *   E                 — action: plug/unplug extension cord at nearby terminal
 *   F                 — interact: grab/release push block
 *
 * State:
 *   this.cordConnectedTerminal — the Terminal currently powered, or null
 *   this.grabbedBlock          — the PushBlock currently held, or null
 *   this.facingRight           — direction the hero faces
 *   this.spawnX / spawnY       — respawn position for death mechanic
 *
 * Animation States:
 *   - idle: standing still
 *   - run: moving horizontally on ground
 *   - grab: holding/pushing block
 *   - jump: airborne (launching or in air)
 *   - fall: falling/descending
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /** @param {Phaser.Scene} scene */
  constructor(scene, x, y) {
    super(scene, x, y, 'electrician', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.setCollideWorldBounds(true);

    // Play idle animation immediately
    this.play('idle');

    /** Spawn / respawn coordinates */
    this.spawnX = x;
    this.spawnY = y;

    /** Currently powered terminal (or null). */
    this.cordConnectedTerminal = null;

    /** Currently grabbed PushBlock (or null). */
    this.grabbedBlock = null;

    /** Direction */
    this.facingRight = true;

    /** Reference to the generator the hero is tethered to */
    this.generator = null;

    /** Whether the player is currently dead (respawning). */
    this._isDead = false;

    /** Track current animation state for smooth transitions */
    this._currentAnimation = 'idle';
    this._wasAirborne = false;

    // --- Input ---
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      left: 'A', right: 'D', up: 'W',
      jump: 'SPACE',
      action: 'E',     // plug/unplug cord
      interact: 'F',   // grab/release block
    });

    // Prevent key repeat on action buttons — only fire once per press
    this._actionJustPressed = false;
    this._interactJustPressed = false;
  }

  /** Called every frame from GameScene.update(). */
  update() {
    if (this._isDead) return;

    const onGround = this.body.blocked.down;
    const isMoving = Math.abs(this.body.velocity.x) > 5; // Small threshold to ignore tiny movements

    // --- Horizontal movement ---
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.setVelocityX(-PLAYER.SPEED);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.setVelocityX(PLAYER.SPEED);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // If we are grabbing a block, move it with us — but release if airborne or block falling
    if (this.grabbedBlock) {
      if (!onGround) {
        this.releaseBlock();
      } else {
        const stillGrabbed = this.grabbedBlock.moveWith(this);
        if (!stillGrabbed) this.releaseBlock();
      }
    }

    // --- Jump ---
    if ((this.cursors.up.isDown || this.keys.up.isDown || this.keys.jump.isDown) && onGround) {
      // Release block before jumping
      if (this.grabbedBlock) this.releaseBlock();
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
    }

    // --- Action button (E) — plug / unplug cord ---
    const actionDown = this.keys.action.isDown;
    if (actionDown && !this._actionJustPressed) {
      this._actionJustPressed = true;
      this.scene.events.emit('player-action', this);
    }
    if (!actionDown) this._actionJustPressed = false;

    // --- Interact button (F) — grab / release block ---
    const interactDown = this.keys.interact.isDown;
    if (interactDown && !this._interactJustPressed) {
      this._interactJustPressed = true;
      this.scene.events.emit('player-interact', this);
    }
    if (!interactDown) this._interactJustPressed = false;

    // --- Animation state machine ---
    this._updateAnimation(onGround, isMoving);
  }

  /**
   * Update animation state based on player condition.
   * Plays the appropriate animation and prevents unnecessary transitions.
   */
  _updateAnimation(onGround, isMoving) {
    let nextAnimation = 'idle';

    // Determine which animation should play
    if (this.grabbedBlock) {
      // Holding/pushing block takes priority
      nextAnimation = 'grab';
    } else if (!onGround) {
      // Airborne: jump or fall
      if (this._wasAirborne && this.body.velocity.y > 0) {
        // Falling (positive Y velocity = downward)
        nextAnimation = 'fall';
      } else {
        // Just jumped or ascending
        nextAnimation = 'jump';
      }
    } else if (isMoving) {
      // Running on ground
      nextAnimation = 'run';
    } else {
      // Standing still on ground
      nextAnimation = 'idle';
    }

    // Only change animation if it's different from current
    if (nextAnimation !== this._currentAnimation) {
      this._currentAnimation = nextAnimation;
      this.play(nextAnimation, true); // true = ignore if already playing
    }

    // Update airborne state for next frame
    this._wasAirborne = !onGround;
  }

  /** Connect cord to a terminal. */
  connectTo(terminal) {
    // Disconnect previous if any
    if (this.cordConnectedTerminal) {
      this.cordConnectedTerminal.setPowered(false);
    }
    this.cordConnectedTerminal = terminal;
    terminal.setPowered(true);
  }

  /** Disconnect cord from current terminal. */
  disconnectCord() {
    if (this.cordConnectedTerminal) {
      this.cordConnectedTerminal.setPowered(false);
      this.cordConnectedTerminal = null;
    }
  }

  /** Grab a block. */
  grabBlock(block) {
    if (this.grabbedBlock) return; // already holding one
    this.grabbedBlock = block;
    block.grab(this);
  }

  /** Release currently held block. */
  releaseBlock() {
    if (!this.grabbedBlock) return;
    this.grabbedBlock.release();
    this.grabbedBlock = null;
  }

  /**
   * Kill the player — plays a brief flash, disconnects cord, resets position.
   * Called by GameScene when player overlaps with spikes.
   */
  die() {
    if (this._isDead) return;
    this._isDead = true;

    // Release any grabbed block
    this.releaseBlock();

    // Disconnect cord
    this.disconnectCord();
    this.scene.events.emit('cord-changed', null);

    // Visual flash
    this.setTint(0xff0000);
    this.setVelocity(0, 0);
    this.body.enable = false;

    this.scene.time.delayedCall(500, () => {
      this._respawn();
    });
  }

  /** Respawn at the level start position. */
  _respawn() {
    this.setPosition(this.spawnX, this.spawnY);
    this.setVelocity(0, 0);
    this.clearTint();
    this.body.enable = true;
    this._isDead = false;
  }
}
