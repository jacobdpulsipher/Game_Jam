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
    // Cord status
    this.cordStatus = this.add.text(16, GAME_WIDTH > 800 ? 50 : 16, 'Cord: disconnected', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff8800',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 },
    }).setDepth(200);

    // Listen for cord change events from GameScene
    const gameScene = this.scene.get(SCENES.GAME);
    gameScene.events.on('cord-changed', (terminal) => {
      if (terminal) {
        this.cordStatus.setText(`Cord: → ${terminal.elementId}`);
        this.cordStatus.setColor('#00ff00');
      } else {
        this.cordStatus.setText('Cord: disconnected');
        this.cordStatus.setColor('#ff8800');
      }
    });
  }
}
