import Phaser from 'phaser';
import { SCENES, GAME_WIDTH } from '../config.js';
import { isMobile } from '../utils/mobile.js';
import { TouchControls } from '../ui/TouchControls.js';

/**
 * UIScene — HUD overlay that runs on top of GameScene.
 * Shows cord connection status, interact hints, and — on mobile —
 * virtual touch controls (D-pad + action buttons).
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI });
    /** @type {TouchControls|null} */
    this.touchControls = null;
  }

  create() {
    if (isMobile()) {
      this.touchControls = new TouchControls(this);
    }
  }

  update() {
    if (this.touchControls) {
      this.touchControls.update();
    }
  }

  shutdown() {
    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }
  }
}
