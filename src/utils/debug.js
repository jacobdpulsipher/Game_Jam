/**
 * Debug utilities — call these during development, strip for production.
 */

/**
 * Toggle arcade physics debug rendering.
 * @param {Phaser.Scene} scene
 * @param {boolean} [enabled]
 */
export function togglePhysicsDebug(scene, enabled) {
  const debug = scene.physics.world.drawDebug;
  scene.physics.world.drawDebug = enabled ?? !debug;
  if (!scene.physics.world.drawDebug) {
    scene.physics.world.debugGraphic.clear();
  }
}

/**
 * Show an FPS counter in the top-right corner.
 * @param {Phaser.Scene} scene
 * @returns {Phaser.GameObjects.Text}
 */
export function createFpsCounter(scene) {
  const text = scene.add.text(scene.cameras.main.width - 10, 10, '', {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#0f0',
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(9999);

  scene.events.on('update', () => {
    text.setText(`FPS: ${Math.round(scene.game.loop.actualFps)}`);
  });

  return text;
}
