import Phaser from 'phaser';
import { SCENES } from '../config.js';

/**
 * BootScene — first scene to run.
 * Loads only the bare-minimum assets needed for the loading screen,
 * then hands off to PreloadScene for the heavy lifting.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // TODO: load loading-bar sprite / background here
  }

  create() {
    this.scene.start(SCENES.PRELOAD);
  }
}
