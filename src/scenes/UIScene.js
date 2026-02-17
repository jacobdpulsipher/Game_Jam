import Phaser from 'phaser';
import { SCENES, GAME_WIDTH } from '../config.js';

/**
 * UIScene — HUD overlay that runs on top of GameScene.
 * Shows cord connection status and interact hints.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI });
  }

  create() {
    // Intentionally empty for now.
    // (Previously displayed a debug cord-connection status box.)
  }
}
