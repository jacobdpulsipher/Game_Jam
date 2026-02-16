/**
 * ConnectionSystem — the heart of "Everything is connected".
 *
 * Maintains a map of trigger → target element IDs and propagates
 * activation / deactivation signals through the puzzle network.
 */
export class ConnectionSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./PuzzleManager.js').PuzzleManager} puzzleManager
   */
  constructor(scene, puzzleManager) {
    this.scene = scene;
    this.puzzleManager = puzzleManager;

    /** @type {Map<string, string[]>} triggerId → [targetId, …] */
    this.connections = new Map();

    // Listen for trigger events
    scene.events.on('trigger-activated', this._onTriggerActivated, this);
    scene.events.on('trigger-deactivated', this._onTriggerDeactivated, this);
  }

  /**
   * Register a connection from a trigger to one or more target elements.
   * @param {string} triggerId
   * @param {string[]} targetIds
   */
  connect(triggerId, targetIds) {
    const existing = this.connections.get(triggerId) || [];
    this.connections.set(triggerId, [...existing, ...targetIds]);
  }

  /**
   * Bulk-register connections from all triggers that have connectedTo data.
   * Called by PuzzleManager after instantiating all elements.
   */
  registerFromTriggers(triggers) {
    for (const trigger of triggers) {
      if (trigger.connectedIds && trigger.connectedIds.length > 0) {
        this.connect(trigger.elementId, trigger.connectedIds);
      }
    }
  }

  /** @private */
  _onTriggerActivated(trigger) {
    const targetIds = this.connections.get(trigger.elementId);
    if (!targetIds) return;
    for (const id of targetIds) {
      const element = this.puzzleManager.getElementById(id);
      if (element) element.activate();
    }
  }

  /** @private */
  _onTriggerDeactivated(trigger) {
    const targetIds = this.connections.get(trigger.elementId);
    if (!targetIds) return;
    for (const id of targetIds) {
      const element = this.puzzleManager.getElementById(id);
      if (element) element.deactivate();
    }
  }

  /** Per-frame update (reserved for future chain-reaction logic). */
  update(time, delta) {
    // Future: tick-based propagation, animation sequencing, etc.
  }

  /** Clean up listeners. */
  destroy() {
    this.scene.events.off('trigger-activated', this._onTriggerActivated, this);
    this.scene.events.off('trigger-deactivated', this._onTriggerDeactivated, this);
  }
}
