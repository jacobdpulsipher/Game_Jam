import { SlideDoor } from '../puzzles/SlideDoor.js';
import { Elevator } from '../puzzles/Elevator.js';
import { Drawbridge } from '../puzzles/Drawbridge.js';
import { PushBlock } from '../puzzles/PushBlock.js';
import { Trigger } from '../puzzles/Trigger.js';

/**
 * PuzzleManager — factory and registry for puzzle elements.
 *
 * Reads the "Objects" layer from a Tiled JSON tilemap and instantiates
 * the appropriate class for each object, then registers it by ID so
 * the ConnectionSystem can look it up.
 */

/** Map of Tiled object type strings to constructors. */
const TYPE_MAP = {
  SlideDoor,
  Elevator,
  Drawbridge,
  PushBlock,
  Trigger,
};

export class PuzzleManager {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    /** @type {Map<string, import('../puzzles/PuzzleElement.js').PuzzleElement>} */
    this.elements = new Map();

    /** References to all triggers, for ConnectionSystem to consume. */
    this.triggers = [];
  }

  /**
   * Parse the object layer from a Tiled map and instantiate elements.
   * @param {Phaser.Tilemaps.ObjectLayer} objectLayer
   */
  createFromObjectLayer(objectLayer) {
    for (const obj of objectLayer.objects) {
      this.createFromObject(obj);
    }
  }

  /**
   * Create a single puzzle element from a Tiled map object.
   * @param {object} obj — a Tiled object with { name, type, x, y, properties }
   */
  createFromObject(obj) {
    const Ctor = TYPE_MAP[obj.type];
    if (!Ctor) {
      console.warn(`PuzzleManager: unknown object type "${obj.type}"`);
      return null;
    }

    // Convert Tiled properties array to a flat object
    const props = {};
    if (obj.properties) {
      for (const p of obj.properties) {
        props[p.name] = p.value;
      }
    }
    props.id = obj.name || `${obj.type}_${obj.id}`;

    const element = new Ctor(this.scene, obj.x, obj.y, obj.type.toLowerCase(), props);
    this.elements.set(props.id, element);

    if (element instanceof Trigger) {
      this.triggers.push(element);
    }

    return element;
  }

  /**
   * Look up a puzzle element by its unique ID.
   * @param {string} id
   */
  getElementById(id) {
    return this.elements.get(id) || null;
  }

  /** Returns all elements as an array. */
  getAll() {
    return [...this.elements.values()];
  }
}
