import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, SCENES } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { isMobile } from './utils/mobile.js';

const mobile = isMobile();

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: mobile ? Phaser.Scale.EXPAND : Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // On mobile, EXPAND fills the screen; on desktop, FIT with 2x zoom
    zoom: mobile ? 1 : 2,
  },
  input: {
    // Enable multi-touch so D-pad + action buttons work simultaneously
    activePointers: mobile ? 4 : 1,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
};

const game = new Phaser.Game(config);
