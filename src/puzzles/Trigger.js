import { PuzzleElement } from './PuzzleElement.js';

/**
 * Trigger — a pressure plate, switch, or lever that sends a signal
 * to connected puzzle elements via the ConnectionSystem.
 *
 * Trigger types (set via Tiled custom property `triggerType`):
 *   'pressurePlate' — activates while something is standing on it
 *   'switch'        — toggles on player interaction
 *   'lever'         — same as switch (visual variant)
 *
 * Tiled custom properties:
 *   triggerType:  'pressurePlate' | 'switch' | 'lever'
 *   connectedTo:  comma-separated element IDs, e.g. "door_1,elevator_2"
 */
export class Trigger extends PuzzleElement {
  constructor(scene, x, y, texture, props = {}) {
    super(scene, x, y, texture, props);

    this.triggerType = props.triggerType || 'pressurePlate';

    /** @type {string[]} IDs of elements this trigger controls. */
    this.connectedIds = props.connectedTo
      ? props.connectedTo.split(',').map((s) => s.trim())
      : [];
  }

  /**
   * Called by the ConnectionSystem when something lands on /
   * interacts with this trigger.
   */
  activate() {
    if (this._isActive) return; // avoid re-triggering
    super.activate();
    // The ConnectionSystem listens for this event and propagates it
    this.scene.events.emit('trigger-activated', this);
  }

  deactivate() {
    if (!this._isActive) return;
    super.deactivate();
    this.scene.events.emit('trigger-deactivated', this);
  }
}
