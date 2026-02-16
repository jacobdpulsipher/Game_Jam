import Phaser from 'phaser';
import { SCENES, PLAYER, GENERATOR, TERMINAL, DOOR, PUSH_BLOCK, ELEVATOR } from '../config.js';
import { generateElectricianSpriteSheet } from '../assets/ElectricianSprite.js';
import { generateOutlet, generatePlug, generateWoodenCrate } from '../assets/AssetTextures.js';

/**
 * PreloadScene — generates placeholder textures and transitions to menu.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload() {
    // No external assets for MVP — we generate everything procedurally
  }

  create() {
    try {
    // --- Generate the electrician sprite sheet with all animations ---
    const electricianData = generateElectricianSpriteSheet(this);

    // Register all animations
    this.anims.create({
      key: 'idle',
      frames: electricianData.animations.idle.frames,
      frameRate: electricianData.animations.idle.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'run',
      frames: electricianData.animations.run.frames,
      frameRate: electricianData.animations.run.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'grab',
      frames: electricianData.animations.grab.frames,
      frameRate: electricianData.animations.grab.frameRate,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: electricianData.animations.jump.frames,
      frameRate: electricianData.animations.jump.frameRate,
      repeat: 0
    });

    this.anims.create({
      key: 'fall',
      frames: electricianData.animations.fall.frames,
      frameRate: electricianData.animations.fall.frameRate,
      repeat: -1
    });

    // --- Generate art textures ---
    // Outlet-style terminals (2-prong)
    generateOutlet(this, false);   // 'outlet_off'
    generateOutlet(this, true);    // 'outlet_on'
    generatePlug(this);            // 'plug_2prong'

    // Wooden crate for push blocks
    generateWoodenCrate(this, PUSH_BLOCK.SIZE); // 'crate_48_8B6914'

    // --- Generate rectangle textures for elements that still need them ---
    this._rect('generator', GENERATOR.WIDTH, GENERATOR.HEIGHT, GENERATOR.COLOR);
    this._rect('ledge', 32, 32, 0x555555);

    // City-scape ground tiles (replaces plain grey 'ground' rect)
    this._generateGroundTexture();

    this.scene.start(SCENES.MENU);
    } catch (e) {
      console.error('PreloadScene error:', e);
      this.add.text(20, 20, 'PRELOAD ERROR:\n' + e.message + '\n' + e.stack, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ff0000',
        wordWrap: { width: 980 },
      });
    }
  }

  /** Helper: create a filled rectangle texture. */
  _rect(key, w, h, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Generate a city-style concrete/asphalt ground tile. */
  _generateGroundTexture() {
    const g = this.add.graphics();
    // Dark concrete base
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(0, 0, 32, 32);
    // Subtle noise/cracks
    g.fillStyle(0x444444, 0.5);
    g.fillRect(4, 8, 12, 1);
    g.fillRect(18, 20, 10, 1);
    g.fillRect(2, 26, 8, 1);
    // Edge lines
    g.lineStyle(1, 0x2a2a2a, 0.6);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('ground', 32, 32);
    g.destroy();
  }
}

