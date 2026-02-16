import Phaser from 'phaser';
import { CORD } from '../config.js';

/**
 * ExtensionCord — visual line drawn from the generator to
 * the currently connected terminal (or to the player if dragging).
 *
 * This is purely visual + range-check logic.
 * It's a Graphics object that redraws every frame.
 */
export class ExtensionCord {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./Generator.js').Generator} generator
   */
  constructor(scene, generator) {
    this.scene = scene;
    this.generator = generator;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(5); // draw above ground, below UI
  }

  /**
   * Call every frame to redraw the cord.
   * @param {import('./Player.js').Player} player
   */
  update(player) {
    this.graphics.clear();

    const gx = this.generator.x;
    const gy = this.generator.y;

    if (player.cordConnectedTerminal) {
      // Cord connected: draw generator → terminal
      const t = player.cordConnectedTerminal;
      this._drawLine(gx, gy, t.x, t.y);
      // Draw plug at terminal end
      this._drawPlug(t.x, t.y);
    } else {
      // Cord not connected: draw generator → player (carrying the cord)
      this._drawLine(gx, gy, player.x, player.y);
      // Draw dangling plug at player end
      this._drawPlug(player.x, player.y + 10);
    }

    // Draw plug at generator end
    this._drawPlug(gx, gy);
  }

  /** Draw a segmented cord line. */
  _drawLine(x1, y1, x2, y2) {
    this.graphics.lineStyle(CORD.WIDTH, CORD.COLOR, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);

    // Simple droopy cord — add a midpoint that sags
    const mx = (x1 + x2) / 2;
    const my = Math.max(y1, y2) + 30; // sag below
    // Quadratic bezier approximation with 3 segments
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const invT = 1 - t;
      // Quadratic bezier: P = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const px = invT * invT * x1 + 2 * invT * t * mx + t * t * x2;
      const py = invT * invT * y1 + 2 * invT * t * my + t * t * y2;
      this.graphics.lineTo(px, py);
    }
    this.graphics.strokePath();
  }

  /**
   * Check if a terminal is within cord range of the generator.
   */
  isInRange(terminal) {
    const dist = Phaser.Math.Distance.Between(
      this.generator.x, this.generator.y,
      terminal.x, terminal.y,
    );
    return dist <= CORD.MAX_LENGTH;
  }

  /** Draw a small 2-prong plug icon at a point. */
  _drawPlug(px, py) {
    const pw = 6;
    const ph = 8;
    // Plug body (cream/white)
    this.graphics.fillStyle(0xf5f5dc, 1);
    this.graphics.fillRect(px - pw / 2, py - ph / 2, pw, ph);
    // Outline
    this.graphics.lineStyle(1, 0x444444, 0.8);
    this.graphics.strokeRect(px - pw / 2, py - ph / 2, pw, ph);
    // Two prongs (gold)
    this.graphics.fillStyle(0xdaa520, 1);
    this.graphics.fillRect(px - 2, py + 1, 1, 3);
    this.graphics.fillRect(px + 1, py + 1, 1, 3);
  }

  destroy() {
    this.graphics.destroy();
  }
}
