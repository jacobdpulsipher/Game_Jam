import Phaser from 'phaser';

/**
 * TouchControls — virtual gamepad rendered inside a Phaser Scene.
 *
 * Layout (landscape phone):
 *   Left side  — D-pad: ◀ ▶ on a row, ▲ (jump) above
 *   Right side — two round buttons: ⚡ Action (D)  🔧 Interact (F)
 *
 * Exposes a state object that Player reads every frame:
 *   touchControls.state.left / right / up / action / interact
 *
 * All positions are in *screen* coordinates (fixed to camera) so the
 * controls stay pinned while the game world scrolls.
 */
export class TouchControls {
  /**
   * @param {Phaser.Scene} scene — the UI overlay scene
   */
  constructor(scene) {
    this.scene = scene;

    /** Current virtual-button state — mirrors keyboard cursors. */
    this.state = {
      left: false,
      right: false,
      up: false,
      action: false,       // D key equivalent
      interact: false,     // F key equivalent
      actionJustPressed: false,
      interactJustPressed: false,
    };

    // Track previous frame for "just pressed" edge detection
    this._prevAction = false;
    this._prevInteract = false;

    this._buttons = [];
    this._create();
  }

  /* ─── internal helpers ─── */

  _create() {
    const { width, height } = this.scene.scale;

    // Button sizes proportional to viewport — thumb-friendly on mobile
    const ALPHA = 0.35;
    const ALPHA_PRESSED = 0.65;
    const BTN_RADIUS = Math.round(height * 0.105);   // ~40px at 384h
    const DPAD_RADIUS = Math.round(height * 0.095);   // ~36px at 384h
    const MARGIN = Math.round(height * 0.04);          // ~15px at 384h

    // ── D-PAD (left side) ──
    const dpadCenterX = MARGIN + DPAD_RADIUS * 2 + 12;
    const dpadCenterY = height - MARGIN - DPAD_RADIUS * 2;

    // Left arrow
    this._makeButton(
      dpadCenterX - DPAD_RADIUS * 1.7, dpadCenterY,
      DPAD_RADIUS, '◀', 'left', ALPHA, ALPHA_PRESSED,
    );

    // Right arrow
    this._makeButton(
      dpadCenterX + DPAD_RADIUS * 1.7, dpadCenterY,
      DPAD_RADIUS, '▶', 'right', ALPHA, ALPHA_PRESSED,
    );

    // Up / Jump — positioned above the d-pad center
    this._makeButton(
      dpadCenterX, dpadCenterY - DPAD_RADIUS * 1.9,
      DPAD_RADIUS, '▲', 'up', ALPHA, ALPHA_PRESSED,
    );

    // ── ACTION BUTTONS (right side) ──
    const actionX = width - MARGIN - BTN_RADIUS;
    const interactX = actionX - BTN_RADIUS * 2.5;

    // Action (plug/unplug — "D" key)
    this._makeButton(
      interactX, height - MARGIN - BTN_RADIUS - BTN_RADIUS * 2.3,
      BTN_RADIUS, '⚡', 'action', ALPHA, ALPHA_PRESSED, 0xffcc00,
    );

    // Interact (grab/release — "F" key)
    this._makeButton(
      actionX, height - MARGIN - BTN_RADIUS,
      BTN_RADIUS, '🔧', 'interact', ALPHA, ALPHA_PRESSED, 0x44aaff,
    );
  }

  /**
   * Create one circular touch button.
   */
  _makeButton(x, y, radius, label, stateKey, alpha, alphaPressed, tint = 0xffffff) {
    const scene = this.scene;

    // Circle background
    const gfx = scene.add.graphics();
    gfx.fillStyle(tint, alpha);
    gfx.fillCircle(0, 0, radius);
    gfx.setScrollFactor(0);
    gfx.setDepth(1000);

    // Container for positioning
    const container = scene.add.container(x, y, [gfx]);
    container.setSize(radius * 2, radius * 2);
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, radius),
      Phaser.Geom.Circle.Contains,
    );
    container.setScrollFactor(0);
    container.setDepth(1000);

    // Label text
    const txt = scene.add.text(0, 0, label, {
      fontSize: `${Math.round(radius * 0.9)}px`,
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    container.add(txt);

    // ── Pointer events ──
    container.on('pointerdown', () => {
      this.state[stateKey] = true;
      gfx.clear();
      gfx.fillStyle(tint, alphaPressed);
      gfx.fillCircle(0, 0, radius);
    });

    container.on('pointerup', () => {
      this.state[stateKey] = false;
      gfx.clear();
      gfx.fillStyle(tint, alpha);
      gfx.fillCircle(0, 0, radius);
    });

    container.on('pointerout', () => {
      this.state[stateKey] = false;
      gfx.clear();
      gfx.fillStyle(tint, alpha);
      gfx.fillCircle(0, 0, radius);
    });

    this._buttons.push(container);
  }

  /**
   * Call once per frame (from UIScene.update) to compute edge-detection
   * flags (justPressed) so Player can rely on them.
   */
  update() {
    this.state.actionJustPressed =
      this.state.action && !this._prevAction;
    this.state.interactJustPressed =
      this.state.interact && !this._prevInteract;

    this._prevAction = this.state.action;
    this._prevInteract = this.state.interact;
  }

  /** Remove all UI elements (scene shutdown). */
  destroy() {
    for (const btn of this._buttons) btn.destroy();
    this._buttons = [];
  }
}
